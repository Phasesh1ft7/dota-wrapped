import type { Match, Hero, PlayerHeroStats, ItemConstant, PlayerItemStat, PlayerTotal, ComputedRelic } from "./opendota";

// ---------------------------------------------------------------------------
// Relic helpers (used by API route and server page)
// ---------------------------------------------------------------------------

function formatAbilityLabel(key: string, heroName: string): string {
  return key
    .replace(heroName + '_', '')
    .replace(/_/g, ' ')
    .replace(/\b(the|of|and|a|an)\b/gi, w => w.toLowerCase())
    .replace(/shadowraze\d/i, 'Shadowraze')
    .replace(/sun strike/i, 'Sun Strike')
    .replace(/ball lightning/i, 'Ball Lightning')
    .trim()
    .toUpperCase();
}

export function deriveRelics(
  heroName: string,
  abilityUses: Record<string, number>,
  damageInflictor: Record<string, number>,
): ComputedRelic[] {
  const heroAbilityUses = Object.entries(abilityUses)
    .filter(([k]) => k.startsWith(heroName + '_'))
    .sort(([, a], [, b]) => b - a);

  const heroDamageKeys = Object.entries(damageInflictor)
    .filter(([k]) => k.startsWith(heroName + '_'))
    .sort(([, a], [, b]) => b - a);

  const relics: ComputedRelic[] = [];
  const usedKeys = new Set<string>();

  for (const [key, value] of heroAbilityUses.slice(0, 2)) {
    relics.push({ label: formatAbilityLabel(key, heroName) + ' CASTS', value, suffix: undefined, rarity: 'common' });
    usedKeys.add(key);
  }

  if (heroDamageKeys.length > 0) {
    const [key, value] = heroDamageKeys[0];
    relics.push({ label: formatAbilityLabel(key, heroName) + ' DAMAGE', value, suffix: 'dmg', rarity: 'common' });
    usedKeys.add(key);
  }

  const signatureEntry = heroAbilityUses.find(([k]) => !usedKeys.has(k))
    ?? heroDamageKeys.find(([k]) => !usedKeys.has(k));
  if (signatureEntry) {
    const [key, value] = signatureEntry;
    relics.push({ label: 'SIGNATURE: ' + formatAbilityLabel(key, heroName), value, suffix: undefined, rarity: 'rare' });
  }

  return relics.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Win condition (canonical — do not change)
// ---------------------------------------------------------------------------

const isWin = (m: Match): boolean =>
  (m.radiant_win && m.player_slot < 128) ||
  (!m.radiant_win && m.player_slot >= 128);

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

// ---------------------------------------------------------------------------
// Return-type interfaces
// ---------------------------------------------------------------------------

export interface HeroStatEntry {
  hero_id: number;
  heroName: string;
  games: number;
  wins: number;
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
        wins: ph.win,
        winRate: ph.games > 0 ? ((ph.win / ph.games) * 100).toFixed(1) : "0.0",
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
// 6. getBestHeroMatch
// ---------------------------------------------------------------------------

export interface BestHeroMatch {
  kills: number;
  deaths: number;
  assists: number;
  duration: string; // "52m 36s"
  isWin: boolean;
  matchId: number;
}

/**
 * Returns the highest-kill match for a specific hero from the date-filtered
 * matches array, or null if the hero hasn't been played.
 */
export function getBestHeroMatch(
  matches: Match[],
  heroId: number,
): BestHeroMatch | null {
  const heroMatches = matches.filter((m) => m.hero_id === heroId);
  if (heroMatches.length === 0) return null;
  const best = [...heroMatches].sort((a, b) => b.kills - a.kills)[0];
  const m = Math.floor(best.duration / 60);
  const s = best.duration % 60;
  return {
    kills: best.kills,
    deaths: best.deaths,
    assists: best.assists,
    duration: `${m}m ${String(s).padStart(2, "0")}s`,
    isWin: isWin(best),
    matchId: best.match_id,
  };
}

// ---------------------------------------------------------------------------
// 7. getBestGame (all-time)
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
  cs: number;
  gpm: number;
  xpm: number;
  heroDamage: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
}

/**
 * Returns the highest-KDA parsed match from yearMatches (gold_per_min > 0).
 * Falls back to the highest-kill unparsed match if no parsed matches exist.
 * Returns null if the matches array is empty.
 */
export function getBestGame(
  matches: Match[],
  heroes: Hero[],
): BestGame | null {
  if (matches.length === 0) return null;

  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));

  const parsed = matches.filter((m) => (m.gold_per_min ?? 0) > 0);
  const pool = parsed.length > 0 ? parsed : matches;
  const best = [...pool].sort((a, b) => {
    const kdaA = (a.kills + a.assists) / Math.max(a.deaths, 1);
    const kdaB = (b.kills + b.assists) / Math.max(b.deaths, 1);
    return kdaB - kdaA;
  })[0];

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
    cs: best.last_hits ?? 0,
    gpm: best.gold_per_min ?? 0,
    xpm: best.xp_per_min ?? 0,
    heroDamage: best.hero_damage ?? 0,
    item0: best.item_0 ?? 0,
    item1: best.item_1 ?? 0,
    item2: best.item_2 ?? 0,
    item3: best.item_3 ?? 0,
    item4: best.item_4 ?? 0,
    item5: best.item_5 ?? 0,
  };
}

