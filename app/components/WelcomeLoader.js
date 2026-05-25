"use client";

import { useEffect, useState } from "react";
import ClaudeIcon from "./ClaudeIcon";

export default function WelcomeLoader({ onComplete }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [fadeState, setFadeState] = useState("in"); // "in" or "out"

  const messages = [
    "Crafting your professional story...",
    "Injecting ATS compliance protocols...",
    "Refining editorial typography...",
    "Assembling your premium workspace..."
  ];

  useEffect(() => {
    // Only run on client-side to prevent SSR hydration mismatch
    const hasWelcomed = sessionStorage.getItem("cviqly_welcomed");
    if (hasWelcomed) {
      if (onComplete) onComplete();
      return;
    }

    setIsMounted(true);
    setCurrentMessage(messages[0]);

    // Timeline for message rotation with vertical scroll cross-fade
    let currentIdx = 0;
    const interval = setInterval(() => {
      setFadeState("out");
      
      setTimeout(() => {
        currentIdx += 1;
        if (currentIdx < messages.length) {
          setCurrentMessage(messages[currentIdx]);
          setFadeState("in");
        } else {
          clearInterval(interval);
        }
      }, 150);
    }, 800); // Change message every 800ms

    // Timeline of exit sequence (3.0 seconds total loading)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      sessionStorage.setItem("cviqly_welcomed", "true");
      if (onComplete) onComplete();
    }, 3000);

    const unmountTimer = setTimeout(() => {
      setIsMounted(false);
    }, 4100); // 3000ms loading + 1100ms transition buffer

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`welcome-preloader ${isExiting ? "welcome-preloader--exiting" : ""}`}>
      <div className="welcome-preloader__glow" />
      <div className="welcome-preloader__content">
        <div className="welcome-preloader__logo-container">
          <div className="welcome-preloader__logo-glow" />
          <div className="welcome-preloader__logo-ring" />
          <div className="welcome-preloader__logo-inner">
            <ClaudeIcon size={32} className="welcome-preloader__logo-sparkle" />
          </div>
        </div>
        
        <h1 className="welcome-preloader__title">CViqly</h1>
        <p className="welcome-preloader__subtitle">Resume Maker</p>
        
        <div className="welcome-preloader__ticker-container">
          <span className={`welcome-preloader__message welcome-preloader__message--${fadeState}`}>
            {currentMessage}
          </span>
        </div>
        
        <div className="welcome-preloader__progress-wrap">
          <div 
            className="welcome-preloader__progress-fill" 
            style={{
              animationDuration: "3.0s" // match load duration exactly
            }}
          />
        </div>
      </div>
    </div>
  );
}
