"use client";

import { useState } from "react";
import type { SignatureMoves } from "@/lib/transforms";
import type { Match } from "@/lib/opendota";

interface Props {
  signatureMoves: SignatureMoves;
  yearMatches?: Match[];
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card4MatchupA({ signatureMoves, yearMatches = [] }: Props) {
  const {
    totalKills,
    totalDeaths,
    totalAssists,
    topItemName,
    topItemGames,
    mostPlayedHeroName,
    mostPlayedHeroCleanName,
    mostPlayedHeroWinRate,
    overallWinRate,
    mostBuiltItemKey,
  } = signatureMoves;

  const [heroUrlIdx, setHeroUrlIdx] = useState(0);
  const [itemIconError, setItemIconError] = useState(false);

  const heroUrls = mostPlayedHeroCleanName
    ? [
        `${DOTA_CDN}/apps/dota2/images/dota_react/heroes/panorama/images/${mostPlayedHeroCleanName}_vert.jpg`,
        `${DOTA_CDN}/apps/dota2/images/dota_react/heroes/${mostPlayedHeroCleanName}_full.png`,
      ]
    : [];

  const currentHeroUrl = heroUrls[heroUrlIdx] ?? null;
  const heroBgFailed = heroUrlIdx >= heroUrls.length;

  const itemIconUrl = mostBuiltItemKey
    ? `${DOTA_CDN}/apps/dota2/images/dota_react/items/${mostBuiltItemKey}.png`
    : null;

  const heroWR = parseFloat(mostPlayedHeroWinRate);
  const overallWR = parseFloat(overallWinRate);
  const heroBetter = heroWR >= overallWR;
  const heroBarColor = heroBetter ? "#22C55E" : "#EF4444";

  // Additional stats
  const topHeroId = (() => {
    // We derive this from yearMatches hero counts to match mostPlayedHero
    // but we don't have hero_id in SignatureMoves, so match by name via hero portrait
    // The yearMatches filter is best-effort: group by hero_id, pick most common
    if (yearMatches.length === 0) return -1;
    const counts: Record<number, number> = {};
    for (const m of yearMatches) counts[m.hero_id] = (counts[m.hero_id] ?? 0) + 1;
    return Number(Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? -1);
  })();

  const yearGamesOnHero = topHeroId > 0
    ? yearMatches.filter((m) => m.hero_id === topHeroId).length
    : 0;

  const totalKda = totalDeaths > 0
    ? ((totalKills + totalAssists) / totalDeaths).toFixed(1)
    : (totalKills + totalAssists).toFixed(1);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero portrait — top 35% */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 180,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {currentHeroUrl && !heroBgFailed ? (
          <img
            src={currentHeroUrl}
            alt={mostPlayedHeroName}
            onError={() => setHeroUrlIdx((i) => i + 1)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #1a1a2e 0%, #111 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 48, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              {mostPlayedHeroName}
            </span>
          </div>
        )}
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(17,17,17,0.55) 60%, #111 100%)",
          }}
        />
        {/* Hero name overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 24px 14px" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 4px 0" }}>
            Signature hero
          </p>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, margin: 0, textShadow: "0 2px 16px rgba(0,0,0,0.9)", textTransform: "uppercase" }}>
            {mostPlayedHeroName}
          </h2>
        </div>
      </div>

      {/* Stats section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 24px 0", overflow: "hidden" }}>
        {/* Year totals */}
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
          Year totals
        </p>
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 12 }} />

        {/* K / D / A row */}
        <div style={{ display: "flex", marginBottom: 14 }}>
          {[
            { label: "K", value: totalKills.toLocaleString(), color: "#22C55E" },
            { label: "D", value: totalDeaths.toLocaleString(), color: "#EF4444" },
            { label: "A", value: totalAssists.toLocaleString(), color: "#38BDF8" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color, fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>
                {value}
              </p>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Win rate comparison */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            Win rate
          </p>
          <div style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 600 }}>{mostPlayedHeroName}</span>
              <span style={{ color: heroBarColor, fontSize: 10, fontWeight: 700 }}>{mostPlayedHeroWinRate}%</span>
            </div>
            <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(heroWR, 100)}%`, backgroundColor: heroBarColor, borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 600 }}>Overall</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700 }}>{overallWinRate}%</span>
            </div>
            <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(overallWR, 100)}%`, backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 3 }} />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 10 }} />

        {/* Additional stats rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Games this year on hero */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 30, padding: "0 4px", borderRadius: 3 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>🎮</span>
              <span style={{ color: "#8a9bb0", fontSize: 10 }}>Games This Year</span>
            </span>
            <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 700 }}>{yearGamesOnHero} games</span>
          </div>

          {/* Avg KDA this year */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 30, padding: "0 4px", borderRadius: 3 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>📊</span>
              <span style={{ color: "#8a9bb0", fontSize: 10 }}>Avg KDA This Year</span>
            </span>
            <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 700 }}>{totalKda} ratio</span>
          </div>

          {/* Most built item */}
          {topItemName && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 30, padding: "0 4px", borderRadius: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>🎯</span>
                <span style={{ color: "#8a9bb0", fontSize: 10 }}>Most Built Item</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {itemIconUrl && !itemIconError && (
                  <img
                    src={itemIconUrl}
                    alt={topItemName}
                    width={24}
                    height={24}
                    onError={() => setItemIconError(true)}
                    style={{ borderRadius: 3, objectFit: "contain", display: "block" }}
                  />
                )}
                <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 700 }}>{topItemName}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: 88, flexShrink: 0 }} />

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

      {/* Branding */}
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
    </div>
  );
}
