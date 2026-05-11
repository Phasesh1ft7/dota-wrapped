import { fetchHeroRelicMatches } from "@/lib/opendota";
import { deriveRelics } from "@/lib/transforms";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const heroId = parseInt(searchParams.get("heroId") ?? "0");
  const heroName = searchParams.get("heroName") ?? "";

  if (!accountId || !heroId) {
    return Response.json({ relics: [], parsedCount: 0 });
  }

  const { aggregated, parsedCount } = await fetchHeroRelicMatches(accountId, heroId, 5).catch(() => ({
    aggregated: { ability_uses: {} as Record<string, number>, damage_inflictor: {} as Record<string, number> },
    parsedCount: 0,
  }));

  const relics = deriveRelics(heroName, aggregated.ability_uses, aggregated.damage_inflictor);

  return Response.json({ relics, parsedCount });
}
