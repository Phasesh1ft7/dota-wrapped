"use client";

import React, { useState, Component } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type {
  ProfileData, PlayerHeroStats, Hero, Peer, Match, QuizMatch,
  ItemConstant, BestHeroMatchData,
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
  wide: boolean;
  accent: string;
  gradient: string;
  staggerIdx: number;
}

// Wide tiles (staggerIdx 0, 1) animate first as anchors.
// Visual order in 2-col mobile: Hero DNA | Win Rate / [Your Legend wide] / Signature | Tempo / [Teammate wide] / Best Game | Year
const TILES: TileDef[] = [
  { id: 1,  label: "Hero DNA",            tagline: "Your #1 hero",     icon: "hero", wide: false, accent: "#F59E0B", gradient: "linear-gradient(135deg,rgba(245,158,11,0.13) 0%,transparent 60%)",  staggerIdx: 2 },
  { id: 5,  label: "Win Rate",            tagline: "Peak win rate",    icon: "📈",   wide: false, accent: "#BFFF00", gradient: "linear-gradient(135deg,rgba(191,255,0,0.11) 0%,transparent 60%)",   staggerIdx: 3 },
  { id: 2,  label: "Rank",                 tagline: "YOUR 2026 RANK",   icon: "🏅",   wide: true,  accent: "#6366F1", gradient: "linear-gradient(135deg,rgba(99,102,241,0.13) 0%,transparent 55%)",  staggerIdx: 0 },
  { id: 4,  label: "Signature Moves",     tagline: "YOUR YEAR IN NUMBERS",   icon: "⚡",   wide: false, accent: "#F97316", gradient: "linear-gradient(135deg,rgba(249,115,22,0.13) 0%,transparent 60%)",  staggerIdx: 4 },
  { id: 8,  label: "Tempo Stats",         tagline: "Your pace",        icon: "⏱",   wide: false, accent: "#06B6D4", gradient: "linear-gradient(135deg,rgba(6,182,212,0.13) 0%,transparent 60%)",   staggerIdx: 5 },
  { id: 6,  label: "Teammate Chemistry",  tagline: "Best teammate",    icon: "🤝",   wide: true,  accent: "#A855F7", gradient: "linear-gradient(135deg,rgba(168,85,247,0.13) 0%,transparent 55%)",  staggerIdx: 1 },
  { id: 3,  label: "Play Style",           tagline: "YOUR PROFILE",     icon: "🎮",  wide: false, accent: "#c8a84b", gradient: "linear-gradient(135deg,rgba(200,168,75,0.13) 0%,transparent 60%)",  staggerIdx: 6 },
  { id: 9,  label: "Year in Review",      tagline: "Games this year",  icon: "🎮",   wide: false, accent: "#F43F5E", gradient: "linear-gradient(135deg,rgba(244,63,94,0.13) 0%,transparent 60%)",   staggerIdx: 7 },
];

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
}: Props) {
  const [openCard, setOpenCard] = useState<CardId | null>(null);
  const [hoveredTile, setHoveredTile] = useState<CardId | null>(null);
  const [tappedTile, setTappedTile] = useState<CardId | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

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

  const peakWinRate = (() => {
    const buckets: Record<string, { wins: number; total: number }> = {};
    for (const m of matches) {
      const d = new Date(m.start_time * 1000);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (!buckets[key]) buckets[key] = { wins: 0, total: 0 };
      buckets[key].total++;
      if (matchIsWin(m)) buckets[key].wins++;
    }
    const rates = Object.values(buckets)
      .filter((b) => b.total >= 5)
      .map((b) => Math.round((b.wins / b.total) * 100));
    return rates.length > 0 ? Math.max(...rates) : null;
  })();


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

  // First tap on mobile reveals secondary stat; second tap opens modal.
  // On desktop, hover already reveals, so click goes straight to modal.
  function handleActivate(id: CardId) {
    const isRevealed = hoveredTile === id || tappedTile === id;
    if (isRevealed) {
      setTappedTile(null);
      setOpenCard(id);
    } else {
      setTappedTile(id);
    }
  }

  function renderCard(id: CardId) {
    switch (id) {
      case 1: return (
        <CardErrorBoundary>
          <Card1Hero
            profile={profile} topHero={topHero} bestHeroGame={bestHeroGame}
            bestHeroMatchDetails={bestHeroMatchDetails} itemConstants={itemConstants}
          />
        </CardErrorBoundary>
      );
      case 2: return <CardErrorBoundary><CardRank rankInfo={rankInfo} playerName={playerName} /></CardErrorBoundary>;
      case 3: return <CardErrorBoundary><CardPlayStyle playStyleStats={playStyleStats} playerName={playerName} /></CardErrorBoundary>;
      case 4: return <CardErrorBoundary><Card4MatchupB yearInNumbers={yearInNumbers} playerName={playerName} /></CardErrorBoundary>;
      case 5: return (
        <CardErrorBoundary>
          <Card5Summary
            profile={profile} heroStats={heroStats} matches={matches}
            heroes={heroList ?? []}
            totalHours={totalHours} yearWinRate={yearWinRate} totalGames={totalGames}
          />
        </CardErrorBoundary>
      );
      case 6: return <CardErrorBoundary><Card6Teammate peers={peers} /></CardErrorBoundary>;
      case 8: return <CardErrorBoundary><Card8BestMonth tempoStats={tempoStats} /></CardErrorBoundary>;
      case 9: return <CardErrorBoundary><CardQuiz quizMatches={quizMatches} itemConstants={itemConstants} heroList={heroList} /></CardErrorBoundary>;
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
          padding: "28px 40px",
          background: "repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
        }}
      >
        {avatarUrl && !avatarError ? (
          <img
            src={avatarUrl}
            alt={playerName}
            onError={() => setAvatarError(true)}
            style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }}
          />
        ) : (
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
              {playerName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "white", margin: 0 }}>
          {playerName}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", margin: 0 }}>
          Your 2026 Dota Wrapped
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
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: { duration: 0.1 } }}
              style={{
                gridArea: GRID_AREA[tile.id],
                width: "100%",
                minHeight: 160,
                backgroundColor: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
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
              {/* Accent stripe */}
              <div
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: accent,
                  borderRadius: "16px 16px 0 0",
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
                {tile.icon === "hero" ? (
                  topHeroCleanName
                    ? <HeroThumb cleanName={topHeroCleanName} />
                    : <span style={{ fontSize: 26 }}>⚔️</span>
                ) : (
                  tile.icon
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
          {renderCard(openCard)}
        </CardModal>
      )}
    </div>
  );
}
