"use client";

import type { PlayerData } from "@/lib/opendota";
import { getHeroStats } from "@/lib/transforms";
import HeroCard from "@/components/cards/HeroCard";

interface Props {
  data: PlayerData;
}

export default function WrappedClient({ data }: Props) {
  const heroStats = getHeroStats(
    data.heroes ?? [],
    data.heroList ?? [],
  );
  const topHero = heroStats[0];

  const heroInternalName = topHero
    ? (data.heroList?.find((h) => h.id === topHero.hero_id)?.name ?? "")
        .replace("npc_dota_hero_", "")
    : "";

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ backgroundColor: "#0d1117" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Player header */}
        {data.player && (
          <div className="flex items-center gap-3">
            <img
              src={data.player.profile.avatarmedium}
              alt={data.player.profile.personaname}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                {data.player.profile.personaname}
              </p>
              <p className="text-xs text-white/40">Dota Wrapped</p>
            </div>
          </div>
        )}

        {/* Hero card */}
        {topHero && heroInternalName ? (
          <HeroCard
            heroName={topHero.heroName}
            heroInternalName={heroInternalName}
            games={topHero.games}
            winRate={topHero.winRate}
          />
        ) : (
          <p className="text-sm text-white/40">No match data available.</p>
        )}
      </div>
    </main>
  );
}
