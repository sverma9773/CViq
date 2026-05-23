/**
 * Resume Text Parser — heuristic-based extraction of structured data
 * from raw resume text (extracted from PDF or DOCX).
 */

const SECTION_PATTERNS = {
  experience: /^(?:(?:professional\s+)?experience|work\s+(?:experience|history)|employment|career\s+history)/i,
  education: /^(?:education|academic|qualifications|degrees?)/i,
  skills: /^(?:skills|technical\s+skills|core\s+(?:skills|competencies)|expertise|proficiencies|key\s+skills)/i,
  certificates: /^(?:certifica(?:te|tion)s?|licenses?|accreditations?|awards?)/i,
  profile: /^(?:profile|summary|objective|about\s*(?:me)?|professional\s+summary)/i,
  contact: /^(?:contact|personal\s+(?:info|details|information))/i,
};

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_REGEX = /(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;

// Matches: Jan 2021, January 2021, 2021, 01/2021, 05/2024
const MONTH_YEAR_SRC = "(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.\\s]*\\d{2,4}|\\d{1,2}\\/\\d{4}|(?:19|20)\\d{2})";
const MONTH_YEAR = new RegExp(MONTH_YEAR_SRC, "i");
// Full range: "Jan 2021 – Present"
const DATE_RANGE_REGEX = new RegExp(
  "(" + MONTH_YEAR_SRC + ")\\s*(?:[-–—]+|to)\\s*(" + MONTH_YEAR_SRC + "|[Pp]resent|[Cc]urrent|[Nn]ow|[Tt]ill\\s+[Dd]ate)",
  "i"
);

const KNOWN_LOCATIONS = /\b(?:Delhi|Mumbai|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Noida|Gurugram|Gurgaon|Greater Noida|New York|San Francisco|London|Remote|India|USA|UK)\b/i;
const ROLE_KEYWORDS = /(?:manager|director|lead|engineer|developer|designer|specialist|coordinator|consultant|analyst|associate|intern|vp|head|chief|officer|executive|senior|junior|assistant|marketing|advisor)/i;

export function parseResumeText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  const topLines = lines.slice(0, 20);
  const email = findMatch(topLines, EMAIL_REGEX);
  const phone = findMatch(topLines, PHONE_REGEX);

  // Name: first short line that isn't contact info
  let fullName = "";
  for (const line of lines.slice(0, 5)) {
    if (!EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) &&
        line.length > 2 && line.length < 50 && !isSectionHeader(line) &&
        !/linkedin/i.test(line) && !/^http/i.test(line)) {
      fullName = line;
      break;
    }
  }

  // Job title: next non-contact line after name
  let jobTitle = "";
  const nameIdx = lines.indexOf(fullName);
  if (nameIdx >= 0) {
    for (let i = nameIdx + 1; i < Math.min(nameIdx + 4, lines.length); i++) {
      const l = lines[i];
      if (!EMAIL_REGEX.test(l) && !PHONE_REGEX.test(l) && !isSectionHeader(l) &&
          l.length > 3 && l.length < 80 && !/linkedin/i.test(l) && !/^http/i.test(l)) {
        jobTitle = l;
        break;
      }
    }
  }

  // Location: strict "City, State" or known city names (not in long sentences)
  let location = "";
  for (const line of topLines) {
    const c = line.replace(/[|•·]/g, "").trim();
    if (c === fullName || c === jobTitle || c.length > 40) continue;
    // Must match known location AND be short (not a sentence)
    if (KNOWN_LOCATIONS.test(c) && c.split(" ").length <= 5) {
      location = c;
      break;
    }
  }

  const sections = splitIntoSections(lines);

  return {
    profile: {
      fullName: clean(fullName), jobTitle: clean(jobTitle),
      email: email || "", phone: phone || "",
      location: clean(location), photoUrl: "",
    },
    education: fallback(parseEducation(sections.education || []), [{ id: "edu-1", institution: "", degree: "", startDate: "", endDate: "", description: "" }]),
    experience: fallback(parseExperience(sections.experience || []), [{ id: "exp-1", company: "", role: "", startDate: "", endDate: "", description: "" }]),
    skills: parseSkills(sections.skills || []),
    certificates: fallback(parseCerts(sections.certificates || []), [{ id: "cert-1", name: "", issuer: "", date: "" }]),
  };
}

