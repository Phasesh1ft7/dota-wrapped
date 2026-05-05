import type { Metadata } from "next";
import { fetchPlayerData } from "@/lib/stratz";
import WrappedClientFetch from "./WrappedClientFetch";

interface Props {
  params: Promise<{ accountId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { accountId } = await params;
  try {
    const data = await fetchPlayerData(parseInt(accountId, 10));
    const name = data.player?.profile?.personaname ?? "A Dota Player";
    const avatar = data.player?.profile?.avatarfull ?? null;
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

export default async function WrappedPage({ params }: Props) {
  const { accountId } = await params;
  return <WrappedClientFetch accountId={accountId} />;
}
