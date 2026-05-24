"use client";

import { useState, useEffect, useRef } from "react";
import { useResume } from "../../context/ResumeContext";

const SUGGESTED_PROMPTS = [
  { icon: "📝", text: "Improve my profile summary" },
  { icon: "💼", text: "Suggest skills for my role" },
  { icon: "🎯", text: "Write a stronger experience bullet" },
  { icon: "🔍", text: "Review my resume for improvements" },
];

export default function AIRewriteModal({ isOpen, onClose }) {
  const { resumeData } = useResume();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessages([]);
        setInputValue("");
        setIsLoading(false);
        setError("");
      }, 300);
    }
  }, [isOpen]);

  const handleSend = async (overrideMessage) => {
    const text = (overrideMessage || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = { role: "user", text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setError("");

    try {
      // Build history from previous messages (exclude the one we just added)
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

  // Simple markdown-like formatting for AI responses
  const formatResponse = (text) => {
    // Process line by line
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers
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
      }
      // Bullet points
      else if (line.match(/^[\-\*]\s/)) {
        elements.push(
          <div key={i} className="ai-chat-bullet">
            <span className="ai-chat-bullet__dot">•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
      }
      // Numbered list
      else if (line.match(/^\d+\.\s/)) {
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        elements.push(
          <div key={i} className="ai-chat-bullet">
            <span className="ai-chat-bullet__num">{numMatch[1]}.</span>
            <span>{formatInline(numMatch[2])}</span>
          </div>
        );
      }
      // Empty line
      else if (line.trim() === "") {
        elements.push(<div key={i} className="ai-chat-spacer" />);
      }
      // Normal paragraph
      else {
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

  // Inline formatting: **bold**, *italic*, `code`
  const formatInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Code
      const codeMatch = remaining.match(/`(.+?)`/);
      // Italic
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

      // Find which match comes first
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

      // Add text before the match
      if (firstIndex > 0) {
        parts.push(remaining.slice(0, firstIndex));
      }

      // Add the formatted element
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

  if (!isOpen) return null;

  const isEmpty = messages.length === 0;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal__header">
          <div className="ai-modal__header-left">
            <div className="ai-modal__icon-wrap">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="ai-modal__title">AI Resume Assistant</h3>
              <p className="ai-modal__subtitle">Powered by Gemini AI</p>
            </div>
          </div>
          <button className="ai-modal__close" onClick={onClose}>
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

        {/* Chat Body */}
        <div className="ai-chat__body">
          {/* Empty state with suggested prompts */}
          {isEmpty && !isLoading && (
            <div className="ai-chat__empty">
              <div className="ai-chat__empty-icon">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#da7756"
                  strokeWidth="1.2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="ai-chat__empty-title">
                How can I help with your resume?
              </h3>
              <p className="ai-chat__empty-subtitle">
                Ask me anything about your resume, career advice, or job
                searching.
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
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
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M7 4v3M7 9v.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
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
              width="18"
              height="18"
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

        <style jsx>{`
          /* ── Overlay ─────────────────────────────────────────── */
          .ai-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(25, 25, 24, 0.5);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: aiFadeIn 0.25s ease;
            padding: 20px;
          }

          .ai-modal {
            background: #ffffff;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            width: 100%;
            max-width: 580px;
            height: 70vh;
            max-height: 680px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 24px 80px rgba(25, 25, 24, 0.18),
              0 0 0 1px rgba(25, 25, 24, 0.04);
            animation: aiSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden;
          }

          /* ── Header ──────────────────────────────────────────── */
          .ai-modal__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--color-border-light);
            flex-shrink: 0;
          }

          .ai-modal__header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .ai-modal__icon-wrap {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #da7756 0%, #e8956f 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            flex-shrink: 0;
          }

          .ai-modal__title {
            font-family: var(--font-body);
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text);
            line-height: 1.3;
          }

          .ai-modal__subtitle {
            font-size: 0.72rem;
            color: var(--color-text-tertiary);
            margin: 0;
            line-height: 1.3;
          }

          .ai-modal__close {
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

          .ai-modal__close:hover {
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
            animation: aiFadeIn 0.4s ease;
          }

          .ai-chat__empty-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: rgba(218, 119, 86, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            animation: aiPulse 3s ease-in-out infinite;
          }

          .ai-chat__empty-title {
            font-family: var(--font-display, var(--font-body));
            font-size: 1.15rem;
            font-weight: 500;
            color: var(--color-text);
            margin: 0 0 6px;
          }

          .ai-chat__empty-subtitle {
            font-size: 0.82rem;
            color: var(--color-text-tertiary);
            margin: 0 0 24px;
            max-width: 320px;
            line-height: 1.5;
          }

          .ai-chat__prompts {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            max-width: 420px;
          }

          .ai-chat__prompt-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-full);
            background: #ffffff;
            font-family: var(--font-body);
            font-size: 0.78rem;
            font-weight: 500;
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .ai-chat__prompt-chip:hover {
            background: var(--color-bg-offwhite);
            border-color: var(--color-accent);
            color: var(--color-accent);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(218, 119, 86, 0.12);
          }

          .ai-chat__prompt-icon {
            font-size: 0.9rem;
          }

          /* ── Messages ────────────────────────────────────────── */
          .ai-chat__msg {
            display: flex;
            gap: 10px;
            animation: aiMsgIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 0.84rem;
            line-height: 1.55;
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

          /* ── Formatted AI Response ───────────────────────────── */
          .ai-chat__msg-formatted {
            display: flex;
            flex-direction: column;
          }

          .ai-chat__msg-formatted .ai-chat-h2 {
            font-size: 0.92rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 8px 0 4px;
          }

          .ai-chat__msg-formatted .ai-chat-h3 {
            font-size: 0.86rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 6px 0 3px;
          }

          .ai-chat__msg-formatted .ai-chat-h4 {
            font-size: 0.84rem;
            font-weight: 600;
            color: var(--color-text);
            margin: 4px 0 2px;
          }

          .ai-chat__msg-formatted .ai-chat-p {
            margin: 2px 0;
            font-size: 0.84rem;
            line-height: 1.55;
          }

          .ai-chat__msg-formatted .ai-chat-bullet {
            display: flex;
            gap: 8px;
            margin: 2px 0;
            font-size: 0.84rem;
            line-height: 1.55;
          }

          .ai-chat__msg-formatted .ai-chat-bullet__dot {
            color: var(--color-accent);
            font-weight: 700;
            flex-shrink: 0;
          }

          .ai-chat__msg-formatted .ai-chat-bullet__num {
            color: var(--color-accent);
            font-weight: 600;
            flex-shrink: 0;
            min-width: 18px;
          }

          .ai-chat__msg-formatted .ai-chat-spacer {
            height: 6px;
          }

          .ai-chat__msg-formatted .ai-chat-bold {
            font-weight: 700;
          }

          .ai-chat__msg-formatted .ai-chat-italic {
            font-style: italic;
          }

          .ai-chat__msg-formatted .ai-chat-code {
            background: rgba(25, 25, 24, 0.06);
            padding: 1px 5px;
            border-radius: 4px;
            font-family: "SF Mono", "Fira Code", monospace;
            font-size: 0.78rem;
          }

          /* ── Typing Indicator ────────────────────────────────── */
          .ai-chat__typing {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 0;
          }

          .ai-chat__typing-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--color-accent);
            opacity: 0.4;
            animation: aiTypingBounce 1.4s ease-in-out infinite;
          }

          .ai-chat__typing-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .ai-chat__typing-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          /* ── Error ───────────────────────────────────────────── */
          .ai-chat__error {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 12px;
            background: rgba(220, 60, 60, 0.06);
            border: 1px solid rgba(220, 60, 60, 0.15);
            border-radius: var(--radius-md);
            font-size: 0.82rem;
            color: #c44;
          }

          /* ── Input Bar ───────────────────────────────────────── */
          .ai-chat__input-bar {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            padding: 14px 18px;
            border-top: 1px solid var(--color-border-light);
            background: #ffffff;
            flex-shrink: 0;
          }

          .ai-chat__input {
            flex: 1;
            padding: 10px 14px;
            border: 1.5px solid var(--color-border);
            border-radius: 22px;
            font-family: var(--font-body);
            font-size: 0.85rem;
            color: var(--color-text);
            background: var(--color-bg-offwhite);
            resize: none;
            outline: none;
            line-height: 1.5;
            min-height: 42px;
            max-height: 100px;
            transition: all 0.2s ease;
          }

          .ai-chat__input:focus {
            border-color: var(--color-accent);
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(218, 119, 86, 0.1);
          }

          .ai-chat__input::placeholder {
            color: var(--color-text-tertiary);
          }

          .ai-chat__input:disabled {
            opacity: 0.6;
          }

          .ai-chat__send-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #da7756 0%, #c4633f 100%);
            color: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(218, 119, 86, 0.3);
          }

          .ai-chat__send-btn:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 6px 18px rgba(218, 119, 86, 0.4);
          }

          .ai-chat__send-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
          }

          /* ── Keyframes ───────────────────────────────────────── */
          @keyframes aiFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes aiSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes aiPulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.06);
            }
          }

          @keyframes aiMsgIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes aiTypingBounce {
            0%,
            60%,
            100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }

          /* ── Mobile ──────────────────────────────────────────── */
          @media (max-width: 768px) {
            .ai-modal-overlay {
              padding: 0;
              align-items: flex-end;
            }

            .ai-modal {
              max-width: 100%;
              height: 85vh;
              max-height: 85vh;
              border-radius: var(--radius-xl) var(--radius-xl) 0 0;
            }

            .ai-chat__prompts {
              max-width: 100%;
            }

            .ai-chat__body {
              padding: 14px;
            }

            .ai-chat__input-bar {
              padding: 10px 14px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
