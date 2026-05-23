"use client";

import { useCoverLetter } from "../../context/CoverLetterContext";

export default function RecipientForm() {
  const { coverLetterData, dispatch } = useCoverLetter();
  const recipient = coverLetterData.recipient || {};

  const handleChange = (field, val) => {
    dispatch({ type: "UPDATE_RECIPIENT", payload: { [field]: val } });
  };

  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Contact Person Name</label>
        <input
          type="text"
          className="form-input"
          value={recipient.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g. Jane Doe or Hiring Manager"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-input"
          value={recipient.company || ""}
          onChange={(e) => handleChange("company", e.target.value)}
          placeholder="e.g. Google LLC"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Company Address</label>
        <textarea
          rows={3}
          className="form-input"
          value={recipient.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA 94043"
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
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
