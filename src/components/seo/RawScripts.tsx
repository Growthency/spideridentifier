"use client";

import { useEffect } from "react";
import type { SiteScript } from "@/lib/siteContent";

/**
 * Executes admin-pasted HTML snippets (analytics tags, pixels, meta tags).
 * Script tags inserted with innerHTML never run, so each one is re-created
 * with document.createElement before being appended.
 */
export function RawScripts({ scripts }: { scripts: SiteScript[] }) {
  useEffect(() => {
    const appended: Element[] = [];
    for (const s of scripts) {
      const host = s.location === "head" ? document.head : document.body;
      const tpl = document.createElement("template");
      tpl.innerHTML = s.code;
      tpl.content.childNodes.forEach((node) => {
        if (node.nodeName === "SCRIPT") {
          const src = node as HTMLScriptElement;
          const el = document.createElement("script");
          for (const attr of Array.from(src.attributes)) el.setAttribute(attr.name, attr.value);
          el.text = src.text;
          host.appendChild(el);
          appended.push(el);
        } else if (node instanceof Element) {
          const el = node.cloneNode(true) as Element;
          host.appendChild(el);
          appended.push(el);
        }
      });
    }
    return () => appended.forEach((el) => el.remove());
  }, [scripts]);

  return null;
}
