"use client";

import Link from "next/link";
import ClaudeIcon from "./ClaudeIcon";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="footer__logo">
              <span className="logo-title-wrap">
                <span className="logo-brand">CViqly</span>
                <span className="logo-separator">|</span>
                <span className="logo-tagline">Resume Maker</span>
              </span>
            </Link>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Product</h4>
            <Link href="/dashboard" legacyBehavior>
              <a className="footer__link">Resume Editor</a>
            </Link>
            <a href="#features" className="footer__link">Features</a>
            <a href="#how-it-works" className="footer__link">How It Works</a>
            <a href="#faq" className="footer__link">FAQ</a>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Resources</h4>
            <a href="#" className="footer__link">Resume Tips</a>
            <a href="#" className="footer__link">Cover Letters</a>
            <a href="#" className="footer__link">Interview Guide</a>
            <a href="#" className="footer__link">Career Blog</a>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Company</h4>
            <a href="#" className="footer__link">About Us</a>
            <a href="#" className="footer__link">Privacy Policy</a>
            <a href="#" className="footer__link">Terms of Service</a>
            <a href="#" className="footer__link">Contact</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} CViqly. All rights reserved.</p>
          <p className="footer__powered">
            Built with the Claude Design System
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--color-footer-bg);
          color: #9b9b94;
          padding: 64px 0 32px;
        }

        .footer__grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .footer__logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #ffffff;
        }

        .logo-title-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .logo-brand {
          font-weight: 600;
          color: #ffffff;
        }

        .logo-separator {
          color: #2d2d2b;
          font-weight: 300;
          font-size: 0.8rem;
        }

        .logo-tagline {
          font-weight: 400;
          font-size: 0.78rem;
          color: #9b9b94;
        }

        .footer__links-title {
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #666660;
          margin-bottom: 14px;
        }

        .footer__links-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer__link {
          font-size: 0.85rem;
          color: #9b9b94;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer__link:hover {
          color: #ffffff;
          opacity: 1;
        }

        .footer__bottom {
          border-top: 1px solid #2d2d2b;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer__bottom p {
          font-size: 0.78rem;
          color: #666660;
        }

        .footer__powered {
          font-size: 0.72rem !important;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .footer__grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }

          .footer__brand {
            grid-column: 1 / -1;
          }

          .footer__bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .footer__grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .logo-tagline, .logo-separator {
            display: none;
          }
        }
      `}</style>
    </footer>
  );
}
