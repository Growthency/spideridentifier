"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

/**
 * Live "N views" badge — counts one view per browser session and reads the
 * fresh total from the server, so the number works on ISR-cached pages.
 */
export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const key = `viewed:${slug}`;
    const counted = sessionStorage.getItem(key);
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, count: !counted }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.views === "number") setViews(j.views);
        if (!counted) sessionStorage.setItem(key, "1");
      })
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;
  return (
    <span className="flex items-center gap-1.5 text-sm text-foreground/45">
      <Eye className="h-4 w-4" /> {views.toLocaleString("en-US")} view{views === 1 ? "" : "s"}
    </span>
  );
}
