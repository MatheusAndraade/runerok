import React from 'react';
import {
  Award,
  BookOpen,
  Map,
  Plus,
  Settings,
  Sword,
  Users
} from 'lucide-react';
import { SaveData, DerivedStats, EquipmentSlot, SkillRule, StatType } from '../../types/game';
import { ITEMS } from '../../data/items';
import { SKILLS } from '../../data/skills';
import { ItemSprite } from '../ItemSprite';
import { getExpForLevel } from '../../data/expTable';

interface GamePanelsProps {
  saveData: SaveData;
  derivedStats: DerivedStats;
  activeWindow: string | null;
  onToggleWindow: (windowId: string) => void;
  onAllocateStat: (stat: StatType) => void;
  onUpdateRules: (rules: SkillRule[]) => void;
  onUseHotbarItem: (itemId: string) => void;
  onOpenHotbar: () => void;
  onOpenHeadSelector: () => void;
  onTravelToGuild: () => void;
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
  { id: 'monsterbook', label: 'Bestiário', icon: BookOpen },
  { id: 'collection', label: 'Cartas', icon: Award },
  { id: 'settings', label: 'Ajustes', icon: Settings },
  { id: 'guild', label: 'Guilda', icon: Users }
];

const HoldStatButton = ({ onIncrease, disabled, label }: { onIncrease: () => void; disabled: boolean; label: string }) => {
  const timeoutRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);
  const stop = React.useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  React.useEffect(() => stop, [stop]);

  const start = () => {
    if (disabled) return;
    onIncrease();
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(onIncrease, 70);
    }, 280);
  };

  return (
    <button
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      disabled={disabled}
      title={`Segure para aumentar ${label}`}
    >
      <Plus className="w-3 h-3" />
    </button>
  );
};

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
  onUseHotbarItem,
  onOpenHotbar,
  onOpenHeadSelector,
  onTravelToGuild,
  onExitToMenu
}) => {
  const skills = Object.values(SKILLS);
  const inventoryItems = saveData.inventory.slice(0, 40);
  const activeRules = saveData.skillRules.filter(rule => SKILLS[rule.skillId]);
  const hotbar = saveData.hotbar || [];
  const expRequired = getExpForLevel(saveData.character.baseLevel);
  const expPct = Math.min(100, (saveData.character.baseExp / Math.max(1, expRequired)) * 100);

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
                <span className="block text-[10px] text-slate-700">{saveData.character.className}</span>
              </div>
            </div>
            <Gauge label="HP" value={saveData.character.currentHp} max={derivedStats.maxHp} tone="ro-hp-fill" />
            <Gauge label="SP" value={saveData.character.currentSp} max={derivedStats.maxSp} tone="ro-sp-fill" />
            <div className="ro-info-strip">
              <span>Base Lv. {saveData.character.baseLevel}</span>
              <span>Job Lv. {saveData.character.jobLevel || 1}</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px]"><span>EXP</span><span>{saveData.character.baseExp.toLocaleString()} / {expRequired.toLocaleString()}</span></div>
              <div className="ro-exp-gauge"><div style={{ width: `${expPct}%` }} /></div>
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
                  <small>{rule?.enabled ? `AUTO • Nv.${saveData.skillLevels?.[skill.id] || 1}` : `Nv.${saveData.skillLevels?.[skill.id] || 1}`}</small>
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
                  onClick={() => item.id === 'guild' ? onTravelToGuild() : onToggleWindow(item.id)}
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
          <div className="ro-equipment-overview">
            <div className="ro-equipment-paperdoll-layout">
              {[equipmentSlots.slice(0, 4), equipmentSlots.slice(4, 8)].map((slots, column) => (
                <div className={`ro-equip-side ro-equip-side-${column}`} key={column}>
                  {slots.map(slot => {
                    const item = saveData.equipment[slot.key];
                    const itemData = item ? ITEMS[item.itemId] : null;
                    return <button key={slot.key} className="ro-equip-cell" onClick={() => onToggleWindow('equipment')} title={itemData?.name || slot.short}>{itemData ? <ItemSprite itemId={itemData.id} /> : <span>·</span>}<small>{slot.short}</small></button>;
                  })}
                </div>
              ))}
              <button className="ro-character-paperdoll ro-paperdoll-centered" onClick={onOpenHeadSelector} title="Alterar head">
                <div className="ro-player-preview"><img className="ro-preview-body" src="/game-assets/official/knight/idle/down/0.png" alt="Knight" /><img className="ro-preview-head" src={`/game-assets/official/heads/head-${String(saveData.character.headStyle ?? 0).padStart(2, '0')}/down.png`} alt="Head" /></div><strong>Head</strong>
              </button>
            </div>
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
                    {itemData ? <ItemSprite itemId={itemData.id} /> : <span className="ro-empty-equip-dot">·</span>}
                    <small>{slot.short}</small>
                  </button>
                );
              })}
            </div>
            <button className="ro-character-paperdoll" onClick={onOpenHeadSelector} title="Alterar head do personagem">
              <div className="ro-player-preview">
                <img className="ro-preview-body" src="/game-assets/official/knight/idle/down/0.png" alt="Knight" />
                <img
                  className="ro-preview-head"
                  src={`/game-assets/official/heads/head-${String(saveData.character.headStyle ?? 0).padStart(2, '0')}/down.png`}
                  alt="Head selecionada"
                />
              </div>
              <strong>Alterar Head</strong>
            </button>
          </div>
        </section>

        <section className="ro-dock-window ro-attributes-panel">
          <button className="ro-dock-title w-full" onClick={() => onToggleWindow('attributes')}>
            <span>◉ Atributos</span>
            <span>Detalhes ›</span>
          </button>
          <div className="grid grid-cols-[1fr_1.25fr] gap-2 p-2 min-h-0">
            <div className="space-y-0.5">
              {statRows.map(stat => (
                <div key={stat.key} className="ro-stat-row">
                  <strong>{stat.label}</strong>
                  <span>{saveData.character.stats[stat.key]}</span>
                  <HoldStatButton
                    onIncrease={() => onAllocateStat(stat.key)}
                    disabled={saveData.character.statPoints <= 0}
                    label={stat.label}
                  />
                </div>
              ))}
            </div>
            <div className="ro-derived-stats">
              <span>ATQ <b>{derivedStats.atk}</b></span>
              <span>DEF <b>{derivedStats.def}</b></span>
              <span>HIT <b>{derivedStats.hit}</b></span>
              <span>FLEE <b>{derivedStats.flee}</b></span>
              <span>CRIT <b>{derivedStats.crit}</b></span>
              <span>ASPD <b>{derivedStats.aspd}</b></span>
              <span>Pontos <b>{saveData.character.statPoints}</b></span>
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
                  <ItemSprite itemId={itemData.id} />
                  <small>{item.amount}</small>
                </button>
              );
            })}
            {Array.from({ length: Math.max(0, 40 - inventoryItems.length) }).map((_, index) => (
              <div className="ro-empty-slot" key={`empty-${index}`} />
            ))}
          </div>
          <div className="ro-panel-footer">{saveData.inventory.length} tipos de item</div>
        </section>
      </aside>

      <div className="ro-active-hotbar">
        <button className="ro-hotbar-handle" onClick={onOpenHotbar} title="Configurar barra modular"><Sword className="w-4 h-4" /> Barra Rápida</button>
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 9 }).map((_, index) => {
            const entry = hotbar[index] || null;
            if (!entry) {
              return <button key={`hotbar-empty-${index}`} className="ro-active-skill ro-hotbar-empty" onClick={onOpenHotbar}><small>{index + 1}</small></button>;
            }

            if (entry.kind === 'item') {
              const itemData = ITEMS[entry.refId];
              const amount = saveData.inventory.find(item => item.itemId === entry.refId)?.amount || 0;
              return (
                <button key={`hotbar-item-${index}`} className="ro-active-skill is-enabled" onClick={() => onUseHotbarItem(entry.refId)} title={`${itemData?.name || entry.refId} — ${amount} no inventário`}>
                  <ItemSprite itemId={entry.refId} className="w-8 h-8" />
                  <em>{amount}</em><small>{index + 1}</small>
                </button>
              );
            }

            const skill = SKILLS[entry.refId];
            const rule = saveData.skillRules.find(item => item.skillId === entry.refId);
            if (!skill) return null;
            return (
              <button
                key={`hotbar-skill-${index}`}
                className={`ro-active-skill ${rule?.enabled ? 'is-enabled' : ''}`}
                onClick={() => rule ? toggleRule(rule.id) : onOpenHotbar()}
                title={skill.name}
              >
                <span>{skill.icon}</span>
                <small>{index + 1}</small>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
