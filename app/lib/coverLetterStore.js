/**
 * Cover Letter Store — localStorage-based management for professional cover letters.
 */

const STORAGE_KEY = "cviq_coverletters";

const emptyCoverLetterData = {
  profile: { fullName: "", jobTitle: "", email: "", phone: "", location: "" },
  recipient: { name: "", company: "", address: "" },
  letterDetails: {
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    subject: "",
    salutation: "Dear Hiring Team,",
    body: "I am writing to express my strong interest in the [Job Title] position at [Company]. With my background in [Your Field] and experience in [Your Core Skill], I am confident in my ability to contribute value to your team.\n\nIn my previous roles, I have demonstrated success in [Achievement 1] and [Achievement 2]. I am particularly drawn to [Company Name] because of your commitment to [Company Value or Project].\n\nThank you for your time and consideration. I look forward to discussing how my qualifications align with your requirements.",
    signOff: "Sincerely,\n[Your Name]",
  },
  template: "classic",
  customStyle: {
    font: "Playfair Display",
    spacing: "normal",
    margins: "normal",
    accent: "#da7756",
  },
};

const sampleCoverLetterData = {
  profile: {
    fullName: "Sunil Verma",
    jobTitle: "Social Media & Content Marketing Specialist",
    email: "sunil.verma@email.com",
    phone: "+91 9876543210",
    location: "Delhi, India",
  },
  recipient: {
    name: "Hiring Manager",
    company: "TechCorp Solutions Ltd.",
    address: "123 Business Boulevard, New Delhi, 110001",
  },
  letterDetails: {
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    subject: "RE: Social Media & Content Marketing Specialist Application",
    salutation: "Dear Hiring Manager,",
    body: "Thank you for the opportunity to submit my application for the Social Media & Content Marketing Specialist position at TechCorp Solutions. With my strong track record in growing organic brand engagement and driving high-converting campaigns, I am eager to bring my capabilities to your creative marketing team.\n\nIn my previous tenure at Digital Wave Agency, I managed social media campaigns for a diverse portfolio of clients, generating a 200% year-over-year increase in audience acquisition. I possess a deep understanding of SEO principles, Google Analytics, and persuasive copy writing that resonates with target demographies.\n\nI am particularly impressed by TechCorp's recent brand initiative and commitment to sustainable tech solutions. I would welcome the opportunity to discuss how my skill set and creative perspective can further expand TechCorp's brand awareness and digital presence.\n\nThank you for your time and valuable consideration.",
    signOff: "Sincerely,\nSunil Verma",
  },
  template: "classic",
  customStyle: {
    font: "Playfair Display",
    spacing: "normal",
    margins: "normal",
    accent: "#da7756",
  },
};

function generateId() {
  return `coverletter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function getAllCoverLetters() {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fallback migration
      const legacyRaw = localStorage.getItem("resumeforge_coverletters");
      if (legacyRaw) {
        localStorage.setItem(STORAGE_KEY, legacyRaw);
        raw = legacyRaw;
      }
    }
    if (!raw) {
      const defaultLetter = [{
        id: generateId(),
        name: "Google Application Cover Letter",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: sampleCoverLetterData,
      }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLetter));
      return defaultLetter;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCoverLetterById(id) {
  const all = getAllCoverLetters();
  return all.find((l) => l.id === id) || null;
}

export function saveCoverLetter(id, data, name) {
  const all = getAllCoverLetters();
  const index = all.findIndex((l) => l.id === id);
  if (index !== -1) {
    all[index].data = data;
    all[index].updatedAt = Date.now();
    if (name !== undefined) all[index].name = name;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function createCoverLetter(name = "Untitled Cover Letter") {
  const all = getAllCoverLetters();
  const newLetter = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: JSON.parse(JSON.stringify(emptyCoverLetterData)),
  };
  // Automatically pre-fill sender details if a resume profile exists!
  try {
    let resumes = localStorage.getItem("cviq_resumes");
    if (!resumes) {
      resumes = localStorage.getItem("resumeforge_resumes");
    }
    if (resumes) {
      const parsedResumes = JSON.parse(resumes);
      if (parsedResumes.length > 0 && parsedResumes[0].data?.profile) {
        const p = parsedResumes[0].data.profile;
        newLetter.data.profile = {
          fullName: p.fullName || "",
          jobTitle: p.jobTitle || "",
          email: p.email || "",
          phone: p.phone || "",
          location: p.location || "",
        };
        // Also update default signOff with their name
        if (p.fullName) {
          newLetter.data.letterDetails.signOff = `Sincerely,\n${p.fullName}`;
        }
      }
    }
  } catch (e) {
    console.error("Failed to prefill cover letter sender profile:", e);
  }

  all.push(newLetter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newLetter;
}

export function duplicateCoverLetter(id) {
  const all = getAllCoverLetters();
  const original = all.find((l) => l.id === id);
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

export function deleteCoverLetter(id) {
  let all = getAllCoverLetters();
  all = all.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function renameCoverLetter(id, newName) {
  const all = getAllCoverLetters();
  const index = all.findIndex((l) => l.id === id);
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
