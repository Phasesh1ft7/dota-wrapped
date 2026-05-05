"use client";

import type { YearInNumbers } from "@/lib/transforms";

interface Props {
  yearInNumbers: YearInNumbers;
  playerName: string;
}

const NEON = "#9ef01a";
const GOLD = "#c8a84b";
const RED = "#ef4444";
const BG = "#0a0a0f";

export default function Card4MatchupB({ yearInNumbers, playerName }: Props) {
  const {
    totalGames,
    totalHours,
    bestWinStreak,
    worstLoseStreak,
    mostPlayedDay,
    winRateShort,
    winRateMid,
    winRateLong,
    uniqueHeroes,
  } = yearInNumbers;

  const winBars: { label: string; value: number }[] = [
    { label: "< 30 MIN", value: winRateShort },
    { label: "30–45 MIN", value: winRateMid },
    { label: "45+ MIN", value: winRateLong },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 80,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: [
            "repeating-linear-gradient(rgba(159,240,26,0.03) 0px, transparent 1px, transparent 40px)",
            "repeating-linear-gradient(90deg, rgba(159,240,26,0.03) 0px, transparent 1px, transparent 40px)",
            "linear-gradient(135deg, #0a0a0f 0%, #0d1a0d 50%, #0a0a0f 100%)",
          ].join(", "),
        }}
      >
        <p
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 3,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          YOUR 2026 IN NUMBERS
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          A year of Dota, by the numbers
        </p>
      </div>

      {/* SECTION 1 — Big three stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "14px 0",
          flexShrink: 0,
        }}
      >
        {[
          { label: "GAMES", value: totalGames.toLocaleString() },
          { label: "HOURS", value: `${totalHours}h` },
          { label: "HEROES", value: String(uniqueHeroes) },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              padding: "0 8px",
            }}
          >
            <p
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 700,
                margin: "0 0 2px 0",
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* SECTION 2 — Streaks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          backgroundColor: "rgba(255,255,255,0.02)",
          padding: "12px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: 16 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            BEST STREAK
          </p>
          <p style={{ color: NEON, fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1 }}>
            🔥 {bestWinStreak}W
          </p>
        </div>
        <div style={{ textAlign: "center", paddingLeft: 16 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            WORST STREAK
          </p>
          <p style={{ color: RED, fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1 }}>
            💀 {worstLoseStreak}L
          </p>
        </div>
      </div>

      {/* SECTION 3 — Win rate by game length */}
      <div style={{ padding: "12px 16px", flexShrink: 0 }}>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: "0 0 10px 0",
          }}
        >
          WIN RATE BY GAME LENGTH
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {winBars.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 9,
                  fontWeight: 600,
                  width: 80,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 3,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(value, 100)}%`,
                    height: "100%",
                    backgroundColor: value >= 50 ? NEON : RED,
                    borderRadius: 2,
                  }}
                />
              </div>
              <span
                style={{
                  color: GOLD,
                  fontSize: 12,
                  fontWeight: 700,
                  width: 40,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 — Most played day */}
      <div
        style={{
          margin: "0 16px",
          backgroundColor: "rgba(200,168,75,0.04)",
          border: "1px solid rgba(200,168,75,0.1)",
          borderRadius: 8,
          padding: 12,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>You play most on </span>
        <span style={{ color: GOLD, fontSize: 18, fontWeight: 700 }}>
          {mostPlayedDay.toUpperCase()}
        </span>
        <span style={{ fontSize: 14, marginLeft: 6 }}>⚔️</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          color: GOLD,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.1em",
          margin: "0 0 14px",
        }}
      >
        {playerName} ⚔️
      </p>
    </div>
  );
}
