import React from 'react';
import { GameEngine } from '../../core/GameEngine';
import { ITEMS } from '../../data/items';
import { MONSTERS } from '../../data/monsters';
import { Code, X, Sparkles, Coins, Zap, Shield, Gift } from 'lucide-react';

interface DevPanelProps {
  onRefresh: () => void;
  onClose: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({ onRefresh, onClose }) => {
  const engine = GameEngine.getInstance();

  const handleAddExp = () => {
    engine.saveData.character.baseExp += 50000;
    engine.updateLogic(0.01);
    onRefresh();
  };

  const handleAddZeny = () => {
    engine.saveData.character.zeny += 100000;
    onRefresh();
  };

  const handleSpawnMvp = () => {
    const mvpData = MONSTERS['doppelganger'];
    if (mvpData) {
      engine.activeMonsters.push({
        instanceId: `mvp_${Date.now()}`,
        data: mvpData,
        x: engine.playerPos.x + 100,
        y: engine.playerPos.y + 50,
        currentHp: mvpData.hp,
        state: 'IDLE',
        lastAttackTime: 0,
        attackAnimationProgress: 0,
        animFrame: 0,
        direction: 'down'
      });
      engine.addFloatingText('★ MVP CHEFE DOPPELGANGER INVOCADO! ★', engine.playerPos.x, engine.playerPos.y - 40, '#f59e0b', 1.5);
    }
  };

  const handleForceCardDrop = () => {
    const cardData = ITEMS['card_raydric'];
    if (cardData) {
      engine.droppedItems.push({
        instanceId: `dev_card_${Date.now()}`,
        itemId: cardData.id,
        x: engine.playerPos.x + 30,
        y: engine.playerPos.y + 20,
        amount: 1,
        spawnTime: Date.now()
      });
    }
  };

  const handleMaxLevel = () => {
    engine.saveData.character.baseLevel = 99;
    engine.saveData.character.statPoints += 200;
    engine.updateDerivedStats();
    onRefresh();
  };

  const handleGiveGear = () => {
    const itemsToGive = ['sword_flamberge', 'spear_lance', '2hsword_claymore', 'armor_full_plate', 'shield_shield', 'card_raydric', 'card_minorous'];
    itemsToGive.forEach(id => {
      engine.saveData.inventory.push({
        instanceId: `dev_gear_${Date.now()}_${Math.random()}`,
        itemId: id,
        refineLevel: 7,
        cards: [],
        amount: 1
      });
      if (!engine.saveData.itemsDiscovered.includes(id)) engine.saveData.itemsDiscovered.push(id);
    });
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-rose-950 to-slate-900 px-4 py-3 border-b border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-base sm:text-lg text-rose-200">Painel do Desenvolvedor (Dev)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto font-mono text-xs">
          <button
            onClick={handleAddExp}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Adicionar +50.000 EXP de Base</span>
          </button>

          <button
            onClick={handleAddZeny}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Coins className="w-4 h-4" />
            <span>Adicionar +100.000 Zeny</span>
          </button>

          <button
            onClick={handleSpawnMvp}
            className="w-full py-2 bg-rose-700 hover:bg-rose-600 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Invocador de Chefe MVP (Doppelganger)</span>
          </button>

          <button
            onClick={handleForceCardDrop}
            className="w-full py-2 bg-purple-700 hover:bg-purple-600 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Gift className="w-4 h-4" />
            <span>Dropar Carta no Chão (Carta Raydric)</span>
          </button>

          <button
            onClick={handleGiveGear}
            className="w-full py-2 bg-sky-700 hover:bg-sky-600 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Shield className="w-4 h-4" />
            <span>Dar Equipamentos +7 de Cavaleiro</span>
          </button>

          <button
            onClick={handleMaxLevel}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 font-bold text-white rounded flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Elevar Cavaleiro ao Nível 99</span>
          </button>
        </div>
      </div>
    </div>
  );
};