// ---------------------------------------------------------------------------
// 7b. getBestHeroGame
// ---------------------------------------------------------------------------

/**
 * Returns the highest-KDA match on a specific hero from yearMatches.
 * Returns null if the hero hasn't been played.
 */
export function getBestHeroGame(
  matches: Match[],
  heroId: number,
  heroes: Hero[],
): BestGame | null {
  const heroMatches = matches.filter((m) => m.hero_id === heroId);
  if (heroMatches.length === 0) return null;

  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));
  const best = [...heroMatches].sort((a, b) => {
    const kdaA = (a.kills + a.assists) / Math.max(a.deaths, 1);
    const kdaB = (b.kills + b.assists) / Math.max(b.deaths, 1);
    return kdaB - kdaA;
  })[0];

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
    cs: best.last_hits ?? 0,
    gpm: best.gold_per_min ?? 0,
    xpm: best.xp_per_min ?? 0,
    heroDamage: best.hero_damage ?? 0,
    item0: best.item_0 ?? 0,
    item1: best.item_1 ?? 0,
    item2: best.item_2 ?? 0,
    item3: best.item_3 ?? 0,
    item4: best.item_4 ?? 0,
    item5: best.item_5 ?? 0,
  };
}

// ---------------------------------------------------------------------------
// 8. getTempoStats
// ---------------------------------------------------------------------------

export interface TempoStats {
  fastestWin: string | null;
  longestGame: string | null;
  avgDuration: string;
  totalHoursThisYear: number;
}

