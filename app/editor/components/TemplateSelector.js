"use client";

import { TEMPLATES } from "../../lib/templates";
import { ClaudeCheck } from "../../components/ClaudeIcon";

export default function TemplateSelector({ selectedTemplate, onSelect }) {
  return (
    <div className="tpl-selector">
      <h3 className="tpl-selector__title">Choose Template</h3>
      <p className="tpl-selector__desc">
        All templates use ATS-approved fonts, single-column layouts, and standard section headings.
      </p>

      <div className="tpl-selector__grid">
        {TEMPLATES.map((tpl) => {
          const isActive = selectedTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              className={`tpl-card ${isActive ? "tpl-card--active" : ""}`}
              onClick={() => onSelect(tpl.id)}
              id={`template-${tpl.id}`}
            >
              <div className="tpl-card__preview">
                <MiniPreview tpl={tpl} />
              </div>

              <div className="tpl-card__info">
                <div className="tpl-card__name">
                  {tpl.name}
                  {isActive && <ClaudeCheck size={12} color="#5a8a3c" />}
                </div>
                <div className="tpl-card__font">{tpl.font.split(",")[0].replace(/'/g, "")}</div>
                <div className="tpl-card__specs">
                  {tpl.nameSize} / {tpl.headingSize} / {tpl.bodySize}
                </div>
                <div className="tpl-card__desc">{tpl.description}</div>
              </div>

              <div className="tpl-card__ats">
                <ClaudeCheck size={10} color="#5a8a3c" />
                <span>100% ATS Compatible</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="tpl-selector__info-box">
        <h4>ATS Best Practices Applied</h4>
        <ul>
          <li>Single-column layout — no tables or multi-column</li>
          <li>Standard section headings (Experience, Education, Skills)</li>
          <li>ATS-safe fonts: Calibri, Arial, Georgia, Garamond</li>
          <li>Name: 18–22pt · Headings: 12–14pt · Body: 10.5–11pt</li>
          <li>0.75" margins · Simple bullet points · No images or icons</li>
        </ul>
      </div>

      <style jsx>{`
        .tpl-selector { padding: 24px; }
        .tpl-selector__title {
          font-family: var(--font-display); font-size: 1.15rem;
          margin-bottom: 4px;
        }
        .tpl-selector__desc {
          font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 20px;
        }
        .tpl-selector__grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tpl-card {
          display: flex; flex-direction: column;
          border: 1.5px solid var(--color-border); border-radius: 10px;
          overflow: hidden; background: var(--color-bg);
          cursor: pointer; transition: all 0.15s ease; text-align: left; padding: 0;
        }
        .tpl-card:hover { border-color: var(--color-text-tertiary); box-shadow: 0 2px 12px rgba(25,25,24,0.06); }
        .tpl-card--active {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 2px rgba(218,119,86,0.15);
        }
        .tpl-card__preview {
          padding: 10px; background: #faf8f5;
          border-bottom: 1px solid var(--color-border-light);
          height: 130px; display: flex; align-items: center; justify-content: center;
        }
        .tpl-card__info { padding: 8px 10px 4px; }
        .tpl-card__name {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 600;
        }
        .tpl-card__font { font-size: 0.65rem; color: var(--color-accent); font-weight: 500; }
        .tpl-card__specs { font-size: 0.62rem; color: var(--color-text-tertiary); font-family: monospace; }
        .tpl-card__desc { font-size: 0.68rem; color: var(--color-text-tertiary); margin-top: 2px; }
        .tpl-card__ats {
          display: flex; align-items: center; gap: 4px;
          padding: 5px 10px; font-size: 0.62rem; font-weight: 600;
          color: #5a8a3c; border-top: 1px solid var(--color-border-light);
        }

        .tpl-selector__info-box {
          margin-top: 20px; padding: 14px 16px;
          background: var(--color-bg-offwhite); border-radius: 10px;
          border: 1px solid var(--color-border-light);
        }
        .tpl-selector__info-box h4 {
          font-size: 0.78rem; font-weight: 600; margin-bottom: 6px;
          font-family: var(--font-body); font-style: normal;
        }
        .tpl-selector__info-box ul {
          padding-left: 16px; list-style-type: disc;
        }
        .tpl-selector__info-box li {
          font-size: 0.72rem; color: var(--color-text-secondary);
          margin-bottom: 2px; line-height: 1.5;
        }

        @media (max-width: 768px) {
          .tpl-selector { padding: 16px; }
          .tpl-selector__grid { grid-template-columns: 1fr; gap: 10px; }
          .tpl-selector__title { font-size: 1rem; }
          .tpl-selector__desc { font-size: 0.78rem; }
          .tpl-card__preview { height: 110px; }
        }
      `}</style>
    </div>
  );
}

/* Mini template preview thumbnails */
function MiniPreview({ tpl }) {
  const accent = tpl.accent;
  const isCenter = tpl.headerAlign === "center";
  const borderStyle = tpl.headerStyle === "full-border" ? `2px solid ${accent}` :
    tpl.headerStyle === "border-bottom" ? `1px solid ${accent}40` : "none";

  return (
    <div style={{
      width: "100%", height: "100%", background: "#fff",
      borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      padding: "10px 9px", display: "flex", flexDirection: "column", gap: "4px",
      overflow: "hidden",
    }}>
      {/* Name */}
      <div style={{
        height: "7px", width: isCenter ? "45%" : "50%", background: "#191918",
        borderRadius: "1px", alignSelf: isCenter ? "center" : "flex-start",
      }}></div>
      {/* Job title */}
      <div style={{
        height: "4px", width: "30%", background: `${accent}50`,
        borderRadius: "1px", alignSelf: isCenter ? "center" : "flex-start",
      }}></div>
      {/* Contact */}
      <div style={{
        height: "3px", width: "55%", background: "#ddd",
        borderRadius: "1px", alignSelf: isCenter ? "center" : "flex-start",
      }}></div>
      {/* Divider */}
      <div style={{
        height: tpl.headerStyle === "full-border" ? "2px" : "1px",
        width: "100%", background: tpl.headerStyle === "full-border" ? accent : `${accent}30`,
        margin: "2px 0",
      }}></div>
      {/* Section header */}
      <div style={{
        height: "4px", width: "35%", background: accent,
        borderRadius: "1px", borderBottom: borderStyle, paddingBottom: "2px",
      }}></div>
      {/* Body lines */}
      {[92, 78, 85, 60].map((w, i) => (
        <div key={i} style={{ height: "3px", width: `${w}%`, background: "#e8e5df", borderRadius: "1px" }}></div>
      ))}
      {/* Section header 2 */}
      <div style={{
        height: "4px", width: "28%", background: accent,
        borderRadius: "1px", marginTop: "3px", borderBottom: borderStyle, paddingBottom: "2px",
      }}></div>
      {[70, 55].map((w, i) => (
        <div key={i} style={{ height: "3px", width: `${w}%`, background: "#e8e5df", borderRadius: "1px" }}></div>
      ))}
    </div>
  );
}
