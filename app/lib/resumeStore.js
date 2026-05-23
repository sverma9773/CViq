/**
 * Resume Store — localStorage-based multi-resume management.
 * Each resume has: id, name, createdAt, updatedAt, data (the actual resume content)
 */

const STORAGE_KEY = "cviq_resumes";

const emptyResumeData = {
  profile: { fullName: "", jobTitle: "", email: "", phone: "", location: "", photoUrl: "" },
  education: [{ id: "edu-1", institution: "", degree: "", startDate: "", endDate: "", description: "" }],
  experience: [{ id: "exp-1", company: "", role: "", startDate: "", endDate: "", description: "" }],
  skills: [],
  certificates: [{ id: "cert-1", name: "", issuer: "", date: "" }],
};

const sampleResumeData = {
  profile: {
    fullName: "Sunil Verma",
    jobTitle: "Social Media & Content Marketing Specialist",
    email: "sunil.verma@email.com",
    phone: "+91 9876543210",
    location: "Delhi, India",
    photoUrl: "",
  },
  education: [
    { id: "edu-1", institution: "University of Delhi", degree: "MBA in Marketing", startDate: "2018", endDate: "2020", description: "Specialized in Digital Marketing and Brand Management." },
  ],
  experience: [
    { id: "exp-1", company: "TechCorp Solutions", role: "Senior Content Marketing Specialist", startDate: "Jan 2021", endDate: "Present", description: "Led content strategy across social media platforms, resulting in 150% growth in organic engagement. Managed a team of 4 content creators and coordinated with design and product teams." },
    { id: "exp-2", company: "Digital Wave Agency", role: "Social Media Manager", startDate: "Jun 2020", endDate: "Dec 2020", description: "Managed social media accounts for 8+ clients. Created and executed campaigns that drove a 200% increase in follower growth and brand awareness." },
  ],
  skills: ["Content Marketing", "Social Media Strategy", "SEO", "Google Analytics", "Copywriting", "Brand Management", "Digital Advertising", "Team Leadership"],
  certificates: [
    { id: "cert-1", name: "Google Digital Marketing Certification", issuer: "Google", date: "2023" },
    { id: "cert-2", name: "HubSpot Content Marketing", issuer: "HubSpot Academy", date: "2022" },
  ],
};

function generateId() {
  return `resume_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function getAllResumes() {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fallback migration from older "resumeforge_resumes" key
      const legacyRaw = localStorage.getItem("resumeforge_resumes");
      if (legacyRaw) {
        localStorage.setItem(STORAGE_KEY, legacyRaw);
        raw = legacyRaw;
      }
    }
    if (!raw) {
      // Migrate old single-resume data if exists
      const oldData = localStorage.getItem("resumeforge-data");
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const migrated = [{
          id: generateId(),
          name: parsed.profile?.fullName || "My Resume",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          data: parsed,
        }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      // Create a default resume for first-time users
      const defaultResume = [{
        id: generateId(),
        name: "Digital Transformation",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: sampleResumeData,
      }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultResume));
      return defaultResume;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getResumeById(id) {
  const all = getAllResumes();
  return all.find((r) => r.id === id) || null;
}

export function saveResume(id, data, name) {
  const all = getAllResumes();
  const index = all.findIndex((r) => r.id === id);
  if (index !== -1) {
    all[index].data = data;
    all[index].updatedAt = Date.now();
    if (name !== undefined) all[index].name = name;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function createResume(name = "Untitled Resume") {
  const all = getAllResumes();
  const newResume = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: { ...emptyResumeData },
  };
  all.push(newResume);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newResume;
}

export function duplicateResume(id) {
  const all = getAllResumes();
  const original = all.find((r) => r.id === id);
  if (!original) return null;
  const duplicate = {
    id: generateId(),
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: JSON.parse(JSON.stringify(original.data)),
  };
  all.push(duplicate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return duplicate;
}

export function deleteResume(id) {
  let all = getAllResumes();
  all = all.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function renameResume(id, newName) {
  const all = getAllResumes();
  const index = all.findIndex((r) => r.id === id);
  if (index !== -1) {
    all[index].name = newName;
    all[index].updatedAt = Date.now();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
