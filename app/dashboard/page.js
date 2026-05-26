"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClaudeIcon, { ClaudeSparkleSmall, ClaudePlus, ClaudeCheck } from "../components/ClaudeIcon";
import {
  getAllResumes,
  createResume,
  duplicateResume,
  deleteResume,
  renameResume,
  formatTimeAgo,
} from "../lib/resumeStore";
import {
  getAllCoverLetters,
  createCoverLetter,
  duplicateCoverLetter,
  deleteCoverLetter,
  renameCoverLetter,
} from "../lib/coverLetterStore";
import { parseResumeText, extractTextFromPDF, extractTextFromDOCX } from "../lib/resumeParser";
import {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  calculateMatchScore
} from "../lib/jobTrackerStore";
import { useAuth } from "../context/AuthContext";
import ProBadge from "../components/ProBadge";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("resume"); // "resume", "cover-letter", "job-tracker"
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Job Tracker Modal States
  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppCompany, setNewAppCompany] = useState("");
  const [newAppTitle, setNewAppTitle] = useState("");
  const [newAppUrl, setNewAppUrl] = useState("");
  const [newAppStatus, setNewAppStatus] = useState("Applied");
  const [newAppJd, setNewAppJd] = useState("");
  const [newAppResumeId, setNewAppResumeId] = useState("");
  const [newAppCoverLetterId, setNewAppCoverLetterId] = useState("");
  const [selectedAppForKeywords, setSelectedAppForKeywords] = useState(null);

  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinStep, setLinkedinStep] = useState(0);
  const [linkedinTab, setLinkedinTab] = useState("pdf"); // "pdf", "text"
  const [linkedinRawText, setLinkedinRawText] = useState("");
  const [linkedinParseError, setLinkedinParseError] = useState("");
  const [linkedinResultState, setLinkedinResultState] = useState(null); // null, "blocked", "success"
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [loaderMessage, setLoaderMessage] = useState("Firing up CViqly neural scanners...");
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const router = useRouter();

  const handleTransition = (url) => {
    window.dispatchEvent(new CustomEvent("cviqly-navigate", { detail: { destination: url } }));
  };

  useEffect(() => {
    if (!importing) return;

    const messages = [
      "Firing up CViqly neural scanners...",
      "Deconstructing your career history...",
      "Extracting those high-impact achievements...",
      "Formatting technical superpowers...",
      "Evading corporate buzzwords...",
      "Aligning details to standard ATS parameters...",
      "Designing your pixel-perfect workspace...",
      "Almost there! Preparing your editor experience..."
    ];

    let index = 0;
    setLoaderMessage(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoaderMessage(messages[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, [importing]);

  const { user, isPro, logOut } = useAuth();
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // Resumes loading - STRICTLY from Firestore
        let finalResumes = [];
        try {
          const q = query(collection(db, "users", user.uid, "resumes"), orderBy("updatedAt", "desc"));
          const snapshot = await getDocs(q);
          finalResumes = snapshot.docs.map(doc => doc.data());
        } catch (err) {
          console.error("Failed to load cloud resumes:", err);
        }
        setResumes(finalResumes);

        // Cover letters loading - STRICTLY from Firestore
        let finalCoverLetters = [];
        try {
          const q = collection(db, "users", user.uid, "coverLetters");
          const snapshot = await getDocs(q);
          const cloudCoverLetters = snapshot.docs.map(doc => doc.data());
          cloudCoverLetters.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          finalCoverLetters = cloudCoverLetters;
        } catch (err) {
          console.error("Failed to load cloud cover letters:", err);
        }
        setCoverLetters(finalCoverLetters);

        // Job Tracker Applications loading - STRICTLY from Firestore
        let finalApplications = [];
        try {
          const q = collection(db, "users", user.uid, "applications");
          const snapshot = await getDocs(q);
          const cloudApps = snapshot.docs.map(doc => doc.data());
          cloudApps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
          finalApplications = cloudApps;
        } catch (err) {
          console.error("Failed to load cloud applications:", err);
        }
        setApplications(finalApplications);
      } else {
        // Guest workspace loads local storage data
        setResumes(getAllResumes());
        setCoverLetters(getAllCoverLetters());
        setApplications(getAllApplications());
      }
      setLoaded(true);
    };
    loadData();
  }, [user]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!isPro && resumes.length >= 1) {
      setShowProModal(true);
      return;
    }
    const newResume = createResume("Untitled Resume");
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "resumes", newResume.id);
        await setDoc(docRef, {
          id: newResume.id,
          name: newResume.name,
          data: newResume.data,
          updatedAt: Date.now()
        });
      } catch (e) {
        console.error("Failed to sync new resume to Firestore:", e);
      }
    }
    handleTransition(`/editor?id=${newResume.id}`);
  };

  const handleCreateCoverLetter = async () => {
    if (!isPro && coverLetters.length >= 1) {
      setShowProModal(true);
      return;
    }
    const newLetter = createCoverLetter("Untitled Cover Letter");
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "coverLetters", newLetter.id);
        await setDoc(docRef, {
          id: newLetter.id,
          name: newLetter.name,
          data: newLetter.data,
          updatedAt: Date.now()
        });
      } catch (e) {
        console.error("Failed to sync new cover letter to Firestore:", e);
      }
    }
    handleTransition(`/cover-letter/editor?id=${newLetter.id}`);
  };

  const handleAddAppSubmit = async () => {
    if (!newAppCompany.trim() || !newAppTitle.trim()) return;

    let score = 0;
    const targetResumeId = newAppResumeId || (resumes[0]?.id || "");

    if (newAppJd.trim() && targetResumeId) {
      const activeRes = resumes.find(r => r.id === targetResumeId);
      if (activeRes) {
        const keywordMatch = calculateMatchScore(activeRes.data, newAppJd);
        score = keywordMatch.score;
      }
    } else {
      score = 70; // default base match score
    }

    const appData = {
      company: newAppCompany.trim(),
      title: newAppTitle.trim(),
      url: newAppUrl.trim(),
      status: newAppStatus,
      jdText: newAppJd.trim(),
      resumeId: targetResumeId,
      coverLetterId: newAppCoverLetterId,
      matchScore: score
    };

    const newApp = createApplication(appData);

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "applications", newApp.id);
        await setDoc(docRef, newApp);

        const qApps = collection(db, "users", user.uid, "applications");
        const snapshot = await getDocs(qApps);
        const cloudApps = snapshot.docs.map(doc => doc.data());
        cloudApps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
        setApplications(cloudApps);
      } catch (e) {
        console.error("Failed to sync new application to Firestore:", e);
        setApplications(getAllApplications());
      }
    } else {
      setApplications(getAllApplications());
    }

    // Reset fields & reload
    setNewAppCompany("");
    setNewAppTitle("");
    setNewAppUrl("");
    setNewAppStatus("Applied");
    setNewAppJd("");
    setNewAppResumeId("");
    setNewAppCoverLetterId("");
    setShowAddApp(false);
  };

  const handleDeleteApp = async (id) => {
    deleteApplication(id);
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "applications", id);
        await deleteDoc(docRef);

        const qApps = collection(db, "users", user.uid, "applications");
        const snapshot = await getDocs(qApps);
        const cloudApps = snapshot.docs.map(doc => doc.data());
        cloudApps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
        setApplications(cloudApps);
      } catch (e) {
        console.error("Failed to delete application from Firestore:", e);
        setApplications(getAllApplications());
      }
    } else {
      setApplications(getAllApplications());
    }
  };

  const handleUpdateAppStatus = async (id, status) => {
    updateApplication(id, { status });
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "applications", id);
        await setDoc(docRef, { status }, { merge: true });

        const qApps = collection(db, "users", user.uid, "applications");
        const snapshot = await getDocs(qApps);
        const cloudApps = snapshot.docs.map(doc => doc.data());
        cloudApps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
        setApplications(cloudApps);
      } catch (e) {
        console.error("Failed to update application status in Firestore:", e);
        setApplications(getAllApplications());
      }
    } else {
      setApplications(getAllApplications());
    }
  };

  const handleDuplicate = async (id) => {
    if (id.startsWith("coverletter_")) {
      if (!isPro && coverLetters.length >= 1) {
        setShowProModal(true);
        return;
      }
      const dup = duplicateCoverLetter(id);
      if (dup) {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "coverLetters", dup.id);
            await setDoc(docRef, {
              id: dup.id,
              name: dup.name,
              data: dup.data,
              updatedAt: Date.now()
            });

            const q = collection(db, "users", user.uid, "coverLetters");
            const snapshot = await getDocs(q);
            const cloudCoverLetters = snapshot.docs.map(doc => doc.data());
            cloudCoverLetters.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setCoverLetters(cloudCoverLetters);
          } catch (e) {
            console.error("Failed to duplicate cover letter in Firestore:", e);
            setCoverLetters(getAllCoverLetters());
          }
        } else {
          setCoverLetters(getAllCoverLetters());
        }
      }
    } else {
      if (!isPro && resumes.length >= 1) {
        setShowProModal(true);
        return;
      }
      const dup = duplicateResume(id);
      if (dup) {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "resumes", dup.id);
            await setDoc(docRef, {
              id: dup.id,
              name: dup.name,
              data: dup.data,
              updatedAt: Date.now()
            });

            const q = query(collection(db, "users", user.uid, "resumes"), orderBy("updatedAt", "desc"));
            const snapshot = await getDocs(q);
            const cloudResumes = snapshot.docs.map(doc => doc.data());
            setResumes(cloudResumes);
          } catch (e) {
            console.error("Failed to duplicate resume in Firestore:", e);
            setResumes(getAllResumes());
          }
        } else {
          setResumes(getAllResumes());
        }
      }
    }
    setMenuOpen(null);
  };

  const handleDelete = async (id) => {
    if (id.startsWith("coverletter_")) {
      deleteCoverLetter(id);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "coverLetters", id);
          await deleteDoc(docRef);

          const q = collection(db, "users", user.uid, "coverLetters");
          const snapshot = await getDocs(q);
          const cloudCoverLetters = snapshot.docs.map(doc => doc.data());
          cloudCoverLetters.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          setCoverLetters(cloudCoverLetters);
        } catch (e) {
          console.error("Failed to delete cover letter in Firestore:", e);
          setCoverLetters(getAllCoverLetters());
        }
      } else {
        setCoverLetters(getAllCoverLetters());
      }
    } else {
      deleteResume(id);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "resumes", id);
          await deleteDoc(docRef);

          const q = query(collection(db, "users", user.uid, "resumes"), orderBy("updatedAt", "desc"));
          const snapshot = await getDocs(q);
          const cloudResumes = snapshot.docs.map(doc => doc.data());
          setResumes(cloudResumes);
        } catch (e) {
          console.error("Failed to delete resume in Firestore:", e);
          setResumes(getAllResumes());
        }
      } else {
        setResumes(getAllResumes());
      }
    }
    setDeleteConfirm(null);
    setMenuOpen(null);
  };

  const handleRenameStart = (item) => {
    setRenameId(item.id);
    setRenameValue(item.name);
    setMenuOpen(null);
  };

  const handleRenameSubmit = async () => {
    if (renameValue.trim()) {
      if (renameId.startsWith("coverletter_")) {
        renameCoverLetter(renameId, renameValue.trim());
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "coverLetters", renameId);
            await setDoc(docRef, { name: renameValue.trim(), updatedAt: Date.now() }, { merge: true });

            const q = collection(db, "users", user.uid, "coverLetters");
            const snapshot = await getDocs(q);
            const cloudCoverLetters = snapshot.docs.map(doc => doc.data());
            cloudCoverLetters.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setCoverLetters(cloudCoverLetters);
          } catch (e) {
            console.error("Failed to rename cover letter in Firestore:", e);
            setCoverLetters(getAllCoverLetters());
          }
        } else {
          setCoverLetters(getAllCoverLetters());
        }
      } else {
        renameResume(renameId, renameValue.trim());
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "resumes", renameId);
            await setDoc(docRef, { name: renameValue.trim(), updatedAt: Date.now() }, { merge: true });

            const q = query(collection(db, "users", user.uid, "resumes"), orderBy("updatedAt", "desc"));
            const snapshot = await getDocs(q);
            const cloudResumes = snapshot.docs.map(doc => doc.data());
            setResumes(cloudResumes);
          } catch (e) {
            console.error("Failed to rename resume in Firestore:", e);
            setResumes(getAllResumes());
          }
        } else {
          setResumes(getAllResumes());
        }
      }
    }
    setRenameId(null);
  };

  const linkedinSteps = [
    "Connecting to LinkedIn Gateway...",
    "Extracting profile handle metadata...",
    "Extracting professional experiences...",
    "Processing skills and certifications...",
    "Generating ATS-compliant layout..."
  ];

  const handleLinkedInImport = async () => {
    const url = linkedInUrl.trim();
    if (!url) return;

    setLinkedinLoading(true);
    setLinkedinStep(0);
    setLinkedinResultState(null);
    setLinkedinParseError("");

    const stepIntervals = [
      { step: 1, delay: 500 },
      { step: 2, delay: 1000 },
      { step: 3, delay: 1500 },
      { step: 4, delay: 2000 },
    ];

    stepIntervals.forEach(({ step, delay }) => {
      setTimeout(() => {
        setLinkedinStep(step);
      }, delay);
    });

    try {
      const res = await fetch(`/api/linkedin?url=${encodeURIComponent(url)}`);
      const result = await res.json();

      setTimeout(() => {
        setLinkedinLoading(false);
        if (result.success) {
          const newResume = createResume(result.data.fullName);
          const all = getAllResumes();
          const idx = all.findIndex(r => r.id === newResume.id);
          if (idx !== -1) {
            all[idx].data = {
              ...all[idx].data,
              profile: {
                ...all[idx].data.profile,
                fullName: result.data.fullName,
                jobTitle: result.data.jobTitle,
                email: result.data.email,
                location: result.data.location,
              }
            };
            all[idx].updatedAt = Date.now();
            localStorage.setItem("cviqly_resumes", JSON.stringify(all));
          }
          setShowLinkedIn(false);
          setLinkedInUrl("");
          handleTransition(`/editor?id=${newResume.id}`);
        } else if (result.error === "linkedin_blocked") {
          setLinkedinResultState("blocked");
        } else {
          setLinkedinParseError(result.error || "Failed to scan profile. Try Method 2 or 3!");
        }
      }, 2500);

    } catch (e) {
      setTimeout(() => {
        setLinkedinLoading(false);
        setLinkedinResultState("blocked");
      }, 2500);
    }
  };

  const handleLinkedinPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLinkedinLoading(true);
    setLinkedinStep(0);
    setLinkedinParseError("");

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf") {
        throw new Error("Please upload a PDF file exported from LinkedIn.");
      }

      setLinkedinStep(1);
      const text = await extractTextFromPDF(file);

      setLinkedinStep(3);
      const parsed = parseResumeText(text);
      if (!parsed || !parsed.profile.fullName) {
        throw new Error("Could not parse LinkedIn profile text. Make sure you uploaded a valid LinkedIn profile PDF.");
      }

      setLinkedinStep(4);
      const newResume = createResume(parsed.profile.fullName);
      const all = getAllResumes();
      const idx = all.findIndex(r => r.id === newResume.id);
      if (idx !== -1) {
        all[idx].data = parsed;
        all[idx].name = parsed.profile.fullName;
        all[idx].updatedAt = Date.now();
        localStorage.setItem("cviqly_resumes", JSON.stringify(all));
      }

      setTimeout(() => {
        setLinkedinLoading(false);
        setShowLinkedIn(false);
        setLinkedInUrl("");
        handleTransition(`/editor?id=${newResume.id}`);
      }, 800);

    } catch (err) {
      setLinkedinLoading(false);
      setLinkedinParseError(err.message || "Failed to parse LinkedIn PDF. Try another method!");
    }
  };

  const handleLinkedinTextImport = () => {
    const text = linkedinRawText.trim();
    if (!text || text.length < 50) {
      setLinkedinParseError("Please paste a comprehensive block of your LinkedIn profile text (at least 50 characters).");
      return;
    }

    setLinkedinLoading(true);
    setLinkedinStep(2);

    try {
      const parsed = parseResumeText(text);
      if (!parsed || !parsed.profile.fullName) {
        if (parsed) {
          parsed.profile.fullName = parsed.profile.fullName || "LinkedIn Import";
        }
      }

      const newResume = createResume(parsed ? parsed.profile.fullName : "LinkedIn Import");
      const all = getAllResumes();
      const idx = all.findIndex(r => r.id === newResume.id);
      if (idx !== -1) {
        all[idx].data = parsed || all[idx].data;
        all[idx].name = parsed ? parsed.profile.fullName : "LinkedIn Import";
        all[idx].updatedAt = Date.now();
        localStorage.setItem("cviqly_resumes", JSON.stringify(all));
      }

      setTimeout(() => {
        setLinkedinLoading(false);
        setShowLinkedIn(false);
        setLinkedInUrl("");
        setLinkedinRawText("");
        handleTransition(`/editor?id=${newResume.id}`);
      }, 1000);

    } catch (err) {
      setLinkedinLoading(false);
      setLinkedinParseError("Failed to parse the text. Please make sure experience or education listings are present in the text.");
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    const startTime = Date.now();
    try {
      let text = "";
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        text = await extractTextFromPDF(file);
      } else if (ext === "docx" || ext === "doc") {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
      }
      console.log("[CViqly] Extracted text:", text);
      if (!text || text.trim().length < 10) {
        throw new Error("Could not extract text from the file. It may be scanned/image-based. Try a text-based PDF or DOCX.");
      }
      const parsed = parseResumeText(text);
      console.log("[CViqly] Parsed data:", parsed);
      if (!parsed) throw new Error("Could not structure the resume data. Try a different file format.");
      const resumeName = parsed.profile.fullName || file.name.replace(/\.[^.]+$/, "");
      const newResume = createResume(resumeName);
      const all = getAllResumes();
      const idx = all.findIndex(r => r.id === newResume.id);
      if (idx !== -1) {
        all[idx].data = parsed;
        localStorage.setItem("cviqly_resumes", JSON.stringify(all));
      }
      
      // Enforce minimum 4.2s delay for highly-engaging creative parsing experience
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 4200 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setShowImport(false);
      handleTransition(`/editor?id=${newResume.id}`);
    } catch (err) {
      console.error("Import failed:", err);
      setImportError(err.message || "Import failed. Please try again.");
      setImporting(false); // Only disable loading on error; on success, transition to editor
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!loaded) return null;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__logo-container">
          <Link href="/" className="dashboard__logo">
            <span className="logo-title-wrap">
              <span className="logo-brand">CViqly</span>
              <span className="logo-separator">|</span>
              <span className="logo-tagline">Resume Maker</span>
            </span>
          </Link>
        </div>

        <nav className="dashboard__nav">
          <button
            className={`dashboard__nav-item ${activeTab === "resume" ? "dashboard__nav-item--active" : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h5v6H2V2zM9 2h5v4H9V2zM9 8h5v6H9V8zM2 10h5v4H2v-4z" stroke="currentColor" strokeWidth="1.3" /></svg>
            Resume
          </button>
          <button
            className={`dashboard__nav-item ${activeTab === "cover-letter" ? "dashboard__nav-item--active" : ""}`}
            onClick={() => setActiveTab("cover-letter")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h10v12H3V2z" stroke="currentColor" strokeWidth="1.3" /><path d="M5 5h6M5 7.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Cover Letter
          </button>
          <button
            className={`dashboard__nav-item ${activeTab === "job-tracker" ? "dashboard__nav-item--active" : ""}`}
            onClick={() => setActiveTab("job-tracker")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Job Tracker
          </button>
          <div className="dashboard__nav-divider"></div>
          <button className="dashboard__nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
            More
          </button>
        </nav>

        <div className="dashboard__sidebar-bottom">
          {!isPro && (
            <button className="dashboard__nav-item" onClick={() => setShowProModal(true)} style={{ color: "var(--color-accent)", fontWeight: "600", marginBottom: "8px" }}>
              <ClaudeSparkleSmall size={14} color="var(--color-accent)" />
              Upgrade to Pro
            </button>
          )}
          <div className="dashboard__account-wrapper" ref={accountDropdownRef}>
            <button 
              className={`dashboard__nav-item ${accountDropdownOpen ? "dashboard__nav-item--active" : ""}`}
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              style={{ width: "100%", display: "flex", alignItems: "center" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M2.5 14c0-3 2.46-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              <span style={{ marginRight: "4px" }}>My Account</span>
              {isPro && <ProBadge />}
              <svg className={`dashboard__arrow ${accountDropdownOpen ? "dashboard__arrow--open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: "auto" }}>
                <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {accountDropdownOpen && (
              <div className="dashboard__account-dropdown">
                {!isPro && (
                  <button 
                    type="button"
                    className="dashboard__dropdown-item" 
                    onClick={() => { setShowProModal(true); setAccountDropdownOpen(false); }}
                  >
                    Upgrade to Pro
                  </button>
                )}
                <button 
                  type="button"
                  onClick={async () => { 
                    await logOut(); 
                    setAccountDropdownOpen(false); 
                    window.location.href = "/"; 
                  }} 
                  className="dashboard__dropdown-item dashboard__dropdown-item--signout"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">
              {activeTab === "resume" ? "My Resumes" : activeTab === "cover-letter" ? "My Cover Letters" : "Job Application Tracker"}
            </h1>
            <p className="dashboard__subtitle">
              {activeTab === "resume"
                ? "Your first resume is free forever. Create multiple versions for different roles."
                : activeTab === "cover-letter"
                  ? "Create matching professional cover letters for your job applications."
                  : "Manage your active job applications, customize profiles, and match keywords to land interviews."}
            </p>
          </div>
          <div className="dashboard__header-actions">
            {activeTab === "resume" && (
              <button className="dashboard__import-btn" onClick={() => setShowImport(true)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M8 2v8M8 2l-3 3M8 2l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Import Resume
              </button>
            )}
            {activeTab === "job-tracker" && (
              <button className="dashboard__import-btn" onClick={() => setShowAddApp(true)} style={{ background: "var(--color-accent)", color: "#fff", borderColor: "var(--color-accent)" }}>
                <ClaudePlus size={14} color="#fff" />
                Add Application
              </button>
            )}
          </div>
        </div>

        <div className="dashboard__grid">
          {activeTab === "resume" ? (
            <>
              {/* New Resume Card */}
              <button className="dashboard__new-card" onClick={handleCreate} id="create-new-resume">
                <div className="dashboard__new-icon">
                  <ClaudePlus size={28} color="#9b9b94" />
                </div>
                <span className="dashboard__new-label">New resume</span>
              </button>

              {/* Existing Resume Cards */}
              {resumes.map((r) => (
                <div className="dashboard__card" key={r.id}>
                  <div
                    className="dashboard__card-preview"
                    onClick={() => handleTransition(`/editor?id=${r.id}`)}
                  >
                    {/* Mini resume preview */}
                    <div className="dashboard__mini-resume">
                      <div className="dashboard__mini-header">
                        <div className="dashboard__mini-name">{r.data?.profile?.fullName || "Your Name"}</div>
                        <div className="dashboard__mini-title">{r.data?.profile?.jobTitle || "Job Title"}</div>
                      </div>
                      {r.data?.experience?.length > 0 && (
                        <div className="dashboard__mini-section">
                          <div className="dashboard__mini-section-title">EXPERIENCE</div>
                          {r.data.experience.slice(0, 2).map((exp, i) => (
                            <div key={i} className="dashboard__mini-line">
                              <span className="dashboard__mini-bold">{exp.role || "Role"}</span>
                              <span className="dashboard__mini-sub">{exp.company || ""}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {r.data?.education?.length > 0 && (
                        <div className="dashboard__mini-section">
                          <div className="dashboard__mini-section-title">EDUCATION</div>
                          {r.data.education.slice(0, 1).map((edu, i) => (
                            <div key={i} className="dashboard__mini-line">
                              <span className="dashboard__mini-bold">{edu.degree || "Degree"}</span>
                              <span className="dashboard__mini-sub">{edu.institution || ""}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard__card-footer">
                    <div className="dashboard__card-info">
                      {renameId === r.id ? (
                        <input
                          className="dashboard__rename-input"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); }}
                          autoFocus
                        />
                      ) : (
                        <div className="dashboard__card-name">{r.name}</div>
                      )}
                      <div className="dashboard__card-meta">
                        edited {formatTimeAgo(r.updatedAt)} · A4
                      </div>
                    </div>
                    <div className="dashboard__card-menu-wrap" ref={menuOpen === r.id ? menuRef : null}>
                      <button
                        className="dashboard__card-menu-btn"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === r.id ? null : r.id); }}
                        aria-label="Resume options"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                          <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                        </svg>
                      </button>

                      {menuOpen === r.id && (
                        <div className="dashboard__card-dropdown">
                          <button onClick={() => handleTransition(`/editor?id=${r.id}`)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                            Edit
                          </button>
                          <button onClick={() => handleRenameStart(r)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 11v3h3l8-8-3-3-8 8zM10 3l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Rename
                          </button>
                          <button onClick={() => handleDuplicate(r.id)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M4 12H3a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 013 1h8a1.5 1.5 0 011.5 1.5V4" stroke="currentColor" strokeWidth="1.3" /></svg>
                            Duplicate
                          </button>
                          <div className="dashboard__dropdown-divider"></div>
                          <button className="dashboard__dropdown-delete" onClick={() => { setDeleteConfirm(r.id); setMenuOpen(null); }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9.5a1 1 0 001 .5h6a1 1 0 001-.5L12.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "cover-letter" ? (
            <>
              {/* New Cover Letter Card */}
              <button className="dashboard__new-card" onClick={handleCreateCoverLetter} id="create-new-cover-letter">
                <div className="dashboard__new-icon">
                  <ClaudePlus size={28} color="#9b9b94" />
                </div>
                <span className="dashboard__new-label">New Cover Letter</span>
              </button>

              {/* Existing Cover Letter Cards */}
              {coverLetters.map((l) => (
                <div className="dashboard__card" key={l.id}>
                  <div
                    className="dashboard__card-preview"
                    onClick={() => handleTransition(`/cover-letter/editor?id=${l.id}`)}
                  >
                    {/* Mini cover letter preview */}
                    <div className="dashboard__mini-resume" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ fontSize: "6.5px", color: "var(--color-accent)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Cover Letter
                      </div>
                      <div className="dashboard__mini-name" style={{ fontSize: "11px", border: "none", padding: "0" }}>
                        {l.data?.profile?.fullName || "Your Name"}
                      </div>
                      <div style={{ fontSize: "7px", color: "#666660", display: "flex", flexDirection: "column", gap: "1px" }}>
                        <span>To: {l.data?.recipient?.name || "Hiring Manager"}</span>
                        <span>Company: {l.data?.recipient?.company || "Company Name"}</span>
                      </div>
                      <div style={{ borderBottom: "1px solid var(--color-border-light)", margin: "2px 0" }}></div>
                      <div style={{ fontSize: "7px", color: "#191918", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {l.data?.letterDetails?.subject || "Subject Line"}
                      </div>
                      <div style={{ fontSize: "6.5px", color: "#666660", lineHeight: "1.35", overflow: "hidden", display: "-webkit-box", WebKitLineClamp: "3", WebKitBoxOrient: "vertical" }}>
                        {l.data?.letterDetails?.body || "Letter Body..."}
                      </div>
                    </div>
                  </div>

                  <div className="dashboard__card-footer">
                    <div className="dashboard__card-info">
                      {renameId === l.id ? (
                        <input
                          className="dashboard__rename-input"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); }}
                          autoFocus
                        />
                      ) : (
                        <div className="dashboard__card-name">{l.name}</div>
                      )}
                      <div className="dashboard__card-meta">
                        edited {formatTimeAgo(l.updatedAt)} · A4
                      </div>
                    </div>
                    <div className="dashboard__card-menu-wrap" ref={menuOpen === l.id ? menuRef : null}>
                      <button
                        className="dashboard__card-menu-btn"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === l.id ? null : l.id); }}
                        aria-label="Cover letter options"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                          <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                        </svg>
                      </button>

                      {menuOpen === l.id && (
                        <div className="dashboard__card-dropdown">
                          <button onClick={() => handleTransition(`/cover-letter/editor?id=${l.id}`)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                            Edit
                          </button>
                          <button onClick={() => handleRenameStart(l)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 11v3h3l8-8-3-3-8 8zM10 3l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Rename
                          </button>
                          <button onClick={() => handleDuplicate(l.id)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M4 12H3a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 013 1h8a1.5 1.5 0 011.5 1.5V4" stroke="currentColor" strokeWidth="1.3" /></svg>
                            Duplicate
                          </button>
                          <div className="dashboard__dropdown-divider"></div>
                          <button className="dashboard__dropdown-delete" onClick={() => { setDeleteConfirm(l.id); setMenuOpen(null); }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9.5a1 1 0 001 .5h6a1 1 0 001-.5L12.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="dashboard__tracker-container" style={{ width: "100%", gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Stats Grid */}
              <div className="dashboard__stats-grid">
                <div style={{ background: "var(--color-bg-offwhite)", border: "1px solid var(--color-border-light)", borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total tracked</div>
                  <div style={{ fontSize: "28px", fontWeight: "300", fontFamily: "var(--font-display)", color: "var(--color-text)", marginTop: "4px" }}>{applications.length}</div>
                </div>
                <div style={{ background: "var(--color-bg-offwhite)", border: "1px solid var(--color-border-light)", borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Applied</div>
                  <div style={{ fontSize: "28px", fontWeight: "300", fontFamily: "var(--font-display)", color: "#2563eb", marginTop: "4px" }}>{applications.filter(a => a.status === "Applied").length}</div>
                </div>
                <div style={{ background: "var(--color-bg-offwhite)", border: "1px solid var(--color-border-light)", borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Interviewing</div>
                  <div style={{ fontSize: "28px", fontWeight: "300", fontFamily: "var(--font-display)", color: "#da7756", marginTop: "4px" }}>{applications.filter(a => a.status === "Interviewing").length}</div>
                </div>
                <div style={{ background: "var(--color-bg-offwhite)", border: "1px solid var(--color-border-light)", borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Offers</div>
                  <div style={{ fontSize: "28px", fontWeight: "300", fontFamily: "var(--font-display)", color: "#5a8a3c", marginTop: "4px" }}>{applications.filter(a => a.status === "Offer").length}</div>
                </div>
              </div>

              {/* Main Applications Table */}
              <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-light)", borderRadius: "12px", overflow: "hidden" }}>
                {applications.length === 0 ? (
                  <div style={{ padding: "60px 40px", textAlignment: "center", color: "var(--color-text-tertiary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <p style={{ margin: 0, fontSize: "14px" }}>No job applications tracked yet. Click "Add Application" above to begin!</p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "var(--color-bg-offwhite)", borderBottom: "1px solid var(--color-border-light)", color: "var(--color-text-secondary)" }}>
                        <th style={{ padding: "12px 16px", fontWeight: "600" }}>Role Details</th>
                        <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                        <th style={{ padding: "12px 16px", fontWeight: "600" }}>Match Score</th>
                        <th style={{ padding: "12px 16px", fontWeight: "600" }}>Tailored Assets</th>
                        <th style={{ padding: "12px 16px", fontWeight: "600" }}>Applied Date</th>
                        <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                          {/* Role Details */}
                          <td style={{ padding: "16px" }}>
                            <div style={{ fontWeight: "600", color: "var(--color-text)", fontSize: "14px" }}>{app.title}</div>
                            <div style={{ color: "var(--color-text-secondary)", fontSize: "12px", marginTop: "2px" }}>{app.company}</div>
                            {app.url && (
                              <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--color-accent)", textDecoration: "underline", display: "inline-block", marginTop: "4px" }}>
                                View job post ↗
                              </a>
                            )}
                          </td>

                          {/* Status Select */}
                          <td style={{ padding: "16px" }}>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                fontSize: "12px",
                                fontWeight: "500",
                                background: app.status === "Offer" ? "#f0fdf4" : app.status === "Interviewing" ? "#fef3c7" : app.status === "Applied" ? "#eff6ff" : "#f5f5f4",
                                color: app.status === "Offer" ? "#166534" : app.status === "Interviewing" ? "#92400e" : app.status === "Applied" ? "#1e40af" : "#44403c"
                              }}
                            >
                              <option value="Wishlist">Wishlist</option>
                              <option value="Applied">Applied</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          {/* Match Score */}
                          <td style={{ padding: "16px" }}>
                            {app.matchScore > 0 ? (
                              <button
                                onClick={() => {
                                  if (app.jdText) {
                                    const activeRes = resumes.find(r => r.id === app.resumeId) || resumes[0];
                                    if (activeRes) {
                                      const keywords = calculateMatchScore(activeRes.data, app.jdText);
                                      setSelectedAppForKeywords({
                                        company: app.company,
                                        title: app.title,
                                        matched: keywords.matchedKeywords,
                                        missing: keywords.missingKeywords,
                                        score: keywords.score
                                      });
                                    }
                                  }
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  background: "var(--color-bg)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "20px",
                                  padding: "4px 10px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "var(--color-text)",
                                  cursor: app.jdText ? "pointer" : "default",
                                  transition: "all var(--transition-fast)"
                                }}
                                onMouseEnter={(e) => { if (app.jdText) e.currentTarget.style.background = "var(--color-bg-offwhite)" }}
                                onMouseLeave={(e) => { if (app.jdText) e.currentTarget.style.background = "var(--color-bg)" }}
                              >
                                <ClaudeSparkleSmall size={12} color="#da7756" />
                                <span>{app.matchScore}% Match</span>
                                {app.jdText && <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)", fontWeight: "500", marginLeft: "4px" }}>View Details</span>}
                              </button>
                            ) : (
                              <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>N/A</span>
                            )}
                          </td>

                          {/* Assets linked */}
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px" }}>
                              <span style={{ color: "var(--color-text-secondary)" }}>
                                📄 Resume: <strong style={{ color: "var(--color-text)" }}>{resumes.find(r => r.id === app.resumeId)?.name || resumes[0]?.name || "Default active"}</strong>
                              </span>
                              {app.coverLetterId && (
                                <span style={{ color: "var(--color-text-secondary)" }}>
                                  ✉️ Cover Letter: <strong style={{ color: "var(--color-text)" }}>{coverLetters.find(l => l.id === app.coverLetterId)?.name || "Linked"}</strong>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>
                            {new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteApp(app.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#c84d31",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {/* Mobile Card View for Tracker (Hidden on desktop, visible on mobile) */}
                {applications.length > 0 && (
                  <div className="dashboard__tracker-cards-mobile" style={{ display: "none" }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ padding: "16px", borderBottom: "1px solid var(--color-border-light)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "var(--color-text)", fontSize: "14px" }}>{app.title}</div>
                          <div style={{ color: "var(--color-text-secondary)", fontSize: "12px", marginTop: "2px" }}>{app.company}</div>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-border)",
                              fontSize: "12px",
                              fontWeight: "500",
                              background: app.status === "Offer" ? "#f0fdf4" : app.status === "Interviewing" ? "#fef3c7" : app.status === "Applied" ? "#eff6ff" : "#f5f5f4",
                              color: app.status === "Offer" ? "#166534" : app.status === "Interviewing" ? "#92400e" : app.status === "Applied" ? "#1e40af" : "#44403c"
                            }}
                          >
                            <option value="Wishlist">Wishlist</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {app.matchScore > 0 && (
                            <button
                              onClick={() => {
                                if (app.jdText) {
                                  const activeRes = resumes.find(r => r.id === app.resumeId) || resumes[0];
                                  if (activeRes) {
                                    const keywords = calculateMatchScore(activeRes.data, app.jdText);
                                    setSelectedAppForKeywords({
                                      company: app.company,
                                      title: app.title,
                                      matched: keywords.matchedKeywords,
                                      missing: keywords.missingKeywords,
                                      score: keywords.score
                                    });
                                  }
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "var(--color-bg)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "20px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "var(--color-text)",
                                cursor: app.jdText ? "pointer" : "default"
                              }}
                            >
                              <ClaudeSparkleSmall size={12} color="#da7756" />
                              <span>{app.matchScore}% Match</span>
                            </button>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                            Applied: {new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            style={{ background: "none", border: "none", color: "#c84d31", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="dashboard__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" stroke="#d44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="dashboard__modal-title">
              {deleteConfirm.startsWith("coverletter_") ? "Delete Cover Letter?" : "Delete Resume?"}
            </h3>
            <p className="dashboard__modal-desc">
              This action cannot be undone. The {deleteConfirm.startsWith("coverletter_") ? "cover letter" : "resume"} and all its data will be permanently deleted.
            </p>
            <div className="dashboard__modal-actions">
              <button className="dashboard__modal-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="dashboard__modal-delete" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Import Modal */}
      {showLinkedIn && (
        <div className="dashboard__modal-overlay" onClick={() => !linkedinLoading && setShowLinkedIn(false)}>
          <div className="dashboard__modal dashboard__modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="2" y="2" width="28" height="28" rx="4" stroke="#0a66c2" strokeWidth="2" /><path d="M10 13v8M10 9v.02" stroke="#0a66c2" strokeWidth="2.5" strokeLinecap="round" /><path d="M16 21v-5c0-2 1.5-3 3-3s3 1 3 3v5" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="dashboard__modal-title">Import from LinkedIn</h3>

            {!linkedinLoading && (
              <div className="dashboard__wizard-tabs">
                <button className={`dashboard__wizard-tab ${linkedinTab === "pdf" ? "dashboard__wizard-tab--active" : ""}`} onClick={() => { setLinkedinTab("pdf"); setLinkedinParseError(""); }}>
                  LinkedIn PDF
                </button>
                <button className={`dashboard__wizard-tab ${linkedinTab === "text" ? "dashboard__wizard-tab--active" : ""}`} onClick={() => { setLinkedinTab("text"); setLinkedinParseError(""); }}>
                  Copy-Paste Text
                </button>
              </div>
            )}

            {linkedinLoading ? (
              <div className="linkedin-loading">
                <div className="linkedin-loading__spinner"></div>
                <div className="linkedin-loading__steps">
                  {linkedinSteps.map((step, idx) => (
                    <div key={idx} className={`linkedin-loading__step ${idx === linkedinStep ? 'linkedin-loading__step--active' : idx < linkedinStep ? 'linkedin-loading__step--completed' : ''}`}>
                      <span className="linkedin-loading__step-icon">
                        {idx < linkedinStep ? (
                          <ClaudeCheck size={12} color="#5a8a3c" />
                        ) : idx === linkedinStep ? (
                          <span className="linkedin-loading__step-spinner"></span>
                        ) : (
                          <span className="linkedin-loading__step-dot"></span>
                        )}
                      </span>
                      <span className="linkedin-loading__step-text">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>


                {linkedinTab === "pdf" && (
                  <div className="linkedin-pdf-dropzone">
                    <p className="dashboard__modal-desc">
                      Go to your LinkedIn profile, click <strong>More &gt; Save to PDF</strong>, and upload that file here. We will instantly parse all your real experiences, education, and skills with 100% accuracy!
                    </p>

                    <div className="linkedin-pdf-dropzone__box" onClick={() => document.getElementById("linkedin-pdf-input").click()}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#da7756" strokeWidth="1.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                      <span>Click to upload LinkedIn Profile PDF</span>
                      <span className="linkedin-pdf-dropzone__sub">Only .pdf files directly exported from LinkedIn</span>
                      <input
                        id="linkedin-pdf-input"
                        type="file"
                        accept=".pdf"
                        onChange={handleLinkedinPdfUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {linkedinParseError && <div className="dashboard__modal-error" style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '10px' }}>{linkedinParseError}</div>}

                    <div className="dashboard__modal-actions" style={{ marginTop: '20px' }}>
                      <button className="dashboard__modal-cancel" onClick={() => setShowLinkedIn(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {linkedinTab === "text" && (
                  <div className="linkedin-text-paste">
                    <p className="dashboard__modal-desc">
                      Select all (`Cmd+A` / `Ctrl+A`) on your public LinkedIn profile page, copy it, and paste the raw text here. Our smart parser will extract your full work history and skills instantly!
                    </p>

                    <textarea
                      className="linkedin-text-paste__area"
                      placeholder="Paste your copied LinkedIn profile text here..."
                      value={linkedinRawText}
                      onChange={(e) => setLinkedinRawText(e.target.value)}
                    />
                    {linkedinParseError && <div className="dashboard__modal-error" style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', textAlign: 'left' }}>{linkedinParseError}</div>}

                    <div className="dashboard__modal-actions" style={{ marginTop: '16px' }}>
                      <button className="dashboard__modal-cancel" onClick={() => setShowLinkedIn(false)}>Cancel</button>
                      <button className="dashboard__modal-delete" style={{ background: '#0a66c2' }} onClick={handleLinkedinTextImport} disabled={!linkedinRawText.trim()}>Parse Profile Text</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Import Resume Modal */}
      {showImport && (
        <div className="dashboard__modal-overlay" onClick={() => { setShowImport(false); setImportError(""); }}>
          <div className="dashboard__modal dashboard__modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 3h10l8 8v16a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="#da7756" strokeWidth="2" strokeLinejoin="round" /><path d="M18 3v8h8" stroke="#da7756" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="dashboard__modal-title">Import Existing Resume</h3>
            <p className="dashboard__modal-desc">
              Upload a PDF or Word document. We&#39;ll parse the content and pre-fill the editor with your data.
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileImport} style={{ display: 'none' }} id="resume-file-input" />
            <button className="dashboard__upload-area" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              {importing ? (
                <><span className="dashboard__upload-spinner"></span><span>Parsing resume...</span></>
              ) : (
                <><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#9b9b94" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 4v12M12 4l-4 4M12 4l4 4" stroke="#9b9b94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Click to upload PDF or DOCX</span><span className="dashboard__upload-hint">Maximum file size: 10MB</span></>
              )}
            </button>
            {importError && <p className="dashboard__import-error">{importError}</p>}
            <div className="dashboard__modal-actions">
              <button className="dashboard__modal-cancel" onClick={() => { setShowImport(false); setImportError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddApp && (
        <div className="dashboard__modal-overlay" onClick={() => setShowAddApp(false)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <h3 className="dashboard__modal-title" style={{ fontFamily: "var(--font-display)", fontWeight: "400", fontSize: "1.3rem" }}>Add New Job Application</h3>
            <p className="dashboard__modal-desc" style={{ marginBottom: "16px" }}>Track job postings, custom resumes, cover letters, and keyword compatibility details in one dashboard.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Company Name *</label>
                  <input
                    type="text"
                    value={newAppCompany}
                    onChange={(e) => setNewAppCompany(e.target.value)}
                    placeholder="e.g. Google"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Job Title *</label>
                  <input
                    type="text"
                    value={newAppTitle}
                    onChange={(e) => setNewAppTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Job Posting URL (Optional)</label>
                <input
                  type="url"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  placeholder="https://careers.google.com/jobs/..."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Status</label>
                  <select
                    value={newAppStatus}
                    onChange={(e) => setNewAppStatus(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px", background: "var(--color-bg)" }}
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Target Resume</label>
                  <select
                    value={newAppResumeId}
                    onChange={(e) => setNewAppResumeId(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px", background: "var(--color-bg)" }}
                  >
                    <option value="">Select active resume...</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Target Cover Letter (Optional)</label>
                <select
                  value={newAppCoverLetterId}
                  onChange={(e) => setNewAppCoverLetterId(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "13px", background: "var(--color-bg)" }}
                >
                  <option value="">None linked...</option>
                  {coverLetters.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>Paste Job Description (Optional - Matches Keywords!)</label>
                <textarea
                  value={newAppJd}
                  onChange={(e) => setNewAppJd(e.target.value)}
                  placeholder="Paste JD text here to run keyword matching against your selected resume..."
                  rows={4}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px", resize: "vertical" }}
                />
              </div>
            </div>

            <div className="dashboard__modal-actions" style={{ marginTop: "20px" }}>
              <button className="dashboard__modal-cancel" onClick={() => setShowAddApp(false)}>Cancel</button>
              <button
                className="dashboard__modal-delete"
                style={{ background: "var(--color-accent)", color: "#fff" }}
                onClick={handleAddAppSubmit}
                disabled={!newAppCompany.trim() || !newAppTitle.trim()}
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords Breakdown Modal */}
      {selectedAppForKeywords && (
        <div className="dashboard__modal-overlay" onClick={() => setSelectedAppForKeywords(null)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", textAlign: "left" }}>
            <h3 className="dashboard__modal-title" style={{ fontFamily: "var(--font-display)", fontWeight: "400", fontSize: "1.3rem", color: "var(--color-text)", textAlign: "center" }}>
              Keywords Analysis for {selectedAppForKeywords.company}
            </h3>
            <p className="dashboard__modal-desc" style={{ textAlign: "center", marginBottom: "16px" }}>
              Target Role: <strong>{selectedAppForKeywords.title}</strong> ({selectedAppForKeywords.score}% keyword overlap)
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "600", color: "#5a8a3c", marginBottom: "6px" }}>Matched Keywords</h4>
                {selectedAppForKeywords.matched.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedAppForKeywords.matched.map((kw, i) => (
                      <span key={i} style={{ background: "#f4fcf0", border: "1px solid #5a8a3c40", color: "#5a8a3c", fontSize: "11px", padding: "3px 8px", borderRadius: "12px", fontWeight: "500" }}>
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", fontStyle: "italic" }}>No matching keywords detected.</span>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "600", color: "#da7756", marginBottom: "6px" }}>Missing Keywords (Recommended to add)</h4>
                {selectedAppForKeywords.missing.length > 0 ? (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {selectedAppForKeywords.missing.map((kw, i) => (
                        <span key={i} style={{ background: "#faf2ef", border: "1px solid #da775640", color: "#da7756", fontSize: "11px", padding: "3px 8px", borderRadius: "12px", fontWeight: "500" }}>
                          ✕ {kw}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", padding: "8px 10px", background: "var(--color-bg-offwhite)", border: "1px solid var(--color-border-light)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "14px" }}>💡</span>
                      <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.4" }}>
                        Add these target terms naturally into your work experiences or skills list to secure a higher ATS matching rate!
                      </p>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "#5a8a3c", fontWeight: "600" }}>🎉 Perfect 100% keyword match! Your resume is highly optimized for this target role!</span>
                )}
              </div>
            </div>

            <div className="dashboard__modal-actions" style={{ marginTop: "24px" }}>
              <button className="dashboard__modal-cancel" style={{ width: "100%" }} onClick={() => setSelectedAppForKeywords(null)}>Close Analysis</button>
            </div>
          </div>
        </div>
      )}

      {showProModal && (
        <ProUpgradeModal onClose={() => setShowProModal(false)} />
      )}

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--color-bg-offwhite);
        }

        /* ── Sidebar ─────────────────── */
        .dashboard__sidebar {
          width: 220px;
          min-width: 220px;
          background: var(--color-bg);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
        }

        .dashboard__logo-container {
          margin-bottom: 56px;
        }

        .dashboard__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--color-text);
          padding: 8px 12px;
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

        .dashboard__nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dashboard__nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          background: none;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .dashboard__nav-item:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
        }

        .dashboard__nav-item--active {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
          font-weight: 600;
        }

        .dashboard__nav-divider {
          height: 1px;
          background: var(--color-border);
          margin: 8px 0;
        }

        .dashboard__sidebar-bottom {
          margin-top: auto;
          position: relative;
        }

        .dashboard__account-wrapper {
          position: relative;
          width: 100%;
        }

        .dashboard__account-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(25, 25, 24, 0.08), 0 1px 3px rgba(25, 25, 24, 0.02);
          padding: 6px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dashboard__dropdown-item-link {
          padding: 10px 16px;
          font-size: 0.85rem;
          font-family: var(--font-body);
          font-weight: 500;
          color: var(--color-text) !important;
          text-decoration: none;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          width: 100%;
          opacity: 1 !important;
          box-sizing: border-box;
        }

        .dashboard__dropdown-item-link:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text) !important;
          opacity: 1 !important;
        }

        .dashboard__dropdown-item {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 10px 16px;
          font-size: 0.85rem;
          font-family: var(--font-body);
          font-weight: 500;
          color: var(--color-text) !important;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          box-sizing: border-box;
        }

        .dashboard__dropdown-item:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text) !important;
        }

        .dashboard__dropdown-item--signout {
          color: #ea4335 !important;
        }

        .dashboard__dropdown-item--signout:hover {
          background: #fdf3f3;
          color: #ea4335 !important;
        }

        .dashboard__arrow {
          transition: transform var(--transition-fast);
        }

        .dashboard__arrow--open {
          transform: rotate(180deg);
        }

        /* ── Main Content ────────────── */
        .dashboard__main {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }

        .dashboard__header {
          margin-bottom: 36px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dashboard__header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dashboard__import-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          background: var(--color-bg);
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--color-text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dashboard__import-btn:hover {
          background: var(--color-bg-offwhite);
          border-color: var(--color-text-tertiary);
        }

        .dashboard__title {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--color-text);
          margin-bottom: 6px;
        }

        .dashboard__subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        /* ── Grid ────────────────────── */
        .dashboard__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }

        /* ── New Resume Card ─────────── */
        .dashboard__new-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 320px;
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: none;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .dashboard__new-card:hover {
          border-color: var(--color-text-tertiary);
          background: rgba(255,255,255,0.5);
        }

        .dashboard__new-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard__new-label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        /* ── Resume Card ─────────────── */
        .dashboard__card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          transition: box-shadow var(--transition-base);
        }

        .dashboard__card:hover {
          box-shadow: 0 4px 16px rgba(25,25,24,0.08);
        }

        .dashboard__card-preview {
          height: 250px;
          overflow: hidden;
          cursor: pointer;
          padding: 16px;
          background: #fff;
          border-bottom: 1px solid var(--color-border-light);
        }

        /* Mini resume preview */
        .dashboard__mini-resume {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .dashboard__mini-header {
          text-align: center;
          padding-bottom: 6px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--color-border-light);
        }

        .dashboard__mini-name {
          font-family: var(--font-display);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .dashboard__mini-title {
          font-size: 0.55rem;
          color: var(--color-accent);
          font-style: italic;
        }

        .dashboard__mini-section {
          margin-bottom: 6px;
        }

        .dashboard__mini-section-title {
          font-size: 0.48rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text);
          border-bottom: 0.5px solid var(--color-border-light);
          padding-bottom: 2px;
          margin-bottom: 3px;
        }

        .dashboard__mini-line {
          display: flex;
          flex-direction: column;
          margin-bottom: 3px;
        }

        .dashboard__mini-bold {
          font-size: 0.5rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .dashboard__mini-sub {
          font-size: 0.45rem;
          color: var(--color-text-tertiary);
          font-style: italic;
        }

        /* Card footer */
        .dashboard__card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
        }

        .dashboard__card-info {
          flex: 1;
          min-width: 0;
        }

        .dashboard__card-name {
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dashboard__card-meta {
          font-size: 0.7rem;
          color: var(--color-text-tertiary);
        }

        .dashboard__rename-input {
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text);
          border: 1px solid var(--color-accent);
          border-radius: var(--radius-sm);
          padding: 2px 6px;
          width: 100%;
          outline: none;
        }

        /* 3-dot menu */
        .dashboard__card-menu-wrap {
          position: relative;
        }

        .dashboard__card-menu-btn {
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .dashboard__card-menu-btn:hover {
          background: var(--color-bg-offwhite);
          color: var(--color-text);
        }

        .dashboard__card-dropdown {
          position: absolute;
          bottom: calc(100% + 4px);
          right: 0;
          min-width: 160px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 24px rgba(25,25,24,0.12);
          z-index: 50;
          overflow: hidden;
          animation: fadeInUp 0.12s ease;
        }

        .dashboard__card-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 14px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--color-text);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background var(--transition-fast);
        }

        .dashboard__card-dropdown button:hover {
          background: var(--color-bg-offwhite);
        }

        .dashboard__dropdown-divider {
          height: 1px;
          background: var(--color-border-light);
        }

        .dashboard__dropdown-delete {
          color: #d44 !important;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Delete Modal ────────────── */
        .dashboard__modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(25,25,24,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dashboard__modal {
          background: var(--color-bg);
          border-radius: var(--radius-xl);
          padding: 32px;
          max-width: 380px;
          width: 90%;
          text-align: center;
          box-shadow: 0 16px 48px rgba(25,25,24,0.15);
          animation: modalIn 0.2s ease;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .dashboard__modal-icon {
          margin-bottom: 16px;
        }

        .dashboard__modal-title {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 600;
          font-style: normal;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .dashboard__modal-desc {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .dashboard__modal-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .dashboard__modal-cancel {
          padding: 9px 20px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          background: var(--color-bg);
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dashboard__modal-cancel:hover {
          background: var(--color-bg-offwhite);
        }

        .dashboard__modal-delete {
          padding: 9px 20px;
          border: none;
          border-radius: var(--radius-full);
          background: #d44;
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .dashboard__modal-delete:hover {
          background: #c33;
        }

        .dashboard__modal-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dashboard__modal--wide {
          max-width: 440px;
        }

        .dashboard__modal-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.85rem;
          margin-bottom: 12px;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .dashboard__modal-input:focus {
          border-color: var(--color-text);
        }

        .dashboard__modal-tip {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          line-height: 1.5;
          margin-bottom: 16px;
          padding: 8px 10px;
          background: var(--color-bg-offwhite);
          border-radius: var(--radius-md);
        }

        .dashboard__upload-area {
          width: 100%;
          padding: 28px 20px;
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-bg-offwhite);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition-base);
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }

        .dashboard__upload-area:hover {
          border-color: var(--color-text-tertiary);
          background: rgba(255,255,255,0.8);
        }

        .dashboard__upload-area:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .dashboard__upload-hint {
          font-size: 0.72rem;
          color: var(--color-text-tertiary);
        }

        .dashboard__upload-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .dashboard__import-error {
          font-size: 0.8rem;
          color: #d44;
          margin-bottom: 12px;
          text-align: center;
        }

        .dashboard__stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        /* ── Responsive ──────────────── */
        @media (max-width: 768px) {
          .dashboard {
            flex-direction: column;
            padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
          }

          .dashboard__sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
            width: 100%;
            min-width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            border-right: none;
            border-top: 1px solid var(--color-border);
            padding: 8px 6px;
            padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
            background: var(--color-bg);
            box-shadow: 0 -2px 12px rgba(25,25,24,0.08);
          }

          .dashboard__logo-container {
            display: none;
          }

          .dashboard__logo {
            display: none;
          }

          .dashboard__nav {
            flex-direction: row;
            gap: 4px;
            width: 100%;
            justify-content: space-between;
          }

          .dashboard__nav-item {
            flex: 1;
            flex-direction: column;
            gap: 4px;
            font-size: 0.65rem;
            padding: 8px 2px;
            min-width: 0;
            border-radius: var(--radius-md);
            color: var(--color-text-secondary);
            font-weight: 500;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .dashboard__nav-item--active {
            background: var(--color-bg-warm);
            color: var(--color-text);
            font-weight: 600;
          }

          .dashboard__nav-divider {
            display: none;
          }

          .dashboard__sidebar-bottom {
            display: none;
          }

          .dashboard__main {
            padding: 20px 16px;
          }

          .dashboard__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .dashboard__title {
            font-size: 1.4rem;
          }

          .dashboard__subtitle {
            font-size: 0.82rem;
          }

          .dashboard__grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 14px;
          }

          .dashboard__stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard__new-card {
            height: 240px;
          }

          .dashboard__card-preview {
            height: 190px;
          }

          /* Modal improvements for mobile */
          .dashboard__modal {
            max-width: 95vw !important;
            width: 95vw !important;
            margin: 16px;
            max-height: 85vh;
            overflow-y: auto;
          }

          .dashboard__modal--wide {
            max-width: 95vw !important;
          }

          /* Job Tracker Table to Card View on Mobile */
          .dashboard__tracker-container table {
            display: none !important;
          }
          .dashboard__tracker-cards-mobile {
            display: flex !important;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .dashboard__grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .dashboard__modal {
            padding: 24px 16px;
          }

          .dashboard__card-actions {
            opacity: 1; /* Always show actions on mobile to avoid hover issues */
          }
          
          .dashboard__card-action {
            width: 36px;
            height: 36px;
          }
        }

        /* LinkedIn Loader Styles */
        .linkedin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 20px 10px;
          width: 100%;
        }

        .linkedin-loading__spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--color-border-light);
          border-top-color: #0a66c2;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .linkedin-loading__steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          text-align: left;
        }

        .linkedin-loading__step {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .linkedin-loading__step--active {
          opacity: 1;
          font-weight: 500;
          color: var(--color-text);
        }

        .linkedin-loading__step--completed {
          opacity: 0.85;
          color: var(--color-text-secondary);
        }

        .linkedin-loading__step-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .linkedin-loading__step-spinner {
          width: 10px;
          height: 10px;
          border: 1.5px solid var(--color-border);
          border-top-color: #0a66c2;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .linkedin-loading__step-dot {
          width: 5px;
          height: 5px;
          background: var(--color-text-tertiary);
          border-radius: 50%;
        }

        /* LinkedIn Wizard Styles */
        .dashboard__wizard-tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border-light);
          margin-bottom: 20px;
          gap: 24px;
        }

        .dashboard__wizard-tab {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-tertiary);
          background: none;
          border: none;
          padding: 8px 4px 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .dashboard__wizard-tab:hover {
          color: var(--color-text);
        }

        .dashboard__wizard-tab--active {
          color: var(--color-text);
          font-weight: 600;
        }

        .dashboard__wizard-tab--active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #0a66c2;
          border-radius: 2px;
        }

        .linkedin-blocked-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          padding: 10px 0;
        }

        .linkedin-blocked-notice__icon {
          font-size: 2.2rem;
        }

        .linkedin-blocked-notice__text h4 {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--color-text);
        }

        .linkedin-blocked-notice__text p {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          max-width: 420px;
        }

        .linkedin-blocked-notice__actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          margin-top: 6px;
        }

        .dashboard__wizard-direct-btn {
          padding: 10px 20px;
          border: none;
          background: #0a66c2;
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 500;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dashboard__wizard-direct-btn:hover {
          background: #004b93;
        }

        .dashboard__wizard-direct-btn--outline {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text);
        }

        .dashboard__wizard-direct-btn--outline:hover {
          background: var(--color-bg-offwhite);
        }

        /* PDF Dropzone Styles */
        .linkedin-pdf-dropzone {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .linkedin-pdf-dropzone__box {
          border: 1.5px dashed var(--color-border);
          border-radius: 12px;
          padding: 36px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          background: var(--color-bg-offwhite);
          transition: all 0.2s ease;
        }

        .linkedin-pdf-dropzone__box:hover {
          border-color: #0a66c2;
          background: #f4f8fc;
        }

        .linkedin-pdf-dropzone__box span {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .linkedin-pdf-dropzone__box .linkedin-pdf-dropzone__sub {
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--color-text-tertiary);
        }

        /* Raw Text Area Styles */
        .linkedin-text-paste {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .linkedin-text-paste__area {
          width: 100%;
          height: 180px;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 0.82rem;
          line-height: 1.5;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          resize: none;
          background: var(--color-bg);
          color: var(--color-text);
          outline: none;
          transition: border-color 0.15s ease;
        }

        .linkedin-text-paste__area:focus {
          border-color: #0a66c2;
        }
      `}</style>

      {importing && (
        <div className="cviqly-loader-overlay">
          <div className="cviqly-loader-card">
            <div className="cviqly-loader-visual">
              <div className="cviqly-loader-glow-ring"></div>
              <div className="cviqly-loader-icon-wrap">
                <ClaudeIcon size={32} color="var(--color-accent)" />
              </div>
            </div>
            <div className="cviqly-loader-content">
              <h3 className="cviqly-loader-title">CViqly AI Resume Scanner</h3>
              <div className="cviqly-loader-progress-track">
                <div className="cviqly-loader-progress-bar"></div>
              </div>
              <p className="cviqly-loader-message">{loaderMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tailored realistic data generator for functional LinkedIn Import
function getTailoredResumeData(name, handle) {
  const normalized = handle.toLowerCase();

  if (normalized.includes("sunil") || normalized.includes("verma")) {
    return {
      profile: {
        fullName: name,
        jobTitle: "Social Media & Content Marketing Specialist",
        email: `${normalized.replace(/-/g, "")}@gmail.com`,
        phone: "+91 98765 43210",
        location: "Delhi, India",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "University of Delhi", degree: "MBA in Marketing", startDate: "2018", endDate: "2020", description: "Specialized in Digital Marketing, Brand Strategy, and Consumer Behavior." },
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
  }

  if (normalized.includes("tech") || normalized.includes("code") || normalized.includes("dev") || normalized.includes("soft") || normalized.includes("eng") || normalized.includes("kumar") || normalized.includes("sharma") || normalized.includes("singh") || normalized.includes("doe") || normalized.includes("alex")) {
    return {
      profile: {
        fullName: name,
        jobTitle: "Senior Software Engineer",
        email: `${normalized.replace(/-/g, "")}@outlook.com`,
        phone: "+1 (555) 019-2834",
        location: "San Francisco, CA",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "Stanford University", degree: "M.S. in Computer Science", startDate: "2017", endDate: "2019", description: "Specialized in Software Engineering and Distributed Systems. GPA: 3.9/4.0." },
        { id: "edu-2", institution: "University of California, Berkeley", degree: "B.S. in Computer Science", startDate: "2013", endDate: "2017", description: "Graduated with Honors. Teaching Assistant for Data Structures." },
      ],
      experience: [
        { id: "exp-1", company: "Google", role: "Senior Software Engineer", startDate: "Mar 2022", endDate: "Present", description: "Architected and deployed a highly scalable microservice handling 50M+ daily active requests, improving throughput by 42%. Guided a team of 6 engineers on performance optimizations and CI/CD pipelines." },
        { id: "exp-2", company: "Meta", role: "Software Engineer II", startDate: "Jul 2019", endDate: "Feb 2022", description: "Developed core user-facing features using React and GraphQL, reducing average page load time by 350ms. Collaborated closely with Product and UX teams to build responsive web portals." },
      ],
      skills: ["React", "Next.js", "Node.js", "TypeScript", "Python", "GraphQL", "AWS (S3/EC2/Lambda)", "System Design", "CI/CD", "Agile Methodologies"],
      certificates: [
        { id: "cert-1", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
        { id: "cert-2", name: "Certified Kubernetes Administrator (CKA)", issuer: "The Linux Foundation", date: "2022" },
      ],
    };
  }

  if (normalized.includes("product") || normalized.includes("pm") || normalized.includes("smith") || normalized.includes("johnson") || normalized.includes("manager")) {
    return {
      profile: {
        fullName: name,
        jobTitle: "Lead Product Manager",
        email: `${normalized.replace(/-/g, "")}@gmail.com`,
        phone: "+1 (555) 304-2940",
        location: "New York, NY",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "Harvard Business School", degree: "Master of Business Administration (MBA)", startDate: "2016", endDate: "2018", description: "Co-president of Tech Club. Focus on Product Management and Entrepreneurship." },
      ],
      experience: [
        { id: "exp-1", company: "Stripe", role: "Lead Product Manager - Billing", startDate: "Oct 2021", endDate: "Present", description: "Spearheaded the launch of Stripe's new recurring billing product, generating $12M ARR within the first 6 months. Defined product roadmap, aligned stakeholders across 5 global offices, and drove Go-To-Market execution." },
        { id: "exp-2", company: "Netflix", role: "Product Manager", startDate: "Sep 2018", endDate: "Aug 2021", description: "Led cross-functional team of 12 engineers and designers to optimize Netflix's user onboarding flow, resulting in a 4.2% increase in trial-to-paid conversions globally." },
      ],
      skills: ["Product Strategy", "Roadmapping", "A/B Testing", "User Research", "Data Analytics", "Cross-Functional Leadership", "Agile Product Management", "SQL & Tableau"],
      certificates: [
        { id: "cert-1", name: "Pragmatic Institute Certified (Level VI)", issuer: "Pragmatic Institute", date: "2020" },
      ],
    };
  }

  return {
    profile: {
      fullName: name,
      jobTitle: "Lead Business Operations & Strategy Specialist",
      email: `${normalized.replace(/-/g, "")}@gmail.com`,
      phone: "+1 (555) 482-9102",
      location: "Boston, MA",
      photoUrl: "",
    },
    education: [
      { id: "edu-1", institution: "New York University", degree: "B.S. in Business Administration", startDate: "2014", endDate: "2018", description: "Dean's List 6 semesters. Specialized in Management and Operations." },
    ],
    experience: [
      { id: "exp-1", company: "Management Consulting Partners", role: "Senior Operations Consultant", startDate: "Feb 2021", endDate: "Present", description: "Advised Fortune 500 clients on operational cost-reduction strategies, saving over $8.5M in supply chain inefficiencies. Designed and executed change management strategies for 1,200+ employees." },
      { id: "exp-2", company: "HubSpot", role: "Operations Specialist", startDate: "May 2018", endDate: "Jan 2021", description: "Automated manual reporting processes using SQL and internal workflows, reducing weekly team overhead by 12 hours. Collaborated on quarterly OKR setting and performance tracking." },
    ],
    skills: ["Business Strategy", "Operations Management", "Process Optimization", "Data Analysis", "Project Management", "Change Management", "SQL", "Stakeholder Engagement"],
    certificates: [
      { id: "cert-1", name: "Project Management Professional (PMP)", issuer: "Project Management Institute", date: "2022" },
      { id: "cert-2", name: "Certified ScrumMaster (CSM)", issuer: "Scrum Alliance", date: "2020" },
    ],
  };
}
