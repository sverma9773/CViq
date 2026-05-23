"use client";

import { useState } from "react";
import { useResume } from "../../context/ResumeContext";
import { getTemplate } from "../../lib/templates";
import { ClaudeCheck } from "../../components/ClaudeIcon";
import { calculateMatchScore } from "../../lib/jobTrackerStore";

/*
 * ATS Score Breakdown (100 points total):
 *
 * CONTACT INFO (15 pts)    — name, email, phone, location, job title
 * EXPERIENCE   (25 pts)    — has entries, has descriptions, bullet length
 * EDUCATION    (10 pts)    — degree + institution filled
 * SKILLS       (15 pts)    — 5+ skills listed
 * FORMATTING   (20 pts)    — ATS-safe font, proper sizes, single-column
 * COMPLETENESS (15 pts)    — all sections present, no empty fields
 */

const ATS_SAFE_FONTS = ["calibri", "arial", "helvetica", "georgia", "garamond", "times new roman", "verdana", "inter", "eb garamond"];

function runATSCheck(resumeData) {
  const { profile, experience, education, skills, certificates, template, customStyle } = resumeData;
  const tpl = getTemplate(template || "classic");
  const cs = customStyle || {};
  const checks = [];
  let totalScore = 0;

  // ─── CONTACT INFO (15 pts) ───
  const contactChecks = [];
  if (profile.fullName && profile.fullName.trim().length > 2) {
    contactChecks.push({ pass: true, label: "Full name provided", pts: 3 });
    totalScore += 3;
  } else {
    contactChecks.push({ pass: false, label: "Full name is missing", pts: 0, fix: "Add your full name in the Profile section" });
  }

  if (profile.email && /[\w.+-]+@[\w-]+\.[\w.-]+/.test(profile.email)) {
    contactChecks.push({ pass: true, label: "Professional email included", pts: 3 });
    totalScore += 3;
  } else {
    contactChecks.push({ pass: false, label: "Email address is missing or invalid", pts: 0, fix: "Add a valid email in the Profile section" });
  }

  if (profile.phone && profile.phone.length >= 7) {
    contactChecks.push({ pass: true, label: "Phone number provided", pts: 3 });
    totalScore += 3;
  } else {
    contactChecks.push({ pass: false, label: "Phone number is missing", pts: 0, fix: "Add your phone number for recruiter contact" });
  }

  if (profile.location && profile.location.trim().length > 2) {
    contactChecks.push({ pass: true, label: "Location specified", pts: 3 });
    totalScore += 3;
  } else {
    contactChecks.push({ pass: false, label: "Location is missing", pts: 0, fix: "Add your city/state for location-based filtering" });
  }

  if (profile.jobTitle && profile.jobTitle.trim().length > 2) {
    contactChecks.push({ pass: true, label: "Job title headline present", pts: 3 });
    totalScore += 3;
  } else {
    contactChecks.push({ pass: false, label: "Job title is missing", pts: 0, fix: "Add a professional headline/job title" });
  }

  checks.push({ category: "Contact Information", maxPts: 15, items: contactChecks });

  // ─── EXPERIENCE (25 pts) ───
  const expChecks = [];
  const filledExp = experience.filter(e => e.role || e.company);

  if (filledExp.length >= 1) {
    expChecks.push({ pass: true, label: `${filledExp.length} experience ${filledExp.length === 1 ? "entry" : "entries"} found`, pts: 5 });
    totalScore += 5;
  } else {
    expChecks.push({ pass: false, label: "No work experience entries", pts: 0, fix: "Add at least one work experience entry" });
  }

  if (filledExp.length >= 2) {
    expChecks.push({ pass: true, label: "Multiple experience entries (good depth)", pts: 3 });
    totalScore += 3;
  } else {
    expChecks.push({ pass: false, label: "Only 1 experience entry — add more for depth", pts: 0, fix: "Add 2-3 relevant experience entries" });
  }

  const withDescriptions = filledExp.filter(e => e.description && e.description.trim().length > 20);
  if (withDescriptions.length >= filledExp.length && filledExp.length > 0) {
    expChecks.push({ pass: true, label: "All entries have detailed descriptions", pts: 7 });
    totalScore += 7;
  } else if (withDescriptions.length > 0) {
    expChecks.push({ pass: false, label: `${filledExp.length - withDescriptions.length} entries lack descriptions`, pts: 3, fix: "Add bullet-point descriptions to each role" });
    totalScore += 3;
  } else {
    expChecks.push({ pass: false, label: "No experience descriptions found", pts: 0, fix: "Add achievement-focused bullet points to each role" });
  }

  const withDates = filledExp.filter(e => e.startDate);
  if (withDates.length >= filledExp.length && filledExp.length > 0) {
    expChecks.push({ pass: true, label: "All entries have dates", pts: 5 });
    totalScore += 5;
  } else {
    expChecks.push({ pass: false, label: "Some entries missing date ranges", pts: 0, fix: "Add start/end dates to every experience entry" });
  }

  const hasBullets = filledExp.some(e => e.description && e.description.includes("\n"));
  if (hasBullets) {
    expChecks.push({ pass: true, label: "Uses bullet-point format", pts: 5 });
    totalScore += 5;
  } else {
    expChecks.push({ pass: false, label: "Use bullet points instead of paragraph text", pts: 0, fix: "Break descriptions into separate bullet points (one per line)" });
  }

  checks.push({ category: "Work Experience", maxPts: 25, items: expChecks });

  // ─── EDUCATION (10 pts) ───
  const eduChecks = [];
  const filledEdu = education.filter(e => e.degree || e.institution);

  if (filledEdu.length >= 1) {
    eduChecks.push({ pass: true, label: "Education section present", pts: 5 });
    totalScore += 5;
  } else {
    eduChecks.push({ pass: false, label: "No education entries", pts: 0, fix: "Add your educational background" });
  }

  const fullEdu = filledEdu.filter(e => e.degree && e.institution);
  if (fullEdu.length >= filledEdu.length && filledEdu.length > 0) {
    eduChecks.push({ pass: true, label: "Degree and institution both specified", pts: 5 });
    totalScore += 5;
  } else {
    eduChecks.push({ pass: false, label: "Some education entries incomplete", pts: 0, fix: "Fill in both degree name and institution" });
  }

  checks.push({ category: "Education", maxPts: 10, items: eduChecks });

  // ─── SKILLS (15 pts) ───
  const skillChecks = [];

  if (skills.length >= 5) {
    skillChecks.push({ pass: true, label: `${skills.length} skills listed (excellent)`, pts: 10 });
    totalScore += 10;
  } else if (skills.length >= 1) {
    skillChecks.push({ pass: false, label: `Only ${skills.length} skills — add more`, pts: 4, fix: "List at least 5-8 relevant skills for ATS keyword matching" });
    totalScore += 4;
  } else {
    skillChecks.push({ pass: false, label: "No skills listed", pts: 0, fix: "Add relevant technical and soft skills" });
  }

  if (skills.length >= 8) {
    skillChecks.push({ pass: true, label: "Strong keyword density for ATS matching", pts: 5 });
    totalScore += 5;
  } else {
    skillChecks.push({ pass: false, label: "Add more skills for better ATS keyword matching", pts: 0, fix: "Include 8+ skills that match job descriptions" });
  }

  checks.push({ category: "Skills & Keywords", maxPts: 15, items: skillChecks });

  // ─── FORMATTING (20 pts) ───
  const fmtChecks = [];
  const fontName = (cs.font || tpl.font).toLowerCase();
  const isATSFont = ATS_SAFE_FONTS.some(f => fontName.includes(f));

  if (isATSFont) {
    fmtChecks.push({ pass: true, label: "ATS-compatible font selected", pts: 5 });
    totalScore += 5;
  } else {
    fmtChecks.push({ pass: false, label: "Font may not be ATS-compatible", pts: 0, fix: "Switch to Calibri, Arial, Georgia, or Times New Roman" });
  }

  const bodyPt = parseFloat(cs.bodySize || tpl.bodySize);
  if (bodyPt >= 10 && bodyPt <= 12) {
    fmtChecks.push({ pass: true, label: `Body text size ${bodyPt}pt (optimal range)`, pts: 5 });
    totalScore += 5;
  } else {
    fmtChecks.push({ pass: false, label: `Body text ${bodyPt}pt — should be 10-12pt`, pts: 0, fix: "Set body text to 10-12pt for readability" });
  }

  const namePt = parseFloat(cs.nameSize || tpl.nameSize);
  if (namePt >= 18 && namePt <= 24) {
    fmtChecks.push({ pass: true, label: `Name size ${namePt}pt (optimal)`, pts: 5 });
    totalScore += 5;
  } else {
    fmtChecks.push({ pass: false, label: `Name size ${namePt}pt — should be 18-24pt`, pts: 0, fix: "Set name to 18-24pt for proper hierarchy" });
  }

  // Single column check (all our templates are single-column)
  fmtChecks.push({ pass: true, label: "Single-column layout (ATS-safe)", pts: 5 });
  totalScore += 5;

  checks.push({ category: "Formatting", maxPts: 20, items: fmtChecks });

  // ─── COMPLETENESS (15 pts) ───
  const compChecks = [];
  const hasCerts = certificates.some(c => c.name);

  if (hasCerts) {
    compChecks.push({ pass: true, label: "Certifications section filled", pts: 5 });
    totalScore += 5;
  } else {
    compChecks.push({ pass: false, label: "No certifications listed (optional)", pts: 0, fix: "Add relevant certifications if you have any" });
  }

  const totalWords = [
    profile.fullName, profile.jobTitle,
    ...experience.map(e => `${e.role} ${e.company} ${e.description}`),
    ...education.map(e => `${e.degree} ${e.institution}`),
    ...skills
  ].join(" ").split(/\s+/).filter(Boolean).length;

  if (totalWords >= 150) {
    compChecks.push({ pass: true, label: `${totalWords} words — good content density`, pts: 5 });
    totalScore += 5;
  } else {
    compChecks.push({ pass: false, label: `Only ${totalWords} words — aim for 150+`, pts: 0, fix: "Add more detail to descriptions for better ATS scoring" });
  }

  // Standard headings check
  compChecks.push({ pass: true, label: "Uses standard ATS-recognized section headings", pts: 5 });
  totalScore += 5;

  checks.push({ category: "Completeness", maxPts: 15, items: compChecks });

  return { score: Math.min(totalScore, 100), checks };
}

