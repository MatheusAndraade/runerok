export type StatType = 'str' | 'agi' | 'vit' | 'int' | 'dex' | 'luk';

export interface CharacterStats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

export interface DerivedStats {
  maxHp: number;
  maxSp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  crit: number;
  aspd: number;
  moveSpeed: number; // pixels per sec
  attackRange: number; // pixels
  weight: number;
  weightLimit: number;
  hpRegen: number;
  spRegen: number;
}

export type PlayerState = 
  | 'IDLE' 
  | 'SEARCHING' 
  | 'MOVING' 
  | 'CHASE' 
  | 'ATTACKING' 
  | 'CASTING' 
  | 'LOOTING' 
  | 'RECOVERING' 
  | 'DEAD' 
  | 'RESPAWNING';

export interface Position {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export type MonsterBehavior = 'PASSIVE' | 'AGGRESSIVE' | 'ASSISTIVE';
export type ElementType = 'Neutral' | 'Water' | 'Earth' | 'Fire' | 'Wind' | 'Poison' | 'Holy' | 'Shadow' | 'Ghost' | 'Undead' | 'Água' | 'Terra' | 'Neutro' | 'Maldito' | 'Fogo' | 'Sombrio' | 'Vento' | 'Sagrado' | 'Veneno';
export type SizeType = 'Small' | 'Medium' | 'Large' | 'Pequeno' | 'Médio' | 'Grande';

export interface MonsterDrop {
  itemId: string;
  chance: number; // 0 to 1
}

export interface MonsterData {
  id: string;
  name: string;
  level: number;
  hp: number;
  atk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  aspd: number; // attacks per sec
  element: ElementType;
  race: string;
  size: SizeType;
  baseExp: number;
  lootTable: MonsterDrop[];
  behavior: MonsterBehavior;
  moveSpeed: number;
  attackRange: number;
  spawnWeight: number;
  isMvp?: boolean;
}

export interface ActiveMonster {
  instanceId: string;
  data: MonsterData;
  x: number;
  y: number;
  currentHp: number;
  state: 'IDLE' | 'MOVING' | 'CHASE' | 'ATTACKING' | 'DEAD';
  targetX?: number;
  targetY?: number;
  path?: Position[];
  lastAttackTime: number;
  attackAnimationProgress: number;
  animFrame: number;
  direction: 'left' | 'right' | 'up' | 'down';
  wanderTimer?: number;
  hitFlash?: number;
}

export interface DroppedItemInstance {
  instanceId: string;
  itemId: string;
  x: number;
  y: number;
  amount: number;
  spawnTime: number;
}

export type EquipmentSlot = 
  | 'headTop' 
  | 'headMid' 
  | 'headLow' 
  | 'armor' 
  | 'weapon' 
  | 'shield' 
  | 'garment' 
  | 'shoes' 
  | 'accessory1' 
  | 'accessory2';

export type ItemType = 'weapon' | 'armor' | 'headgear' | 'garment' | 'shoes' | 'accessory' | 'consumable' | 'etc' | 'card';

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  slot?: EquipmentSlot;
  weight: number;
  price: number;
  description: string;
  icon: string;
  color?: string;
  weaponType?: 'sword' | 'twoHandSword' | 'spear' | 'twoHandSpear';
  atkBonus?: number;
  defBonus?: number;
  matkBonus?: number;
  slots?: number; // number of card sockets
  reqLevel?: number;
  cardEffect?: {
    statBonus?: Partial<CharacterStats>;
    atkBonus?: number;
    defBonus?: number;
    critBonus?: number;
    description: string;
  };
  consumableEffect?: {
    hpHeal?: number;
    spHeal?: number;
  };
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  refineLevel: number;
  cards: string[]; // itemIds of equipped cards
  amount: number;
  isEquipped?: boolean;
  equippedSlot?: EquipmentSlot;
}

export interface SkillRule {
  id: string;
  skillId: string;
  condition: 'ALWAYS' | 'ENEMIES_GTE_2' | 'ENEMIES_GTE_3' | 'TARGET_LARGE' | 'HP_BELOW_50' | 'SP_GTE_30';
  priority: number;
  enabled: boolean;
}

export interface SkillData {
  id: string;
  name: string;
  spCost: number;
  cooldown: number; // in seconds
  description: string;
  icon: string;
  minLevel: number;
  type: 'ACTIVE' | 'BUFF' | 'PASSIVE';
}

export interface MapData {
  id: string;
  name: string;
  recommendedLevel: string;
  width: number;
  height: number;
  bgm: string;
  theme: 'grass' | 'cave' | 'desert' | 'dungeon' | 'gothic';
  monsterSpawns: Array<{
    monsterId: string;
    count: number;
  }>;
  obstacles: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'tree' | 'rock' | 'water' | 'wall' | 'building' | 'cliff';
  }>;
}

export interface AutoPotionSettings {
  useHpPotion: boolean;
  hpThresholdPercent: number; // e.g. 40%
  hpPotionId: string;
  useSpPotion: boolean;
  spThresholdPercent: number; // e.g. 20%
  spPotionId: string;
}

export interface AutoLootSettings {
  lootAll: boolean;
  equipmentOnly: boolean;
  cardsAlways: boolean;
  consumables: boolean;
  etcItems: boolean;
  autoSellEtc: boolean;
}

export interface SaveData {
  version: number;
  saveId: string;
  saveName: string;
  createdAt: number;
  lastPlayedAt: number;
  playtimeSeconds: number;

  character: {
    name: string;
    className: 'Knight';
    baseLevel: number;
    baseExp: number;
    currentHp: number;
    currentSp: number;
    stats: CharacterStats;
    statPoints: number;
    zeny: number;
  };

  equipment: Record<EquipmentSlot, InventoryItem | null>;
  inventory: InventoryItem[];
  currentMapId: string;

  skillRules: SkillRule[];
  autoPotionSettings: AutoPotionSettings;
  autoLootSettings: AutoLootSettings;

  monsterKills: Record<string, number>;
  itemsDiscovered: string[];
  cardsDiscovered: string[];

  statistics: {
    totalMonstersKilled: number;
    totalDeaths: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalPotionsUsed: number;
    totalZenyEarned: number;
    totalCardsDropped: number;
    highestDamage: number;
    mvpKills: number;
  };
}

export type ActiveWindow = 
  | 'none' 
  | 'attributes' 
  | 'equipment' 
  | 'inventory' 
  | 'worldMap' 
  | 'skills' 
  | 'monsters' 
  | 'cards' 
  | 'refine' 
  | 'saveManager' 
  | 'settings' 
  | 'devMode';

export interface OfflineReport {
  timeOfflineSeconds: number;
  baseExpGained: number;
  jobExpGained: number;
  zenyGained: number;
  monstersKilled: number;
  itemsLooted: Record<string, number>;
  cardsDropped: string[];
}

export interface CombatFloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  createdAt: number;
}

export interface AttackParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}
