import React from 'react';
import { SaveData } from '../../types/game';
import { ITEMS } from '../../data/items';
import { Sparkles, X, Layers } from 'lucide-react';

interface CardCollectionWindowProps {
  saveData: SaveData;
  onClose: () => void;
}

export const CardCollectionWindow: React.FC<CardCollectionWindowProps> = ({ saveData, onClose }) => {
  const cardItems = Object.values(ITEMS).filter(i => i.type === 'card');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Álbum de Cartas Ilustradas</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Cartas raras caem de monstros e podem ser inseridas nos slots de equipamentos para conceder bônus permanentes.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {cardItems.map(card => {
              const invCount = saveData.inventory
                .filter(i => i.itemId === card.id)
                .reduce((acc, curr) => acc + curr.amount, 0);

              const isUnlocked = invCount > 0 || saveData.cardsDiscovered?.includes(card.id);

              return (
                <div
                  key={card.id}
                  className={`border rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all ${
                    isUnlocked
                      ? 'bg-amber-950/40 border-amber-600/70 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-amber-700/50 flex items-center justify-center text-2xl shrink-0">
                      {isUnlocked ? card.icon : '❓'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-amber-200 truncate">{card.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">
                        Slot: {card.slot || 'Geral'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                    <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isUnlocked ? '✓ Desbloqueada' : '🔒 Não Obtida'}
                    </span>
                    <span className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Na Mochila: {invCount}
                    </span>
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
