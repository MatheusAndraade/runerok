import React, { useState } from 'react';
import { SaveData, EquipmentSlot } from '../../types/game';
import { ITEMS } from '../../data/items';
import { Hammer, X, AlertTriangle } from 'lucide-react';

interface RefineWindowProps {
  saveData: SaveData;
  onRefineEquipped: (slot: EquipmentSlot) => any;
  onClose: () => void;
}

export const RefineWindow: React.FC<RefineWindowProps> = ({
  saveData,
  onRefineEquipped,
  onClose
}) => {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('weapon');
  const [message, setMessage] = useState<{ text: string; success?: boolean } | null>(null);

  const slotOptions: Array<{ key: EquipmentSlot; label: string }> = [
    { key: 'weapon', label: 'Arma' },
    { key: 'armor', label: 'Armadura' },
    { key: 'headTop', label: 'Topo' },
    { key: 'garment', label: 'Capa' },
    { key: 'shoes', label: 'Calçado' },
    { key: 'shield', label: 'Escudo' }
  ];

  const item = saveData.equipment[selectedSlot];
  const itemData = item ? ITEMS[item.itemId] : null;

  const currentRefine = item?.refineLevel || 0;
  const isSafeLevel = currentRefine < 4;
  const successChance = currentRefine < 4 ? 100 : Math.max(10, 100 - (currentRefine - 3) * 15);
  const costZeny = (currentRefine + 1) * 2000;

  const handleRefine = () => {
    if (!item || !itemData) return;
    const result = onRefineEquipped(selectedSlot);
    if (typeof result === 'string') {
      setMessage({ text: result, success: !result.toLowerCase().includes('falha') });
    } else if (result && typeof result === 'object') {
      setMessage({ text: result.message || 'Operação de refino concluída.', success: result.success });
    } else {
      setMessage({ text: 'Refino executado.', success: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Fornalha de Refino do Ferreiro</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Seleção de Slot */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {slotOptions.map(s => (
              <button
                key={s.key}
                onClick={() => {
                  setSelectedSlot(s.key);
                  setMessage(null);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSlot === s.key
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Forja e Inspetor */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
            {item && itemData ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="w-11 h-11 rounded-lg bg-slate-950 border border-amber-800/50 flex items-center justify-center text-2xl shrink-0">
                    {itemData.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-amber-200">
                      {item.refineLevel > 0 ? `+${item.refineLevel} ` : ''}
                      {itemData.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{itemData.description}</p>
                  </div>
                </div>

                {/* Previsão de Bônus */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase block">Refino Atual</span>
                    <span className="text-base font-bold text-amber-300">+{currentRefine}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase block">Próximo Nível</span>
                    <span className="text-base font-bold text-emerald-400">+{currentRefine + 1}</span>
                  </div>
                </div>

                {/* Probabilidades e Custo */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Taxa de Sucesso</span>
                    <span className={`font-bold font-mono ${successChance === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {successChance}% {isSafeLevel && '(Refino Seguro)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Custo do Ferreiro</span>
                    <span className="font-bold font-mono text-amber-300">{costZeny.toLocaleString()} Zeny</span>
                  </div>
                </div>

                {!isSafeLevel && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Em caso de falha, o nível de refino pode regredir! Proceda com cautela.</span>
                  </div>
                )}

                {/* Mensagem de Resultado */}
                {message && (
                  <div className={`p-2.5 rounded-lg text-xs font-bold text-center ${
                    message.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  onClick={handleRefine}
                  className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Hammer className="w-4 h-4" /> Forjar & Refinar Equipamento
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 italic">
                Nenhum equipamento equipado na posição {selectedSlot}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
