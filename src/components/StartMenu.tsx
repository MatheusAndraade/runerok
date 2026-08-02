import React, { useState, useEffect } from 'react';
import { SaveData } from '../types/game';
import { SaveManager } from '../systems/SaveManager';
import { MAPS } from '../data/maps';
import {
  Shield,
  Play,
  PlusCircle,
  FolderOpen,
  Trash2,
  Download,
  MapPin,
  Clock,
  Coins,
  X,
  AlertTriangle
} from 'lucide-react';

interface StartMenuProps {
  onSelectSave: (save: SaveData) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onSelectSave }) => {
  const [saves, setSaves] = useState<SaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'MAIN' | 'NEW' | 'LOAD' | 'DELETE'>('MAIN');

  // New game form states
  const [newCharName, setNewCharName] = useState('Arthas');
  const [newSaveName, setNewSaveName] = useState('Jornada do Cavaleiro');

  // Delete modal state
  const [saveToDelete, setSaveToDelete] = useState<SaveData | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    setLoading(true);
    try {
      const all = await SaveManager.getAllSaves();
      // Sort by last played date descending
      all.sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0));
      setSaves(all);
    } catch (e) {
      console.error('Erro ao carregar saves:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    const newSave = SaveManager.createDefaultSave(
      newSaveName.trim() || 'Cavaleiro',
      newCharName.trim()
    );

    await SaveManager.saveGame(newSave);
    onSelectSave(newSave);
  };

  const handleDeleteSave = async () => {
    if (!saveToDelete) return;
    await SaveManager.deleteSave(saveToDelete.saveId);
    setSaveToDelete(null);
    await loadSaves();
  };

  return (
    <div className="ro-start-menu w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none text-slate-100 font-sans">
      <img
        src="/game-assets/start-screen.png"
        alt=""
        className="ro-start-art absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      {/* Background Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Logo / Header */}
        <div className="text-center mb-6 space-y-2 animate-in fade-in slide-in-from-top duration-500">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 border border-amber-300/40">
            <Shield className="w-10 h-10 text-slate-950" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-200 tracking-wider uppercase font-mono drop-shadow-md">
            RUNEROK
          </h1>
          <p className="text-xs sm:text-sm text-amber-400/80 font-medium tracking-widest uppercase">
            RPG Idle 2.5D • Ragnarok Edition
          </p>
        </div>

        {/* MAIN MENU BUTTONS VIEW */}
        {viewMode === 'MAIN' && (
          <div className="w-full bg-slate-900/90 border border-amber-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-3.5 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setViewMode('NEW')}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-between cursor-pointer transition-all shadow-lg active:scale-98 border border-amber-400/40"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-amber-200" />
                <span>Novo Jogo</span>
              </div>
              <Play className="w-4 h-4 fill-current opacity-80" />
            </button>

            <button
              onClick={() => setViewMode('LOAD')}
              className="w-full py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-amber-100 font-bold text-sm sm:text-base flex items-center justify-between cursor-pointer transition-all border border-slate-700 active:scale-98"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <span>Carregar Jogo</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                {saves.length} Salvo(s)
              </span>
            </button>

            <button
              onClick={() => setViewMode('DELETE')}
              className="w-full py-3 px-5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 font-medium text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-all border border-slate-800 hover:border-rose-800 active:scale-98"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Deletar Jogo</span>
              </div>
            </button>
          </div>
        )}

        {/* NOVO JOGO VIEW */}
        {viewMode === 'NEW' && (
          <form
            onSubmit={handleCreateNewGame}
            className="w-full bg-slate-900/90 border border-amber-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-amber-200 text-base sm:text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" /> Criar Novo Jogo
              </h3>
              <button
                type="button"
                onClick={() => setViewMode('MAIN')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nome do Personagem:</label>
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Ex: Arthas"
                  maxLength={16}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nome do Slot de Save:</label>
                <input
                  type="text"
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                  placeholder="Ex: Minha Jornada"
                  maxLength={24}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200/90 text-[11px] space-y-1">
                <strong className="block text-amber-300">Resumo da Classe Inicial:</strong>
                <p>• Classe: <strong>Cavaleiro (Knight)</strong></p>
                <p>• Atributos iniciais balanceados (STR, AGI, VIT, DEX)</p>
                <p>• Equipamento: Traje de Aventureiro + Espada Curta</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('MAIN')}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                Iniciar Aventura!
              </button>
            </div>
          </form>
        )}

        {/* CARREGAR JOGO VIEW */}
        {viewMode === 'LOAD' && (
          <div className="w-full bg-slate-900/90 border border-amber-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-amber-200 text-base sm:text-lg flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" /> Carregar Jogo Salvo
              </h3>
              <button
                type="button"
                onClick={() => setViewMode('MAIN')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs font-mono">Carregando saves...</div>
            ) : saves.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-400">Nenhum jogo salvo encontrado.</p>
                <button
                  onClick={() => setViewMode('NEW')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Criar Primeiro Personagem
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {saves.map((save) => {
                  const dateStr = save.lastPlayedAt
                    ? new Date(save.lastPlayedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                    : 'Desconhecido';

                  return (
                    <div
                      key={save.saveId}
                      className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/70 rounded-xl transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-200 text-sm truncate">{save.character.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                            Nv. {save.character.baseLevel} {save.character.className}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {MAPS[save.currentMapId]?.name || save.currentMapId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            {save.character.zeny.toLocaleString()} Z
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => SaveManager.exportSaveToFile(save)}
                          title="Exportar Save"
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-200 border border-slate-700 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectSave(save)}
                          className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Jogar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setViewMode('MAIN')}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Voltar ao Menu
            </button>
          </div>
        )}

        {/* DELETAR JOGO VIEW */}
        {viewMode === 'DELETE' && (
          <div className="w-full bg-slate-900/90 border border-rose-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-rose-300 text-base sm:text-lg flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" /> Gerenciar & Deletar Saves
              </h3>
              <button
                type="button"
                onClick={() => setViewMode('MAIN')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o personagem que deseja apagar permanentemente. Esta ação não pode ser desfeita!
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {saves.map((save) => (
                <div
                  key={save.saveId}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <strong className="text-xs text-amber-200">{save.character.name}</strong>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Nv. {save.character.baseLevel} {save.character.className} • {save.character.zeny.toLocaleString()} Zeny
                    </span>
                  </div>

                  <button
                    onClick={() => setSaveToDelete(save)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deletar
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewMode('MAIN')}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Voltar ao Menu
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION DELETION MODAL */}
      {saveToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-800 rounded-xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 rounded-full border border-rose-700 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-rose-200 text-sm">Confirmar Exclusão</h4>
              <p className="text-xs text-slate-300">
                Tem certeza que deseja apagar o personagem <strong className="text-amber-300">{saveToDelete.character.name}</strong> (Nv. {saveToDelete.character.baseLevel})?
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSaveToDelete(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSave}
                className="flex-1 py-2 bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs rounded-lg cursor-pointer shadow-lg active:scale-95"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
