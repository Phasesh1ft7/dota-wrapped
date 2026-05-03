import { describe, it, expect } from "vitest";
import { getStreaks } from "./transforms";
import type { Match } from "./opendota";

// Minimal match factory — only the fields getStreaks cares about.
function makeMatch(
  radiant_win: boolean,
  player_slot: number,
  overrides: Partial<Match> = {},
): Match {
  return {
    match_id: Math.floor(Math.random() * 1e9),
    player_slot,
    radiant_win,
    duration: 1800,
    game_mode: 22,
    lobby_type: 7,
    hero_id: 1,
    start_time: 1_700_000_000,
    version: null,
    kills: 5,
    deaths: 3,
    assists: 8,
    skill: null,
    average_rank: null,
    xp_per_min: 500,
    gold_per_min: 500,
    hero_damage: 10000,
    tower_damage: 500,
    hero_healing: 0,
    last_hits: 100,
    lane: null,
    lane_role: null,
    is_roaming: null,
    cluster: 111,
    leaver_status: 0,
    party_size: null,
    ...overrides,
  };
}

// Helpers: radiant win (slot 0) and radiant loss (slot 0)
const W = () => makeMatch(true, 0);  // radiant_win=true, slot < 128 → win
const L = () => makeMatch(false, 0); // radiant_win=false, slot < 128 → loss

describe("getStreaks", () => {
  it("returns all zeros for an empty match list", () => {
    expect(getStreaks([])).toEqual({
      bestWinStreak: 0,
      bestLoseStreak: 0,
      currentStreak: 0,
    });
  });

  it("pure win streak", () => {
    // newest-first: 5 consecutive wins
    const matches = [W(), W(), W(), W(), W()];
    expect(getStreaks(matches)).toEqual({
      bestWinStreak: 5,
      bestLoseStreak: 0,
      currentStreak: 5,
    });
  });

  it("pure loss streak", () => {
    const matches = [L(), L(), L()];
    expect(getStreaks(matches)).toEqual({
      bestWinStreak: 0,
      bestLoseStreak: 3,
      currentStreak: -3,
    });
  });

  it("mixed sequence — best streaks and current streak are tracked independently", () => {
    // newest-first: W W L W L L L
    // bestWin=2, bestLose=3, currentStreak=+2 (first two are wins)
    const matches = [W(), W(), L(), W(), L(), L(), L()];
    expect(getStreaks(matches)).toEqual({
      bestWinStreak: 2,
      bestLoseStreak: 3,
      currentStreak: 2,
    });
  });

  it("current streak is negative when the most recent games are losses", () => {
    // newest-first: L L W W W W
    // bestWin=4, bestLose=2, currentStreak=-2
    const matches = [L(), L(), W(), W(), W(), W()];
    expect(getStreaks(matches)).toEqual({
      bestWinStreak: 4,
      bestLoseStreak: 2,
      currentStreak: -2,
    });
  });

  it("single win", () => {
    expect(getStreaks([W()])).toEqual({
      bestWinStreak: 1,
      bestLoseStreak: 0,
      currentStreak: 1,
    });
  });

  it("single loss", () => {
    expect(getStreaks([L()])).toEqual({
      bestWinStreak: 0,
      bestLoseStreak: 1,
      currentStreak: -1,
    });
  });
});
