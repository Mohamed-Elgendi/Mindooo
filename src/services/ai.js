// src/services/ai.js — Universal AI Engine
// THE ONLY FILE THAT CALLS AI APIS.
// Supports: OpenAI-compatible, Anthropic, Google Gemini formats.
// Providers stored in Supabase. API keys stored in Supabase.
// Smart failover + per-minute/daily quota management via localStorage.

import { supabase } from '../supabase';

// ── Provider cache ────────────────────────────────────────────────
let _cache = [], _cacheUser = null, _cacheAt = 0;
const CACHE_TTL = 60_000;

export async function loadProviders(userId) {
  const now = Date.now();
  if (_cacheUser===userId && _cache.length>0 && now-_cacheAt<CACHE_TTL) return _cache;
  const { data, error } = await supabase
    .from("ai_providers").select("*")
    .eq("user_id",userId).eq("is_enabled",true).eq("is_paused",false)
    .order("priority",{ascending:true});
  if (error) { console.warn("[AI] Cannot load providers:",error.message); return _cache; }
  _cache=data||[]; _cacheUser=userId; _cacheAt=now;
  return _cache;
}

export function invalidateProviderCache() { _cacheAt=0; }

// ── Quota state (localStorage) ────────────────────────────────────
const QK = "mindoo_quota_v2";
function getQ()   { try{return JSON.parse(localStorage.getItem(QK)||"{}")}catch{return{}} }
function saveQ(s) { try{localStorage.setItem(QK,JSON.stringify(s))}catch{} }

function pq(pid) {
  const s=getQ(), now=Date.now(), today=new Date().toDateString(), ex=s[pid]||{};
  const minR=(now-(ex.lastRequestAt||0))>60_000, dayR=ex.lastDay!==today;
  return {
    requestsThisMinute: minR?0:(ex.requestsThisMinute||0),
    requestsToday:      dayR?0:(ex.requestsToday||0),
    lastRequestAt:      ex.lastRequestAt||0,
    lastDay:            dayR?today:(ex.lastDay||today),
    coolingDownUntil:   ex.coolingDownUntil||null,
    consecutiveErrors:  ex.consecutiveErrors||0,
    totalRequests:      ex.totalRequests||0,
    totalFailures:      ex.totalFailures||0,
    lastFailureReason:  ex.lastFailureReason||null,
    disabledForSession: ex.disabledForSession||false,
  };
}

function patch(pid, u) {
  const s=getQ(); s[pid]={...pq(pid),...u}; saveQ(s);
}

// ── Availability ──────────────────────────────────────────────────
function isAvail(p) {
  if (!p.api_key?.trim()) return {ok:false,reason:"no API key — add in AI Providers settings"};
  const q=pq(p.provider_id), now=Date.now();
  if (q.disabledForSession)             return {ok:false,reason:"auth failed this session"};
  if (q.coolingDownUntil&&now<q.coolingDownUntil) return {ok:false,reason:`cooling down — ${Math.ceil((q.coolingDownUntil-now)/1000)}s left`};
  if (q.requestsThisMinute>=p.max_requests_per_minute) return {ok:false,reason:"per-minute quota reached"};
  if (q.requestsToday>=p.max_requests_per_day)         return {ok:false,reason:"daily quota reached"};
  return {ok:true};
}

// ── Format adapters ───────────────────────────────────────────────
async function callOpenAI(p,msgs,sys,maxTok) {
  const h={"Content-Type":"application/json","Authorization":`Bearer ${p.api_key}`};
  if (p.base_url.includes("openrouter.ai")) { h["HTTP-Referer"]="https://axis-app-kappa.vercel.app"; h["X-Title"]="Mindoo"; }
  const res=await fetch(p.base_url,{method:"POST",headers:h,body:JSON.stringify({model:p.model,max_tokens:maxTok,temperature:0.7,messages:[{role:"system",content:sys},...msgs]})});
  return {res, extract:(d)=>d?.choices?.[0]?.message?.content||""};
}

async function callAnthropic(p,msgs,sys,maxTok) {
  const res=await fetch(p.base_url,{method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":p.api_key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:p.model,max_tokens:maxTok,system:sys,messages:msgs})});
  return {res, extract:(d)=>d?.content?.map(c=>c.text||"").join("")||""};
}

async function callGoogle(p,msgs,sys,maxTok) {
  const url=`${p.base_url}?key=${p.api_key}`;
  const contents=msgs.map(m=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]}));
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents,generationConfig:{maxOutputTokens:maxTok,temperature:0.7}})});
  return {res, extract:(d)=>d?.candidates?.[0]?.content?.parts?.[0]?.text||""};
}

