import { ItemBonusStats, ItemData, ItemRarity } from '../types/game';

export const RARITIES: Record<ItemRarity, { label: string; color: string; multiplier: number }> = {
  COMMON: { label: 'Comum', color: '#64748b', multiplier: 1 },
  UNCOMMON: { label: 'Incomum', color: '#16a34a', multiplier: 1.18 },
  RARE: { label: 'Raro', color: '#2563eb', multiplier: 1.42 },
  EPIC: { label: 'Épico', color: '#9333ea', multiplier: 1.78 },
  LEGENDARY: { label: 'Lendário', color: '#d97706', multiplier: 2.25 }
};

export function rollItemRarity(elite = false): ItemRarity {
  const roll = Math.random() - (elite ? 0.12 : 0);
  if (roll < 0.012) return 'LEGENDARY';
  if (roll < 0.055) return 'EPIC';
  if (roll < 0.17) return 'RARE';
  if (roll < 0.43) return 'UNCOMMON';
  return 'COMMON';
}

export function createRarityBonuses(item: ItemData, rarity: ItemRarity): ItemBonusStats | undefined {
  const tier = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'].indexOf(rarity);
  if (tier <= 0) return undefined;
  const bonus: ItemBonusStats = {};
  if (item.atkBonus || item.type === 'weapon') bonus.atk = Math.max(1, Math.round((item.atkBonus || 8) * tier * 0.09));
  if (item.defBonus || ['armor', 'headgear', 'garment', 'shoes'].includes(item.type)) bonus.def = Math.max(1, Math.round((item.defBonus || 5) * tier * 0.1));
  if (tier >= 2) bonus.maxHp = 15 * tier;
  if (tier >= 3) bonus.stats = { str: tier - 1, vit: tier - 2 };
  return bonus;
}

export function rarityValueMultiplier(rarity: ItemRarity = 'COMMON') {
  return RARITIES[rarity].multiplier;
}
