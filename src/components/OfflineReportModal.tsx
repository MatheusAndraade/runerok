import React from 'react';
import { OfflineReport } from '../types/game';
import { ITEMS } from '../data/items';
import { Clock, Award, Sparkles, Shield, X, Check } from 'lucide-react';

interface OfflineReportModalProps {
  report: OfflineReport;
  onClose: () => void;
}

export const OfflineReportModal: React.FC<OfflineReportModalProps> = ({ report, onClose }) => {
  const durationMinutes = Math.floor(report.timeOfflineSeconds / 60);
  const durationHours = (durationMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 px-5 py-4 border-b border-amber-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-amber-200">Welcome Back, Knight!</h2>
              <p className="text-xs text-amber-400/80 font-mono">
                Offline Auto-Battle Report ({durationHours} hours)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Stat Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">Base EXP</span>
              <span className="text-sm font-bold text-amber-300">+{report.baseExpGained.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">Job EXP</span>
              <span className="text-sm font-bold text-sky-300">+{report.jobExpGained.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">Zeny Looted</span>
              <span className="text-sm font-bold text-emerald-400">+{report.zenyGained.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">Monsters Slain</span>
              <span className="text-sm font-bold text-rose-400">x{report.monstersKilled.toLocaleString()}</span>
            </div>
          </div>

          {/* Cards & Rare Items Drop Section */}
          {report.cardsDropped.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-600/70 p-3 rounded-xl space-y-2">
              <h3 className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Rare Monster Cards Acquired!
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.cardsDropped.map((cId, idx) => {
                  const cardData = ITEMS[cId];
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-900/80 border border-amber-500 text-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <span>{cardData?.icon || '🃏'}</span>
                      <span>{cardData?.name || cId}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Looted Items List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Items Collected
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-1.5">
              {Object.entries(report.itemsLooted).map(([itemId, amount]) => {
                const itemData = ITEMS[itemId];
                if (!itemData) return null;

                return (
                  <div key={itemId} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-lg">{itemData.icon}</span>
                      <span className="font-bold text-amber-200 truncate">{itemData.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      x{amount}
                    </span>
                  </div>
                );
              })}

              {Object.keys(report.itemsLooted).length === 0 && (
                <div className="py-4 text-center text-xs text-slate-500 italic">No items were collected during this offline period.</div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-5 h-5" /> Claim All Loot & Resume
          </button>
        </div>
      </div>
    </div>
  );
};