// ── Single provider call ──────────────────────────────────────────
async function callOne(p,msgs,sys,maxTok) {
  const pid=p.provider_id, now=Date.now(), q=pq(pid);
  patch(pid,{requestsThisMinute:q.requestsThisMinute+1,requestsToday:q.requestsToday+1,lastRequestAt:now,totalRequests:q.totalRequests+1});

  let res,extract;
  try {
    const fmt=(p.api_format||"openai").toLowerCase();
    if      (fmt==="anthropic") ({res,extract}=await callAnthropic(p,msgs,sys,maxTok));
    else if (fmt==="google")    ({res,extract}=await callGoogle(p,msgs,sys,maxTok));
    else                        ({res,extract}=await callOpenAI(p,msgs,sys,maxTok));
  } catch(e) {
    const cur=pq(pid);
    patch(pid,{coolingDownUntil:now+(p.cooldown_on_error*1000),consecutiveErrors:cur.consecutiveErrors+1,totalFailures:cur.totalFailures+1,lastFailureReason:"network error"});
    throw new Error(`${p.name}: network error`);
  }

  if (!res.ok) {
    const cur=pq(pid);
    if (res.status===429) { patch(pid,{coolingDownUntil:now+(p.cooldown_on_rate_limit*1000),consecutiveErrors:cur.consecutiveErrors+1,totalFailures:cur.totalFailures+1,lastFailureReason:"429 rate limited"}); throw new Error(`${p.name}: rate limited`); }
    if (res.status===401||res.status===403) { patch(pid,{disabledForSession:true,totalFailures:cur.totalFailures+1,lastFailureReason:`${res.status} auth failed`}); throw new Error(`${p.name}: auth failed`); }
    if (res.status>=500) { patch(pid,{coolingDownUntil:now+(p.cooldown_on_error*1000),consecutiveErrors:cur.consecutiveErrors+1,totalFailures:cur.totalFailures+1,lastFailureReason:`${res.status} server error`}); throw new Error(`${p.name}: server error ${res.status}`); }
    throw new Error(`${p.name}: error ${res.status}`);
  }

  let data; try{data=await res.json()}catch{throw new Error(`${p.name}: invalid JSON`);}
  const text=extract(data);
  if (!text?.trim()) throw new Error(`${p.name}: empty response`);
  patch(pid,{consecutiveErrors:0,coolingDownUntil:null,lastFailureReason:null});
  return {text,model:p.model,provider:p.provider_id,providerName:p.name,failed:false};
}

// ── callAI — THE MAIN FUNCTION ────────────────────────────────────
export async function callAI({messages,systemPrompt,maxTokens=1000,userId,preferredProviderId}) {
  if (!userId) return fallback([{provider:"system",reason:"no userId"}]);

  let providers = await loadProviders(userId);
  if (!providers.length) return fallback([{provider:"system",reason:"no providers — add in AI Providers settings"}]);

  // Pin to a specific provider if the user selected one
  if (preferredProviderId) {
    const pinned = providers.find(p=>p.provider_id===preferredProviderId);
    if (pinned) providers = [pinned, ...providers.filter(p=>p.provider_id!==preferredProviderId)];
  }

  const skipped=[];
  for (const p of providers) {
    const {ok,reason}=isAvail(p);
    if (!ok) { skipped.push({provider:p.name,reason}); console.info(`[AI] Skip ${p.name}: ${reason}`); continue; }
    try {
      console.info(`[AI] Trying ${p.name} (${p.model})...`);
      const r=await callOne(p,messages,systemPrompt,maxTokens);
      console.info(`[AI] ✓ ${p.name}`);
      return r;
    } catch(e) { skipped.push({provider:p.name,reason:e.message}); console.warn(`[AI] ✗ ${p.name}: ${e.message}`); }
  }
  console.error("[AI] All failed:",skipped);
  return fallback(skipped);
}

function fallback(skipped) {
  return {text:"I'm having trouble connecting right now. All AI providers are temporarily unavailable or unconfigured. Please check your AI Provider settings and try again in a minute.",model:"none",provider:"fallback",providerName:"Fallback",failed:true,skipped};
}

// ── getProviderStatus ─────────────────────────────────────────────
export async function getProviderStatus(userId) {
  const {data:all}=await supabase.from("ai_providers").select("*").eq("user_id",userId).order("priority",{ascending:true});
  if (!all) return [];
  const now=Date.now();
  return all.map(p=>{
    const q=pq(p.provider_id), {ok,reason}=isAvail(p);
    return {
      id:p.id, providerId:p.provider_id, name:p.name, company:p.company,
      model:p.model, apiFormat:p.api_format, priority:p.priority,
      isEnabled:p.is_enabled, isPaused:p.is_paused, hasKey:!!p.api_key?.trim(),
      available:ok&&p.is_enabled&&!p.is_paused,
      unavailableReason:p.is_paused?"paused":!p.is_enabled?"disabled":ok?null:reason,
      requestsToday:q.requestsToday, maxPerDay:p.max_requests_per_day,
      quotaPercent:Math.min(100,Math.round((q.requestsToday/p.max_requests_per_day)*100)),
      coolingDown:!!(q.coolingDownUntil&&now<q.coolingDownUntil),
      cooldownSecsLeft:q.coolingDownUntil&&now<q.coolingDownUntil?Math.ceil((q.coolingDownUntil-now)/1000):0,
      consecutiveErrors:q.consecutiveErrors, totalRequests:q.totalRequests, totalFailures:q.totalFailures,
      successRate:q.totalRequests>0?Math.round(((q.totalRequests-q.totalFailures)/q.totalRequests)*100):100,
      notes:p.notes,
    };
  });
}

