import React, { useState } from 'react';
import { SaveData } from '../../types/game';
import { Wrench, X, Sparkles, Zap, Award, Clock } from 'lucide-react';

interface DevModeWindowProps {
  saveData: SaveData;
  onAddExp: (base: number, job: number) => void;
  onAddZeny: (amount: number) => void;
  onGrantCard: (cardId: string) => void;
  onSimulateOffline: (hours: number) => void;
  onClose: () => void;
}

export const DevModeWindow: React.FC<DevModeWindowProps> = ({
  saveData,
  onAddExp,
  onAddZeny,
  onGrantCard,
  onSimulateOffline,
  onClose
}) => {
  const [offlineHours, setOfflineHours] = useState<number>(4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Comandos de Game Master (GM)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Concessão de EXP */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Conceder Pontos de Experiência (EXP)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onAddExp(10000, 8000)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-xs text-amber-200 font-bold cursor-pointer"
              >
                +10k EXP Base
              </button>
              <button
                onClick={() => onAddExp(100000, 80000)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-xs text-amber-200 font-bold cursor-pointer"
              >
                +100k EXP Base
              </button>
              <button
                onClick={() => onAddExp(1000000, 800000)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-xs text-amber-200 font-bold col-span-2 sm:col-span-1 cursor-pointer"
              >
                +1M EXP Base
              </button>
            </div>
          </div>

          {/* Concessão de Zeny */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Conceder Moedas (Zeny)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddZeny(50000)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-xs text-amber-300 font-bold cursor-pointer"
              >
                +50.000 Zeny
              </button>
              <button
                onClick={() => onAddZeny(1000000)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-xs text-amber-300 font-bold cursor-pointer"
              >
                +1.000.000 Zeny
              </button>
            </div>
          </div>

          {/* Adição de Cartas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Forçar Drop de Carta
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onGrantCard('card_poring')}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-amber-200 font-bold cursor-pointer"
              >
                Carta Poring
              </button>
              <button
                onClick={() => onGrantCard('card_doppelganger')}
                className="py-1.5 bg-amber-950/80 hover:bg-amber-900 rounded border border-amber-700 text-amber-300 font-bold cursor-pointer"
              >
                Carta MVP Doppelganger
              </button>
            </div>
          </div>

          {/* Simulação Offline */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Simular Progresso Offline
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="24"
                value={offlineHours}
                onChange={e => setOfflineHours(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs font-bold text-amber-200"
              />
              <span className="text-xs text-slate-400">Horas</span>
              <button
                onClick={() => onSimulateOffline(offlineHours)}
                className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded shadow cursor-pointer active:scale-95"
              >
                Simular Ganhos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
