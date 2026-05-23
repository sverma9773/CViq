"use client";

import { useEffect, useState } from "react";

export default function Template({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`cviq-page-wrapper ${isMounted ? "cviq-page-wrapper--active" : ""}`}>
      {children}
    </div>
  );
}
