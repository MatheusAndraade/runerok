import { SaveData, CharacterStats } from '../types/game';
import { SKILLS } from '../data/skills';

const DB_NAME = 'RagnarokIdleDB';
const STORE_NAME = 'saves';
const DB_VERSION = 1;

export class SaveManager {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static normalizeSave(save: SaveData): SaveData {
    save.character.headStyle ??= 0;
    save.character.jobLevel ??= Math.max(1, Math.min(50, save.character.baseLevel));
    save.skillLevels ??= Object.fromEntries(Object.keys(SKILLS).map(id => [id, 1]));
    Object.keys(SKILLS).forEach(id => { save.skillLevels![id] ??= 1; });
    save.skillPoints ??= 0;
    [
      { id: 'auto_brandish', skillId: 'brandish_spear', condition: 'ENEMIES_GTE_3' as const, priority: 4, enabled: false },
      { id: 'auto_quicken', skillId: 'two_hand_quicken', condition: 'SP_GTE_30' as const, priority: 5, enabled: true }
    ].forEach(rule => { if (!save.skillRules.some(existing => existing.skillId === rule.skillId)) save.skillRules.push(rule); });
    save.claimedGuildMissions ??= [];
    save.inventory.forEach(item => { item.rarity ??= 'COMMON'; });
    Object.values(save.equipment).forEach(item => { if (item) item.rarity ??= 'COMMON'; });
    return save;
  }

  private static getDB(): Promise<IDBDatabase> {
    if (!SaveManager.dbPromise) {
      SaveManager.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'saveId' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return SaveManager.dbPromise;
  }

  public static async saveGame(data: SaveData): Promise<void> {
    try {
      const db = await SaveManager.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        data.lastPlayedAt = Date.now();
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Fallback saving to localStorage:', e);
      localStorage.setItem(`ro_save_${data.saveId}`, JSON.stringify(data));
    }
  }

  public static async getAllSaves(): Promise<SaveData[]> {
    try {
      const db = await SaveManager.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result || []).map((save: SaveData) => SaveManager.normalizeSave(save)));
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      const localKeys = Object.keys(localStorage).filter(k => k.startsWith('ro_save_'));
      const saves: SaveData[] = [];
      localKeys.forEach(k => {
        try {
          saves.push(SaveManager.normalizeSave(JSON.parse(localStorage.getItem(k)!)));
        } catch (_) {}
      });
      return saves;
    }
  }

  public static async deleteSave(saveId: string): Promise<void> {
    try {
      const db = await SaveManager.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(saveId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      localStorage.removeItem(`ro_save_${saveId}`);
    }
  }

  public static createDefaultSave(saveName: string, charName: string): SaveData {
    return {
      version: 1,
      saveId: `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      saveName: saveName || 'Knight Adventure',
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      playtimeSeconds: 0,

      character: {
        name: charName || 'Arthas',
        className: 'Knight',
        headStyle: 0,
        jobLevel: 1,
        baseLevel: 1,
        baseExp: 0,
        currentHp: 145,
        currentSp: 26,
        stats: {
          str: 9,
          agi: 9,
          vit: 9,
          int: 1,
          dex: 9,
          luk: 1
        },
        statPoints: 0,
        zeny: 1000
      },

      equipment: {
        headTop: null,
        headMid: null,
        headLow: null,
        armor: {
          instanceId: 'starter_armor',
          itemId: 'armor_adventure_suit',
          refineLevel: 0,
          cards: [],
          amount: 1,
          isEquipped: true,
          equippedSlot: 'armor'
        },
        weapon: {
          instanceId: 'starter_weapon',
          itemId: 'sword_blade',
          refineLevel: 0,
          cards: [],
          amount: 1,
          isEquipped: true,
          equippedSlot: 'weapon'
        },
        shield: null,
        garment: null,
        shoes: null,
        accessory1: null,
        accessory2: null
      },

      inventory: [
        {
          instanceId: 'pot_red_init',
          itemId: 'pot_red',
          refineLevel: 0,
          cards: [],
          amount: 25
        }
      ],

      currentMapId: 'prt_fild01',

      skillRules: [
        { id: '1', skillId: 'bowling_bash', condition: 'ENEMIES_GTE_3', priority: 1, enabled: true },
        { id: '2', skillId: 'pierce', condition: 'TARGET_LARGE', priority: 2, enabled: true },
        { id: '3', skillId: 'bash', condition: 'HP_BELOW_50', priority: 3, enabled: true },
        { id: '4', skillId: 'brandish_spear', condition: 'ENEMIES_GTE_3', priority: 4, enabled: false },
        { id: '5', skillId: 'two_hand_quicken', condition: 'SP_GTE_30', priority: 5, enabled: true }
      ],
      skillLevels: Object.fromEntries(Object.keys(SKILLS).map(id => [id, 1])),
      skillPoints: 0,

      hotbar: [
        { kind: 'skill', refId: 'bowling_bash' },
        { kind: 'skill', refId: 'pierce' },
        { kind: 'skill', refId: 'bash' },
        { kind: 'item', refId: 'pot_red' },
        null, null, null, null, null
      ],
      claimedGuildMissions: [],

      autoPotionSettings: {
        useHpPotion: true,
        hpThresholdPercent: 40,
        hpPotionId: 'pot_red',
        useSpPotion: true,
        spThresholdPercent: 20,
        spPotionId: 'pot_blue'
      },

      autoLootSettings: {
        lootAll: true,
        equipmentOnly: false,
        cardsAlways: true,
        consumables: true,
        etcItems: true,
        autoSellEtc: false
      },

      monsterKills: {},
      itemsDiscovered: ['armor_adventure_suit', 'sword_blade', 'pot_red'],
      cardsDiscovered: [],

      statistics: {
        totalMonstersKilled: 0,
        totalDeaths: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalPotionsUsed: 0,
        totalZenyEarned: 0,
        totalCardsDropped: 0,
        highestDamage: 0,
        mvpKills: 0
      }
    };
  }

  public static getInitialSave(): SaveData {
    return SaveManager.createDefaultSave('Knight Adventure', 'Arthas');
  }

  public static loadGame(slotId: string): SaveData | null {
    try {
      const raw = localStorage.getItem(`ro_save_${slotId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load save', e);
    }
    return null;
  }

  public static listSaveSlots(): Array<{ id: string; exists: boolean; level?: number; job?: string; lastSavedAt?: number }> {
    const slots = ['slot-1', 'slot-2', 'slot-3'];
    return slots.map(id => {
      const save = SaveManager.loadGame(id);
      if (save) {
        return {
          id,
          exists: true,
          level: save.character.baseLevel,
          job: save.character.className,
          lastSavedAt: save.lastPlayedAt
        };
      }
      return { id, exists: false };
    });
  }

  public static exportSaveToJSON(data: SaveData): string {
    return JSON.stringify(data, null, 2);
  }

  public static importSaveFromJSON(json: string): SaveData | null {
    try {
      const parsed = JSON.parse(json);
      if (parsed && parsed.character && parsed.equipment) {
        return parsed as SaveData;
      }
    } catch (e) {
      console.error('Failed to import JSON save', e);
    }
    return null;
  }

  public static exportSaveToFile(data: SaveData) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ro_idle_${data.character.name}_lv${data.character.baseLevel}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