export function getTempoStats(yearMatches: Match[]): TempoStats {
  const wins = yearMatches.filter(isWin);

  const fastestWin =
    wins.length > 0
      ? fmtDuration([...wins].sort((a, b) => a.duration - b.duration)[0].duration)
      : null;

  const longestGame =
    yearMatches.length > 0
      ? fmtDuration([...yearMatches].sort((a, b) => b.duration - a.duration)[0].duration)
      : null;

  const totalSeconds = yearMatches.reduce((sum, m) => sum + m.duration, 0);
  const avgSeconds = yearMatches.length > 0 ? totalSeconds / yearMatches.length : 0;

  return {
    fastestWin,
    longestGame,
    avgDuration: fmtDuration(Math.round(avgSeconds)),
    totalHoursThisYear: Math.round((totalSeconds / 3600) * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// 9. getSignatureMoves
// ---------------------------------------------------------------------------

export interface SignatureMoves {
  topItemName: string | null;
  topItemGames: number;
  mostPlayedHeroName: string;
  mostPlayedHeroCleanName: string;
  mostPlayedHeroWinRate: string;
  overallWinRate: string;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  dominantRole: string | null;
  dominantRolePct: number;
  mostBuiltItemKey: string | null;
  hoursOnHero: number;
  heroWinStreak: number;
  careerGamesOnHero: number;
  bestHeroGame: BestGame | null;
  radiantWins: number;
  radiantGames: number;
  direWins: number;
  direGames: number;
}

export function getSignatureMoves(
  yearMatches: Match[],
  playerHeroes: PlayerHeroStats[],
  heroes: Hero[],
  playerItems: Record<string, PlayerItemStat> | null,
  itemConstants: Record<string, ItemConstant> | null,
  heroCareerMatches?: Match[] | null,
): SignatureMoves {
  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));

  let topItemName: string | null = null;
  let topItemGames = 0;
  let mostBuiltItemKey: string | null = null;
  if (playerItems) {
    const entries = Object.entries(playerItems).filter(([, v]) => v.games > 0);
    if (entries.length > 0) {
      const [topKey, stat] = [...entries].sort(([, a], [, b]) => b.games - a.games)[0];
      topItemGames = stat.games;
      topItemName = itemConstants?.[topKey]?.dname ?? topKey.replace(/_/g, " ");
      mostBuiltItemKey = topKey.replace(/^item_/, "");
    }
  }

  const totalKills = yearMatches.reduce((s, m) => s + m.kills, 0);
  const totalDeaths = yearMatches.reduce((s, m) => s + m.deaths, 0);
  const totalAssists = yearMatches.reduce((s, m) => s + m.assists, 0);

  const topHero =
    playerHeroes.length > 0
      ? [...playerHeroes].sort((a, b) => b.games - a.games)[0]
      : null;
  const topHeroId = topHero ? Number(topHero.hero_id) : -1;
  const mostPlayedHeroName =
    topHeroId > 0 ? (heroMap.get(topHeroId)?.localized_name ?? `Hero ${topHeroId}`) : "—";
  const mostPlayedHeroCleanName =
    topHeroId > 0 ? (heroMap.get(topHeroId)?.name.replace("npc_dota_hero_", "") ?? "") : "";
  const mostPlayedHeroWinRate =
    topHero && topHero.games > 0
      ? ((topHero.win / topHero.games) * 100).toFixed(1)
      : "0.0";

  const totalWins = yearMatches.filter(isWin).length;
  const overallWinRate =
    yearMatches.length > 0
      ? ((totalWins / yearMatches.length) * 100).toFixed(1)
      : "0.0";

  const counts = { Carry: 0, Mid: 0, Offlane: 0, Support: 0 };
  for (const m of yearMatches) {
    if (m.lane_role === 1) counts.Carry++;
    else if (m.lane_role === 2) counts.Mid++;
    else if (m.lane_role === 3) counts.Offlane++;
    else if (m.lane_role === 4 || m.lane_role === 5) counts.Support++;
  }
  const roleTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  let dominantRole: string | null = null;
  let dominantRolePct = 0;
  if (roleTotal > 0) {
    const [role, count] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    dominantRole = role;
    dominantRolePct = Math.round((count / roleTotal) * 100);
  }

  const heroYearMatches = topHeroId > 0 ? yearMatches.filter((m) => m.hero_id === topHeroId) : [];

  const hoursOnHero =
    Math.round((heroYearMatches.reduce((s, m) => s + m.duration, 0) / 3600) * 10) / 10;

  let heroWinStreak = 0;
  let run = 0;
  for (const m of [...heroYearMatches].sort((a, b) => a.match_id - b.match_id)) {
    if (isWin(m)) { run++; if (run > heroWinStreak) heroWinStreak = run; }
    else run = 0;
  }

  const careerEntry = playerHeroes.find((ph) => Number(ph.hero_id) === topHeroId);
  const careerGamesOnHero = careerEntry?.games ?? 0;

  // bestHeroGame: highest-KDA match on the top hero — year matches preferred, career fallback
  const heroGamePool = heroYearMatches.length > 0
    ? heroYearMatches
    : (heroCareerMatches && heroCareerMatches.length > 0 ? heroCareerMatches : []);
  let bestHeroGame: BestGame | null = null;
  if (heroGamePool.length > 0) {
    const sorted = [...heroGamePool].sort((a, b) => {
      const kdaA = (a.kills + a.assists) / Math.max(a.deaths, 1);
      const kdaB = (b.kills + b.assists) / Math.max(b.deaths, 1);
      return kdaB - kdaA;
    });
    const best = sorted[0];
    const heroData = heroMap.get(best.hero_id);
    bestHeroGame = {
      kills: best.kills,
      deaths: best.deaths,
      assists: best.assists,
      heroId: best.hero_id,
      heroName: heroData?.localized_name ?? `Hero ${best.hero_id}`,
      heroCleanName: heroData?.name.replace("npc_dota_hero_", "") ?? "",
      duration: best.duration,
      isWin: isWin(best),
      matchId: best.match_id,
      cs: best.last_hits ?? 0,
      gpm: best.gold_per_min ?? 0,
      xpm: best.xp_per_min ?? 0,
      heroDamage: best.hero_damage ?? 0,
      item0: best.item_0 ?? 0,
      item1: best.item_1 ?? 0,
      item2: best.item_2 ?? 0,
      item3: best.item_3 ?? 0,
      item4: best.item_4 ?? 0,
      item5: best.item_5 ?? 0,
    };
  }

  // Use career hero matches for radiant/dire if available; fall back to year matches
  const heroMatchesForStats = (heroCareerMatches && heroCareerMatches.length > 0)
    ? heroCareerMatches
    : heroYearMatches;
  const radiantHeroMatches = heroMatchesForStats.filter((m) => m.player_slot < 128);
  const radiantWins = radiantHeroMatches.filter(isWin).length;
  const radiantGames = radiantHeroMatches.length;
  const direHeroMatches = heroMatchesForStats.filter((m) => m.player_slot >= 128);
  const direWins = direHeroMatches.filter(isWin).length;
  const direGames = direHeroMatches.length;

  return {
    topItemName,
    topItemGames,
    mostPlayedHeroName,
    mostPlayedHeroCleanName,
    mostPlayedHeroWinRate,
    overallWinRate,
    totalKills,
    totalDeaths,
    totalAssists,
    dominantRole,
    dominantRolePct,
    mostBuiltItemKey,
    hoursOnHero,
    heroWinStreak,
    careerGamesOnHero,
    bestHeroGame,
    radiantWins,
    radiantGames,
    direWins,
    direGames,
  };
}

// ---------------------------------------------------------------------------
// 10. getLegendStats
// ---------------------------------------------------------------------------

export interface LegendStats {
  bestKdaGame: {
    heroName: string;
    heroCleanName: string;
    matchId: number;
    kda: number;
    kills: number;
    deaths: number;
    assists: number;
  } | null;
  highestGpmGame: {
    heroName: string;
    heroCleanName: string;
    gpm: number;
  } | null;
  longestWinStreak: number;
}

export function getLegendStats(yearMatches: Match[], heroes: Hero[]): LegendStats {
  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));

  let bestKdaGame: LegendStats["bestKdaGame"] = null;
  const validMatches = yearMatches.filter((m) => m.duration >= 600);
  if (validMatches.length > 0) {
    const best = [...validMatches].sort((a, b) => {
      const kdaA = (a.kills + a.assists) / Math.max(a.deaths, 1);
      const kdaB = (b.kills + b.assists) / Math.max(b.deaths, 1);
      return kdaB - kdaA;
    })[0];
    const hero = heroMap.get(best.hero_id);
    bestKdaGame = {
      heroName: hero?.localized_name ?? `Hero ${best.hero_id}`,
      heroCleanName: hero?.name.replace("npc_dota_hero_", "") ?? "",
      matchId: best.match_id,
      kda: Math.round(((best.kills + best.assists) / Math.max(best.deaths, 1)) * 10) / 10,
      kills: best.kills,
      deaths: best.deaths,
      assists: best.assists,
    };
  }

  let highestGpmGame: LegendStats["highestGpmGame"] = null;
  const withGpm = yearMatches.filter((m) => (m.gold_per_min ?? 0) > 0);
  if (withGpm.length > 0) {
    const best = [...withGpm].sort((a, b) => (b.gold_per_min ?? 0) - (a.gold_per_min ?? 0))[0];
    const hero = heroMap.get(best.hero_id);
    highestGpmGame = {
      heroName: hero?.localized_name ?? `Hero ${best.hero_id}`,
      heroCleanName: hero?.name.replace("npc_dota_hero_", "") ?? "",
      gpm: best.gold_per_min,
    };
  }

  let longestWinStreak = 0;
  if (yearMatches.length > 0) {
    const sorted = [...yearMatches].sort((a, b) => a.match_id - b.match_id);
    let current = 0;
    for (const m of sorted) {
      if (isWin(m)) {
        current++;
        if (current > longestWinStreak) longestWinStreak = current;
      } else {
        current = 0;
      }
    }
  }

  return { bestKdaGame, highestGpmGame, longestWinStreak };
}

