import React from 'react';
import { SaveData, EquipmentSlot } from '../../types/game';
import { ITEMS } from '../../data/items';
import { Shield, X, MinusCircle } from 'lucide-react';

interface EquipmentWindowProps {
  saveData: SaveData;
  onUnequipItem: (slot: EquipmentSlot) => void;
  onClose: () => void;
}

export const EquipmentWindow: React.FC<EquipmentWindowProps> = ({
  saveData,
  onUnequipItem,
  onClose
}) => {
  const slots: Array<{ key: EquipmentSlot; label: string }> = [
    { key: 'headTop', label: 'Topo da Cabeça' },
    { key: 'headMid', label: 'Meio da Cabeça' },
    { key: 'headLow', label: 'Baixo da Cabeça' },
    { key: 'armor', label: 'Armadura' },
    { key: 'weapon', label: 'Arma' },
    { key: 'shield', label: 'Escudo' },
    { key: 'garment', label: 'Capa' },
    { key: 'shoes', label: 'Calçado' },
    { key: 'accessory1', label: 'Acessório 1' },
    { key: 'accessory2', label: 'Acessório 2' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Equipamentos Atuais</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {slots.map(slotInfo => {
              const item = saveData.equipment[slotInfo.key];
              const itemData = item ? ITEMS[item.itemId] : null;

              return (
                <div key={slotInfo.key} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-amber-900/40 flex items-center justify-center text-lg shrink-0">
                      {itemData?.icon || '🛡️'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{slotInfo.label}</span>
                      {item && itemData ? (
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-amber-300 truncate">
                            {item.refineLevel > 0 ? `+${item.refineLevel} ` : ''}
                            {itemData.name}
                            {itemData.slots ? ` [${itemData.slots}]` : ''}
                          </div>
                          {item.cards.length > 0 && (
                            <div className="text-[10px] text-amber-400/90 font-mono">
                              Cartas: {item.cards.map(cId => ITEMS[cId]?.name).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Vazio</span>
                      )}
                    </div>
                  </div>

                  {item && (
                    <button
                      onClick={() => onUnequipItem(slotInfo.key)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Desequipar"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
