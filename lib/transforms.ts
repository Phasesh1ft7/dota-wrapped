import type { Match, Hero, PlayerHeroStats } from "./opendota";

// ---------------------------------------------------------------------------
// Win condition (canonical — do not change)
// ---------------------------------------------------------------------------

const isWin = (m: Match): boolean =>
  (m.radiant_win && m.player_slot < 128) ||
  (!m.radiant_win && m.player_slot >= 128);

// ---------------------------------------------------------------------------
// Return-type interfaces
// ---------------------------------------------------------------------------

export interface HeroStatEntry {
  hero_id: number;
  heroName: string;
  games: number;
  winRate: string; // e.g. "52.3"
}

export interface Streaks {
  bestWinStreak: number;
  bestLoseStreak: number;
  /** Positive = win streak length, negative = loss streak length */
  currentStreak: number;
}

export interface RoleBreakdown {
  carry: number; // lane_role 1  — percentage
  mid: number; // lane_role 2
  offlane: number; // lane_role 3
  support: number; // lane_role 4 or 5
}

// ---------------------------------------------------------------------------
// 1. getHeroStats
// ---------------------------------------------------------------------------

/**
 * Returns the top 5 heroes by games played, with win-rate and resolved name.
 * Uses all-time stats from GET /players/{id}/heroes (playerHeroes).
 */
export function getHeroStats(
  playerHeroes: PlayerHeroStats[],
  heroes: Hero[],
): HeroStatEntry[] {
  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));

  return [...playerHeroes]
    .sort((a, b) => b.games - a.games)
    .slice(0, 5)
    .map((ph) => {
      const hero_id = Number(ph.hero_id);
      return {
        hero_id,
        heroName: heroMap.get(hero_id)?.localized_name ?? `Hero ${hero_id}`,
        games: ph.games,
        winRate: ((ph.win / ph.games) * 100).toFixed(1),
      };
    });
}

// ---------------------------------------------------------------------------
// 2. getKdaByMonth
// ---------------------------------------------------------------------------

/**
 * Returns monthly average KDA keyed by "YYYY-MM", suitable for a line chart.
 * KDA per match = (kills + assists) / max(deaths, 1).
 */
export function getKdaByMonth(matches: Match[]): Record<string, number> {
  const buckets: Record<string, { sum: number; count: number }> = {};

  for (const m of matches) {
    const d = new Date(m.start_time * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const kda = (m.kills + m.assists) / Math.max(m.deaths, 1);
    if (!buckets[key]) buckets[key] = { sum: 0, count: 0 };
    buckets[key].sum += kda;
    buckets[key].count++;
  }

  const result: Record<string, number> = {};
  for (const [key, { sum, count }] of Object.entries(buckets)) {
    result[key] = Math.round((sum / count) * 100) / 100;
  }
  return result;
}

// ---------------------------------------------------------------------------
// 3. getTotalHours / getAllTimeGames / getTotalHoursFromHeroes
// ---------------------------------------------------------------------------

/**
 * Returns total match time in hours from a matches array, rounded to 1 decimal.
 * Match duration is in seconds.
 */
export function getTotalHours(matches: Match[]): number {
  const totalSeconds = matches.reduce((acc, m) => acc + m.duration, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

/**
 * Returns all-time total games played, summed from the /players/{id}/heroes
 * endpoint (covers full career, not just a date-filtered window).
 */
export function getAllTimeGames(playerHeroes: PlayerHeroStats[]): number {
  return playerHeroes.reduce((acc, ph) => acc + ph.games, 0);
}

/**
 * Estimates all-time hours using the playerHeroes all-time games count and a
 * 40-minute average match duration. Formula: (totalGames × 40) / 60.
 */
export function getTotalHoursFromHeroes(playerHeroes: PlayerHeroStats[]): number {
  const totalGames = getAllTimeGames(playerHeroes);
  return Math.round((totalGames * 40) / 60);
}

// ---------------------------------------------------------------------------
// 4. getStreaks
// ---------------------------------------------------------------------------

/**
 * Calculates win/loss streaks. Expects matches sorted newest-first.
 * currentStreak: positive = active win streak, negative = active loss streak.
 */
export function getStreaks(matches: Match[]): Streaks {
  if (matches.length === 0) {
    return { bestWinStreak: 0, bestLoseStreak: 0, currentStreak: 0 };
  }

  let bestWinStreak = 0;
  let bestLoseStreak = 0;
  let runWin = 0;
  let runLose = 0;

  for (const m of matches) {
    if (isWin(m)) {
      runWin++;
      runLose = 0;
    } else {
      runLose++;
      runWin = 0;
    }
    if (runWin > bestWinStreak) bestWinStreak = runWin;
    if (runLose > bestLoseStreak) bestLoseStreak = runLose;
  }

  // currentStreak: scan from newest (index 0) until the outcome flips
  const firstIsWin = isWin(matches[0]);
  let current = 0;
  for (const m of matches) {
    if (isWin(m) !== firstIsWin) break;
    current++;
  }

  return {
    bestWinStreak,
    bestLoseStreak,
    currentStreak: firstIsWin ? current : -current,
  };
}

// ---------------------------------------------------------------------------
// 5. getRoleBreakdown
// ---------------------------------------------------------------------------

/**
 * Returns percentage breakdown by role for games where lane_role is known.
 * Matches with null / unrecognised lane_role are excluded from the denominator.
 */
export function getRoleBreakdown(matches: Match[]): RoleBreakdown {
  const counts = { carry: 0, mid: 0, offlane: 0, support: 0 };
  let total = 0;

  for (const m of matches) {
    switch (m.lane_role) {
      case 1:
        counts.carry++;
        total++;
        break;
      case 2:
        counts.mid++;
        total++;
        break;
      case 3:
        counts.offlane++;
        total++;
        break;
      case 4:
      case 5:
        counts.support++;
        total++;
        break;
      default:
        break;
    }
  }

  if (total === 0) return { carry: 0, mid: 0, offlane: 0, support: 0 };

  return {
    carry: Math.round((counts.carry / total) * 100),
    mid: Math.round((counts.mid / total) * 100),
    offlane: Math.round((counts.offlane / total) * 100),
    support: Math.round((counts.support / total) * 100),
  };
}

// ---------------------------------------------------------------------------
// 6. getBestGame
// ---------------------------------------------------------------------------

export interface BestGame {
  kills: number;
  deaths: number;
  assists: number;
  heroId: number;
  heroName: string;
  heroCleanName: string;
  duration: number;
  isWin: boolean;
  matchId: number;
}

/**
 * Returns the match with the highest kill count from the date-filtered matches.
 * Returns null if the matches array is empty.
 */
export function getBestGame(
  matches: Match[],
  heroes: Hero[],
): BestGame | null {
  if (matches.length === 0) return null;

  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));
  const best = [...matches].sort((a, b) => b.kills - a.kills)[0];
  const heroData = heroMap.get(best.hero_id);

  return {
    kills: best.kills,
    deaths: best.deaths,
    assists: best.assists,
    heroId: best.hero_id,
    heroName: heroData?.localized_name ?? `Hero ${best.hero_id}`,
    heroCleanName: heroData?.name.replace("npc_dota_hero_", "") ?? "",
    duration: best.duration,
    isWin: isWin(best),
    matchId: best.match_id,
  };
}
