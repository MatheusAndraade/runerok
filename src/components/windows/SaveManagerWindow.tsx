import React, { useState } from 'react';
import { SaveData } from '../../types/game';
import { SaveManager } from '../../systems/SaveManager';
import { Save, Download, Upload, Trash2, X } from 'lucide-react';

interface SaveManagerWindowProps {
  currentSave: SaveData;
  onLoadSave: (save: SaveData) => void;
  onClose: () => void;
}

export const SaveManagerWindow: React.FC<SaveManagerWindowProps> = ({
  currentSave,
  onLoadSave,
  onClose
}) => {
  const [slots, setSlots] = useState(SaveManager.listSaveSlots());
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveToSlot = (slotId: string) => {
    const updated = { ...currentSave, saveId: slotId, lastPlayedAt: Date.now() };
    SaveManager.saveGame(updated);
    setSlots(SaveManager.listSaveSlots());
  };

  const handleLoadFromSlot = (slotId: string) => {
    const loaded = SaveManager.loadGame(slotId);
    if (loaded) {
      onLoadSave(loaded);
      onClose();
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('Tem certeza de que deseja apagar este slot de jogo salvo?')) {
      SaveManager.deleteSave(slotId);
      setSlots(SaveManager.listSaveSlots());
    }
  };

  const handleExport = () => {
    SaveManager.exportSaveToFile(currentSave);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = SaveManager.importSaveFromJSON(json);
        if (imported) {
          onLoadSave(imported);
          onClose();
        } else {
          setImportError('Formato de arquivo salvo inválido.');
        }
      } catch (err) {
        setImportError('Falha ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Gerenciador de Progresso (Saves)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Lista de Slots */}
          <div className="space-y-2">
            {slots.map(s => {
              const dateStr = s.lastSavedAt ? new Date(s.lastSavedAt).toLocaleString() : 'Slot Vazio';

              return (
                <div
                  key={s.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-amber-200">
                      Slot {s.id.split('-')[1]} {s.exists && `(Nv.${s.level} - Cavaleiro)`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{dateStr}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSaveToSlot(s.id)}
                      className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvar
                    </button>

                    {s.exists && (
                      <>
                        <button
                          onClick={() => handleLoadFromSlot(s.id)}
                          className="px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Carregar
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className="p-1.5 rounded bg-rose-950/60 text-rose-400 hover:text-rose-200 hover:bg-rose-900 border border-rose-800/60 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Seção de Importação / Exportação */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400">Exportação e Importação</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" /> Exportar Arquivo JSON
              </button>

              <label className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-amber-400" /> Importar Arquivo JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importError && (
              <div className="text-xs text-rose-400 font-mono text-center">{importError}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
