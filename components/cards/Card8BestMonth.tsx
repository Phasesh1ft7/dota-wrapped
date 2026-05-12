"use client";

import type { TempoStats } from "@/lib/transforms";

interface Props {
  tempoStats: TempoStats;
  playerName: string;
  isExporting?: boolean;
}

function StatRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: last ? "10px 0 8px" : "10px 0",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "#8a9bb0",
          letterSpacing: 2,
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, borderBottom: "1px dotted rgba(255,255,255,0.25)", marginBottom: 0 }} />
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Card8BestMonth({ tempoStats, playerName, isExporting = false }: Props) {
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
          opacity: 0.05,
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
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 24,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(0,212,255,0.15)",
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 9,
            color: "rgba(0,212,255,0.6)",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            Tempo Stats
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}>
            {playerName}
          </div>
          <div style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 2,
            marginTop: 4,
          }}>
            2026 Season
          </div>
        </div>

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

        {/* Fastest win value */}
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

        {/* Stat rows */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 4 }}>
          <StatRow label="Longest game" value={longestGame ?? "—"} />
          <StatRow label="Avg duration" value={avgDuration} />
          <StatRow label="Hours this year" value={`${totalHoursThisYear}h`} last />
        </div>
      </div>

      {/* Share button */}
      {!isExporting && (
        <button
          onClick={() =>
            navigator.clipboard
              ?.writeText(typeof window !== "undefined" ? window.location.href : "")
              .catch(() => {})
          }
          style={{
            display: "block",
            width: "fit-content",
            margin: "8px auto",
            padding: "0 24px",
            height: 40,
            borderRadius: 20,
            backgroundColor: "white",
            color: "black",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            position: "relative",
            zIndex: 5,
          }}
        >
          Share this story
        </button>
      )}

      {/* Watermark */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: 3,
          textTransform: "uppercase",
          paddingBottom: 12,
          margin: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        DOTA WRAPPED
      </p>
    </div>
  );
}
