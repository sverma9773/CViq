import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyrLbvyzmSB9puyl6UVXMcGMwyfx8qqNk",
  authDomain: "sunami-group.firebaseapp.com",
  projectId: "sunami-group",
  storageBucket: "sunami-group.firebasestorage.app",
  messagingSenderId: "740104922860",
  appId: "1:740104922860:web:36159492711c18193fa7c9",
  measurementId: "G-F3QZMK93ZV"
};

// Initialize Firebase (prevent re-initialization in Next.js development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally (only runs in browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
