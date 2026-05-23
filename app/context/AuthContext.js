"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
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
      await signInWithPopup(auth, provider);
    } catch (error) {
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
