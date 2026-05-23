"use client";

import { useResume } from "../../context/ResumeContext";
import { getTemplate } from "../../lib/templates";

const ATS_FONTS = [
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Garamond", value: "'EB Garamond', Garamond, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
];

const PRESET_COLORS = [
  "#333333", "#191918", "#2563eb", "#5c4033",
  "#666666", "#4a4a4a", "#0f766e", "#7c3aed",
  "#dc2626", "#ea580c", "#16a34a", "#0284c7",
];

const SIZE_OPTIONS = {
  nameSize: ["16pt", "18pt", "20pt", "22pt", "24pt"],
  headingSize: ["10pt", "11pt", "12pt", "13pt", "14pt"],
  bodySize: ["9pt", "9.5pt", "10pt", "10.5pt", "11pt", "11.5pt", "12pt"],
};

const SPACING_OPTIONS = [
  { label: "Compact", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Relaxed", value: "relaxed" },
];

const MARGIN_OPTIONS = [
  { label: "Narrow (0.5\")", value: "narrow" },
  { label: "Normal (0.75\")", value: "normal" },
  { label: "Wide (1\")", value: "wide" },
];

const HEADER_ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
];

const HEADING_STYLE_OPTIONS = [
  { label: "Underline", value: "border-bottom" },
  { label: "Bold Border", value: "full-border" },
  { label: "Text Only", value: "uppercase-only" },
];

