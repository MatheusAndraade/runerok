import React, { useEffect, useState } from 'react';
import { SaveData, InventoryItem, EquipmentSlot } from '../../types/game';
import { GUILD_MISSIONS, GUILD_RECIPES, GUILD_SHOP } from '../../data/guild';
import { ITEMS } from '../../data/items';
import { MONSTERS } from '../../data/monsters';
import { ItemSprite } from '../ItemSprite';
import { Hammer, ScrollText, ShoppingBag, X } from 'lucide-react';

interface GuildHubWindowProps {
  saveData: SaveData;
  onBuy: (itemId: string) => string;
  onSell: (item: InventoryItem) => void;
  onCraft: (recipeId: string) => string;
  onClaimMission: (missionId: string) => string;
  onRefine: (slot: EquipmentSlot) => { success: boolean; message: string };
  initialTab?: 'shop' | 'forge' | 'missions';
  onClose: () => void;
}

export const GuildHubWindow: React.FC<GuildHubWindowProps> = ({ saveData, onBuy, onSell, onCraft, onClaimMission, onRefine, initialTab = 'shop', onClose }) => {
  const [tab, setTab] = useState<'shop' | 'forge' | 'missions'>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);
  const [message, setMessage] = useState('Bem-vindo à Guilda dos Aventureiros de Prontera.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 select-none">
      <div className="ro-classic-modal w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col">
        <div className="ro-modal-title"><strong>Guilda dos Aventureiros de Prontera</strong><button onClick={onClose}><X className="w-4 h-4" /></button></div>
        <div className="grid grid-cols-3 border-b border-[#8292b0]">
          <button className={tab === 'shop' ? 'is-active' : ''} onClick={() => setTab('shop')}><ShoppingBag className="w-4 h-4" /> Compra & Venda</button>
          <button className={tab === 'forge' ? 'is-active' : ''} onClick={() => setTab('forge')}><Hammer className="w-4 h-4" /> Ferreiro</button>
          <button className={tab === 'missions' ? 'is-active' : ''} onClick={() => setTab('missions')}><ScrollText className="w-4 h-4" /> Quadro de Missões</button>
        </div>
        <div className="p-3 overflow-y-auto flex-1 bg-[#f7f9fc] text-[#243454]">
          {tab === 'shop' && (
            <div className="grid md:grid-cols-2 gap-4">
              <section className="ro-guild-list"><h3>Mercadora Kafra — Comprar</h3>{GUILD_SHOP.map(offer => { const item = ITEMS[offer.itemId]; return <button key={offer.itemId} onClick={() => setMessage(onBuy(offer.itemId))}><ItemSprite itemId={offer.itemId} /><span><strong>{item.name}</strong><small>{offer.price.toLocaleString()} Zeny</small></span></button>; })}</section>
              <section className="ro-guild-list"><h3>Seu inventário — Vender</h3>{saveData.inventory.map(item => { const data = ITEMS[item.itemId]; return data ? <button key={item.instanceId} onClick={() => { onSell(item); setMessage(`${data.name} vendido.`); }}><ItemSprite itemId={item.itemId} /><span><strong>{data.name} x{item.amount}</strong><small>{(data.price * item.amount).toLocaleString()} Zeny</small></span></button> : null; })}</section>
            </div>
          )}
          {tab === 'forge' && <div className="grid md:grid-cols-2 gap-4"><section className="ro-guild-list"><h3>Forjar equipamentos</h3>{GUILD_RECIPES.map(recipe => <button key={recipe.id} onClick={() => setMessage(onCraft(recipe.id))}><ItemSprite itemId={recipe.resultItemId} /><span><strong>{recipe.name}</strong><small>{recipe.materials.map(material => `${ITEMS[material.itemId]?.name} x${material.amount}`).join(' • ')} • {recipe.zenyCost.toLocaleString()} Z</small></span></button>)}</section><section className="ro-guild-list"><h3>Refinar equipamento</h3>{(Object.entries(saveData.equipment) as Array<[EquipmentSlot, InventoryItem | null]>).map(([slot, item]) => item ? <button key={slot} onClick={() => setMessage(onRefine(slot).message)}><ItemSprite itemId={item.itemId} /><span><strong>+{item.refineLevel} {ITEMS[item.itemId]?.name}</strong><small>Próximo refino: {(item.refineLevel + 1) * 2000} Zeny</small></span></button> : null)}</section></div>}
          {tab === 'missions' && <section className="ro-guild-list"><h3>Quadro de Missões</h3>{GUILD_MISSIONS.map(mission => { const kills = saveData.monsterKills[mission.monsterId] || 0; const claimed = saveData.claimedGuildMissions?.includes(mission.id); return <button key={mission.id} disabled={claimed || kills < mission.requiredKills} onClick={() => setMessage(onClaimMission(mission.id))}><span className="ro-mission-seal">!</span><span><strong>{mission.title}</strong><small>Eliminar {MONSTERS[mission.monsterId]?.name}: {Math.min(kills, mission.requiredKills)}/{mission.requiredKills} • Recompensa: {mission.zenyReward.toLocaleString()} Z {claimed ? '• CONCLUÍDA' : ''}</small></span></button>; })}</section>}
        </div>
        <div className="ro-guild-message">{message}<strong>{saveData.character.zeny.toLocaleString()} Zeny</strong></div>
      </div>
    </div>
  );
};
