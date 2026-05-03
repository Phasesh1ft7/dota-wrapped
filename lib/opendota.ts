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
// Aggregated return type
// ---------------------------------------------------------------------------

export interface PlayerData {
  player: PlayerProfile | null;
  wl: WinLoss | null;
  heroes: PlayerHeroStats[] | null;
  matches: Match[] | null;
  recentMatches: Match[] | null;
  heroList: Hero[] | null;
}

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
// Main export
// ---------------------------------------------------------------------------

export async function fetchPlayerData(accountId: string): Promise<PlayerData> {
  const [
    playerResult,
    wlResult,
    heroesResult,
    matchesResult,
    recentMatchesResult,
    heroListResult,
  ] = await Promise.allSettled([
    fetchJson<PlayerProfile>(`${BASE_URL}/players/${accountId}`),
    fetchJson<WinLoss>(`${BASE_URL}/players/${accountId}/wl`),
    fetchJson<PlayerHeroStats[]>(`${BASE_URL}/players/${accountId}/heroes`),
    fetchJson<Match[]>(
      `${BASE_URL}/players/${accountId}/matches?limit=500&date=365`,
    ),
    fetchJson<Match[]>(`${BASE_URL}/players/${accountId}/recentMatches`),
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
    heroes: heroesResult.status === "fulfilled" ? heroesResult.value : null,
    matches: matchesResult.status === "fulfilled" ? matchesResult.value : null,
    recentMatches:
      recentMatchesResult.status === "fulfilled"
        ? recentMatchesResult.value
        : null,
    heroList:
      heroListResult.status === "fulfilled" ? heroListResult.value : null,
  };
}
