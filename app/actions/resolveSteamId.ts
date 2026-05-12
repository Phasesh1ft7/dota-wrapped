'use server';

export type ResolveResult =
  | { accountId: string; error?: never }
  | { error: string; accountId?: never };

export async function resolveSteamId(
  _prev: ResolveResult | null,
  formData: FormData
): Promise<ResolveResult> {
  const raw = (formData.get('steamInput') as string | null)?.trim() ?? '';
  if (!raw) return { error: 'Enter a Steam ID or profile URL.' };

  const stripped = raw
    .replace(/https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, '')
    .replace(/\/$/, '')
    .trim();

  if (/^\d{17}$/.test(stripped) && stripped.startsWith('765611')) {
    const accountId = String(BigInt(stripped) - BigInt('76561197960265728'));
    return { accountId };
  }

  if (/^\d{8,9}$/.test(stripped)) return { accountId: stripped };

  if (/^[a-zA-Z0-9_-]+$/.test(stripped)) {
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) return { error: 'Steam API key not configured.' };
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(stripped)}`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();
      if (data?.response?.success === 1) {
        const accountId = String(BigInt(data.response.steamid) - BigInt('76561197960265728'));
        return { accountId };
      } else {
        return { error: 'Steam profile not found. Check the URL or ID and try again.' };
      }
    } catch {
      return { error: 'Could not reach Steam. Try again in a moment.' };
    }
  }

  return { error: 'Invalid input — enter a Steam ID, Steam64 ID or profile URL.' };
}
