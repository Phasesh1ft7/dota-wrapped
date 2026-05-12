"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { ProfileData, Match, Hero } from "@/lib/opendota";
import type { HeroStatEntry } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  matches: Match[];
  heroes: Hero[];
  totalHours: number;
  yearWinRate: string;
  totalGames: number;
  isExporting?: boolean;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

const isMatchWin = (m: Match) =>
  (m.radiant_win && m.player_slot < 128) || (!m.radiant_win && m.player_slot >= 128);

function MatchHeroIcon({ cleanName }: { cleanName: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !cleanName) {
    return <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: "#1a1a1a", flexShrink: 0 }} />;
  }
  return (
    <img
      src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${cleanName}.png`}
      alt=""
      width={24}
      height={24}
      style={{ borderRadius: 4, display: "block", flexShrink: 0, objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}

export default function Card5Summary({
  profile,
  heroStats,
  matches,
  heroes,
  totalHours,
  yearWinRate,
  totalGames,
  isExporting = false,
}: Props) {
  const wins = profile.wl?.win ?? 0;
  const losses = profile.wl?.lose ?? 0;
  const allTimeTotal = wins + losses;
  const allTimeWr = allTimeTotal > 0 ? ((wins / allTimeTotal) * 100).toFixed(1) : "0.0";
  const isGoodWr = parseFloat(allTimeWr) >= 50;
  const hasData = !!profile.wl && (wins > 0 || losses > 0);
  const top5 = heroStats.slice(0, 5);

  // Build monthly win rate data for chart
  const chartData = (() => {
    const buckets: Record<string, { wins: number; total: number; monthIdx: number }> = {};
    for (const m of matches) {
      const d = new Date(m.start_time * 1000);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!buckets[key]) buckets[key] = { wins: 0, total: 0, monthIdx: d.getUTCMonth() };
      buckets[key].total++;
      if (isMatchWin(m)) buckets[key].wins++;
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, { wins: w, total, monthIdx }]) => ({
        month: MONTH_SHORT[monthIdx],
        wr: Math.round((w / total) * 100),
        total,
      }))
      .filter((d) => d.total >= 3);
  })();

  const hasChartData = chartData.length >= 3;
  const winRateValues = chartData.map((d) => d.wr);
  const nonZeroWR = winRateValues.filter((v) => v > 0);
  const minWR = nonZeroWR.length > 0 ? Math.max(0, Math.floor(Math.min(...nonZeroWR) / 10) * 10 - 10) : 0;
  const maxWR = winRateValues.length > 0 ? Math.min(100, Math.ceil(Math.max(...winRateValues) / 10) * 10 + 10) : 100;
  const chartDomain: [number, number] = nonZeroWR.length === 0 ? [0, 100] : [minWR, maxWR];

  const recentMatches = [...matches]
    .sort((a, b) => b.start_time - a.start_time)
    .slice(0, 5);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: "#000000",
        position: "relative",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 28px 0 28px",
      }}
    >
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
        }}
      >
        <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
        <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>


      {/* ── Top label ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexShrink: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Your 2026 Dota Wrapped
        </p>
      </div>

      {/* ── W/L + Win rate OR stats-unavailable fallback ── */}
      {hasData ? (
        <>
          <div style={{ flexShrink: 0 }}>
            <p
              style={{
                color: "white",
                fontSize: 40,
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                marginBottom: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {wins.toLocaleString()}
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 28 }}>{" "}/{" "}</span>
              {losses.toLocaleString()}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 5 }}>
              All-time W / L
            </p>
            <p style={{ color: isGoodWr ? "#B9FF33" : "#FF4D30", fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
              {allTimeWr}%
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              win rate
            </p>
          </div>

          {/* Hero chips (top 3, 56×70) */}
          {top5.length > 0 && (
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8, marginBottom: 8, flexShrink: 0 }}>
              {top5.slice(0, 3).map((hero) => {
                const heroData = profile.heroList?.find((h) => h.id === hero.hero_id);
                const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
                return (
                  <div
                    key={hero.hero_id}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {cleanName && (
                      <img
                        src={`/api/hero-image?hero=${cleanName}`}
                        alt={hero.heroName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{ flexShrink: 0 }}>
          <p style={{ color: "white", fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
            Stats Unavailable
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.55 }}>
            This player&apos;s match data is private or hasn&apos;t been tracked by OpenDota.
          </p>
        </div>
      )}

      {/* ── Win rate over time chart ── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
          Win Rate Over Time
        </p>
        {hasChartData ? (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 7, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                height={14}
              />
              <YAxis
                domain={chartDomain}
                tick={{ fontSize: 12, fill: '#a3a3a3' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={42}
                tickCount={5}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, "Win Rate"]}
                contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, borderRadius: 6 }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                itemStyle={{ color: "#B9FF33" }}
              />
              <Line type="monotone" dataKey="wr" stroke="#B9FF33" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 44, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>Not enough match data for chart</p>
          </div>
        )}
      </div>

      {/* ── Hero pool bars ── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ color: "#8a9bb0", fontSize: 8, letterSpacing: 1, fontStyle: "italic", textAlign: "right", marginBottom: 4, marginTop: 0 }}>
          BAR WIDTH = WIN RATE %
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Your Hero Pool
          </p>
          {!hasData && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontStyle: "italic" }}>
              from public records
            </p>
          )}
        </div>
        {top5.map((hero, heroIdx) => {
          const wr = hero.games > 0 ? parseFloat(hero.winRate) : 0;
          const accent = wr >= 50 ? "#B9FF33" : "#FF4D30";
          return (
            <div key={hero.hero_id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontVariant: "small-caps", letterSpacing: "0.05em" }}>
                  {hero.heroName}
                </span>
                <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>{hero.winRate}%</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>·</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{hero.games} games</span>
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(wr, 100)}%` }}
                  transition={{ duration: 0.8, delay: heroIdx * 0.1, ease: "easeOut" }}
                  style={{ height: "100%", backgroundColor: accent, borderRadius: 3 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Match History mini-list ── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
          Recent Matches This Year
        </p>
        <div>
          {recentMatches.map((m, i) => {
            const win = isMatchWin(m);
            const hero = heroes.find((h) => h.id === m.hero_id);
            const cleanName = hero?.name.replace("npc_dota_hero_", "") ?? "";
            const heroName = hero?.localized_name ?? `Hero ${m.hero_id}`;
            const duration = Math.floor(m.duration / 60);
            return (
              <div
                key={m.match_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 0",
                  height: 36,
                  backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <MatchHeroIcon cleanName={cleanName} />
                <span
                  style={{
                    backgroundColor: win ? "#1a3a1a" : "#3a1a1a",
                    color: win ? "#9ef01a" : "#ef4444",
                    fontSize: 9,
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  {win ? "WIN" : "LOSS"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, width: 60, flexShrink: 0 }}>
                  {m.kills}/{m.deaths}/{m.assists}
                </span>
                <span style={{ color: "#c8a84b", fontSize: 11, width: 32, textAlign: "right", flexShrink: 0 }}>
                  {duration}m
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {heroName}
                </span>
              </div>
            );
          })}
          {recentMatches.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, margin: 0 }}>No match data available</p>
          )}
        </div>
      </div>

      {/* ── Bottom stats row ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 8,
          flexShrink: 0,
        }}
      >
        {[
          { value: totalGames.toLocaleString(), label: "Games" },
          { value: `${allTimeWr}%`, label: "Win Rate" },
          { value: `${totalHours}h`, label: "Hours" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: i === 1 ? "center" : i === 2 ? "right" : "left",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              paddingLeft: i > 0 ? 10 : 0,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              {stat.label}
            </p>
            <p style={{ color: "white", fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Share button */}
      {!isExporting && (
        <button
          onClick={() => navigator.clipboard?.writeText(shareUrl()).catch(() => {})}
          style={{
            display: "block",
            width: "fit-content",
            margin: "12px auto 0",
            height: 40,
            borderRadius: 20,
            backgroundColor: "white",
            color: "black",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            padding: "0 28px",
            flexShrink: 0,
          }}
        >
          Share this story
        </button>
      )}

      {/* Watermark */}
      <p
        style={{
          textAlign: "center",
          fontSize: 9,
          color: "rgba(138,155,176,0.4)",
          letterSpacing: 3,
          textTransform: "uppercase",
          paddingTop: 12,
          paddingBottom: 8,
          margin: 0,
          flexShrink: 0,
        }}
      >
        DOTAWRAPPED.GG
      </p>
    </div>
  );
}
