export interface GuildRecipe {
  id: string;
  name: string;
  resultItemId: string;
  zenyCost: number;
  materials: Array<{ itemId: string; amount: number }>;
}

export interface GuildMission {
  id: string;
  title: string;
  monsterId: string;
  requiredKills: number;
  zenyReward: number;
  itemReward?: { itemId: string; amount: number };
}

export const GUILD_SHOP = [
  { itemId: 'pot_red', price: 55 },
  { itemId: 'pot_orange', price: 180 },
  { itemId: 'pot_yellow', price: 420 },
  { itemId: 'pot_blue', price: 600 },
  { itemId: 'sword_blade', price: 900 },
  { itemId: 'shield_guard', price: 750 }
];

export const GUILD_RECIPES: GuildRecipe[] = [
  {
    id: 'forge_saber',
    name: 'Forjar Sabre de Cavaleiro',
    resultItemId: 'sword_saber',
    zenyCost: 4500,
    materials: [
      { itemId: 'etc_jellopy', amount: 40 },
      { itemId: 'etc_fluff', amount: 25 },
      { itemId: 'etc_orc_voucher', amount: 10 }
    ]
  },
  {
    id: 'forge_chain',
    name: 'Montar Cota de Malha',
    resultItemId: 'armor_chain_mail',
    zenyCost: 6000,
    materials: [
      { itemId: 'etc_skel_bone', amount: 35 },
      { itemId: 'etc_rotten_bandage', amount: 20 },
      { itemId: 'etc_jellopy', amount: 25 }
    ]
  },
  {
    id: 'forge_buckler',
    name: 'Montar Broquel Reforçado',
    resultItemId: 'shield_buckler',
    zenyCost: 2800,
    materials: [
      { itemId: 'etc_jellopy', amount: 30 },
      { itemId: 'etc_clover', amount: 15 }
    ]
  }
];

export const GUILD_MISSIONS: GuildMission[] = [
  { id: 'hunt_poring', title: 'Controle de Porings', monsterId: 'poring', requiredKills: 20, zenyReward: 2000, itemReward: { itemId: 'pot_red', amount: 10 } },
  { id: 'hunt_skeleton', title: 'Limpeza da Caverna', monsterId: 'skeleton', requiredKills: 15, zenyReward: 5000, itemReward: { itemId: 'shield_buckler', amount: 1 } },
  { id: 'hunt_orc', title: 'Ameaça Orc', monsterId: 'orc_warrior', requiredKills: 12, zenyReward: 8000, itemReward: { itemId: 'pot_yellow', amount: 8 } }
];
