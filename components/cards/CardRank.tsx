"use client";

import { useState } from "react";
import type { RankInfo } from "@/lib/transforms";

interface Props {
  rankInfo: RankInfo;
  playerName: string;
}

const RANK_FLAVOUR: Record<string, { line1: string; line2: string }> = {
  Herald:   { line1: "Every legend starts somewhere.",   line2: "The climb is the whole point." },
  Guardian: { line1: "The fundamentals are clicking.",   line2: "Keep pushing the enemy." },
  Crusader: { line1: "You know what you're doing.",      line2: "Now do it consistently." },
  Archon:   { line1: "Solid. Above average.",            line2: "The grind is clearly working." },
  Legend:   { line1: "Top quarter of all Dota players.", line2: "That's genuinely impressive." },
  Ancient:  { line1: "Elite territory.",                 line2: "Most players never get here." },
  Divine:   { line1: "Top 3% in the world.",             line2: "You play this game at a high level." },
  Immortal: { line1: "YOU ARE THE 1%.",                  line2: "Top 1.91% of all Dota 2 players worldwide." },
};

function getRankColor(medalNumber: number): string {
  if (medalNumber <= 0) return "#6b7280";
  if (medalNumber <= 2) return "#6b7280";
  if (medalNumber <= 4) return "#4ade80";
  if (medalNumber <= 6) return "#60a5fa";
  if (medalNumber === 7) return "#a78bfa";
  return "#f59e0b";
}

function StatCol({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
      <p
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: "0 0 5px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "white",
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function CardRank({ rankInfo, playerName }: Props) {
  const { medalName, stars, fullRank, medalNumber, percentileLabel, isImmortal, leaderboardRank } = rankInfo;
  const rankColor = getRankColor(medalNumber);
  const isHidden = medalNumber === 0;

  // Two-level badge fallback: cloudflare → opendota → styled circle
  const [imgState, setImgState] = useState<"primary" | "opendota" | "failed">("primary");
  const primaryUrl = !isHidden
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}.png`
    : null;
  const opendotaUrl = !isHidden
    ? `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${medalNumber}.png`
    : null;
  const badgeUrl =
    imgState === "primary" ? primaryUrl : imgState === "opendota" ? opendotaUrl : null;

  function handleBadgeError() {
    if (imgState === "primary") setImgState("opendota");
    else setImgState("failed");
  }


  const flavour = RANK_FLAVOUR[medalName];

  const rightLabel = isImmortal && leaderboardRank ? "LEADERBOARD" : "STARS";
  const rightValue = isImmortal && leaderboardRank
    ? `#${leaderboardRank}`
    : isHidden
    ? "—"
    : isImmortal
    ? "★★★★★"
    : "★".repeat(stars);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "32px 24px 0 24px",
        background: `radial-gradient(ellipse at 50% 30%, ${rankColor}28 0%, #0a0a0f 65%)`,
      }}
    >
      {/* Section 1: Badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {isHidden ? (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: "rgba(107,114,128,0.12)",
              border: "2px dashed rgba(107,114,128,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 48, opacity: 0.35 }}>?</span>
          </div>
        ) : badgeUrl ? (
          <img
            src={badgeUrl}
            alt={medalName}
            width={140}
            height={140}
            onError={handleBadgeError}
            style={{
              filter: `drop-shadow(0 0 28px ${rankColor}99)`,
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: `${rankColor}18`,
              border: `2px solid ${rankColor}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: rankColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {medalName}
            </span>
          </div>
        )}
        {!isHidden && !isImmortal && stars > 0 && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            {"★".repeat(stars).split("").map((s, i) => (
              <span key={i} style={{ color: "#c8a84b", fontSize: 18, letterSpacing: 4 }}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Rank Name */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "4px",
            textTransform: "uppercase",
            margin: "0 0 6px",
            lineHeight: 1,
          }}
        >
          {fullRank}
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: rankColor,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            margin: 0,
            marginTop: 6,
          }}
        >
          YOUR 2026 RANK
        </p>
      </div>

      {/* Sections 3 + 4: Stats Row and Flavour Text — grouped to eliminate space-between gap */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <StatCol label="MEDAL" value={isHidden ? "—" : medalName} />
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)", height: "60%", alignSelf: "center" }} />
          <StatCol label="PERCENTILE" value={isHidden ? "—" : percentileLabel} />
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)", height: "60%", alignSelf: "center" }} />
          <StatCol label={rightLabel} value={rightValue} />
        </div>
        {flavour && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#c8a84b", letterSpacing: 1, textTransform: "uppercase", fontStyle: "normal", margin: "0 0 4px", lineHeight: 1.3 }}>
              {flavour.line1}
            </p>
            <p style={{ fontSize: 11, color: "#8a9bb0", letterSpacing: 0.5, fontStyle: "normal", margin: 0, lineHeight: 1.3 }}>
              {flavour.line2}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 0 20px",
          marginTop: 8,
        }}
      >
        {badgeUrl && (
          <img
            src={badgeUrl}
            alt=""
            width={24}
            height={24}
            style={{ objectFit: "contain" }}
          />
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: rankColor }}>
          {playerName}
        </span>
      </div>
    </div>
  );
}
