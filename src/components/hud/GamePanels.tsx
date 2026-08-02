import React from 'react';
import {
  Award,
  BookOpen,
  Code,
  Map,
  Plus,
  Settings,
  Sparkles,
  Sword,
  Wrench
} from 'lucide-react';
import { SaveData, DerivedStats, EquipmentSlot, SkillRule, StatType } from '../../types/game';
import { ITEMS } from '../../data/items';
import { SKILLS } from '../../data/skills';

interface GamePanelsProps {
  saveData: SaveData;
  derivedStats: DerivedStats;
  activeWindow: string | null;
  onToggleWindow: (windowId: string) => void;
  onAllocateStat: (stat: StatType) => void;
  onUpdateRules: (rules: SkillRule[]) => void;
  onExitToMenu: () => void;
}

const equipmentSlots: Array<{ key: EquipmentSlot; short: string }> = [
  { key: 'headTop', short: 'Topo' },
  { key: 'headMid', short: 'Meio' },
  { key: 'headLow', short: 'Baixo' },
  { key: 'armor', short: 'Armadura' },
  { key: 'weapon', short: 'Arma' },
  { key: 'shield', short: 'Escudo' },
  { key: 'garment', short: 'Capa' },
  { key: 'shoes', short: 'Botas' }
];

const statRows: Array<{ key: StatType; label: string }> = [
  { key: 'str', label: 'FOR' },
  { key: 'agi', label: 'AGI' },
  { key: 'vit', label: 'VIT' },
  { key: 'int', label: 'INT' },
  { key: 'dex', label: 'DES' },
  { key: 'luk', label: 'SOR' }
];

const menuItems = [
  { id: 'worldmap', label: 'Mapa', icon: Map },
  { id: 'refine', label: 'Refino', icon: Wrench },
  { id: 'monsterbook', label: 'Bestiário', icon: BookOpen },
  { id: 'collection', label: 'Cartas', icon: Award },
  { id: 'settings', label: 'Ajustes', icon: Settings },
  { id: 'dev', label: 'Dev', icon: Code }
];

