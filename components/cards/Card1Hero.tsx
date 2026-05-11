"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileData, ItemConstant, BestHeroMatchData, Match } from "@/lib/opendota";
import { fetchHeroAbilitiesClient } from "@/lib/opendota";
import { getItemName, ITEM_CDN } from "@/lib/itemUtils";
import type { HeroStatEntry, BestGame, SignatureMoves } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  topHero: HeroStatEntry | undefined;
  bestHeroGame: BestGame | null;
  bestHeroMatchDetails: BestHeroMatchData | null;
  itemConstants: Record<string, ItemConstant> | null;
  signatureMoves: SignatureMoves;
  yearMatches: Match[];
  yearWinRate: string;
  heroAbilities: Record<string, { abilities: string[] }> | null;
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";
const GOLD = "#c8a84b";
const GREY = "rgba(255,255,255,0.4)";

export default function Card1Hero({
  profile,
  topHero,
  bestHeroGame,
  bestHeroMatchDetails,
  itemConstants,
  signatureMoves,
  heroAbilities,
}: Props) {
  const [abilitiesFallback, setAbilitiesFallback] = useState<Record<string, { abilities: string[] }> | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (heroAbilities) return;
    fetchHeroAbilitiesClient().then((data) => {
      if (data) setAbilitiesFallback(data);
    });
  }, [heroAbilities]);

  if (!topHero) {
    return (
      <div style={{ width: "100%", height: "100%", backgroundColor: "#0a0c0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: 180, fontWeight: 900, lineHeight: 1, margin: 0 }}>?</p>
        <p style={{ color: "white", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", textAlign: "center", margin: 0 }}>
          No Hero Data
        </p>
        <p style={{ color: GREY, fontSize: 13, textAlign: "center", maxWidth: 260, lineHeight: 1.5, margin: 0 }}>
          This player&apos;s hero stats aren&apos;t publicly available.
        </p>
      </div>
    );
  }

  const effectiveAbilities = heroAbilities ?? abilitiesFallback;
  const heroData = profile.heroList?.find((h) => h.id === topHero.hero_id);
  const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
  const portraitUrl = cleanName
    ? `${DOTA_CDN}/apps/dota2/images/dota_react/heroes/${cleanName}_full.png`
    : null;

  const wr = parseFloat(topHero.winRate);
  const isGoodWr = wr >= 50;
  const losses = topHero.games - topHero.wins;
  const careerGames = signatureMoves?.careerGamesOnHero ?? topHero.games;
  const vicPct = careerGames > 0 ? Math.min(100, (topHero.wins / careerGames) * 100) : 0;
  const shouldAnimate = reducedMotion !== true;

  const heroKey = `npc_dota_hero_${cleanName}`;
  const filteredAbilities = (effectiveAbilities?.[heroKey]?.abilities ?? []).filter((a) =>
    !a.includes("hidden") &&
    !a.includes("empty") &&
    !a.includes("attribute") &&
    !a.includes("innate_") &&
    !a.includes("intrinsic_") &&
    !a.endsWith("_cancel") &&
    !a.endsWith("_stop") &&
    !a.endsWith("_end") &&
    !a.endsWith("_release") &&
    !a.endsWith("_toggle") &&
    !a.endsWith("_land") &&
    !a.endsWith("_land_self")
  );
  const displayAbilities = filteredAbilities.length <= 4
    ? filteredAbilities
    : [...filteredAbilities.slice(0, 3), filteredAbilities[filteredAbilities.length - 1]];

  const showItems = bestHeroMatchDetails !== null;

  const { radiantWins, radiantGames, direWins, direGames } = signatureMoves;
  const radiantLosses = radiantGames - radiantWins;
  const direLosses = direGames - direWins;
  const radiantWinPct = radiantGames > 0 ? Math.round((radiantWins / radiantGames) * 100) : 0;
  const direWinPct = direGames > 0 ? Math.round((direWins / direGames) * 100) : 0;

  const fmt = (v: number | null | undefined): string =>
    v != null ? v.toLocaleString() : "—";

  const fmtDamage = (v: number): string =>
    !v ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: "#0a0c0f",
        backgroundImage: [
          "repeating-linear-gradient(rgba(255,255,255,0.02) 0px, transparent 1px, transparent 40px)",
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, transparent 1px, transparent 40px)",
        ].join(", "),
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      {/* SECTION 1 — Two-column header */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Left: hero portrait (35%) */}
        <div
          style={{
            flex: "0 0 35%",
            position: "relative",
            paddingTop: "35%",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#111318",
          }}
        >
          {portraitUrl && (
            <img
              src={portraitUrl}
              alt={topHero.heroName}
              onError={(e) => { e.currentTarget.style.opacity = "0"; }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>

        {/* Right: hero info (65%) */}
        <div style={{ flex: 1, padding: "10px 12px 8px", display: "flex", flexDirection: "column", minWidth: 0, gap: 6 }}>
          <p style={{ color: GREY, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
            YOUR MOST PLAYED HERO
          </p>
          <h2 style={{ color: "white", fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1, margin: 0 }}>
            {topHero.heroName}
          </h2>

          {/* K/D/A row */}
          {bestHeroGame && (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10 }}>
                {(
                  [
                    { v: bestHeroGame.kills,   label: "KILLS",   color: "#9ef01a" },
                    { v: bestHeroGame.deaths,  label: "DEATHS",  color: "#ef4444" },
                    { v: bestHeroGame.assists, label: "ASSISTS", color: "white"   },
                  ] as const
                ).map(({ v, label, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ color, fontSize: 28, fontWeight: 900, lineHeight: 1, margin: 0 }}>{v}</p>
                    <p style={{ color: GREY, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>
              <span
                style={{
                  backgroundColor: bestHeroGame.isWin ? "#9ef01a" : "#ef4444",
                  color: bestHeroGame.isWin ? "#000" : "#fff",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 10,
                  alignSelf: "flex-start",
                  flexShrink: 0,
                }}
              >
                {bestHeroGame.isWin ? "WIN" : "LOSS"}
              </span>
            </div>
          )}

          {/* Stat row: CS | GPM | XPM | DAMAGE */}
          {bestHeroGame && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {(
                [
                  { label: "CS",     value: fmt((bestHeroMatchDetails?.lastHits || bestHeroGame.cs) || 0) },
                  { label: "GPM",    value: fmt((bestHeroMatchDetails?.gpm || bestHeroGame.gpm) || 0) },
                  { label: "XPM",    value: fmt((bestHeroMatchDetails?.xpm || bestHeroGame.xpm) || 0) },
                  { label: "DAMAGE", value: fmtDamage((bestHeroMatchDetails?.heroDamage || bestHeroGame.heroDamage) || 0) },
                ] as const
              ).map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1, margin: 0 }}>{value}</p>
                  <p style={{ color: GREY, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2 — Career stats (dark bg) */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#0d1a26",
          padding: "10px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {(
          [
            { label: "CAREER GAMES", value: careerGames.toLocaleString(), color: "white" },
            { label: "WIN RATE",     value: `${topHero.winRate}%`,         color: isGoodWr ? "#9ef01a" : "#ef4444" },
            { label: "LIFETIME",     value: `${topHero.wins}W ${losses}L`, color: "white" },
          ] as const
        ).map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
            }}
          >
            <p style={{ color: stat.color, fontSize: 13, fontWeight: 800, lineHeight: 1, margin: "0 0 3px" }}>{stat.value}</p>
            <p style={{ color: GREY, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Ability icons (4×44px centered) */}
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {displayAbilities.map((ability) => {
            console.log('[ability icon src]', `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${ability}.png`);
            return (
              <div
                key={ability}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`${DOTA_CDN}/apps/dota2/images/dota_react/abilities/${ability}.png`}
                  alt={ability}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = "1";
                      img.src = `${DOTA_CDN}/apps/dota2/images/dota2_react/abilities/${ability}.png`;
                    } else {
                      img.style.display = "none";
                    }
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 4 - displayAbilities.length) }).map((_, idx) => (
            <div
              key={`ph-${idx}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4 — Best game items (2×3) */}
      {showItems && (
        <div style={{ padding: "10px 14px 0" }}>
          <p style={{ color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>
            BEST GAME ITEMS
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {bestHeroMatchDetails!.items.map((itemId, i) => {
              const itemName = itemId === 0 ? null : getItemName(itemId);
              if (itemName === null) {
                return (
                  <div
                    key={i}
                    style={{
                      height: 64,
                      borderRadius: 6,
                      backgroundColor: "#0d1a26",
                    }}
                  />
                );
              }
              return (
                <div key={i} style={{ overflow: "hidden", borderRadius: 4 }}>
                  <img
                    src={`${ITEM_CDN}/${itemName}.png`}
                    alt={itemName}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5 — HERO STATS panel (Dota scoreboard style) */}
      <div
        style={{
          margin: "12px 14px 0",
          backgroundColor: "#0a0f0a",
          border: "1px solid rgba(158,240,26,0.15)",
          borderRadius: 4,
          padding: "10px 12px 12px",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>
            ◆ HERO STATS
          </p>
          <p style={{ color: isGoodWr ? "#9ef01a" : "#ef4444", fontSize: 12, fontWeight: 700, lineHeight: 1, margin: 0 }}>
            {topHero.winRate}%
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(200,168,75,0.15)", marginBottom: 10 }} />

        {/* VICTORIES stat row */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <p style={{ color: "#8a9bb0", fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>VICTORIES</p>
            <p style={{ color: "white", fontSize: 18, fontWeight: 700, lineHeight: 1, margin: 0 }}>{topHero.wins.toLocaleString()}</p>
          </div>
          <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: shouldAnimate ? "0%" : `${vicPct}%` }}
              animate={{ width: `${vicPct}%` }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              style={{ height: "100%", background: "linear-gradient(90deg, #4a7c1a, #9ef01a)", borderRadius: 2 }}
            />
          </div>
        </div>

        {/* WIN RATE stat row */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <p style={{ color: "#8a9bb0", fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>WIN RATE</p>
            <p style={{ color: isGoodWr ? "#9ef01a" : "#ef4444", fontSize: 18, fontWeight: 700, lineHeight: 1, margin: 0 }}>{topHero.winRate}%</p>
          </div>
          <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: shouldAnimate ? "0%" : `${wr}%` }}
              animate={{ width: `${wr}%` }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
              style={{ height: "100%", background: "linear-gradient(90deg, #4a7c1a, #9ef01a)", borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(200,168,75,0.15)", margin: "10px 0 8px" }} />

        {/* RADIANT vs DIRE */}
        <div style={{ display: "flex" }}>
          {/* RADIANT */}
          <div style={{ flex: 1, paddingLeft: 8, paddingRight: 4, borderLeft: "2px solid #9ef01a" }}>
            <p style={{ color: "#9ef01a", fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 3px" }}>▲ RADIANT</p>
            <p style={{ color: "white", fontSize: 16, fontWeight: 700, lineHeight: 1, margin: "0 0 2px" }}>{radiantWins}W / {radiantLosses}L</p>
            <p style={{ color: "#9ef01a", fontSize: 10, margin: 0 }}>{radiantWinPct}% win rate</p>
          </div>

          {/* Vertical gold divider */}
          <div style={{ width: 1, backgroundColor: `${GOLD}33`, margin: "0 8px", flexShrink: 0 }} />

          {/* DIRE */}
          <div style={{ flex: 1, paddingLeft: 8, paddingRight: 4, borderLeft: "2px solid #ef4444" }}>
            <p style={{ color: "#ef4444", fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 3px" }}>▼ DIRE</p>
            <p style={{ color: "white", fontSize: 16, fontWeight: 700, lineHeight: 1, margin: "0 0 2px" }}>{direWins}W / {direLosses}L</p>
            <p style={{ color: "#ef4444", fontSize: 10, margin: 0 }}>{direWinPct}% win rate</p>
          </div>
        </div>
      </div>

      {/* SECTION 6 — Watermark */}
      <p
        style={{
          color: "rgba(138,155,176,0.25)",
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          textAlign: "center",
          padding: "10px 0 14px",
          margin: 0,
        }}
      >
        DOTAWRAPPED.GG
      </p>
    </div>
  );
}
