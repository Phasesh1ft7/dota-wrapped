"use client";

import React, { useState, useEffect, useRef, useCallback, Component } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type {
  ProfileData, PlayerHeroStats, Hero, Peer, Match, QuizMatch,
  ItemConstant, BestHeroMatchData,
} from "@/lib/opendota";
import type {
  HeroStatEntry, BestHeroMatch, BestGame, TempoStats, SignatureMoves,
  LegendStats, PlayStyleStats, RankInfo, YearInNumbers,
} from "@/lib/transforms";
import CardModal from "@/components/CardModal";

const Card1Hero    = dynamic(() => import("./cards/Card1Hero"),    { ssr: false });
const CardRank     = dynamic(() => import("./cards/CardRank"),     { ssr: false });
const CardPlayStyle= dynamic(() => import("./cards/CardPlayStyle"),{ ssr: false });
const Card4MatchupB= dynamic(() => import("./cards/Card4MatchupB"),{ ssr: false });
const Card5Summary = dynamic(() => import("./cards/Card5Summary"), { ssr: false });
const Card6Teammate= dynamic(() => import("./cards/Card6Teammate"),{ ssr: false });
const Card8BestMonth=dynamic(() => import("./cards/Card8BestMonth"),{ ssr: false });
const CardQuiz     = dynamic(() => import("./cards/CardQuiz"),     { ssr: false });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  bestHeroMatch: BestHeroMatch | null;
  bestHeroGame: BestGame | null;
  bestHeroMatchDetails: BestHeroMatchData | null;
  totalHours: number;
  playerHeroes: PlayerHeroStats[];
  heroList: Hero[] | null;
  peers: Peer[] | null;
  matches: Match[];
  quizMatches: QuizMatch[];
  itemConstants: Record<string, ItemConstant> | null;
  totalGames: number;
  yearWinRate: string;
  tempoStats: TempoStats;
  signatureMoves: SignatureMoves;
  yearInNumbers: YearInNumbers;
  legendStats: LegendStats;
  playStyleStats: PlayStyleStats | null;
  rankInfo: RankInfo;
  playerName: string;
  heroAbilities?: Record<string, { abilities: string[] }> | null;
}

type ModalId = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9;

// Each slide: { label, accentColor, modalId }
const SLIDES = [
  { label: "Hero DNA",            accent: "#F59E0B", modalId: 1 as ModalId },
  { label: "Win Rate",            accent: "#9ef01a", modalId: 5 as ModalId },
  { label: "Rank",                accent: "#a78bfa", modalId: 2 as ModalId },
  { label: "Signature Moves",     accent: "#F97316", modalId: 4 as ModalId },
  { label: "Tempo Stats",         accent: "#06B6D4", modalId: 8 as ModalId },
  { label: "Teammate Chemistry",  accent: "#A855F7", modalId: 6 as ModalId },
  { label: "Play Style",          accent: "#c8a84b", modalId: 3 as ModalId },
  { label: "Year in Review",      accent: "#F43F5E", modalId: 9 as ModalId },
] as const;

const CARD_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError)
      return <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 80 }}>Data unavailable</div>;
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRankColor(n: number) {
  if (n <= 2) return "#6b7280";
  if (n <= 4) return "#4ade80";
  if (n <= 6) return "#60a5fa";
  if (n === 7) return "#a78bfa";
  return "#f59e0b";
}

const isMatchWin = (m: Match) =>
  (m.radiant_win && m.player_slot < 128) || (!m.radiant_win && m.player_slot >= 128);

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function TapHint({ onTap }: { onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      style={{
        marginTop: 24,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 24,
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        padding: "8px 20px",
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      Full Breakdown →
    </button>
  );
}

function DownloadBtn({ cardRef }: { cardRef: React.RefObject<HTMLDivElement | null> }) {
  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!cardRef.current) return;
    const h2c = (await import("html2canvas")).default;
    const canvas = await h2c(cardRef.current, {
      useCORS: true, allowTaint: false, backgroundColor: null, scale: 2,
    });
    const a = document.createElement("a");
    a.download = "dota-wrapped.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }
  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: 80,
        right: 20,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 20,
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        padding: "6px 14px",
        cursor: "pointer",
        zIndex: 10,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        backdropFilter: "blur(8px)",
      }}
    >
      ⬇ Save
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card face: 1 — Hero DNA
// ---------------------------------------------------------------------------

