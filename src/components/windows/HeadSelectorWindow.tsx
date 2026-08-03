import React from 'react';
import { X } from 'lucide-react';

interface HeadSelectorWindowProps {
  selectedStyle: number;
  onSelect: (style: number) => void;
  onClose: () => void;
}

const headPath = (style: number, direction: 'down' | 'left' | 'up') =>
  `/game-assets/official/heads/head-${String(style).padStart(2, '0')}/${direction}.png`;

export const HeadSelectorWindow: React.FC<HeadSelectorWindowProps> = ({ selectedStyle, onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3">
    <div className="ro-classic-modal ro-head-selector">
      <div className="ro-modal-title">
        <strong>Seletor de Head</strong>
        <button onClick={onClose} title="Fechar"><X className="h-4 w-4" /></button>
      </div>

      <div className="ro-head-preview">
        {(['left', 'down', 'up'] as const).map(direction => (
          <div key={direction}>
            <img src={headPath(selectedStyle, direction)} alt={`Head ${direction}`} />
            <small>{direction === 'down' ? 'Frente' : direction === 'left' ? 'Lado' : 'Costas'}</small>
          </div>
        ))}
      </div>

      <p className="ro-head-help">Escolha o visual do cabelo. A alteração aparece imediatamente no personagem e é salva automaticamente.</p>

      <div className="ro-head-grid">
        {Array.from({ length: 10 }, (_, style) => (
          <button
            key={style}
            className={style === selectedStyle ? 'is-selected' : ''}
            onClick={() => onSelect(style)}
            title={`Head ${style + 1}`}
          >
            <img src={headPath(style, 'down')} alt={`Head ${style + 1}`} />
            <span>Head {style + 1}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