// ── Provider management helpers ───────────────────────────────────
export async function saveProviderKey(providerId,apiKey,userId) {
  const{error}=await supabase.from("ai_providers").update({api_key:apiKey,updated_at:new Date().toISOString()}).eq("provider_id",providerId).eq("user_id",userId);
  invalidateProviderCache(); return{error};
}
export async function toggleProvider(id,field,value,userId) {
  const{error}=await supabase.from("ai_providers").update({[field]:value,updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",userId);
  invalidateProviderCache(); return{error};
}
export async function updateProviderPriority(id,priority,userId) {
  const{error}=await supabase.from("ai_providers").update({priority,updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",userId);
  invalidateProviderCache(); return{error};
}
export async function addCustomProvider(data,userId) {
  const{error}=await supabase.from("ai_providers").insert({...data,user_id:userId});
  invalidateProviderCache(); return{error};
}
export async function deleteProvider(id,userId) {
  const{error}=await supabase.from("ai_providers").delete().eq("id",id).eq("user_id",userId);
  invalidateProviderCache(); return{error};
}
export function resetProviderQuota(pid) {
  patch(pid,{coolingDownUntil:null,consecutiveErrors:0,disabledForSession:false,lastFailureReason:null});
}
export function resetAllQuotas() { try{localStorage.removeItem(QK)}catch{} }

// ── analyzeChronicle ─────────────────────────────────────────────
export async function analyzeChronicle(text,userId) {
  if (!text?.trim()||text.trim().length<20) return{chaosScore:0,emotionalTone:"neutral",themes:[],summary:""};
  const sys=`You are a silent analyst. Return ONLY valid JSON, no markdown.\nFormat: {"chaosScore":<0-100>,"emotionalTone":"<calm|anxious|motivated|frustrated|sad|excited|confused|neutral>","themes":["t1","t2","t3"],"summary":"<one sentence max 20 words>"}`;
  try {
    const r=await callAI({messages:[{role:"user",content:`Brain dump:\n\n${text.substring(0,3000)}`}],systemPrompt:sys,maxTokens:300,userId});
    if (r.failed) return{chaosScore:0,emotionalTone:"neutral",themes:[],summary:""};
    const parsed=JSON.parse(r.text.replace(/```json|```/gi,"").trim());
    return{chaosScore:Math.min(100,Math.max(0,parseInt(parsed.chaosScore)||0)),emotionalTone:parsed.emotionalTone||"neutral",themes:Array.isArray(parsed.themes)?parsed.themes.slice(0,5):[],summary:parsed.summary||""};
  } catch(e) { console.warn("[AI] analyzeChronicle failed:",e.message); return{chaosScore:0,emotionalTone:"neutral",themes:[],summary:""}; }
}

// ── Embeddings (Nomic — RAG) ──────────────────────────────────────
export async function embedText(text) {
  const key=import.meta.env.VITE_NOMIC_API_KEY;
  if (!key||!text?.trim()) return null;
  try {
    const res=await fetch("https://api-atlas.nomic.ai/v1/embedding/text",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({texts:[text.substring(0,2000)],model:"nomic-embed-text-v1.5",task_type:"search_document"})});
    return (await res.json()).embeddings?.[0]||null;
  } catch{return null;}
}
export async function embedQuery(query) {
  const key=import.meta.env.VITE_NOMIC_API_KEY;
  if (!key||!query?.trim()) return null;
  try {
    const res=await fetch("https://api-atlas.nomic.ai/v1/embedding/text",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({texts:[query],model:"nomic-embed-text-v1.5",task_type:"search_query"})});
    return (await res.json()).embeddings?.[0]||null;
  } catch{return null;}
}

// ── formatDuration ────────────────────────────────────────────────
export function formatDuration(s) {
  if (s<60)   return `${s}s`;
  if (s<3600) return `${Math.round(s/60)}m`;
  const h=Math.floor(s/3600), m=Math.round((s%3600)/60);
  return m>0?`${h}h ${m}m`:`${h}h`;
}
