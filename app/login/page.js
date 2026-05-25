"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ClaudeIcon, { ClaudeSparkleSmall } from "../components/ClaudeIcon";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "An error occurred during Google Sign-In. Please try again.");
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="login-screen">
        <ClaudeSparkleSmall size={32} color="#da7756" />
        <style jsx>{`
          .login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #faf8f6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Subtle decorative blurred highlights */}
        <div className="decor-circle decor-circle--top"></div>
        <div className="decor-circle decor-circle--bottom"></div>

        <Link href="/" className="logo-link">
          <span className="logo-title-wrap">
            <span className="logo-brand">CViqly</span>
            <span className="logo-separator">|</span>
            <span className="logo-tagline">Resume Maker</span>
          </span>
        </Link>

        <div className="card-header">
          <h2 className="card-title">Continue to your workspace</h2>
          <p className="card-subtitle">
            Sign in to auto-save and back up your resumes to the cloud. Access your work from any device.
          </p>
        </div>

        {error && (
          <div className="card-error">
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

        <div className="card-footer-text">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faf8f6;
          padding: 24px;
        }

        .login-card {
          background: #fff;
          border: 1px solid #eae6e2;
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 16px 36px rgba(25, 25, 24, 0.08);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        .decor-circle {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
        }

        .decor-circle--top {
          top: -40px;
          right: -40px;
          background: #fdf0ea;
        }

        .decor-circle--bottom {
          bottom: -40px;
          left: -40px;
          background: #f0f9eb;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 32px;
          z-index: 2;
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

        .card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 32px;
          z-index: 2;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 400;
          color: #191918;
          letter-spacing: -0.4px;
          margin-bottom: 10px;
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: #9b9b94;
          line-height: 1.6;
          max-width: 320px;
        }

        .card-error {
          width: 100%;
          background: #fdf3f2;
          border: 1px solid #fce4e2;
          color: #d9383a;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.78rem;
          text-align: center;
          margin-bottom: 24px;
          z-index: 2;
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
          margin-bottom: 28px;
          z-index: 2;
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

        .card-footer-text {
          font-size: 0.72rem;
          color: #c4c4be;
          text-align: center;
          line-height: 1.4;
          z-index: 2;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px 24px;
            width: 90%;
            margin: 0 16px;
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
