"use client";

import { useState } from "react";
import { useResume } from "../../context/ResumeContext";

export default function SkillsForm() {
  const { resumeData, dispatch } = useResume();
  const { skills } = resumeData;
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      dispatch({ type: "ADD_SKILL", payload: trimmed });
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  return (
    <div className="skills-form">
      <div className="skills-form__input-row">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a skill and press Enter..." />
        <button className="skills-form__add-btn" onClick={handleAdd}>Add</button>
      </div>

      <div className="skills-form__tags">
        {skills.map((skill, index) => (
          <span className="skills-form__tag" key={index}>
            {skill}
            <button className="skills-form__tag-remove" onClick={() => dispatch({ type: "REMOVE_SKILL", payload: index })} aria-label={`Remove ${skill}`}>×</button>
          </span>
        ))}
      </div>

      {skills.length === 0 && (
        <p className="skills-form__empty">No skills added yet.</p>
      )}

      <style jsx>{`
        .skills-form { display: flex; flex-direction: column; gap: 12px; }
        .skills-form__input-row { display: flex; gap: 8px; }
        .skills-form__input-row input { flex: 1; }
        .skills-form__add-btn {
          padding: 8px 16px; background: var(--color-btn-dark); color: #fff; border: none;
          border-radius: var(--radius-md); font-family: var(--font-body); font-size: 0.8rem;
          font-weight: 500; cursor: pointer; transition: background var(--transition-fast);
        }
        .skills-form__add-btn:hover { background: var(--color-btn-dark-hover); }
        .skills-form__tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .skills-form__tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-body); font-size: 0.78rem; font-weight: 500;
          color: var(--color-text); background: var(--color-bg-offwhite);
          border: 1px solid var(--color-border); padding: 4px 10px;
          border-radius: var(--radius-full); transition: all var(--transition-fast);
        }
        .skills-form__tag:hover { border-color: var(--color-text-tertiary); }
        .skills-form__tag-remove {
          background: none; border: none; color: var(--color-text-tertiary);
          cursor: pointer; font-size: 0.9rem; line-height: 1; padding: 0 2px;
          transition: color var(--transition-fast);
        }
        .skills-form__tag-remove:hover { color: #d44; }
        .skills-form__empty { font-size: 0.82rem; color: var(--color-text-tertiary); text-align: center; padding: 10px 0; }
      `}</style>
    </div>
  );
}
