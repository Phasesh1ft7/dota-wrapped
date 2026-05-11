"use client";

import React, { useState, useEffect } from "react";
import type { YearInNumbers } from "@/lib/transforms";
import { fetchHeroAbilitiesClient } from "@/lib/opendota";
import type { ComputedRelic } from "@/lib/opendota";

interface Props {
  yearInNumbers: YearInNumbers;
  playerName: string;
  heroAbilities?: Record<string, { abilities: string[] }> | null;
  heroRelicsConfig: { accountId: string; heroId: number } | null;
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const HERO_CDN_SLUG: Record<string, string> = {
  shadow_fiend: "nevermore",
  queen_of_pain: "queenofpain",
  natures_prophet: "furion",
  windranger: "windrunner",
  anti_mage: "antimage",
  witch_doctor: "witch_doctor",
  zeus: "zuus",
  wraith_king: "skeleton_king",
  io: "wisp",
  underlord: "abyssal_underlord",
  monkey_king: "monkey_king",
};

type Rarity = { label: string; color: string; border: string };

function getRarity(totalGames: number): Rarity {
  if (totalGames < 50)   return { label: "COMMON",    color: "#8a9bb0", border: "rgba(138,155,176,0.4)" };
  if (totalGames < 150)  return { label: "UNCOMMON",  color: "#4caf50", border: "rgba(76,175,80,0.4)"   };
  if (totalGames < 300)  return { label: "RARE",      color: "#4a90d9", border: "rgba(74,144,217,0.4)"  };
  if (totalGames < 600)  return { label: "MYTHICAL",  color: "#c850c0", border: "rgba(200,80,192,0.4)"  };
  if (totalGames < 1000) return { label: "LEGENDARY", color: "#c8a84b", border: "rgba(200,168,75,0.4)"  };
  return                        { label: "ARCANA",    color: "#ff6b35", border: "rgba(255,107,53,0.4)"  };
}

export default function Card4MatchupB({ yearInNumbers, heroAbilities: heroAbilitiesProp, heroRelicsConfig }: Props) {
  const { totalGames, totalHours, bestWinStreak, worstLoseStreak, mostPlayedHeroCleanName } = yearInNumbers;

  const [heroRelics, setHeroRelics] = useState<ComputedRelic[]>([]);
  const [relicsParsedCount, setRelicsParsedCount] = useState(0);
  const [relicsLoading, setRelicsLoading] = useState(true);

  const [heroAbilitiesFallback, setHeroAbilitiesFallback] = useState<Record<string, { abilities: string[] }> | null>(null);

  useEffect(() => {
    if (heroAbilitiesProp) return;
    fetchHeroAbilitiesClient().then((data) => {
      if (data) setHeroAbilitiesFallback(data);
    });
  }, [heroAbilitiesProp]);

  useEffect(() => {
    if (!heroRelicsConfig?.accountId || !heroRelicsConfig?.heroId) {
      setRelicsLoading(false);
      return;
    }

    async function loadRelics() {
      try {
        const res = await fetch(
          `/api/relics?accountId=${heroRelicsConfig!.accountId}&heroId=${heroRelicsConfig!.heroId}&heroName=${encodeURIComponent(mostPlayedHeroCleanName)}`
        );
        const data = await res.json();
        setHeroRelics(data.relics ?? []);
        setRelicsParsedCount(data.parsedCount ?? 0);
      } catch {
        // silent fail
      } finally {
        setRelicsLoading(false);
      }
    }

    loadRelics();
  }, [heroRelicsConfig?.accountId, heroRelicsConfig?.heroId, mostPlayedHeroCleanName]);

  const effectiveAbilities = heroAbilitiesProp ?? heroAbilitiesFallback;
  const heroKey = `npc_dota_hero_${mostPlayedHeroCleanName}`;
  const rawAbilities = effectiveAbilities?.[heroKey]?.abilities ?? [];
  const displayAbilities = rawAbilities
    .filter((a: string) => !a.includes("hidden") && !a.includes("empty") && !a.includes("attribute"))
    .slice(0, 4);

  const cdnSlug = HERO_CDN_SLUG[mostPlayedHeroCleanName] ?? mostPlayedHeroCleanName;
  const heroVertUrl = mostPlayedHeroCleanName
    ? `${DOTA_CDN}/apps/dota2/images/heroes/${cdnSlug}_vert.jpg`
    : null;

  const rarity = getRarity(totalGames);

  // wins not available in YearInNumbers; use 50% as neutral baseline
  const powerRating = Math.round(
    (50 * 0.5) +
    (Math.min(totalGames, 1000) / 1000 * 30) +
    (bestWinStreak * 2)
  );

  const stats = [
    { value: String(totalGames),    label: "BATTLES",  color: "#ffffff" },
    { value: `${totalHours}h`,      label: "AT WAR",   color: "#c8a84b" },
    { value: `${bestWinStreak}W`,   label: "BEST RUN", color: "#9ef01a" },
    { value: `${worstLoseStreak}L`, label: "DARKEST",  color: "#ef4444" },
  ];

  const heroDisplayName = mostPlayedHeroCleanName.replace(/_/g, " ").toUpperCase();

  return (
    <>
      <style>{`
        @property --holo-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes holoRotate {
          from { --holo-angle: 0deg; }
          to   { --holo-angle: 360deg; }
        }
        @keyframes holoGlow {
          0%,100% { box-shadow: 0 0 10px #c8a84b, inset 0 0 8px rgba(200,168,75,0.1); }
          33%     { box-shadow: 0 0 10px #4a90d9, inset 0 0 8px rgba(74,144,217,0.1); }
          66%     { box-shadow: 0 0 10px #9ef01a, inset 0 0 8px rgba(158,240,26,0.1); }
        }
        .card4-outer {
          background: conic-gradient(from var(--holo-angle), #c8a84b, #4a90d9, #9ef01a, #c850c0, #c8a84b);
          animation: holoRotate 4s linear infinite, holoGlow 4s ease infinite;
          border-radius: 16px;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .card4-inner {
          background: #0a0a0f;
          margin: 2px;
          border-radius: 14px;
          height: calc(100% - 4px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
      `}</style>

      <div className="card4-outer">
        <div className="card4-inner">

          {/* ── SECTION 1: HERO PORTRAIT (65%, shrinks to 57% when relics are shown or loading) ── */}
          <div style={{ flex: (relicsLoading || heroRelics.length > 0) ? "0 0 57%" : "0 0 65%", position: "relative", overflow: "hidden", background: "#0d1a26" }}>
            {heroVertUrl && (
              <img
                src={heroVertUrl}
                alt=""
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            )}

            {/* gradient: transparent → black, only bottom 25% */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%)",
                zIndex: 1,
              }}
            />

