import React from 'react';
import { TrendingUp, Coins, Skull, Zap, Flame } from 'lucide-react';

interface IdleStatsBarProps {
  metrics?: {
    expPerHour: number;
    zenyPerHour: number;
    killsPerMin: number;
    dps: number;
    potionsPerHour: number;
  };
}

export const IdleStatsBar: React.FC<IdleStatsBarProps> = ({ metrics }) => {
  const m = metrics || {
    expPerHour: 1200,
    zenyPerHour: 350,
    killsPerMin: 18,
    dps: 120,
    potionsPerHour: 4
  };

  return (
    <div className="ro-idle-panel w-full px-3 py-1 text-[11px] flex items-center justify-around overflow-x-auto gap-3 font-mono select-none whitespace-nowrap">
      <div className="flex items-center gap-1 text-amber-300">
        <TrendingUp className="w-3 h-3 text-amber-400 shrink-0" />
        <span>EXP/h: <strong className="text-white">{(m.expPerHour || 0).toLocaleString()}</strong></span>
      </div>

      <div className="flex items-center gap-1 text-yellow-300">
        <Coins className="w-3 h-3 text-yellow-400 shrink-0" />
        <span>Zeny/h: <strong className="text-white">{(m.zenyPerHour || 0).toLocaleString()}</strong></span>
      </div>

      <div className="flex items-center gap-1 text-rose-300">
        <Skull className="w-3 h-3 text-rose-400 shrink-0" />
        <span>Abates/min: <strong className="text-white">{m.killsPerMin || 0}</strong></span>
      </div>

      <div className="flex items-center gap-1 text-sky-300">
        <Zap className="w-3 h-3 text-sky-400 shrink-0" />
        <span>DPS: <strong className="text-white">{(m.dps || 0).toLocaleString()}</strong></span>
      </div>

      <div className="flex items-center gap-1 text-emerald-300">
        <Flame className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Poções/h: <strong className="text-white">{(m.potionsPerHour || 0).toLocaleString()}</strong></span>
      </div>
    </div>
  );
};
