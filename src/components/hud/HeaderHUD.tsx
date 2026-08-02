import React from 'react';
import { SaveData, DerivedStats } from '../../types/game';
import { MAPS } from '../../data/maps';
import { getExpForLevel } from '../../data/expTable';
import { Shield, Coins, MapPin, Menu } from 'lucide-react';

interface HeaderHUDProps {
  saveData: SaveData;
  derivedStats: DerivedStats;
  onOpenMainMenu?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ saveData, derivedStats, onOpenMainMenu }) => {
  const currentMap = MAPS[saveData.currentMapId] || MAPS['prt_fild01'];
  const reqExp = getExpForLevel(saveData.character.baseLevel);
  const expPct = Math.min(100, Math.max(0, (saveData.character.baseExp / reqExp) * 100));
  const maxHp = derivedStats?.maxHp || 100;
  const maxSp = derivedStats?.maxSp || 50;
  const hpPct = Math.min(100, Math.max(0, (saveData.character.currentHp / maxHp) * 100));
  const spPct = Math.min(100, Math.max(0, (saveData.character.currentSp / maxSp) * 100));

  return (
    <div className="w-full bg-slate-950/95 border-b border-slate-800/80 px-2.5 py-1.5 text-amber-100 flex items-center justify-between gap-2 shadow-md select-none text-xs">
      {/* Perfil Minimalista */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-amber-200 text-xs truncate max-w-[90px] sm:max-w-[140px]">
              {saveData.character.name}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 border border-amber-700/50 text-amber-300 font-bold shrink-0">
              Nv.{saveData.character.baseLevel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="text-amber-300/90 flex items-center gap-0.5 shrink-0">
              <Coins className="w-2.5 h-2.5 text-amber-400" />
              {saveData.character.zeny.toLocaleString()}Z
            </span>
            <span className="hidden sm:flex items-center gap-0.5 text-emerald-400 truncate max-w-[120px]">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {currentMap.name}
            </span>
          </div>
        </div>
      </div>

      {/* Barras de HP, SP e EXP Compactas */}
      <div className="flex-1 max-w-sm space-y-0.5 min-w-[120px] px-1">
        {/* Barra de HP */}
        <div className="relative w-full h-2.5 bg-slate-900 rounded border border-rose-950 overflow-hidden flex items-center">
          <div
            className="h-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${hpPct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">
            HP {Math.floor(saveData.character.currentHp)}/{maxHp}
          </span>
        </div>

        {/* Barra de SP */}
        <div className="relative w-full h-2.5 bg-slate-900 rounded border border-blue-950 overflow-hidden flex items-center">
          <div
            className="h-full bg-sky-500 transition-all duration-200"
            style={{ width: `${spPct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">
            SP {Math.floor(saveData.character.currentSp)}/{maxSp}
          </span>
        </div>

        {/* Barra de EXP */}
        <div className="relative w-full h-1.5 bg-slate-900 rounded overflow-hidden flex items-center">
          <div
            className="h-full bg-amber-400 transition-all duration-200"
            style={{ width: `${expPct}%` }}
          />
        </div>
      </div>

      {/* Botão Menu */}
      {onOpenMainMenu && (
        <button
          onClick={onOpenMainMenu}
          title="Menu de Saves"
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 flex items-center gap-1 cursor-pointer transition-all shrink-0 active:scale-95"
        >
          <Menu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Saves</span>
        </button>
      )}
    </div>
  );
};
