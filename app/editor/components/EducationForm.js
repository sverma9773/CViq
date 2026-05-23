"use client";

import { useResume } from "../../context/ResumeContext";

export default function EducationForm() {
  const { resumeData, dispatch } = useResume();
  const { education } = resumeData;

  const handleChange = (id, field, value) => {
    dispatch({ type: "UPDATE_EDUCATION", payload: { id, [field]: value } });
  };

  return (
    <div className="edu-form">
      {education.map((edu, index) => (
        <div className="edu-form__entry" key={edu.id}>
          <div className="edu-form__entry-header">
            <span className="edu-form__badge">{index + 1}</span>
            {education.length > 1 && (
              <button
                className="edu-form__remove"
                onClick={() => dispatch({ type: "REMOVE_EDUCATION", payload: edu.id })}
                aria-label="Remove"
              >×</button>
            )}
          </div>

          <div className="form-group">
            <label>Institution</label>
            <input type="text" value={edu.institution} onChange={(e) => handleChange(edu.id, "institution", e.target.value)} placeholder="University of..." />
          </div>
          <div className="form-group">
            <label>Degree</label>
            <input type="text" value={edu.degree} onChange={(e) => handleChange(edu.id, "degree", e.target.value)} placeholder="B.Sc. Computer Science" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="text" value={edu.startDate} onChange={(e) => handleChange(edu.id, "startDate", e.target.value)} placeholder="2018" />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="text" value={edu.endDate} onChange={(e) => handleChange(edu.id, "endDate", e.target.value)} placeholder="2022" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={edu.description} onChange={(e) => handleChange(edu.id, "description", e.target.value)} placeholder="Key achievements, GPA..." rows={2} />
          </div>
        </div>
      ))}

      <button className="edu-form__add" onClick={() => dispatch({ type: "ADD_EDUCATION" })}>
        + Add Education
      </button>

      <style jsx>{`
        .edu-form { display: flex; flex-direction: column; gap: 14px; }
        .edu-form__entry {
          padding: 14px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .edu-form__entry-header { display: flex; align-items: center; justify-content: space-between; }
        .edu-form__badge {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-accent);
          background: rgba(218, 119, 86, 0.08);
          padding: 2px 10px;
          border-radius: var(--radius-full);
        }
        .edu-form__remove {
          background: none; border: none; color: var(--color-text-tertiary); cursor: pointer; font-size: 1.1rem; padding: 2px 6px; border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .edu-form__remove:hover { color: #d44; background: rgba(221,68,68,0.06); }
        .form-group { display: flex; flex-direction: column; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .edu-form__add {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border: 1px dashed var(--color-border); border-radius: var(--radius-md);
          background: none; color: var(--color-text-secondary); font-family: var(--font-body);
          font-size: 0.82rem; font-weight: 500; cursor: pointer;
          transition: all var(--transition-fast);
        }
        .edu-form__add:hover { border-color: var(--color-text-tertiary); color: var(--color-text); }
      `}</style>
    </div>
  );
}
