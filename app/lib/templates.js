/**
 * ATS-Friendly Resume Templates
 *
 * Research-based specifications (2024–2025 ATS best practices):
 * ─────────────────────────────────────────────────────────────
 * LAYOUT:     Single-column ONLY (multi-column confuses ATS parsers)
 * NAME:       18–22pt
 * HEADINGS:   12–14pt, bold, uppercase
 * BODY:       10–12pt (11pt is the "sweet spot")
 * FONTS:      Calibri, Arial, Georgia, Garamond, Times New Roman, Verdana
 * MARGINS:    0.5–1 inch (0.75 inch optimal = ~54px at 72dpi)
 * AVOID:      Tables, text boxes, images, icons, skill bars, headers/footers
 * BULLETS:    Simple round or hyphen only
 * SECTION ORDER: Contact → Summary → Experience → Education → Skills → Certs
 * FILE:       .docx or text-based PDF
 */

export const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean Calibri layout. The gold standard for ATS parsing.",
    font: "Calibri, sans-serif",
    nameSize: "20pt",
    headingSize: "13pt",
    bodySize: "10.5pt",
    accent: "#333333",
    headerStyle: "border-bottom",  // underline section headers
    headerAlign: "left",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Arial with subtle blue accents. Tech & corporate friendly.",
    font: "Arial, Helvetica, sans-serif",
    nameSize: "22pt",
    headingSize: "12pt",
    bodySize: "10.5pt",
    accent: "#2563eb",
    headerStyle: "border-bottom",
    headerAlign: "center",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Georgia serif typography. Ideal for finance, law & academia.",
    font: "Georgia, serif",
    nameSize: "20pt",
    headingSize: "12.5pt",
    bodySize: "10.5pt",
    accent: "#5c4033",
    headerStyle: "border-bottom",
    headerAlign: "center",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Maximum whitespace. Ultra-clean with zero distractions.",
    font: "Calibri, sans-serif",
    nameSize: "18pt",
    headingSize: "12pt",
    bodySize: "10.5pt",
    accent: "#666666",
    headerStyle: "uppercase-only",
    headerAlign: "left",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong visual hierarchy. Ideal for senior roles.",
    font: "Arial, Helvetica, sans-serif",
    nameSize: "22pt",
    headingSize: "13pt",
    bodySize: "11pt",
    accent: "#191918",
    headerStyle: "full-border",
    headerAlign: "left",
  },
  {
    id: "garamond",
    name: "Garamond",
    description: "Timeless Garamond serif. Perfect for consulting & executive.",
    font: "'EB Garamond', Garamond, serif",
    nameSize: "22pt",
    headingSize: "13pt",
    bodySize: "11pt",
    accent: "#4a4a4a",
    headerStyle: "border-bottom",
    headerAlign: "center",
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
