"use client";

import { useEffect, useRef, useState } from "react";

/** Rotating typewriter effect that types and deletes each phrase in turn. */
export function Typewriter({
  words,
  className,
  typingSpeed = 70,
  deletingSpeed = 38,
  pause = 1500,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const current = words[index % words.length];

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout.current = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        timeout.current = setTimeout(() => setPhase("deleting"), pause);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout.current = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
      } else {
        setIndex((i) => i + 1);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout.current);
  }, [text, phase, index, words, typingSpeed, deletingSpeed, pause]);

  return (
    <span className={className}>
      <span className="text-gradient">{text}</span>
      <span className="ml-0.5 inline-block h-[0.95em] w-[3px] translate-y-[0.12em] animate-pulse rounded-full bg-gold align-middle" />
    </span>
  );
}
