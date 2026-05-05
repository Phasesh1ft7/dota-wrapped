"use client";

import { useEffect, useState } from "react";
import { fetchPlayerData } from "@/lib/stratz";
import type { PlayerData } from "@/lib/opendota";
import WrappedClient from "@/components/WrappedClient";
import WrappedSkeleton from "@/components/WrappedSkeleton";
import PrivateProfileError from "@/components/PrivateProfileError";

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

export default function WrappedClientFetch({ accountId }: { accountId: string }) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerData(parseInt(accountId, 10))
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "UNKNOWN_ERROR"))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) return <WrappedSkeleton />;

  if (error === "PRIVATE_PROFILE") return <PrivateProfileError />;

  if (error || !data) {
    return <ErrorScreen avatar={null} name={null} type="timeout" accountId={accountId} />;
  }

  const avatar = data.player?.profile?.avatarfull ?? null;
  const name = data.player?.profile?.personaname ?? null;

  if (data.matches === null) {
    return <ErrorScreen avatar={avatar} name={name} type="timeout" accountId={accountId} />;
  }

  if (data.matches.length === 0) {
    return <ErrorScreen avatar={avatar} name={name} type="hidden" accountId={accountId} />;
  }

  return <WrappedClient profile={data} matchesPromise={Promise.resolve(data)} />;
}
