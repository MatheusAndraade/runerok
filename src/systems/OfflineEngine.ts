import { SaveData } from '../types/game';
import { MAPS } from '../data/maps';
import { MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { CombatCalculator } from '../combat/CombatCalculator';

export interface OfflineResult {
  elapsedSeconds: number;
  expGained: number;
  zenyEarned: number;
  monstersKilled: number;
  itemsLooted: Array<{ name: string; icon: string; count: number }>;
  cardsLooted: Array<{ name: string; icon: string }>;
  levelsGained: number;
  deaths: number;
}

export class OfflineEngine {
  public static simulateOffline(saveData: SaveData): OfflineResult | null {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - saveData.lastPlayedAt) / 1000);

    // If away for less than 30 seconds, no offline report needed
    if (elapsedSeconds < 30) return null;

    // Cap offline progress to 24 hours (86400 seconds)
    const cappedSeconds = Math.min(86400, elapsedSeconds);

    const map = MAPS[saveData.currentMapId] || MAPS['prt_fild01'];
    const availableMonsters = map.monsterSpawns
      .map(s => MONSTERS[s.monsterId])
      .filter(Boolean);

    if (availableMonsters.length === 0) return null;

    // Calculate player stats
    const derivedStats = CombatCalculator.calculateDerivedStats(
      saveData.character.baseLevel,
      { ...saveData.character.stats },
      saveData.equipment
    );

    const playerDps = derivedStats.atk * derivedStats.aspd;

    // Average monster stats
    let totalHp = 0;
    let totalExp = 0;
    let totalAtk = 0;
    availableMonsters.forEach(m => {
      totalHp += m.hp;
      totalExp += m.baseExp;
      totalAtk += m.atk;
    });

    const avgHp = totalHp / availableMonsters.length;
    const avgExp = totalExp / availableMonsters.length;
    const avgAtk = totalAtk / availableMonsters.length;

    // Time to kill per monster (sec) + 2.5s travel/search
    const ttk = Math.max(1.0, (avgHp / Math.max(10, playerDps - 5))) + 2.5;
    const killsPerSec = 1 / ttk;

    const totalMonstersKilled = Math.floor(killsPerSec * cappedSeconds);

    const totalExpGained = Math.floor(totalMonstersKilled * avgExp);
    let totalZenyEarned = Math.floor(totalMonstersKilled * 15);

    // Check drops
    const lootedMap: Record<string, number> = {};
    const cardsLooted: Array<{ name: string; icon: string }> = [];

    for (let i = 0; i < Math.min(10000, totalMonstersKilled); i++) {
      const randomMonster = availableMonsters[i % availableMonsters.length];
      randomMonster.lootTable.forEach(drop => {
        if (Math.random() <= drop.chance) {
          const itemData = ITEMS[drop.itemId];
          if (itemData) {
            if (itemData.type === 'card') {
              cardsLooted.push({ name: itemData.name, icon: itemData.icon });
              saveData.cardsDiscovered.push(itemData.id);
            } else if (saveData.autoLootSettings.autoSellEtc && itemData.type === 'etc') {
              totalZenyEarned += itemData.price;
            } else {
              lootedMap[itemData.name] = (lootedMap[itemData.name] || 0) + 1;
            }
          }
        }
      });
    }

    // Apply gains to saveData
    saveData.character.baseExp += totalExpGained;
    saveData.character.zeny += totalZenyEarned;
    saveData.statistics.totalMonstersKilled += totalMonstersKilled;
    saveData.statistics.totalZenyEarned += totalZenyEarned;

    // Convert looted items into inventory
    Object.keys(lootedMap).forEach(itemName => {
      const itemData = Object.values(ITEMS).find(it => it.name === itemName);
      if (itemData) {
        const existing = saveData.inventory.find(inv => inv.itemId === itemData.id);
        if (existing) {
          existing.amount += lootedMap[itemName];
        } else {
          saveData.inventory.push({
            instanceId: `off_${Date.now()}_${Math.random()}`,
            itemId: itemData.id,
            refineLevel: 0,
            cards: [],
            amount: lootedMap[itemName]
          });
        }
      }
    });

    const itemsLootedSummary = Object.keys(lootedMap).slice(0, 8).map(name => {
      const itemData = Object.values(ITEMS).find(it => it.name === name);
      return {
        name,
        icon: itemData?.icon || '📦',
        count: lootedMap[name]
      };
    });

    return {
      elapsedSeconds,
      expGained: totalExpGained,
      zenyEarned: totalZenyEarned,
      monstersKilled: totalMonstersKilled,
      itemsLooted: itemsLootedSummary,
      cardsLooted,
      levelsGained: 0,
      deaths: 0
    };
  }

  public static processOfflineTime(saveData: SaveData, forcedSeconds?: number): { updatedSave: SaveData; report: any } {
    const copy = JSON.parse(JSON.stringify(saveData)) as SaveData;
    if (forcedSeconds) {
      copy.lastPlayedAt = Date.now() - (forcedSeconds * 1000);
    }
    const result = OfflineEngine.simulateOffline(copy);

    const itemsSummary: Record<string, number> = {};
    if (result) {
      result.itemsLooted.forEach(i => {
        itemsSummary[i.name] = i.count;
      });
    }

    const report = {
      timeOfflineSeconds: result?.elapsedSeconds || forcedSeconds || 0,
      baseExpGained: result?.expGained || 0,
      jobExpGained: Math.floor((result?.expGained || 0) * 0.8),
      zenyGained: result?.zenyEarned || 0,
      monstersKilled: result?.monstersKilled || 0,
      itemsLooted: itemsSummary,
      cardsDropped: result?.cardsLooted.map(c => c.name) || []
    };

    return { updatedSave: copy, report };
  }
}
