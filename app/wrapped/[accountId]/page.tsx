import type { Metadata } from "next";
import { fetchPlayerProfile, fetchPlayerMatches } from "@/lib/opendota";
import WrappedClient from "@/components/WrappedClient";
import PrivateProfileError from "@/components/PrivateProfileError";

interface Props {
  params: Promise<{ accountId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { accountId } = await params;
  try {
    const profile = await fetchPlayerProfile(accountId);
    const name = profile.player?.profile?.personaname ?? "A Dota Player";
    const avatar = profile.player?.profile?.avatarfull ?? null;
    return {
      title: `${name}'s 2026 Dota Wrapped`,
      description: `${name} played Dota 2 in 2026. See their stats, top heroes and more.`,
      openGraph: {
        type: "website",
        title: `${name}'s 2026 Dota Wrapped`,
        description: `Check out ${name}'s 2026 Dota Wrapped — top heroes, hours played and more.`,
        url: `https://dotawrapped.gg/wrapped/${accountId}`,
        ...(avatar
          ? { images: [{ url: avatar, width: 184, height: 184, alt: `${name}'s Steam avatar` }] }
          : {}),
      },
      twitter: {
        card: "summary",
        title: `${name}'s 2026 Dota Wrapped`,
        description: `Check out ${name}'s 2026 Dota Wrapped`,
        ...(avatar ? { images: [avatar] } : {}),
      },
    };
  } catch {
    return {
      title: "Dota Wrapped 2026",
      description: "See your 2026 Dota 2 year in review",
    };
  }
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

export default async function WrappedPage({ params }: Props) {
  const { accountId } = await params;

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

  // Step 4: compute top hero and fetch hero relics if supported.
  // Must use year-filtered matches (same as getYearInNumbers) so the hero matches the portrait in Card4MatchupB.
  const heroMap = new Map((profile.heroList ?? []).map((h) => [h.id, h]));
  const heroYearCounts: Record<number, number> = {};
  for (const m of matchesData.matches ?? []) {
    heroYearCounts[m.hero_id] = (heroYearCounts[m.hero_id] ?? 0) + 1;
  }
  const topYearEntry = Object.entries(heroYearCounts).filter(([id]) => Number(id) > 0).sort(([, a], [, b]) => b - a)[0];
  const topHeroId = topYearEntry ? Number(topYearEntry[0]) : -1;

  // Fall back to all-time top hero when year matches yield no valid hero
  const fallbackHeroId = topHeroId > 0
    ? topHeroId
    : (matchesData.heroes?.[0] ? Number(matchesData.heroes[0].hero_id) : (matchesData.heroCareerMatches?.[0]?.hero_id ?? -1));

  console.log('[heroRelicsConfig] accountId:', accountId);
  console.log('[heroRelicsConfig] fallbackHeroId:', fallbackHeroId);
  console.log('[heroRelicsConfig] topHeroId:', topHeroId);
  console.log('[heroRelicsConfig] matchesData.heroes[0]:', JSON.stringify(matchesData.heroes?.[0]));
  console.log('[heroRelicsConfig] heroCareerMatches[0]:', JSON.stringify(matchesData.heroCareerMatches?.[0]));

  const mostPlayedHeroCleanName = fallbackHeroId > 0
    ? (heroMap.get(fallbackHeroId)?.name.replace("npc_dota_hero_", "") ?? "")
    : "";

  const heroRelicsConfig = fallbackHeroId > 0 ? { accountId, heroId: fallbackHeroId } : null;

  // Step 5: render WrappedClient
  return <WrappedClient profile={profile} matchesPromise={Promise.resolve(matchesData)} heroRelicsConfig={heroRelicsConfig} />;
}
