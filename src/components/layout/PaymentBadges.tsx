function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center justify-center rounded-md border border-black/5 bg-white px-2 shadow-sm">
      {children}
    </span>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-auto" aria-hidden="true">
      <circle cx="14" cy="11" r="7" fill="#EB001B" />
      <circle cx="22" cy="11" r="7" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

/** "We accept" payment-method badges + Paddle / SSL trust line (Paddle-ready). */
export function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill>
        <span className="text-[13px] font-bold italic tracking-tight text-[#1A1F71]">VISA</span>
      </Pill>
      <Pill>
        <Mastercard />
      </Pill>
      <Pill>
        <span className="text-[12px] font-extrabold tracking-tight">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#0070E0]">Pal</span>
        </span>
      </Pill>
      <Pill>
        <span className="rounded bg-[#1F72CD] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">AMEX</span>
      </Pill>
      <Pill>
        <span className="flex items-center gap-0.5 text-[12px] font-semibold text-black">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="black" aria-hidden="true">
            <path d="M17.05 12.04c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.79-3.33.79-.69 0-1.74-.77-2.86-.75-1.47.02-2.83.85-3.59 2.17-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.21 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.15.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5z M14.88 5.9c.6-.74 1.01-1.75.9-2.77-.87.04-1.92.58-2.55 1.31-.56.65-1.05 1.7-.92 2.69.97.08 1.97-.49 2.57-1.23z" />
          </svg>
          Pay
        </span>
      </Pill>
      <Pill>
        <span className="flex items-center gap-1 text-[12px] font-semibold">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
            <path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.56c2.08-1.92 3.24-4.74 3.24-7.84z" />
            <path fill="#34A853" d="M12 23c2.94 0 5.4-.97 7.2-2.64l-3.56-2.7c-.98.66-2.24 1.05-3.64 1.05-2.8 0-5.18-1.9-6.03-4.44H2.3v2.79A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.97 14.27a6.6 6.6 0 0 1 0-4.21V7.27H2.3a11 11 0 0 0 0 9.79l3.67-2.79z" />
            <path fill="#EA4335" d="M12 5.35c1.6 0 3.03.55 4.16 1.62l3.12-3.12C17.4 2.1 14.94 1 12 1A11 11 0 0 0 2.3 7.27l3.67 2.79C6.82 7.5 9.2 5.35 12 5.35z" />
          </svg>
          Pay
        </span>
      </Pill>
    </div>
  );
}
