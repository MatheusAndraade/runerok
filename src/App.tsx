import React, { useState, useEffect } from 'react';
import { SaveData, EquipmentSlot, InventoryItem, SkillRule, HotbarEntry } from './types/game';
import { GameEngine } from './core/GameEngine';
import { OfflineEngine, OfflineResult } from './systems/OfflineEngine';
import { CombatCalculator } from './combat/CombatCalculator';
import { AudioManager } from './core/AudioManager';

import { StartMenu } from './components/StartMenu';
import { GamePanels } from './components/hud/GamePanels';
import { CanvasView } from './components/CanvasView';
import { OrientationOverlay } from './components/OrientationOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';

import { AttributesWindow } from './components/windows/AttributesWindow';
import { EquipmentWindow } from './components/windows/EquipmentWindow';
import { InventoryWindow } from './components/windows/InventoryWindow';
import { SkillsWindow } from './components/windows/SkillsWindow';
import { WorldMapWindow } from './components/windows/WorldMapWindow';
import { MonsterBookWindow } from './components/windows/MonsterBookWindow';
import { CardCollectionWindow } from './components/windows/CardCollectionWindow';
import { RefineWindow } from './components/windows/RefineWindow';
import { SettingsWindow } from './components/windows/SettingsWindow';
import { DevModeWindow } from './components/windows/DevModeWindow';
import { OfflineModal } from './components/windows/OfflineModal';
import { DeathModal } from './components/windows/DeathModal';
import { HotbarWindow } from './components/windows/HotbarWindow';
import { GuildHubWindow } from './components/windows/GuildHubWindow';
import { HeadSelectorWindow } from './components/windows/HeadSelectorWindow';
import { MAPS } from './data/maps';
import { EventBus } from './core/EventBus';
import { GuildService } from './data/guildNpcs';

