// ─────────────────────────────────────────────────────────────────
// BrainDump — capture section
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Icon } from "../../components/Icons";

const SAMPLE_CHRONICLES = [
  { id: "#052", time: "Today, 2:15 PM",      type: "Voice", chaos: 72, tone: "anxious"      },
  { id: "#051", time: "Yesterday, 11:47 PM", type: "Paper", chaos: 85, tone: "overwhelmed"  },
  { id: "#050", time: "Mar 24, 3:30 PM",     type: "Text",  chaos: 45, tone: "focused"      },
];

export function BrainDump() {
  const [text,  setText]  = useState("");
  const [saved, setSaved] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  function handleSave() {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); setText(""); }, 2200);
  }

  return (
    <div className="section-scroll">
      <div className="section-content">

        <div className="section-eyebrow">Module · Capture</div>
        <h1 className="section-heading gradient-text">Brain Dump Sanctuary</h1>
        <p className="section-subheading">
          Zero friction. Zero judgment. Zero organization needed. Just empty your mind.
        </p>

        <textarea
          className="dump-textarea"
          rows={9}
          placeholder={"Start typing anything that's in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, taxes — TAXES, why am I tired, the idea about the app…\n\nNo rules. No formatting. Just get it out."}
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="dump-actions">
          <button
            className={`btn ${saved ? "btn-success" : "btn-primary"}`}
            onClick={handleSave}
            disabled={!text.trim()}
          >
            {saved
              ? <><Icon name="check" size={13} color="#4ade80" /> Saved to chronicles</>
              : <><Icon name="archive" size={13} color="#fff" /> Save Chronicle</>}
          </button>
          <button className="btn btn-ghost" onClick={() => setText("")} disabled={!text.trim()}>
            Clear
          </button>
          <span className="word-count">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        </div>

        <div className="divider" />

        <div className="section-header">
          <h2 className="section-title">Recent Chronicles</h2>
          <button className="text-btn">View all →</button>
        </div>

        {SAMPLE_CHRONICLES.map(c => (
          <div key={c.id} className="chronicle-item">
            <div className="chronicle-icon">🧠</div>
            <div className="chronicle-body">
              <div className="chronicle-row">
                <span className="chronicle-id">Chronicle {c.id}</span>
                <span className="chronicle-time">{c.time}</span>
              </div>
              <div className="chronicle-meta">
                {c.type} · Chaos {c.chaos}/100 · {c.tone}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
