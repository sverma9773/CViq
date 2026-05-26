"use client";

import { useState, useRef } from "react";
import SidebarSection from "./SidebarSection";
import { useResume } from "../../context/ResumeContext";
import { parseResumeText, extractTextFromPDF, extractTextFromDOCX } from "../../lib/resumeParser";
import ProfileForm from "./ProfileForm";
import ProfileSummaryForm from "./ProfileSummaryForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import SkillsForm from "./SkillsForm";
import CertificatesForm from "./CertificatesForm";
import AIRewriteModal from "./AIRewriteModal";
import {
  ClaudeProfileIcon,
  ClaudeSummaryIcon,
  ClaudeEducationIcon,
  ClaudeExperienceIcon,
  ClaudeSkillsIcon,
  ClaudeCertificateIcon,
} from "../../components/ClaudeIcon";

export default function Sidebar() {
  const [openSection, setOpenSection] = useState("Profile");
  // AI Modal removed for now
  
  const { dispatch } = useResume();
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    try {
      let text = "";
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        text = await extractTextFromPDF(file);
      } else if (ext === "docx" || ext === "doc") {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
      }
      if (!text || text.trim().length < 10) {
        throw new Error("Could not extract text from the file.");
      }
      const parsed = parseResumeText(text);
      if (!parsed) throw new Error("Could not structure the resume data.");
      
      dispatch({ type: "SET_ALL", payload: parsed });
    } catch (err) {
      setImportError(err.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="sidebar" id="editor-sidebar">
      {/* ── Import Resume CTA ──────────────────────────────── */}
      <div className="import-cta-wrap">
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".pdf,.docx,.doc" 
          onChange={handleFileImport} 
          style={{ display: 'none' }} 
        />
        <button
          className="import-cta-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          <span className="import-cta-content">
            <span className="import-cta-icon-wrap">
              {importing ? (
                <span className="spinner"></span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M12 4v12M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="import-cta-text">
              <span className="import-cta-label">{importing ? "Parsing Document..." : "Import Resume/CV"}</span>
            </span>
          </span>
        </button>
        {importError && <div className="import-error-msg">{importError}</div>}
      </div>

      <SidebarSection title="Profile" icon={<ClaudeProfileIcon size={17} color="#da7756" />} isOpen={openSection === "Profile"} onToggle={() => handleToggle("Profile")}>
        <ProfileForm />
      </SidebarSection>

      <SidebarSection title="Profile Summary" icon={<ClaudeSummaryIcon size={17} color="#da7756" />} isOpen={openSection === "Profile Summary"} onToggle={() => handleToggle("Profile Summary")}>
        <ProfileSummaryForm />
      </SidebarSection>

      <SidebarSection title="Education" icon={<ClaudeEducationIcon size={17} color="#da7756" />} isOpen={openSection === "Education"} onToggle={() => handleToggle("Education")}>
        <EducationForm />
      </SidebarSection>

      <SidebarSection title="Professional Experience" icon={<ClaudeExperienceIcon size={17} color="#da7756" />} isOpen={openSection === "Professional Experience"} onToggle={() => handleToggle("Professional Experience")}>
        <ExperienceForm />
      </SidebarSection>

      <SidebarSection title="Skills" icon={<ClaudeSkillsIcon size={17} color="#da7756" />} isOpen={openSection === "Skills"} onToggle={() => handleToggle("Skills")}>
        <SkillsForm />
      </SidebarSection>

      <SidebarSection title="Certificates" icon={<ClaudeCertificateIcon size={17} color="#da7756" />} isOpen={openSection === "Certificates"} onToggle={() => handleToggle("Certificates")}>
        <CertificatesForm />
      </SidebarSection>


      <style jsx>{`
        .sidebar {
          width: 360px;
          min-width: 360px;
          height: 100%;
          overflow-y: auto;
          background: var(--color-bg);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
        }

        /* ── Import CTA Button ─────────────────────────────────── */
        .import-cta-wrap {
          padding: 14px 16px 6px;
        }

        .import-cta-btn {
          position: relative;
          width: 100%;
          border: 1px solid #191918;
          border-radius: var(--radius-full);
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          background: #191918;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(25, 25, 24, 0.08);
        }

        .import-cta-btn:hover:not(:disabled) {
          background: #2d2d2b;
          border-color: #2d2d2b;
          transform: translateY(-0.5px);
          box-shadow: 0 6px 16px rgba(25, 25, 24, 0.14);
        }

        .import-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .import-cta-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
        }

        .import-cta-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .import-cta-text {
          display: flex;
          align-items: center;
        }

        .import-cta-label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
        }

        .import-error-msg {
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 6px;
          text-align: center;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ── Keyframes ─────────────────────────────────────── */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            min-width: 100%;
            max-height: none;
            height: 100%;
            border-right: none;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 72px;
          }

          .import-cta-wrap {
            padding: 12px 12px 4px;
          }
        }
      `}</style>
    </aside>
  );
}
