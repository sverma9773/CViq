"use client";

import { useState, useEffect } from "react";
import WelcomeLoader from "./WelcomeLoader";

export default function ClientLayoutWrapper({ children }) {
  const [isRevealActive, setIsRevealActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If they have already been welcomed in this session, reveal immediately
    const hasWelcomed = sessionStorage.getItem("cviqly_welcomed");
    if (hasWelcomed) {
      setIsRevealActive(true);
    }
    setIsLoaded(true);
  }, []);

  return (
    <>
      <WelcomeLoader onComplete={() => setIsRevealActive(true)} />
      <div className={`cviqly-reveal-container ${isRevealActive || !isLoaded ? "cviqly-reveal-container--active" : ""}`}>
        {children}
      </div>
    </>
  );
}
