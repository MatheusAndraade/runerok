import React, { useState } from 'react';
import { SaveData } from '../../types/game';
import { MAPS } from '../../data/maps';
import { MONSTERS } from '../../data/monsters';
import { ITEMS } from '../../data/items';
import { Map, X, Compass, ArrowRight } from 'lucide-react';

interface WorldMapWindowProps {
  saveData?: SaveData;
  currentMapId?: string;
  userLevel?: number;
  onTravelToMap: (mapId: string) => void;
  onClose: () => void;
}

export const WorldMapWindow: React.FC<WorldMapWindowProps> = ({
  saveData,
  currentMapId,
  userLevel,
  onTravelToMap,
  onClose
}) => {
  const activeMapId = currentMapId || saveData?.currentMapId || 'prt_fild01';
  const [selectedMapId, setSelectedMapId] = useState<string>(activeMapId);
  const selectedMap = MAPS[selectedMapId] || MAPS['prt_fild01'];

  const mapList = Object.values(MAPS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Mapa do Mundo & Regiões</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área do Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto">
          {/* Lista de Mapas */}
          <div className="space-y-2 overflow-y-auto max-h-[220px] sm:max-h-[420px] pr-1 scrollbar-thin scrollbar-thumb-amber-800">
            {mapList.map(m => {
              const isCurrent = activeMapId === m.id;
              const isSelected = selectedMapId === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMapId(m.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 hover:border-amber-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{m.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-semibold shrink-0">
                          Atual
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-400/90 font-mono font-semibold block mt-0.5">
                      {m.recommendedLevel}
                    </span>
                  </div>
                  <Compass className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Detalhes do Mapa Selecionado */}
          <div className="bg-slate-950 p-3 sm:p-4 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-3 overflow-y-auto">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-300">{selectedMap.name}</h3>
                <div className="text-xs text-slate-400 font-mono">Nível Recomendado: {selectedMap.recommendedLevel}</div>
              </div>

              {/* População de Monstros */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">Monstros da Região</h4>
                <div className="space-y-1">
                  {selectedMap.monsterSpawns.map(s => {
                    const mData = MONSTERS[s.monsterId];
                    if (!mData) return null;

                    return (
                      <div key={s.monsterId} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="font-bold text-amber-200">{mData.name}</span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span>Nv.{mData.level}</span>
                          <span className="text-emerald-400">EXP: {mData.baseExp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Loot em Destaque */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">Drops em Destaque</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(selectedMap.monsterSpawns.flatMap(s => MONSTERS[s.monsterId]?.lootTable || []).map(drop => drop.itemId))).map(itemId => {
                    const itemData = ITEMS[itemId];
                    if (!itemData) return null;
                    return (
                      <span key={itemId} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-100 flex items-center gap-1">
                        <span>{itemData.icon}</span>
                        <span>{itemData.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ação de Viagem */}
            <button
              onClick={() => {
                onTravelToMap(selectedMap.id);
                onClose();
              }}
              disabled={activeMapId === selectedMap.id}
              className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg transition-all cursor-pointer ${
                activeMapId === selectedMap.id
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
              }`}
            >
              <span>{activeMapId === selectedMap.id ? 'Você já está aqui' : 'Mudar para este Mapa'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