export default function AdvancedCustomization() {
  const { resumeData, dispatch } = useResume();
  const tpl = getTemplate(resumeData.template || "classic");
  const cs = resumeData.customStyle || {};

  const update = (key, value) => {
    dispatch({ type: "SET_CUSTOM_STYLE", payload: { [key]: value } });
  };

  const resetAll = () => {
    dispatch({ type: "RESET_CUSTOM_STYLE" });
  };

  return (
    <div className="adv">
      <div className="adv__header">
        <h3 className="adv__title">Advanced Customization</h3>
        <button className="adv__reset" onClick={resetAll}>Reset to Default</button>
      </div>

      {/* ── Accent Color ────── */}
      <div className="adv__group">
        <label className="adv__label">Accent Color</label>
        <div className="adv__color-grid">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`adv__color-swatch ${(cs.accent || tpl.accent) === color ? "adv__color-swatch--active" : ""}`}
              style={{ background: color }}
              onClick={() => update("accent", color)}
              title={color}
            />
          ))}
          <label className="adv__color-custom" title="Custom color">
            <input
              type="color"
              value={cs.accent || tpl.accent}
              onChange={(e) => update("accent", e.target.value)}
            />
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3-8.5 8.5H3V10L11.5 1.5z" stroke="currentColor" strokeWidth="1.2"/></svg>
          </label>
        </div>
      </div>

      {/* ── Font Family ────── */}
      <div className="adv__group">
        <label className="adv__label">Font Family</label>
        <select
          className="adv__select"
          value={cs.font || tpl.font}
          onChange={(e) => update("font", e.target.value)}
        >
          {ATS_FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
        <span className="adv__hint">All fonts are ATS-compatible</span>
      </div>

      {/* ── Font Sizes ────── */}
      <div className="adv__group">
        <label className="adv__label">Name Size</label>
        <div className="adv__pills">
          {SIZE_OPTIONS.nameSize.map((s) => (
            <button
              key={s}
              className={`adv__pill ${(cs.nameSize || tpl.nameSize) === s ? "adv__pill--active" : ""}`}
              onClick={() => update("nameSize", s)}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="adv__group">
        <label className="adv__label">Heading Size</label>
        <div className="adv__pills">
          {SIZE_OPTIONS.headingSize.map((s) => (
            <button
              key={s}
              className={`adv__pill ${(cs.headingSize || tpl.headingSize) === s ? "adv__pill--active" : ""}`}
              onClick={() => update("headingSize", s)}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="adv__group">
        <label className="adv__label">Body Size</label>
        <div className="adv__pills">
          {SIZE_OPTIONS.bodySize.map((s) => (
            <button
              key={s}
              className={`adv__pill ${(cs.bodySize || tpl.bodySize) === s ? "adv__pill--active" : ""}`}
              onClick={() => update("bodySize", s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ── Header Alignment ────── */}
      <div className="adv__group">
        <label className="adv__label">Header Alignment</label>
        <div className="adv__pills">
          {HEADER_ALIGN_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`adv__pill ${(cs.headerAlign || tpl.headerAlign) === o.value ? "adv__pill--active" : ""}`}
              onClick={() => update("headerAlign", o.value)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* ── Heading Style ────── */}
      <div className="adv__group">
        <label className="adv__label">Section Heading Style</label>
        <div className="adv__pills">
          {HEADING_STYLE_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`adv__pill ${(cs.headerStyle || tpl.headerStyle) === o.value ? "adv__pill--active" : ""}`}
              onClick={() => update("headerStyle", o.value)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* ── Line Spacing ────── */}
      <div className="adv__group">
        <label className="adv__label">Line Spacing</label>
        <div className="adv__pills">
          {SPACING_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`adv__pill ${(cs.spacing || "normal") === o.value ? "adv__pill--active" : ""}`}
              onClick={() => update("spacing", o.value)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* ── Margin Size ────── */}
      <div className="adv__group">
        <label className="adv__label">Page Margins</label>
        <div className="adv__pills">
          {MARGIN_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`adv__pill ${(cs.margins || "normal") === o.value ? "adv__pill--active" : ""}`}
              onClick={() => update("margins", o.value)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .adv { padding: 0 24px 24px; }
        .adv__header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; padding-top: 20px;
          border-top: 1px solid var(--color-border-light);
        }
        .adv__title {
          font-family: var(--font-display); font-size: 1.05rem;
        }
        .adv__reset {
          font-family: var(--font-body); font-size: 0.72rem; font-weight: 500;
          color: var(--color-accent); background: none; border: 1px solid var(--color-accent);
          border-radius: var(--radius-full); padding: 4px 12px; cursor: pointer;
          transition: all 0.15s ease;
        }
        .adv__reset:hover { background: var(--color-accent); color: #fff; }

        .adv__group { margin-bottom: 14px; }
        .adv__label {
          font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--color-text-secondary);
          margin-bottom: 6px; display: block;
        }
        .adv__hint {
          font-size: 0.65rem; color: var(--color-text-tertiary); margin-top: 3px;
          display: block;
        }

        /* Color swatches */
        .adv__color-grid {
          display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
        }
        .adv__color-swatch {
          width: 24px; height: 24px; border-radius: 50%;
          border: 2px solid transparent; cursor: pointer;
          transition: all 0.15s ease;
        }
        .adv__color-swatch:hover { transform: scale(1.15); }
        .adv__color-swatch--active {
          border-color: var(--color-text); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--color-text);
        }
        .adv__color-custom {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1.5px dashed var(--color-border); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
          color: var(--color-text-tertiary);
        }
        .adv__color-custom input {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0; cursor: pointer;
        }

        /* Select */
        .adv__select {
          width: 100%; padding: 7px 10px; border: 1px solid var(--color-border);
          border-radius: var(--radius-md); font-family: var(--font-body);
          font-size: 0.82rem; background: var(--color-bg); color: var(--color-text);
          cursor: pointer; outline: none;
        }
        .adv__select:focus { border-color: var(--color-accent); }

        /* Pills */
        .adv__pills { display: flex; flex-wrap: wrap; gap: 4px; }
        .adv__pill {
          padding: 4px 10px; font-family: var(--font-body); font-size: 0.72rem;
          font-weight: 500; border: 1px solid var(--color-border);
          border-radius: var(--radius-full); background: var(--color-bg);
          color: var(--color-text-secondary); cursor: pointer;
          transition: all 0.15s ease;
        }
        .adv__pill:hover { border-color: var(--color-text-tertiary); }
        .adv__pill--active {
          background: var(--color-btn-dark); color: #fff;
          border-color: var(--color-btn-dark);
        }

        @media (max-width: 768px) {
          .adv { padding: 0 16px 20px; }
          .adv__header { padding-top: 16px; margin-bottom: 12px; }
          .adv__title { font-size: 0.95rem; }
          .adv__select { min-height: 44px; font-size: 16px; }
          .adv__pill { padding: 6px 12px; font-size: 0.72rem; min-height: 36px; display: flex; align-items: center; }
          .adv__color-swatch { width: 28px; height: 28px; }
          .adv__color-custom { width: 28px; height: 28px; }
        }
      `}</style>
    </div>
  );
}
