import React from 'react';
import { SaveData, DerivedStats, StatType } from '../../types/game';
import { getStatPointCost } from '../../data/expTable';
import { Shield, Plus, X } from 'lucide-react';

interface AttributesWindowProps {
  saveData: SaveData;
  derivedStats: DerivedStats;
  onUpdateStats?: (newStats: SaveData['character']['stats'], newPoints: number) => void;
  onAllocateStat?: (stat: StatType) => void;
  onClose: () => void;
}

export const AttributesWindow: React.FC<AttributesWindowProps> = ({
  saveData,
  derivedStats,
  onUpdateStats,
  onAllocateStat,
  onClose
}) => {
  const stats = saveData.character.stats;
  const pointsAvailable = saveData.character.statPoints;

  const handleIncreaseStat = (statName: StatType) => {
    if (onAllocateStat) {
      onAllocateStat(statName);
      return;
    }
    const cost = getStatPointCost(stats[statName]);
    if (pointsAvailable >= cost && onUpdateStats) {
      const updatedStats = { ...stats, [statName]: stats[statName] + 1 };
      onUpdateStats(updatedStats, pointsAvailable - cost);
    }
  };

  const statList: Array<{ key: StatType; label: string; desc: string }> = [
    { key: 'str', label: 'FOR (Força)', desc: 'Aumenta o Dano Físico (ATQ) e Capacidade de Carga' },
    { key: 'agi', label: 'AGI (Agilidade)', desc: 'Aumenta Velocidade de Ataque (ASPD) e Esquiva (FLEE)' },
    { key: 'vit', label: 'VIT (Vitalidade)', desc: 'Aumenta HP Máximo, Defesa Física e Regeneração' },
    { key: 'int', label: 'INT (Inteligência)', desc: 'Aumenta SP Máximo, Dano Mágico (MATQ) e Reg. SP' },
    { key: 'dex', label: 'DES (Destreza)', desc: 'Aumenta Precisão (HIT), ATQ Mínimo e ASPD' },
    { key: 'luk', label: 'SOR (Sorte)', desc: 'Aumenta Taxa Crítica (CRIT) e Esquiva Perfeita' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Atributos do Cavaleiro</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
          {/* Banner de Pontos */}
          <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-amber-300">Pontos de Atributos Disponíveis:</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono">{pointsAvailable}</span>
          </div>

          {/* Lista de Atributos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {statList.map(item => {
              const val = stats[item.key];
              const cost = getStatPointCost(val);
              const canAfford = pointsAvailable >= cost;

              return (
                <div key={item.key} className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs sm:text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-white">{val}</span>
                      <button
                        onClick={() => handleIncreaseStat(item.key)}
                        disabled={!canAfford}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md cursor-pointer active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{cost} pt</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Painel de Atributos Derivados */}
          <div className="bg-slate-950 border border-amber-900/40 rounded-lg p-3 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Status Derivados de Combate</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ATQ Físico</span>
                <strong className="text-amber-300">{derivedStats.atk}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Defesa (DEF)</span>
                <strong className="text-emerald-300">{derivedStats.def}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Precisão (HIT)</span>
                <strong className="text-sky-300">{derivedStats.hit}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Esquiva (FLEE)</span>
                <strong className="text-sky-300">{derivedStats.flee}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Crítico (CRIT)</span>
                <strong className="text-rose-400">{derivedStats.crit}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Velocidade (ASPD)</span>
                <strong className="text-amber-300">{derivedStats.aspd}/s</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">HP Máximo</span>
                <strong className="text-rose-300">{derivedStats.maxHp}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SP Máximo</span>
                <strong className="text-blue-300">{derivedStats.maxSp}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
