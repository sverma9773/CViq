"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ClaudeIcon, { ClaudeDownload, ClaudeCheck, ClaudeSparkleSmall, ClaudeFileIcon } from "../../components/ClaudeIcon";
import { useResume } from "../../context/ResumeContext";
import { renameResume } from "../../lib/resumeStore";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function EditorTopBar({ activeTab, onTabChange, resumeId, resumeName, setResumeName, isUnlocked, highestStep }) {
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(resumeName || "Resume");
  const dropdownRef = useRef(null);
  const { resumeData } = useResume();
  const { user } = useAuth();

  useEffect(() => { setRenameValue(resumeName); }, [resumeName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (trimmed && resumeId) {
      renameResume(resumeId, trimmed);
      setResumeName(trimmed);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "resumes", resumeId);
          await setDoc(docRef, { name: trimmed }, { merge: true });
          console.log("[Rename] Synced to Firestore.");
        } catch (e) {
          console.error("[Rename] Failed to sync to Firestore:", e);
        }
      }
    } else {
      setRenameValue(resumeName);
    }
    setIsRenaming(false);
  };

  const getFileName = (ext) => {
    const base = resumeName || resumeData.profile.fullName || "Resume";
    return `${base.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")}.${ext}`;
  };



  const handleDownloadPDF = async () => {
    setExporting(true);
    setExportOpen(false);

    // Target the paper element directly (the A4 resume content)
    const paperEl = document.querySelector(".preview-paper");
    if (!paperEl) {
      alert("Resume preview not found. Please switch to the Resume tab first.");
      setExporting(false);
      return;
    }

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Temporarily remove rounded corners for clean PDF capture
      const origRadius = paperEl.style.borderRadius;
      const origShadow = paperEl.style.boxShadow;
      paperEl.style.borderRadius = "0";
      paperEl.style.boxShadow = "none";

      // Make wrapper fully visible for capture
      const wrapper = document.getElementById("resume-preview-wrapper");
      const origOverflow = wrapper?.style.overflow;
      const origHeight = wrapper?.style.height;
      if (wrapper) { wrapper.style.overflow = "visible"; wrapper.style.height = "auto"; }

      const canvas = await html2canvas(paperEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Restore styles
      paperEl.style.borderRadius = origRadius;
      paperEl.style.boxShadow = origShadow;
      if (wrapper) { wrapper.style.overflow = origOverflow; wrapper.style.height = origHeight; }

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfH = pdf.internal.pageSize.getHeight(); // 297mm
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const scaledH = imgH * ratio;

      if (scaledH <= pdfH) {
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfW, scaledH);
      } else {
        // Multi-page: slice canvas at A4 page boundaries
        const pageHeightPx = pdfH / ratio;
        let yPx = 0;
        let pageNum = 0;

        while (yPx < imgH) {
          const sliceH = Math.min(pageHeightPx, imgH - yPx);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = imgW;
          pageCanvas.height = sliceH;
          const ctx = pageCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, imgW, sliceH);
          ctx.drawImage(canvas, 0, yPx, imgW, sliceH, 0, 0, imgW, sliceH);

          if (pageNum > 0) pdf.addPage();
          pdf.addImage(pageCanvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfW, sliceH * ratio);

          yPx += pageHeightPx;
          pageNum++;
        }
      }

      pdf.save(getFileName("pdf"));
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadWord = async () => {
    setExporting(true);
    setExportOpen(false);

    try {
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType, TabStopPosition, TabStopType } = docx;
      const { saveAs } = await import("file-saver");

      const { profile, education, experience, skills, certificates } = resumeData;

      const children = [];

      // Name
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: profile.fullName || "Your Name", bold: true, size: 32, font: "Georgia" }),
          ],
        })
      );

      // Job title
      if (profile.jobTitle) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: profile.jobTitle, italics: true, size: 22, color: "da7756", font: "Georgia" }),
            ],
          })
        );
      }

      // Contact info
      const contactParts = [profile.email, profile.phone, profile.location].filter(Boolean);
      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: contactParts.join("  |  "), size: 18, color: "666660", font: "Calibri" }),
            ],
          })
        );
      }

      // Horizontal line
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 4 } },
          children: [],
        })
      );

      // Experience
      if (experience.length > 0 && experience.some(e => e.role || e.company)) {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 100 },
            border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 3 } },
            children: [
              new TextRun({ text: "PROFESSIONAL EXPERIENCE", bold: true, size: 22, font: "Calibri", color: "191918" }),
            ],
          })
        );

        experience.forEach((exp) => {
          if (!exp.role && !exp.company) return;

          children.push(
            new Paragraph({
              spacing: { before: 100 },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                new TextRun({ text: exp.role || "Role", bold: true, size: 21, font: "Calibri" }),
                new TextRun({ text: `\t${exp.startDate || ""} — ${exp.endDate || ""}`, size: 18, color: "999999", font: "Calibri" }),
              ],
            })
          );

          children.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: exp.company || "", italics: true, size: 20, color: "666660", font: "Calibri" }),
              ],
            })
          );

          if (exp.description) {
            exp.description.split("\n").filter(Boolean).forEach((line) => {
              children.push(
                new Paragraph({
                  spacing: { after: 30 },
                  children: [
                    new TextRun({ text: `• ${line.replace(/^[•\-]\s*/, "")}`, size: 19, color: "444444", font: "Calibri" }),
                  ],
                })
              );
            });
          }
        });
      }

      // Education
      if (education.length > 0 && education.some(e => e.degree || e.institution)) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 3 } },
            children: [
              new TextRun({ text: "EDUCATION", bold: true, size: 22, font: "Calibri", color: "191918" }),
            ],
          })
        );

        education.forEach((edu) => {
          if (!edu.degree && !edu.institution) return;
          children.push(
            new Paragraph({
              spacing: { before: 80 },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                new TextRun({ text: edu.degree || "Degree", bold: true, size: 21, font: "Calibri" }),
                new TextRun({ text: `\t${edu.startDate || ""} — ${edu.endDate || ""}`, size: 18, color: "999999", font: "Calibri" }),
              ],
            })
          );
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: edu.institution || "", italics: true, size: 20, color: "666660", font: "Calibri" }),
              ],
            })
          );
          if (edu.description) {
            children.push(
              new Paragraph({
                spacing: { after: 30 },
                children: [new TextRun({ text: edu.description, size: 19, color: "444444", font: "Calibri" })],
              })
            );
          }
        });
      }

      // Skills
      if (skills.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 3 } },
            children: [
              new TextRun({ text: "SKILLS", bold: true, size: 22, font: "Calibri", color: "191918" }),
            ],
          })
        );
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: skills.join("  •  "), size: 19, color: "444444", font: "Calibri" })],
          })
        );
      }

      // Certificates
      if (certificates.length > 0 && certificates.some(c => c.name)) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 3 } },
            children: [
              new TextRun({ text: "CERTIFICATES", bold: true, size: 22, font: "Calibri", color: "191918" }),
            ],
          })
        );

        certificates.filter(c => c.name).forEach((cert) => {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({ text: cert.name, bold: true, size: 19, font: "Calibri" }),
                new TextRun({ text: cert.issuer ? ` — ${cert.issuer}` : "", size: 19, color: "666660", font: "Calibri" }),
                new TextRun({ text: cert.date ? ` (${cert.date})` : "", size: 18, color: "999999", font: "Calibri" }),
              ],
            })
          );
        });
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, getFileName("docx"));
    } catch (err) {
      console.error("Word generation failed:", err);
      alert("Word export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="topbar" id="editor-topbar">
      <div className="topbar__left">
        <Link href="/dashboard" className="topbar__logo" id="editor-logo">
          <ClaudeIcon size={16} color="#da7756" />
          <span className="logo-title-wrap">
            <span className="logo-brand">CViq</span>
            <span className="logo-separator">|</span>
            <span className="logo-tagline">Resume Maker</span>
          </span>
        </Link>

        <div className="topbar__separator"></div>

        {/* Editable resume name */}
        {isRenaming ? (
          <input
            className="topbar__rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") { setRenameValue(resumeName); setIsRenaming(false); } }}
            autoFocus
          />
        ) : (
          <button className="topbar__resume-name" onClick={() => setIsRenaming(true)} title="Click to rename">
            {resumeName}
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{opacity: 0.4}}>
              <path d="M10 1.5l2.5 2.5-7.5 7.5H2.5V9l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="topbar__tabs">
        {[
          { key: "resume", label: "Step 1: Content", mobileLabel: "Content", step: 1 },
          { key: "customize", label: "Step 2: Customize", mobileLabel: "Style", step: 2 },
          { key: "ats-check", label: "Step 3: ATS Check", mobileLabel: "ATS", step: 3 },
        ].map(({ key, label, mobileLabel, step }) => (
          <button
            key={key}
            className={`topbar__tab ${activeTab === key ? "topbar__tab--active" : ""}`}
            onClick={() => onTabChange(key)}
            id={`tab-${key}`}
          >
            {step < 3 ? (
              <ClaudeCheck size={10} color={activeTab === key ? "#191918" : "#9b9b94"} />
            ) : (
              <ClaudeSparkleSmall size={10} color={activeTab === key ? "#da7756" : "#9b9b94"} />
            )}
            <span className="topbar__tab-label-full">{label}</span>
            <span className="topbar__tab-label-short">{mobileLabel}</span>
          </button>
        ))}
      </div>

      <div className="topbar__right">
        <div className="topbar__badge">
          <ClaudeCheck size={13} color="#5a8a3c" />
          <span>ATS Ready</span>
        </div>

        <div className="topbar__export-wrap" ref={dropdownRef}>
          <button
            className={`topbar__download ${!isUnlocked ? "topbar__download--locked" : ""}`}
            onClick={() => {
              if (isUnlocked) setExportOpen(!exportOpen);
              else onTabChange("ats-check");
            }}
            disabled={exporting}
            id="download-btn"
          >
            {exporting ? (
              <span className="topbar__spinner"></span>
            ) : !isUnlocked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ) : (
              <ClaudeDownload size={15} color="#fff" />
            )}
            {exporting ? "Exporting..." : !isUnlocked ? "Unlock Download" : "Download"}
            {isUnlocked && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft: '2px'}}>
                <path d="M2.5 4L5 6.5L7.5 4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {exportOpen && (
            <div className="topbar__dropdown">
              <button className="topbar__dropdown-item" onClick={handleDownloadPDF} id="export-pdf">
                <ClaudeDownload size={15} color="#da7756" />
                <div className="topbar__dropdown-text">
                  <span className="topbar__dropdown-label">Download as PDF</span>
                  <span className="topbar__dropdown-desc">High-quality, print-ready format</span>
                </div>
              </button>
              <button className="topbar__dropdown-item" onClick={handleDownloadWord} id="export-word">
                <ClaudeFileIcon size={15} color="#4285f4" />
                <div className="topbar__dropdown-text">
                  <span className="topbar__dropdown-label">Download as Word</span>
                  <span className="topbar__dropdown-desc">Editable .docx document</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 20px;
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .topbar__left { display: flex; align-items: center; gap: 10px; }

        .topbar__logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--color-text);
        }

        .logo-title-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .logo-brand {
          font-weight: 600;
          color: var(--color-text);
        }

        .logo-separator {
          color: var(--color-border);
          font-weight: 300;
          font-size: 0.8rem;
        }

        .logo-tagline {
          font-weight: 400;
          font-size: 0.78rem;
          color: var(--color-text-secondary);
        }

        .topbar__separator {
          width: 1px; height: 20px; background: var(--color-border);
        }

        .topbar__resume-name {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--font-body); font-size: 0.82rem;
          font-weight: 500; color: var(--color-text-secondary);
          background: none; border: none; cursor: pointer;
          padding: 4px 8px; border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .topbar__resume-name:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
        }

        .topbar__rename-input {
          font-family: var(--font-body); font-size: 0.82rem;
          font-weight: 500; color: var(--color-text);
          border: 1px solid var(--color-accent);
          border-radius: var(--radius-md);
          padding: 4px 8px; width: 180px; outline: none;
          background: var(--color-bg);
        }

        .topbar__tabs {
          display: flex; align-items: center; gap: 0;
          background: var(--color-bg-offwhite); border: 1px solid var(--color-border);
          border-radius: var(--radius-full); padding: 3px;
        }

        .topbar__tab {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 16px; font-family: var(--font-body);
          font-size: 0.78rem; font-weight: 500;
          color: var(--color-text-tertiary); background: none;
          border: none; border-radius: var(--radius-full);
          cursor: pointer; transition: all var(--transition-fast);
        }

        .topbar__tab:hover { color: var(--color-text-secondary); }

        .topbar__tab--active {
          background: var(--color-bg); color: var(--color-text);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .topbar__right { display: flex; align-items: center; gap: 12px; }

        .topbar__badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.78rem; font-weight: 500; color: var(--color-text-secondary);
        }

        .topbar__export-wrap { position: relative; }

        .topbar__download {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 16px; background: var(--color-btn-dark); color: #fff;
          border: none; border-radius: var(--radius-full);
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: background var(--transition-fast);
        }

        .topbar__download:hover { background: var(--color-btn-dark-hover); }
        .topbar__download:disabled { opacity: 0.7; cursor: wait; }
        
        .topbar__download--locked {
          background: #da7756;
        }
        .topbar__download--locked:hover {
          background: #c4633f;
        }

        .topbar__spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .topbar__dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          min-width: 240px; background: var(--color-bg);
          border: 1px solid var(--color-border); border-radius: var(--radius-lg);
          overflow: hidden; box-shadow: 0 8px 24px rgba(25,25,24,0.1);
          z-index: 100; animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .topbar__dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 12px 14px;
          background: none; border: none; cursor: pointer;
          transition: background var(--transition-fast);
          text-align: left;
        }

        .topbar__dropdown-item:hover { background: var(--color-bg-offwhite); }

        .topbar__dropdown-item:not(:last-child) {
          border-bottom: 1px solid var(--color-border-light);
        }

        .topbar__dropdown-text { display: flex; flex-direction: column; }

        .topbar__dropdown-label {
          font-family: var(--font-body); font-size: 0.82rem;
          font-weight: 600; color: var(--color-text);
        }

        .topbar__dropdown-desc {
          font-size: 0.72rem; color: var(--color-text-tertiary);
        }

        .topbar__tab-label-short { display: none; }

        @media (max-width: 768px) {
          .topbar__badge, .topbar__separator, .topbar__resume-name { display: none; }
          .topbar__tabs { padding: 2px; }
          .topbar__tab { padding: 6px 10px; font-size: 0.72rem; min-height: 36px; }
          .topbar__tab-label-full { display: none; }
          .topbar__tab-label-short { display: inline; }

          /* Hide logo tagline on mobile */
          .logo-tagline, .logo-separator { display: none; }
          .logo-title-wrap { font-size: 0.9rem; }

          /* Compact download button */
          .topbar__download { padding: 7px 12px; font-size: 0.75rem; }
          .topbar__export-wrap { position: relative; }
          .topbar__dropdown { right: 0; min-width: 200px; }

          .topbar { height: 48px; padding: 0 12px; }
          .topbar__left { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
