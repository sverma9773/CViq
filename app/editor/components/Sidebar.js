"use client";

import { useState } from "react";
import SidebarSection from "./SidebarSection";
import ProfileForm from "./ProfileForm";
import ProfileSummaryForm from "./ProfileSummaryForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import SkillsForm from "./SkillsForm";
import CertificatesForm from "./CertificatesForm";
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

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="sidebar" id="editor-sidebar">
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
        }
      `}</style>
    </aside>
  );
}
