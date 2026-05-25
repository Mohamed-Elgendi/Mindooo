// src/modules/memoryos/components/screens/AiCoachScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { TopBar, BackButton, COLORS, Spinner } from '../shared/UI.jsx';

const STARTER_PROMPTS = [
  "I keep forgetting cards even after multiple reviews. What's wrong?",
  "How do I build a memory palace from scratch?",
  "I'm struggling with the Write Blind phase. What should I do?",
  "Which guru should I start with as a complete beginner?",
  "How do I memorize numbers and dates effectively?",
  "My mastery rate is below 50%. How do I fix this?",
];

export function AiCoachScreen({ m }) {
  const [input,     setInput]     = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState('');
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [m.coachHistory, streamBuf]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || streaming) return;
    setInput('');
    setStreamBuf('');
    setStreaming(true);

    try {
      let accumulated = '';
      for await (const chunk of m.streamToCoach(msg)) {
        accumulated += chunk;
        setStreamBuf(accumulated);
      }
      setStreamBuf('');
    } catch {
      setStreamBuf('');
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function useStarter(prompt) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const hasHistory = m.coachHistory.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#07080f' }}>

      {/* Top bar */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <TopBar
          left={<BackButton onClick={() => m.navigate('ai-mind-lab')} />}
          center={
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.violet }}>🤖 AI Memory Coach</div>
              <div style={{ fontSize: 10, color: '#444' }}>Powered by MemoryOS · Streaming</div>
            </div>
          }
          right={
            hasHistory ? (
              <button onClick={m.clearCoachHistory}
                style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: '#555', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>
                Clear
              </button>
            ) : null
          }
        />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Empty state with starter prompts */}
        {!hasHistory && !streaming && (
          <div>
            <div style={{ textAlign: 'center', padding: '24px 0 28px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.violet, marginBottom: 8 }}>Your Memory Coach</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                Expert coaching in all major memory systems — Buzan, O'Brien, Lorayne, Trudeau, Foer.
                Ask anything about your training, techniques, or challenges.
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#333', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>Try asking:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STARTER_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => useStarter(p)} style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 12,
                  border: `1px solid ${COLORS.border2}`, background: COLORS.surface,
                  color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}>
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {m.coachHistory.map((msg, i) => (
          <div key={i} style={{
            display:        'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom:   16,
            gap:            10,
            alignItems:     'flex-end',
          }}>
            {/* Coach avatar */}
            {msg.role === 'coach' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: COLORS.violet + '22', border: `1px solid ${COLORS.violet}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, marginBottom: 2,
              }}>🤖</div>
            )}

            {/* Message bubble */}
            <div style={{
              maxWidth:     '80%',
              padding:      '13px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background:   msg.role === 'user' ? COLORS.violet + '22' : COLORS.surface,
              border:       `1px solid ${msg.role === 'user' ? COLORS.violet + '44' : COLORS.border}`,
              fontSize:     14,
              lineHeight:   1.75,
              color:        msg.role === 'user' ? COLORS.violet : '#d0d4e8',
              whiteSpace:   'pre-wrap',
              wordBreak:    'break-word',
            }}>
              {msg.content}
              <div style={{ fontSize: 10, color: '#333', marginTop: 6, textAlign: 'right' }}>
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* User avatar */}
            {msg.role === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: COLORS.violet + '22', border: `1px solid ${COLORS.violet}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, marginBottom: 2,
              }}>🧠</div>
            )}
          </div>
        ))}

        {/* Streaming bubble */}
        {streaming && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: COLORS.violet + '22', border: `1px solid ${COLORS.violet}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🤖</div>
            <div style={{
              maxWidth:   '80%',
              padding:    '13px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: COLORS.surface,
              border:     `1px solid ${COLORS.violet}44`,
              fontSize:   14,
              lineHeight: 1.75,
              color:      '#d0d4e8',
              whiteSpace: 'pre-wrap',
              wordBreak:  'break-word',
            }}>
              {streamBuf || (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                  <Spinner color={COLORS.violet} size={16} />
                  <span style={{ fontSize: 12, color: '#555' }}>Thinking...</span>
                </div>
              )}
              {streamBuf && <span style={{ display: 'inline-block', width: 2, height: 14, background: COLORS.violet, marginLeft: 2, animation: 'blink 1s infinite' }} />}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px 28px', flexShrink: 0, borderTop: `1px solid ${COLORS.border}`, background: '#07080f' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your memory coach anything..."
            rows={2}
            disabled={streaming}
            style={{
              flex:         1,
              padding:      '13px 16px',
              borderRadius: 14,
              border:       `1.5px solid ${COLORS.border2}`,
              background:   COLORS.surface,
              color:        COLORS.text,
              fontSize:     14,
              fontFamily:   'inherit',
              lineHeight:   1.6,
              resize:       'none',
              outline:      'none',
              transition:   'border-color .2s',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            style={{
              width:        48,
              height:       48,
              borderRadius: '50%',
              border:       'none',
              background:   input.trim() && !streaming ? COLORS.violet : COLORS.surface2,
              color:        input.trim() && !streaming ? '#fff' : '#444',
              fontSize:     18,
              cursor:       input.trim() && !streaming ? 'pointer' : 'not-allowed',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
              transition:   'background .2s',
            }}
          >
            {streaming ? '⏳' : '→'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#2a2d3e', marginTop: 6, textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>

    </div>
  );
}
