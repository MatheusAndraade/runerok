import { ItemData } from '../types/game';

export const ITEMS: Record<string, ItemData> = {
  // --- ARMAS: ESPADAS (1 MÃO) ---
  'sword_blade': {
    id: 'sword_blade',
    name: 'Lâmina (Blade)',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 50,
    price: 300,
    atkBonus: 25,
    slots: 3,
    reqLevel: 1,
    description: 'Uma espada de ferro básica de uma mão.',
    icon: '🗡️'
  },
  'sword_rapier': {
    id: 'sword_rapier',
    name: 'Rapiéra',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 40,
    price: 1200,
    atkBonus: 40,
    slots: 2,
    reqLevel: 10,
    description: 'Uma espada perfurante fina e flexível.',
    icon: '🗡️'
  },
  'sword_scimitar': {
    id: 'sword_scimitar',
    name: 'Cimitarra',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 70,
    price: 3500,
    atkBonus: 60,
    slots: 2,
    reqLevel: 18,
    description: 'Lâmina curva popular entre os viajantes do deserto.',
    icon: '🗡️'
  },
  'sword_saber': {
    id: 'sword_saber',
    name: 'Sabre',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 100,
    price: 15000,
    atkBonus: 115,
    slots: 3,
    reqLevel: 30,
    description: 'Espada de cavalaria resistente favorita dos cavaleiros.',
    icon: '⚔️'
  },
  'sword_tsurugi': {
    id: 'sword_tsurugi',
    name: 'Tsurugi',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 120,
    price: 38000,
    atkBonus: 130,
    slots: 2,
    reqLevel: 45,
    description: 'Uma espada pesada de dois gumes com excelente equilíbrio.',
    icon: '⚔️'
  },
  'sword_flamberge': {
    id: 'sword_flamberge',
    name: 'Flamberge',
    type: 'weapon',
    weaponType: 'sword',
    slot: 'weapon',
    weight: 150,
    price: 85000,
    atkBonus: 150,
    slots: 2,
    reqLevel: 60,
    description: 'Espada de lâmina ondulada projetada para cortes devastadores.',
    icon: '⚔️'
  },

  // --- ARMAS: ESPADAS DE DUAS MÃOS ---
  '2hsword_katana': {
    id: '2hsword_katana',
    name: 'Katana',
    type: 'weapon',
    weaponType: 'twoHandSword',
    slot: 'weapon',
    weight: 100,
    price: 2000,
    atkBonus: 60,
    slots: 3,
    reqLevel: 10,
    description: 'Lâmina longa e curva de duas mãos do oriente.',
    icon: '⚔️'
  },
  '2hsword_bastard': {
    id: '2hsword_bastard',
    name: 'Espada Bastarda',
    type: 'weapon',
    weaponType: 'twoHandSword',
    slot: 'weapon',
    weight: 160,
    price: 18000,
    atkBonus: 115,
    slots: 2,
    reqLevel: 30,
    description: 'Espada longa feita para poderosos golpes com as duas mãos.',
    icon: '⚔️'
  },
  '2hsword_claymore': {
    id: '2hsword_claymore',
    name: 'Claymore',
    type: 'weapon',
    weaponType: 'twoHandSword',
    slot: 'weapon',
    weight: 220,
    price: 74000,
    atkBonus: 180,
    slots: 2,
    reqLevel: 55,
    description: 'Uma montante gigante ideal para Cavaleiros de AGI.',
    icon: '⚔️'
  },

  // --- ARMAS: LANÇAS ---
  'spear_pike': {
    id: 'spear_pike',
    name: 'Pique',
    type: 'weapon',
    weaponType: 'spear',
    slot: 'weapon',
    weight: 100,
    price: 3400,
    atkBonus: 60,
    slots: 4,
    reqLevel: 15,
    description: 'Uma lança longa. Possui 4 slots excepcionais para cartas!',
    icon: '🔱'
  },
  'spear_lance': {
    id: 'spear_lance',
    name: 'Lança de Cavalaria',
    type: 'weapon',
    weaponType: 'spear',
    slot: 'weapon',
    weight: 250,
    price: 60000,
    atkBonus: 185,
    slots: 0,
    reqLevel: 50,
    description: 'Lança pesada de torneio feita para a habilidade Perfurar.',
    icon: '🔱'
  },
  'spear_halberd': {
    id: 'spear_halberd',
    name: 'Alabarda',
    type: 'weapon',
    weaponType: 'twoHandSpear',
    slot: 'weapon',
    weight: 250,
    price: 88000,
    atkBonus: 165,
    slots: 2,
    reqLevel: 65,
    description: 'Uma arma de haste combinando lança e machado de guerra.',
    icon: '🔱'
  },

  // --- ESCUDOS ---
  'shield_guard': {
    id: 'shield_guard',
    name: 'Vanguarda (Guard)',
    type: 'armor',
    slot: 'shield',
    weight: 30,
    price: 500,
    defBonus: 3,
    slots: 1,
    reqLevel: 1,
    description: 'Um escudo leve e redondo para iniciantes.',
    icon: '🛡️'
  },
  'shield_buckler': {
    id: 'shield_buckler',
    name: 'Broquel (Buckler)',
    type: 'armor',
    slot: 'shield',
    weight: 60,
    price: 14000,
    defBonus: 4,
    slots: 1,
    reqLevel: 25,
    description: 'Um escudo metálico firme para deflexão de ataques.',
    icon: '🛡️'
  },
  'shield_shield': {
    id: 'shield_shield',
    name: 'Escudo Real',
    type: 'armor',
    slot: 'shield',
    weight: 130,
    price: 50000,
    defBonus: 6,
    slots: 1,
    reqLevel: 50,
    description: 'Um escudo pesado de cavaleiro garantindo proteção máxima.',
    icon: '🛡️'
  },

  // --- ARMADURAS ---
  'armor_adventure_suit': {
    id: 'armor_adventure_suit',
    name: 'Traje de Aventureiro',
    type: 'armor',
    slot: 'armor',
    weight: 30,
    price: 1000,
    defBonus: 2,
    slots: 1,
    reqLevel: 1,
    description: 'Roupa básica de viagem feita com tecido resistente.',
    icon: '🥼'
  },
  'armor_chain_mail': {
    id: 'armor_chain_mail',
    name: 'Cota de Malha',
    type: 'armor',
    slot: 'armor',
    weight: 330,
    price: 28000,
    defBonus: 8,
    slots: 1,
    reqLevel: 25,
    description: 'Anéis de metal entrelaçados flexíveis e seguros.',
    icon: '🦺'
  },
  'armor_full_plate': {
    id: 'armor_full_plate',
    name: 'Armadura Completa',
    type: 'armor',
    slot: 'armor',
    weight: 450,
    price: 80000,
    defBonus: 10,
    slots: 1,
    reqLevel: 50,
    description: 'Armadura de placas pesadas usada por Cavaleiros de elite.',
    icon: '🛡️'
  },

  // --- CAPACETES ---
  'head_cap': {
    id: 'head_cap',
    name: 'Quepe',
    type: 'headgear',
    slot: 'headTop',
    weight: 10,
    price: 500,
    defBonus: 1,
    slots: 1,
    reqLevel: 1,
    description: 'Um simples boné de tecido.',
    icon: '🧢'
  },
  'head_helm': {
    id: 'head_helm',
    name: 'Elmo de Aço',
    type: 'headgear',
    slot: 'headTop',
    weight: 60,
    price: 32000,
    defBonus: 6,
    slots: 0,
    reqLevel: 30,
    description: 'Um elmo de aço fechado protegendo toda a cabeça.',
    icon: '🪖'
  },
  'head_bone_helm': {
    id: 'head_bone_helm',
    name: 'Elmo de Osso',
    type: 'headgear',
    slot: 'headTop',
    weight: 80,
    price: 120000,
    defBonus: 7,
    slots: 1,
    reqLevel: 60,
    description: 'Um capacete aterrorizante esculpido em ossos antigos.',
    icon: '💀'
  },

  // --- CAPA E SAPATOS ---
  'garment_manteau': {
    id: 'garment_manteau',
    name: 'Sobrepeliz (Manteau)',
    type: 'garment',
    slot: 'garment',
    weight: 50,
    price: 32000,
    defBonus: 4,
    slots: 1,
    reqLevel: 25,
    description: 'Manto espesso de lã contra ventos e lâminas.',
    icon: '🧥'
  },
  'shoes_boots': {
    id: 'shoes_boots',
    name: 'Botas',
    type: 'shoes',
    slot: 'shoes',
    weight: 60,
    price: 18000,
    defBonus: 4,
    slots: 1,
    reqLevel: 20,
    description: 'Botas duráveis de couro reforçado.',
    icon: '🥾'
  },

  // --- ACESSÓRIOS ---
  'acc_clip': {
    id: 'acc_clip',
    name: 'Presilha (Clip)',
    type: 'accessory',
    slot: 'accessory1',
    weight: 5,
    price: 30000,
    defBonus: 0,
    slots: 1,
    reqLevel: 10,
    description: 'Acessório decorativo com 1 slot para carta.',
    icon: '💍'
  },
  'acc_ring': {
    id: 'acc_ring',
    name: 'Anel de Ouro',
    type: 'accessory',
    slot: 'accessory1',
    weight: 10,
    price: 50000,
    defBonus: 0,
    slots: 1,
    reqLevel: 45,
    description: 'Anel reluzente que aumenta o vigor físico.',
    icon: '💍'
  },

  // --- CONSUMÍVEIS ---
  'pot_red': {
    id: 'pot_red',
    name: 'Poção Vermelha',
    type: 'consumable',
    weight: 7,
    price: 50,
    description: 'Restaura aproximadamente 45 de HP.',
    icon: '🧪',
    color: '#ef4444',
    consumableEffect: { hpHeal: 45 }
  },
  'pot_orange': {
    id: 'pot_orange',
    name: 'Poção Laranja',
    type: 'consumable',
    weight: 10,
    price: 200,
    description: 'Restaura aproximadamente 105 de HP.',
    icon: '🧪',
    color: '#f97316',
    consumableEffect: { hpHeal: 105 }
  },
  'pot_yellow': {
    id: 'pot_yellow',
    name: 'Poção Amarela',
    type: 'consumable',
    weight: 13,
    price: 550,
    description: 'Restaura aproximadamente 175 de HP.',
    icon: '🧪',
    color: '#eab308',
    consumableEffect: { hpHeal: 175 }
  },
  'pot_white': {
    id: 'pot_white',
    name: 'Poção Branca',
    type: 'consumable',
    weight: 15,
    price: 1200,
    description: 'Restaura aproximadamente 325 de HP.',
    icon: '🧪',
    color: '#f8fafc',
    consumableEffect: { hpHeal: 325 }
  },
  'pot_blue': {
    id: 'pot_blue',
    name: 'Poção Azul',
    type: 'consumable',
    weight: 15,
    price: 3000,
    description: 'Restaura aproximadamente 60 de SP.',
    icon: '🧪',
    color: '#3b82f6',
    consumableEffect: { spHeal: 60 }
  },

  // --- ITENS DE DROP (LOOT) ---
  'etc_jellopy': {
    id: 'etc_jellopy',
    name: 'Jellopy',
    type: 'etc',
    weight: 1,
    price: 6,
    description: 'Pedaço gelatinoso deixado por Porings.',
    icon: '💧'
  },
  'etc_fluff': {
    id: 'etc_fluff',
    name: 'Pluma',
    type: 'etc',
    weight: 1,
    price: 8,
    description: 'Pelugem macia coletada de Fabres.',
    icon: '🪶'
  },
  'etc_clover': {
    id: 'etc_clover',
    name: 'Trevo de 4 Folhas',
    type: 'etc',
    weight: 1,
    price: 12,
    description: 'Um trevo perfumado adorado por Lunáticos.',
    icon: '☘️'
  },
  'etc_apple': {
    id: 'etc_apple',
    name: 'Maçã',
    type: 'etc',
    weight: 2,
    price: 15,
    description: 'Uma maçã vermelha apetitosa.',
    icon: '🍎'
  },
  'etc_zombie_brain': {
    id: 'etc_zombie_brain',
    name: 'Garra Apodrecida',
    type: 'etc',
    weight: 1,
    price: 110,
    description: 'Unha decomposta retirada de um Zumbi.',
    icon: '🦴'
  },
  'etc_skel_bone': {
    id: 'etc_skel_bone',
    name: 'Osso Limpo',
    type: 'etc',
    weight: 1,
    price: 190,
    description: 'Um osso esbranquiçado de Esqueleto.',
    icon: '🦴'
  },
  'etc_orc_voucher': {
    id: 'etc_orc_voucher',
    name: 'Insígnia Orc',
    type: 'etc',
    weight: 1,
    price: 380,
    description: 'Emblema de guerra que prova a vitória contra um Guerreiro Orc.',
    icon: '📜'
  },
  'etc_rotten_bandage': {
    id: 'etc_rotten_bandage',
    name: 'Atadura Podre',
    type: 'etc',
    weight: 1,
    price: 450,
    description: 'Faixas milenares retiradas das Múmias.',
    icon: '🩹'
  },

  // --- CARTAS ---
  'card_poring': {
    id: 'card_poring',
    name: 'Carta Poring',
    type: 'card',
    weight: 1,
    price: 10000,
    description: 'SOR +2, Esquiva Perfeita +1.',
    icon: '🃏',
    cardEffect: {
      statBonus: { luk: 2 },
      description: 'SOR +2, Esquiva Perfeita +1'
    }
  },
  'card_skeleton_worker': {
    id: 'card_skeleton_worker',
    name: 'Carta Esqueleto Operário',
    type: 'card',
    weight: 1,
    price: 500000,
    description: 'ATQ +15, Dano em Médios +15%.',
    icon: '🃏',
    cardEffect: {
      atkBonus: 15,
      description: 'ATQ +15, +15% Dano vs Médio'
    }
  },
  'card_minorous': {
    id: 'card_minorous',
    name: 'Carta Minorous',
    type: 'card',
    weight: 1,
    price: 750000,
    description: 'ATQ +15, Dano em Grandes +15%.',
    icon: '🃏',
    cardEffect: {
      atkBonus: 15,
      description: 'ATQ +15, +15% Dano vs Grande'
    }
  },
  'card_raydric': {
    id: 'card_raydric',
    name: 'Carta Raydric',
    type: 'card',
    weight: 1,
    price: 1200000,
    description: 'Resistência Neutra +20%, DEF +5.',
    icon: '🃏',
    cardEffect: {
      defBonus: 5,
      description: 'DEF +5, +20% Resistência Neutra'
    }
  }
};