// ---------------------------------------------------------------------------
// 11. getRankInfo
// ---------------------------------------------------------------------------

export interface RankInfo {
  medalName: string;
  stars: number;
  starsLabel: string;
  fullRank: string;
  medalNumber: number;
  percentileLabel: string;
  isImmortal: boolean;
  leaderboardRank: number | null;
}

const MEDAL_NAMES = ['', 'Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'];
const STAR_LABELS = ['', 'I', 'II', 'III', 'IV', 'V'];
const PERCENTILE_LABELS: Record<number, string> = {
  1: 'Top 92%',
  2: 'Top 80%',
  3: 'Top 63%',
  4: 'Top 42%',
  5: 'Top 24%',
  6: 'Top 10%',
  7: 'Top 3%',
  8: 'Top 1%',
};

export function getRankInfo(rankTier: number | null, leaderboardRank: number | null): RankInfo {
  if (!rankTier || rankTier === 0) {
    return {
      medalName: 'Hidden',
      stars: 0,
      starsLabel: '',
      fullRank: 'Rank Hidden',
      medalNumber: 0,
      percentileLabel: 'Rank not public',
      isImmortal: false,
      leaderboardRank: null,
    };
  }

  const medal = Math.floor(rankTier / 10);
  const stars = rankTier % 10;
  const medalName = MEDAL_NAMES[medal] ?? 'Unknown';
  const starsLabel = stars > 0 ? (STAR_LABELS[stars] ?? '') : '';
  const isImmortal = medal === 8;
  const fullRank = starsLabel ? `${medalName} ${starsLabel}` : medalName;

  return {
    medalName,
    stars,
    starsLabel,
    fullRank,
    medalNumber: medal,
    percentileLabel: PERCENTILE_LABELS[medal] ?? '',
    isImmortal,
    leaderboardRank,
  };
}

