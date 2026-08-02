import React, { useState } from 'react';
import { AudioManager } from '../../core/AudioManager';
import { Settings, X, Volume2, PauseCircle } from 'lucide-react';

interface SettingsWindowProps {
  isPausedWhileManaging?: boolean;
  onTogglePauseWhileManaging?: (paused: boolean) => void;
  onClose: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({
  isPausedWhileManaging = false,
  onTogglePauseWhileManaging,
  onClose
}) => {
  const [masterVol, setMasterVol] = useState(0.5);
  const [sfxVol, setSfxVol] = useState(0.6);
  const [bgmVol, setBgmVol] = useState(0.25);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    AudioManager.getInstance().setVolumes(val, sfxVol, bgmVol);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    AudioManager.getInstance().setVolumes(masterVol, val, bgmVol);
  };

  const handleBgmChange = (val: number) => {
    setBgmVol(val);
    AudioManager.getInstance().setVolumes(masterVol, sfxVol, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Ajustes & Configurações</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto text-xs">
          {/* Controle de Áudio */}
          <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm border-b border-slate-800 pb-2">
              <Volume2 className="w-4 h-4" />
              <span>Sistema de Áudio & Efeitos</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Volume Geral (Geral)</span>
                  <span className="font-mono text-amber-300">{Math.round(masterVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVol}
                  onChange={e => handleMasterChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Efeitos Sonoros (SFX)</span>
                  <span className="font-mono text-amber-300">{Math.round(sfxVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVol}
                  onChange={e => handleSfxChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Trilha Sonora (BGM)</span>
                  <span className="font-mono text-amber-300">{Math.round(bgmVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVol}
                  onChange={e => handleBgmChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Opções de Jogo */}
          <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm border-b border-slate-800 pb-2">
              <PauseCircle className="w-4 h-4" />
              <span>Regras de Jogabilidade</span>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Pausar combate ao abrir menus</span>
              <input
                type="checkbox"
                checked={isPausedWhileManaging}
                onChange={e => onTogglePauseWhileManaging && onTogglePauseWhileManaging(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-600 cursor-pointer w-4 h-4"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
