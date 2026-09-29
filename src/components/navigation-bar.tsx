"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When path or query changes, clear loading state
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.target &&
        anchor.href !== window.location.href
      ) {
        setLoading(true);
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-400 w-full animate-pulse shadow-md" />
    </div>
  );
}
