"use client";

import { useState } from "react";

export default function SidebarSection({ title, icon, children, isOpen, onToggle, defaultOpen = false }) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = isOpen !== undefined ? isOpen : localOpen;
  const toggle = onToggle || (() => setLocalOpen(!localOpen));

  return (
    <div className={`sidebar-section ${open ? "sidebar-section--open" : ""}`}>
      <button
        className="sidebar-section__header"
        onClick={toggle}
        aria-expanded={open}
      >
        <div className="sidebar-section__title">
          <span className="sidebar-section__icon">{icon}</span>
          <span>{title}</span>
        </div>
        <svg
          className="sidebar-section__chevron"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="sidebar-section__body">
        <div className="sidebar-section__content">{children}</div>
      </div>

      <style jsx>{`
        .sidebar-section {
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-section__header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .sidebar-section__header:hover {
          background: var(--color-bg-offwhite);
        }

        .sidebar-section__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .sidebar-section__icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .sidebar-section__chevron {
          color: var(--color-text-tertiary);
          transition: transform 0.25s ease;
        }

        .sidebar-section--open .sidebar-section__chevron {
          transform: rotate(180deg);
        }

        .sidebar-section__body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease;
        }

        .sidebar-section--open .sidebar-section__body {
          max-height: 2000px;
        }

        .sidebar-section__content {
          padding: 0 18px 18px;
        }

        @media (max-width: 768px) {
          .sidebar-section__header {
            padding: 16px 16px;
            min-height: 48px;
          }
          .sidebar-section__title {
            font-size: 0.88rem;
          }
          .sidebar-section__content {
            padding: 0 16px 16px;
          }
        }
      `}</style>
    </div>
  );
}
