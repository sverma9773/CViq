"use client";

import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { saveResume, getResumeById } from "../lib/resumeStore";
import { useAuth } from "./AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const ResumeContext = createContext();

const emptyResumeData = {
  profile: { fullName: "", jobTitle: "", email: "", phone: "", location: "", photoUrl: "" },
  education: [{ id: "edu-1", institution: "", degree: "", startDate: "", endDate: "", description: "" }],
  experience: [{ id: "exp-1", company: "", role: "", startDate: "", endDate: "", description: "" }],
  skills: [],
  certificates: [{ id: "cert-1", name: "", issuer: "", date: "" }],
  template: "classic",
  customStyle: null, // null = use template defaults
};

function resumeReducer(state, action) {
  switch (action.type) {
    case "SET_ALL":
      return { ...action.payload };

    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case "ADD_EDUCATION":
      return {
        ...state,
        education: [
          ...state.education,
          { id: `edu-${Date.now()}`, institution: "", degree: "", startDate: "", endDate: "", description: "" },
        ],
      };
    case "UPDATE_EDUCATION":
      return {
        ...state,
        education: state.education.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };
    case "REMOVE_EDUCATION":
      return { ...state, education: state.education.filter((e) => e.id !== action.payload) };

    case "ADD_EXPERIENCE":
      return {
        ...state,
        experience: [
          ...state.experience,
          { id: `exp-${Date.now()}`, company: "", role: "", startDate: "", endDate: "", description: "" },
        ],
      };
    case "UPDATE_EXPERIENCE":
      return {
        ...state,
        experience: state.experience.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };
    case "REMOVE_EXPERIENCE":
      return { ...state, experience: state.experience.filter((e) => e.id !== action.payload) };

    case "SET_SKILLS":
      return { ...state, skills: action.payload };
    case "ADD_SKILL":
      return { ...state, skills: [...state.skills, action.payload] };
    case "REMOVE_SKILL":
      return { ...state, skills: state.skills.filter((_, i) => i !== action.payload) };

    case "ADD_CERTIFICATE":
      return {
        ...state,
        certificates: [
          ...state.certificates,
          { id: `cert-${Date.now()}`, name: "", issuer: "", date: "" },
        ],
      };
    case "UPDATE_CERTIFICATE":
      return {
        ...state,
        certificates: state.certificates.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case "REMOVE_CERTIFICATE":
      return { ...state, certificates: state.certificates.filter((c) => c.id !== action.payload) };

    case "SET_TEMPLATE":
      return { ...state, template: action.payload };

    case "SET_CUSTOM_STYLE":
      return { ...state, customStyle: { ...(state.customStyle || {}), ...action.payload } };

    case "RESET_CUSTOM_STYLE":
      return { ...state, customStyle: null };

    default:
      return state;
  }
}

export function ResumeProvider({ children, resumeId, initialData }) {
  const [resumeData, dispatch] = useReducer(resumeReducer, initialData || emptyResumeData);
  const idRef = useRef(resumeId);
  const { user } = useAuth();

  // Persist to multi-resume store on every change
  useEffect(() => {
    if (idRef.current) {
      saveResume(idRef.current, resumeData);
    }
  }, [resumeData]);

  // Debounced auto-save to Firestore for signed-in users
  useEffect(() => {
    if (!user || !idRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const localResume = getResumeById(idRef.current);
        const name = localResume ? localResume.name : "Resume";
        const docRef = doc(db, "users", user.uid, "resumes", idRef.current);
        await setDoc(docRef, {
          id: idRef.current,
          name: name,
          data: resumeData,
          updatedAt: Date.now()
        }, { merge: true });
        console.log("[AutoSave] Automatically synced to Firestore.");
      } catch (err) {
        console.error("[AutoSave] Auto-save to Firestore failed:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [resumeData, user]);

  return (
    <ResumeContext.Provider value={{ resumeData, dispatch, resumeId: idRef.current }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
