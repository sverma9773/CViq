"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CoverLetterProvider, useCoverLetter } from "../../context/CoverLetterContext";
import { getCoverLetterById, getAllCoverLetters } from "../../lib/coverLetterStore";
import CoverLetterTopBar from "../components/CoverLetterTopBar";
import CoverLetterSidebar from "../components/CoverLetterSidebar";
import CoverLetterPreview from "../components/CoverLetterPreview";
import CoverLetterCustomizeView from "../components/CoverLetterCustomizeView";
import { ClaudeSparkleSmall } from "../../components/ClaudeIcon";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("letter");
  const [letterId, setLetterId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [letterName, setLetterName] = useState("Cover Letter");
  const [loaded, setLoaded] = useState(false);
  const [mobileView, setMobileView] = useState("edit"); // "edit" or "preview"

  const { user } = useAuth();

  useEffect(() => {
    const loadLetter = async () => {
      const id = searchParams.get("id");
      if (id) {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid, "coverLetters", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const cloudLetter = docSnap.data();
              setLetterId(cloudLetter.id);
              setInitialData(cloudLetter.data);
              setLetterName(cloudLetter.name);
              setLoaded(true);
              return;
            }
          } catch (e) {
            console.error("Failed to load cloud cover letter:", e);
          }
        }

        const letter = getCoverLetterById(id);
        if (letter) {
          setLetterId(letter.id);
          setInitialData(letter.data);
          setLetterName(letter.name);
          setLoaded(true);
          return;
        }
      }
      const all = getAllCoverLetters();
      if (all.length > 0) {
        setLetterId(all[0].id);
        setInitialData(all[0].data);
        setLetterName(all[0].name);
        setLoaded(true);
      } else {
        router.push("/dashboard");
      }
    };

    loadLetter();
  }, [searchParams, router, user]);

  if (!loaded || !initialData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg)" }}>
        <ClaudeSparkleSmall size={32} color="#da7756" />
      </div>
    );
  }

  return (
    <CoverLetterProvider coverLetterId={letterId} initialData={initialData}>
      <div className="editor-layout" id="editor-layout">
        <CoverLetterTopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          letterId={letterId}
          letterName={letterName}
          setLetterName={setLetterName}
        />

        <div className="editor-body">
          {activeTab === "letter" && (
            <>
              <div className={`editor-sidebar-mobile ${mobileView === "edit" ? "editor-mobile-show" : "editor-mobile-hide"}`}>
                <CoverLetterSidebar />
              </div>
              <div className={`editor-preview ${mobileView === "preview" ? "editor-mobile-show" : "editor-mobile-hide-preview"}`}>
                <CoverLetterPreview />
              </div>
            </>
          )}

          {activeTab === "customize" && <CoverLetterCustomizeView />}
        </div>

        {/* Offscreen A4 cover letter rendered for perfect background exports from ANY tab */}
        {activeTab !== "letter" && activeTab !== "customize" && (
          <div style={{ position: "absolute", left: "-9999px", top: 0, width: "794px" }}>
            <CoverLetterPreview />
          </div>
        )}

        {/* Mobile Bottom Toggle — Edit / Preview */}
        {activeTab === "letter" && (
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
          height: 100vh; overflow: hidden; background: var(--color-bg);
        }
        .editor-body { flex: 1; display: flex; overflow: hidden; }
        .editor-preview { flex: 1; overflow: hidden; }
        .editor-sidebar-mobile { display: contents; }

        /* Mobile toggle bar */
        .mobile-toggle-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .editor-body { flex-direction: column; position: relative; }

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

          .editor-layout {
            padding-bottom: 56px;
          }
        }
      `}</style>
    </CoverLetterProvider>
  );
}

export default function CoverLetterEditorPage() {
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
