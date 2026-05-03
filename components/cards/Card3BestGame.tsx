"use client";

import type { BestGame } from "@/lib/transforms";

interface Props {
  bestGame: BestGame | null;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function Card3BestGame({ bestGame }: Props) {
  if (!bestGame) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          No match data
        </p>
      </div>
    );
  }

  const { kills, deaths, assists, heroCleanName, heroName, duration, isWin } =
    bestGame;

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
        justifyContent: "space-between",
        padding: "20px 28px 0 28px",
      }}
    >
      {/* Hero image — full bleed */}
      {heroCleanName && (
        <img
          src={`/api/hero-image?hero=${heroCleanName}`}
          alt={heroName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 20%",
          }}
        />
      )}

      {/* Gradient overlay — bottom 60% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, #000000 0%, #000000 35%, rgba(0,0,0,0.75) 55%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* 2026 rotated */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "30%",
          transform: "rotate(90deg)",
          transformOrigin: "center center",
          fontSize: 10,
          letterSpacing: "0.3em",
          opacity: 0.3,
          color: "white",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
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

      {/* DOTA WRAPPED label */}
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

      {/* Top branding */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 2,
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          Your Best Game
        </p>
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 800,
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          2026
        </span>
      </div>

      {/* Bottom content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Hero name */}
        <p
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            marginBottom: 12,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {heroName}
        </p>

        {/* Kills row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <p
            style={{
              color: "#B9FF33",
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            {kills}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            /{deaths}/{assists}
          </p>
        </div>

        {/* KILLS label */}
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          K / D / A
        </p>

        {/* Duration + result row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 12,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {formatDuration(duration)}
          </p>
          <p
            style={{
              color: isWin ? "#B9FF33" : "#FF4D30",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {isWin ? "WIN" : "LOSS"}
          </p>
        </div>

        {/* Spacer for share button + DOTA WRAPPED */}
        <div style={{ height: 88 }} />
      </div>
    </div>
  );
}
