"use client";

import { useResume } from "../../context/ResumeContext";

export default function ProfileSummaryForm() {
  const { resumeData, dispatch } = useResume();
  const { profile } = resumeData;
  const summary = profile.summary || "";

  const handleChange = (value) => {
    dispatch({ type: "UPDATE_PROFILE", payload: { summary: value } });
  };

  // Quick-add templates to help users get started
  const templates = [
    {
      label: "Tech / Dev",
      text: "Results-driven Software Engineer with 5+ years of experience specializing in robust web applications. Proven success in optimizing system performance, leading agile developer teams, and launching scalable SaaS platforms utilizing modern JS frameworks.",
    },
    {
      label: "Marketing",
      text: "Creative and analytical Content Marketing Specialist with a strong history of executing successful digital campaigns. Experienced in expanding brand reach, improving social media engagement by 150%+, and utilizing SEO best practices to drive organic traffic.",
    },
    {
      label: "Executive / Management",
      text: "Accomplished operations manager with a proven track record of boosting organizational efficiency and revenue growth. Adept in cross-functional team leadership, budget optimization, and streamlining complex workflows in fast-paced corporate environments.",
    },
  ];

  return (
    <div className="profile-summary-form">
      <div className="form-group">
        <label htmlFor="summary">Professional Summary</label>
        <textarea
          id="summary"
          rows={7}
          value={summary}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Briefly describe your career background, key achievements, and professional strengths..."
        />
        <div className="form-help">
          Describe your top highlights in 2–4 sentences. Keep it impact-oriented and keywords-rich.
        </div>
      </div>

      <div className="summary-suggestions">
        <div className="suggestions-title">Need inspiration? Click to insert a template:</div>
        <div className="suggestions-list">
          {templates.map((tpl, i) => (
            <button
              key={i}
              className="suggestion-btn"
              onClick={() => handleChange(tpl.text)}
              type="button"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .profile-summary-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        textarea {
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--color-text);
          background: var(--color-bg);
          resize: vertical;
          line-height: 1.5;
          outline: none;
          transition: all var(--transition-fast);
        }

        textarea:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(218, 119, 86, 0.12);
        }

        .form-help {
          font-family: var(--font-body);
          font-size: 0.76rem;
          color: var(--color-text-tertiary);
          line-height: 1.4;
        }

        .summary-suggestions {
          border-top: 1px solid var(--color-border);
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestions-title {
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-btn {
          font-family: var(--font-body);
          font-size: 0.74rem;
          font-weight: 500;
          padding: 6px 10px;
          background: var(--color-bg-offwhite);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .suggestion-btn:hover {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
