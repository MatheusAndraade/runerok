import React, { useState } from 'react';
import { SaveData, HotbarEntry } from '../../types/game';
import { SKILLS } from '../../data/skills';
import { ITEMS } from '../../data/items';
import { ItemSprite } from '../ItemSprite';
import { X } from 'lucide-react';

interface HotbarWindowProps {
  saveData: SaveData;
  onChange: (entries: Array<HotbarEntry | null>) => void;
  onClose: () => void;
}

export const HotbarWindow: React.FC<HotbarWindowProps> = ({ saveData, onChange, onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState(0);
  const entries = Array.from({ length: 9 }, (_, index) => saveData.hotbar?.[index] || null);
  const consumables = Object.values(ITEMS).filter(item => item.type === 'consumable');

  const setEntry = (entry: HotbarEntry | null) => {
    const next = [...entries];
    next[selectedSlot] = entry;
    onChange(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 select-none">
      <div className="ro-classic-modal w-full max-w-2xl overflow-hidden">
        <div className="ro-modal-title"><strong>Configurar Barra Rápida</strong><button onClick={onClose}><X className="w-4 h-4" /></button></div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-9 gap-1">
            {entries.map((entry, index) => (
              <button key={index} onClick={() => setSelectedSlot(index)} className={`ro-config-slot ${selectedSlot === index ? 'is-selected' : ''}`}>
                {entry?.kind === 'skill' && <span>{SKILLS[entry.refId]?.icon}</span>}
                {entry?.kind === 'item' && <ItemSprite itemId={entry.refId} className="w-8 h-8" />}
                <small>{index + 1}</small>
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <section className="ro-config-list">
              <h3>Habilidades</h3>
              {Object.values(SKILLS).filter(skill => skill.type === 'ACTIVE').map(skill => (
                <button key={skill.id} onClick={() => setEntry({ kind: 'skill', refId: skill.id })}><span>{skill.icon}</span><strong>{skill.name}</strong></button>
              ))}
            </section>
            <section className="ro-config-list">
              <h3>Consumíveis</h3>
              {consumables.map(item => (
                <button key={item.id} onClick={() => setEntry({ kind: 'item', refId: item.id })}>
                  <ItemSprite itemId={item.id} className="w-8 h-8" /><strong>{item.name}</strong><small>x{saveData.inventory.find(inv => inv.itemId === item.id)?.amount || 0}</small>
                </button>
              ))}
            </section>
          </div>
          <button className="ro-classic-button px-3 py-2 text-xs" onClick={() => setEntry(null)}>Limpar espaço selecionado</button>
        </div>
      </div>
    </div>
  );
};
