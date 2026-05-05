"use client";

import type { LegendStats } from "@/lib/transforms";

interface Props {
  legendStats: LegendStats;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

function LegendBlock({
  label,
  headline,
  sub,
  accent,
}: {
  label: string;
  headline: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: accent,
          fontSize: 32,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          marginBottom: 3,
        }}
      >
        {headline}
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

export default function Card2Hours({ legendStats }: Props) {
  const { bestKdaGame, highestGpmGame, longestWinStreak } = legendStats;

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
      {/* Concentric circles background */}
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
        <circle cx="200" cy="300" r="80"  fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="150" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="220" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="300" fill="none" stroke="white" strokeWidth="1" />
      </svg>

      {/* Year label */}
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

      {/* Top label */}
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginBottom: 4,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        All-time records
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
        {/* Best KDA game — inline so we can add the hero thumbnail */}
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
            Best KDA game
          </p>
          <p style={{ color: "#6366F1", fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 6 }}>
            {bestKdaGame ? `${bestKdaGame.kda}` : "—"}
          </p>
          {bestKdaGame ? (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {bestKdaGame.heroCleanName && (
                <img
                  src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${bestKdaGame.heroCleanName}.png`}
                  alt={bestKdaGame.heroName}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{ width: 36, height: 36, borderRadius: 4, objectFit: "cover", objectPosition: "center 15%", flexShrink: 0 }}
                />
              )}
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }}>
                {bestKdaGame.kills}/{bestKdaGame.deaths}/{bestKdaGame.assists} on {bestKdaGame.heroName}
              </p>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }}>No data</p>
          )}
        </div>
        <LegendBlock
          label="Peak GPM"
          headline={highestGpmGame ? `${highestGpmGame.gpm}` : "—"}
          sub={highestGpmGame ? `gold/min on ${highestGpmGame.heroName}` : "No data"}
          accent="#F59E0B"
        />
        <LegendBlock
          label="Longest win streak"
          headline={longestWinStreak > 0 ? `${longestWinStreak}` : "—"}
          sub={longestWinStreak > 0 ? `wins in a row` : "No data"}
          accent="#22C55E"
        />
      </div>

      {/* Spacer for share button + branding */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
