"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, HelpCircle, PencilLine } from "lucide-react";

/**
 * Branded replacements for the native alert/confirm/prompt dialogs.
 * Mount <DialogHost/> once (root layout); call dialogAlert / dialogConfirm /
 * dialogPrompt from anywhere — each returns a promise.
 */

type DialogKind = "alert" | "confirm" | "prompt";

interface DialogRequest {
  kind: DialogKind;
  title: string;
  message?: string;
  initial?: string;
  resolve: (value: string | boolean | null) => void;
}

let pushRequest: ((req: DialogRequest) => void) | null = null;

export function dialogAlert(message: string, title = "Spider Identifier"): Promise<void> {
  return new Promise((resolve) => {
    if (!pushRequest) {
      window.alert(message);
      resolve();
      return;
    }
    pushRequest({ kind: "alert", title, message, resolve: () => resolve() });
  });
}

export function dialogConfirm(message: string, title = "Are you sure?"): Promise<boolean> {
  return new Promise((resolve) => {
    if (!pushRequest) {
      resolve(window.confirm(message));
      return;
    }
    pushRequest({ kind: "confirm", title, message, resolve: (v) => resolve(Boolean(v)) });
  });
}

export function dialogPrompt(title: string, initial = ""): Promise<string | null> {
  return new Promise((resolve) => {
    if (!pushRequest) {
      resolve(window.prompt(title, initial));
      return;
    }
    pushRequest({ kind: "prompt", title, initial, resolve: (v) => resolve(typeof v === "string" ? v : null) });
  });
}

export function DialogHost() {
  const [req, setReq] = useState<DialogRequest | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pushRequest = (r) => {
      setReq(r);
      setValue(r.initial ?? "");
    };
    return () => {
      pushRequest = null;
    };
  }, []);

  useEffect(() => {
    if (req?.kind === "prompt") inputRef.current?.focus();
  }, [req]);

  if (!req) return null;

  const close = (result: string | boolean | null) => {
    req.resolve(result);
    setReq(null);
  };

  const Icon = req.kind === "alert" ? AlertCircle : req.kind === "confirm" ? HelpCircle : PencilLine;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/55 p-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => close(req.kind === "confirm" ? false : null)}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3 p-5 pb-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold/10">
            <Icon className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <span aria-hidden="true">🕷️</span> {req.title}
            </p>
            {req.message && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/65">{req.message}</p>}
          </div>
        </div>

        {req.kind === "prompt" && (
          <div className="px-5 pb-2">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) close(value.trim());
                if (e.key === "Escape") close(null);
              }}
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground focus:border-gold/50 focus:outline-none"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 p-5 pt-3">
          {req.kind !== "alert" && (
            <button
              onClick={() => close(req.kind === "confirm" ? false : null)}
              className="inline-flex h-10 items-center rounded-full border border-foreground/12 px-5 text-sm font-medium text-foreground/70 hover:bg-foreground/5"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => close(req.kind === "alert" ? true : req.kind === "confirm" ? true : value.trim() || null)}
            disabled={req.kind === "prompt" && !value.trim()}
            className="inline-flex h-10 items-center rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950 disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
