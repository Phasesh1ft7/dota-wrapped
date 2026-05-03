"use client";

import { useState } from "react";

const ITEM_CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items";

function TileIcon({ src, fallback }: { src: string; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span style={{ fontSize: 32, lineHeight: 1 }}>{fallback}</span>;
  return (
    <img
      src={src}
      alt=""
      width={52}
      height={52}
      style={{ objectFit: "contain", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}
import type { ProfileData, PlayerHeroStats, Hero, Peer, Match, QuizMatch, ItemConstant } from "@/lib/opendota";
import type { HeroStatEntry, BestGame, Streaks } from "@/lib/transforms";
import CardModal from "@/components/CardModal";
import Card1Hero from "@/components/cards/Card1Hero";
import Card2Hours from "@/components/cards/Card2Hours";
import Card3BestGame from "@/components/cards/Card3BestGame";
import Card4Matchup from "@/components/cards/Card4Matchup";
import Card5Summary from "@/components/cards/Card5Summary";
import Card6Teammate from "@/components/cards/Card6Teammate";
import Card7Personality from "@/components/cards/Card7Personality";
import Card8BestMonth from "@/components/cards/Card8BestMonth";
import CardQuiz from "@/components/cards/CardQuiz";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  totalHours: number;
  bestGame: BestGame | null;
  streaks: Streaks;
  playerHeroes: PlayerHeroStats[];
  heroList: Hero[] | null;
  peers: Peer[] | null;
  matches: Match[];
  quizMatches: QuizMatch[];
  itemConstants: Record<string, ItemConstant> | null;
  totalGames: number;
  yearWinRate: string;
}

type CardId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const TILES: {
  id: CardId;
  icon: string;
  fallback: string;
  label: string;
  gradient: string;
}[] = [
  { id: 1, icon: "hero",             fallback: "⚔️", label: "Top Hero",    gradient: "linear-gradient(135deg,#312e81,#4f46e5)" },
  { id: 2, icon: "refresher",        fallback: "⏳", label: "Hours Lost",   gradient: "linear-gradient(135deg,#7f1d1d,#ef4444)" },
  { id: 3, icon: "bfury",            fallback: "⚔️", label: "Best Game",   gradient: "linear-gradient(135deg,#16a34a,#15803d)" },
  { id: 4, icon: "blade_mail",       fallback: "⚡", label: "Matchups",    gradient: "linear-gradient(135deg,#450a0a,#7f1d1d)" },
  { id: 5, icon: "aghanims_scepter", fallback: "📊", label: "Summary",     gradient: "linear-gradient(135deg,#134e4a,#0d9488)" },
  { id: 6, icon: "ring_of_basilius", fallback: "🤝", label: "Teammate",    gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { id: 7, icon: "ward_observer",    fallback: "🧠", label: "Personality", gradient: "linear-gradient(135deg,#4338ca,#3730a3)" },
  { id: 8, icon: "moon_shard",       fallback: "📅", label: "Best Month",  gradient: "linear-gradient(135deg,#0369a1,#075985)" },
  { id: 9, icon: "smoke_of_deceit",  fallback: "🎮", label: "Hero Quiz",   gradient: "linear-gradient(135deg,#be185d,#9d174d)" },
];

export default function WrappedGrid({
  profile,
  heroStats,
  totalHours,
  bestGame,
  streaks,
  playerHeroes,
  heroList,
  peers,
  matches,
  quizMatches,
  itemConstants,
  totalGames,
  yearWinRate,
}: Props) {
  const [openCard, setOpenCard] = useState<CardId | null>(null);
  const [hoveredTile, setHoveredTile] = useState<CardId | null>(null);

  const topHero = heroStats[0];
  const topHeroCleanName =
    heroList?.find((h) => h.id === topHero?.hero_id)?.name.replace("npc_dota_hero_", "") ?? "";
  const avatarUrl = profile.player?.profile?.avatarfull ?? "";
  const playerName = profile.player?.profile?.personaname || "Unknown Player";

  function tilePreview(id: CardId): string {
    switch (id) {
      case 1: return topHero ? `${topHero.games} games` : "";
      case 2: return `${totalHours}h played`;
      case 3: return bestGame ? `${bestGame.kills} kills` : "";
      case 4: return "";
      case 5: return `${totalGames.toLocaleString()} games`;
      case 6: return "";
      case 7: return "";
      case 8: return "";
      case 9: return quizMatches.length > 0 ? `${quizMatches.length} matches` : "";
    }
  }

  function renderCard(id: CardId) {
    switch (id) {
      case 1:
        return <Card1Hero profile={profile} topHero={topHero} />;
      case 2:
        return <Card2Hours totalHours={totalHours} totalGames={totalGames} />;
      case 3:
        return <Card3BestGame bestGame={bestGame} />;
      case 4:
        return <Card4Matchup playerHeroes={playerHeroes} heroList={heroList} />;
      case 5:
        return (
          <Card5Summary
            profile={profile}
            heroStats={heroStats}
            totalHours={totalHours}
            yearWinRate={yearWinRate}
            totalGames={totalGames}
          />
        );
      case 6:
        return <Card6Teammate peers={peers} />;
      case 7:
        return (
          <Card7Personality
            heroStats={heroStats}
            streaks={streaks}
            totalHours={totalHours}
            wl={profile.wl}
            totalGames={totalGames}
          />
        );
      case 8:
        return <Card8BestMonth matches={matches} playerHeroes={playerHeroes} />;
      case 9:
        return (
          <CardQuiz
            quizMatches={quizMatches}
            itemConstants={itemConstants}
            heroList={heroList}
          />
        );
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
        padding: "48px 20px 72px",
      }}
    >
      {/* Player header with stripe pattern */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
          padding: "28px 40px",
          position: "relative",
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
        }}
      >
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={playerName}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          />
        )}
        <p
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "white",
          }}
        >
          {playerName}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Your 2026 Dota Wrapped
        </p>
      </div>

      {/* Tile grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 160px)",
          gap: 14,
          width: "100%",
          maxWidth: 360,
        }}
      >
        {TILES.map((tile, idx) => {
          const isOddLast = TILES.length % 2 !== 0 && idx === TILES.length - 1;
          const isHovered = hoveredTile === tile.id;
          const preview = tilePreview(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => setOpenCard(tile.id)}
              onMouseEnter={() => setHoveredTile(tile.id)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{
                gridColumn: isOddLast ? "1 / -1" : undefined,
                justifySelf: isOddLast ? "center" : undefined,
                width: 160,
                height: 160,
                borderRadius: 18,
                background: tile.gradient,
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                padding: "0 18px 16px",
                position: "relative",
                overflow: "hidden",
                transform: isHovered ? "scale(1.02)" : "scale(1)",
                transition: "transform 200ms ease",
              }}
            >
              {/* Tile icon */}
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <TileIcon
                  src={
                    tile.icon === "hero"
                      ? `/api/hero-image?hero=${topHeroCleanName}`
                      : `${ITEM_CDN}/${tile.icon}.png`
                  }
                  fallback={tile.fallback}
                />
              </div>

              {/* Bottom darker strip */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 56,
                  background: "rgba(0,0,0,0.28)",
                  borderRadius: "0 0 18px 18px",
                  pointerEvents: "none",
                }}
              />

              {/* Stat preview */}
              {preview && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    marginBottom: 3,
                    position: "relative",
                  }}
                >
                  {preview}
                </span>
              )}

              {/* Tile label */}
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  textAlign: "left",
                  position: "relative",
                }}
              >
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {openCard !== null && (
        <CardModal onClose={() => setOpenCard(null)}>
          {renderCard(openCard)}
        </CardModal>
      )}
    </div>
  );
}
