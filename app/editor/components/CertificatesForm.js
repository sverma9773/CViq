"use client";

import { useResume } from "../../context/ResumeContext";

export default function CertificatesForm() {
  const { resumeData, dispatch } = useResume();
  const { certificates } = resumeData;

  const handleChange = (id, field, value) => {
    dispatch({ type: "UPDATE_CERTIFICATE", payload: { id, [field]: value } });
  };

  return (
    <div className="cert-form">
      {certificates.map((cert, index) => (
        <div className="cert-form__entry" key={cert.id}>
          <div className="cert-form__entry-header">
            <span className="cert-form__badge">{index + 1}</span>
            {certificates.length > 1 && (
              <button className="cert-form__remove" onClick={() => dispatch({ type: "REMOVE_CERTIFICATE", payload: cert.id })} aria-label="Remove">×</button>
            )}
          </div>
          <div className="form-group">
            <label>Certificate Name</label>
            <input type="text" value={cert.name} onChange={(e) => handleChange(cert.id, "name", e.target.value)} placeholder="AWS Solutions Architect" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Issuer</label>
              <input type="text" value={cert.issuer} onChange={(e) => handleChange(cert.id, "issuer", e.target.value)} placeholder="Amazon" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="text" value={cert.date} onChange={(e) => handleChange(cert.id, "date", e.target.value)} placeholder="2023" />
            </div>
          </div>
        </div>
      ))}

      <button className="cert-form__add" onClick={() => dispatch({ type: "ADD_CERTIFICATE" })}>
        + Add Certificate
      </button>

      <style jsx>{`
        .cert-form { display: flex; flex-direction: column; gap: 14px; }
        .cert-form__entry {
          padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-md);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cert-form__entry-header { display: flex; align-items: center; justify-content: space-between; }
        .cert-form__badge {
          font-size: 0.7rem; font-weight: 600; color: var(--color-accent);
          background: rgba(218,119,86,0.08); padding: 2px 10px; border-radius: var(--radius-full);
        }
        .cert-form__remove {
          background: none; border: none; color: var(--color-text-tertiary); cursor: pointer;
          font-size: 1.1rem; padding: 2px 6px; border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .cert-form__remove:hover { color: #d44; background: rgba(221,68,68,0.06); }
        .form-group { display: flex; flex-direction: column; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cert-form__add {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border: 1px dashed var(--color-border); border-radius: var(--radius-md);
          background: none; color: var(--color-text-secondary); font-family: var(--font-body);
          font-size: 0.82rem; font-weight: 500; cursor: pointer;
          transition: all var(--transition-fast);
        }
        .cert-form__add:hover { border-color: var(--color-text-tertiary); color: var(--color-text); }
      `}</style>
    </div>
  );
}
