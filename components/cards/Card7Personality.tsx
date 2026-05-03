"use client";

import type { WinLoss } from "@/lib/opendota";
import type { HeroStatEntry, Streaks } from "@/lib/transforms";

interface Props {
  heroStats: HeroStatEntry[];
  streaks: Streaks;
  totalHours: number;
  wl: WinLoss | null;
  totalGames: number;
}

interface Personality {
  type: string;
  copy: string;
  accent: string;
}

function derivePersonality(
  heroStats: HeroStatEntry[],
  streaks: Streaks,
  totalHours: number,
  wl: WinLoss | null,
): Personality {
  const allTimeWr =
    wl && wl.win + wl.lose > 0
      ? (wl.win / (wl.win + wl.lose)) * 100
      : 0;

  if (allTimeWr >= 55)
    return { type: "The Tactician", copy: "You win more than you lose. Respect.", accent: "#3b82f6" };
  if (streaks.bestWinStreak >= 10)
    return { type: "The Unstoppable", copy: "Double digits. You were on fire.", accent: "#f59e0b" };
  if (totalHours >= 1000)
    return { type: "The Veteran", copy: "Over 1000 hours. Dota is your second job.", accent: "#8b5cf6" };
  if (heroStats[0] && parseFloat(heroStats[0].winRate) < 45)
    return { type: "The Grinder", copy: "You keep playing despite the odds. Respect.", accent: "#ef4444" };
  if (heroStats.length <= 5)
    return { type: "The One-Trick", copy: "Why learn 120 heroes when you have one?", accent: "#ec4899" };
  return { type: "The Adventurer", copy: "Always trying something new.", accent: "#10b981" };
}

const DOT_CONFIG: Array<{
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity: number;
}> = [
  { size: 64, top: "12%", right: "12%", opacity: 0.12 },
  { size: 28, top: "30%", left: "6%", opacity: 0.09 },
  { size: 90, bottom: "18%", right: "4%", opacity: 0.07 },
  { size: 18, top: "58%", left: "12%", opacity: 0.13 },
  { size: 42, top: "3%", left: "38%", opacity: 0.08 },
  { size: 14, bottom: "28%", right: "22%", opacity: 0.14 },
];

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card7Personality({
  heroStats,
  streaks,
  totalHours,
  wl,
  totalGames: _totalGames,
}: Props) {
  const { type, copy, accent } = derivePersonality(heroStats, streaks, totalHours, wl);
  const nameFontSize = type.length <= 10 ? 64 : type.length <= 14 ? 52 : 40;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#F5F0E8",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "28px 28px 0 28px",
      }}
    >
      {/* Floating accent dots */}
      {DOT_CONFIG.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            backgroundColor: accent,
            opacity: dot.opacity,
            top: dot.top,
            bottom: dot.bottom,
            left: dot.left,
            right: dot.right,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* 2026 rotated left edge */}
      <span
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          fontSize: 11,
          letterSpacing: "0.3em",
          opacity: 0.35,
          textTransform: "uppercase",
          color: "#0d0d0d",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}
      >
        2026
      </span>

      {/* SVG scribble — black stroke for cream bg */}
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        <path
          d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <path
          d="M-10,70 Q80,40 140,65 Q200,85 310,55"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>

      {/* Share button — black pill, white text */}
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
          backgroundColor: "#0d0d0d",
          color: "white",
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
          color: "#0d0d0d",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Dota Wrapped
      </p>

      {/* Middle content — flex:1 fills space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            color: "rgba(13,13,13,0.5)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Your Dota Personality
        </p>

        <p
          style={{
            color: "#0d0d0d",
            fontSize: nameFontSize,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {type}
        </p>

        <p
          style={{
            color: "rgba(13,13,13,0.6)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {copy}
        </p>
      </div>

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
