"use client";

import { useState } from "react";
import SidebarSection from "../../editor/components/SidebarSection";
import SenderProfileForm from "./SenderProfileForm";
import RecipientForm from "./RecipientForm";
import LetterDetailsForm from "./LetterDetailsForm";
import {
  ClaudeProfileIcon,
  ClaudeExperienceIcon,
  ClaudeFileIcon,
} from "../../components/ClaudeIcon";

export default function CoverLetterSidebar() {
  const [openSection, setOpenSection] = useState("Sender Details");

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="sidebar" id="cover-letter-sidebar">
      <SidebarSection
        title="Sender Details"
        icon={<ClaudeProfileIcon size={17} color="#da7756" />}
        isOpen={openSection === "Sender Details"}
        onToggle={() => handleToggle("Sender Details")}
      >
        <SenderProfileForm />
      </SidebarSection>

      <SidebarSection
        title="Recipient Details"
        icon={<ClaudeExperienceIcon size={17} color="#da7756" />}
        isOpen={openSection === "Recipient Details"}
        onToggle={() => handleToggle("Recipient Details")}
      >
        <RecipientForm />
      </SidebarSection>

      <SidebarSection
        title="Letter Body & Text"
        icon={<ClaudeFileIcon size={17} color="#da7756" />}
        isOpen={openSection === "Letter Body & Text"}
        onToggle={() => handleToggle("Letter Body & Text")}
      >
        <LetterDetailsForm />
      </SidebarSection>

      <style jsx>{`
        .sidebar {
          width: 380px;
          min-width: 380px;
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
