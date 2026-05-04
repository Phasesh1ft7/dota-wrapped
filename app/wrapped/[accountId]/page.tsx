import { Suspense } from "react";
import { fetchPlayerProfile, fetchPlayerMatches } from "@/lib/opendota";
import WrappedClient from "@/components/WrappedClient";
import WrappedSkeleton from "@/components/WrappedSkeleton";
import PrivateProfileError from "@/components/PrivateProfileError";

interface Props {
  params: Promise<{ accountId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { accountId } = await params;
  try {
    const profile = await fetchPlayerProfile(accountId);
    const name = profile.player?.profile?.personaname ?? "A Dota Player";
    return {
      title: `${name}'s 2026 Dota Wrapped`,
      description: `${name} played Dota 2 in 2026. See their stats, top heroes and more.`,
      openGraph: {
        title: `${name}'s 2026 Dota Wrapped`,
        description: `Check out ${name}'s 2026 Dota Wrapped — top heroes, hours played and more.`,
        url: `https://dotawrapped.gg/wrapped/${accountId}`,
      },
      twitter: {
        card: "summary",
        title: `${name}'s 2026 Dota Wrapped`,
        description: `Check out ${name}'s 2026 Dota Wrapped`,
      },
    };
  } catch {
    return {
      title: "Dota Wrapped 2026",
      description: "See your 2026 Dota 2 year in review",
    };
  }
}

export default async function WrappedPage({ params }: Props) {
  const { accountId } = await params;

  let profile;
  try {
    profile = await fetchPlayerProfile(accountId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";

    if (message === "PRIVATE_PROFILE") {
      return <PrivateProfileError />;
    }

    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#0d1117" }}
      >
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <h1 className="text-xl font-semibold text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-white/50">
            Could not load player data. Please try again later.
          </p>
          <a href="/" className="mt-2 text-sm text-blue-400 hover:underline">
            ← Back
          </a>
        </div>
      </main>
    );
  }

  const matchesPromise = fetchPlayerMatches(accountId);

  return (
    <Suspense fallback={<WrappedSkeleton />}>
      <WrappedClient profile={profile} matchesPromise={matchesPromise} />
    </Suspense>
  );
}
