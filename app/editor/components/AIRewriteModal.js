"use client";

import { useState, useEffect, useRef } from "react";
import { useResume } from "../../context/ResumeContext";

// ── Phases ──────────────────────────────────────────────
// 1. INPUT   — user pastes job description
// 2. LOADING — AI is processing
// 3. PREVIEW — show diff / changes, confirm or cancel
// 4. DONE    — applied (auto-close)

export default function AIRewriteModal({ isOpen, onClose }) {
  const { resumeData, dispatch } = useResume();
  const [phase, setPhase] = useState("INPUT");
  const [jobDescription, setJobDescription] = useState("");
  const [rewrittenData, setRewrittenData] = useState(null);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const textareaRef = useRef(null);

  // Loading messages rotation
  useEffect(() => {
    if (phase !== "LOADING") return;
    const msgs = [
      "Analyzing job description…",
      "Matching your experience to the role…",
      "Optimizing resume keywords…",
      "Crafting impactful bullet points…",
      "Tailoring your professional summary…",
      "Finalizing ATS-friendly content…",
    ];
    let idx = 0;
    setLoadingMsg(msgs[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setLoadingMsg(msgs[idx]);
    }, 2400);
    return () => clearInterval(timer);
  }, [phase]);

  // Auto-focus textarea
  useEffect(() => {
    if (isOpen && phase === "INPUT" && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen, phase]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setPhase("INPUT");
        setJobDescription("");
        setRewrittenData(null);
        setError("");
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return;
    setPhase("LOADING");
    setError("");

    try {
      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: {
            profile: resumeData.profile,
            education: resumeData.education,
            experience: resumeData.experience,
            skills: resumeData.skills,
            certificates: resumeData.certificates,
          },
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setPhase("INPUT");
        return;
      }

      setRewrittenData(data.rewrittenResume);
      setPhase("PREVIEW");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setPhase("INPUT");
    }
  };

  const handleApply = () => {
    if (!rewrittenData) return;

    // Apply the rewritten data via dispatch
    if (rewrittenData.profile) {
      dispatch({ type: "UPDATE_PROFILE", payload: rewrittenData.profile });
    }

    if (rewrittenData.skills) {
      dispatch({ type: "SET_SKILLS", payload: rewrittenData.skills });
    }

    if (rewrittenData.experience) {
      // Replace all experiences
      // First clear existing, then add new
      const existingIds = resumeData.experience.map((e) => e.id);
      existingIds.forEach((id) =>
        dispatch({ type: "REMOVE_EXPERIENCE", payload: id })
      );

      rewrittenData.experience.forEach((exp, i) => {
        const id = resumeData.experience[i]?.id || `exp-${Date.now()}-${i}`;
        if (resumeData.experience[i]) {
          dispatch({
            type: "UPDATE_EXPERIENCE",
            payload: { ...exp, id: resumeData.experience[i].id },
          });
        } else {
          dispatch({ type: "ADD_EXPERIENCE" });
          // We'll update it after adding
          setTimeout(() => {
            dispatch({
              type: "UPDATE_EXPERIENCE",
              payload: { ...exp, id },
            });
          }, 50 * i);
        }
      });
    }

    if (rewrittenData.education) {
      rewrittenData.education.forEach((edu, i) => {
        if (resumeData.education[i]) {
          dispatch({
            type: "UPDATE_EDUCATION",
            payload: { ...edu, id: resumeData.education[i].id },
          });
        }
      });
    }

    if (rewrittenData.certificates) {
      rewrittenData.certificates.forEach((cert, i) => {
        if (resumeData.certificates[i]) {
          dispatch({
            type: "UPDATE_CERTIFICATE",
            payload: { ...cert, id: resumeData.certificates[i].id },
          });
        }
      });
    }

    setPhase("DONE");
    setTimeout(() => onClose(), 1200);
  };

  // Simpler approach: use SET_ALL to replace everything at once
  const handleApplyAll = () => {
    if (!rewrittenData) return;

    const merged = {
      ...resumeData,
      profile: { ...resumeData.profile, ...rewrittenData.profile },
      experience: (rewrittenData.experience || resumeData.experience).map(
        (exp, i) => ({
          ...exp,
          id: resumeData.experience[i]?.id || `exp-${Date.now()}-${i}`,
        })
      ),
      education: (rewrittenData.education || resumeData.education).map(
        (edu, i) => ({
          ...edu,
          id: resumeData.education[i]?.id || `edu-${Date.now()}-${i}`,
        })
      ),
      skills: rewrittenData.skills || resumeData.skills,
      certificates: (
        rewrittenData.certificates || resumeData.certificates
      ).map((cert, i) => ({
        ...cert,
        id: resumeData.certificates[i]?.id || `cert-${Date.now()}-${i}`,
      })),
    };

    dispatch({ type: "SET_ALL", payload: merged });
    setPhase("DONE");
    setTimeout(() => onClose(), 1200);
  };

  if (!isOpen) return null;

  // Build change summary for preview
  const buildChanges = () => {
    if (!rewrittenData) return [];
    const changes = [];

    // Profile summary
    if (
      rewrittenData.profile?.summary &&
      rewrittenData.profile.summary !== resumeData.profile.summary
    ) {
      changes.push({
        section: "Profile Summary",
        icon: "📝",
        before: resumeData.profile.summary || "(empty)",
        after: rewrittenData.profile.summary,
      });
    }

    // Job title
    if (
      rewrittenData.profile?.jobTitle &&
      rewrittenData.profile.jobTitle !== resumeData.profile.jobTitle
    ) {
      changes.push({
        section: "Job Title",
        icon: "💼",
        before: resumeData.profile.jobTitle || "(empty)",
        after: rewrittenData.profile.jobTitle,
      });
    }

    // Experience
    if (rewrittenData.experience) {
      rewrittenData.experience.forEach((exp, i) => {
        const orig = resumeData.experience[i];
        if (orig && exp.description !== orig.description) {
          changes.push({
            section: `Experience: ${exp.role || exp.company || `#${i + 1}`}`,
            icon: "🏢",
            before: orig.description || "(empty)",
            after: exp.description,
          });
        }
        if (orig && exp.role !== orig.role) {
          changes.push({
            section: `Role Title: ${orig.company || `#${i + 1}`}`,
            icon: "🔖",
            before: orig.role || "(empty)",
            after: exp.role,
          });
        }
      });
    }

    // Skills
    if (rewrittenData.skills) {
      const added = rewrittenData.skills.filter(
        (s) => !resumeData.skills.includes(s)
      );
      const removed = resumeData.skills.filter(
        (s) => !rewrittenData.skills.includes(s)
      );
      if (added.length > 0 || removed.length > 0) {
        changes.push({
          section: "Skills",
          icon: "⚡",
          before:
            removed.length > 0
              ? `Removed: ${removed.join(", ")}`
              : "(no removals)",
          after:
            added.length > 0 ? `Added: ${added.join(", ")}` : "(no additions)",
        });
      }
    }

    return changes;
  };

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
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h3 className="ai-modal__title">AI Resume Rewriter</h3>
              <p className="ai-modal__subtitle">Powered by ChatGPT</p>
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

        {/* Body */}
        <div className="ai-modal__body">
          {/* ── INPUT PHASE ── */}
          {phase === "INPUT" && (
            <div className="ai-phase ai-phase--input">
              <div className="ai-input-intro">
                <div className="ai-input-intro__badge">
                  <span className="ai-badge-dot"></span>
                  Paste &amp; Optimize
                </div>
                <p>
                  Paste the job description below. Our AI will rewrite your
                  entire resume to match the role perfectly — optimizing
                  keywords, tailoring your summary, and enhancing every bullet
                  point.
                </p>
              </div>

              <div className="ai-input-field">
                <label htmlFor="ai-jd-textarea">Job Description</label>
                <textarea
                  ref={textareaRef}
                  id="ai-jd-textarea"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…&#10;&#10;Example:&#10;We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud infrastructure…"
                  rows={10}
                />
                <div className="ai-input-charcount">
                  {jobDescription.length} characters
                </div>
              </div>

              {error && (
                <div className="ai-error">
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

              <button
                className="ai-submit-btn"
                onClick={handleSubmit}
                disabled={!jobDescription.trim()}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Rewrite My Resume with AI
              </button>
            </div>
          )}

          {/* ── LOADING PHASE ── */}
          {phase === "LOADING" && (
            <div className="ai-phase ai-phase--loading">
              <div className="ai-loader-visual">
                <div className="ai-loader-ring"></div>
                <div className="ai-loader-ring ai-loader-ring--2"></div>
                <div className="ai-loader-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#da7756"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h3 className="ai-loader-title">Rewriting Your Resume</h3>
              <div className="ai-loader-progress">
                <div className="ai-loader-progress__bar"></div>
              </div>
              <p className="ai-loader-message">{loadingMsg}</p>
            </div>
          )}

          {/* ── PREVIEW PHASE ── */}
          {phase === "PREVIEW" && (
            <div className="ai-phase ai-phase--preview">
              <div className="ai-preview-header">
                <div className="ai-preview-badge">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11.5 3.5l-6.5 7L2 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  AI Rewrite Complete
                </div>
                <p className="ai-preview-subtitle">
                  Review the changes below. Click <strong>Apply Changes</strong>{" "}
                  to update your resume, or <strong>Cancel</strong> to discard.
                </p>
              </div>

              <div className="ai-changes-list">
                {buildChanges().map((change, i) => (
                  <div className="ai-change-card" key={i}>
                    <div className="ai-change-card__header">
                      <span className="ai-change-card__icon">
                        {change.icon}
                      </span>
                      <span className="ai-change-card__section">
                        {change.section}
                      </span>
                    </div>
                    <div className="ai-change-card__diff">
                      <div className="ai-diff ai-diff--before">
                        <span className="ai-diff__label">Before</span>
                        <p>{change.before}</p>
                      </div>
                      <div className="ai-diff ai-diff--after">
                        <span className="ai-diff__label">After</span>
                        <p>{change.after}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {buildChanges().length === 0 && (
                  <div className="ai-no-changes">
                    <p>
                      Your resume was already well-optimized! Minor refinements
                      have been applied.
                    </p>
                  </div>
                )}
              </div>

              <div className="ai-preview-actions">
                <button
                  className="ai-action-btn ai-action-btn--cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="ai-action-btn ai-action-btn--apply"
                  onClick={handleApplyAll}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11.5 3.5l-6.5 7L2 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Apply Changes
                </button>
              </div>
            </div>
          )}

          {/* ── DONE PHASE ── */}
          {phase === "DONE" && (
            <div className="ai-phase ai-phase--done">
              <div className="ai-done-check">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#5a8a3c"
                    strokeWidth="2"
                    fill="rgba(90,138,60,0.08)"
                  />
                  <path
                    d="M12 20l6 6 10-12"
                    stroke="#5a8a3c"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="ai-done-title">Resume Updated!</h3>
              <p className="ai-done-subtitle">
                Your resume has been optimized for the target role.
              </p>
            </div>
          )}
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
            max-height: 85vh;
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
            padding: 18px 22px;
            border-bottom: 1px solid var(--color-border-light);
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

          /* ── Body ────────────────────────────────────────────── */
          .ai-modal__body {
            flex: 1;
            overflow-y: auto;
            padding: 22px;
          }

          .ai-phase {
            animation: aiFadeIn 0.3s ease;
          }

          /* ── INPUT PHASE ─────────────────────────────────────── */
          .ai-input-intro {
            margin-bottom: 18px;
          }

          .ai-input-intro__badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-body);
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-accent);
            margin-bottom: 8px;
          }

          .ai-badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--color-accent);
            animation: aiPulseDot 2s ease infinite;
          }

          .ai-input-intro p {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            line-height: 1.55;
            margin: 0;
          }

          .ai-input-field {
            margin-bottom: 14px;
          }

          .ai-input-field label {
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-text-secondary);
            margin-bottom: 6px;
            display: block;
          }

          .ai-input-field textarea {
            width: 100%;
            padding: 14px;
            border: 1.5px solid var(--color-border);
            border-radius: var(--radius-md);
            font-family: var(--font-body);
            font-size: 0.85rem;
            color: var(--color-text);
            background: var(--color-bg-offwhite);
            resize: vertical;
            line-height: 1.55;
            outline: none;
            transition: all 0.2s ease;
          }

          .ai-input-field textarea:focus {
            border-color: var(--color-accent);
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(218, 119, 86, 0.1);
          }

          .ai-input-charcount {
            font-size: 0.7rem;
            color: var(--color-text-tertiary);
            text-align: right;
            margin-top: 4px;
          }

          .ai-error {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 12px;
            background: rgba(220, 60, 60, 0.06);
            border: 1px solid rgba(220, 60, 60, 0.15);
            border-radius: var(--radius-md);
            font-size: 0.82rem;
            color: #c44;
            margin-bottom: 14px;
          }

          .ai-submit-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 13px 24px;
            border: none;
            border-radius: var(--radius-full);
            font-family: var(--font-body);
            font-size: 0.88rem;
            font-weight: 600;
            color: #ffffff;
            background: linear-gradient(135deg, #da7756 0%, #c4633f 100%);
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 16px rgba(218, 119, 86, 0.3);
          }

          .ai-submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 24px rgba(218, 119, 86, 0.4);
          }

          .ai-submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* ── LOADING PHASE ───────────────────────────────────── */
          .ai-phase--loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 32px 0;
            text-align: center;
          }

          .ai-loader-visual {
            position: relative;
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }

          .ai-loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px solid var(--color-border-light);
            border-top-color: var(--color-accent);
            animation: aiSpin 1.2s linear infinite;
          }

          .ai-loader-ring--2 {
            inset: 8px;
            border-top-color: transparent;
            border-right-color: var(--color-accent);
            animation-direction: reverse;
            animation-duration: 1.8s;
          }

          .ai-loader-icon {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: aiPulse 2s ease-in-out infinite;
          }

          .ai-loader-title {
            font-family: var(--font-display);
            font-size: 1.2rem;
            font-weight: 400;
            color: var(--color-text);
            margin-bottom: 16px;
          }

          .ai-loader-progress {
            width: 200px;
            height: 3px;
            background: var(--color-border-light);
            border-radius: var(--radius-full);
            overflow: hidden;
            margin-bottom: 16px;
          }

          .ai-loader-progress__bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(
              90deg,
              var(--color-accent) 0%,
              #e09476 100%
            );
            border-radius: var(--radius-full);
            animation: aiProgressBar 12s cubic-bezier(0.1, 0.8, 0.2, 1)
              forwards;
          }

          .ai-loader-message {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            animation: aiFadeInOut 2.4s ease infinite;
          }

          /* ── PREVIEW PHASE ───────────────────────────────────── */
          .ai-preview-header {
            margin-bottom: 18px;
          }

          .ai-preview-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-body);
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--color-success);
            background: rgba(90, 138, 60, 0.08);
            padding: 5px 12px;
            border-radius: var(--radius-full);
            margin-bottom: 10px;
          }

          .ai-preview-subtitle {
            font-size: 0.82rem;
            color: var(--color-text-secondary);
            line-height: 1.5;
            margin: 0;
          }

          .ai-changes-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: 340px;
            overflow-y: auto;
            margin-bottom: 18px;
            padding-right: 4px;
          }

          .ai-change-card {
            border: 1px solid var(--color-border-light);
            border-radius: var(--radius-md);
            overflow: hidden;
            animation: aiFadeIn 0.3s ease;
          }

          .ai-change-card__header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--color-bg-offwhite);
            border-bottom: 1px solid var(--color-border-light);
          }

          .ai-change-card__icon {
            font-size: 0.85rem;
          }

          .ai-change-card__section {
            font-family: var(--font-body);
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--color-text);
          }

          .ai-change-card__diff {
            display: flex;
            flex-direction: column;
          }

          .ai-diff {
            padding: 10px 12px;
            position: relative;
          }

          .ai-diff--before {
            background: rgba(220, 60, 60, 0.03);
            border-bottom: 1px solid var(--color-border-light);
          }

          .ai-diff--after {
            background: rgba(90, 138, 60, 0.03);
          }

          .ai-diff__label {
            display: inline-block;
            font-family: var(--font-body);
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .ai-diff--before .ai-diff__label {
            color: #c44;
          }

          .ai-diff--after .ai-diff__label {
            color: var(--color-success);
          }

          .ai-diff p {
            font-size: 0.78rem;
            color: var(--color-text);
            line-height: 1.5;
            margin: 0;
          }

          .ai-no-changes {
            text-align: center;
            padding: 20px;
            background: var(--color-bg-offwhite);
            border-radius: var(--radius-md);
          }

          .ai-no-changes p {
            font-size: 0.82rem;
            color: var(--color-text-secondary);
            margin: 0;
          }

          .ai-preview-actions {
            display: flex;
            gap: 10px;
          }

          .ai-action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 12px 20px;
            border-radius: var(--radius-full);
            font-family: var(--font-body);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .ai-action-btn--cancel {
            background: none;
            border: 1px solid var(--color-border);
            color: var(--color-text-secondary);
          }

          .ai-action-btn--cancel:hover {
            background: var(--color-bg-offwhite);
            color: var(--color-text);
          }

          .ai-action-btn--apply {
            background: var(--color-btn-dark);
            border: none;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(25, 25, 24, 0.15);
          }

          .ai-action-btn--apply:hover {
            background: var(--color-btn-dark-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(25, 25, 24, 0.2);
          }

          /* ── DONE PHASE ──────────────────────────────────────── */
          .ai-phase--done {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 0;
            text-align: center;
          }

          .ai-done-check {
            margin-bottom: 16px;
            animation: aiScaleBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .ai-done-title {
            font-family: var(--font-display);
            font-size: 1.3rem;
            font-weight: 400;
            color: var(--color-text);
            margin-bottom: 6px;
          }

          .ai-done-subtitle {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            margin: 0;
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

          @keyframes aiSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes aiPulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.08);
            }
          }

          @keyframes aiPulseDot {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(0.8);
            }
          }

          @keyframes aiProgressBar {
            0% {
              width: 0%;
            }
            20% {
              width: 15%;
            }
            50% {
              width: 45%;
            }
            80% {
              width: 80%;
            }
            95% {
              width: 95%;
            }
            100% {
              width: 100%;
            }
          }

          @keyframes aiFadeInOut {
            0%,
            100% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
          }

          @keyframes aiScaleBounce {
            from {
              transform: scale(0.5);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          /* ── Mobile ──────────────────────────────────────────── */
          @media (max-width: 768px) {
            .ai-modal-overlay {
              padding: 12px;
              align-items: flex-end;
            }

            .ai-modal {
              max-height: 90vh;
              border-radius: var(--radius-xl) var(--radius-xl) var(--radius-lg)
                var(--radius-lg);
            }

            .ai-modal__body {
              padding: 16px;
            }

            .ai-preview-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
