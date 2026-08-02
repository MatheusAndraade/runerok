import React from 'react';
import { OfflineResult } from '../../systems/OfflineEngine';
import { Award, Sparkles, X, Check } from 'lucide-react';

interface OfflineModalProps {
  result: OfflineResult;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ result, onClose }) => {
  const hours = Math.floor(result.elapsedSeconds / 3600);
  const minutes = Math.floor((result.elapsedSeconds % 3600) / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-md sm:max-w-lg bg-slate-900 border-2 border-amber-600 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[85vh] my-auto animate-in fade-in zoom-in duration-200">
        {/* Cabeçalho Fixo */}
        <div className="bg-gradient-to-r from-amber-950 to-yellow-950 px-4 py-3 border-b border-amber-600/50 text-center relative shrink-0">
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-0.5 animate-pulse" />
          <h2 className="font-extrabold text-lg sm:text-xl text-amber-200 tracking-wide">BEM-VINDO DE VOLTA!</h2>
          <p className="text-[11px] sm:text-xs text-amber-300/80 font-mono mt-0.5">
            Seu Cavaleiro caçou por {hours}h {minutes}m enquanto você esteve ausente
          </p>
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1.5 text-amber-300 hover:text-white rounded-lg hover:bg-amber-900/50 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo de Conteúdo Rolável */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Métricas do Período */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-900/50 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">EXP Base Ganha</span>
              <strong className="text-sm sm:text-base text-amber-300">+{result.expGained.toLocaleString()}</strong>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-yellow-900/50 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Zeny Adquirido</span>
              <strong className="text-sm sm:text-base text-yellow-300">+{result.zenyEarned.toLocaleString()} Z</strong>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-900/50 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Monstros Derrotados</span>
              <strong className="text-sm sm:text-base text-rose-300">{result.monstersKilled.toLocaleString()}</strong>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/50 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Cartas Encontradas</span>
              <strong className="text-sm sm:text-base text-emerald-300">{result.cardsLooted.length}</strong>
            </div>
          </div>

          {/* Destaque de Cartas Obtidas */}
          {result.cardsLooted.length > 0 && (
            <div className="bg-amber-950/60 border border-amber-500 rounded-lg p-3 text-center space-y-1">
              <Award className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="font-bold text-xs text-amber-200">★ CARTA RARA OBTIDA! ★</div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {result.cardsLooted.map((c, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded bg-slate-950 border border-amber-600 text-amber-300 font-mono flex items-center gap-1">
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Itens Saqueados */}
          {result.itemsLooted.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Itens Recolhidos</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-lg border border-slate-800">
                {result.itemsLooted.map((item, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-200 flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                    <strong className="text-amber-400 font-mono">x{item.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo Garantido na Tela */}
        <div className="p-3 bg-slate-950 border-t border-amber-900/60 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 font-extrabold text-white text-xs sm:text-sm rounded-lg shadow-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/40"
          >
            <Check className="w-4 h-4" /> Resgatar Recompensas e Continuar Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
