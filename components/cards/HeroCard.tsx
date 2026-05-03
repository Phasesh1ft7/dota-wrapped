"use client";

interface HeroCardProps {
  heroName: string;
  heroInternalName: string;
  games: number;
  winRate: string;
}

export default function HeroCard({
  heroName,
  heroInternalName,
  games,
  winRate,
}: HeroCardProps) {
  const portraitUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroInternalName}.png`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl flex flex-col justify-end p-6"
      style={{
        backgroundColor: "#161b22",
        border: "1px solid #30363d",
        minHeight: 260,
      }}
    >
      {/* Full-bleed hero portrait at 30% opacity */}
      <img
        src={portraitUrl}
        alt={heroName}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.3 }}
      />

      {/* Gradient overlay so text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(13,17,23,0.95) 30%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Most Played Hero
        </p>

        <h2 className="text-2xl font-bold text-white leading-tight">
          {heroName}
        </h2>

        <div className="flex gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-3xl font-black text-white leading-none">
              {games}
            </span>
            <span className="text-xs text-white/50">Games</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span
              className="text-3xl font-black leading-none"
              style={{ color: parseFloat(winRate) >= 50 ? "#3fb950" : "#f85149" }}
            >
              {winRate}%
            </span>
            <span className="text-xs text-white/50">Win Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
