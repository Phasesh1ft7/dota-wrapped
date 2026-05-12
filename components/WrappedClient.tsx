"use client";

import { use, useEffect, useRef } from "react";
import type { ProfileData, MatchesData } from "@/lib/opendota";
import { requestMatchParse } from "@/lib/opendota";
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
  computePlaystyle,
} from "@/lib/transforms";
import type { RankInfo } from "@/lib/transforms";
import WrappedGrid from "@/components/WrappedGrid";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 40 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random(),
      };
    });

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += canvas!.width;
        else if (p.x > canvas!.width) p.x -= canvas!.width;
        if (p.y < 0) p.y += canvas!.height;
        else if (p.y > canvas!.height) p.y -= canvas!.height;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          if (dx * dx + dy * dy < 6400) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = 'rgba(200,168,75,0.15)';
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(200,168,75,0.25)';
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

interface Props {
  profile: ProfileData;
  matchesPromise: Promise<MatchesData>;
  heroRelicsConfig: { accountId: string; heroId: number } | null;
}

export default function WrappedClient({ profile, matchesPromise, heroRelicsConfig }: Props) {
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

  const playstyle = computePlaystyle(heroStats);

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
  const wlYear = profile.wlYear;
  const totalYearGames = wlYear ? wlYear.win + wlYear.lose : undefined;
  const yearInNumbers = getYearInNumbers(matches, heroList, totalYearGames);
  const signatureMoves = getSignatureMoves(
    matches,
    playerHeroes,
    heroList,
    matchesData.playerItems ?? null,
    matchesData.itemConstants ?? null,
    matchesData.heroCareerMatches ?? null,
  );
  const bestHeroGame = signatureMoves.bestHeroGame;
  if (bestHeroGame) {
    const rawMatch = matches.find((m) => m.match_id === bestHeroGame.matchId);
    if ((rawMatch?.gold_per_min ?? 0) === 0) {
      requestMatchParse(bestHeroGame.matchId);
    }
  }
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
    <>
      <ParticleCanvas />
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
        heroAbilities={matchesData.heroAbilities ?? null}
        heroRelicsConfig={heroRelicsConfig}
        playstyle={playstyle}
      />
    </>
  );
}