            {/* hero name */}
            <p
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                zIndex: 2,
                margin: 0,
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textShadow: "0 2px 20px #000",
                lineHeight: 1,
              }}
            >
              {heroDisplayName}
            </p>

            {/* rarity badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 2,
                background: "rgba(0,0,0,0.7)",
                border: `1px solid ${rarity.border}`,
                borderRadius: 20,
                padding: "3px 8px",
              }}
            >
              <span
                style={{
                  color: rarity.color,
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {rarity.label}
              </span>
            </div>
          </div>

          {/* ── SECTION 2: STAT FOOTER (35%) ── */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(to bottom, #000, #0a0a0f)",
              padding: "10px 14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* ROW 1: POWER RATING */}
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: rarity.color, lineHeight: 1 }}>
                {powerRating}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 7,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#8a9bb0",
                }}
              >
                POWER RATING
              </p>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

            {/* ROW 2: 4-column stat strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, flexShrink: 0 }}>
              {stats.map(({ value, label, color }) => (
                <div
                  key={label}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
                  <span
                    style={{
                      fontSize: 7,
                      color: "#8a9bb0",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* ROW 3: ABILITY ICONS */}
            {displayAbilities.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: "auto",
                  paddingTop: 4,
                }}
              >
                {displayAbilities.map((ability: string) => (
                  <div
                    key={ability}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid ${rarity.border}`,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${rarity.color}33`,
                    }}
                  >
                    <img
                      src={`${DOTA_CDN}/apps/dota2/images/dota_react/abilities/${ability}.png`}
                      alt={ability}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ROW 4: HERO RELICS */}
            {relicsLoading ? (
              <div style={{ marginTop: displayAbilities.length === 0 ? "auto" : undefined }}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 7, color: "#c8a84b", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                    HERO RELICS
                  </span>
                </div>
                <p style={{ margin: "8px 0", fontSize: 9, color: "rgba(138,155,176,0.5)", textAlign: "center" }}>
                  ⏳ LOADING RELICS...
                </p>
              </div>
            ) : heroRelics.length > 0 ? (
              <div style={{ marginTop: displayAbilities.length === 0 ? "auto" : undefined }}>
                {/* Section header */}
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 7, color: "#c8a84b", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                    HERO RELICS
                  </span>
                  <span style={{ fontSize: 7, color: relicsParsedCount >= 5 ? "rgba(138,155,176,0.4)" : "#c8a84b", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {relicsParsedCount === 0
                      ? "⏳ PARSING..."
                      : relicsParsedCount < 5
                      ? `${relicsParsedCount}/5 PARSED`
                      : "LAST 5 GAMES"}
                  </span>
                </div>

                {/* Relic rows */}
                {heroRelics.map((relic, i) => {
                  const tierColor =
                    relic.value === 0 ? "#333"
                    : relic.value < 20 ? "#cd7f32"
                    : relic.value < 60 ? "#c0c0c0"
                    : "#c8a84b";
                  const tierGlow =
                    relic.value === 0 ? undefined
                    : relic.value < 20 ? "0 0 4px #cd7f3288"
                    : relic.value < 60 ? "0 0 4px #c0c0c088"
                    : "0 0 6px #c8a84baa";

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingTop: 5,
                        paddingBottom: 5,
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: 999, background: tierColor, boxShadow: tierGlow, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 9, color: "#8a9bb0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {relic.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: relic.value === 0 ? "#444" : "#ffffff" }}>
                        {relic.value === 0 ? "—" : (
                          <>
                            {relic.value}
                            {relic.suffix && <span style={{ color: "#8a9bb0", fontSize: 8 }}>{" "}{relic.suffix}</span>}
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}

                {relicsParsedCount === 0 && (
                  <p style={{ margin: "4px 0 0", fontSize: 7, color: "rgba(138,155,176,0.35)", fontStyle: "italic", textAlign: "center" }}>
                    Refresh in ~60s for ability data
                  </p>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </>
  );
}
