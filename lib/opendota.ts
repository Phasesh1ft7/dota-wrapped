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

export interface BestGameData {
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
}

/** Slow slice — returned by fetchPlayerMatches (3–8 s). */
export interface MatchesData {
  heroes: PlayerHeroStats[] | null;
  matches: Match[] | null;
  recentMatches: Match[] | null;
  peers: Peer[] | null;
  quizMatches: QuizMatch[];
  itemConstants: Record<string, ItemConstant> | null;
  bestGameData: BestGameData | null;
}

/** Combined type kept for backwards compatibility. */
export interface PlayerData extends ProfileData, MatchesData {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${url}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Internal types for /matches/{id} endpoint
// ---------------------------------------------------------------------------

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
    if (result.status !== "fulfilled") continue;
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
  const sorted = [...matches].sort((a, b) => b.kills - a.kills);
  const parsedBest = sorted.find((m) => m.version !== null) ?? null;
  const best = parsedBest ?? sorted[0];
  if (!best) return null;

  const heroData = heroMap.get(best.hero_id);
  const isWinResult =
    (best.radiant_win && best.player_slot < 128) ||
    (!best.radiant_win && best.player_slot >= 128);

  const base = {
    kills: best.kills,
    deaths: best.deaths,
    assists: best.assists,
    heroId: best.hero_id,
    heroCleanName: heroData?.name.replace("npc_dota_hero_", "") ?? "",
    heroName: heroData?.localized_name ?? `Hero ${best.hero_id}`,
    duration: fmtDuration(best.duration),
    isWin: isWinResult,
  };

  if (!parsedBest) {
    return { ...base, lastHits: null, gpm: null, isParsed: false, items: [] };
  }

  try {
    const accountIdNum = parseInt(accountId, 10);
    const full = await fetchJson<FullMatchData>(
      `${BASE_URL}/matches/${best.match_id}`,
    );
    const player = full.players.find((p) => p.account_id === accountIdNum);
    if (!player) {
      return { ...base, lastHits: null, gpm: null, isParsed: false, items: [] };
    }
    const items = [
      player.item_0, player.item_1, player.item_2,
      player.item_3, player.item_4, player.item_5,
    ].filter((id) => id !== 0);
    return {
      ...base,
      lastHits: player.last_hits,
      gpm: player.gold_per_min,
      isParsed: true,
      items,
    };
  } catch {
    return { ...base, lastHits: null, gpm: null, isParsed: false, items: [] };
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
      const [heroesResult, matchesResult, recentMatchesResult, peersResult, itemConstantsResult, heroListResult] =
        await Promise.allSettled([
          fetchJson<PlayerHeroStats[]>(
            `${BASE_URL}/players/${accountId}/heroes`,
          ),
          fetchJson<Match[]>(
            `${BASE_URL}/players/${accountId}/matches?limit=500&date=365`,
          ),
          fetchJson<Match[]>(`${BASE_URL}/players/${accountId}/recentMatches`),
          fetchJson<Peer[]>(`${BASE_URL}/players/${accountId}/peers`),
          fetchJson<Record<string, ItemConstant>>(`${BASE_URL}/constants/items`),
          fetchJson<Hero[]>(`${BASE_URL}/heroes`),
        ]);

      const recentMatches =
        recentMatchesResult.status === "fulfilled"
          ? recentMatchesResult.value
          : null;
      const matches =
        matchesResult.status === "fulfilled" ? matchesResult.value : null;
      const heroList =
        heroListResult.status === "fulfilled" ? heroListResult.value : null;

      const [quizMatches, bestGameData] = await Promise.all([
        resolveQuizMatches(accountId, recentMatches),
        resolveBestGameDetails(accountId, matches, heroList),
      ]);

      return {
        heroes:
          heroesResult.status === "fulfilled" ? heroesResult.value : null,
        matches,
        recentMatches,
        peers:
          peersResult.status === "fulfilled" ? peersResult.value : null,
        quizMatches,
        itemConstants:
          itemConstantsResult.status === "fulfilled"
            ? itemConstantsResult.value
            : null,
        bestGameData,
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
