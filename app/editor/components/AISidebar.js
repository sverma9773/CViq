"use client";

import { useState, useEffect, useRef } from "react";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import ProUpgradeModal from "../../components/ProUpgradeModal";

const SUGGESTED_PROMPTS = [
  { icon: "📝", text: "Improve my summary" },
  { icon: "💼", text: "Suggest skills" },
  { icon: "🎯", text: "Stronger experience bullets" },
  { icon: "🔍", text: "Review for improvements" },
];

// Sparkle Bot Face SVG
export function SparkleBotIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Sleek round robot head outer */}
      <rect x="4" y="6" width="16" height="13" rx="5" />
      
      {/* Glowing ears / high-tech nodes */}
      <rect x="2" y="10" width="2" height="5" rx="1" fill={color} stroke="none" />
      <rect x="20" y="10" width="2" height="5" rx="1" fill={color} stroke="none" />
      
      {/* Smart central antenna with a sparkle shape at the top */}
      <line x1="12" y1="6" x2="12" y2="3" />
      <path d="M12 2l1 1-1 1-1-1z" fill={color} stroke="none" />
      
      {/* Glowing high-contrast eyes with small sparkles */}
      <circle cx="9" cy="12" r="1.5" fill={color} />
      <circle cx="15" cy="12" r="1.5" fill={color} />
      
      {/* Small sparkle dots representing high intelligence */}
      <path d="M6 3.5l.5.5-.5.5-.5-.5z" fill={color} stroke="none" />
      <path d="M18 3.5l.5.5-.5.5-.5-.5z" fill={color} stroke="none" />
      
      {/* Friendly organic curve smile */}
      <path d="M9.5 15.5c.8.8 2.2.8 3 0" />
    </svg>
  );
}

