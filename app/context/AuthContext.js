"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: () => {},
  logOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Try popup first (works well on desktop/localhost)
      await signInWithPopup(auth, provider);
    } catch (error) {
      // If popup is blocked or fails, fall back to redirect
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/unauthorized-domain"
      ) {
        console.warn("Popup blocked or failed, falling back to redirect:", error.code);
        await signInWithRedirect(auth, provider);
        return;
      }
      console.error("Google Sign-In failed:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Handle redirect result when user returns from Google sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {!loading ? children : <div className="min-h-screen flex items-center justify-center">Loading...</div>}
    </AuthContext.Provider>
  );
}
