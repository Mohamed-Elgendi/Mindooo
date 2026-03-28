// ─────────────────────────────────────────────────────────────────
// ChatPanel — completely standalone top-level component
//
// WHY THIS NEVER CRASHES ON KEYSTROKES:
// - Defined at module level, NOT inside another component
// - Textarea is UNCONTROLLED (ref-based), no state on every keystroke
// - State changes (messages, typing) only affect THIS component
// - Parent re-renders don't touch this component at all
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { ENGINES, buildSystemPrompt } from "../../config/modules";
import { Icon, Spinner } from "../../components/Icons";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({ firstName }) {
  const [messages, setMessages] = useState(() => [{
    role: "ai",
    text: `Welcome back, ${firstName || "Boss"}. I'm your Mindoo co-pilot.\n\nTell me what's on your mind, or pick an engine below to activate a specific thinking mode. No formatting required — just talk.`,
    time: nowTime(),
  }]);
  const [activeEngine, setActiveEngine] = useState(null);
  const [isTyping,     setIsTyping]     = useState(false);

  // UNCONTROLLED — ref only, no onChange, no state update on keystroke
  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function sendMessage() {
    const text = inputRef.current?.value?.trim();
    if (!text || isTyping) return;

    // Clear input immediately — no state, no re-render
    inputRef.current.value = "";

    const userMsg = { role: "user", text, time: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const history = messages.map(m => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      history.push({ role: "user", content: text });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":                              "application/json",
          "anthropic-version":                         "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     buildSystemPrompt(activeEngine, firstName),
          messages:   history,
        }),
      });

      const data  = await response.json();
      const reply = data?.content?.map(c => c.text || "").join("") || "I'm here. Keep going.";
      setMessages(prev => [...prev, { role: "ai", text: reply, time: nowTime() }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Connection issue — your thought is safe. Check that VITE_ANTHROPIC_API_KEY is set in .env.local, then try again.",
        time: nowTime(),
      }]);
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

  return (
    <div className="chat-panel">

      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}>
            {msg.role === "ai" && (
              <div className="bubble-header">
                <div className="bubble-avatar">M</div>
                <span className="bubble-name">Mindoo</span>
                <span className="bubble-time">{msg.time}</span>
              </div>
            )}
            <div className="bubble-text">{msg.text}</div>
            {msg.role === "user" && (
              <div className="bubble-user-time">{msg.time}</div>
            )}
          </div>
        ))}

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
          <p className="engine-label">Engines — select to activate a thinking mode</p>
          <div className="engine-row">
            {ENGINES.map(e => (
              <button
                key={e.id}
                className={`engine-pill${activeEngine === e.id ? " active" : ""}`}
                style={{
                  "--engine-color": e.color,
                }}
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
            {isTyping ? <Spinner size={15} /> : <Icon name="send" size={15} color="#fff" />}
          </button>
        </div>

      </div>
    </div>
  );
}
