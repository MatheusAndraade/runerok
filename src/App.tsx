import React, { useState, useEffect } from 'react';
import { SaveData, EquipmentSlot, InventoryItem, SkillRule } from './types/game';
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
import { MAPS } from './data/maps';

export function GameContainer({ initialSave, onExitToMenu }: { initialSave: SaveData; onExitToMenu: () => void }) {
  const [saveData, setSaveData] = useState<SaveData>(initialSave);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [offlineResult, setOfflineResult] = useState<OfflineResult | null>(null);
  const [, setTickCounter] = useState(0);

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

  // Tick de atualização periódica da UI (4x por segundo)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickCounter(prev => prev + 1);
    }, 250);
    return () => clearInterval(interval);
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

  const isDead = engine.playerState === 'DEAD' || saveData.character.currentHp <= 0;

  const handleRespawn = () => {
    engine.respawnPlayer();
    setSaveData({ ...saveData });
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
          onClose={() => handleToggleWindow('skills')}
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
