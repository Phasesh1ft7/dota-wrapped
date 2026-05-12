import type {
  PlayerProfile,
  PlayerHeroStats,
  Match,
  Hero,
  ItemConstant,
  PlayerTotal,
  BestGameData,
  BestHeroMatchData,
  QuizMatch,
  PlayerData,
} from "./opendota";

const GRAPHQL_URL = "/api/stratz";
const HEROES_URL = "/api/stratz/heroes";
const ITEMS_URL = "/api/stratz/items";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.STRATZ_API_KEY ?? ""}`,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://stratz.com",
    "Referer": "https://stratz.com/",
  };
}

// ---------------------------------------------------------------------------
// GraphQL query
// ---------------------------------------------------------------------------

const PLAYER_QUERY = `
query PlayerData($accountId: Long!) {
  player(steamAccountId: $accountId) {
    steamAccount {
      id
      name
      avatar
      seasonRank
      seasonLeaderboardRank
      isAnonymous
    }
    matches(request: {
      take: 100
      startDateTime: 1735689600
    }) {
      id
      didRadiantWin
      durationSeconds
      startDateTime
      players(steamAccountId: $accountId) {
        isRadiant
        kills
        deaths
        assists
        goldPerMinute
        experiencePerMinute
        numLastHits
        numDenies
        heroDamage
        towerDamage
        heroHealing
        level
        hero {
          id
          shortName
        }
        item0Id
        item1Id
        item2Id
        item3Id
        item4Id
        item5Id
      }
    }
    heroesPerformance {
      hero {
        id
        shortName
      }
      winCount
      lossCount
      goldPerMinute
      experiencePerMinute
      kills
    }
    stats {
      winCount
      matchCount
    }
  }
}
`;

// ---------------------------------------------------------------------------
// Raw STRATZ response types
// ---------------------------------------------------------------------------

interface StratzHeroRef {
  id: number;
  shortName: string;
}

interface StratzMatchPlayer {
  isRadiant: boolean;
  kills: number;
  deaths: number;
  assists: number;
  goldPerMinute: number;
  experiencePerMinute: number;
  numLastHits: number;
  numDenies: number;
  heroDamage: number;
  towerDamage: number;
  heroHealing: number;
  level: number;
  hero: StratzHeroRef | null;
  item0Id: number;
  item1Id: number;
  item2Id: number;
  item3Id: number;
  item4Id: number;
  item5Id: number;
}

interface StratzMatch {
  id: number;
  didRadiantWin: boolean;
  durationSeconds: number;
  startDateTime: number;
  players: StratzMatchPlayer[];
}

interface StratzHeroPerf {
  hero: StratzHeroRef | null;
  winCount: number;
  lossCount: number;
  goldPerMinute: number;
  experiencePerMinute: number;
  kills: number;
}

interface StratzSteamAccount {
  id: number;
  name: string | null;
  avatar: string | null;
  seasonRank: number | null;
  seasonLeaderboardRank: number | null;
  isAnonymous: boolean;
}

interface StratzPlayerData {
  steamAccount: StratzSteamAccount;
  matches: StratzMatch[];
  heroesPerformance: StratzHeroPerf[];
  stats: { winCount: number; matchCount: number } | null;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchGraphQL(accountId: number): Promise<StratzPlayerData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query: PLAYER_QUERY, variables: { accountId } }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = await res.json() as {
      data?: { player?: StratzPlayerData | null };
      errors?: { message: string }[];
    };
    return json.data?.player ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchHeroList(): Promise<Hero[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(HEROES_URL, {
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = await res.json() as Record<string, {
      id: number;
      name: string;
      displayName: string;
      shortName: string;
    }>;
    return Object.values(data).map((h) => ({
      id: h.id,
      name: h.name ?? `npc_dota_hero_${h.shortName}`,
      localized_name: h.displayName,
      primary_attr: "", attack_type: "", roles: [],
      img: "", icon: "",
      base_health: 0, base_health_regen: null, base_mana: 0, base_mana_regen: 0,
      base_armor: 0, base_mr: 0, base_attack_min: 0, base_attack_max: 0,
      base_str: 0, base_agi: 0, base_int: 0,
      str_gain: 0, agi_gain: 0, int_gain: 0,
      attack_range: 0, projectile_speed: 0, attack_rate: 0, base_attack_time: 0, attack_point: 0,
      move_speed: 0, turn_rate: null, cm_enabled: false, legs: null,
      day_vision: 0, night_vision: 0, hero_id: h.id,
      turbo_picks: 0, turbo_wins: 0, pro_ban: 0, pro_win: 0, pro_pick: 0,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchItemConstants(): Promise<Record<string, ItemConstant>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(ITEMS_URL, {
      signal: controller.signal,
    });
    if (!res.ok) return {};
    const data = await res.json() as Record<string, {
      id: number;
      name?: string | null;
      displayName: string;
      shortName?: string | null;
    }>;
    const result: Record<string, ItemConstant> = {};
    for (const item of Object.values(data)) {
      const key = item.shortName;
      if (!key || !item.id) continue;
      result[key] = {
        id: item.id,
        dname: item.displayName,
        img: `/apps/dota2/images/dota_react/items/${key}.png`,
      };
    }
    return result;
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function mapMatch(sm: StratzMatch): Match | null {
  const p = sm.players[0];
  if (!p) return null;
  return {
    match_id: sm.id,
    player_slot: p.isRadiant ? 0 : 128,
    radiant_win: sm.didRadiantWin,
    duration: sm.durationSeconds,
    game_mode: 0,
    lobby_type: 0,
    hero_id: p.hero?.id ?? 0,
    start_time: sm.startDateTime,
    version: null,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    skill: null,
    average_rank: null,
    xp_per_min: p.experiencePerMinute,
    gold_per_min: p.goldPerMinute,
    hero_damage: p.heroDamage,
    tower_damage: p.towerDamage,
    hero_healing: p.heroHealing,
    last_hits: p.numLastHits,
    lane: null,
    lane_role: null,
    is_roaming: null,
    cluster: 0,
    leaver_status: 0,
    party_size: null,
  };
}

function buildHeroStats(heroesPerf: StratzHeroPerf[]): PlayerHeroStats[] {
  return heroesPerf
    .filter((p) => p.hero !== null)
    .map((p) => ({
      hero_id: String(p.hero!.id),
      last_played: 0,
      games: p.winCount + p.lossCount,
      win: p.winCount,
      with_games: 0,
      with_win: 0,
      against_games: 0,
      against_win: 0,
    }));
}

function buildPlayerTotals(matches: Match[]): PlayerTotal[] {
  const n = matches.length;
  if (n === 0) return [];
  const total = (fn: (m: Match) => number) => matches.reduce((s, m) => s + fn(m), 0);
  return [
    { field: "gold_per_min",           n, sum: total((m) => m.gold_per_min) },
    { field: "xp_per_min",             n, sum: total((m) => m.xp_per_min) },
    { field: "last_hits",              n, sum: total((m) => m.last_hits) },
    { field: "kills",                  n, sum: total((m) => m.kills) },
    { field: "deaths",                 n, sum: total((m) => m.deaths) },
    { field: "assists",                n, sum: total((m) => m.assists) },
    { field: "hero_damage",            n, sum: total((m) => m.hero_damage) },
    { field: "tower_damage",           n, sum: total((m) => m.tower_damage) },
    { field: "hero_healing",           n, sum: total((m) => m.hero_healing) },
    // Not available from the basic STRATZ match query
    { field: "courier_kills",          n: 0, sum: 0 },
    { field: "stuns",                  n: 0, sum: 0 },
    { field: "tower_kills",            n: 0, sum: 0 },
    { field: "purchase_ward_observer", n: 0, sum: 0 },
    { field: "purchase_tpscroll",      n: 0, sum: 0 },
    { field: "actions_per_min",        n: 0, sum: 0 },
  ];
}

// Keys playerItems by short name (e.g. "blink") to match itemConstants key format,
// so getSignatureMoves can resolve display names via itemConstants[topKey].
function buildPlayerItems(
  stratzMatches: StratzMatch[],
  idToKey: Map<number, string>,
): Record<string, { games: number; win: number }> {
  const result: Record<string, { games: number; win: number }> = {};
  for (const sm of stratzMatches) {
    const p = sm.players[0];
    if (!p) continue;
    const won = (sm.didRadiantWin && p.isRadiant) || (!sm.didRadiantWin && !p.isRadiant);
    for (const id of [p.item0Id, p.item1Id, p.item2Id, p.item3Id, p.item4Id, p.item5Id]) {
      if (id === 0) continue;
      const key = idToKey.get(id);
      if (!key) continue;
      if (!result[key]) result[key] = { games: 0, win: 0 };
      result[key].games++;
      if (won) result[key].win++;
    }
  }
  return result;
}

function buildBestGameData(
  stratzMatches: StratzMatch[],
  heroMap: Map<number, Hero>,
): BestGameData | null {
  if (stratzMatches.length === 0) return null;
  const sorted = [...stratzMatches].sort(
    (a, b) => (b.players[0]?.kills ?? 0) - (a.players[0]?.kills ?? 0),
  );
  const best = sorted[0];
  const p = best.players[0];
  if (!p) return null;

  const hero = p.hero ? heroMap.get(p.hero.id) : null;
  const isWin = (best.didRadiantWin && p.isRadiant) || (!best.didRadiantWin && !p.isRadiant);
  const itemIds = [p.item0Id, p.item1Id, p.item2Id, p.item3Id, p.item4Id, p.item5Id];
  const items = itemIds.filter((id) => id !== 0);
  const isParsed = items.length > 0;

  return {
    matchId: best.id,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    lastHits: isParsed ? p.numLastHits : null,
    gpm: isParsed ? p.goldPerMinute : null,
    heroId: p.hero?.id ?? 0,
    heroCleanName: p.hero?.shortName ?? (hero?.name.replace("npc_dota_hero_", "") ?? ""),
    heroName: hero?.localized_name ?? (p.hero ? `Hero ${p.hero.id}` : "Unknown"),
    duration: fmtDuration(best.durationSeconds),
    isWin,
    isParsed,
    items: isParsed ? items : [],
    benchmarks: null,
  };
}

function buildBestHeroMatchData(
  stratzMatches: StratzMatch[],
  heroesPerf: StratzHeroPerf[],
): BestHeroMatchData | null {
  if (stratzMatches.length === 0 || heroesPerf.length === 0) return null;

  const topHero = [...heroesPerf]
    .filter((p) => p.hero !== null)
    .sort((a, b) => (b.winCount + b.lossCount) - (a.winCount + a.lossCount))[0];
  if (!topHero?.hero) return null;

  const topHeroId = topHero.hero.id;
  const heroMatches = stratzMatches.filter((m) => m.players[0]?.hero?.id === topHeroId);
  if (heroMatches.length === 0) return null;

  const best = [...heroMatches].sort(
    (a, b) => (b.players[0]?.kills ?? 0) - (a.players[0]?.kills ?? 0),
  )[0];
  const p = best.players[0];
  if (!p) return null;

  const items = [
    p.item0Id ?? 0, p.item1Id ?? 0, p.item2Id ?? 0,
    p.item3Id ?? 0, p.item4Id ?? 0, p.item5Id ?? 0,
  ];
  const isParsed = items.some((id) => id !== 0);

  return {
    gpm: p.goldPerMinute ?? 0,
    lastHits: p.numLastHits ?? 0,
    xpm: p.experiencePerMinute ?? 0,
    netWorth: null,
    heroDamage: p.heroDamage ?? 0,
    isParsed,
    items,
  };
}

function buildQuizMatches(stratzMatches: StratzMatch[]): QuizMatch[] {
  const result: QuizMatch[] = [];
  for (const sm of stratzMatches) {
    if (result.length >= 5) break;
    const p = sm.players[0];
    if (!p?.hero) continue;
    const itemIds = [p.item0Id, p.item1Id, p.item2Id, p.item3Id, p.item4Id, p.item5Id];
    if (itemIds.every((id) => id === 0)) continue;
    result.push({
      matchId: sm.id,
      heroId: p.hero.id,
      items: itemIds,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      radiant_win: sm.didRadiantWin,
      player_slot: p.isRadiant ? 0 : 128,
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function fetchPlayerData(accountId: number): Promise<PlayerData> {
  const [playerResult, heroListResult, itemConstantsResult] = await Promise.allSettled([
    fetchGraphQL(accountId),
    fetchHeroList(),
    fetchItemConstants(),
  ]);

  const stratzPlayer =
    playerResult.status === "fulfilled" ? playerResult.value : null;
  const heroList =
    heroListResult.status === "fulfilled" ? heroListResult.value : [];
  const itemConstants =
    itemConstantsResult.status === "fulfilled" ? itemConstantsResult.value : {};

  if (!stratzPlayer) throw new Error("PRIVATE_PROFILE");

  const sa = stratzPlayer.steamAccount;
  if (sa.isAnonymous === true) throw new Error("PRIVATE_PROFILE");

  const player: PlayerProfile = {
    tracked_until: null,
    solo_competitive_rank: null,
    competitive_rank: null,
    rank_tier: sa.seasonRank ?? null,
    leaderboard_rank: sa.seasonLeaderboardRank ?? null,
    mmr_estimate: null,
    profile: {
      account_id: sa.id,
      personaname: sa.name ?? "",
      name: sa.name ?? "",
      plus: false,
      cheese: 0,
      steamid: String(sa.id),
      avatar: sa.avatar ?? "",
      avatarmedium: sa.avatar ?? "",
      avatarfull: sa.avatar ?? "",
      profileurl: "",
      last_login: null,
      loccountrycode: null,
      is_contributor: false,
      is_subscriber: false,
    },
  };

  const matches: Match[] = stratzPlayer.matches
    .map(mapMatch)
    .filter((m): m is Match => m !== null);

  const heroes = buildHeroStats(stratzPlayer.heroesPerformance);

  // item integer ID → short key (e.g. 1 → "blink")
  const idToKey = new Map<number, string>();
  for (const [key, item] of Object.entries(itemConstants)) {
    idToKey.set(item.id, key);
  }

  const heroMap = new Map<number, Hero>(heroList.map((h) => [h.id, h]));

  const playerTotals = buildPlayerTotals(matches);
  const playerItems = buildPlayerItems(stratzPlayer.matches, idToKey);
  const bestGameData = buildBestGameData(stratzPlayer.matches, heroMap);
  const bestHeroMatchDetails = buildBestHeroMatchData(
    stratzPlayer.matches,
    stratzPlayer.heroesPerformance,
  );
  const quizMatches = buildQuizMatches(stratzPlayer.matches);

  const wl = stratzPlayer.stats
    ? {
        win: stratzPlayer.stats.winCount,
        lose: stratzPlayer.stats.matchCount - stratzPlayer.stats.winCount,
      }
    : null;

  return {
    player,
    wl,
    wlYear: null,
    heroList: heroList.length > 0 ? heroList : null,
    heroes: heroes.length > 0 ? heroes : null,
    matches: matches.length > 0 ? matches : null,
    recentMatches: matches.length > 0 ? matches.slice(0, 20) : null,
    peers: null,
    quizMatches,
    itemConstants: Object.keys(itemConstants).length > 0 ? itemConstants : null,
    playerItems: Object.keys(playerItems).length > 0 ? playerItems : null,
    bestGameData,
    bestHeroMatchDetails,
    heroCareerMatches: null,
    playerTotals: playerTotals.length > 0 ? playerTotals : null,
    heroAbilities: null,
  };
}
