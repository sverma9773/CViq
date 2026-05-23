"use client";

import { useResume } from "../../context/ResumeContext";

export default function ProfileForm() {
  const { resumeData, dispatch } = useResume();
  const { profile } = resumeData;

  const handleChange = (field, value) => {
    dispatch({ type: "UPDATE_PROFILE", payload: { [field]: value } });
  };

  return (
    <div className="profile-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={profile.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <input
            type="text"
            id="jobTitle"
            value={profile.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            value={profile.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 234 567 890"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={profile.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="City, Country"
        />
      </div>

      <style jsx>{`
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
