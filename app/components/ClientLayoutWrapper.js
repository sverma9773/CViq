"use client";

import { useState, useEffect } from "react";
import WelcomeLoader from "./WelcomeLoader";
import TransitionLoader from "./TransitionLoader";
import { useRouter } from "next/navigation";

export default function ClientLayoutWrapper({ children }) {
  const [isRevealActive, setIsRevealActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleTransition = (e) => {
      if (e.detail && e.detail.destination) {
        setIsTransitioning(true);
        setTimeout(() => {
          router.push(e.detail.destination);
          setTimeout(() => setIsTransitioning(false), 500); // Hide loader after route resolves
        }, 300); // Show star for at least 300ms
      }
    };

    window.addEventListener("cviqly-navigate", handleTransition);

    // If they have already been welcomed in this session, reveal immediately
    const hasWelcomed = sessionStorage.getItem("cviqly_welcomed");
    if (hasWelcomed) {
      setIsRevealActive(true);
    }
    setIsLoaded(true);

    return () => window.removeEventListener("cviqly-navigate", handleTransition);
  }, [router]);

  return (
    <>
      <WelcomeLoader onComplete={() => setIsRevealActive(true)} />
      <TransitionLoader active={isTransitioning} />
      <div className={`cviqly-reveal-container ${isRevealActive || !isLoaded ? "cviqly-reveal-container--active" : ""}`}>
        {children}
      </div>
    </>
  );
}
