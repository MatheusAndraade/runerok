import React from 'react';
import { SaveData } from '../../types/game';
import { ITEMS } from '../../data/items';
import { Award, X } from 'lucide-react';

interface CollectionWindowProps {
  saveData: SaveData;
  onClose: () => void;
}

export const CollectionWindow: React.FC<CollectionWindowProps> = ({ saveData, onClose }) => {
  const allCards = Object.values(ITEMS).filter(i => i.type === 'card');
  const discoveredCount = saveData.cardsDiscovered?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Coleção de Cartas</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto">
          {/* Banner de Progresso */}
          <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-amber-300">Cartas Descobertas:</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
              {discoveredCount} / {allCards.length} ({allCards.length > 0 ? Math.round((discoveredCount / allCards.length) * 100) : 0}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {allCards.map(card => {
              const isDiscovered = saveData.cardsDiscovered?.includes(card.id);

              return (
                <div
                  key={card.id}
                  className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                    isDiscovered
                      ? 'bg-amber-950/60 border-amber-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-slate-900 border border-amber-700/50 flex items-center justify-center text-xl shrink-0">
                    {isDiscovered ? card.icon : '❓'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-300">{isDiscovered ? card.name : 'Carta Desconhecida'}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {isDiscovered ? card.description : 'Derrote monstros para obter esta carta rara!'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
