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

  // Update highest step when tab changes
  useEffect(() => {
    if (activeTab === "customize" && highestStep < 2) setHighestStep(2);
    if (activeTab === "ats-check" && highestStep < 3) setHighestStep(3);
  }, [activeTab, highestStep]);

  const { user } = useAuth();

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

      <style jsx>{`
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
