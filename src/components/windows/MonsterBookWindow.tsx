import React, { useState } from 'react';
import { SaveData, MonsterData } from '../../types/game';
import { MONSTERS } from '../../data/monsters';
import { ITEMS } from '../../data/items';
import { BookOpen, X, Award } from 'lucide-react';

interface MonsterBookWindowProps {
  saveData: SaveData;
  onClose: () => void;
}

export const MonsterBookWindow: React.FC<MonsterBookWindowProps> = ({ saveData, onClose }) => {
  const monsterList = Object.values(MONSTERS);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(monsterList[0]?.id || '');

  const selectedMonster = MONSTERS[selectedMonsterId];
  const monsterKills = saveData.monsterKills[selectedMonsterId] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Bestiário e Compêndio de Monstros</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Lista de Monstros */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-y-auto max-h-[260px] sm:max-h-[360px] space-y-1">
            {monsterList.map((m: MonsterData) => {
              const kills = saveData.monsterKills[m.id] || 0;
              const isSelected = m.id === selectedMonsterId;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMonsterId(m.id)}
                  className={`w-full text-left p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.isMvp ? '👑' : '👾'}</span>
                    <div>
                      <div className={`font-bold text-xs ${m.isMvp ? 'text-amber-300' : 'text-slate-200'}`}>
                        {m.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Nv.{m.level}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    x{kills}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inspetor do Monstro Selecionado */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between space-y-3">
            {selectedMonster ? (
              <div className="space-y-3">
                {/* Banner de Cabeçalho */}
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-amber-700/40 flex items-center justify-center text-2xl shrink-0">
                    {selectedMonster.isMvp ? '👑' : '👾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm sm:text-base text-amber-200 truncate">{selectedMonster.name}</h3>
                      {selectedMonster.isMvp && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Chefe MVP
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>Nível {selectedMonster.level}</span>
                      <span>•</span>
                      <span>HP: {selectedMonster.hp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Grade de Características */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Elemento</span>
                    <span className="font-bold text-amber-300 capitalize">{selectedMonster.element}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Raça</span>
                    <span className="font-bold text-amber-300 capitalize">{selectedMonster.race}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Tamanho</span>
                    <span className="font-bold text-amber-300 capitalize">{selectedMonster.size}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Abates Totais</span>
                    <span className="font-bold text-amber-300">{monsterKills}</span>
                  </div>
                </div>

                {/* Tabela de Recompensas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Tabela de Drops & Probabilidades
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMonster.lootTable.map((drop, idx) => {
                      const itemData = ITEMS[drop.itemId];
                      if (!itemData) return null;
                      const dropPct = (drop.chance * 100).toFixed(drop.chance < 0.01 ? 3 : 1);

                      return (
                        <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-lg">{itemData.icon}</span>
                            <span className="text-xs text-amber-200 font-medium truncate">{itemData.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400/90 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                            {dropPct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Selecione um monstro para ver os detalhes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
