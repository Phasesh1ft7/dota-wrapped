import itemsData from './itemsConstants.json';

const idToName: Record<number, string> = {};
for (const [name, data] of Object.entries(itemsData as Record<string, { id: number }>)) {
  idToName[data.id] = name;
}

export function getItemName(id: number): string | null {
  return idToName[id] ?? null;
}

export const ITEM_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items';
