"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumeProvider, useResume } from "../context/ResumeContext";
import { getResumeById, getAllResumes } from "../lib/resumeStore";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import EditorTopBar from "./components/EditorTopBar";
import Sidebar from "./components/Sidebar";
import ResumePreview from "./components/ResumePreview";
import TemplateSelector from "./components/TemplateSelector";
import AdvancedCustomization from "./components/AdvancedCustomization";
import ATSChecker from "./components/ATSChecker";
import { ClaudeSparkleSmall } from "../components/ClaudeIcon";
import AISidebar, { SparkleBotIcon } from "./components/AISidebar";

/* Customize tab — template picker + advanced options + live preview */
function CustomizeView() {
  const { resumeData, dispatch } = useResume();
  const template = resumeData.template || "classic";

  return (
    <div className="customize-view">
      <div className="customize-view__left">
        <TemplateSelector
          selectedTemplate={template}
          onSelect={(id) => dispatch({ type: "SET_TEMPLATE", payload: id })}
        />
        <AdvancedCustomization />
      </div>
      <div className="customize-view__right">
        <ResumePreview />
      </div>

      <style jsx>{`
        .customize-view {
          display: flex; flex: 1; overflow: hidden;
        }
        .customize-view__left {
          width: 400px; min-width: 340px; overflow-y: auto;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg);
        }
        .customize-view__right {
          flex: 1; overflow: hidden;
        }
        @media (max-width: 768px) {
          .customize-view { flex-direction: column; overflow-y: auto; }
          .customize-view__left { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid var(--color-border); max-height: none; }
          .customize-view__right { min-height: 300px; }
        }
      `}</style>
    </div>
  );
}

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resume");
  const [resumeId, setResumeId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [resumeName, setResumeName] = useState("Resume");
  const [loaded, setLoaded] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [highestStep, setHighestStep] = useState(1);
  const [mobileView, setMobileView] = useState("edit"); // "edit" or "preview"
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Update highest step when tab changes
  useEffect(() => {
    if (activeTab === "customize" && highestStep < 2) setHighestStep(2);
    if (activeTab === "ats-check" && highestStep < 3) setHighestStep(3);
  }, [activeTab, highestStep]);

  const { user, isPro } = useAuth();

  useEffect(() => {
    const loadResume = async () => {
      const id = searchParams.get("id");
      if (id) {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "resumes", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const cloudResume = docSnap.data();
              setResumeId(cloudResume.id);
              setInitialData(cloudResume.data);
              setResumeName(cloudResume.name);
              setLoaded(true);
              return;
            }
          } catch (e) {
            console.error("Failed to load cloud resume:", e);
          }
        }

        const resume = getResumeById(id);
        if (resume) {
          setResumeId(resume.id);
          setInitialData(resume.data);
          setResumeName(resume.name);
          setLoaded(true);
          return;
        }
      }
      
      const all = getAllResumes();
      if (all.length > 0) {
        setResumeId(all[0].id);
        setInitialData(all[0].data);
        setResumeName(all[0].name);
        setLoaded(true);
      } else {
        router.push("/dashboard");
      }
    };

    loadResume();
  }, [searchParams, router, user]);

  if (!loaded || !initialData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg)" }}>
        <ClaudeSparkleSmall size={32} color="#da7756" />
      </div>
    );
  }

  return (
    <ResumeProvider resumeId={resumeId} initialData={initialData}>
      <div className="editor-layout" id="editor-layout">
        <EditorTopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resumeId={resumeId}
          resumeName={resumeName}
          setResumeName={setResumeName}
          isUnlocked={atsScore !== null}
          highestStep={highestStep}
        />

        <div className="editor-body">
          {activeTab === "resume" && (
            <>
              <div className={`editor-sidebar-mobile ${mobileView === "edit" ? "editor-mobile-show" : "editor-mobile-hide"}`}>
                <Sidebar />
              </div>
              <div className={`editor-preview ${mobileView === "preview" ? "editor-mobile-show" : "editor-mobile-hide-preview"}`}>
                <ResumePreview />
              </div>
              {isAIChatOpen && (
                <div className="editor-sidebar-right-wrap">
                  <AISidebar onClose={() => setIsAIChatOpen(false)} />
                </div>
              )}
            </>
          )}

          {activeTab === "customize" && <CustomizeView />}

          {activeTab === "ats-check" && (
            <div className="editor-ats-view" style={{ flex: 1, overflowY: "auto", background: "var(--color-bg)", position: "relative" }}>
              <ATSChecker onCheckComplete={(score) => setAtsScore(score)} />
              {/* Offscreen Resume Preview for background PDF/Word rendering */}
              <div style={{ position: "absolute", left: "-9999px", top: 0, width: "794px" }}>
                <ResumePreview />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Toggle — Edit / Preview */}
        {activeTab === "resume" && (
          <div className="mobile-toggle-bar">
            <button
              className={`mobile-toggle-btn ${mobileView === "edit" ? "mobile-toggle-btn--active" : ""}`}
              onClick={() => setMobileView("edit")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              Edit
            </button>
            <button
              className={`mobile-toggle-btn ${mobileView === "preview" ? "mobile-toggle-btn--active" : ""}`}
              onClick={() => setMobileView("preview")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Floating AI Bot Action Button */}
      <button 
        className={`floating-ai-bot ${!isPro ? "floating-ai-bot--locked" : ""}`} 
        onClick={() => setIsAIChatOpen(!isAIChatOpen)}
        title={isPro ? "Toggle AI Coach Sidebar" : "Unlock AI Coach (Pro Feature)"}
      >
        {!isPro ? (
          <span className="fab-lock-badge" title="Pro Feature">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        ) : (
          <span className="fab-online-dot"></span>
        )}
        <span className="fab-glow-ring"></span>
        <SparkleBotIcon size={22} color="#ffffff" />
      </button>

      <style jsx>{`
        /* ── Right Sidebar Layout & Animations ────────────────── */
        .editor-sidebar-right-wrap {
          display: none;
        }
        @media (min-width: 769px) {
          .editor-sidebar-right-wrap {
            display: block;
            height: 100%;
            animation: sidebarSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
        @media (max-width: 768px) {
          .editor-sidebar-right-wrap {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100000;
            background: var(--color-bg);
            display: flex;
            flex-direction: column;
            animation: sidebarSlideUpMobile 0.3s ease;
          }
        }

        @keyframes sidebarSlideIn {
          from { width: 0; opacity: 0; transform: translateX(20px); }
          to { width: 360px; opacity: 1; transform: translateX(0); }
        }

        @keyframes sidebarSlideUpMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* ── Floating AI Bot FAB ──────────────────────────────── */
        .floating-ai-bot {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #da7756 0%, #e8956f 100%);
          color: #ffffff;
          box-shadow: 0 8px 32px rgba(218, 119, 86, 0.3), 
                      0 0 0 1px rgba(218, 119, 86, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: floatAnimation 3s ease-in-out infinite;
        }

        .floating-ai-bot:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 12px 40px rgba(218, 119, 86, 0.45), 
                      0 0 0 1px rgba(218, 119, 86, 0.2);
        }

        .floating-ai-bot:active {
          transform: scale(0.95) translateY(0);
        }

        .fab-glow-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(218, 119, 86, 0.2);
          opacity: 0;
          animation: ringPulse 2.5s cubic-bezier(0.25, 0, 0, 1) infinite;
        }

        .fab-online-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 11px;
          height: 11px;
          background-color: #4ade80;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5);
          animation: greenPulse 2s infinite;
          z-index: 2;
        }

        .fab-lock-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          border: 1.5px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 2;
        }

        .floating-ai-bot--locked {
          background: linear-gradient(135deg, #8a8a8a 0%, #666666 100%);
          box-shadow: 0 8px 32px rgba(102, 102, 102, 0.3), 
                      0 0 0 1px rgba(102, 102, 102, 0.1);
        }

        .floating-ai-bot--locked:hover {
          background: linear-gradient(135deg, #9a9a9a 0%, #777777 100%);
          box-shadow: 0 12px 40px rgba(102, 102, 102, 0.45), 
                      0 0 0 1px rgba(102, 102, 102, 0.2);
        }

        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes ringPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.25); opacity: 0; }
        }

        @keyframes greenPulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        @media (max-width: 768px) {
          .floating-ai-bot {
            bottom: 84px; /* shift above the mobile toggle bar */
            right: 16px;
            width: 48px;
            height: 48px;
          }
          
          .floating-ai-bot svg {
            width: 18px;
            height: 18px;
          }
        }

        .editor-layout {
          display: flex; flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden; background: var(--color-bg);
        }
        .editor-body { flex: 1; display: flex; overflow: hidden; }
        .editor-preview { flex: 1; overflow: hidden; }
        .editor-sidebar-mobile { display: contents; }
        .editor-placeholder {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 48px;
        }
        .editor-placeholder__content {
          text-align: center; max-width: 380px;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .editor-placeholder__content h2 { font-size: 1.4rem; }
        .editor-placeholder__content p { color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.6; }

        /* Mobile toggle bar */
        .mobile-toggle-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .editor-body { flex-direction: column; position: relative; }

          /* On mobile, sidebar and preview are toggled */
          .editor-sidebar-mobile { display: flex; flex-direction: column; width: 100%; }
          .editor-preview { width: 100%; }

          .editor-mobile-show { display: flex !important; flex: 1; overflow-y: auto; }
          .editor-mobile-hide { display: none !important; }
          .editor-mobile-hide-preview { display: none !important; }

          .mobile-toggle-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 200;
            background: var(--color-bg);
            border-top: 1px solid var(--color-border);
            padding: 6px 16px;
            padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
            gap: 8px;
            box-shadow: 0 -2px 12px rgba(25,25,24,0.08);
          }

          .mobile-toggle-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-full);
            background: var(--color-bg);
            font-family: var(--font-body);
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .mobile-toggle-btn--active {
            background: var(--color-btn-dark);
            color: #fff;
            border-color: var(--color-btn-dark);
          }

          /* Add bottom padding so content isn't hidden behind the toggle bar */
          .editor-layout {
            padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </ResumeProvider>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff" }}>
        <ClaudeSparkleSmall size={32} color="#da7756" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