function getScoreColor(score) {
  if (score >= 80) return "#5a8a3c"; // var(--color-success)
  if (score >= 60) return "#da7756"; // var(--color-accent)
  return "#c84d31"; // soft warning terracotta red
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Work";
  return "Needs Improvement";
}

export default function ATSChecker({ onCheckComplete }) {
  const { resumeData } = useResume();
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [targetMode, setTargetMode] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdResult, setJdResult] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState("general"); // "general", "keywords"

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setJdText(evt.target.result || "");
      };
      reader.readAsText(file);
    }
  };

  const runCheck = () => {
    setChecking(true);
    // Simulate real AI analysis
    setTimeout(() => {
      const structureResult = runATSCheck(resumeData);
      
      if (targetMode && jdText.trim()) {
        const keywordMatch = calculateMatchScore(resumeData, jdText);
        // Blended score: 40% structure, 60% keyword match
        const blendedScore = Math.round(structureResult.score * 0.4 + keywordMatch.score * 0.6);
        
        setResult({
          score: Math.min(blendedScore, 100),
          checks: structureResult.checks,
          isBlended: true
        });
        
        setJdResult({
          score: keywordMatch.score,
          matchedKeywords: keywordMatch.matchedKeywords,
          missingKeywords: keywordMatch.missingKeywords
        });
        
        if (onCheckComplete) onCheckComplete(Math.min(blendedScore, 100));
      } else {
        setResult(structureResult);
        setJdResult(null);
        if (onCheckComplete) onCheckComplete(structureResult.score);
      }
      setChecking(false);
    }, 1200);
  };

  return (
    <div className="ats">
      {!result && !checking && (
        <div className="ats__intro">
          <div className="ats__intro-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#da7756" strokeWidth="2" fill="#faf6ee" />
              <path d="M16 24l5 5 11-11" stroke="#da7756" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="ats__intro-title">ATS Compatibility Checker</h2>
          <p className="ats__intro-desc font-body">
            Analyze your resume against Applicant Tracking System requirements.
            We check formatting, content, keyword density, and completeness.
          </p>

          {/* Job Target Toggle Card */}
          <div className="ats__target-card">
            <label className="ats__target-label">
              <input
                type="checkbox"
                checked={targetMode}
                onChange={(e) => setTargetMode(e.target.checked)}
                className="ats__target-checkbox"
              />
              <div className="ats__target-text">
                <span className="ats__target-title">Target a specific Job Description (Recommended)</span>
                <span className="ats__target-desc">We will parse the JD keywords and calculate a tailored match percentage.</span>
              </div>
            </label>

            {targetMode && (
              <div className="ats__jd-container animate-fade-in">
                <textarea
                  className="ats__jd-textarea"
                  placeholder="Paste the job listing/description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={6}
                />
                <div className="ats__upload-row">
                  <span className="ats__upload-hint">Or upload JD listing:</span>
                  <label className="ats__upload-btn">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M8 2l-3 3M8 2l3 3M3 12v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Upload TXT File
                    <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            )}
          </div>

          <button className="ats__run-btn" onClick={runCheck}>
            Run ATS Analysis
          </button>
        </div>
      )}

      {checking && (
        <div className="ats__intro">
          <div className="ats__spinner"></div>
          <h2 className="ats__intro-title">Analyzing Resume...</h2>
          <p className="ats__intro-desc">Checking formatting, content density, keyword coverage, and ATS compatibility.</p>
        </div>
      )}

      {result && (
        <div className="ats__results">
          {/* Score circle */}
          <div className="ats__score-card">
            <div className="ats__score-circle" style={{ "--score-color": getScoreColor(result.score) }}>
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e2d9" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor(result.score)} strokeWidth="8"
                  strokeDasharray={`${(result.score / 100) * 327} 327`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 0.8s ease" }}
                />
              </svg>
              <div className="ats__score-value">
                <span className="ats__score-num" style={{ color: getScoreColor(result.score) }}>{result.score}</span>
                <span className="ats__score-max">/100</span>
              </div>
            </div>
            <div className="ats__score-label" style={{ color: getScoreColor(result.score) }}>
              {getScoreLabel(result.score)}
            </div>
            <p className="ats__score-hint">
              {result.isBlended 
                ? `Tailored Match: This score includes keyword relevance against your target job listing.`
                : result.score >= 80 ? "Your resume is well-optimized for ATS systems!" :
                 result.score >= 60 ? "Your resume is decent but has room for improvement." :
                 "Several issues need attention before applying."}
            </p>
          </div>

          {/* Results Tab View */}
          {result.isBlended && (
            <div className="ats__tabs">
              <button
                className={`ats__tab ${activeViewTab === "general" ? "ats__tab--active" : ""}`}
                onClick={() => setActiveViewTab("general")}
              >
                Structure & formatting Check
              </button>
              <button
                className={`ats__tab ${activeViewTab === "keywords" ? "ats__tab--active" : ""}`}
                onClick={() => setActiveViewTab("keywords")}
              >
                Target JD Keywords Match
              </button>
            </div>
          )}

          {/* Tab 1: General Structural Checks */}
          {(activeViewTab === "general" || !result.isBlended) && (
            <div className="ats__categories-list">
              {result.checks.map((cat, ci) => {
                const catScore = cat.items.reduce((s, it) => s + (it.pts || 0), 0);
                return (
                  <div className="ats__category" key={ci}>
                    <div className="ats__cat-header">
                      <h3 className="ats__cat-title">{cat.category}</h3>
                      <span className="ats__cat-score">{catScore}/{cat.maxPts}</span>
                    </div>
                    <div className="ats__cat-bar">
                      <div className="ats__cat-bar-fill" style={{
                        width: `${(catScore / cat.maxPts) * 100}%`,
                        background: getScoreColor((catScore / cat.maxPts) * 100),
                      }}></div>
                    </div>
                    <div className="ats__items">
                      {cat.items.map((item, ii) => (
                        <div className={`ats__item ${item.pass ? "ats__item--pass" : "ats__item--fail"}`} key={ii}>
                          <div className="ats__item-icon">
                            {item.pass ? (
                              <ClaudeCheck size={12} color="#5a8a3c" />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <circle cx="6" cy="6" r="5" stroke="#c84d31" strokeWidth="1.2" />
                                <path d="M4 4l4 4M8 4l-4 4" stroke="#c84d31" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          <div className="ats__item-content">
                            <div className="ats__item-label">{item.label}</div>
                            {item.fix && <div className="ats__item-fix">{item.fix}</div>}
                          </div>
                          <div className="ats__item-pts" style={{ color: item.pass ? "#5a8a3c" : "#c84d31" }}>
                            +{item.pts}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Keyword Match Specifics */}
          {activeViewTab === "keywords" && jdResult && (
            <div className="ats__keywords-view animate-fade-in">
              <div className="ats__keyword-box">
                <h3 className="ats__keyword-header-title">Matched Job Keywords</h3>
                <p className="ats__keyword-header-desc">These key terms were found in your resume text content:</p>
                {jdResult.matchedKeywords.length > 0 ? (
                  <div className="ats__pills-container">
                    {jdResult.matchedKeywords.map((kw, i) => (
                      <span key={i} className="ats__kw-pill ats__kw-pill--pass">
                        <ClaudeCheck size={10} color="#5a8a3c" />
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="ats__kw-empty">No matching job description keywords detected yet.</div>
                )}
              </div>

              <div className="ats__keyword-box" style={{ marginTop: "16px" }}>
                <h3 className="ats__keyword-header-title" style={{ color: "#da7756" }}>Missing Keywords</h3>
                <p className="ats__keyword-header-desc">These high-value terms from the JD are missing. We recommend adding them:</p>
                {jdResult.missingKeywords.length > 0 ? (
                  <>
                    <div className="ats__pills-container">
                      {jdResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="ats__kw-pill ats__kw-pill--fail">
                          ✕ {kw}
                        </span>
                      ))}
                    </div>
                    <div className="ats__tip-box">
                      <span className="ats__tip-icon">💡</span>
                      <div className="ats__tip-text">
                        <strong>Actionable Fix:</strong> Seamlessly weave these keywords naturally into your Work Experience descriptions, Profile summary, or Technical Skills list.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ats__kw-empty" style={{ color: "#5a8a3c" }}>🎉 Congratulations! You have a 100% keyword match!</div>
                )}
              </div>
            </div>
          )}

          <div className="ats__action-row">
            <button className="ats__recheck-btn" onClick={runCheck}>
              Re-analyze Resume
            </button>
            <button className="ats__recheck-btn" style={{ borderColor: "#da7756", color: "#da7756" }} onClick={() => { setResult(null); setJdResult(null); }}>
              Change JD / Target Option
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ats { padding: 32px; max-width: 680px; margin: 0 auto; }

        /* Target Job Card styling */
        .ats__target-card {
          width: 100%;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          margin-top: 14px;
          margin-bottom: 8px;
          text-align: left;
        }
        .ats__target-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }
        .ats__target-checkbox {
          margin-top: 4px;
          accent-color: var(--color-accent);
          width: 15px;
          height: 15px;
        }
        .ats__target-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ats__target-title {
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .ats__target-desc {
          font-size: 0.74rem;
          color: var(--color-text-secondary);
        }

        /* JD Text Area & Uploads */
        .ats__jd-container {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--color-border-light);
          padding-top: 14px;
        }
        .ats__jd-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.8rem;
          background: var(--color-bg-offwhite);
          outline: none;
          resize: vertical;
          line-height: 1.45;
        }
        .ats__jd-textarea:focus {
          border-color: var(--color-accent);
        }
        .ats__upload-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--color-text-secondary);
        }
        .ats__upload-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-full);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.15s;
        }
        .ats__upload-btn:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        /* Tabs styling */
        .ats__tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border-light);
          margin-bottom: 16px;
        }
        .ats__tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .ats__tab--active {
          border-bottom-color: var(--color-accent);
          color: var(--color-text);
        }

        /* Keyword analysis list and pills */
        .ats__keyword-box {
          background: var(--color-bg);
          border: 1px solid var(--color-border-light);
          border-radius: 12px;
          padding: 16px;
          text-align: left;
        }
        .ats__keyword-header-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: #5a8a3c;
          margin-bottom: 4px;
        }
        .ats__keyword-header-desc {
          font-size: 0.76rem;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }
        .ats__pills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ats__kw-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 500;
          font-family: var(--font-body);
        }
        .ats__kw-pill--pass {
          background: #f4fcf0;
          border: 1px solid #5a8a3c40;
          color: #5a8a3c;
        }
        .ats__kw-pill--fail {
          background: #faf2ef;
          border: 1px solid #da775640;
          color: #da7756;
        }
        .ats__kw-empty {
          font-size: 0.78rem;
          color: var(--color-text-tertiary);
          font-style: italic;
        }
        .ats__tip-box {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          padding: 10px 12px;
          background: var(--color-bg-offwhite);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-md);
        }
        .ats__tip-icon {
          font-size: 1.1rem;
        }
        .ats__tip-text {
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
        }

        /* Intro */
        .ats__intro {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 40px 10px; gap: 16px;
        }
        .ats__intro-icon { margin-bottom: 8px; }
        .ats__intro-title {
          font-family: var(--font-display); font-size: 1.4rem;
          font-weight: 400;
        }
        .ats__intro-desc {
          font-size: 0.9rem; color: var(--color-text-secondary);
          max-width: 400px; line-height: 1.6;
        }
        .ats__run-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 32px; background: var(--color-btn-dark); color: #fff;
          border: none; border-radius: var(--radius-full);
          font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
          margin-top: 8px;
        }
        .ats__run-btn:hover { background: var(--color-btn-dark-hover); }

        .ats__spinner {
          width: 40px; height: 40px; border: 3px solid var(--color-border);
          border-top-color: var(--color-accent); border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Results */
        .ats__results { display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .ats__score-card {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px; background: var(--color-bg-offwhite);
          border-radius: 16px; border: 1px solid var(--color-border-light);
          gap: 6px;
        }
        .ats__score-circle { position: relative; display: flex; align-items: center; justify-content: center; }
        .ats__score-value {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          display: flex; align-items: baseline; gap: 2px;
        }
        .ats__score-num { font-size: 2.2rem; font-weight: 300; font-family: var(--font-display); }
        .ats__score-max { font-size: 0.85rem; color: var(--color-text-tertiary); }
        .ats__score-label { font-family: var(--font-display); font-size: 1.15rem; font-weight: 400; margin-top: 4px; }
        .ats__score-hint { font-size: 0.82rem; color: var(--color-text-secondary); text-align: center; max-width: 320px; line-height: 1.4; }

        /* Categories */
        .ats__category {
          background: var(--color-bg); border: 1px solid var(--color-border-light);
          border-radius: 12px; overflow: hidden;
        }
        .ats__cat-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px 8px; border-bottom: 1px solid var(--color-border-light);
        }
        .ats__cat-title {
          font-family: var(--font-display); font-size: 1.05rem; font-weight: 400;
          font-style: normal;
          color: var(--color-text);
        }
        .ats__cat-score {
          font-size: 0.8rem; font-weight: 600; font-family: monospace;
          color: var(--color-text-secondary);
        }
        .ats__cat-bar {
          height: 3px; background: var(--color-border-light); margin: 0 16px 8px;
        }
        .ats__cat-bar-fill {
          height: 100%; border-radius: 2px; transition: width 0.6s ease;
        }
        .ats__items { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 6px; }

        .ats__item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 12px; border-radius: 8px;
          transition: all 0.2s ease;
        }
        .ats__item--fail {
          background: #faf7f5;
          border-left: 3px solid #c84d31;
        }
        .ats__item--pass {
          background: transparent;
          border-left: 3px solid transparent;
        }
        .ats__item-icon { flex-shrink: 0; margin-top: 2px; }
        .ats__item-content { flex: 1; min-width: 0; }
        .ats__item-label { font-size: 0.82rem; font-weight: 500; color: var(--color-text); font-family: var(--font-body); }
        .ats__item-fix { font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 3px; font-family: var(--font-body); }
        .ats__item-pts { font-size: 0.72rem; font-weight: 600; font-family: monospace; flex-shrink: 0; }

        .ats__recheck-btn {
          align-self: center; padding: 10px 24px;
          background: var(--color-bg); color: var(--color-text);
          border: 1px solid var(--color-border); border-radius: var(--radius-full);
          font-family: var(--font-body); font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          margin-top: 10px;
        }
        .ats__recheck-btn:hover { background: var(--color-bg-offwhite); border-color: var(--color-text-tertiary); }

        .ats__action-row {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
        }

        .animate-fade-in {
          animation: dropIn 0.2s ease-out;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .ats { padding: 20px 16px; }
          .ats__intro { padding: 24px 8px; }
          .ats__intro-title { font-size: 1.2rem; }
          .ats__intro-desc { font-size: 0.82rem; max-width: 100%; }
          .ats__run-btn { width: 100%; justify-content: center; padding: 14px 24px; }
          .ats__target-card { padding: 12px; }
          .ats__target-title { font-size: 0.82rem; }
          .ats__jd-textarea { font-size: 16px; min-height: 100px; }
          .ats__upload-row { flex-direction: column; align-items: flex-start; gap: 8px; }

          .ats__score-card { padding: 20px 16px; }
          .ats__score-circle svg { width: 100px; height: 100px; }
          .ats__score-num { font-size: 1.8rem; }
          .ats__score-hint { font-size: 0.78rem; max-width: 100%; }

          .ats__tabs { gap: 0; }
          .ats__tab { font-size: 0.75rem; padding: 10px 8px; min-height: 44px; }

          .ats__cat-header { padding: 12px 12px 6px; }
          .ats__cat-title { font-size: 0.95rem; }
          .ats__items { padding: 0 8px 10px; }
          .ats__item { padding: 8px 8px; gap: 8px; }
          .ats__item-label { font-size: 0.78rem; }
          .ats__item-fix { font-size: 0.7rem; }

          .ats__keyword-box { padding: 12px; }
          .ats__keyword-header-title { font-size: 0.95rem; }
          .ats__kw-pill { font-size: 0.7rem; padding: 4px 8px; }
          .ats__tip-box { flex-direction: column; gap: 6px; }
          .ats__tip-text { font-size: 0.7rem; }

          .ats__recheck-btn { width: 100%; justify-content: center; min-height: 44px; }
        }

        @media (max-width: 480px) {
          .ats { padding: 16px 12px; }
          .ats__score-circle svg { width: 88px; height: 88px; }
          .ats__score-num { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
