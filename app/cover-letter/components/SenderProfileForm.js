"use client";

import { useCoverLetter } from "../../context/CoverLetterContext";

export default function SenderProfileForm() {
  const { coverLetterData, dispatch } = useCoverLetter();
  const profile = coverLetterData.profile || {};

  const handleChange = (field, val) => {
    dispatch({ type: "UPDATE_PROFILE", payload: { [field]: val } });
  };

  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-input"
          value={profile.fullName || ""}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="e.g. Sunil Verma"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Job Title Headline</label>
        <input
          type="text"
          className="form-input"
          value={profile.jobTitle || ""}
          onChange={(e) => handleChange("jobTitle", e.target.value)}
          placeholder="e.g. Content Marketing Specialist"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className="form-input"
          value={profile.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="e.g. sunil@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input
          type="text"
          className="form-input"
          value={profile.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="e.g. +91 9876543210"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Location</label>
        <input
          type="text"
          className="form-input"
          value={profile.location || ""}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="e.g. Delhi, India"
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
      `}</style>
    </div>
  );
}
