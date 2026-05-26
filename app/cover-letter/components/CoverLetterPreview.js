"use client";

import { useCoverLetter } from "../../context/CoverLetterContext";
import { getTemplate } from "../../lib/templates";

const A4_W = 794;
const A4_H = 1123;

const MARGIN_MAP = { narrow: 36, normal: 54, wide: 72 };
const LINE_HEIGHT_MAP = { compact: 1.3, normal: 1.45, relaxed: 1.65 };

export default function CoverLetterPreview() {
  const { coverLetterData } = useCoverLetter();
  const tplId = coverLetterData.template || "classic";
  const tpl = getTemplate(tplId);
  const cs = coverLetterData.customStyle || {};

  // Styles
  const font = cs.font || tpl.font;
  const nameSize = cs.nameSize || tpl.nameSize;
  const bodySize = cs.bodySize || tpl.bodySize;
  const accent = cs.accent || tpl.accent;
  const margins = cs.margins || "normal";
  const spacing = cs.spacing || "normal";

  const margin = MARGIN_MAP[margins];
  const lineHeight = LINE_HEIGHT_MAP[spacing];

  const { profile, recipient, letterDetails } = coverLetterData;

  const headerAlign = cs.headerAlign || tpl.headerAlign || "left";
  const isCenter = headerAlign === "center";

  return (
    <div className="preview-container">
      <div
        className="preview-paper"
        style={{
          width: `${A4_W}px`,
          minHeight: `${A4_H}px`,
          padding: `${margin}px`,
          fontFamily: font,
          fontSize: bodySize,
          lineHeight: lineHeight,
          color: "#191918",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Sender Info / Header */}
        <header
          style={{
            marginBottom: "30px",
            textAlign: isCenter ? "center" : "left",
            borderBottom: tpl.headerStyle === "border-bottom" ? `1px solid ${accent}` : "none",
            paddingBottom: tpl.headerStyle === "border-bottom" ? "12px" : "0",
          }}
        >
          <h1
            style={{
              fontSize: nameSize,
              fontWeight: 600,
              color: "#191918",
              marginBottom: "4px",
              letterSpacing: "-0.01em",
            }}
          >
            {profile.fullName || "Your Name"}
          </h1>
          {profile.jobTitle && (
            <div
              style={{
                fontSize: "12pt",
                color: accent,
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              {profile.jobTitle}
            </div>
          )}
          <div
            style={{
              fontSize: "9.5pt",
              color: "#666660",
              display: "flex",
              justifyContent: isCenter ? "center" : "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            {profile.email && <span>{profile.email}</span>}
            {profile.phone && <span>{profile.phone}</span>}
            {profile.location && <span>{profile.location}</span>}
          </div>
        </header>

        {/* Date */}
        <div style={{ marginBottom: "24px", color: "#191918", fontSize: "10.5pt" }}>
          {letterDetails.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>

        {/* Recipient Details */}
        {(recipient.name || recipient.company || recipient.address) && (
          <div style={{ marginBottom: "28px", fontSize: "10.5pt", color: "#191918", lineHeight: "1.4" }}>
            {recipient.name && <div style={{ fontWeight: 600 }}>{recipient.name}</div>}
            {recipient.company && <div>{recipient.company}</div>}
            {recipient.address && (
              <div style={{ whiteSpace: "pre-line", color: "#666660", marginTop: "2px" }}>
                {recipient.address}
              </div>
            )}
          </div>
        )}

        {/* Subject Line */}
        {letterDetails.subject && (
          <div
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "10pt",
              color: "#191918",
              marginBottom: "24px",
              borderLeft: `2px solid ${accent}`,
              paddingLeft: "8px",
            }}
          >
            {letterDetails.subject}
          </div>
        )}

        {/* Salutation */}
        <div style={{ marginBottom: "16px", fontWeight: 500 }}>
          {letterDetails.salutation || "Dear Hiring Manager,"}
        </div>

        {/* Body Text */}
        <div
          style={{
            whiteSpace: "pre-line",
            marginBottom: "32px",
            textAlign: "justify",
            fontSize: "10.5pt",
          }}
        >
          {letterDetails.body || "Please enter the body details of your cover letter."}
        </div>

        {/* Sign-off / Signature */}
        <div style={{ whiteSpace: "pre-line", marginTop: "24px", fontSize: "10.5pt", lineHeight: "1.4" }}>
          {letterDetails.signOff || "Sincerely,\nYour Name"}
        </div>
      </div>

      <style jsx>{`
        .preview-container {
          padding: 40px 20px;
          background: var(--color-bg-warm);
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          text-align: center;
        }

        .preview-paper {
          display: inline-block;
          text-align: left;
          margin: 0 auto;
          box-shadow: 0 12px 32px rgba(25,25,24,0.06), 0 2px 6px rgba(25,25,24,0.04);
          transition: all 0.2s ease;
        }

        @media (max-width: 768px) {
          .preview-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
