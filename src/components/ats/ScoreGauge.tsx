"use client";

import { useEffect, useState } from "react";

/** Animated circular score gauge (0–100), coloured by band. */
export function ScoreGauge({
  score,
  size = 176,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const [display, setDisplay] = useState(0);
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const color =
    score >= 85 ? "#059669" : score >= 70 ? "#4f46e5" : score >= 50 ? "#d97706" : "#e11d48";

  useEffect(() => {
    // Ease the number and arc up on mount for a satisfying reveal.
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-extrabold text-slate-900">{display}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label ?? "ATS score"}
          </div>
        </div>
      </div>
    </div>
  );
}