// ---------------------------------------------------------------------------
// 12. getPlayStyleStats
// ---------------------------------------------------------------------------

export interface PlayStyleStats {
  avgGpm: number;
  avgXpm: number;
  avgLastHits: number;
  couriersKilled: number;
  stunsApplied: number;
  towerKills: number;
  wardsPlaced: number;
  tpScrollsUsed: number;
  actionsPerMin: number;
  heroHealing: number;
  fighting: number;
  farming: number;
  supporting: number;
  pushing: number;
  utility: number;
}

export function getPlayStyleStats(
  totals: PlayerTotal[],
  yearMatches: Match[],
): PlayStyleStats {
  const totalsMap = new Map(totals.map((t) => [t.field, t]));

  const avg = (field: string): number => {
    const t = totalsMap.get(field);
    return t && t.n > 0 ? t.sum / t.n : 0;
  };

  const sum = (field: string): number => totalsMap.get(field)?.sum ?? 0;

  const clamp = (v: number) => Math.min(100, Math.max(5, Math.round(v)));

  const avgGpm = Math.round(avg("gold_per_min"));
  const avgXpm = Math.round(avg("xp_per_min"));
  const avgLastHits = Math.round(avg("last_hits"));
  const couriersKilled = Math.round(sum("courier_kills"));
  const stunsApplied = Math.round(sum("stuns"));
  const towerKills = Math.round(sum("tower_kills"));
  const wardsPlaced = Math.round(sum("purchase_ward_observer"));
  const tpScrollsUsed = Math.round(sum("purchase_tpscroll"));
  const actionsPerMin = Math.round(avg("actions_per_min"));
  const heroHealing = Math.round(sum("hero_healing"));

  const fighting   = clamp((avg("kills")         / 12)   * 100);
  const farming    = clamp((avg("gold_per_min")   / 800)  * 100);
  const supporting = clamp((avg("assists")        / 20)   * 100);
  const pushing    = clamp((avg("tower_damage")   / 3000) * 100);
  const utility    = clamp((avg("stuns")          / 60)   * 100);

  return {
    avgGpm,
    avgXpm,
    avgLastHits,
    couriersKilled,
    stunsApplied,
    towerKills,
    wardsPlaced,
    tpScrollsUsed,
    actionsPerMin,
    heroHealing,
    fighting,
    farming,
    supporting,
    pushing,
    utility,
  };
}

// ---------------------------------------------------------------------------
// 13. getYearInNumbers
// ---------------------------------------------------------------------------

