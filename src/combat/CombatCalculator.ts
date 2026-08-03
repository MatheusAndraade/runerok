import { CharacterStats, DerivedStats, InventoryItem, EquipmentSlot } from '../types/game';
import { ITEMS } from '../data/items';

export class CombatCalculator {
  static calculateDerivedStats(
    baseLevel: number,
    stats: CharacterStats,
    equippedItems: Record<EquipmentSlot, InventoryItem | null>
  ): DerivedStats {
    stats = { ...stats };
    let equipAtk = 0;
    let equipDef = 0;
    let equipMatk = 0;
    let weaponType: string | undefined;
    let totalWeight = 0;

    // Sum up equipment bonuses & cards
    (Object.keys(equippedItems) as EquipmentSlot[]).forEach(slot => {
      const item = equippedItems[slot];
      if (!item) return;

      const itemData = ITEMS[item.itemId];
      if (!itemData) return;

      totalWeight += itemData.weight;

      if (itemData.atkBonus) equipAtk += itemData.atkBonus + item.refineLevel * 7;
      if (itemData.defBonus) equipDef += itemData.defBonus + item.refineLevel * 2;
      if (itemData.matkBonus) equipMatk += itemData.matkBonus;
      equipAtk += item.bonusStats?.atk || 0;
      equipDef += item.bonusStats?.def || 0;
      equipMatk += item.bonusStats?.matk || 0;
      if (item.bonusStats?.stats) {
        (Object.keys(item.bonusStats.stats) as Array<keyof CharacterStats>).forEach(stat => {
          stats[stat] += item.bonusStats?.stats?.[stat] || 0;
        });
      }
      if (itemData.weaponType) weaponType = itemData.weaponType;

      // Cards bonuses
      item.cards.forEach(cardId => {
        const cardItem = ITEMS[cardId];
        if (cardItem?.cardEffect) {
          if (cardItem.cardEffect.atkBonus) equipAtk += cardItem.cardEffect.atkBonus;
          if (cardItem.cardEffect.defBonus) equipDef += cardItem.cardEffect.defBonus;
          if (cardItem.cardEffect.statBonus) {
            if (cardItem.cardEffect.statBonus.str) stats.str += cardItem.cardEffect.statBonus.str;
            if (cardItem.cardEffect.statBonus.luk) stats.luk += cardItem.cardEffect.statBonus.luk;
          }
        }
      });
    });

    // Base Formulas
    const rarityHp = Object.values(equippedItems).reduce((sum, item) => sum + (item?.bonusStats?.maxHp || 0), 0);
    const maxHp = Math.floor(100 + baseLevel * 45 + stats.vit * 22 + (baseLevel * stats.vit * 0.8) + rarityHp);
    const maxSp = Math.floor(20 + baseLevel * 8 + stats.int * 6);

    const baseAtk = Math.floor(stats.str + (stats.str / 10) ** 2 + stats.dex / 5 + stats.luk / 5);
    const totalAtk = Math.floor((baseAtk + equipAtk) * (1 + Math.min(99, baseLevel) * 0.003));

    const baseMatk = Math.floor(stats.int + (stats.int / 8) ** 2);
    const totalMatk = baseMatk + equipMatk;

    const softDef = Math.floor(stats.vit * 0.8);
    const totalDef = equipDef + softDef;
    const totalMdef = Math.floor(stats.int + (stats.int / 4));

    const hit = 175 + baseLevel + stats.dex;
    const flee = 100 + baseLevel + stats.agi;
    const crit = Math.min(100, Math.floor(1 + stats.luk * 0.3));

    // ASPD formula based on weapon type and AGI
    let baseWeaponAspd = 145; // 1H sword
    if (weaponType === 'twoHandSword') baseWeaponAspd = 140;
    if (weaponType === 'spear' || weaponType === 'twoHandSpear') baseWeaponAspd = 135;

    const aspdVal = Math.min(190, baseWeaponAspd + (stats.agi * 0.36) + (stats.dex * 0.1));
    // Convert ASPD value to attacks per second: 50 / (200 - ASPD)
    const attacksPerSec = Math.max(0.5, Number((50 / (200 - aspdVal)).toFixed(2)));

    // Attack Range
    let range = 54; // visual melee spacing between complete sprites
    if (weaponType === 'spear' || weaponType === 'twoHandSpear') range = 70;

    const weightLimit = 2000 + (stats.str * 30);
    const moveSpeed = Math.floor(80 + (stats.agi * 0.2)); // pixels/sec

    const hpRegen = Math.floor(1 + stats.vit / 5 + maxHp / 200);
    const spRegen = Math.floor(1 + stats.int / 6 + maxSp / 100);

    return {
      maxHp,
      maxSp,
      atk: totalAtk,
      matk: totalMatk,
      def: totalDef,
      mdef: totalMdef,
      hit,
      flee,
      crit,
      aspd: attacksPerSec,
      moveSpeed,
      attackRange: range,
      weight: totalWeight,
      weightLimit,
      hpRegen,
      spRegen
    };
  }

  static calculatePhysicalDamage(
    attackerAtk: number,
    attackerHit: number,
    attackerCrit: number,
    defenderDef: number,
    defenderFlee: number,
    skillMultiplier: number = 1.0,
    isTargetLarge: boolean = false
  ): { damage: number; isCrit: boolean; isMiss: boolean } {
    // Hit Chance calculation
    const hitRate = Math.min(100, Math.max(5, attackerHit - defenderFlee + 80));
    const rollHit = Math.random() * 100;

    if (rollHit > hitRate) {
      return { damage: 0, isCrit: false, isMiss: true };
    }

    // Crit check
    const rollCrit = Math.random() * 100;
    if (rollCrit <= attackerCrit) {
      // Critical ignores defense!
      const critDmg = Math.floor(attackerAtk * 1.4 * skillMultiplier);
      return { damage: Math.max(1, critDmg), isCrit: true, isMiss: false };
    }

    // Normal damage with Defense reduction formula: Damage * (4000 + Def) / (4000 + Def * 10)
    const defReduction = (4000 + defenderDef) / (4000 + defenderDef * 10);
    let rawDamage = Math.floor(attackerAtk * skillMultiplier * defReduction);

    // Variance +/- 10%
    const variance = (Math.random() * 0.2) - 0.1;
    rawDamage = Math.floor(rawDamage * (1 + variance));

    return { damage: Math.max(1, rawDamage), isCrit: false, isMiss: false };
  }

  static calculateStats(saveData: any): DerivedStats {
    return CombatCalculator.calculateDerivedStats(
      saveData.character.baseLevel,
      saveData.character.stats,
      saveData.equipment
    );
  }
}
