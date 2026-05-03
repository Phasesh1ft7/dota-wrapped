"use client";

import { useState } from "react";
import type { ProfileData, PlayerHeroStats, Hero, Peer, Match } from "@/lib/opendota";
import type { HeroStatEntry, Streaks } from "@/lib/transforms";
import CardModal from "@/components/CardModal";
import Card1Hero from "@/components/cards/Card1Hero";
import Card2Hours from "@/components/cards/Card2Hours";
import Card3Streak from "@/components/cards/Card3Streak";
import Card4Matchup from "@/components/cards/Card4Matchup";
import Card5Summary from "@/components/cards/Card5Summary";
import Card6Teammate from "@/components/cards/Card6Teammate";
import Card7Personality from "@/components/cards/Card7Personality";
import Card8BestMonth from "@/components/cards/Card8BestMonth";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  totalHours: number;
  streaks: Streaks;
  playerHeroes: PlayerHeroStats[];
  heroList: Hero[] | null;
  peers: Peer[] | null;
  matches: Match[];
  totalGames: number;
  yearWinRate: string;
}

type CardId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const TILES: {
  id: CardId;
  emoji: string;
  label: string;
  gradient: string;
}[] = [
  {
    id: 1,
    emoji: "⚔️",
    label: "Top Hero",
    gradient: "linear-gradient(135deg,#312e81,#4f46e5)",
  },
  {
    id: 2,
    emoji: "⏳",
    label: "Hours Lost",
    gradient: "linear-gradient(135deg,#7f1d1d,#ef4444)",
  },
  {
    id: 3,
    emoji: "🔥",
    label: "Streaks",
    gradient: "linear-gradient(135deg,#14532d,#22c55e)",
  },
  {
    id: 4,
    emoji: "⚡",
    label: "Matchups",
    gradient: "linear-gradient(135deg,#450a0a,#7f1d1d)",
  },
  {
    id: 5,
    emoji: "📊",
    label: "Summary",
    gradient: "linear-gradient(135deg,#134e4a,#0d9488)",
  },
  {
    id: 6,
    emoji: "🤝",
    label: "Teammate",
    gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)",
  },
  {
    id: 7,
    emoji: "🧠",
    label: "Personality",
    gradient: "linear-gradient(135deg,#4338ca,#3730a3)",
  },
  {
    id: 8,
    emoji: "📅",
    label: "Best Month",
    gradient: "linear-gradient(135deg,#0369a1,#075985)",
  },
];

export default function WrappedGrid({
  profile,
  heroStats,
  totalHours,
  streaks,
  playerHeroes,
  heroList,
  peers,
  matches,
  totalGames,
  yearWinRate,
}: Props) {
  const [openCard, setOpenCard] = useState<CardId | null>(null);

  const topHero = heroStats[0];
  const avatarUrl = profile.player?.profile?.avatarfull ?? "";
  const playerName =
    profile.player?.profile?.personaname ?? "Unknown Player";

  function renderCard(id: CardId) {
    switch (id) {
      case 1:
        console.log('GRID→CARD1 props:', JSON.stringify({topHero, profileWl: profile.wl, heroListLength: profile.heroList?.length, firstHeroList: profile.heroList?.[0]}));
        return <Card1Hero profile={profile} topHero={topHero} />;
      case 2:
        return <Card2Hours totalHours={totalHours} totalGames={totalGames} />;
      case 3:
        return <Card3Streak streaks={streaks} />;
      case 4:
        return <Card4Matchup playerHeroes={playerHeroes} heroList={heroList} />;
      case 5:
        console.log('GRID→CARD5 props:', JSON.stringify({profileWl: profile.wl, heroStatsLength: heroStats.length, totalHours, yearWinRate, totalGames}));
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
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 60px",
      }}
    >
      {/* Player header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
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
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "white",
          }}
        >
          {playerName}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 500,
            letterSpacing: "0.05em",
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
          return (
            <button
              key={tile.id}
              onClick={() => setOpenCard(tile.id)}
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
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Emoji */}
              <span
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: 32,
                  lineHeight: 1,
                }}
              >
                {tile.emoji}
              </span>

              {/* Label */}
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  textAlign: "left",
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
