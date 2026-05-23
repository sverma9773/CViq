"use client";

import { useEffect, useState, useRef } from "react";
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
  const sandboxRef = useRef(null);
  const [paginatedPages, setPaginatedPages] = useState([[]]);

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

  const margin = MARGIN_MAP[margins] || 54;
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

  // ─── True DOM Pagination Engine ───
  useEffect(() => {
    const paginateContent = () => {
      if (!sandboxRef.current) return;

      const pageHeightBudget = A4_H - (margin * 2); // vertical pixels available for content on each A4 page

      const headerEl = sandboxRef.current.querySelector("#sandbox-header");
      const headerHeight = headerEl ? headerEl.offsetHeight : 0;

      // Flatten content into logical blocks to measure and paginate
      const blocks = [];

      // 1. Header block
      if (headerHeight > 0) {
        blocks.push({ type: "header", height: headerHeight + sectionGap });
      }

      // 2. Experience Section
      const expSection = sandboxRef.current.querySelector("#sandbox-section-experience");
      if (expSection) {
        const titleEl = expSection.querySelector("#sandbox-section-experience-title");
        const titleH = titleEl ? titleEl.offsetHeight : 0;
        blocks.push({ type: "section_title", section: "experience", title: "Professional Experience", height: titleH + 8 });

        const entries = expSection.querySelectorAll(".sandbox-entry-experience");
        entries.forEach(el => {
          blocks.push({
            type: "entry",
            section: "experience",
            id: el.getAttribute("data-id"),
            height: el.offsetHeight + entryGap
          });
        });
      }

      // 3. Education Section
      const eduSection = sandboxRef.current.querySelector("#sandbox-section-education");
      if (eduSection) {
        const titleEl = eduSection.querySelector("#sandbox-section-education-title");
        const titleH = titleEl ? titleEl.offsetHeight : 0;
        blocks.push({ type: "section_title", section: "education", title: "Education", height: titleH + 8 });

        const entries = eduSection.querySelectorAll(".sandbox-entry-education");
        entries.forEach(el => {
          blocks.push({
            type: "entry",
            section: "education",
            id: el.getAttribute("data-id"),
            height: el.offsetHeight + entryGap
          });
        });
      }

      // 4. Skills Section
      const skillsSection = sandboxRef.current.querySelector("#sandbox-section-skills");
      if (skillsSection) {
        const titleEl = skillsSection.querySelector("#sandbox-section-skills-title");
        const titleH = titleEl ? titleEl.offsetHeight : 0;
        const bodyEl = skillsSection.querySelector(".resume-skills");
        const bodyH = bodyEl ? bodyEl.offsetHeight : 0;

        blocks.push({
          type: "full_section",
          section: "skills",
          title: "Skills",
          height: titleH + bodyH + sectionGap
        });
      }

      // 5. Certificates Section
      const certsSection = sandboxRef.current.querySelector("#sandbox-section-certificates");
      if (certsSection) {
        const titleEl = certsSection.querySelector("#sandbox-section-certificates-title");
        const titleH = titleEl ? titleEl.offsetHeight : 0;
        blocks.push({ type: "section_title", section: "certificates", title: "Certifications", height: titleH + 8 });

        const entries = certsSection.querySelectorAll(".sandbox-entry-certificate");
        entries.forEach(el => {
          blocks.push({
            type: "entry",
            section: "certificates",
            id: el.getAttribute("data-id"),
            height: el.offsetHeight + 6
          });
        });
      }

      // Pagination Knapsack Layout
      const pages = [];
      let currentPage = [];
      let currentBudget = pageHeightBudget;

      blocks.forEach(block => {
        // Prevent orphaned headers: if we have a section heading, make sure there's room
        // for both the heading AND the first entry. Otherwise, push heading to the next page.
        const isHeaderOrTitle = block.type === "header" || block.type === "section_title";

        if (block.height > currentBudget && !isHeaderOrTitle) {
          // Push current page, start fresh page
          pages.push(currentPage);
          currentPage = [];
          currentBudget = pageHeightBudget;
        }

        currentPage.push(block);
        currentBudget -= block.height;
      });

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }

      setPaginatedPages(pages.length > 0 ? pages : [[]]);
    };

    // Delay slightly to let styles apply
    const timer = setTimeout(paginateContent, 100);

    let observer;
    if (sandboxRef.current && typeof window !== "undefined" && window.ResizeObserver) {
      observer = new ResizeObserver(paginateContent);
      observer.observe(sandboxRef.current);
    }

    window.addEventListener("resize", paginateContent);
    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener("resize", paginateContent);
    };
  }, [resumeData, spacing, margins]);

  return (
    <div className="preview-wrapper" id="resume-preview-wrapper">
      {/* ─── LIVE PAGINATED A4 SHEETS ─── */}
      <div className="preview-pages" id="resume-preview-content">
        {paginatedPages.map((pageBlocks, pageIdx) => (
          <div
            key={pageIdx}
            className="preview-paper"
            style={{
              fontFamily: font,
              fontSize: bodySize,
              padding: `${margin}px`,
              lineHeight: lineHeight,
            }}
          >
            {/* Page number badge in the corner of the sheet */}
            <div className="cviq-page-number-indicator">
              Page {pageIdx + 1} of {paginatedPages.length}
            </div>

            {pageBlocks.map((block, blockIdx) => {
              if (block.type === "header") {
                return (
                  <div key={blockIdx} className="resume-header" style={{ textAlign: isCenter ? "center" : "left" }}>
                    <h1 className="resume-name" style={{ fontSize: nameSize, fontFamily: font, fontWeight: 700, color: "#191918" }}>
                      {profile.fullName || "Your Name"}
                    </h1>
                    {profile.jobTitle && (
                      <p className="resume-jobtitle" style={{ fontSize: "11pt", fontFamily: font, color: accent }}>
                        {profile.jobTitle}
                      </p>
                    )}
                    <div className="resume-contact" style={{ justifyContent: isCenter ? "center" : "flex-start" }}>
                      {[profile.email, profile.phone, profile.location].filter(Boolean).map((c, i, arr) => (
                        <span key={i}>{c}{i < arr.length - 1 ? <span className="resume-contact__sep"> | </span> : ""}</span>
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
                );
              }

              if (block.type === "section_title") {
                return (
                  <div key={blockIdx} className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
                    <h2 style={hStyle()}>{block.title}</h2>
                  </div>
                );
              }

              if (block.type === "entry") {
                if (block.section === "experience") {
                  const exp = experience.find(e => e.id === block.id);
                  if (!exp) return null;
                  return (
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
                  );
                }

                if (block.section === "education") {
                  const edu = education.find(e => e.id === block.id);
                  if (!edu) return null;
                  return (
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
                  );
                }

                if (block.section === "certificates") {
                  const c = certificates.find(item => item.id === block.id);
                  if (!c) return null;
                  return (
                    <div className="resume-cert" key={c.id}>
                      <span className="resume-cert__name">{c.name}</span>
                      {c.issuer && <span className="resume-cert__issuer"> — {c.issuer}</span>}
                      {c.date && <span className="resume-cert__date"> ({c.date})</span>}
                    </div>
                  );
                }
              }

              if (block.type === "full_section") {
                if (block.section === "skills") {
                  return (
                    <div key={blockIdx} className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
                      <h2 style={hStyle()}>{block.title}</h2>
                      <p className="resume-skills">{skills.join("  •  ")}</p>
                    </div>
                  );
                }
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {/* ─── HIDDEN SANDBOX FOR REAL-TIME MEASUREMENTS ─── */}
      <div
        ref={sandboxRef}
        className="cviq-sandbox"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: `${A4_W}px`,
          padding: `${margin}px`,
          fontFamily: font,
          fontSize: bodySize,
          lineHeight: lineHeight,
          visibility: "hidden",
        }}
      >
        {/* Header */}
        <div id="sandbox-header" className="resume-header" style={{ textAlign: isCenter ? "center" : "left" }}>
          <h1 className="resume-name" style={{ fontSize: nameSize, fontFamily: font, fontWeight: 700, color: "#191918" }}>
            {profile.fullName || "Your Name"}
          </h1>
          {profile.jobTitle && (
            <p className="resume-jobtitle" style={{ fontSize: "11pt", fontFamily: font, color: accent }}>
              {profile.jobTitle}
            </p>
          )}
          <div className="resume-contact" style={{ justifyContent: isCenter ? "center" : "flex-start" }}>
            {[profile.email, profile.phone, profile.location].filter(Boolean).map((c, i, arr) => (
              <span key={i}>{c}{i < arr.length - 1 ? " | " : ""}</span>
            ))}
          </div>
          <div style={{ height: "1px", background: `${accent}30`, marginTop: "10px" }}></div>
        </div>

        {/* Experience */}
        {experience.length > 0 && experience.some(e => e.role || e.company) && (
          <div id="sandbox-section-experience" className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
            <h2 id="sandbox-section-experience-title" style={hStyle()}>Professional Experience</h2>
            {experience.filter(e => e.role || e.company).map((exp) => (
              <div key={exp.id} className="sandbox-entry-experience" data-id={exp.id} style={{ marginBottom: `${entryGap}px` }}>
                <div className="resume-entry__top">
                  <div>
                    <div className="resume-entry__role">{exp.role || "Role"}</div>
                    <div className="resume-entry__company">{exp.company || "Company"}</div>
                  </div>
                  <div className="resume-entry__date">{exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ""}</div>
                </div>
                {exp.description && (
                  <ul className="resume-entry__bullets">
                    {exp.description.split("\n").filter(Boolean).map((line, idx) => (
                      <li key={idx}>{line.replace(/^[•\-–*]\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education.some(e => e.degree || e.institution) && (
          <div id="sandbox-section-education" className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
            <h2 id="sandbox-section-education-title" style={hStyle()}>Education</h2>
            {education.filter(e => e.degree || e.institution).map((edu) => (
              <div key={edu.id} className="sandbox-entry-education" data-id={edu.id} style={{ marginBottom: `${entryGap}px` }}>
                <div className="resume-entry__top">
                  <div>
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

        {/* Skills */}
        {skills.length > 0 && (
          <div id="sandbox-section-skills" className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
            <h2 id="sandbox-section-skills-title" style={hStyle()}>Skills</h2>
            <p className="resume-skills">{skills.join("  •  ")}</p>
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && certificates.some(c => c.name) && (
          <div id="sandbox-section-certificates" className="resume-section" style={{ marginTop: `${sectionGap}px` }}>
            <h2 id="sandbox-section-certificates-title" style={hStyle()}>Certifications</h2>
            {certificates.filter(c => c.name).map((c) => (
              <div key={c.id} className="sandbox-entry-certificate" data-id={c.id}>
                <span className="resume-cert__name">{c.name}</span>
                {c.issuer && <span> — {c.issuer}</span>}
                {c.date && <span> ({c.date})</span>}
              </div>
            ))}
          </div>
        )}
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
          width: ${A4_W}px; height: ${A4_H}px; min-height: ${A4_H}px; background: #ffffff;
          border-radius: 4px;
          box-shadow: 0 8px 30px rgba(25,25,24,0.06), 0 1px 3px rgba(25,25,24,0.02);
          color: #191918; overflow: hidden;
          position: relative;
          transition: box-shadow var(--transition-base);
        }
        .preview-paper:hover {
          box-shadow: 0 12px 40px rgba(25,25,24,0.1);
        }
        .cviq-page-number-indicator {
          position: absolute;
          top: 14px;
          right: 18px;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 500;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          user-select: none;
          pointer-events: none;
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
