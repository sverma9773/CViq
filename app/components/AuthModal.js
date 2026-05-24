"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import ClaudeIcon, { ClaudeSparkleSmall } from "./ClaudeIcon";

export default function AuthModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { user, signInWithGoogle, loading, isAuthModalOpen, setAuthModalOpen } = useAuth();
  const [error, setError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const onClose = propOnClose || (() => setAuthModalOpen(false));

  useEffect(() => {
    if (user && isOpen) {
      onClose();
      router.push("/dashboard");
    }
  }, [user, isOpen, onClose, router]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <div className="logo-container">
            <span className="logo-title-wrap">
              <span className="logo-brand">CViq</span>
              <span className="logo-separator">|</span>
              <span className="logo-tagline">Resume Maker</span>
            </span>
          </div>
          <h2 className="modal-title">Continue to your workspace</h2>
          <p className="modal-subtitle">
            Sign in to auto-save and back up your resumes to the cloud. Access your work from any device.
          </p>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="google-btn"
        >
          {isSigningIn ? (
            <span className="spinner"></span>
          ) : (
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.974 0 12 0 7.354 0 3.307 2.657 1.277 6.547l3.99 3.218z"/>
              <path fill="#4285F4" d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.56h6.48a5.54 5.54 0 0 1-2.4 3.63v3.015h3.87c2.265-2.085 3.54-5.145 3.54-8.82z"/>
              <path fill="#FBBC05" d="M5.266 14.235a7.077 7.077 0 0 1-.357-2.235c0-.776.13-1.52.357-2.235L1.277 6.547A11.95 11.95 0 0 0 0 12c0 1.99.485 3.864 1.34 5.534l3.926-3.3z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.955-1.075 7.95-2.915l-3.87-3.015c-1.072.718-2.443 1.144-4.08 1.144-3.155 0-5.823-2.13-6.779-5.001l-3.99 3.218C3.307 21.343 7.354 24 12 24z"/>
            </svg>
          )}
          {isSigningIn ? "Signing in..." : "Continue with Google"}
        </button>

        <button
          onClick={() => { onClose(); router.push("/dashboard"); }}
          disabled={isSigningIn}
          className="guest-btn"
        >
          Continue as Guest (No Sign-Up)
        </button>

        <div className="modal-footer-text">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(25, 25, 24, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #fff;
          border: 1px solid #eae6e2;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 40px rgba(25, 25, 24, 0.12);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9b9b94;
          transition: all 0.15s ease;
        }

        .modal-close:hover {
          background: #faf8f6;
          color: #191918;
        }

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 28px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .logo-title-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-display);
          font-size: 1.25rem;
          white-space: nowrap;
        }

        .logo-brand {
          font-weight: 600;
          color: #191918;
        }

        .logo-separator {
          color: #eae6e2;
          font-weight: 300;
          font-size: 1.1rem;
        }

        .logo-tagline {
          font-weight: 400;
          font-size: 0.95rem;
          color: #9b9b94;
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 400;
          color: #191918;
          letter-spacing: -0.4px;
          margin-bottom: 10px;
        }

        .modal-subtitle {
          font-size: 0.85rem;
          color: #9b9b94;
          line-height: 1.6;
          max-width: 320px;
        }

        .modal-error {
          width: 100%;
          background: #fdf3f2;
          border: 1px solid #fce4e2;
          color: #d9383a;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.78rem;
          text-align: center;
          margin-bottom: 20px;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 20px;
          background: #fff;
          border: 1px solid #eae6e2;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #191918;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(25, 25, 24, 0.02);
          margin-bottom: 12px;
        }

        .google-btn:hover:not(:disabled) {
          background: #faf8f6;
          border-color: #d6cfc7;
          transform: translateY(-1px);
        }

        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .guest-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          background: transparent;
          border: 1px dashed #eae6e2;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #9b9b94;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 24px;
        }

        .guest-btn:hover {
          background: #faf8f6;
          border-color: #da7756;
          color: #da7756;
          transform: translateY(-1px);
        }

        .google-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(25, 25, 24, 0.15);
          border-top-color: #191918;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .modal-footer-text {
          font-size: 0.72rem;
          color: #c4c4be;
          text-align: center;
          line-height: 1.4;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 32px 24px 24px;
            width: 90%;
          }
          
          .logo-tagline, .logo-separator {
            display: none;
          }
          
          .google-btn {
            min-height: 48px;
            padding: 14px 20px;
          }
        }
      `}</style>
    </div>
  );
}
