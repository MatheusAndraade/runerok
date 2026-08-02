import { MapData } from '../types/game';

export const MAPS: Record<string, MapData> = {
  'prt_fild01': {
    id: 'prt_fild01',
    name: 'Campos de Prontera 01 (Planície Ocidental)',
    recommendedLevel: 'Nv. 1 - 10',
    width: 800,
    height: 600,
    bgm: 'prontera',
    theme: 'grass',
    monsterSpawns: [
      { monsterId: 'poring', count: 8 },
      { monsterId: 'fabre', count: 6 },
      { monsterId: 'lunatic', count: 5 },
      { monsterId: 'pupa', count: 3 }
    ],
    obstacles: [
      { x: 100, y: 100, w: 60, h: 60, type: 'tree' },
      { x: 650, y: 150, w: 80, h: 80, type: 'tree' },
      { x: 350, y: 400, w: 100, h: 50, type: 'rock' },
      { x: 200, y: 280, w: 50, h: 50, type: 'tree' }
    ]
  },
  'prt_fild04': {
    id: 'prt_fild04',
    name: 'Campos de Prontera 04 (Floresta Sul)',
    recommendedLevel: 'Nv. 10 - 20',
    width: 800,
    height: 600,
    bgm: 'prontera',
    theme: 'grass',
    monsterSpawns: [
      { monsterId: 'rocker', count: 7 },
      { monsterId: 'spore', count: 6 },
      { monsterId: 'poporing', count: 5 },
      { monsterId: 'lunatic', count: 3 }
    ],
    obstacles: [
      { x: 150, y: 200, w: 70, h: 70, type: 'tree' },
      { x: 500, y: 100, w: 90, h: 60, type: 'tree' },
      { x: 400, y: 350, w: 80, h: 80, type: 'rock' }
    ]
  },
  'pay_dun00': {
    id: 'pay_dun00',
    name: 'Caverna de Payon 1F',
    recommendedLevel: 'Nv. 20 - 32',
    width: 800,
    height: 600,
    bgm: 'payon_cave',
    theme: 'cave',
    monsterSpawns: [
      { monsterId: 'zombie', count: 8 },
      { monsterId: 'skeleton', count: 7 },
      { monsterId: 'jiboia', count: 5 },
      { monsterId: 'spore', count: 3 }
    ],
    obstacles: [
      { x: 200, y: 100, w: 120, h: 80, type: 'wall' },
      { x: 500, y: 300, w: 100, h: 100, type: 'wall' },
      { x: 150, y: 400, w: 90, h: 70, type: 'rock' }
    ]
  },
  'moc_fild07': {
    id: 'moc_fild07',
    name: 'Deserto de Sograt 07',
    recommendedLevel: 'Nv. 32 - 45',
    width: 800,
    height: 600,
    bgm: 'morroc',
    theme: 'desert',
    monsterSpawns: [
      { monsterId: 'pecopeco', count: 8 },
      { monsterId: 'metaller', count: 7 },
      { monsterId: 'soldier_skeleton', count: 5 }
    ],
    obstacles: [
      { x: 250, y: 150, w: 100, h: 80, type: 'rock' },
      { x: 480, y: 320, w: 110, h: 90, type: 'rock' }
    ]
  },
  'orc_dun01': {
    id: 'orc_dun01',
    name: 'Vila dos Orcs (Calabouço 1F)',
    recommendedLevel: 'Nv. 45 - 58',
    width: 800,
    height: 600,
    bgm: 'geffen',
    theme: 'dungeon',
    monsterSpawns: [
      { monsterId: 'orc_warrior', count: 8 },
      { monsterId: 'high_orc', count: 6 },
      { monsterId: 'zenorc', count: 6 }
    ],
    obstacles: [
      { x: 250, y: 200, w: 100, h: 100, type: 'wall' },
      { x: 550, y: 150, w: 80, h: 120, type: 'wall' }
    ]
  },
  'cmd_fild02': {
    id: 'cmd_fild02',
    name: 'Praia de Comodo',
    recommendedLevel: 'Nv. 58 - 72',
    width: 800,
    height: 600,
    bgm: 'prontera',
    theme: 'grass',
    monsterSpawns: [
      { monsterId: 'anolian', count: 8 },
      { monsterId: 'minorous', count: 6 },
      { monsterId: 'mummy', count: 5 }
    ],
    obstacles: [
      { x: 200, y: 180, w: 90, h: 90, type: 'rock' },
      { x: 500, y: 300, w: 120, h: 80, type: 'tree' }
    ]
  },
  'c_tower1': {
    id: 'c_tower1',
    name: 'Torre do Relógio 1F',
    recommendedLevel: 'Nv. 72 - 84',
    width: 800,
    height: 600,
    bgm: 'geffen',
    theme: 'gothic',
    monsterSpawns: [
      { monsterId: 'clock', count: 8 },
      { monsterId: 'alarm', count: 7 },
      { monsterId: 'minorous', count: 4 }
    ],
    obstacles: [
      { x: 300, y: 250, w: 150, h: 80, type: 'building' }
    ]
  },
  'gl_prison': {
    id: 'gl_prison',
    name: 'Prisão de Glast Heim',
    recommendedLevel: 'Nv. 84 - 92',
    width: 800,
    height: 600,
    bgm: 'glastheim',
    theme: 'gothic',
    monsterSpawns: [
      { monsterId: 'raydric', count: 9 },
      { monsterId: 'injustice', count: 7 },
      { monsterId: 'clock', count: 4 }
    ],
    obstacles: [
      { x: 200, y: 200, w: 120, h: 120, type: 'wall' },
      { x: 500, y: 350, w: 100, h: 100, type: 'wall' }
    ]
  },
  'ra_san01': {
    id: 'ra_san01',
    name: 'Santuário do Vulcão (Santuário Final)',
    recommendedLevel: 'Nv. 92 - 99 (Chefe)',
    width: 800,
    height: 600,
    bgm: 'glastheim',
    theme: 'dungeon',
    monsterSpawns: [
      { monsterId: 'golem_lava', count: 8 },
      { monsterId: 'raydric', count: 7 },
      { monsterId: 'injustice', count: 4 },
      { monsterId: 'doppelganger', count: 1 }
    ],
    obstacles: [
      { x: 180, y: 180, w: 110, h: 110, type: 'wall' },
      { x: 520, y: 320, w: 110, h: 110, type: 'wall' }
    ]
  }
};
