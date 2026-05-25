/**
 * Job Application Tracker Store with local persistence
 */

// Simple keyword matching utility
export function extractKeywords(text) {
  if (!text) return [];

  // Core industry keywords list for fast heuristic matching
  const INDUSTRY_KEYWORDS = [
    "react", "next.js", "nextjs", "vue", "angular", "javascript", "typescript", "python", "node", "nodejs", "express",
    "java", "c++", "c#", "ruby", "rails", "php", "aws", "cloud", "azure", "gcp", "sql", "nosql", "mongodb", "postgres",
    "docker", "kubernetes", "ci/cd", "jenkins", "git", "agile", "scrum", "kanban", "devops", "linux", "graphql", "rest api",
    "marketing", "seo", "sem", "sales", "finance", "accounting", "data science", "machine learning", "deep learning", "ai",
    "nlp", "product management", "project management", "ux", "ui", "product design", "figma", "graphic design", "hr",
    "recruiting", "talent acquisition", "business development", "analytics", "tableau", "powerbi", "excel", "strategy",
    "operation", "leadership", "cross-functional", "collaboration", "problem-solving", "communication", "analysis",
    "innovation", "budgets", "compliance", "client relations", "customer support", "quality assurance", "testing",
    "automation", "system design", "architecture", "microservices", "frontend", "backend", "fullstack", "security",
    "risk management", "consulting", "growth", "optimization", "saas", "b2b", "b2c", "crm", "salesforce"
  ];

  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s#+.-]/g, " ");
  const words = cleaned.split(/\s+/).filter(Boolean);

  const matched = new Set();
  
  // 1. Check industry keyword list
  INDUSTRY_KEYWORDS.forEach((kw) => {
    if (cleaned.includes(" " + kw + " ") || cleaned.includes(" " + kw + ",") || cleaned.includes(" " + kw + ".")) {
      matched.add(kw);
    }
  });

  // 2. Add high-frequency long words (nouns/adjectives) that aren't common stop words
  const stopWords = new Set([
    "the", "and", "a", "an", "to", "in", "for", "with", "on", "at", "by", "from", "of", "about", "as", "into", "like",
    "through", "after", "over", "between", "out", "against", "during", "without", "before", "under", "around", "among",
    "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
    "does", "did", "we", "they", "you", "he", "she", "it", "our", "their", "your", "his", "her", "its", "i", "me", "us",
    "them", "him", "can", "will", "would", "should", "could", "may", "might", "must", "shall", "our", "your", "who", "which"
  ]);

  const freqs = {};
  words.forEach(w => {
    if (w.length > 4 && !stopWords.has(w) && !INDUSTRY_KEYWORDS.includes(w)) {
      freqs[w] = (freqs[w] || 0) + 1;
    }
  });

  // Take top 8 high-frequency words
  Object.entries(freqs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([w]) => matched.add(w));

  return Array.from(matched);
}

// Compute ATS match score based on keyword intersection
export function calculateMatchScore(resumeData, jdText) {
  if (!jdText) return { score: 70, matchedKeywords: [], missingKeywords: [] };

  // Gather all resume text content
  const profileText = [
    resumeData.profile?.fullName,
    resumeData.profile?.jobTitle,
    resumeData.profile?.summary,
  ].filter(Boolean).join(" ");

  const experienceText = (resumeData.experience || [])
    .map(e => `${e.role} ${e.company} ${e.description}`)
    .join(" ");

  const educationText = (resumeData.education || [])
    .map(e => `${e.degree} ${e.institution}`)
    .join(" ");

  const skillsText = (resumeData.skills || []).join(" ");
  const certsText = (resumeData.certificates || []).map(c => c.name).join(" ");

  const resumeFullText = `${profileText} ${experienceText} ${educationText} ${skillsText} ${certsText}`.toLowerCase();
  
  const jdKeywords = extractKeywords(jdText);
  if (jdKeywords.length === 0) return { score: 75, matchedKeywords: [], missingKeywords: [] };

  const matchedKeywords = [];
  const missingKeywords = [];

  jdKeywords.forEach(kw => {
    // Exact or loose word boundary match
    const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (resumeFullText.match(regex) || resumeFullText.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const matchRatio = matchedKeywords.length / jdKeywords.length;
  // Score starts with a base structure score of 40 points, and keyword overlap adds up to 60 points
  const keywordPts = Math.round(matchRatio * 60);
  
  // Structure checks (similar to ATSChecker but simplified)
  let structPts = 0;
  if (resumeData.profile?.email) structPts += 8;
  if (resumeData.profile?.phone) structPts += 8;
  if (resumeData.experience?.length > 0) structPts += 12;
  if (resumeData.skills?.length >= 5) structPts += 12;

  const score = Math.min(structPts + keywordPts, 100);

  return {
    score,
    matchedKeywords,
    missingKeywords
  };
}

const STORAGE_KEY = "cviqly_jobtracker_applications";

export function getAllApplications() {
  if (typeof window === "undefined") return [];
  let stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Fallback migration from older "cviq_jobtracker_applications" key
    const legacyCviq = localStorage.getItem("cviq_jobtracker_applications");
    if (legacyCviq) {
      localStorage.setItem(STORAGE_KEY, legacyCviq);
      stored = legacyCviq;
    } else {
      // Fallback migration from older "resumeforge_jobtracker_applications" key
      const legacyRaw = localStorage.getItem("resumeforge_jobtracker_applications");
      if (legacyRaw) {
        localStorage.setItem(STORAGE_KEY, legacyRaw);
        stored = legacyRaw;
      }
    }
  }
  if (!stored) {
    // Generate default template applications for a nice initial visual dashboard state
    const defaults = [
      {
        id: "app_1",
        company: "Google",
        title: "Senior Full Stack Engineer",
        url: "https://careers.google.com",
        status: "Interviewing",
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        jdText: "Looking for an experienced engineer with strong skills in React, TypeScript, Next.js, and Node.js. Experience with system design and cloud deployments on GCP is preferred.",
        resumeId: "",
        coverLetterId: "",
        matchScore: 88
      },
      {
        id: "app_2",
        company: "Stripe",
        title: "Frontend Developer",
        url: "https://stripe.com/jobs",
        status: "Applied",
        appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        jdText: "We are seeking a Frontend Developer to build clean checkout flows using HTML, CSS, React, UI design, and JavaScript.",
        resumeId: "",
        coverLetterId: "",
        matchScore: 78
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
}

export function saveAllApplications(apps) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function createApplication(data) {
  const apps = getAllApplications();
  const newApp = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    company: data.company || "Company",
    title: data.title || "Job Title",
    url: data.url || "",
    status: data.status || "Wishlist",
    appliedDate: new Date().toISOString(),
    jdText: data.jdText || "",
    resumeId: data.resumeId || "",
    coverLetterId: data.coverLetterId || "",
    matchScore: data.matchScore || 0
  };
  apps.push(newApp);
  saveAllApplications(apps);
  return newApp;
}

export function updateApplication(id, data) {
  const apps = getAllApplications();
  const idx = apps.findIndex(a => a.id === id);
  if (idx !== -1) {
    apps[idx] = { ...apps[idx], ...data };
    saveAllApplications(apps);
    return apps[idx];
  }
  return null;
}

export function deleteApplication(id) {
  const apps = getAllApplications();
  const filtered = apps.filter(a => a.id !== id);
  saveAllApplications(filtered);
}
