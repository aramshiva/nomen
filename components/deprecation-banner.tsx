"use client";

import { useEffect, useState } from "react";

export function DeprecationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    if (host === "nomen.sh" || host === "localhost") {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-yellow-400 text-black text-center text-sm py-2 px-4">
      nomen.sh is being deprecated on April 23rd, 2026. Please switch to{" "}
      <a
        href="https://nomen.aram.sh"
        className="underline font-bold hover:text-zinc-700"
      >
        nomen.aram.sh
      </a>
      .
    </div>
  );
}
