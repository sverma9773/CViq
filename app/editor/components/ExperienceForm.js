"use client";

import { useResume } from "../../context/ResumeContext";

export default function ExperienceForm() {
  const { resumeData, dispatch } = useResume();
  const { experience } = resumeData;

  const handleChange = (id, field, value) => {
    dispatch({ type: "UPDATE_EXPERIENCE", payload: { id, [field]: value } });
  };

  return (
    <div className="exp-form">
      {experience.map((exp, index) => (
        <div className="exp-form__entry" key={exp.id}>
          <div className="exp-form__entry-header">
            <span className="exp-form__badge">{index + 1}</span>
            {experience.length > 1 && (
              <button className="exp-form__remove" onClick={() => dispatch({ type: "REMOVE_EXPERIENCE", payload: exp.id })} aria-label="Remove">×</button>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input type="text" value={exp.company} onChange={(e) => handleChange(exp.id, "company", e.target.value)} placeholder="Company Name" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={exp.role} onChange={(e) => handleChange(exp.id, "role", e.target.value)} placeholder="Job Title" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="text" value={exp.startDate} onChange={(e) => handleChange(exp.id, "startDate", e.target.value)} placeholder="Jan 2022" />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="text" value={exp.endDate} onChange={(e) => handleChange(exp.id, "endDate", e.target.value)} placeholder="Present" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={exp.description} onChange={(e) => handleChange(exp.id, "description", e.target.value)} placeholder="Describe your responsibilities..." rows={4} />
          </div>
        </div>
      ))}

      <button className="exp-form__add" onClick={() => dispatch({ type: "ADD_EXPERIENCE" })}>
        + Add Experience
      </button>

      <style jsx>{`
        .exp-form { display: flex; flex-direction: column; gap: 14px; }
        .exp-form__entry {
          padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-md);
          display: flex; flex-direction: column; gap: 10px;
        }
        .exp-form__entry-header { display: flex; align-items: center; justify-content: space-between; }
        .exp-form__badge {
          font-size: 0.7rem; font-weight: 600; color: var(--color-accent);
          background: rgba(218,119,86,0.08); padding: 2px 10px; border-radius: var(--radius-full);
        }
        .exp-form__remove {
          background: none; border: none; color: var(--color-text-tertiary); cursor: pointer;
          font-size: 1.1rem; padding: 2px 6px; border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .exp-form__remove:hover { color: #d44; background: rgba(221,68,68,0.06); }
        .form-group { display: flex; flex-direction: column; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .exp-form__add {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border: 1px dashed var(--color-border); border-radius: var(--radius-md);
          background: none; color: var(--color-text-secondary); font-family: var(--font-body);
          font-size: 0.82rem; font-weight: 500; cursor: pointer;
          transition: all var(--transition-fast);
        }
        .exp-form__add:hover { border-color: var(--color-text-tertiary); color: var(--color-text); }
      `}</style>
    </div>
  );
}