export default function AISidebar({ onClose }) {
  const { resumeData } = useResume();
  const { isPro } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProModal, setShowProModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideMessage) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }

    const text = (overrideMessage || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = { role: "user", text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setError("");

    try {
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          resumeData: {
            profile: resumeData.profile,
            education: resumeData.education,
            experience: resumeData.experience,
            skills: resumeData.skills,
            certificates: resumeData.certificates,
          },
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      const aiMsg = { role: "model", text: data.response, id: Date.now() + 1 };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatResponse = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={i} className="ai-chat-h4">
            {formatInline(line.slice(4))}
          </h4>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h3 key={i} className="ai-chat-h3">
            {formatInline(line.slice(3))}
          </h3>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h2 key={i} className="ai-chat-h2">
            {formatInline(line.slice(2))}
          </h2>
        );
      } else if (line.match(/^[\-\*]\s/)) {
        elements.push(
          <div key={i} className="ai-chat-bullet">
            <span className="ai-chat-bullet__dot">•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        elements.push(
          <div key={i} className="ai-chat-bullet">
            <span className="ai-chat-bullet__num">{numMatch[1]}.</span>
            <span>{formatInline(numMatch[2])}</span>
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="ai-chat-spacer" />);
      } else {
        elements.push(
          <p key={i} className="ai-chat-p">
            {formatInline(line)}
          </p>
        );
      }
      i++;
    }
    return elements;
  };

  const formatInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`(.+?)`/);
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

      let firstMatch = null;
      let firstType = null;
      let firstIndex = Infinity;

      if (boldMatch && remaining.indexOf(boldMatch[0]) < firstIndex) {
        firstIndex = remaining.indexOf(boldMatch[0]);
        firstMatch = boldMatch;
        firstType = "bold";
      }
      if (codeMatch && remaining.indexOf(codeMatch[0]) < firstIndex) {
        firstIndex = remaining.indexOf(codeMatch[0]);
        firstMatch = codeMatch;
        firstType = "code";
      }
      if (italicMatch && remaining.indexOf(italicMatch[0]) < firstIndex) {
        firstIndex = remaining.indexOf(italicMatch[0]);
        firstMatch = italicMatch;
        firstType = "italic";
      }

      if (!firstMatch) {
        parts.push(remaining);
        break;
      }

      if (firstIndex > 0) {
        parts.push(remaining.slice(0, firstIndex));
      }

      if (firstType === "bold") {
        parts.push(
          <strong key={key++} className="ai-chat-bold">
            {firstMatch[1]}
          </strong>
        );
      } else if (firstType === "code") {
        parts.push(
          <code key={key++} className="ai-chat-code">
            {firstMatch[1]}
          </code>
        );
      } else if (firstType === "italic") {
        parts.push(
          <em key={key++} className="ai-chat-italic">
            {firstMatch[1]}
          </em>
        );
      }

      remaining = remaining.slice(firstIndex + firstMatch[0].length);
    }

    return parts;
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="ai-sidebar">
      {/* Header */}
      <div className="ai-sidebar__header">
        <div className="ai-sidebar__header-left">
          <div className="ai-sidebar__icon-wrap">
            <SparkleBotIcon size={20} color="#ffffff" />
          </div>
          <div>
            <h3 className="ai-sidebar__title">AI Career Coach</h3>
            <p className="ai-sidebar__subtitle">Powered by Gemini AI</p>
          </div>
        </div>
        <button className="ai-sidebar__close" onClick={onClose} title="Close AI Assistant">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 4.5l9 9M13.5 4.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Main Core */}
      {!isPro ? (
        <div className="ai-sidebar__locked">
          <div className="ai-sidebar__locked-content">
            <div className="ai-sidebar__locked-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="ai-sidebar__locked-title">Unlock AI Coach</h3>
            <p className="ai-sidebar__locked-desc">
              Get unlimited resume scans, instant rewriting, and bullet polishing powered by high-end AI algorithms.
            </p>
            <button 
              className="btn btn-accent ai-sidebar__upgrade-btn"
              onClick={() => setShowProModal(true)}
            >
              Upgrade to Pro
            </button>
          </div>
          {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
      ) : (
        <>
          {/* Chat Body */}
          <div className="ai-chat__body">
            {isEmpty && !isLoading && (
              <div className="ai-chat__empty">
                <div className="ai-chat__empty-icon">
                  <SparkleBotIcon size={32} color="#da7756" />
                </div>
                <h3 className="ai-chat__empty-title">
                  Let's polish your resume
                </h3>
                <p className="ai-chat__empty-subtitle">
                  Ask me to rewrite summary fields, highlight achievements, or suggest skills.
                </p>
                <div className="ai-chat__prompts">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      className="ai-chat__prompt-chip"
                      onClick={() => handleSend(prompt.text)}
                    >
                      <span className="ai-chat__prompt-icon">{prompt.icon}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-chat__msg ai-chat__msg--${msg.role}`}
              >
                {msg.role === "model" && (
                  <div className="ai-chat__msg-avatar">
                    <SparkleBotIcon size={14} color="#ffffff" />
                  </div>
                )}
                <div className="ai-chat__msg-content">
                  {msg.role === "user" ? (
                    <p>{msg.text}</p>
                  ) : (
                    <div className="ai-chat__msg-formatted">
                      {formatResponse(msg.text)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="ai-chat__msg ai-chat__msg--model">
                <div className="ai-chat__msg-avatar">
                  <SparkleBotIcon size={14} color="#ffffff" />
                </div>
                <div className="ai-chat__msg-content">
                  <div className="ai-chat__typing">
                    <span className="ai-chat__typing-dot" />
                    <span className="ai-chat__typing-dot" />
                    <span className="ai-chat__typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="ai-chat__error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 4v3M7 9v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="ai-chat__input-bar">
            <textarea
              ref={inputRef}
              className="ai-chat__input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your resume…"
              rows={1}
              disabled={isLoading}
            />
            <button
              className="ai-chat__send-btn"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .ai-sidebar {
          width: 360px;
          min-width: 360px;
          height: 100%;
          background: var(--color-bg);
          border-left: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* ── Header ──────────────────────────────────────────── */
        .ai-sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border-light);
          flex-shrink: 0;
        }

        .ai-sidebar__header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-sidebar__icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #da7756 0%, #e8956f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .ai-sidebar__title {
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.3;
        }

        .ai-sidebar__subtitle {
          font-size: 0.72rem;
          color: var(--color-text-tertiary);
          margin: 0;
          line-height: 1.3;
        }

        .ai-sidebar__close {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          border: none;
          background: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .ai-sidebar__close:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
        }

        /* ── Chat Body ───────────────────────────────────────── */
        .ai-chat__body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Empty State ─────────────────────────────────────── */
        .ai-chat__empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px 0;
        }

        .ai-chat__empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(218, 119, 86, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: pulseIcon 3s ease-in-out infinite;
        }

        @keyframes pulseIcon {
          0%, 100% { box-shadow: 0 0 0 0 rgba(218, 119, 86, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(218, 119, 86, 0); }
        }

        .ai-chat__empty-title {
          font-family: var(--font-display, var(--font-body));
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--color-text);
          margin: 0 0 6px;
        }

        .ai-chat__empty-subtitle {
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
          margin: 0 0 20px;
          max-width: 280px;
          line-height: 1.5;
        }

        .ai-chat__prompts {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 285px;
        }

        .ai-chat__prompt-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: #ffffff;
          font-family: var(--font-body);
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .ai-chat__prompt-chip:hover {
          background: var(--color-bg-offwhite);
          border-color: var(--color-accent);
          color: var(--color-accent);
          transform: translateY(-0.5px);
        }

        .ai-chat__prompt-icon {
          font-size: 0.85rem;
        }

        /* ── Messages ────────────────────────────────────────── */
        .ai-chat__msg {
          display: flex;
          gap: 10px;
        }

        .ai-chat__msg--user {
          justify-content: flex-end;
        }

        .ai-chat__msg--model {
          justify-content: flex-start;
        }

        .ai-chat__msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #da7756 0%, #e8956f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ai-chat__msg-content {
          max-width: 82%;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .ai-chat__msg--user .ai-chat__msg-content {
          background: linear-gradient(135deg, #da7756 0%, #c4633f 100%);
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .ai-chat__msg--user .ai-chat__msg-content p {
          margin: 0;
        }

        .ai-chat__msg--model .ai-chat__msg-content {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
          border-bottom-left-radius: 4px;
        }

        /* ── Formatted Messages ───────────────────────────────── */
        .ai-chat__msg-formatted {
          display: flex;
          flex-direction: column;
        }

        .ai-chat__msg-formatted .ai-chat-h2 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 6px 0 3px;
        }

        .ai-chat__msg-formatted .ai-chat-h3 {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 4px 0 2px;
        }

        .ai-chat__msg-formatted .ai-chat-h4 {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 3px 0 1px;
        }

        .ai-chat__msg-formatted .ai-chat-p {
          margin: 2px 0;
          font-size: 0.82rem;
        }

        .ai-chat__msg-formatted .ai-chat-bullet {
          display: flex;
          gap: 6px;
          margin: 2px 0;
          font-size: 0.82rem;
        }

        .ai-chat__msg-formatted .ai-chat-bullet__dot {
          color: var(--color-accent);
          font-weight: 700;
        }

        .ai-chat__msg-formatted .ai-chat-bullet__num {
          color: var(--color-accent);
          font-weight: 600;
          min-width: 14px;
        }

        .ai-chat__msg-formatted .ai-chat-spacer {
          height: 4px;
        }

        .ai-chat__msg-formatted .ai-chat-bold {
          font-weight: 700;
        }

        .ai-chat__msg-formatted .ai-chat-italic {
          font-style: italic;
        }

        .ai-chat__msg-formatted .ai-chat-code {
          background: rgba(25, 25, 24, 0.05);
          padding: 1px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.76rem;
        }

        /* ── Typing Indicator ────────────────────────────────── */
        .ai-chat__typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }

        .ai-chat__typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          opacity: 0.4;
          animation: bounceTyping 1.4s ease-in-out infinite;
        }

        .ai-chat__typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-chat__typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounceTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        /* ── Error ───────────────────────────────────────────── */
        .ai-chat__error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: rgba(220, 60, 60, 0.04);
          border: 1px solid rgba(220, 60, 60, 0.12);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: #c44;
        }

        /* ── Input Bar ───────────────────────────────────────── */
        .ai-chat__input-bar {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          padding: 12px 16px;
          border-top: 1px solid var(--color-border-light);
          background: #ffffff;
          flex-shrink: 0;
        }

        .ai-chat__input {
          flex: 1;
          padding: 8px 12px;
          border: 1.5px solid var(--color-border);
          border-radius: 18px;
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--color-text);
          background: var(--color-bg-offwhite);
          outline: none;
          resize: none;
          max-height: 80px;
        }

        .ai-chat__input:focus {
          border-color: var(--color-text-secondary);
          background: #ffffff;
        }

        .ai-chat__send-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--color-btn-dark);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .ai-chat__send-btn:hover:not(:disabled) {
          background: var(--color-accent);
        }

        .ai-chat__send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── Locked Pro View ─────────────────────────────────── */
        .ai-sidebar__locked {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
        }

        .ai-sidebar__locked-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 280px;
        }

        .ai-sidebar__locked-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(218, 119, 86, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: pulseIcon 3s ease-in-out infinite;
        }

        .ai-sidebar__locked-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 300;
          color: var(--color-text);
          margin: 0 0 10px;
        }

        .ai-sidebar__locked-desc {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0 0 28px;
        }

        .ai-sidebar__upgrade-btn {
          width: 100%;
          padding: 11px;
          font-size: 0.88rem;
          font-weight: 600;
          border-radius: var(--radius-md);
        }

        @media (max-width: 768px) {
          .ai-sidebar {
            width: 100%;
            min-width: 100%;
            height: auto;
            border-left: none;
          }
        }
      `}</style>
    </div>
  );
}
