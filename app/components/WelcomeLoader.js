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

      <style jsx>{`
        .welcome-preloader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #faf7f5;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          transition: opacity 1s ease-in-out, visibility 1s ease-in-out;
        }

        .welcome-preloader--exiting {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .welcome-preloader__glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(218,119,86,0.15) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .welcome-preloader__content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .welcome-preloader__logo-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .welcome-preloader__logo-glow {
          position: absolute;
          inset: 0;
          background: rgba(218, 119, 86, 0.2);
          border-radius: 50%;
          filter: blur(10px);
        }

        .welcome-preloader__logo-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #da7756;
          border-right-color: rgba(218, 119, 86, 0.3);
          animation: spin 1.5s linear infinite;
        }

        .welcome-preloader__logo-inner {
          position: relative;
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(25, 25, 24, 0.08);
          animation: float 3s ease-in-out infinite;
        }

        .welcome-preloader__title {
          font-family: var(--font-display, Inter, sans-serif);
          font-size: 2.2rem;
          font-weight: 400;
          color: #191918;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .welcome-preloader__subtitle {
          font-size: 1rem;
          color: #9b9b94;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 40px;
        }

        .welcome-preloader__ticker-container {
          height: 24px;
          margin-bottom: 30px;
          overflow: hidden;
          position: relative;
        }

        .welcome-preloader__message {
          display: block;
          font-size: 0.95rem;
          color: #9b9b94;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .welcome-preloader__message--in {
          opacity: 1;
          transform: translateY(0);
        }

        .welcome-preloader__message--out {
          opacity: 0;
          transform: translateY(-20px);
        }

        .welcome-preloader__progress-wrap {
          width: 200px;
          height: 4px;
          background: rgba(25, 25, 24, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .welcome-preloader__progress-fill {
          height: 100%;
          background: #da7756;
          border-radius: 4px;
          width: 0%;
          animation: loadProgress ease-in-out forwards;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes loadProgress {
          0% { width: 0%; }
          15% { width: 10%; }
          40% { width: 45%; }
          75% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
