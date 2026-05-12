"use client";

import React, { useState, useEffect, Component } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type {
  ProfileData, PlayerHeroStats, Hero, Peer, Match, QuizMatch,
  ItemConstant, BestHeroMatchData, HeroAbilitiesEntry,
} from "@/lib/opendota";
import type { HeroStatEntry, BestHeroMatch, BestGame, TempoStats, SignatureMoves, LegendStats, PlayStyleStats, RankInfo, YearInNumbers } from "@/lib/transforms";
import dynamic from "next/dynamic";
import CardModal from "@/components/CardModal";
const Card1Hero = dynamic(() => import("./cards/Card1Hero"), { ssr: false });
const CardRank = dynamic(() => import("./cards/CardRank"), { ssr: false });
const CardPlayStyle = dynamic(() => import("./cards/CardPlayStyle"), { ssr: false });
const Card4MatchupB = dynamic(() => import("./cards/Card4MatchupB"), { ssr: false });
const Card5Summary = dynamic(() => import("./cards/Card5Summary"), { ssr: false });
const Card6Teammate = dynamic(() => import("./cards/Card6Teammate"), { ssr: false });
const Card8BestMonth = dynamic(() => import("./cards/Card8BestMonth"), { ssr: false });
const CardQuiz = dynamic(() => import("./cards/CardQuiz"), { ssr: false });

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
  heroAbilities: Record<string, HeroAbilitiesEntry> | null;
  heroRelicsConfig: { accountId: string; heroId: number } | null;
  playstyle: { badge: string; description: string };
}

type CardId = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9;