export function GameContainer({ initialSave, onExitToMenu }: { initialSave: SaveData; onExitToMenu: () => void }) {
  const [saveData, setSaveData] = useState<SaveData>(initialSave);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [offlineResult, setOfflineResult] = useState<OfflineResult | null>(null);
  const [, setTickCounter] = useState(0);
  const [guildTab, setGuildTab] = useState<GuildService>('shop');

  useEffect(() => {
    // Inicializar Engine com o save selecionado
    GameEngine.getInstance().init(saveData);

    // Simular caça offline se houver tempo decorrido
    const offResult = OfflineEngine.simulateOffline(saveData);
    if (offResult && offResult.elapsedSeconds > 60) {
      setOfflineResult(offResult);
    }

    const handleFirstClick = () => {
      AudioManager.getInstance().playBGM('prontera');
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // HUD acompanha a simulação com atualização visual fluida.
  useEffect(() => {
    const interval = setInterval(() => {
      setTickCounter(prev => prev + 1);
      const liveSave = GameEngine.getInstance().saveData;
      if (liveSave) setSaveData({ ...liveSave });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const openNpc = (service?: GuildService) => {
      setGuildTab(service || 'shop');
      setActiveWindow('guild');
    };
    EventBus.getInstance().on('GUILD_NPC_INTERACT', openNpc);
    return () => EventBus.getInstance().off('GUILD_NPC_INTERACT', openNpc);
  }, []);

  const engine = GameEngine.getInstance();
  const derivedStats = engine.derivedStats || CombatCalculator.calculateStats(saveData);

  const handleToggleWindow = (windowId: string) => {
    const next = activeWindow === windowId ? null : windowId;
    setActiveWindow(next);
    AudioManager.getInstance().playSFX('button');
  };

  const handleAllocateStat = (stat: 'str' | 'agi' | 'vit' | 'int' | 'dex' | 'luk') => {
    engine.allocateStatPoint(stat);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('button');
  };

  const handleEquipItem = (invItem: InventoryItem, slot: EquipmentSlot) => {
    engine.equipItem(invItem, slot);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('equip');
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    engine.unequipItem(slot);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('equip');
  };

  const handleUseConsumable = (invItem: InventoryItem) => {
    engine.useConsumable(invItem);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('potion');
  };

  const handleSellItem = (invItem: InventoryItem) => {
    engine.sellItem(invItem);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('coin');
  };

  const handleTravelToMap = (mapId: string) => {
    engine.travelToMap(mapId);
    setSaveData({ ...saveData });
    setActiveWindow(null);
  };

  const handleTravelToGuild = () => {
    if (engine.saveData.currentMapId !== 'prontera_guild') engine.travelToMap('prontera_guild');
    setActiveWindow(null);
  };

  const handleRefineEquipped = (slot: EquipmentSlot) => {
    const res = engine.refineEquippedItem(slot);
    setSaveData({ ...saveData });
    return res;
  };

  const handleDevAddExp = (base: number, job: number) => {
    engine.addExp(base, job);
    setSaveData({ ...saveData });
  };

  const handleDevAddZeny = (amount: number) => {
    saveData.character.zeny += amount;
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('coin');
  };

  const handleDevGrantCard = (cardId: string) => {
    engine.grantItem(cardId, 1);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('card_drop');
  };

  const handleDevSimulateOffline = (hours: number) => {
    const offlineSeconds = hours * 3600;
    const { updatedSave } = OfflineEngine.processOfflineTime(saveData, offlineSeconds);
    setSaveData(updatedSave);
    engine.updateSaveData(updatedSave);
    setActiveWindow(null);
  };

  const handleUpdateRules = (newRules: SkillRule[]) => {
    saveData.skillRules = newRules;
    engine.saveData.skillRules = newRules;
    setSaveData({ ...saveData });
  };

  const handleUpgradeSkill = (skillId: string) => {
    const result = engine.upgradeSkill(skillId);
    setSaveData({ ...engine.saveData });
    return result.message;
  };

  const handleUpdateHotbar = (entries: Array<HotbarEntry | null>) => {
    saveData.hotbar = entries;
    engine.saveData.hotbar = entries;
    setSaveData({ ...saveData });
  };

  const handleUseHotbarItem = (itemId: string) => {
    const item = saveData.inventory.find(entry => entry.itemId === itemId && entry.amount > 0);
    if (!item) return;
    engine.useConsumable(item);
    setSaveData({ ...saveData });
    AudioManager.getInstance().playSFX('potion');
  };

  const handleSelectHead = (style: number) => {
    const selectedStyle = Math.max(0, Math.min(9, style));
    saveData.character.headStyle = selectedStyle;
    engine.saveData.character.headStyle = selectedStyle;
    setSaveData({ ...saveData });
    engine.forceSave();
  };

  const isDead = engine.playerState === 'DEAD' || saveData.character.currentHp <= 0;

  const handleRespawn = () => {
    engine.respawnPlayer();
    setSaveData({ ...saveData });
    setActiveWindow('guild');
  };

  const handleGuildBuy = (itemId: string) => {
    const result = engine.buyGuildItem(itemId);
    setSaveData({ ...saveData });
    return result.message;
  };

  const handleGuildCraft = (recipeId: string) => {
    const result = engine.craftGuildRecipe(recipeId);
    setSaveData({ ...saveData });
    return result.message;
  };

  const handleGuildClaim = (missionId: string) => {
    const result = engine.claimGuildMission(missionId);
    setSaveData({ ...saveData });
    return result.message;
  };

  return (
    <div className="ro-game-shell w-screen h-screen flex flex-col overflow-hidden font-sans select-none relative">
      {/* Aviso para Girar Smartphone caso esteja em Retrato */}
      <OrientationOverlay />

      {/* Modal de Morte e Renascimento estilo Ragnarok Online */}
      {isDead && (
        <DeathModal
          mapName={MAPS[saveData.currentMapId]?.name || 'Prontera'}
          onRespawn={handleRespawn}
        />
      )}

      <main className="ro-game-stage">
        <div className="ro-canvas-stage">
          <CanvasView />
        </div>
        <GamePanels
          saveData={saveData}
          derivedStats={derivedStats}
          activeWindow={activeWindow}
          onToggleWindow={handleToggleWindow}
          onAllocateStat={handleAllocateStat}
          onUpdateRules={handleUpdateRules}
          onUseHotbarItem={handleUseHotbarItem}
          onOpenHotbar={() => setActiveWindow('hotbar')}
          onOpenHeadSelector={() => setActiveWindow('headSelector')}
          onTravelToGuild={handleTravelToGuild}
          onExitToMenu={onExitToMenu}
        />
      </main>

      {/* Modais das Janelas de Jogo */}
      {activeWindow === 'attributes' && (
        <AttributesWindow
          saveData={saveData}
          derivedStats={derivedStats}
          onAllocateStat={handleAllocateStat}
          onClose={() => handleToggleWindow('attributes')}
        />
      )}

      {activeWindow === 'equipment' && (
        <EquipmentWindow
          saveData={saveData}
          onUnequipItem={handleUnequipItem}
          onClose={() => handleToggleWindow('equipment')}
        />
      )}

      {activeWindow === 'inventory' && (
        <InventoryWindow
          saveData={saveData}
          weight={derivedStats.weight}
          weightLimit={derivedStats.weightLimit}
          onEquipItem={handleEquipItem}
          onUseConsumable={handleUseConsumable}
          onSellItem={handleSellItem}
          onClose={() => handleToggleWindow('inventory')}
        />
      )}

      {activeWindow === 'skills' && (
        <SkillsWindow
          saveData={saveData}
          onUpdateRules={handleUpdateRules}
          onUpgradeSkill={handleUpgradeSkill}
          onClose={() => handleToggleWindow('skills')}
        />
      )}

      {activeWindow === 'hotbar' && (
        <HotbarWindow saveData={saveData} onChange={handleUpdateHotbar} onClose={() => setActiveWindow(null)} />
      )}

      {activeWindow === 'headSelector' && (
        <HeadSelectorWindow
          selectedStyle={saveData.character.headStyle ?? 0}
          onSelect={handleSelectHead}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {activeWindow === 'guild' && (
        <GuildHubWindow
          saveData={saveData}
          initialTab={guildTab}
          onBuy={handleGuildBuy}
          onSell={handleSellItem}
          onCraft={handleGuildCraft}
          onClaimMission={handleGuildClaim}
          onRefine={handleRefineEquipped}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {(activeWindow === 'worldmap' || activeWindow === 'worldMap') && (
        <WorldMapWindow
          saveData={saveData}
          currentMapId={saveData.currentMapId}
          userLevel={saveData.character.baseLevel}
          onTravelToMap={handleTravelToMap}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {(activeWindow === 'monsterbook' || activeWindow === 'monsters') && (
        <MonsterBookWindow
          saveData={saveData}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {(activeWindow === 'collection' || activeWindow === 'cards') && (
        <CardCollectionWindow
          saveData={saveData}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {activeWindow === 'refine' && (
        <RefineWindow
          saveData={saveData}
          onRefineEquipped={handleRefineEquipped}
          onClose={() => handleToggleWindow('refine')}
        />
      )}

      {activeWindow === 'settings' && (
        <SettingsWindow
          onClose={() => handleToggleWindow('settings')}
        />
      )}

      {(activeWindow === 'dev' || activeWindow === 'devMode') && (
        <DevModeWindow
          saveData={saveData}
          onAddExp={handleDevAddExp}
          onAddZeny={handleDevAddZeny}
          onGrantCard={handleDevGrantCard}
          onSimulateOffline={handleDevSimulateOffline}
          onClose={() => setActiveWindow(null)}
        />
      )}

      {/* Relatório de Recompensas do Período Offline */}
      {offlineResult && (
        <OfflineModal
          result={offlineResult}
          onClose={() => setOfflineResult(null)}
        />
      )}
    </div>
  );
}

export function App() {
  const [activeSave, setActiveSave] = useState<SaveData | null>(null);

  return (
    <ErrorBoundary>
      <OrientationOverlay />
      {!activeSave ? (
        <StartMenu onSelectSave={(save) => setActiveSave(save)} />
      ) : (
        <GameContainer
          initialSave={activeSave}
          onExitToMenu={() => setActiveSave(null)}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
