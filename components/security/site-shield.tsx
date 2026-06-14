"use client";

import { useEffect } from "react";

export function SiteShield({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && (key === "i" || key === "j" || key === "c")) ||
        (e.ctrlKey && key === "u") ||
        (e.metaKey && e.altKey && key === "i")
      ) {
        e.preventDefault();
      }
    };
    const blockDrag = (e: DragEvent) => e.preventDefault();

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("dragstart", blockDrag);
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("dragstart", blockDrag);
    };
  }, []);

  return <>{children}</>;
}
