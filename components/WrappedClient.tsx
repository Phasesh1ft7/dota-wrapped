"use client";

import { use } from "react";
import type { ProfileData, MatchesData } from "@/lib/opendota";
import {
  getHeroStats,
  getTotalHoursFromHeroes,
  getAllTimeGames,
  getBestGame,
  getStreaks,
} from "@/lib/transforms";
import WrappedGrid from "@/components/WrappedGrid";

interface Props {
  profile: ProfileData;
  matchesPromise: Promise<MatchesData>;
}

export default function WrappedClient({ profile, matchesPromise }: Props) {
  const matchesData = use(matchesPromise);

  const matches = matchesData.matches ?? [];

  const heroStats = getHeroStats(
    matchesData.heroes ?? [],
    profile.heroList ?? [],
  );
  // All-time stats derived from playerHeroes (covers full career)
  const playerHeroes = matchesData.heroes ?? [];
  const totalHours = getTotalHoursFromHeroes(playerHeroes);
  const totalGames = getAllTimeGames(playerHeroes);

  const bestGame = getBestGame(matches, profile.heroList ?? []);
  const streaks = getStreaks(matchesData.recentMatches ?? []);

  // Year win rate computed from the date-filtered matches array
  const yearWins = matches.filter(
    (m) =>
      (m.radiant_win && m.player_slot < 128) ||
      (!m.radiant_win && m.player_slot >= 128),
  ).length;
  const yearWinRate =
    matches.length > 0
      ? ((yearWins / matches.length) * 100).toFixed(1)
      : "0.0";

  return (
    <WrappedGrid
      profile={profile}
      heroStats={heroStats}
      totalHours={totalHours}
      bestGame={bestGame}
      streaks={streaks}
      playerHeroes={playerHeroes}
      heroList={profile.heroList}
      peers={matchesData.peers ?? null}
      matches={matches}
      quizMatches={matchesData.quizMatches ?? []}
      itemConstants={matchesData.itemConstants ?? null}
      totalGames={totalGames}
      yearWinRate={yearWinRate}
    />
  );
}
