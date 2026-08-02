import React, { useState } from 'react';
import { SaveData, InventoryItem, EquipmentSlot } from '../../types/game';
import { ITEMS } from '../../data/items';
import { Package, X, Shield } from 'lucide-react';

interface InventoryWindowProps {
  saveData: SaveData;
  weight: number;
  weightLimit: number;
  onEquipItem: (item: InventoryItem, targetSlot: EquipmentSlot) => void;
  onUseConsumable: (item: InventoryItem) => void;
  onSellItem: (item: InventoryItem) => void;
  onClose: () => void;
}

export const InventoryWindow: React.FC<InventoryWindowProps> = ({
  saveData,
  weight,
  weightLimit,
  onEquipItem,
  onUseConsumable,
  onSellItem,
  onClose
}) => {
  const [filter, setFilter] = useState<'TUDO' | 'EQUIPAMENTO' | 'POÇÃO' | 'DROP' | 'CARTA'>('TUDO');
  const [selectedItemInstanceId, setSelectedItemInstanceId] = useState<string | null>(null);

  const filteredItems = saveData.inventory.filter(item => {
    const itemData = ITEMS[item.itemId];
    if (!itemData) return false;
    if (filter === 'EQUIPAMENTO') return ['weapon', 'armor', 'headgear', 'garment', 'shoes', 'accessory'].includes(itemData.type);
    if (filter === 'POÇÃO') return itemData.type === 'consumable';
    if (filter === 'DROP') return itemData.type === 'etc';
    if (filter === 'CARTA') return itemData.type === 'card';
    return true;
  });

  const selectedInventoryItem = saveData.inventory.find(i => i.instanceId === selectedItemInstanceId);
  const selectedItemData = selectedInventoryItem ? ITEMS[selectedInventoryItem.itemId] : null;

  const handleEquip = () => {
    if (!selectedInventoryItem || !selectedItemData) return;
    const targetSlot = selectedItemData.slot || 'weapon';
    onEquipItem(selectedInventoryItem, targetSlot);
  };

  const handleUse = () => {
    if (!selectedInventoryItem) return;
    onUseConsumable(selectedInventoryItem);
  };

  const handleSell = () => {
    if (!selectedInventoryItem) return;
    onSellItem(selectedInventoryItem);
    setSelectedItemInstanceId(null);
  };

  const weightPct = Math.min(100, Math.floor((weight / weightLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Mochila & Inventário</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1 flex flex-col">
          {/* Indicador de Peso */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-amber-300">
              <span>Peso Transportado</span>
              <span className="font-mono">{weight} / {weightLimit} ({weightPct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${weightPct > 90 ? 'bg-rose-600' : weightPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${weightPct}%` }}
              />
            </div>
          </div>

          {/* Abas de Categoria */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto text-xs scrollbar-none">
            {(['TUDO', 'EQUIPAMENTO', 'POÇÃO', 'DROP', 'CARTA'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filter === cat
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Itens e Detalhes do Item Selecionado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-[240px]">
            {/* Grid de Itens */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 overflow-y-auto max-h-[260px] sm:max-h-[300px] grid grid-cols-4 sm:grid-cols-5 gap-2 auto-rows-max">
              {filteredItems.map(invItem => {
                const itemData = ITEMS[invItem.itemId];
                if (!itemData) return null;
                const isSelected = invItem.instanceId === selectedItemInstanceId;

                return (
                  <button
                    key={invItem.instanceId}
                    onClick={() => setSelectedItemInstanceId(invItem.instanceId)}
                    className={`relative aspect-square rounded-lg border p-1 flex flex-col items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-800 hover:border-amber-700/50'
                    }`}
                  >
                    <span className="text-2xl mt-1">{itemData.icon}</span>
                    <span className="text-[10px] font-bold text-amber-200 truncate w-full text-center">
                      {invItem.refineLevel > 0 ? `+${invItem.refineLevel}` : ''}
                    </span>
                    <span className="absolute top-1 right-1 px-1 py-0.2 bg-slate-950/80 border border-slate-700 text-[9px] font-mono text-amber-300 rounded">
                      x{invItem.amount}
                    </span>
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-slate-500 italic">
                  Nenhum item nesta categoria.
                </div>
              )}
            </div>

            {/* Painel do Item Selecionado */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              {selectedItemData && selectedInventoryItem ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-900 border border-amber-700/40 flex items-center justify-center text-2xl shrink-0">
                      {selectedItemData.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-amber-300 truncate">
                        {selectedInventoryItem.refineLevel > 0 ? `+${selectedInventoryItem.refineLevel} ` : ''}
                        {selectedItemData.name}
                        {selectedItemData.slots ? ` [${selectedItemData.slots}]` : ''}
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">{selectedItemData.type}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 leading-relaxed">
                    {selectedItemData.description}
                  </p>

                  <div className="text-[11px] font-mono space-y-0.5 text-slate-400">
                    <div>Peso: <span className="text-amber-200">{selectedItemData.weight}</span></div>
                    <div>Preço de Venda: <span className="text-amber-300">{selectedItemData.price} Zeny</span></div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {['weapon', 'armor', 'headgear', 'garment', 'shoes', 'accessory'].includes(selectedItemData.type) && (
                      <button
                        onClick={handleEquip}
                        className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Shield className="w-3.5 h-3.5" /> Equipar Item
                      </button>
                    )}

                    {selectedItemData.type === 'consumable' && (
                      <button
                        onClick={handleUse}
                        className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
                      >
                        Usar Poção
                      </button>
                    )}

                    <button
                      onClick={handleSell}
                      className="w-full py-1.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-xs border border-rose-700/50 cursor-pointer"
                    >
                      Vender (+{selectedItemData.price} Z)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 italic p-4">
                  Selecione um item no inventário para ver os detalhes.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
