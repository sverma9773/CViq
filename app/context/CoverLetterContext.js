"use client";

import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { saveCoverLetter } from "../lib/coverLetterStore";

const CoverLetterContext = createContext();

const emptyCoverLetterData = {
  profile: { fullName: "", jobTitle: "", email: "", phone: "", location: "" },
  recipient: { name: "", company: "", address: "" },
  letterDetails: { date: "", subject: "", salutation: "", body: "", signOff: "" },
  template: "classic",
  customStyle: null,
};

function coverLetterReducer(state, action) {
  switch (action.type) {
    case "SET_ALL":
      return { ...action.payload };

    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case "UPDATE_RECIPIENT":
      return { ...state, recipient: { ...state.recipient, ...action.payload } };

    case "UPDATE_LETTER_DETAILS":
      return { ...state, letterDetails: { ...state.letterDetails, ...action.payload } };

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

export function CoverLetterProvider({ children, coverLetterId, initialData }) {
  const [coverLetterData, dispatch] = useReducer(coverLetterReducer, initialData || emptyCoverLetterData);
  const idRef = useRef(coverLetterId);

  // Persist to store on every change
  useEffect(() => {
    if (idRef.current) {
      saveCoverLetter(idRef.current, coverLetterData);
    }
  }, [coverLetterData]);

  return (
    <CoverLetterContext.Provider value={{ coverLetterData, dispatch, coverLetterId: idRef.current }}>
      {children}
    </CoverLetterContext.Provider>
  );
}

export function useCoverLetter() {
  const context = useContext(CoverLetterContext);
  if (!context) {
    throw new Error("useCoverLetter must be used within a CoverLetterProvider");
  }
  return context;
}
