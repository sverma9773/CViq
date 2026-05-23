"use client";

import { useState } from "react";
import SidebarSection from "./SidebarSection";
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
  const [showAIModal, setShowAIModal] = useState(false);

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="sidebar" id="editor-sidebar">
      {/* ── AI Rewrite CTA ──────────────────────────────── */}
      <div className="ai-cta-wrap">
        <button
          className="ai-cta-btn"
          id="ai-rewrite-button"
          onClick={() => setShowAIModal(true)}
        >
          <span className="ai-cta-glow"></span>
          <span className="ai-cta-content">
            <span className="ai-cta-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            <span className="ai-cta-text">
              <span className="ai-cta-label">AI Resume Rewriter</span>
              <span className="ai-cta-desc">Paste a job description &amp; optimize</span>
            </span>
            <span className="ai-cta-arrow">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </button>
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

      {/* AI Modal */}
      <AIRewriteModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

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

        /* ── AI CTA Button ─────────────────────────────────── */
        .ai-cta-wrap {
          padding: 14px 16px 6px;
        }

        .ai-cta-btn {
          position: relative;
          width: 100%;
          border: none;
          border-radius: var(--radius-lg);
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          background: linear-gradient(135deg, #191918 0%, #2d2d2b 50%, #3a3a37 100%);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow:
            0 2px 8px rgba(25, 25, 24, 0.15),
            0 0 0 1px rgba(218, 119, 86, 0.08);
        }

        .ai-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            0 6px 24px rgba(218, 119, 86, 0.25),
            0 0 0 1px rgba(218, 119, 86, 0.2);
        }

        .ai-cta-btn:active {
          transform: translateY(0);
        }

        /* Animated shimmer glow */
        .ai-cta-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(218, 119, 86, 0.12) 40%,
            rgba(218, 119, 86, 0.2) 50%,
            rgba(218, 119, 86, 0.12) 60%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: aiShimmer 3s ease infinite;
          pointer-events: none;
        }

        .ai-cta-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          z-index: 1;
        }

        .ai-cta-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #da7756 0%, #e8956f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          animation: aiCtaPulse 3s ease-in-out infinite;
        }

        .ai-cta-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          min-width: 0;
        }

        .ai-cta-label {
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.3;
        }

        .ai-cta-desc {
          font-family: var(--font-body);
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.3;
        }

        .ai-cta-arrow {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .ai-cta-btn:hover .ai-cta-arrow {
          color: var(--color-accent);
          transform: translateX(2px);
        }

        /* ── Keyframes ─────────────────────────────────────── */
        @keyframes aiShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes aiCtaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(218, 119, 86, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(218, 119, 86, 0); }
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

          .ai-cta-wrap {
            padding: 12px 12px 4px;
          }
        }
      `}</style>
    </aside>
  );
}
