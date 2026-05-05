"use client";

import type { TempoStats } from "@/lib/transforms";

interface Props {
  tempoStats: TempoStats;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: accent ?? "white",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Card8BestMonth({ tempoStats }: Props) {
  const { fastestWin, longestGame, avgDuration, totalHoursThisYear } = tempoStats;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "28px 28px 0 28px",
      }}
    >
      {/* Grid lines background */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 400 600"
      >
        {[80, 160, 240, 320, 400, 480].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeWidth="1" />
        ))}
        {[80, 160, 240, 320].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="600" stroke="white" strokeWidth="1" />
        ))}
      </svg>

      {/* Year label rotated right edge */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "25%",
          transform: "translateY(-50%) rotate(90deg)",
          fontSize: 11,
          letterSpacing: "0.3em",
          opacity: 0.35,
          textTransform: "uppercase",
          color: "white",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}
      >
        2026
      </span>

      {/* Share button */}
      <button
        onClick={() => navigator.clipboard?.writeText(shareUrl()).catch(() => {})}
        style={{
          position: "absolute",
          bottom: 44,
          left: "50%",
          transform: "translateX(-50%)",
          width: 160,
          height: 40,
          borderRadius: 20,
          backgroundColor: "white",
          color: "black",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          zIndex: 5,
        }}
      >
        Share this story
      </button>

      {/* DOTA WRAPPED bottom-left */}
      <p
        style={{
          position: "absolute",
          bottom: 16,
          left: 28,
          fontSize: 10,
          letterSpacing: "0.15em",
          opacity: 0.35,
          color: "white",
          textTransform: "uppercase",
          margin: 0,
          zIndex: 2,
        }}
      >
        Dota Wrapped
      </p>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top label */}
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Fastest win
        </p>

        {/* Hero number — fastest win */}
        <p
          style={{
            color: "#06B6D4",
            fontSize: fastestWin && fastestWin.length > 7 ? 52 : 64,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            marginBottom: 28,
          }}
        >
          {fastestWin ?? "—"}
        </p>

        {/* Divider + stat rows */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 4 }}>
          <StatRow label="Longest game" value={longestGame ?? "—"} />
          <StatRow label="Avg duration" value={avgDuration} />
          <StatRow label="Hours this year" value={`${totalHoursThisYear}h`} accent="#06B6D4" />
        </div>
      </div>

      {/* Spacer for share button + branding */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
