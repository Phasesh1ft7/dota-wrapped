"use client";

import type { Streaks } from "@/lib/transforms";

interface Props {
  streaks: Streaks;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card3Streak({ streaks }: Props) {
  const { bestWinStreak, bestLoseStreak, currentStreak } = streaks;
  const currentIsWin = currentStreak > 0;
  const currentAbs = Math.abs(currentStreak);

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
      }}
    >
      {/* 2026 rotated left edge */}
      <span
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          fontSize: 11,
          letterSpacing: "0.3em",
          opacity: 0.4,
          textTransform: "uppercase",
          color: "white",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}
      >
        2026
      </span>

      {/* SVG scribble */}
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <path
          d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M-10,70 Q80,40 140,65 Q200,85 310,55"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Share button */}
      <button
        onClick={() =>
          navigator.clipboard?.writeText(shareUrl()).catch(() => {})
        }
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

      {/* TOP HALF — Win streak, flex:1 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "28px 28px 20px 28px",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Your best
        </p>
        <p
          style={{
            color: "#B9FF33",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Win Streak
        </p>
        <p
          style={{
            color: "white",
            fontSize: 140,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
          }}
        >
          {bestWinStreak}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.1)",
          marginLeft: 28,
          marginRight: 28,
          flexShrink: 0,
        }}
      />

      {/* BOTTOM HALF — Loss streak, flex:1 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 28px 0 28px",
          overflow: "hidden",
        }}
      >
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Your worst
          </p>
          <p
            style={{
              color: "#FF4D30",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Loss Streak
          </p>
          <p
            style={{
              color: "white",
              fontSize: 140,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            {bestLoseStreak}
          </p>
        </div>

        {/* Current streak pill */}
        {currentAbs > 0 && (
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: currentIsWin ? "#B9FF33" : "#FF4D30",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 20,
                letterSpacing: "0.05em",
              }}
            >
              {currentIsWin ? "↑" : "↓"} {currentAbs}-game{" "}
              {currentIsWin ? "WIN" : "LOSS"} streak
            </span>
          </div>
        )}

        {/* Spacer for share button + DOTA WRAPPED */}
        <div style={{ height: 88, flexShrink: 0 }} />
      </div>
    </div>
  );
}
