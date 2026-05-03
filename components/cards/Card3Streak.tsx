"use client";

import type { Streaks } from "@/lib/transforms";

interface Props {
  streaks: Streaks;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card3Streak({ streaks }: Props) {
  const { bestWinStreak, bestLoseStreak, currentStreak } = streaks;
  const currentIsWin = currentStreak > 0;
  const currentAbs = Math.abs(currentStreak);
  const arrow = currentIsWin ? "↑" : "↓";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "20px 22px 24px",
      }}
    >
      {/* Top branding row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 28,
          flexShrink: 0,
        }}
      >
        <span style={BRAND}>Dota Wrapped</span>
        <span
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800 }}
        >
          2026
        </span>
      </div>

      {/* Two halves side by side */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 0,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        {/* Win half */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(22,163,74,0.12)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <p
            style={{
              color: "#4ade80",
              fontSize: 80,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              marginBottom: 8,
            }}
          >
            {bestWinStreak}
          </p>
          <p
            style={{
              color: "rgba(74,222,128,0.7)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Best Win
            <br />
            Streak
          </p>
        </div>

        {/* Lose half */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(239,68,68,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <p
            style={{
              color: "#f87171",
              fontSize: 80,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              marginBottom: 8,
            }}
          >
            {bestLoseStreak}
          </p>
          <p
            style={{
              color: "rgba(248,113,113,0.7)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Worst Loss
            <br />
            Streak
          </p>
        </div>
      </div>

      {/* Current streak */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 16,
          marginTop: 16,
          flexShrink: 0,
        }}
      >
        {currentAbs > 0 ? (
          <p
            style={{
              color: currentIsWin ? "#4ade80" : "#f87171",
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {arrow} Currently on a {currentAbs}-game{" "}
            {currentIsWin ? "WIN" : "LOSS"} streak
          </p>
        ) : (
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            No active streak
          </p>
        )}

        <p
          style={{ ...BRAND, color: "rgba(255,255,255,0.25)", textAlign: "center" }}
        >
          dotawrapped.gg
        </p>
      </div>
    </div>
  );
}
