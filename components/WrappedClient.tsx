"use client";

import { use } from "react";
import type { ProfileData, MatchesData } from "@/lib/opendota";
import {
  getHeroStats,
  getTotalHoursFromHeroes,
  getAllTimeGames,
  getBestHeroMatch,
  getTempoStats,
  getSignatureMoves,
  getLegendStats,
  getPlayStyleStats,
  getRankInfo,
  getYearInNumbers,
} from "@/lib/transforms";
import type { RankInfo } from "@/lib/transforms";
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

  const topHeroId = heroStats[0]?.hero_id ?? -1;
  const bestHeroMatch = topHeroId !== -1 ? getBestHeroMatch(matches, topHeroId) : null;

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

  const heroList = profile.heroList ?? [];
  const tempoStats = getTempoStats(matches);
  const yearInNumbers = getYearInNumbers(matches);
  const signatureMoves = getSignatureMoves(
    matches,
    playerHeroes,
    heroList,
    matchesData.playerItems ?? null,
    matchesData.itemConstants ?? null,
  );
  const bestHeroGame = signatureMoves.bestHeroGame;
  const legendStats = getLegendStats(matches, heroList);

  const playStyleStats = matchesData.playerTotals
    ? getPlayStyleStats(matchesData.playerTotals, matches)
    : null;

const rankInfo: RankInfo = getRankInfo(
    profile.player?.rank_tier ?? null,
    profile.player?.leaderboard_rank ?? null,
  );
  const playerName = profile.player?.profile?.personaname || "Unknown Player";

  return (
    <WrappedGrid
      profile={profile}
      heroStats={heroStats}
      bestHeroMatch={bestHeroMatch}
      bestHeroGame={bestHeroGame}
      bestHeroMatchDetails={matchesData.bestHeroMatchDetails ?? null}
      totalHours={totalHours}
      playerHeroes={playerHeroes}
      heroList={profile.heroList}
      peers={matchesData.peers ?? null}
      matches={matches}
      quizMatches={matchesData.quizMatches ?? []}
      itemConstants={matchesData.itemConstants ?? null}
      totalGames={totalGames}
      yearWinRate={yearWinRate}
      tempoStats={tempoStats}
      signatureMoves={signatureMoves}
      yearInNumbers={yearInNumbers}
      legendStats={legendStats}
      playStyleStats={playStyleStats}
      rankInfo={rankInfo}
      playerName={playerName}
    />
  );
}
