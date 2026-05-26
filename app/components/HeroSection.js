"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ClaudeIcon, { ClaudeArrow, ClaudeCheck, ClaudeSparkleSmall } from "./ClaudeIcon";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const WORDS = ["Be in the top 2%.", "& Get Hired"];

export default function HeroSection() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [totalResumes, setTotalResumes] = useState(249103);
  const { user, setAuthModalOpen } = useAuth();
  const router = useRouter();

  const handleCtaClick = (e) => {
    e.preventDefault();
    if (user) {
      window.dispatchEvent(new CustomEvent("cviqly-navigate", { detail: { destination: "/dashboard" } }));
    } else {
      setAuthModalOpen(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add 1 to 3 resumes every ~4.5 seconds
      const added = Math.floor(Math.random() * 3) + 1;
      setTotalResumes(prev => prev + added);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    const handleType = () => {
      const currentWordIndex = loopNum % WORDS.length;
      const fullText = WORDS[currentWordIndex];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(40); // Faster deletion
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(100); // Normal typing speed
      }

      if (!isDeleting && text === fullText) {
        setTypingSpeed(2000); // Pause at full word
        setIsDeleting(true);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(400); // Pause before next word
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);
  return (
    <section className="hero" id="hero">
      <div className="container hero__content">
        <div className="hero__text">
          <h1 className="hero__title">
            Only 2% of resumes pass first reviews.<br />
            <span className="typewriter-text">{text}</span>
          </h1>

          <p className="hero__subtitle">
            Create professional resumes in minutes with our intuitive free AI resume builder and online CV maker. Check your ATS resume score instantly, access modern templates, and export watermark-free PDFs to stand out to employers.
          </p>

          <div className="hero__actions">
            <button onClick={handleCtaClick} className="btn btn-primary btn-lg hero__cta" id="hero-cta">
              Create Your Resume
              <ClaudeArrow size={16} />
            </button>
            <a href="#how-it-works" className="btn btn-outline btn-lg" id="hero-learn-more">
              See How It Works
            </a>
          </div>

          <div className="hero__trust">
            <div className="hero__trust-item">
              <ClaudeCheck size={14} color="#5a8a3c" />
              <span>Your 1st Resume is Free Forever</span>
            </div>
            <div className="hero__trust-item">
              <ClaudeCheck size={14} color="#5a8a3c" />
              <span>No Watermarks</span>
            </div>
            <div className="hero__trust-item">
              <ClaudeCheck size={14} color="#5a8a3c" />
              <span>ATS-Friendly</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__live-counter">
            <ClaudeSparkleSmall size={14} color="#da7756" />
            <span className="hero__counter-number">{totalResumes.toLocaleString()}</span>
            <span className="hero__counter-text">Total Resumes Created</span>
          </div>

          <div className="hero__resume-card">
            <div className="hero__card-tabs">
              <span className="hero__card-tab hero__card-tab--active">Resume</span>
              <span className="hero__card-tab">Customize</span>
              <span className="hero__card-tab">AI Tools</span>
            </div>
            <div className="hero__card-toolbar">
              <div className="hero__card-input">
                <ClaudeIcon size={12} color="#da7756" />
                <span>build my resume...</span>
              </div>
              <div className="hero__card-send">
                <ClaudeArrow size={14} color="#fff" />
              </div>
            </div>
            <div className="hero__card-preview">
              <div className="hero__preview-header">
                <div className="hero__preview-avatar"></div>
                <div className="hero__preview-name">
                  <div className="hero__preview-line hero__preview-line--dark" style={{width: '60%'}}></div>
                  <div className="hero__preview-line hero__preview-line--accent" style={{width: '45%'}}></div>
                </div>
              </div>
              <div className="hero__preview-body">
                <div className="hero__preview-line hero__preview-line--heading" style={{width: '35%'}}></div>
                <div className="hero__preview-line" style={{width: '100%'}}></div>
                <div className="hero__preview-line" style={{width: '85%'}}></div>
                <div className="hero__preview-line" style={{width: '92%'}}></div>
                <div style={{height: '8px'}}></div>
                <div className="hero__preview-line hero__preview-line--heading" style={{width: '30%'}}></div>
                <div className="hero__preview-line" style={{width: '100%'}}></div>
                <div className="hero__preview-line" style={{width: '78%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__partners-strip">
        <div className="container hero__partners-container">
          <span className="hero__partners-title">Trusted by candidates hired at leading firms</span>
          <div className="hero__partners-logos">
            <img src="https://1000logos.net/wp-content/uploads/2020/04/ernst-young-ey-logo-1536x1282.png" alt="EY" className="hero__partner-img hero__partner-img--ey" title="EY" height="32" width="38" loading="lazy" />
            <img src="https://1000logos.net/wp-content/uploads/2021/05/PwC-logo-1536x864.png" alt="PwC" className="hero__partner-img hero__partner-img--pwc" title="PwC" height="32" width="57" loading="lazy" />
            <img src="https://1000logos.net/wp-content/uploads/2023/03/KPMG-logo-1536x864.png" alt="KPMG" className="hero__partner-img hero__partner-img--kpmg" title="KPMG" height="30" width="53" loading="lazy" />
            <img src="https://1000logos.net/wp-content/uploads/2021/05/Google-logo-1536x864.png" alt="Google" className="hero__partner-img hero__partner-img--google" title="Google" height="48" width="85" loading="lazy" />
            <img src="https://1000logos.net/wp-content/uploads/2017/04/Microsoft-Logo.png" alt="Microsoft" className="hero__partner-img hero__partner-img--microsoft" title="Microsoft" height="42" width="91" loading="lazy" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .typewriter-text {
          color: var(--color-accent);
          display: inline-block;
          border-right: 3px solid var(--color-accent);
          animation: blink 0.75s step-end infinite;
          vertical-align: bottom;
          padding-right: 4px; /* Space for the blinking cursor */
          min-height: 1.2em; /* Ensure line height stays constant when empty */
        }

        @keyframes blink {
          from, to { border-color: transparent; }
          50% { border-color: var(--color-accent); }
        }
        .hero {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .hero__content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 64px;
          align-items: center;
        }

        .hero__title {
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          margin-bottom: 20px;
        }

        .hero__subtitle {
          font-size: 1rem;
          max-width: 440px;
          margin-bottom: 32px;
          line-height: 1.7;
        }

        .hero__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }

        .hero__trust {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .hero__trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
        }

        .hero__partners-strip {
          background: #faf8f5;
          border-top: 1px solid #eae6e1;
          border-bottom: 1px solid #eae6e1;
          padding: 20px 0;
          width: 100%;
          margin-top: 80px;
          margin-bottom: -80px;
        }

        .hero__partners-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .hero__partners-title {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
          white-space: nowrap;
        }

        .hero__partners-logos {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .hero__partner-img {
          width: auto;
          object-fit: contain;
          opacity: 0.65;
          transition: all var(--transition-fast);
          filter: grayscale(1) contrast(1.1);
        }

        /* Visually balance 1000logos.net image dimensions & padding */
        .hero__partner-img--ey { height: 32px; }
        .hero__partner-img--pwc { height: 32px; }
        .hero__partner-img--kpmg { height: 30px; }
        .hero__partner-img--google { height: 48px; }
        .hero__partner-img--microsoft { height: 42px; }

        .hero__partner-img:hover {
          opacity: 1;
          filter: none;
        }

        .hero__visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .hero__live-counter {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 8px 20px;
          box-shadow: 0 4px 12px rgba(25, 25, 24, 0.06);
          animation: float 4s ease-in-out infinite;
        }

        .hero__counter-number {
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-text);
          font-variant-numeric: tabular-nums;
        }

        .hero__counter-text {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .hero__resume-card {
          width: 380px;
          background: var(--color-bg-offwhite);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .hero__card-tabs {
          display: flex;
          gap: 0;
          padding: 12px 16px 0;
          border-bottom: 1px solid var(--color-border);
        }

        .hero__card-tab {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-tertiary);
          padding: 8px 14px;
          cursor: default;
        }

        .hero__card-tab--active {
          color: var(--color-text);
          border-bottom: 2px solid var(--color-text);
          margin-bottom: -1px;
        }

        .hero__card-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .hero__card-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          color: var(--color-text-tertiary);
        }

        .hero__card-send {
          width: 32px;
          height: 32px;
          background: var(--color-btn-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero__card-preview {
          padding: 20px 16px;
          background: #fff;
          margin: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);
        }

        .hero__preview-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border-light);
        }

        .hero__preview-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-accent);
          opacity: 0.8;
          flex-shrink: 0;
        }

        .hero__preview-name {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hero__preview-body {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .hero__preview-line {
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
        }

        .hero__preview-line--dark {
          height: 6px;
          background: var(--color-text);
        }

        .hero__preview-line--accent {
          height: 4px;
          background: var(--color-accent);
          opacity: 0.6;
        }

        .hero__preview-line--heading {
          height: 5px;
          background: var(--color-text);
          opacity: 0.3;
          margin-top: 4px;
          margin-bottom: 2px;
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 110px;
            padding-bottom: 48px;
          }

          .hero__content {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .hero__subtitle {
            margin: 0 auto 32px;
          }

          .hero__actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .hero__cta {
            width: 100%;
          }

          #hero-learn-more {
            width: 100%;
          }

          .hero__trust {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero__resume-card {
            width: min(320px, 100%);
            margin: 0 auto;
          }

          .hero__partners-strip {
            margin-top: 48px;
            margin-bottom: -48px;
            padding: 16px 0;
          }

          .hero__partners-container {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .hero__partners-title {
            font-size: 0.7rem;
          }

          .hero__partners-logos {
            gap: 16px 20px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero__partner-img {
            width: auto;
            object-fit: contain;
          }

          .hero__partner-img--ey { height: 24px; }
          .hero__partner-img--pwc { height: 24px; }
          .hero__partner-img--kpmg { height: 22px; }
          .hero__partner-img--google { height: 32px; }
          .hero__partner-img--microsoft { height: 28px; }
        }
      `}</style>
    </section>
  );
}
