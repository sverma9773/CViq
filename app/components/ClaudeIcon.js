/**
 * Claude sparkle/asterisk icon — the official Claude brand mark.
 * A 4-pointed star shape used throughout the app.
 */
export default function ClaudeIcon({ size = 20, color = "currentColor", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 0C10 5.523 5.523 10 0 10C5.523 10 10 14.477 10 20C10 14.477 14.477 10 20 10C14.477 10 10 5.523 10 0Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Smaller sparkle variant for inline/decorative use
 */
export function ClaudeSparkleSmall({ size = 12, color = "#da7756" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 0C10 5.523 5.523 10 0 10C5.523 10 10 14.477 10 20C10 14.477 14.477 10 20 10C14.477 10 10 5.523 10 0Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Claude check icon for feature lists
 */
export function ClaudeCheck({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Claude plus icon for FAQ accordion
 */
export function ClaudePlus({ size = 20, color = "currentColor", isOpen = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ transition: 'transform 200ms ease', transform: isOpen ? 'rotate(45deg)' : 'none' }}
    >
      <path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Claude arrow right icon
 */
export function ClaudeArrow({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Claude download icon
 */
export function ClaudeDownload({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Claude star rating icon
 */
export function ClaudeStar({ size = 14, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l1.9 3.85 4.25.62-3.08 3 .73 4.23L8 11.07l-3.8 2 .73-4.23-3.08-3 4.25-.62L8 1.5z"
        fill={filled ? "#da7756" : "none"}
        stroke="#da7756"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/* ── Sidebar Section Icons (Claude line-icon style) ────────────── */

/**
 * Profile/User icon — head and shoulders silhouette
 */
export function ClaudeProfileIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Education/Graduation cap icon
 */
export function ClaudeEducationIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3L1 8l9 5 9-5-9-5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 10.5v4c0 1.1 2.24 2 5 2s5-.9 5-2v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8v5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Experience/Briefcase icon
 */
export function ClaudeExperienceIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="16" height="11" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 6V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 11h16" stroke={color} strokeWidth="1.5"/>
      <path d="M9 11v2h2v-2" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Skills/Lightning bolt icon
 */
export function ClaudeSkillsIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 1L3 11h6l-2 8 9-10h-6l2-8z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Certificates/Award ribbon icon
 */
export function ClaudeCertificateIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="5" stroke={color} strokeWidth="1.5"/>
      <path d="M7 12.5l-1 5.5 4-2 4 2-1-5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 5C10 6.1 9.33 7 8.5 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

/**
 * File/Document icon for Word export
 */
export function ClaudeFileIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 1.5h5.5L13 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2.5a1 1 0 011-1z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 8.5h5M5.5 11h3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