function HeroDNAFace({ topHero, profile, matches, yearWinRate, bestHeroMatchDetails, onModal }: {
  topHero: HeroStatEntry | undefined;
  profile: ProfileData;
  matches: Match[];
  yearWinRate: string;
  bestHeroMatchDetails: BestHeroMatchData | null;
  onModal: () => void;
}) {
  const heroData = profile.heroList?.find((h) => h.id === topHero?.hero_id);
  const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
  const wr = parseFloat(topHero?.winRate ?? "0");
  const isGoodWr = wr >= 50;

  const isParsed = bestHeroMatchDetails?.isParsed ?? false;
  const gpm = isParsed && bestHeroMatchDetails != null && bestHeroMatchDetails.gpm != null && bestHeroMatchDetails.gpm > 0 ? String(bestHeroMatchDetails.gpm) : null;
  const cs  = isParsed && bestHeroMatchDetails != null && bestHeroMatchDetails.lastHits != null ? String(bestHeroMatchDetails.lastHits) : null;

  const heroYearMatches = topHero ? matches.filter((m) => m.hero_id === topHero.hero_id) : [];
  const avgKda = heroYearMatches.length > 0
    ? ((heroYearMatches.reduce((s, m) => s + m.kills + m.assists, 0) /
        Math.max(heroYearMatches.reduce((s, m) => s + m.deaths, 0), 1))).toFixed(1)
    : "—";

  const cols = [
    gpm ? { value: gpm,                              label: "GPM" }       : { value: avgKda, label: "KDA" },
    cs  ? { value: cs,                               label: "CS" }        : { value: String(heroYearMatches.length), label: "Year Games" },
    { value: topHero?.games.toLocaleString() ?? "—", label: "Career" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#000", overflow: "hidden" }}>
      {cleanName && (
        <img
          src={`/api/hero-image?hero=${cleanName}`}
          alt={topHero?.heroName ?? ""}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, #000 38%, rgba(0,0,0,0.55) 60%, transparent 80%)" }} />

      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, padding: "0 28px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", margin: "0 0 6px" }}>
          Hero DNA
        </p>
        <h2 style={{ fontSize: 52, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.03em", lineHeight: 1, margin: "0 0 20px" }}>
          {topHero?.heroName ?? "No Data"}
        </h2>

        <div style={{ display: "flex", gap: 28, marginBottom: 20 }}>
          {cols.map((c) => (
            <div key={c.label}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "white", margin: "0 0 2px", lineHeight: 1 }}>{c.value}</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>{c.label}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
          Win Rate on This Hero
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2 }}>
            <div style={{ width: `${Math.min(wr, 100)}%`, height: "100%", backgroundColor: isGoodWr ? "#9ef01a" : "#FF4D30", borderRadius: 2 }} />
          </div>
          <span style={{ color: isGoodWr ? "#9ef01a" : "#FF4D30", fontSize: 14, fontWeight: 700, minWidth: 44, textAlign: "right" }}>
            {topHero?.winRate ?? "—"}%
          </span>
        </div>

        <TapHint onTap={onModal} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 2 — Win Rate
// ---------------------------------------------------------------------------

function WinRateFace({ matches, yearWinRate, onModal }: {
  matches: Match[];
  yearWinRate: string;
  onModal: () => void;
}) {
  const monthly: { key: string; rate: number }[] = [];
  const buckets: Record<string, { wins: number; total: number }> = {};
  for (const m of matches) {
    const d = new Date(m.start_time * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { wins: 0, total: 0 };
    buckets[key].total++;
    if (isMatchWin(m)) buckets[key].wins++;
  }
  const sortedKeys = Object.keys(buckets).sort();
  for (const k of sortedKeys) {
    const b = buckets[k];
    monthly.push({ key: k, rate: Math.round((b.wins / b.total) * 100) });
  }
  const filtered = monthly.filter((_, i, arr) => arr.length <= 12 || i >= arr.length - 12);
  const peak = filtered.length > 0 ? Math.max(...filtered.map((m) => m.rate)) : null;

  const W = 280, H = 60;
  const points = filtered.map((m, i) => {
    const x = filtered.length > 1 ? (i / (filtered.length - 1)) * W : W / 2;
    const y = H - (m.rate / 100) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse at 50% 40%, rgba(158,240,26,0.08) 0%, #020802 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 8px" }}>
        Peak Win Rate
      </p>
      <p style={{ fontSize: 88, fontWeight: 900, color: "#9ef01a", lineHeight: 1, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
        {peak != null ? `${peak}%` : "—"}
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 40px" }}>
        in a single month
      </p>

      {filtered.length > 1 && (
        <svg width={W} height={H + 10} style={{ overflow: "visible", marginBottom: 32 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ef01a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9ef01a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="#9ef01a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      )}

      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>{yearWinRate}%</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0 0" }}>Year Average</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>{matches.length}</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0 0" }}>Games</p>
        </div>
      </div>

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 3 — Rank
// ---------------------------------------------------------------------------

function RankFace({ rankInfo, onModal }: { rankInfo: RankInfo; onModal: () => void }) {
  const { fullRank, medalNumber, percentileLabel, stars, isImmortal, leaderboardRank } = rankInfo;
  const color = getRankColor(medalNumber);
  const [imgFailed, setImgFailed] = useState(false);
  const badgeUrl = medalNumber > 0 && !imgFailed
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}.png`
    : null;

  const starsStr = isImmortal ? "★★★★★" : "★".repeat(Math.max(0, stars));
  const rightLabel = isImmortal && leaderboardRank ? `#${leaderboardRank}` : null;

  return (
    <div style={{ width: "100%", height: "100%", background: `radial-gradient(ellipse at 50% 35%, ${color}22 0%, #000 65%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", margin: "0 0 32px" }}>
        Your 2026 Rank
      </p>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 220, height: 220, marginBottom: 24 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: "blur(20px)" }} />
        {badgeUrl ? (
          <img src={badgeUrl} alt={fullRank} width={180} height={180} onError={() => setImgFailed(true)} style={{ objectFit: "contain", filter: `drop-shadow(0 0 32px ${color}88)`, position: "relative" }} />
        ) : (
          <div style={{ width: 180, height: 180, borderRadius: "50%", border: `3px solid ${color}55`, backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color, fontSize: 18, fontWeight: 700, textTransform: "uppercase" }}>{fullRank}</span>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 42, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", textAlign: "center" }}>
        {fullRank}
      </h2>

      {starsStr && (
        <p style={{ margin: "0 0 8px", letterSpacing: 4 }}>
          {"★".repeat(starsStr.length).split("").map((s, i) => (
            <span key={i} style={{ color: "#c8a84b", fontSize: 20 }}>{s}</span>
          ))}
        </p>
      )}

      <p style={{ fontSize: 14, color, margin: "0 0 4px", fontWeight: 600 }}>{percentileLabel}</p>
      {rightLabel && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>Leaderboard {rightLabel}</p>}

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 4 — Signature Moves (Year in Numbers)
// ---------------------------------------------------------------------------

function SignatureFace({ yearInNumbers, onModal }: { yearInNumbers: YearInNumbers; onModal: () => void }) {
  const { totalGames, totalHours, uniqueHeroes, bestWinStreak, worstLoseStreak, mostPlayedDay, mostPlayedHeroCleanName } = yearInNumbers;
  const heroImgUrl = mostPlayedHeroCleanName
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${mostPlayedHeroCleanName}_full.png`
    : null;

  const grid = [
    { label: "Games",       value: totalGames.toLocaleString() },
    { label: "Hours",       value: `${totalHours}h` },
    { label: "Heroes",      value: String(uniqueHeroes) },
    { label: "Best Streak", value: `${bestWinStreak}W` },
    { label: "Worst Run",   value: `${worstLoseStreak}L` },
    { label: "Best Day",    value: mostPlayedDay.slice(0, 3).toUpperCase() },
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#08070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {heroImgUrl && (
        <img src={heroImgUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, filter: "blur(16px)", pointerEvents: "none" }} />
      )}
      <p style={{ position: "relative", fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 6px" }}>
        Your 2026
      </p>
      <p style={{ position: "relative", fontSize: 38, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 36px", lineHeight: 1 }}>
        In Numbers
      </p>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px 32px", padding: "0 32px" }}>
        {grid.map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <TapHint onTap={onModal} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 5 — Tempo Stats
// ---------------------------------------------------------------------------

function TempoFace({ tempoStats, onModal }: { tempoStats: TempoStats; onModal: () => void }) {
  const { fastestWin, longestGame, avgDuration, totalHoursThisYear } = tempoStats;
  const rows = [
    { label: "Longest Game",     value: longestGame ?? "—" },
    { label: "Avg Game Length",  value: avgDuration },
    { label: "Hours This Year",  value: `${totalHoursThisYear}h` },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.1) 0%, #000c0f 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 8px" }}>
        Fastest Win
      </p>
      <p style={{ fontSize: 80, fontWeight: 900, color: "#06B6D4", lineHeight: 1, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
        {fastestWin ?? "—"}
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: "0 0 44px" }}>
        your quickest victory
      </p>

      <div style={{ width: "100%", maxWidth: 320 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 20, color: "white", fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</span>
          </div>
        ))}
      </div>

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 6 — Teammate Chemistry
// ---------------------------------------------------------------------------

function TeammateFace({ peers, onModal }: { peers: Peer[] | null; onModal: () => void }) {
  const topPeer = (peers ?? [])
    .filter((p) => p.with_games >= 5)
    .sort((a, b) => b.with_games - a.with_games)[0] ?? null;

  const [avatarFailed, setAvatarFailed] = useState(false);
  if (!topPeer) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0a0014", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No teammate data</p>
      </div>
    );
  }

  const wr = topPeer.with_games > 0 ? ((topPeer.with_win / topPeer.with_games) * 100).toFixed(1) : "0.0";
  const isGoodWr = parseFloat(wr) >= 50;
  const name = topPeer.personaname ?? topPeer.name ?? "Unknown";
  const avatarUrl = topPeer.avatarfull ?? topPeer.avatar ?? null;

  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.12) 0%, #0a0014 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 28px" }}>
        Best Teammate
      </p>

      <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", border: "3px solid #A855F7", marginBottom: 20, flexShrink: 0, background: "#1a0a2e" }}>
        {avatarUrl && !avatarFailed ? (
          <img src={avatarUrl} alt={name} width={100} height={100} onError={() => setAvatarFailed(true)} style={{ objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 36, fontWeight: 800 }}>{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 20px", textAlign: "center", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </h2>

      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 4px", lineHeight: 1 }}>{topPeer.with_games}</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Games Together</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: isGoodWr ? "#9ef01a" : "#FF4D30", margin: "0 0 4px", lineHeight: 1 }}>{wr}%</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Win Rate</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 4px", lineHeight: 1 }}>{topPeer.with_win}</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Wins</p>
        </div>
      </div>

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 7 — Play Style (SVG radar)
// ---------------------------------------------------------------------------

function RadarPolygon({ data }: { data: { axis: string; value: number }[] }) {
  const cx = 130, cy = 130, r = 90;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const toXY = (i: number, frac: number) => ({
    x: cx + Math.cos(angle(i)) * r * frac,
    y: cy + Math.sin(angle(i)) * r * frac,
  });

  const polygonPoints = data.map((d, i) => {
    const pt = toXY(i, d.value / 100);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  const outerPoints = data.map((_, i) => {
    const pt = toXY(i, 1);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  return (
    <svg width={260} height={260} viewBox="0 0 260 260">
      {gridLevels.map((frac) => (
        <polygon key={frac} points={data.map((_, i) => { const p = toXY(i, frac); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(200,168,75,0.15)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const outer = toXY(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(200,168,75,0.15)" strokeWidth="1" />;
      })}
      <polygon points={outerPoints} fill="none" stroke="rgba(200,168,75,0.25)" strokeWidth="1" />
      <polygon points={polygonPoints} fill="rgba(200,168,75,0.2)" stroke="#c8a84b" strokeWidth="2" />
      {data.map((d, i) => {
        const pt = toXY(i, 1.2);
        return (
          <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
            fill="#c8a84b" fontSize="9" fontWeight="700" letterSpacing="1">
            {d.axis}
          </text>
        );
      })}
      {data.map((d, i) => {
        const pt = toXY(i, d.value / 100);
        return <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#c8a84b" />;
      })}
    </svg>
  );
}

function PlayStyleFace({ playStyleStats, onModal }: { playStyleStats: PlayStyleStats | null; onModal: () => void }) {
  if (!playStyleStats) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No stats available</p>
      </div>
    );
  }
  const { avgGpm, avgXpm, avgLastHits, fighting, farming, supporting, pushing, utility } = playStyleStats;
  const radarData = [
    { axis: "FIGHT",   value: fighting },
    { axis: "FARM",    value: farming },
    { axis: "SUPPORT", value: supporting },
    { axis: "PUSH",    value: pushing },
    { axis: "UTILITY", value: utility },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0f", backgroundImage: "radial-gradient(rgba(200,168,75,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 24px" }}>
        Play Style
      </p>

      <RadarPolygon data={radarData} />

      <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
        {[
          { label: "GPM", value: avgGpm.toLocaleString() },
          { label: "XPM", value: avgXpm.toLocaleString() },
          { label: "CS",  value: avgLastHits.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "0 0 2px", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face: 8 — Year in Review
// ---------------------------------------------------------------------------

function YearReviewFace({ matches, yearWinRate, yearInNumbers, onModal }: {
  matches: Match[];
  yearWinRate: string;
  yearInNumbers: YearInNumbers;
  onModal: () => void;
}) {
  const { bestWinStreak, totalHours, uniqueHeroes, mostPlayedDay } = yearInNumbers;
  const wins = matches.filter(isMatchWin).length;

  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse at 50% 25%, rgba(244,63,94,0.1) 0%, #0a0004 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 8px" }}>
        Year in Review
      </p>
      <p style={{ fontSize: 96, fontWeight: 900, color: "white", lineHeight: 1, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
        {matches.length}
      </p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: "0 0 40px" }}>
        games played
      </p>

      <div style={{ width: "100%", maxWidth: 320 }}>
        {[
          { label: "Win Rate",     value: `${yearWinRate}%`,        color: parseFloat(yearWinRate) >= 50 ? "#9ef01a" : "#FF4D30" },
          { label: "Wins",         value: String(wins),              color: "white" },
          { label: "Best Streak",  value: `${bestWinStreak}W`,       color: "#9ef01a" },
          { label: "Hours Played", value: `${totalHours}h`,          color: "white" },
          { label: "Heroes Tried", value: String(uniqueHeroes),      color: "white" },
          { label: "Best Day",     value: mostPlayedDay,             color: "#F43F5E" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 18, color, fontWeight: 800 }}>{value}</span>
          </div>
        ))}
      </div>

      <TapHint onTap={onModal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Player Header
// ---------------------------------------------------------------------------

function PlayerHeader({ profile, rankInfo, playerName }: {
  profile: ProfileData;
  rankInfo: RankInfo;
  playerName: string;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [badgeFailed, setBadgeFailed] = useState(false);
  const avatarUrl = profile.player?.profile?.avatarfull ?? "";
  const badgeUrl = rankInfo.medalNumber > 0 && !badgeFailed
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${rankInfo.medalNumber}.png`
    : null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(12px)",
    }}>
      {/* Hex avatar */}
      <div style={{ width: 36, height: 36, flexShrink: 0, background: "#c8a84b", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {avatarUrl && !avatarFailed ? (
          <img src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} style={{ width: 32, height: 32, objectFit: "cover", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
        ) : (
          <div style={{ width: 32, height: 32, clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 800 }}>{playerName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <p style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {playerName}
      </p>

      {badgeUrl && (
        <img src={badgeUrl} alt="" width={28} height={28} onError={() => setBadgeFailed(true)} style={{ objectFit: "contain", flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, flexShrink: 0 }}>{rankInfo.fullRank}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress Dots
// ---------------------------------------------------------------------------

function ProgressDots({ total, current, accent }: { total: number; current: number; accent: string }) {
  return (
    <div style={{
      position: "fixed", top: 56, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "6px 0",
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 6, backgroundColor: i === current ? "#ffffff" : "rgba(255,255,255,0.25)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Carousel
// ---------------------------------------------------------------------------

export default function WrappedCarousel({
  profile, heroStats, bestHeroGame, bestHeroMatchDetails,
  totalHours, playerHeroes, heroList, peers, matches, quizMatches,
  itemConstants, totalGames, yearWinRate, tempoStats, signatureMoves,
  yearInNumbers, legendStats, playStyleStats, rankInfo, playerName,
  bestHeroMatch, heroAbilities,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openModal, setOpenModal] = useState<ModalId | null>(null);
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const total = SLIDES.length;

  const navigate = useCallback((dir: 1 | -1) => {
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0 || next >= total) return prev;
      return next;
    });
    setDirection(dir);
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft")  navigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  function openModalForCurrent() {
    setOpenModal(SLIDES[current].modalId);
  }

  function renderCardFace(idx: number) {
    switch (idx) {
      case 0: return <HeroDNAFace topHero={heroStats[0]} profile={profile} matches={matches} yearWinRate={yearWinRate} bestHeroMatchDetails={bestHeroMatchDetails} onModal={openModalForCurrent} />;
      case 1: return <WinRateFace matches={matches} yearWinRate={yearWinRate} onModal={openModalForCurrent} />;
      case 2: return <RankFace rankInfo={rankInfo} onModal={openModalForCurrent} />;
      case 3: return <SignatureFace yearInNumbers={yearInNumbers} onModal={openModalForCurrent} />;
      case 4: return <TempoFace tempoStats={tempoStats} onModal={openModalForCurrent} />;
      case 5: return <TeammateFace peers={peers} onModal={openModalForCurrent} />;
      case 6: return <PlayStyleFace playStyleStats={playStyleStats} onModal={openModalForCurrent} />;
      case 7: return <YearReviewFace matches={matches} yearWinRate={yearWinRate} yearInNumbers={yearInNumbers} onModal={openModalForCurrent} />;
      default: return null;
    }
  }

  function renderModalContent(id: ModalId, isExporting?: boolean) {
    switch (id) {
      case 1: return <ErrorBoundary><Card1Hero profile={profile} topHero={heroStats[0]} bestHeroGame={bestHeroGame} bestHeroMatchDetails={bestHeroMatchDetails} itemConstants={itemConstants} signatureMoves={signatureMoves} yearMatches={matches} yearWinRate={yearWinRate} heroAbilities={heroAbilities ?? null} /></ErrorBoundary>;
      case 2: return <ErrorBoundary><CardRank rankInfo={rankInfo} playerName={playerName} /></ErrorBoundary>;
      case 3: return <ErrorBoundary><CardPlayStyle playStyleStats={playStyleStats} playerName={playerName} /></ErrorBoundary>;
      case 4: return <ErrorBoundary><Card4MatchupB yearInNumbers={yearInNumbers} playerName={playerName} heroAbilities={heroAbilities} heroRelicsConfig={heroStats[0]?.hero_id && profile.player?.profile?.account_id ? { accountId: String(profile.player.profile.account_id), heroId: heroStats[0].hero_id } : null} /></ErrorBoundary>;
      case 5: return <ErrorBoundary><Card5Summary profile={profile} heroStats={heroStats} matches={matches} heroes={heroList ?? []} totalHours={totalHours} yearWinRate={yearWinRate} totalGames={totalGames} isExporting={isExporting} /></ErrorBoundary>;
      case 6: return <ErrorBoundary><Card6Teammate peers={peers} /></ErrorBoundary>;
      case 8: return <ErrorBoundary><Card8BestMonth tempoStats={tempoStats} /></ErrorBoundary>;
      case 9: return <ErrorBoundary><CardQuiz quizMatches={quizMatches} itemConstants={itemConstants} heroList={heroList} /></ErrorBoundary>;
    }
  }

  const slide = SLIDES[current];
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, overflow: "hidden", backgroundColor: "#000", touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <PlayerHeader profile={profile} rankInfo={rankInfo} playerName={playerName} />
      <ProgressDots total={total} current={current} accent={slide.accent} />

      {/* Card area */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={current}
          ref={cardRef}
          custom={direction}
          variants={shouldReduceMotion ? {} : variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: CARD_EASE }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ErrorBoundary>
            {renderCardFace(current)}
          </ErrorBoundary>
          <DownloadBtn cardRef={cardRef} />
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {current > 0 && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous"
          style={{
            position: "fixed", bottom: 24, left: 20, zIndex: 200,
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          ‹
        </button>
      )}
      {current < total - 1 && (
        <button
          onClick={() => navigate(1)}
          aria-label="Next"
          style={{
            position: "fixed", bottom: 24, right: 20, zIndex: 200,
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          ›
        </button>
      )}

      {/* Slide label */}
      <div style={{ position: "fixed", bottom: 32, left: 0, right: 0, zIndex: 150, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}
          >
            {slide.label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Modal */}
      {openModal !== null && (
        <CardModal key={openModal} onClose={() => setOpenModal(null)}>
          {(isExporting) => renderModalContent(openModal!, isExporting)}
        </CardModal>
      )}
    </div>
  );
}
