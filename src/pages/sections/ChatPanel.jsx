// ─────────────────────────────────────────────────────────────────
// ChatPanel — completely standalone top-level component
//
// WHY THIS NEVER CRASHES ON KEYSTROKES:
// - Defined at module level, NOT inside another component
// - Textarea is UNCONTROLLED (ref-based), no state on every keystroke
// - State changes (messages, typing) only affect THIS component
// - Parent re-renders don't touch this component at all
//
// AI CALLS:
// - Never calls any AI API directly
// - Always goes through callAI() in services/ai.js
// - Smart failover: Groq → OpenRouter → DeepSeek → Mistral → Qwen → fallbacks
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { ENGINES, buildSystemPrompt } from "../../config/modules";
import { Icon, Spinner } from "../../components/Icons";
import { callAI, getProviderStatus } from "../../services/ai";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Provider Status Dot ──────────────────────────────────────────
// Small indicator showing which provider is active and its health.
function ProviderDot({ status }) {
  if (!status) return null;

  const active = status.find(p => p.available) || null;
  const allDown = status.every(p => !p.available);

  const dotColor = allDown
    ? "#ef4444"
    : active?.quotaPercent > 80
    ? "#f59e0b"
    : "#22c55e";

  const label = allDown
    ? "All providers unavailable"
    : `Active: ${active?.name} (${active?.model?.split("/").pop() || active?.model})`;

  return (
    <div
      title={label}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            "6px",
        fontSize:       "11px",
        color:          "rgba(255,255,255,0.35)",
        userSelect:     "none",
        cursor:         "default",
      }}
    >
      <span
        style={{
          width:           "7px",
          height:          "7px",
          borderRadius:    "50%",
          backgroundColor: dotColor,
          display:         "inline-block",
          flexShrink:      0,
          boxShadow:       `0 0 4px ${dotColor}`,
        }}
      />
      {allDown ? "AI offline" : active?.name}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export function ChatPanel({ firstName }) {
  const [messages, setMessages] = useState(() => [
    {
      role:     "ai",
      text:     `Welcome back, ${firstName || "Boss"}. I'm your Mindoo co-pilot.\n\nTell me what's on your mind, or pick an engine below to activate a specific thinking mode. No formatting required — just talk.`,
      time:     nowTime(),
      provider: null,
    },
  ]);

  const [activeEngine,    setActiveEngine]    = useState(null);
  const [isTyping,        setIsTyping]        = useState(false);
  const [providerStatus,  setProviderStatus]  = useState([]);
  const [ratedMessages,   setRatedMessages]   = useState({});

  // UNCONTROLLED textarea — ref only, no state on keystroke
  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // Load provider status on mount and after each message
  useEffect(() => {
    setProviderStatus(getProviderStatus());
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function sendMessage() {
    const text = inputRef.current?.value?.trim();
    if (!text || isTyping) return;

    // Clear input immediately — no state update, no re-render
    inputRef.current.value = "";

    const userMsg = { role: "user", text, time: nowTime(), provider: null };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const history = messages.map(m => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      history.push({ role: "user", content: text });

      // Build system prompt from active engine
      const systemPrompt = buildSystemPrompt(activeEngine, firstName);

      // Call AI through the smart provider registry
      const result = await callAI({
        messages:     history,
        systemPrompt,
        maxTokens:    1000,
      });

      setMessages(prev => [
        ...prev,
        {
          role:         "ai",
          text:         result.text,
          time:         nowTime(),
          provider:     result.providerName,
          providerFailed: result.failed || false,
          id:           `msg-${Date.now()}`,
        },
      ]);

      // Refresh provider status after response
      setProviderStatus(getProviderStatus());

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role:     "ai",
          text:     "Something went wrong on my end. Your message is safe — please try again.",
          time:     nowTime(),
          provider: null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function rateMessage(msgId, rating) {
    setRatedMessages(prev => ({ ...prev, [msgId]: rating }));
    // TODO Phase 4: wire to saveFeedback() in services/db.js
    console.info(`[Feedback] ${msgId}: ${rating}`);
  }

  return (
    <div className="chat-panel">

      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}
          >
            {msg.role === "ai" && (
              <div className="bubble-header">
                <div className="bubble-avatar">M</div>
                <span className="bubble-name">Mindoo</span>
                <span className="bubble-time">{msg.time}</span>
              </div>
            )}

            <div className="bubble-text">{msg.text}</div>

            {/* Provider tag + feedback buttons — AI messages only */}
            {msg.role === "ai" && msg.id && (
              <div
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  marginTop:      "8px",
                  gap:            "8px",
                }}
              >
                {/* Which provider answered */}
                {msg.provider && (
                  <span
                    style={{
                      fontSize:        "10px",
                      color:           "rgba(255,255,255,0.2)",
                      letterSpacing:   "0.02em",
                    }}
                  >
                    via {msg.provider}
                  </span>
                )}

                {/* Thumbs up / down */}
                <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                  {ratedMessages[msg.id] ? (
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      Thanks ✓
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => rateMessage(msg.id, "positive")}
                        title="Good response"
                        style={{
                          background:   "none",
                          border:       "none",
                          cursor:       "pointer",
                          fontSize:     "14px",
                          padding:      "0",
                          lineHeight:   1,
                          opacity:      0.5,
                          transition:   "opacity 0.15s",
                        }}
                        onMouseEnter={e => (e.target.style.opacity = 1)}
                        onMouseLeave={e => (e.target.style.opacity = 0.5)}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => rateMessage(msg.id, "negative")}
                        title="Bad response"
                        style={{
                          background:   "none",
                          border:       "none",
                          cursor:       "pointer",
                          fontSize:     "14px",
                          padding:      "0",
                          lineHeight:   1,
                          opacity:      0.5,
                          transition:   "opacity 0.15s",
                        }}
                        onMouseEnter={e => (e.target.style.opacity = 1)}
                        onMouseLeave={e => (e.target.style.opacity = 0.5)}
                      >
                        👎
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {msg.role === "user" && (
              <div className="bubble-user-time">{msg.time}</div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-bubble bubble-ai">
            <div className="bubble-header">
              <div className="bubble-avatar">M</div>
              <span className="bubble-name">Mindoo</span>
            </div>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">

        {/* Engine selector */}
        <div className="engine-section">
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              marginBottom:   "8px",
            }}
          >
            <p className="engine-label" style={{ margin: 0 }}>
              Engines — select to activate a thinking mode
            </p>
            <ProviderDot status={providerStatus} />
          </div>

          <div className="engine-row">
            {ENGINES.map(e => (
              <button
                key={e.id}
                className={`engine-pill${activeEngine === e.id ? " active" : ""}`}
                style={{ "--engine-color": e.color }}
                title={e.tip}
                onClick={() => setActiveEngine(activeEngine === e.id ? null : e.id)}
              >
                {e.id}: {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea + send button */}
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            rows={1}
            placeholder="What's on your mind? Just talk…  (Enter to send, Shift+Enter for new line)"
            onKeyDown={handleKeyDown}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={isTyping}
            aria-label="Send message"
          >
            {isTyping
              ? <Spinner size={15} />
              : <Icon name="send" size={15} color="#fff" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