function fallback(arr, def) { return arr.length > 0 ? arr : def; }
function findMatch(lines, re) { for (const l of lines) { const m = l.match(re); if (m) return m[0]; } return null; }
function isSectionHeader(line) { const c = line.replace(/[:\-–—_|#*]/g, "").trim(); return Object.values(SECTION_PATTERNS).some(p => p.test(c)); }
function getSectionType(line) { const c = line.replace(/[:\-–—_|#*]/g, "").trim(); for (const [t, p] of Object.entries(SECTION_PATTERNS)) { if (p.test(c)) return t; } return null; }
function clean(t) { return (t || "").replace(/[|•·]/g, " ").replace(/\s+/g, " ").trim(); }

function splitIntoSections(lines) {
  const s = {}; let cur = null, cl = [];
  for (const line of lines) { const t = getSectionType(line); if (t) { if (cur) s[cur] = cl; cur = t; cl = []; } else if (cur) cl.push(line); }
  if (cur) s[cur] = cl;
  return s;
}

function getDateRange(text) {
  const rm = text.match(DATE_RANGE_REGEX);
  if (rm) return { start: rm[1], end: rm[2] };
  const sm = text.match(MONTH_YEAR);
  if (sm) return { start: sm[0], end: "" };
  return { start: "", end: "" };
}

function stripDates(text) {
  let t = text;
  const rm = t.match(DATE_RANGE_REGEX);
  if (rm) t = t.replace(rm[0], "");
  else { const sm = t.match(MONTH_YEAR); if (sm) t = t.replace(sm[0], ""); }
  return t.replace(/\s*[|–—-]+\s*$/, "").replace(/^\s*[|–—-]+\s*/, "").trim();
}

/**
 * Experience: detect new entries by date range lines.
 * Split "Company, Role - Location" patterns.
 */
function parseExperience(lines) {
  if (!lines.length) return [];
  const entries = [];
  let cur = null;

  for (const line of lines) {
    const dr = getDateRange(line);
    const hasDate = !!(dr.start || dr.end);

    if (hasDate) {
      if (cur) entries.push(cur);
      const header = stripDates(line);
      // Remove location from header
      const locMatch = header.match(KNOWN_LOCATIONS);
      let headerClean = header;
      if (locMatch) headerClean = header.replace(locMatch[0], "").replace(/[,|]\s*$/, "").trim();

      const { company, role } = splitCompanyRole(headerClean);
      cur = {
        id: `exp-${Date.now()}-${entries.length}`,
        company, role,
        startDate: dr.start, endDate: dr.end,
        description: "",
      };
    } else if (cur) {
      const isBullet = /^[•\-–*▪◦]/.test(line);
      // If company is empty and this is a short non-bullet line, treat as company
      if (!cur.company && !isBullet && line.length < 60 && line.length > 2) {
        cur.company = clean(line);
      } else {
        const desc = line.replace(/^[•\-–*▪◦]\s*/, "").trim();
        if (desc.length > 2) cur.description += (cur.description ? "\n" : "") + desc;
      }
    }
  }
  if (cur) entries.push(cur);
  return entries;
}

function splitCompanyRole(text) {
  if (!text) return { company: "", role: "" };
  // Try comma, pipe, " - "
  for (const sep of [/\s*,\s*/, /\s*\|\s*/, /\s+[-–—]\s+/]) {
    const parts = text.split(sep).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Part with role keywords = role, other = company
      if (ROLE_KEYWORDS.test(parts[1])) return { company: clean(parts[0]), role: clean(parts.slice(1).join(", ")) };
      if (ROLE_KEYWORDS.test(parts[0])) return { company: clean(parts.slice(1).join(", ")), role: clean(parts[0]) };
      return { company: clean(parts[0]), role: clean(parts.slice(1).join(", ")) };
    }
  }
  return { company: "", role: clean(text) };
}

function parseEducation(lines) {
  if (!lines.length) return [];
  const entries = []; let cur = null;
  const isDeg = l => /(?:b\.?\s*(?:sc|a|tech|e|com|eng)|m\.?\s*(?:sc|a|tech|e|ba|com|eng)|ph\.?\s*d|diploma|bachelor|master|doctor|bba|mba|pgd)/i.test(l);
  const isInst = l => /(?:university|college|institute|school|academy|iit|nit|iiit)/i.test(l);

  for (const line of lines) {
    const dr = getDateRange(line);
    if (isDeg(line) || isInst(line) || dr.start) {
      if (cur && (cur.degree || cur.institution)) { entries.push(cur); cur = null; }
      if (!cur) cur = { id: `edu-${Date.now()}-${entries.length}`, institution: "", degree: "", startDate: "", endDate: "", description: "" };
      const stripped = stripDates(line);
      if (isDeg(line)) cur.degree = cur.degree || clean(stripped);
      if (isInst(line)) cur.institution = cur.institution || clean(stripped);
      if (dr.start && !cur.startDate) { cur.startDate = dr.start; cur.endDate = dr.end; }
    } else if (cur) {
      cur.description += (cur.description ? " " : "") + line.replace(/^[•\-–*]\s*/, "").trim();
    }
  }
  if (cur) entries.push(cur);
  return entries;
}

function parseSkills(lines) {
  const s = [];
  for (const l of lines) { s.push(...l.split(/[,;|•·]+/).map(x => x.trim()).filter(x => x.length > 1 && x.length < 40)); }
  return [...new Set(s)].slice(0, 25);
}

function parseCerts(lines) {
  return lines.filter(l => l.length > 3).slice(0, 5).map((l, i) => {
    const dr = getDateRange(l);
    return { id: `cert-${Date.now()}-${i}`, name: clean(stripDates(l).replace(/^[•\-–*]\s*/, "")), issuer: "", date: dr.start || dr.end || "" };
  });
}

/**
 * Extract text from a PDF file using pdfjs-dist.
 * Reconstructs line breaks by tracking Y-coordinates of text items.
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items;
    if (items.length === 0) continue;

    const sorted = [...items].filter(it => it.str !== undefined).sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    let lastY = null, lineText = "";
    for (const item of sorted) {
      const y = Math.round(item.transform[5]);
      const t = item.str;
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        fullText += lineText.trim() + "\n";
        lineText = t;
      } else {
        if (lineText && !lineText.endsWith(" ") && t && !t.startsWith(" ")) lineText += " ";
        lineText += t;
      }
      lastY = y;
    }
    if (lineText.trim()) fullText += lineText.trim() + "\n";
    fullText += "\n";
  }
  return fullText;
}

/**
 * Extract text from a DOCX file using mammoth
 */
export async function extractTextFromDOCX(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
