import React from 'react';
import { Skull, RefreshCw, ShieldAlert } from 'lucide-react';

interface DeathModalProps {
  mapName: string;
  onRespawn: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ mapName, onRespawn }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-800 rounded-2xl shadow-2xl p-6 text-center text-amber-100 flex flex-col items-center space-y-4">
        {/* Animated Skull Icon */}
        <div className="w-20 h-20 rounded-full bg-rose-950/80 border-2 border-rose-600/60 flex items-center justify-center shadow-lg animate-pulse">
          <Skull className="w-10 h-10 text-rose-400" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-wider font-mono">
            VOCÊ MORREU!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Seu personagem sucumbiu durante a batalha em <span className="text-amber-300 font-bold">{mapName}</span>.
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Penalidade de Derrota:</span>
          </div>
          <p>• HP & SP zerados</p>
          <p>• O progresso atual da caça foi interrompido</p>
          <p>• Clique no botão abaixo para restaurar seus atributos e retornar em segurança!</p>
        </div>

        {/* Respawn Button */}
        <button
          onClick={onRespawn}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl border border-amber-300/40 cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>RENASCER EM PRONTERA</span>
        </button>
      </div>
    </div>
  );
};
