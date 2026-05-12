import type { Metadata } from "next";
import { fetchPlayerProfile, fetchPlayerMatches } from "@/lib/opendota";
import type { PlayerData, ProfileData, MatchesData } from "@/lib/opendota";
import { getCached, setCached, playerCacheKey } from "@/lib/cache";
import WrappedClient from "@/components/WrappedClient";
import PrivateProfileError from "@/components/PrivateProfileError";

function decodeRank(rankTier: number): string {
  const medals = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
  const medal = Math.floor(rankTier / 10);
  const stars = rankTier % 10;
  if (medal === 8) return "Immortal";
  if (medal >= 1 && medal <= 7) return stars > 0 ? `${medals[medal - 1]} ${stars}` : medals[medal - 1];
  return "Unranked";
}

interface Props {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ refresh?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { accountId } = await params;

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let playerName = "Dota Player";
  let heroName = "Unknown";
  let heroCleanName = "";
  let rank = "Unranked";
  let winRate = "0";
  let careerGames = "0";

  try {
    const cached = await getCached<PlayerData>(playerCacheKey(accountId));

    if (cached) {
      playerName = cached.player?.profile?.personaname ?? "Dota Player";

      // Top hero by all-time games
      const topHeroStats = cached.heroes
        ? [...cached.heroes].sort((a, b) => b.games - a.games)[0]
        : null;
      if (topHeroStats && cached.heroList) {
        const heroId = Number(topHeroStats.hero_id);
        const heroData = cached.heroList.find((h) => h.id === heroId);
        if (heroData) {
          heroName = heroData.localized_name;
          heroCleanName = heroData.name.replace("npc_dota_hero_", "");
        }
      }

      if (cached.player?.rank_tier) rank = decodeRank(cached.player.rank_tier);

      if (cached.wl) {
        const total = cached.wl.win + cached.wl.lose;
        careerGames = String(total);
        winRate = total > 0 ? ((cached.wl.win / total) * 100).toFixed(1) : "0";
      }
    } else {
      // Cache miss — fall back to profile-only fetch (fast path, no match data)
      const profile = await fetchPlayerProfile(accountId);
      playerName = profile.player?.profile?.personaname ?? "Dota Player";
      if (profile.player?.rank_tier) rank = decodeRank(profile.player.rank_tier);
    }
  } catch {
    // return defaults below
  }

  const ogParams = new URLSearchParams({
    playerName,
    heroName,
    heroCleanName,
    rank,
    winRate,
    careerGames,
  });
  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;
  const description = `${rank} • ${careerGames} games • ${winRate}% win rate • Top hero: ${heroName}`;

  return {
    title: `${playerName}'s 2026 Dota Wrapped`,
    description,
    openGraph: {
      title: `${playerName}'s 2026 Dota Wrapped`,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${playerName}'s Dota Wrapped stats` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${playerName}'s 2026 Dota Wrapped`,
      description,
      images: [ogImageUrl],
    },
  };
}

function ErrorScreen({
  avatar,
  name,
  type,
  accountId,
}: {
  avatar: string | null;
  name: string | null;
  type: "timeout" | "hidden";
  accountId: string;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#000000" }}
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {(avatar || name) && (
          <div className="flex flex-col items-center gap-2 mb-2">
            {avatar && (
              <img
                src={avatar}
                alt={name ?? "Player"}
                style={{ width: 64, height: 64, borderRadius: "50%" }}
              />
            )}
            {name && (
              <p style={{ color: "white", fontWeight: 600, fontSize: 15, margin: 0 }}>{name}</p>
            )}
          </div>
        )}
        {type === "timeout" ? (
          <>
            <p style={{ fontSize: 48, margin: 0 }}>⏱️</p>
            <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0 }}>Couldn&apos;t Load Data</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              The data provider is taking too long to respond. Try again in a moment.
            </p>
            <a
              href={`/wrapped/${accountId}`}
              style={{ marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "underline" }}
            >
              ↻ Try again
            </a>
          </>
        ) : (
          <>
            <p style={{ fontSize: 48, margin: 0 }}>🔒</p>
            <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0 }}>Match History Hidden</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              This player&apos;s match history is set to private in Steam. Ask them to set Game Details to Public in Steam Privacy Settings.
            </p>
            <a
              href="/"
              style={{ marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "underline" }}
            >
              ← Search another player
            </a>
          </>
        )}
      </div>
    </main>
  );
}

function computeHeroRelicsConfig(
  accountId: string,
  profile: ProfileData,
  matchesData: MatchesData,
) {
  const heroYearCounts: Record<number, number> = {};
  for (const m of matchesData.matches ?? []) {
    heroYearCounts[m.hero_id] = (heroYearCounts[m.hero_id] ?? 0) + 1;
  }
  const topYearEntry = Object.entries(heroYearCounts)
    .filter(([id]) => Number(id) > 0)
    .sort(([, a], [, b]) => b - a)[0];
  const topHeroId = topYearEntry ? Number(topYearEntry[0]) : -1;
  const fallbackHeroId =
    topHeroId > 0
      ? topHeroId
      : matchesData.heroes?.[0]
        ? Number(matchesData.heroes[0].hero_id)
        : (matchesData.heroCareerMatches?.[0]?.hero_id ?? -1);
  return fallbackHeroId > 0 ? { accountId, heroId: fallbackHeroId } : null;
}

export default async function WrappedPage({ params, searchParams }: Props) {
  const { accountId } = await params;
  const sp = await searchParams;
  const forceRefresh = sp?.refresh === "1";
  const cacheKey = playerCacheKey(accountId);

  // --- Cache hit path ---
  if (!forceRefresh) {
    const cached = await getCached<PlayerData>(cacheKey);
    if (cached) {
      const profile: ProfileData = cached;
      const matchesData: MatchesData = cached;
      const heroRelicsConfig = computeHeroRelicsConfig(accountId, profile, matchesData);
      return (
        <WrappedClient
          profile={profile}
          matchesPromise={Promise.resolve(matchesData)}
          heroRelicsConfig={heroRelicsConfig}
        />
      );
    }
  }

  // Step 1: fetch profile + matches in parallel
  const [profileResult, matchesResult] = await Promise.allSettled([
    fetchPlayerProfile(accountId),
    fetchPlayerMatches(accountId),
  ]);

  if (profileResult.status === "rejected") {
    if (profileResult.reason instanceof Error && profileResult.reason.message === "PRIVATE_PROFILE") {
      return <PrivateProfileError />;
    }
    return <ErrorScreen avatar={null} name={null} type="timeout" accountId={accountId} />;
  }

  const profile = profileResult.value;
  const avatar = profile.player?.profile?.avatarfull ?? null;
  const name = profile.player?.profile?.personaname ?? null;

  // Step 2: yearMatches null → timeout
  if (matchesResult.status === "rejected" || matchesResult.value.matches === null) {
    return <ErrorScreen avatar={avatar} name={name} type="timeout" accountId={accountId} />;
  }

  const matchesData = matchesResult.value;
  // Step 3: yearMatches empty → hidden
  if (matchesData.matches!.length === 0) {
    return <ErrorScreen avatar={avatar} name={name} type="hidden" accountId={accountId} />;
  }

  // Step 4: cache successful fetch, compute hero relics config, render
  const playerData: PlayerData = { ...profile, ...matchesData };
  await setCached(cacheKey, playerData);

  const heroRelicsConfig = computeHeroRelicsConfig(accountId, profile, matchesData);

  // Step 5: render WrappedClient
  return <WrappedClient profile={profile} matchesPromise={Promise.resolve(matchesData)} heroRelicsConfig={heroRelicsConfig} />;
}