const GRID_AREA: Record<CardId, string> = {
  1: "hero",
  5: "winrate",
  2: "legend",
  4: "signature",
  8: "tempo",
  6: "teammate",
  3: "bestgame",
  9: "yearreview",
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const matchIsWin = (m: Match) =>
  (m.radiant_win && m.player_slot < 128) || (!m.radiant_win && m.player_slot >= 128);

interface TileDef {
  id: CardId;
  label: string;
  tagline: string;
  icon: string;
  iconUrl: string;
  wide: boolean;
  accent: string;
  gradient: string;
  staggerIdx: number;
}

// Wide tiles (staggerIdx 0, 1) animate first as anchors.
// Visual order in 2-col mobile: Hero DNA | Win Rate / [Your Legend wide] / Signature | Tempo / [Teammate wide] / Best Game | Year
const TILES: TileDef[] = [
  { id: 1,  label: "Hero DNA",            tagline: "Your #1 hero",          icon: "⚔️",  iconUrl: "hero",  wide: false, accent: "#F59E0B", gradient: "linear-gradient(135deg,rgba(245,158,11,0.13) 0%,transparent 60%)",  staggerIdx: 2 },
  { id: 5,  label: "Win Rate",            tagline: "Peak win rate",          icon: "📈",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_alacrity.png",  wide: false, accent: "#BFFF00", gradient: "linear-gradient(135deg,rgba(191,255,0,0.11) 0%,transparent 60%)",   staggerIdx: 3 },
  { id: 2,  label: "Rank",               tagline: "YOUR 2026 RANK",         icon: "🏅",  iconUrl: "rank",  wide: true,  accent: "#6366F1", gradient: "linear-gradient(135deg,rgba(99,102,241,0.13) 0%,transparent 55%)",  staggerIdx: 0 },
  { id: 4,  label: "Signature Moves",    tagline: "YOUR YEAR IN NUMBERS",   icon: "⚡",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/storm_spirit_ball_lightning.png",  wide: false, accent: "#F97316", gradient: "linear-gradient(135deg,rgba(249,115,22,0.13) 0%,transparent 60%)",  staggerIdx: 4 },
  { id: 8,  label: "Tempo Stats",        tagline: "Your pace",              icon: "⏱",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/runes/rune_haste.png",  wide: false, accent: "#06B6D4", gradient: "linear-gradient(135deg,rgba(6,182,212,0.13) 0%,transparent 60%)",   staggerIdx: 5 },
  { id: 6,  label: "Teammate Chemistry", tagline: "Best teammate",          icon: "🤝",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_holy_persuasion.png",  wide: true,  accent: "#A855F7", gradient: "linear-gradient(135deg,rgba(168,85,247,0.13) 0%,transparent 55%)",  staggerIdx: 1 },
  { id: 3,  label: "Play Style",         tagline: "YOUR PROFILE",           icon: "🎮",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/invoker.png",  wide: false, accent: "#c8a84b", gradient: "linear-gradient(135deg,rgba(200,168,75,0.13) 0%,transparent 60%)",  staggerIdx: 6 },
  { id: 9,  label: "Year in Review",     tagline: "Games this year",        icon: "🎮",  iconUrl: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/creeps/roshan_icon.png",  wide: false, accent: "#F43F5E", gradient: "linear-gradient(135deg,rgba(244,63,94,0.13) 0%,transparent 60%)",   staggerIdx: 7 },
];

function CornerBrackets({ color = '#c8a84b', size = 16, pulse = false, flash = false }: { color?: string; size?: number; pulse?: boolean; flash?: boolean }) {
  const thickness = 2;
  const corners: React.CSSProperties[] = [
    { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness },
    { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness },
    { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness },
    { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness },
  ];
  const className = flash ? 'bracket-flash' : pulse ? 'bracket-pulse' : undefined;
  return (
    <>
      {corners.map((corner, i) => (
        <div
          key={i}
          className={className}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderStyle: 'solid',
            borderColor: color,
            borderWidth: 0,
            ...corner,
            zIndex: 10,
            pointerEvents: 'none',
            '--bracket-color': color,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const ERROR_FALLBACK = (
  <div style={{ background: "#111", borderRadius: 16, padding: 24, color: "#666", fontSize: 12, textAlign: "center" }}>
    Data unavailable
  </div>
);

function CardErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={ERROR_FALLBACK}>{children}</ErrorBoundary>;
}

function HeroThumb({ cleanName }: { cleanName: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span style={{ fontSize: 24 }}>⚔️</span>;
  return (
    <img
      src={`/api/hero-image?hero=${cleanName}`}
      alt=""
      width={40}
      height={40}
      style={{ objectFit: "cover", borderRadius: 8, display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

function TileIcon({ url, fallback }: { url: string; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span style={{ fontSize: 20 }}>{fallback}</span>;
  return (
    <img
      src={url}
      onError={() => setFailed(true)}
      style={{ width: 28, height: 28, objectFit: "contain", opacity: 0.9 }}
    />
  );
}

function RankBadgeImg({ medalNumber }: { medalNumber: number }) {
  const urls = [
    `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}.png`,
    `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${medalNumber}.png`,
    `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}f.png`,
  ];
  const [idx, setIdx] = useState(0);
  if (idx >= urls.length) return null;
  return (
    <img
      src={urls[idx]}
      width={32}
      height={32}
      alt=""
      onError={() => setIdx((i) => i + 1)}
      style={{ display: "block", imageRendering: "auto" }}
    />
  );
}

// --- Tile preview components ---

function HeroBgImg({ cleanName }: { cleanName: string }) {
  const [failed, setFailed] = useState(false);
  if (!cleanName || failed) return null;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <img
        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanName}_full.png`}
        alt=""
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #0d0d0d 100%)" }} />
    </div>
  );
}

function WinRateSparkline({ data }: { data: number[] }) {
  const w = 100, h = 50, pad = 4;
  if (data.length < 2) {
    return (
      <div style={{ position: "absolute", left: 16, right: 16, top: 36, zIndex: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 100 50" style={{ width: "100%", height: 50 }} preserveAspectRatio="none">
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(158,240,26,0.2)" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div style={{ position: "absolute", left: 16, right: 16, top: 36, zIndex: 0, pointerEvents: "none" }}>
      <svg viewBox="0 0 100 50" style={{ width: "100%", height: 50 }} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#9ef01a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function TileRankBadge({ medalNumber, color }: { medalNumber: number; color: string }) {
  const urls = [
    `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}.png`,
    `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${medalNumber}.png`,
    `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${medalNumber}f.png`,
  ];
  const [idx, setIdx] = useState(0);
  if (medalNumber <= 0 || idx >= urls.length) return null;
  return (
    <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
      <div style={{ filter: `drop-shadow(0 0 14px ${color}99)` }}>
        <img src={urls[idx]} width={64} height={64} alt="" onError={() => setIdx((i) => i + 1)} style={{ display: "block" }} />
      </div>
    </div>
  );
}

function HeroWatermark({ cleanName }: { cleanName: string }) {
  const [failed, setFailed] = useState(false);
  if (!cleanName || failed) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <img
        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanName}_full.png`}
        alt=""
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: 0.15, filter: "blur(4px)", display: "block" }}
      />
    </div>
  );
}

function TeammateAvatar({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return null;
  return (
    <div style={{ position: "absolute", top: 26, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
        boxShadow: "0 0 0 2px rgba(168,85,247,0.8), 0 0 18px rgba(168,85,247,0.5)",
      }}>
        <img src={url} width={48} height={48} alt="" onError={() => setFailed(true)} style={{ objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}

function PentagonRadar({ ps }: { ps: { fighting: number; farming: number; supporting: number; pushing: number; utility: number } }) {
  const cx = 30, cy = 30, r = 22;
  const vals = [ps.fighting, ps.farming, ps.supporting, ps.pushing, ps.utility].map((v) => Math.min(v, 100) / 100);
  const n = 5;
  const angle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const outerPts = Array.from({ length: n }, (_, i) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]);
  const dataPts = vals.map((v, i) => [cx + r * v * Math.cos(angle(i)), cy + r * v * Math.sin(angle(i))]);
  const toPath = (pts: number[][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <div style={{ position: "absolute", top: 26, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
      <svg viewBox="0 0 60 60" width={60} height={60}>
        <path d={toPath(outerPts)} fill="none" stroke="rgba(200,168,75,0.25)" strokeWidth="1" />
        <path d={toPath(dataPts)} fill="rgba(200,168,75,0.15)" stroke="#c8a84b" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function getRankColor(medalNumber: number): string {
  if (medalNumber <= 0) return "#6b7280";
  if (medalNumber <= 2) return "#6b7280";
  if (medalNumber <= 4) return "#4ade80";
  if (medalNumber <= 6) return "#60a5fa";
  if (medalNumber === 7) return "#a78bfa";
  return "#f59e0b";
}

export default function WrappedGrid({
  profile,
  heroStats,
  bestHeroMatch,
  bestHeroGame,
  bestHeroMatchDetails,
  totalHours,
  playerHeroes,
  heroList,
  peers,
  matches,
  quizMatches,
  itemConstants,
  totalGames,
  yearWinRate,
  tempoStats,
  signatureMoves,
  yearInNumbers,
  legendStats,
  playStyleStats,
  rankInfo,
  playerName: playerNameProp,
  heroAbilities,
  heroRelicsConfig,
  playstyle,
}: Props) {
  const [openCard, setOpenCard] = useState<CardId | null>(null);
  const [hoveredTile, setHoveredTile] = useState<CardId | null>(null);
  const [tappedTile, setTappedTile] = useState<CardId | null>(null);
  const [flashedTile, setFlashedTile] = useState<CardId | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (document.getElementById("bracket-anim-style")) return;
    const style = document.createElement("style");
    style.id = "bracket-anim-style";
    style.textContent = `
      @keyframes bracketPulse {
        0%   { border-color: var(--bracket-color) }
        50%  { border-color: #ffffff }
        100% { border-color: var(--bracket-color) }
      }
      .bracket-pulse { animation: bracketPulse 0.3s ease-in-out forwards; }
      @keyframes bracketFlash {
        0%   { border-color: var(--bracket-color) }
        30%  { border-color: #ffffff }
        100% { border-color: var(--bracket-color) }
      }
      .bracket-flash { animation: bracketFlash 0.2s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  const playerName = playerNameProp;
  const avatarUrl = profile.player?.profile?.avatarfull ?? "";
  const rankColor = getRankColor(rankInfo.medalNumber);

  // --- Pre-computed tile headline values ---
  const topHero = heroStats[0];
  const topHeroName = topHero
    ? (heroList?.find((h) => h.id === topHero.hero_id)?.localized_name ?? `Hero ${topHero.hero_id}`)
    : "—";
  const topHeroCleanName = topHero
    ? (heroList?.find((h) => h.id === topHero.hero_id)?.name.replace("npc_dota_hero_", "") ?? "")
    : "";

  const monthBuckets = (() => {
    const buckets: Record<string, { wins: number; total: number }> = {};
    for (const m of matches) {
      const d = new Date(m.start_time * 1000);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
      if (!buckets[key]) buckets[key] = { wins: 0, total: 0 };
      buckets[key].total++;
      if (matchIsWin(m)) buckets[key].wins++;
    }
    return buckets;
  })();

  const peakWinRate = (() => {
    const rates = Object.values(monthBuckets)
      .filter((b) => b.total >= 5)
      .map((b) => Math.round((b.wins / b.total) * 100));
    return rates.length > 0 ? Math.max(...rates) : null;
  })();

  const winRateByMonth = Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, b]) => Math.round((b.wins / b.total) * 100));


  const topPeer = (peers ?? [])
    .filter((p) => p.with_games >= 10)
    .sort((a, b) => b.with_games - a.with_games)[0] ?? null;
  const peerName = topPeer?.personaname || topPeer?.name || "—";

  function tileStats(id: CardId): { headline: string; secondary: string } {
    switch (id) {
      case 1: return { headline: topHeroName,                                                          secondary: topHero ? `${topHero.winRate}% win rate` : "" };
      case 5: return { headline: peakWinRate != null ? `${peakWinRate}%` : "—",                        secondary: `${yearWinRate}% this year` };
      case 2: return { headline: rankInfo.fullRank, secondary: rankInfo.percentileLabel };
      case 4: {
        const { totalKills, totalDeaths, totalAssists } = signatureMoves;
        const kda = ((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(1);
        return { headline: `${kda} KDA`, secondary: signatureMoves.dominantRole ? `${signatureMoves.dominantRolePct}% of games` : "" };
      }
      case 8: return { headline: tempoStats.fastestWin ?? "—",                                         secondary: `${tempoStats.totalHoursThisYear}h this year` };
      case 6: return { headline: peerName,                                                             secondary: topPeer ? `${topPeer.with_games} games together` : "" };
      case 3: return { headline: playStyleStats ? `${playStyleStats.avgGpm} GPM` : "—",               secondary: "PLAY STYLE PROFILE" };
      case 9: return { headline: `${matches.length}`,                                                  secondary: `${yearWinRate}% win rate` };
    }
  }

  function renderTilePreview(id: CardId): React.ReactNode {
    switch (id) {
      case 1:
        return topHeroCleanName ? <HeroBgImg cleanName={topHeroCleanName} /> : null;
      case 5:
        return <WinRateSparkline data={winRateByMonth} />;
      case 2:
        return <TileRankBadge medalNumber={rankInfo.medalNumber} color={rankColor} />;
      case 4:
        return topHeroCleanName ? <HeroWatermark cleanName={topHeroCleanName} /> : null;
      case 8:
        return (
          <div style={{ position: "absolute", top: "18%", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 0, pointerEvents: "none" }}>
            <span style={{ fontSize: 40, opacity: 0.6, lineHeight: 1 }}>⏱</span>
            <p style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", margin: "6px 0 0" }}>Fastest Win</p>
          </div>
        );
      case 6:
        return (topPeer?.avatarfull || topPeer?.avatar)
          ? <TeammateAvatar url={(topPeer.avatarfull ?? topPeer.avatar) as string} />
          : null;
      case 3:
        return playStyleStats ? <PentagonRadar ps={playStyleStats} /> : null;
      case 9:
        return (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: "white", opacity: 0.08, lineHeight: 1 }}>{matches.length}</span>
          </div>
        );
    }
  }

  // First tap on mobile reveals secondary stat; second tap opens modal.
  // On desktop, hover already reveals, so click goes straight to modal.
  function handleActivate(id: CardId) {
    if (!shouldReduceMotion) {
      setFlashedTile(id);
      setTimeout(() => setFlashedTile(null), 250);
    }
    const isRevealed = hoveredTile === id || tappedTile === id;
    if (isRevealed) {
      setTappedTile(null);
      setOpenCard(id);
    } else {
      setTappedTile(id);
    }
  }

  function renderCard(id: CardId, isExporting?: boolean) {
    switch (id) {
      case 1: return (
        <CardErrorBoundary>
          <Card1Hero
            profile={profile} topHero={topHero} bestHeroGame={bestHeroGame}
            bestHeroMatchDetails={bestHeroMatchDetails} itemConstants={itemConstants}
            signatureMoves={signatureMoves} yearMatches={matches} yearWinRate={yearWinRate}
            heroAbilities={heroAbilities}
          />
        </CardErrorBoundary>
      );
      case 2: return <CardErrorBoundary><CardRank rankInfo={rankInfo} playerName={playerName} /></CardErrorBoundary>;
      case 3: return <CardErrorBoundary><CardPlayStyle playStyleStats={playStyleStats} playerName={playerName} /></CardErrorBoundary>;
      case 4: return <CardErrorBoundary><Card4MatchupB yearInNumbers={yearInNumbers} playerName={playerName} heroAbilities={heroAbilities} heroRelicsConfig={heroRelicsConfig} playstyle={playstyle} /></CardErrorBoundary>;
      case 5: return (
        <CardErrorBoundary>
          <Card5Summary
            profile={profile} heroStats={heroStats} matches={matches}
            heroes={heroList ?? []}
            totalHours={totalHours} yearWinRate={yearWinRate} totalGames={totalGames}
            isExporting={isExporting}
          />
        </CardErrorBoundary>
      );
      case 6: return <CardErrorBoundary><Card6Teammate peers={peers} playerName={playerName} isExporting={isExporting} /></CardErrorBoundary>;
      case 8: return <CardErrorBoundary><Card8BestMonth tempoStats={tempoStats} playerName={playerName} isExporting={isExporting} /></CardErrorBoundary>;
      case 9: return <CardErrorBoundary><CardQuiz quizMatches={quizMatches} itemConstants={itemConstants} heroList={heroList} playerName={playerName} /></CardErrorBoundary>;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 16px 80px",
      }}
    >
      {/* Player header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
          padding: "48px 40px 24px",
          background: "repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)",
          borderRadius: 16,
          overflow: "hidden",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <CornerBrackets color="#c8a84b" size={12} />

        {/* Hexagonal avatar */}
        <div style={{ filter: "drop-shadow(0 0 8px rgba(200,168,75,0.6))" }}>
          {/* Gold hex border */}
          <div
            style={{
              width: 86,
              height: 86,
              background: "#c8a84b",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={playerName}
                onError={() => setAvatarError(true)}
                style={{
                  width: 80,
                  height: 80,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  backgroundColor: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
                  {playerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name row: rank badge + player name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, maxWidth: "100%" }}>
          {rankInfo.medalNumber > 0 && (
            <RankBadgeImg medalNumber={rankInfo.medalNumber} />
          )}
          <div style={{ position: "relative", flex: 1, minWidth: 0, overflow: "hidden" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {playerName}
            </p>
            {!shouldReduceMotion && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: 0,
                  height: 2,
                  background: "#c8a84b",
                  borderRadius: 1,
                }}
              />
            )}
            {shouldReduceMotion && (
              <div
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: 0,
                  width: "100%",
                  height: 2,
                  background: "#c8a84b",
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        </div>

        {/* Subtitle row */}
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#c8a84b" }}>{rankInfo.fullRank}</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>2026 Wrapped</span>
        </p>
      </motion.div>

      {/* Bento grid — named areas guarantee row anchoring regardless of DOM order */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateAreas:
            '"hero winrate" "legend legend" "signature tempo" "teammate teammate" "bestgame yearreview"',
          gap: 10,
          width: "100%",
          maxWidth: 680,
        }}
      >
        {TILES.map((tile) => {
          const stats = tileStats(tile.id);
          const isRevealed = hoveredTile === tile.id || tappedTile === tile.id;
          const delay = shouldReduceMotion ? 0 : tile.staggerIdx * 0.04;
          const accent = tile.id === 2 ? rankColor : tile.accent;
          const gradient = tile.id === 2
            ? `linear-gradient(135deg,${rankColor}22 0%,transparent 55%)`
            : tile.gradient;

          return (
            <motion.button
              key={tile.id}
              onClick={() => handleActivate(tile.id)}
              onMouseEnter={() => setHoveredTile(tile.id)}
              onMouseLeave={() => setHoveredTile(null)}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay, ease: EASE }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02, transition: { duration: 0.18 } }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96, transition: { duration: 0.08 } }}
              style={{
                gridArea: GRID_AREA[tile.id],
                width: "100%",
                height: "auto",
                minHeight: 160,
                alignSelf: "start",
                backgroundColor: "#111",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "14px 16px 16px",
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                zIndex: isRevealed ? 2 : 1,
              }}
            >
              <CornerBrackets
                color={accent}
                pulse={!shouldReduceMotion && hoveredTile === tile.id}
                flash={!shouldReduceMotion && flashedTile === tile.id}
              />

              {/* Accent stripe */}
              <div
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: accent,
                  borderRadius: "8px 8px 0 0",
                  zIndex: 2,
                }}
              />

              {/* Gradient wash */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: gradient,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              {/* Visual preview — upper portion */}
              {renderTilePreview(tile.id)}

              {/* Card label — top-left */}
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                }}
              >
                {tile.label}
              </p>

              {/* Icon — top-right */}
              <div
                style={{
                  position: "absolute",
                  top: 12, right: 14,
                  fontSize: 26,
                  lineHeight: 1,
                  zIndex: 1,
                  opacity: 0.8,
                }}
              >
                {tile.iconUrl === "hero" ? (
                  topHeroCleanName
                    ? <HeroThumb cleanName={topHeroCleanName} />
                    : <span style={{ fontSize: 26 }}>⚔️</span>
                ) : tile.iconUrl === "rank" ? (
                  <TileIcon
                    url={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/rank_icon_${rankInfo.medalNumber}.png`}
                    fallback={tile.icon}
                  />
                ) : (
                  <TileIcon url={tile.iconUrl} fallback={tile.icon} />
                )}
              </div>

              {/* Bottom stats */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: accent,
                    margin: "0 0 4px",
                    opacity: 0.85,
                  }}
                >
                  {tile.tagline}
                </p>

                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1.2,
                    margin: 0,
                    letterSpacing: "-0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stats.headline}
                </p>

                <AnimatePresence>
                  {isRevealed && stats.secondary && (
                    <motion.p
                      key="secondary"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.85, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: accent,
                        margin: "5px 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stats.secondary}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Modal */}
      {openCard !== null && (
        <CardModal key={openCard} onClose={() => setOpenCard(null)}>
          {(isExporting) => renderCard(openCard, isExporting)}
        </CardModal>
      )}
    </div>
  );
}
