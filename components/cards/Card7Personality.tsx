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
}

function derivePersonality(
  heroStats: HeroStatEntry[],
  streaks: Streaks,
  totalHours: number,
  wl: WinLoss | null,
): Personality {
  const allTimeWr = wl && wl.win + wl.lose > 0
    ? (wl.win / (wl.win + wl.lose)) * 100
    : 0;

  if (allTimeWr >= 55) return { type: "The Tactician", copy: "You win more than you lose. Respect." };
  if (streaks.bestWinStreak >= 10) return { type: "The Unstoppable", copy: "Double digits. You were on fire." };
  if (totalHours >= 1000) return { type: "The Veteran", copy: "Over 1000 hours. Dota is your second job." };
  if (heroStats[0] && parseFloat(heroStats[0].winRate) < 45) return { type: "The Grinder", copy: "You keep playing despite the odds. Respect." };
  if (heroStats.length <= 5) return { type: "The One-Trick", copy: "Why learn 120 heroes when you have one?" };
  return { type: "The Adventurer", copy: "Always trying something new." };
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card7Personality({
  heroStats,
  streaks,
  totalHours,
  wl,
  totalGames: _totalGames,
}: Props) {
  const { type, copy } = derivePersonality(heroStats, streaks, totalHours, wl);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(160deg,#1e1b4b,#312e81)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative faded text behind everything */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "white",
            opacity: 0.05,
            whiteSpace: "nowrap",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {type}
        </span>
      </div>

      {/* Top branding */}
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        <span style={BRAND}>Dota Wrapped</span>
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 800 }}>
          2026
        </span>
      </div>

      {/* Main content */}
      <div style={{ position: "relative" }}>
        <p
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Your Dota Personality
        </p>
        <p
          style={{
            color: "white",
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          {type}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          {copy}
        </p>
      </div>

      {/* Bottom branding */}
      <p style={{ ...BRAND, color: "rgba(255,255,255,0.22)", textAlign: "center", position: "relative" }}>
        dotawrapped.gg
      </p>
    </div>
  );
}
