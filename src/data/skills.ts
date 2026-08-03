import { SkillData } from '../types/game';

export const SKILLS: Record<string, SkillData> = {
  'bowling_bash': {
    id: 'bowling_bash',
    name: 'Impacto Tático (Bowling Bash)',
    spCost: 22,
    cooldown: 3.5,
    description: 'Ataque devastador em área que empurra o alvo contra inimigos próximos causando 400% de dano físico.',
    icon: '💥',
    minLevel: 10,
    type: 'ACTIVE'
    ,baseMultiplier: 1.8, multiplierPerLevel: 0.18, spCostPerLevel: 1, areaRadius: 105, maxTargets: 5
  },
  'pierce': {
    id: 'pierce',
    name: 'Perfurar (Pierce)',
    spCost: 9,
    cooldown: 1.5,
    description: 'Estocada de lança rápida atingindo 1x/2x/3x vezes dependendo do tamanho do alvo (Pequeno/Médio/Grande).',
    icon: '🔱',
    minLevel: 5,
    type: 'ACTIVE'
    ,baseMultiplier: 1.35, multiplierPerLevel: 0.12, spCostPerLevel: 1
  },
  'brandish_spear': {
    id: 'brandish_spear',
    name: 'Lança Avassaladora (Brandish)',
    spCost: 12,
    cooldown: 2.5,
    description: 'Gira a lança em um arco amplo causando 300% de dano físico em todos os alvos ao redor.',
    icon: '🌪️',
    minLevel: 8,
    type: 'ACTIVE'
    ,baseMultiplier: 1.55, multiplierPerLevel: 0.16, spCostPerLevel: 1, areaRadius: 130, maxTargets: 8
  },
  'bash': {
    id: 'bash',
    name: 'Golpe Avassalador (Bash)',
    spCost: 8,
    cooldown: 1.0,
    description: 'Ataque pesado com espada direcionado a um único alvo causando 250% de dano físico.',
    icon: '⚔️',
    minLevel: 1,
    type: 'ACTIVE'
    ,baseMultiplier: 1.35, multiplierPerLevel: 0.11, spCostPerLevel: 1
  },
  'two_hand_quicken': {
    id: 'two_hand_quicken',
    name: 'Rapidez com Duas Mãos',
    spCost: 28,
    cooldown: 30.0,
    description: 'Aumenta a Velocidade de Ataque (ASPD) em +30% ao equipar Espadas de Duas Mãos por 60s.',
    icon: '⚡',
    minLevel: 1,
    type: 'BUFF'
    ,spCostPerLevel: 1, buffDuration: 45, buffAspdPercent: 15
  },
  'peco_peco_ride': {
    id: 'peco_peco_ride',
    name: 'Montaria Peco Peco',
    spCost: 0,
    cooldown: 0,
    description: 'Monta um Peco Peco real aumentando a Velocidade de Movimento em +25% e dano de lanças.',
    icon: '🐥',
    minLevel: 1,
    type: 'PASSIVE'
  }
};
