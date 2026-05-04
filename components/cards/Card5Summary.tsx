"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { ProfileData, Match } from "@/lib/opendota";
import type { HeroStatEntry } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  matches: Match[];
  totalHours: number;
  yearWinRate: string;
  totalGames: number;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

const isMatchWin = (m: Match) =>
  (m.radiant_win && m.player_slot < 128) || (!m.radiant_win && m.player_slot >= 128);

export default function Card5Summary({
  profile,
  heroStats,
  matches,
  totalHours,
  yearWinRate,
  totalGames,
}: Props) {
  const wins = profile.wl?.win ?? 0;
  const losses = profile.wl?.lose ?? 0;
  const allTimeTotal = wins + losses;
  const allTimeWr = allTimeTotal > 0 ? ((wins / allTimeTotal) * 100).toFixed(1) : "0.0";
  const isGoodWr = parseFloat(allTimeWr) >= 50;
  const top3 = heroStats.slice(0, 3);
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
      }));
  })();

  const hasChartData = chartData.length >= 3;

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
        padding: "20px 28px 0 28px",
      }}
    >
      {/* 2026 rotated */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "20%",
          transform: "rotate(90deg)",
          transformOrigin: "center center",
          fontSize: 10,
          letterSpacing: "0.3em",
          opacity: 0.3,
          color: "white",
          pointerEvents: "none",
          whiteSpace: "nowrap",
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
        }}
      >
        <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
        <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

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
        }}
      >
        Dota Wrapped
      </p>

      {/* ── Top label ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexShrink: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Your 2026 Dota Wrapped
        </p>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 800 }}>2026</span>
      </div>

      {/* ── W/L + Win rate ── */}
      <div style={{ flexShrink: 0, marginBottom: 10 }}>
        <p
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          {wins.toLocaleString()}
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 32 }}>{" "}/{" "}</span>
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

      {/* ── Hero chips (top 3, 72×90) ── */}
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          {top3.map((hero) => {
            const heroData = profile.heroList?.find((h) => h.id === hero.hero_id);
            const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
            return (
              <div
                key={hero.hero_id}
                style={{
                  width: 72,
                  height: 90,
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {cleanName && (
                  <img
                    src={`/api/hero-image?hero=${cleanName}`}
                    alt={hero.heroName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)",
                    padding: "12px 4px 4px",
                  }}
                >
                  <p style={{ color: "white", fontSize: 7, fontWeight: 700, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hero.heroName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Win rate chart OR hero pool bars (mutually exclusive) ── */}
      <div style={{ flexShrink: 0, marginBottom: 10 }}>
        {hasChartData ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
              Win Rate Over Time
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 7, fill: "rgba(255,255,255,0.35)" }}
                  axisLine={false}
                  tickLine={false}
                  height={14}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 7, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={32}
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
          </>
        ) : (
          <>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
              Your Hero Pool
            </p>
            {top5.map((hero) => {
              const wr = parseFloat(hero.winRate);
              const accent = wr >= 50 ? "#B9FF33" : "#FF4D30";
              return (
                <div key={hero.hero_id} style={{ marginBottom: 8 }}>
                  {/* Name row + stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontVariant: "small-caps", letterSpacing: "0.05em" }}>
                      {hero.heroName}
                    </span>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>{hero.winRate}%</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>·</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{hero.games} games</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(wr, 100)}%`, backgroundColor: accent, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
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

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
