"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ClaudeIcon, { ClaudeDownload, ClaudeCheck, ClaudeSparkleSmall, ClaudeFileIcon } from "../../components/ClaudeIcon";
import { useCoverLetter } from "../../context/CoverLetterContext";
import { renameCoverLetter } from "../../lib/coverLetterStore";

export default function CoverLetterTopBar({ activeTab, onTabChange, letterId, letterName, setLetterName }) {
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(letterName || "Cover Letter");
  const dropdownRef = useRef(null);
  const { coverLetterData } = useCoverLetter();

  useEffect(() => { setRenameValue(letterName); }, [letterName]);

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

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && letterId) {
      renameCoverLetter(letterId, trimmed);
      setLetterName(trimmed);
    } else {
      setRenameValue(letterName);
    }
    setIsRenaming(false);
  };

  const getFileName = (ext) => {
    const base = letterName || coverLetterData.profile.fullName || "Cover_Letter";
    return `${base.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")}.${ext}`;
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    setExportOpen(false);

    // Target the A4 paper element directly
    const paperEl = document.querySelector(".preview-paper");
    if (!paperEl) {
      alert("Cover Letter preview not found.");
      setExporting(false);
      return;
    }

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const origRadius = paperEl.style.borderRadius;
      const origShadow = paperEl.style.boxShadow;
      paperEl.style.borderRadius = "0";
      paperEl.style.boxShadow = "none";

      const canvas = await html2canvas(paperEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      paperEl.style.borderRadius = origRadius;
      paperEl.style.boxShadow = origShadow;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const scaledH = imgH * ratio;

      // Use lossless JPEG render to bypass wrong PNG signature bugs
      pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfW, Math.min(scaledH, pdfH));

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
      const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } = docx;
      const { saveAs } = await import("file-saver");

      const { profile, recipient, letterDetails } = coverLetterData;
      const children = [];

      // Name & Job Title
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: profile.fullName || "Your Name", bold: true, size: 32, font: "Georgia" }),
          ],
        })
      );

      if (profile.jobTitle) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: profile.jobTitle, size: 22, color: "da7756", font: "Georgia", bold: true }),
            ],
          })
        );
      }

      // Contact Info
      const contactParts = [profile.email, profile.phone, profile.location].filter(Boolean);
      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
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
          spacing: { after: 240 },
          border: { bottom: { color: "cccccc", size: 1, style: BorderStyle.SINGLE, space: 4 } },
          children: [],
        })
      );

      // Date
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: letterDetails.date || new Date().toLocaleDateString("en-US"), size: 20, font: "Calibri" }),
          ],
        })
      );

      // Recipient
      if (recipient.name || recipient.company) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: recipient.name || "", bold: true, size: 20, font: "Calibri" }),
            ],
          })
        );
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: recipient.company || "", size: 20, font: "Calibri" }),
            ],
          })
        );
        if (recipient.address) {
          recipient.address.split("\n").filter(Boolean).forEach((line) => {
            children.push(
              new Paragraph({
                spacing: { after: 30 },
                children: [
                  new TextRun({ text: line, size: 19, color: "666660", font: "Calibri" }),
                ],
              })
            );
          });
        }
      }

      // Subject
      if (letterDetails.subject) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({ text: `SUBJECT: ${letterDetails.subject.toUpperCase()}`, bold: true, size: 20, font: "Calibri", color: "da7756" }),
            ],
          })
        );
      }

      // Salutation
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 120 },
          children: [
            new TextRun({ text: letterDetails.salutation || "Dear Hiring Manager,", bold: true, size: 20, font: "Calibri" }),
          ],
        })
      );

      // Body Paragraphs
      if (letterDetails.body) {
        letterDetails.body.split("\n\n").filter(Boolean).forEach((para) => {
          children.push(
            new Paragraph({
              spacing: { after: 140 },
              children: [
                new TextRun({ text: para, size: 20, font: "Calibri", lineHeight: 1.4 }),
              ],
            })
          );
        });
      }

      // Sign-off
      if (letterDetails.signOff) {
        children.push(
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({ text: letterDetails.signOff, size: 20, font: "Calibri" }),
            ],
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
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
    <div className="topbar" id="cover-letter-topbar">
      <div className="topbar__left">
        <Link href="/dashboard" className="topbar__logo">
          <span className="logo-title-wrap">
            <span className="logo-brand">CViq</span>
            <span className="logo-separator">|</span>
            <span className="logo-tagline">Resume Maker</span>
          </span>
        </Link>

        <div className="topbar__separator"></div>

        {isRenaming ? (
          <input
            className="topbar__rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") { setRenameValue(letterName); setIsRenaming(false); } }}
            autoFocus
          />
        ) : (
          <button className="topbar__resume-name" onClick={() => setIsRenaming(true)} title="Click to rename">
            {letterName}
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{opacity: 0.4}}>
              <path d="M10 1.5l2.5 2.5-7.5 7.5H2.5V9l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="topbar__tabs">
        {[
          { key: "letter", label: "Step 1: Content", mobileLabel: "Content", step: 1 },
          { key: "customize", label: "Step 2: Customize", mobileLabel: "Style", step: 2 },
        ].map(({ key, label, mobileLabel, step }) => (
          <button
            key={key}
            className={`topbar__tab ${activeTab === key ? "topbar__tab--active" : ""}`}
            onClick={() => onTabChange(key)}
          >
            {step === 1 ? (
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
        <div className="topbar__export-wrap" ref={dropdownRef}>
          <button
            className="topbar__download"
            onClick={() => setExportOpen(!exportOpen)}
            disabled={exporting}
          >
            {exporting ? (
              <span className="topbar__spinner"></span>
            ) : (
              <ClaudeDownload size={15} color="#fff" />
            )}
            {exporting ? "Exporting..." : "Download"}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft: '2px'}}>
              <path d="M2.5 4L5 6.5L7.5 4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {exportOpen && (
            <div className="topbar__dropdown">
              <button className="topbar__dropdown-item" onClick={handleDownloadPDF}>
                <ClaudeDownload size={15} color="#da7756" />
                <div className="topbar__dropdown-text">
                  <span className="topbar__dropdown-label">Download as PDF</span>
                  <span className="topbar__dropdown-desc">High-quality print format</span>
                </div>
              </button>
              <button className="topbar__dropdown-item" onClick={handleDownloadWord}>
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
          .topbar__separator, .topbar__resume-name { display: none; }
          .topbar__tabs { padding: 2px; }
          .topbar__tab { padding: 6px 10px; font-size: 0.72rem; min-height: 36px; }
          .topbar__tab-label-full { display: none; }
          .topbar__tab-label-short { display: inline; }

          .logo-tagline, .logo-separator { display: none; }
          .logo-title-wrap { font-size: 0.9rem; }

          .topbar__download { padding: 7px 12px; font-size: 0.75rem; }
          .topbar__dropdown { right: 0; min-width: 200px; }

          .topbar { height: 48px; padding: 0 12px; }
          .topbar__left { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