export interface YearInNumbers {
  totalGames: number;
  totalHours: number;
  avgGameLength: string;
  bestWinStreak: number;
  worstLoseStreak: number;
  mostPlayedDay: string;
  winRateShort: number;
  winRateMid: number;
  winRateLong: number;
  uniqueHeroes: number;
  mostPlayedHeroCleanName: string;
  firstBloodRate: number;
  comebackWins: number;
  avgKills: number;
  avgDeaths: number;
  totalRampages: number;
  partyWinRate: number;
}

export function getYearInNumbers(yearMatches: Match[], heroes: Hero[]): YearInNumbers {
  console.log('sample match kills:', yearMatches.slice(0, 3).map(m => m.kills));
  const totalGames = yearMatches.length;
  const totalSeconds = yearMatches.reduce((s, m) => s + m.duration, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const avgSeconds = totalGames > 0 ? totalSeconds / totalGames : 0;
  const avgGameLength = `${Math.round(avgSeconds / 60)}m`;

  const sorted = [...yearMatches].sort((a, b) => a.match_id - b.match_id);
  let bestWinStreak = 0;
  let worstLoseStreak = 0;
  let runWin = 0;
  let runLose = 0;
  for (const m of sorted) {
    if (isWin(m)) { runWin++; runLose = 0; }
    else { runLose++; runWin = 0; }
    if (runWin > bestWinStreak) bestWinStreak = runWin;
    if (runLose > worstLoseStreak) worstLoseStreak = runLose;
  }

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayCounts: Record<number, number> = {};
  for (const m of yearMatches) {
    const day = new Date(m.start_time * 1000).getDay();
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  }
  const topDayEntry = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];
  const mostPlayedDay = topDayEntry ? (DAY_NAMES[Number(topDayEntry[0])] ?? "Unknown") : "Unknown";

  const winPct = (arr: Match[]): number => {
    if (arr.length === 0) return 0;
    return Math.round((arr.filter(isWin).length / arr.length) * 1000) / 10;
  };

  const heroCounts: Record<number, number> = {};
  for (const m of yearMatches) {
    heroCounts[m.hero_id] = (heroCounts[m.hero_id] ?? 0) + 1;
  }
  const topHeroEntry = Object.entries(heroCounts).sort(([, a], [, b]) => b - a)[0];
  const topHeroId = topHeroEntry ? Number(topHeroEntry[0]) : -1;
  const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]));
  const mostPlayedHeroCleanName =
    topHeroId > 0 ? (heroMap.get(topHeroId)?.name.replace("npc_dota_hero_", "") ?? "") : "";

  const firstBloodRate =
    totalGames > 0
      ? (yearMatches.filter((m) => m.firstblood_claimed).length / totalGames) * 100
      : 0;

  const comebackWins = yearMatches.filter(
    (m) => isWin(m) && (m.comeback === true || m.duration > 45 * 60),
  ).length;

  const avgKills = totalGames > 0
    ? yearMatches.reduce((s, m) => s + (m.kills ?? 0), 0) / totalGames
    : 0;

  const avgDeaths = totalGames > 0
    ? yearMatches.reduce((s, m) => s + (m.deaths ?? 0), 0) / totalGames
    : 0;

  const totalRampages = yearMatches.reduce((s, m) => s + (m.multi_kills?.rampage ?? 0), 0);

  const partyGames = yearMatches.filter((m) => (m.party_size ?? 0) > 1);
  const partyWinRate =
    partyGames.length > 0
      ? (partyGames.filter(isWin).length / partyGames.length) * 100
      : 0;

  return {
    totalGames,
    totalHours,
    avgGameLength,
    bestWinStreak,
    worstLoseStreak,
    mostPlayedDay,
    winRateShort: winPct(yearMatches.filter((m) => m.duration < 1800)),
    winRateMid: winPct(yearMatches.filter((m) => m.duration >= 1800 && m.duration <= 2700)),
    winRateLong: winPct(yearMatches.filter((m) => m.duration > 2700)),
    uniqueHeroes: new Set(yearMatches.map((m) => m.hero_id)).size,
    mostPlayedHeroCleanName,
    firstBloodRate,
    comebackWins,
    avgKills,
    avgDeaths,
    totalRampages,
    partyWinRate,
  };
}
