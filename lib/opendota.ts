import { unstable_cache } from "next/cache";

const BASE_URL = "https://api.opendota.com/api";

// ---------------------------------------------------------------------------
// Response interfaces
// ---------------------------------------------------------------------------

export interface PlayerProfile {
  tracked_until: string | null;
  solo_competitive_rank: number | null;
  competitive_rank: number | null;
  rank_tier: number | null;
  leaderboard_rank: number | null;
  mmr_estimate: { estimate: number } | null;
  profile: {
    account_id: number;
    personaname: string;
    name: string | null;
    plus: boolean;
    cheese: number;
    steamid: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    profileurl: string;
    last_login: string | null;
    loccountrycode: string | null;
    is_contributor: boolean;
    is_subscriber: boolean;
  };
}

export interface WinLoss {
  win: number;
  lose: number;
}

export interface PlayerHeroStats {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

export interface Match {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  version: number | null;
  kills: number;
  deaths: number;
  assists: number;
  skill: number | null;
  average_rank: number | null;
  xp_per_min: number;
  gold_per_min: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  last_hits: number;
  lane: number | null;
  lane_role: number | null;
  is_roaming: boolean | null;
  cluster: number;
  leaver_status: number;
  party_size: number | null;
}

export interface Peer {
  account_id: number;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  with_gpm_sum: number;
  with_xpm_sum: number;
  against_games: number;
  against_win: number;
  personaname: string | null;
  name: string | null;
  avatar: string | null;
  avatarfull: string | null;
}

export interface QuizMatch {
  matchId: number;
  heroId: number;
  items: number[]; // [item_0 … item_5]
  kills: number;
  deaths: number;
  assists: number;
  radiant_win: boolean;
  player_slot: number;
}

export interface ItemConstant {
  id: number;
  dname: string;
  img: string;
}

export interface PlayerItemStat {
  games: number;
  win: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_health_regen: number | null;
  base_mana: number;
  base_mana_regen: number;
  base_armor: number;
  base_mr: number;
  base_attack_min: number;
  base_attack_max: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  str_gain: number;
  agi_gain: number;
  int_gain: number;
  attack_range: number;
  projectile_speed: number;
  attack_rate: number;
  base_attack_time: number;
  attack_point: number;
  move_speed: number;
  turn_rate: number | null;
  cm_enabled: boolean;
  legs: number | null;
  day_vision: number;
  night_vision: number;
  hero_id: number;
  turbo_picks: number;
  turbo_wins: number;
  pro_ban: number;
  pro_win: number;
  pro_pick: number;
}

// ---------------------------------------------------------------------------
// Aggregated return types
// ---------------------------------------------------------------------------

/** Fast slice — returned by fetchPlayerProfile (~300 ms). */
export interface ProfileData {
  player: PlayerProfile | null;
  wl: WinLoss | null;
  heroList: Hero[] | null;
}

export interface BestGameBenchmarks {
  gold_per_min: { raw: number; pct: number } | null;
  xp_per_min: { raw: number; pct: number } | null;
  kills_per_min: { raw: number; pct: number } | null;
  last_hits_per_min: { raw: number; pct: number } | null;
  hero_damage_per_min: { raw: number; pct: number } | null;
  tower_damage: { raw: number; pct: number } | null;
}

export interface BestGameData {
  matchId: number;
  kills: number;
  deaths: number;
  assists: number;
  lastHits: number | null;
  gpm: number | null;
  heroId: number;
  heroCleanName: string;
  heroName: string;
  duration: string;
  isWin: boolean;
  isParsed: boolean;
  items: number[];
  benchmarks: BestGameBenchmarks | null;
}

export interface BestHeroMatchData {
  gpm: number | null;
  lastHits: number | null;
  isParsed: boolean;
  items: number[];
}

/** Slow slice — returned by fetchPlayerMatches (3–8 s). */
export interface MatchesData {
  heroes: PlayerHeroStats[] | null;
  matches: Match[] | null;
  recentMatches: Match[] | null;
  peers: Peer[] | null;
  quizMatches: QuizMatch[];
  itemConstants: Record<string, ItemConstant> | null;
  playerItems: Record<string, PlayerItemStat> | null;
  bestGameData: BestGameData | null;
  bestHeroMatchDetails: BestHeroMatchData | null;
  playerTotals: PlayerTotal[] | null;
}

/** Combined type kept for backwards compatibility. */
export interface PlayerData extends ProfileData, MatchesData {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Internal types for /matches/{id} endpoint
// ---------------------------------------------------------------------------

interface BenchmarkEntry {
  raw: number;
  pct: number;
}

interface FullMatchPlayer {
  account_id: number;
  player_slot: number;
  kills: number;
  deaths: number;
  assists: number;
  hero_id: number;
  last_hits: number;
  gold_per_min: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  benchmarks?: {
    gold_per_min?: BenchmarkEntry | null;
    xp_per_min?: BenchmarkEntry | null;
    kills_per_min?: BenchmarkEntry | null;
    last_hits_per_min?: BenchmarkEntry | null;
    hero_damage_per_min?: BenchmarkEntry | null;
    tower_damage?: BenchmarkEntry | null;
  } | null;
}

interface FullMatchData {
  radiant_win: boolean;
  players: FullMatchPlayer[];
}

async function resolveQuizMatches(
  accountId: string,
  recentMatches: Match[] | null,
): Promise<QuizMatch[]> {
  const targets = (recentMatches ?? [])
    .filter((m) => m.hero_id !== 0)
    .slice(0, 5);
  if (targets.length === 0) return [];

  const accountIdNum = parseInt(accountId, 10);
  const results = await Promise.allSettled(
    targets.map((m) =>
      fetchJson<FullMatchData>(`${BASE_URL}/matches/${m.match_id}`),
    ),
  );

  const quizMatches: QuizMatch[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status !== "fulfilled" || !result.value) continue;
    const full = result.value;
    const player = full.players.find((p) => p.account_id === accountIdNum);
    if (!player) continue;
    const items: number[] = [
      player.item_0, player.item_1, player.item_2,
      player.item_3, player.item_4, player.item_5,
    ];
    if (items.every((id) => id === 0)) continue;
    quizMatches.push({
      matchId: targets[i].match_id,
      heroId: player.hero_id,
      items,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      radiant_win: full.radiant_win,
      player_slot: player.player_slot,
    });
  }
  return quizMatches;
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

async function resolveBestGameDetails(
  accountId: string,
  matches: Match[] | null,
  heroes: Hero[] | null,
): Promise<BestGameData | null> {
  if (!matches || matches.length === 0) return null;

  const heroMap = new Map<number, Hero>((heroes ?? []).map((h) => [h.id, h]));
  // Always take the highest-kill match regardless of parse status
  const best = [...matches].sort((a, b) => b.kills - a.kills)[0];
  if (!best) return null;

  const heroData = heroMap.get(best.hero_id);
  const isWinResult =
    (best.radiant_win && best.player_slot < 128) ||
    (!best.radiant_win && best.player_slot >= 128);

  const base = {
    matchId: best.match_id,
    kills: best.kills,
    deaths: best.deaths,
    assists: best.assists,
    heroId: best.hero_id,
    heroCleanName: heroData?.name.replace("npc_dota_hero_", "") ?? "",
    heroName: heroData?.localized_name ?? `Hero ${best.hero_id}`,
    duration: fmtDuration(best.duration),
    isWin: isWinResult,
  };

  // Always attempt to fetch full match details
  try {
    const accountIdNum = parseInt(accountId, 10);
    const full = await fetchJson<FullMatchData>(
      `${BASE_URL}/matches/${best.match_id}`,
    );
    if (!full) {
      return { ...base, lastHits: null, gpm: null, isParsed: false, items: [], benchmarks: null };
    }
    const player = full.players.find(
      (p) => String(p.account_id) === String(accountId),
    );
    if (!player) {
      return { ...base, lastHits: null, gpm: null, isParsed: false, items: [], benchmarks: null };
    }
    const items = [
      player.item_0, player.item_1, player.item_2,
      player.item_3, player.item_4, player.item_5,
    ].filter((id) => id !== 0);
    // Treat as parsed only when version is set AND we got real item data
    const isParsed = best.version !== null && items.length > 0;
    const benchmarks: BestGameBenchmarks | null = isParsed && player.benchmarks
      ? {
          gold_per_min: player.benchmarks.gold_per_min ?? null,
          xp_per_min: player.benchmarks.xp_per_min ?? null,
          kills_per_min: player.benchmarks.kills_per_min ?? null,
          last_hits_per_min: player.benchmarks.last_hits_per_min ?? null,
          hero_damage_per_min: player.benchmarks.hero_damage_per_min ?? null,
          tower_damage: player.benchmarks.tower_damage ?? null,
        }
      : null;
    return {
      ...base,
      lastHits: isParsed ? player.last_hits : null,
      gpm: isParsed ? player.gold_per_min : null,
      isParsed,
      items: isParsed ? items : [],
      benchmarks,
    };
  } catch {
    return { ...base, lastHits: null, gpm: null, isParsed: false, items: [], benchmarks: null };
  }
}

async function resolveBestHeroMatchDetails(
  accountId: string,
  matches: Match[] | null,
  playerHeroes: PlayerHeroStats[] | null,
): Promise<BestHeroMatchData | null> {
  if (!matches || !playerHeroes || playerHeroes.length === 0) return null;

  // Top hero = most games played
  const topHeroId = Number(
    [...playerHeroes].sort((a, b) => b.games - a.games)[0].hero_id,
  );

  // Fetch all-time hero-specific matches (not limited to date=365)
  let heroMatches: Match[] = [];
  try {
    const heroMatchesRes = await fetch(
      `${BASE_URL}/players/${accountId}/matches?hero_id=${topHeroId}&limit=20&significant=1`,
      { next: { revalidate: 3600 } },
    );
    heroMatches = heroMatchesRes.ok ? (await heroMatchesRes.json() as Match[]) : [];
  } catch {
    // fall through to yearly matches fallback
  }

  // Fall back to yearly matches if hero-specific fetch returned nothing
  if (heroMatches.length === 0) {
    heroMatches = (matches ?? []).filter((m) => m.hero_id === topHeroId);
  }

  if (heroMatches.length === 0) return null;
  const bestMatch = [...heroMatches].sort((a, b) => b.kills - a.kills)[0];

  try {
    const full = await fetchJson<FullMatchData>(
      `${BASE_URL}/matches/${bestMatch.match_id}`,
    );
    if (!full) return { gpm: null, lastHits: null, isParsed: false, items: [] };
    const player = full.players.find(
      (p) => String(p.account_id) === String(accountId),
    );
    if (!player) return { gpm: null, lastHits: null, isParsed: false, items: [] };

    const items = [
      player.item_0, player.item_1, player.item_2,
      player.item_3, player.item_4, player.item_5,
    ].filter((id) => id !== 0);
    const isParsed = bestMatch.version !== null && items.length > 0;

    return {
      gpm: isParsed ? player.gold_per_min : null,
      lastHits: isParsed ? player.last_hits : null,
      isParsed,
      items,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/**
 * Fast (~300 ms): fetches player profile, win/loss, and the global hero list.
 * Throws Error("PRIVATE_PROFILE") if the profile is private or missing.
 * Cached for 1 hour per accountId.
 */
export function fetchPlayerProfile(accountId: string): Promise<ProfileData> {
  return unstable_cache(
    async () => {
      const [playerResult, wlResult, heroListResult] = await Promise.allSettled([
        fetchJson<PlayerProfile>(`${BASE_URL}/players/${accountId}`),
        fetchJson<WinLoss>(`${BASE_URL}/players/${accountId}/wl`),
        fetchJson<Hero[]>(`${BASE_URL}/heroes`),
      ]);

      const player =
        playerResult.status === "fulfilled" ? playerResult.value : null;

      if (!player?.profile?.personaname) {
        throw new Error("PRIVATE_PROFILE");
      }

      return {
        player,
        wl: wlResult.status === "fulfilled" ? wlResult.value : null,
        heroList:
          heroListResult.status === "fulfilled" ? heroListResult.value : null,
      };
    },
    [`player-profile-${accountId}`],
    { revalidate: 3600 },
  )();
}

/**
 * Slow (3–8 s): fetches per-hero stats, full match history, and recent matches.
 * Individual failures return null for that slice — never throws.
 * Cached for 1 hour per accountId.
 */
export function fetchPlayerMatches(accountId: string): Promise<MatchesData> {
  return unstable_cache(
    async () => {
      const [heroesResult, matchesResult, recentMatchesResult, peersResult, itemConstantsResult, heroListResult, playerItemsResult, playerTotalsResult] =
        await Promise.allSettled([
          fetchJson<PlayerHeroStats[]>(
            `${BASE_URL}/players/${accountId}/heroes`,
          ),
          fetchJson<Match[]>(
            `${BASE_URL}/players/${accountId}/matches?limit=100&date=365`,
          ),
          fetchJson<Match[]>(`${BASE_URL}/players/${accountId}/recentMatches`),
          fetchJson<Peer[]>(`${BASE_URL}/players/${accountId}/peers`),
          fetchJson<Record<string, ItemConstant>>(`${BASE_URL}/constants/items`),
          fetchJson<Hero[]>(`${BASE_URL}/heroes`),
          fetchJson<Record<string, PlayerItemStat>>(`${BASE_URL}/players/${accountId}/items`),
          fetchJson<PlayerTotal[]>(`${BASE_URL}/players/${accountId}/totals`),
        ]);

      const recentMatches =
        recentMatchesResult.status === "fulfilled"
          ? recentMatchesResult.value
          : null;
      const matches =
        matchesResult.status === "fulfilled" ? matchesResult.value : null;
      const heroList =
        heroListResult.status === "fulfilled" ? heroListResult.value : null;

      const playerHeroes =
        heroesResult.status === "fulfilled" ? heroesResult.value : null;

      const [quizMatches, bestGameData, bestHeroMatchDetails] = await Promise.all([
        resolveQuizMatches(accountId, recentMatches),
        resolveBestGameDetails(accountId, matches, heroList),
        resolveBestHeroMatchDetails(accountId, matches, playerHeroes),
      ]);

      return {
        heroes: playerHeroes,
        matches,
        recentMatches,
        peers:
          peersResult.status === "fulfilled" ? peersResult.value : null,
        quizMatches,
        itemConstants:
          itemConstantsResult.status === "fulfilled"
            ? itemConstantsResult.value
            : null,
        playerItems: playerItemsResult.status === "fulfilled" ? playerItemsResult.value : null,
        bestGameData,
        bestHeroMatchDetails,
        playerTotals: playerTotalsResult.status === "fulfilled" ? playerTotalsResult.value : null,
      };
    },
    [`player-matches-${accountId}`],
    { revalidate: 3600 },
  )();
}

/** Convenience wrapper combining both fetches. */
export async function fetchPlayerData(accountId: string): Promise<PlayerData> {
  const [profile, matches] = await Promise.all([
    fetchPlayerProfile(accountId),
    fetchPlayerMatches(accountId),
  ]);
  return { ...profile, ...matches };
}
