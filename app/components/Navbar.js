"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ClaudeIcon from "./ClaudeIcon";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logOut, setAuthModalOpen } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`} id="main-navbar">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo" id="logo-link">
          <span className="logo-title-wrap">
            <span className="logo-brand">CViq</span>
            <span className="logo-separator">|</span>
            <span className="logo-tagline">Resume Maker</span>
          </span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? "navbar__links--open" : ""}`}>
          <a href="#how-it-works" className="navbar__link" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          <a href="#features" className="navbar__link" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#testimonials" className="navbar__link" onClick={() => setMobileOpen(false)}>
            Testimonials
          </a>
          <a href="#faq" className="navbar__link" onClick={() => setMobileOpen(false)}>
            FAQ
          </a>
          {user ? (
            <div className="navbar__user-mobile">
              <span className="navbar__user-name-mobile">Hello, {user.displayName || user.email?.split("@")[0]}</span>
              <button onClick={() => { logOut(); setMobileOpen(false); }} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar__cta-mobile">
              <button 
                onClick={() => { setAuthModalOpen(true); setMobileOpen(false); }} 
                className="btn btn-primary btn-sm"
                id="nav-cta-mobile"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </div>

        <div className="navbar__right">
          {user ? (
            <div className="navbar__user-menu" ref={dropdownRef}>
              <button 
                className="navbar__username" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user.displayName || user.email?.split("@")[0]}
                <svg className={`navbar__arrow ${dropdownOpen ? "navbar__arrow--open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <Link href="/dashboard" className="navbar__dropdown-item-link" onClick={() => setDropdownOpen(false)}>
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { logOut(); setDropdownOpen(false); }} 
                    className="navbar__dropdown-item"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__cta-desktop">
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="btn btn-primary btn-sm" 
                id="nav-cta-desktop"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}

          <button
            className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            id="nav-hamburger"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 14px 0;
          background: var(--color-bg);
          transition: all var(--transition-base);
        }

        .navbar--scrolled {
          border-bottom: 1px solid var(--color-border);
          padding: 10px 0;
        }

        .navbar__inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--color-text);
          flex-shrink: 0;
        }

        .logo-title-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-size: 1.05rem;
          white-space: nowrap;
        }

        .logo-brand {
          font-weight: 600;
          color: var(--color-text);
        }

        .logo-separator {
          color: var(--color-border);
          font-weight: 300;
          font-size: 0.9rem;
        }

        .logo-tagline {
          font-weight: 400;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
        }

        .navbar__links {
          display: flex;
          align-items: center;
          gap: 28px;
          flex: 1;
          justify-content: center;
        }

        .navbar__link {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--color-text);
          text-decoration: none;
          transition: opacity var(--transition-fast);
        }

        .navbar__link:hover {
          opacity: 0.6;
        }

        .navbar__right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .navbar__actions-desktop {
          display: block;
        }

        .navbar__signin-btn {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          margin-right: 16px;
          transition: color var(--transition-fast);
        }

        .navbar__signin-btn:hover {
          color: var(--color-text);
        }

        .navbar__user-menu {
          position: relative;
          margin-right: 16px;
        }

        .navbar__username {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text);
          background: var(--color-bg-offwhite);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .navbar__username:hover {
          background: var(--color-border-light);
        }

        .navbar__arrow {
          transition: transform var(--transition-fast);
        }

        .navbar__arrow--open {
          transform: rotate(180deg);
        }

        .navbar__dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 16px rgba(25, 25, 24, 0.08);
          padding: 6px 0;
          min-width: 140px;
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }

        .navbar__dropdown-item-link {
          padding: 8px 16px;
          font-size: 0.8rem;
          font-family: var(--font-body);
          color: var(--color-text);
          text-decoration: none;
          transition: background var(--transition-fast);
        }

        .navbar__dropdown-item-link:hover {
          background: var(--color-bg-offwhite);
        }

        .navbar__dropdown-item {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-family: var(--font-body);
          color: #ea4335;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .navbar__dropdown-item:hover {
          background: var(--color-bg-offwhite);
        }

        .navbar__cta-mobile {
          display: none;
        }

        .navbar__cta-desktop {
          display: block;
        }

        .navbar__user-mobile {
          display: none;
        }

        .navbar__hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          z-index: 1001;
        }

        .navbar__hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: var(--color-text);
          transition: all 0.3s ease;
        }

        .navbar__hamburger--open span:nth-child(1) {
          transform: rotate(45deg) translate(4.5px, 4.5px);
        }
        .navbar__hamburger--open span:nth-child(2) {
          opacity: 0;
        }
        .navbar__hamburger--open span:nth-child(3) {
          transform: rotate(-45deg) translate(4.5px, -4.5px);
        }

        @media (max-width: 768px) {
          .navbar__links {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--color-bg);
            flex-direction: column;
            justify-content: center;
            gap: 24px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
          }

          .navbar__links--open {
            opacity: 1;
            visibility: visible;
          }

          .navbar__link {
            font-size: 1.1rem;
          }

          .navbar__cta-mobile {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-top: 12px;
          }

          .navbar__signin-btn-mobile {
            font-family: var(--font-body);
            font-size: 1rem;
            color: var(--color-text-secondary);
            text-decoration: none;
          }

          .navbar__user-mobile {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-top: 12px;
          }

          .navbar__user-name-mobile {
            font-family: var(--font-body);
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-text);
          }

          .navbar__actions-desktop,
          .navbar__user-menu,
          .navbar__cta-desktop {
            display: none;
          }

          .navbar__hamburger {
            display: flex;
          }

          .logo-tagline, .logo-separator {
            display: none;
          }
          
          .logo-title-wrap {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </nav>
  );
}