const Gauge = ({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) => {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span>{label}</span>
        <span>{Math.floor(value)} / {Math.floor(max)}</span>
      </div>
      <div className="ro-panel-gauge">
        <div className={tone} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const GamePanels: React.FC<GamePanelsProps> = ({
  saveData,
  derivedStats,
  activeWindow,
  onToggleWindow,
  onAllocateStat,
  onUpdateRules,
  onExitToMenu
}) => {
  const skills = Object.values(SKILLS);
  const inventoryItems = saveData.inventory.slice(0, 20);
  const activeRules = saveData.skillRules.filter(rule => SKILLS[rule.skillId]);

  const toggleRule = (ruleId: string) => {
    onUpdateRules(saveData.skillRules.map(rule => (
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    )));
  };

  return (
    <>
      <aside className="ro-side-column ro-left-column">
        <section className="ro-dock-window ro-player-panel">
          <div className="ro-dock-title">
            <span>◉ Informações Básicas</span>
            <button onClick={onExitToMenu} title="Voltar ao menu">×</button>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <strong className="block text-sm text-slate-900">{saveData.character.name}</strong>
                <span className="block text-[11px] text-slate-600">{saveData.character.className}</span>
              </div>
              <div className="ro-level-badge">Nv. {saveData.character.baseLevel}</div>
            </div>
            <Gauge label="HP" value={saveData.character.currentHp} max={derivedStats.maxHp} tone="ro-hp-fill" />
            <Gauge label="SP" value={saveData.character.currentSp} max={derivedStats.maxSp} tone="ro-sp-fill" />
            <div className="ro-info-strip">
              <span>Base Lv. {saveData.character.baseLevel}</span>
              <span>Classe: {saveData.character.className}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-700">
              <span>Peso: {derivedStats.weight}/{derivedStats.weightLimit}</span>
              <span className="text-right">Zeny: {saveData.character.zeny.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className="ro-dock-window ro-skills-panel">
          <button className="ro-dock-title w-full" onClick={() => onToggleWindow('skills')}>
            <span>◉ Árvore de Habilidades</span>
            <span>Detalhes ›</span>
          </button>
          <div className="ro-skill-grid">
            {skills.map(skill => {
              const rule = saveData.skillRules.find(item => item.skillId === skill.id);
              return (
                <button
                  key={skill.id}
                  className={`ro-skill-cell ${rule?.enabled ? 'is-enabled' : ''}`}
                  onClick={() => onToggleWindow('skills')}
                  title={skill.name}
                >
                  <span className="ro-skill-icon">{skill.icon}</span>
                  <span>{skill.name.split(' ')[0]}</span>
                  <small>{rule?.enabled ? 'AUTO' : `Nv.${skill.minLevel}`}</small>
                </button>
              );
            })}
          </div>
          <div className="ro-panel-footer">Skills automáticas: {activeRules.filter(rule => rule.enabled).length}</div>
        </section>

        <section className="ro-dock-window ro-menu-panel">
          <div className="ro-dock-title"><span>◉ Menus</span></div>
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onToggleWindow(item.id)}
                  className={`ro-menu-button ${activeWindow === item.id ? 'is-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </aside>

      <aside className="ro-side-column ro-right-column">
        <section className="ro-dock-window ro-equipment-panel">
          <button className="ro-dock-title w-full" onClick={() => onToggleWindow('equipment')}>
            <span>◉ Equipamentos & Status</span>
            <span>Detalhes ›</span>
          </button>
          <div className="grid grid-cols-[1fr_1fr] gap-2 p-2 min-h-0">
            <div className="grid grid-cols-2 gap-1 content-start">
              {equipmentSlots.map(slot => {
                const item = saveData.equipment[slot.key];
                const itemData = item ? ITEMS[item.itemId] : null;
                return (
                  <button
                    key={slot.key}
                    className="ro-equip-cell"
                    onClick={() => onToggleWindow('equipment')}
                    title={itemData?.name || slot.short}
                  >
                    <span>{itemData?.icon || '·'}</span>
                    <small>{slot.short}</small>
                  </button>
                );
              })}
            </div>
            <div className="space-y-0.5">
              {statRows.map(stat => (
                <div key={stat.key} className="ro-stat-row">
                  <strong>{stat.label}</strong>
                  <span>{saveData.character.stats[stat.key]}</span>
                  <button
                    onClick={() => onAllocateStat(stat.key)}
                    disabled={saveData.character.statPoints <= 0}
                    title={`Aumentar ${stat.label}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="ro-derived-stats">
                <span>ATQ <b>{derivedStats.atk}</b></span>
                <span>DEF <b>{derivedStats.def}</b></span>
                <span>HIT <b>{derivedStats.hit}</b></span>
                <span>FLEE <b>{derivedStats.flee}</b></span>
                <span>ASPD <b>{derivedStats.aspd}</b></span>
                <span>Pts <b>{saveData.character.statPoints}</b></span>
              </div>
            </div>
          </div>
        </section>

        <section className="ro-dock-window ro-inventory-panel">
          <button className="ro-dock-title w-full" onClick={() => onToggleWindow('inventory')}>
            <span>◉ Inventário</span>
            <span>Abrir ›</span>
          </button>
          <div className="ro-mini-inventory">
            {inventoryItems.map(item => {
              const itemData = ITEMS[item.itemId];
              if (!itemData) return null;
              return (
                <button key={item.instanceId} onClick={() => onToggleWindow('inventory')} title={itemData.name}>
                  <span>{itemData.icon}</span>
                  <small>{item.amount}</small>
                </button>
              );
            })}
            {Array.from({ length: Math.max(0, 20 - inventoryItems.length) }).map((_, index) => (
              <div className="ro-empty-slot" key={`empty-${index}`} />
            ))}
          </div>
          <div className="ro-panel-footer">{saveData.inventory.length} tipos de item</div>
        </section>
      </aside>

      <div className="ro-active-hotbar">
        <div className="ro-hotbar-handle"><Sword className="w-4 h-4" /> Skills Ativas</div>
        <div className="flex items-center justify-center gap-1">
          {activeRules.map((rule, index) => {
            const skill = SKILLS[rule.skillId];
            return (
              <button
                key={rule.id}
                className={`ro-active-skill ${rule.enabled ? 'is-enabled' : ''}`}
                onClick={() => toggleRule(rule.id)}
                title={`${skill.name} — clique para ${rule.enabled ? 'desativar' : 'ativar'}`}
              >
                <span>{skill.icon}</span>
                <small>{index + 1}</small>
              </button>
            );
          })}
          {activeRules.length === 0 && (
            <button className="ro-empty-hotbar" onClick={() => onToggleWindow('skills')}>
              <Sparkles className="w-4 h-4" /> Configurar habilidades
            </button>
          )}
        </div>
      </div>
    </>
  );
};
