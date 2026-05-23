"use client";

import { useCoverLetter } from "../../context/CoverLetterContext";

export default function LetterDetailsForm() {
  const { coverLetterData, dispatch } = useCoverLetter();
  const details = coverLetterData.letterDetails || {};

  const handleChange = (field, val) => {
    dispatch({ type: "UPDATE_LETTER_DETAILS", payload: { [field]: val } });
  };

  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="text"
          className="form-input"
          value={details.date || ""}
          onChange={(e) => handleChange("date", e.target.value)}
          placeholder="e.g. May 23, 2026"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Subject Line</label>
        <input
          type="text"
          className="form-input"
          value={details.subject || ""}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="e.g. Application for Marketing Specialist"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Salutation</label>
        <input
          type="text"
          className="form-input"
          value={details.salutation || ""}
          onChange={(e) => handleChange("salutation", e.target.value)}
          placeholder="e.g. Dear Hiring Manager,"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Letter Body</label>
        <textarea
          rows={14}
          className="form-input body-textarea"
          value={details.body || ""}
          onChange={(e) => handleChange("body", e.target.value)}
          placeholder="Write your professional cover letter intro, achievements, and conclusion here..."
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Sign-off / Signature</label>
        <textarea
          rows={2}
          className="form-input"
          value={details.signOff || ""}
          onChange={(e) => handleChange("signOff", e.target.value)}
          placeholder="e.g. Sincerely,\nSunil Verma"
        />
      </div>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          font-family: var(--font-body);
          font-size: 0.82rem;
          padding: 8px 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          outline: none;
          background: var(--color-bg);
          color: var(--color-text);
          transition: border-color var(--transition-fast);
        }

        .form-input:focus {
          border-color: var(--color-accent);
        }

        textarea.form-input {
          resize: vertical;
          line-height: 1.45;
        }

        .body-textarea {
          font-size: 0.8rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
