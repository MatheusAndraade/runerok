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
    <div className="ro-basic-info w-full px-2.5 py-1.5 flex items-center justify-between gap-2 select-none text-xs">
      {/* Perfil Minimalista */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div className="ro-portrait w-8 h-8 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-blue-800" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-800 text-xs truncate max-w-[90px] sm:max-w-[140px]">
              {saveData.character.name}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded-sm bg-blue-50 border border-blue-300 text-blue-900 font-bold shrink-0">
              Nv.{saveData.character.baseLevel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
            <span className="text-amber-700 flex items-center gap-0.5 shrink-0">
              <Coins className="w-2.5 h-2.5 text-amber-600" />
              {saveData.character.zeny.toLocaleString()}Z
            </span>
            <span className="hidden sm:flex items-center gap-0.5 text-emerald-800 truncate max-w-[120px]">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {currentMap.name}
            </span>
          </div>
        </div>
      </div>

      {/* Barras de HP, SP e EXP Compactas */}
      <div className="flex-1 max-w-sm space-y-0.5 min-w-[120px] px-1">
        {/* Barra de HP */}
        <div className="ro-gauge relative w-full h-3 overflow-hidden flex items-center">
          <div
            className="h-full bg-gradient-to-b from-lime-200 to-emerald-500 transition-all duration-200"
            style={{ width: `${hpPct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-900">
            HP {Math.floor(saveData.character.currentHp)}/{maxHp}
          </span>
        </div>

        {/* Barra de SP */}
        <div className="ro-gauge relative w-full h-3 overflow-hidden flex items-center">
          <div
            className="h-full bg-gradient-to-b from-sky-100 to-blue-400 transition-all duration-200"
            style={{ width: `${spPct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-900">
            SP {Math.floor(saveData.character.currentSp)}/{maxSp}
          </span>
        </div>

        {/* Barra de EXP */}
        <div className="ro-gauge relative w-full h-2 overflow-hidden flex items-center">
          <div
            className="h-full bg-gradient-to-b from-yellow-100 to-yellow-400 transition-all duration-200"
            style={{ width: `${expPct}%` }}
          />
        </div>
      </div>

      {/* Botão Menu */}
      {onOpenMainMenu && (
        <button
          onClick={onOpenMainMenu}
          title="Voltar ao menu"
          className="ro-classic-button p-1.5 flex items-center gap-1 cursor-pointer transition-all shrink-0 active:translate-y-px"
        >
          <Menu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Menu</span>
        </button>
      )}
    </div>
  );
};
