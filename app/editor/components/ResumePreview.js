"use client";

import { useResume } from "../../context/ResumeContext";
import { getTemplate } from "../../lib/templates";

/*
 * A4 at 96dpi: 794 × 1123 px
 *
 * All templates are 100% ATS-friendly:
 * - Single-column layout (no tables, no multi-column)
 * - Standard section headings recognized by ATS parsers
 * - Simple bullet points, no icons/images/skill bars
 * - Fonts: Calibri, Arial, Georgia, Garamond (ATS-safe)
 * - Name 18-22pt, Headings 12-14pt, Body 10.5-11pt
 */

const A4_W = 794;
const A4_H = 1123;

const MARGIN_MAP = { narrow: 36, normal: 54, wide: 72 };
const LINE_HEIGHT_MAP = { compact: 1.3, normal: 1.45, relaxed: 1.65 };
const SECTION_GAP_MAP = { compact: 10, normal: 14, relaxed: 20 };
const ENTRY_GAP_MAP = { compact: 6, normal: 10, relaxed: 14 };

export default function ResumePreview() {
  const { resumeData } = useResume();
  const tplId = resumeData.template || "classic";
  const tpl = getTemplate(tplId);
  const cs = resumeData.customStyle || {};

  // Merge: custom overrides template defaults
  const font = cs.font || tpl.font;
  const nameSize = cs.nameSize || tpl.nameSize;
  const headingSize = cs.headingSize || tpl.headingSize;
  const bodySize = cs.bodySize || tpl.bodySize;
  const accent = cs.accent || tpl.accent;
  const headerAlign = cs.headerAlign || tpl.headerAlign;
  const headerStyle = cs.headerStyle || tpl.headerStyle;
  const spacing = cs.spacing || "normal";
  const margins = cs.margins || "normal";

  const margin = MARGIN_MAP[margins];
  const lineHeight = LINE_HEIGHT_MAP[spacing];
  const sectionGap = SECTION_GAP_MAP[spacing];
  const entryGap = ENTRY_GAP_MAP[spacing];
  const isCenter = headerAlign === "center";

  const { profile, education, experience, skills, certificates } = resumeData;

  // Section heading style
  const hStyle = () => {
    const base = {
      fontSize: headingSize, fontWeight: 700, fontFamily: font,
      textTransform: "uppercase", letterSpacing: "1.2px",
      color: accent, paddingBottom: "3px", marginBottom: `${Math.max(4, entryGap - 4)}px`,
    };
    if (headerStyle === "full-border") return { ...base, borderBottom: `2px solid ${accent}`, paddingBottom: "4px" };
    if (headerStyle === "border-bottom") return { ...base, borderBottom: `1.5px solid ${accent}40` };
    return { ...base, borderBottom: "none", color: "#999", letterSpacing: "2px" };
  };

  return (
    <div className="preview-wrapper" id="resume-preview-wrapper">
      <div className="preview-pages" id="resume-preview-content">
        <div
          className="preview-paper"
          style={{
            fontFamily: font,
            fontSize: bodySize,
            padding: `${margin}px`,
            lineHeight: lineHeight,
          }}
        >
          {/* ─── HEADER ─── */}
          <div className="resume-header" style={{ textAlign: isCenter ? "center" : "left" }}>
            <h1 className="resume-name" style={{
              fontSize: nameSize, fontFamily: font, fontWeight: 700,
              color: "#191918",
            }}>
              {profile.fullName || "Your Name"}
            </h1>

            {profile.jobTitle && (
              <p className="resume-jobtitle" style={{
                fontSize: "11pt", fontFamily: font, color: accent,
                fontStyle: tplId === "elegant" || tplId === "garamond" ? "italic" : "normal",
              }}>
                {profile.jobTitle}
              </p>
            )}

            <div className="resume-contact" style={{ justifyContent: isCenter ? "center" : "flex-start" }}>
              {[profile.email, profile.phone, profile.location].filter(Boolean).map((c, i, arr) => (
                <span key={i}>
                  {c}{i < arr.length - 1 ? <span className="resume-contact__sep"> | </span> : ""}
                </span>
              ))}
            </div>

            {headerStyle === "full-border" ? (
              <div style={{ height: "3px", background: accent, marginTop: "10px" }}></div>
            ) : headerStyle !== "uppercase-only" ? (
              <div style={{ height: "1px", background: `${accent}30`, marginTop: "10px" }}></div>
            ) : (
              <div style={{ marginTop: "8px" }}></div>
            )}
          </div>

          {/* ─── EXPERIENCE ─── */}
          {experience.length > 0 && experience.some(e => e.role || e.company) && (
            <div className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
              <h2 style={hStyle()}>Professional Experience</h2>
              {experience.filter(e => e.role || e.company).map((exp) => (
                <div className="resume-entry" key={exp.id} style={{ marginBottom: `${entryGap}px` }}>
                  <div className="resume-entry__top">
                    <div className="resume-entry__left">
                      <div className="resume-entry__role">{exp.role || "Role"}</div>
                      <div className="resume-entry__company">{exp.company || "Company"}</div>
                    </div>
                    <div className="resume-entry__date">{exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ""}</div>
                  </div>
                  {exp.description && (
                    <ul className="resume-entry__bullets">
                      {exp.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i}>{line.replace(/^[•\-–*]\s*/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── EDUCATION ─── */}
          {education.length > 0 && education.some(e => e.degree || e.institution) && (
            <div className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
              <h2 style={hStyle()}>Education</h2>
              {education.filter(e => e.degree || e.institution).map((edu) => (
                <div className="resume-entry" key={edu.id} style={{ marginBottom: `${entryGap}px` }}>
                  <div className="resume-entry__top">
                    <div className="resume-entry__left">
                      <div className="resume-entry__role">{edu.degree || "Degree"}</div>
                      <div className="resume-entry__company">{edu.institution || "Institution"}</div>
                    </div>
                    <div className="resume-entry__date">{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</div>
                  </div>
                  {edu.description && <p className="resume-entry__desc">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ─── SKILLS ─── */}
          {skills.length > 0 && (
            <div className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
              <h2 style={hStyle()}>Skills</h2>
              <p className="resume-skills">{skills.join("  •  ")}</p>
            </div>
          )}

          {/* ─── CERTIFICATIONS ─── */}
          {certificates.length > 0 && certificates.some(c => c.name) && (
            <div className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
              <h2 style={hStyle()}>Certifications</h2>
              {certificates.filter(c => c.name).map((c) => (
                <div className="resume-cert" key={c.id}>
                  <span className="resume-cert__name">{c.name}</span>
                  {c.issuer && <span className="resume-cert__issuer"> — {c.issuer}</span>}
                  {c.date && <span className="resume-cert__date"> ({c.date})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preview-wrapper {
          display: flex; justify-content: center; align-items: flex-start;
          padding: 32px; overflow-y: auto; height: 100%;
          background: #e8e5df;
        }
        .preview-pages {
          display: flex; flex-direction: column; gap: 24px; align-items: center;
        }
        .preview-paper {
          width: ${A4_W}px; min-height: ${A4_H}px; background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 24px rgba(25,25,24,0.12), 0 1px 3px rgba(25,25,24,0.06);
          color: #191918; overflow: hidden;
        }
        .resume-header { margin-bottom: 14px; }
        .resume-name { margin: 0 0 2px; line-height: 1.15; }
        .resume-jobtitle { margin: 0; }
        .resume-contact {
          display: flex; flex-wrap: wrap; gap: 4px;
          font-size: 9pt; color: #666666; margin-top: 5px;
        }
        .resume-contact__sep { color: #ccc; margin: 0 2px; }
        .resume-section h2 { margin: 0; }
        .resume-entry { break-inside: avoid; }
        .resume-entry__top {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 8px;
        }
        .resume-entry__left { flex: 1; min-width: 0; }
        .resume-entry__role { font-weight: 600; color: #191918; font-size: 10.5pt; }
        .resume-entry__company { font-size: 9.5pt; color: #888; font-style: italic; }
        .resume-entry__date { font-size: 9pt; color: #888; white-space: nowrap; flex-shrink: 0; }
        .resume-entry__desc { font-size: inherit; color: #444; margin: 3px 0 0; }
        .resume-entry__bullets {
          margin: 4px 0 0 0; padding-left: 16px;
          list-style-type: disc; color: #444;
        }
        .resume-entry__bullets li { margin-bottom: 2px; font-size: inherit; }
        .resume-skills { font-size: inherit; color: #444; line-height: 1.6; margin: 0; }
        .resume-cert { margin-bottom: 3px; font-size: inherit; }
        .resume-cert__name { font-weight: 600; color: #191918; }
        .resume-cert__issuer { color: #666; }
        .resume-cert__date { color: #999; font-size: 9pt; }
        @media (max-width: 900px) {
          .preview-paper { width: 100%; min-height: auto; border-radius: 8px; padding: 28px; }
        }
      `}</style>
    </div>
  );
}
