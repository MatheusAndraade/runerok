import React from 'react';
import {
  UserCheck,
  ShieldAlert,
  Package,
  Zap,
  Map,
  BookOpen,
  Award,
  Anvil,
  Settings,
  Save,
  Code
} from 'lucide-react';

interface BottomNavProps {
  activeWindow: string | null;
  onToggleWindow: (windowId: string) => void;
  statPoints?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeWindow, onToggleWindow, statPoints = 0 }) => {
  const navItems = [
    { id: 'attributes', label: 'Atributos', icon: UserCheck, badge: statPoints > 0 ? statPoints : null },
    { id: 'equipment', label: 'Equipamento', icon: ShieldAlert },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'skills', label: 'Habilidades', icon: Zap },
    { id: 'worldmap', label: 'Mapa', icon: Map },
    { id: 'monsterbook', label: 'Bestiário', icon: BookOpen },
    { id: 'collection', label: 'Cartas', icon: Award },
    { id: 'refine', label: 'Refino', icon: Anvil },
    { id: 'save', label: 'Salvar', icon: Save },
    { id: 'settings', label: 'Ajustes', icon: Settings },
    { id: 'dev', label: 'Dev', icon: Code }
  ];

  return (
    <div className="w-full bg-slate-900/95 border-t border-amber-900/40 backdrop-blur-md px-2 py-1.5 flex items-center justify-start sm:justify-around overflow-x-auto gap-1 text-xs select-none scrollbar-thin scrollbar-thumb-amber-800 shrink-0">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeWindow === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onToggleWindow(item.id)}
            className={`relative flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-amber-600/30 text-amber-200 border border-amber-500/60 shadow-lg scale-105'
                : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/80'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="font-medium whitespace-nowrap text-[10px] sm:text-[11px]">{item.label}</span>

            {item.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold bg-rose-600 text-white rounded-full animate-pulse border border-rose-400">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
