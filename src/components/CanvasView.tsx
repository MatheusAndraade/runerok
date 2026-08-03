import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';
import { MAPS } from '../data/maps';
import { MapRenderer } from '../world/MapRenderer';

export const CanvasView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = GameEngine.getInstance();

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const handlePointerUp = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const map = MAPS[engine.saveData?.currentMapId || 'prt_fild01'] || MAPS.prt_fild01;
      engine.interactAt(
        ((event.clientX - rect.left) / Math.max(1, rect.width)) * map.width,
        ((event.clientY - rect.top) / Math.max(1, rect.height)) * map.height
      );
    };
    canvas.addEventListener('pointerup', handlePointerUp);

    let animFrameId: number;
    let lastTime = performance.now();
    let logicAcc = 0;
    const LOGIC_STEP = 1 / 60; // fixed 60 FPS simulation

    const renderLoop = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      logicAcc += dt;
      while (logicAcc >= LOGIC_STEP) {
        engine.updateLogic(LOGIC_STEP);
        logicAcc -= LOGIC_STEP;
      }

      // Render
      const currentMap = MAPS[engine.saveData?.currentMapId || 'prt_fild01'] || MAPS['prt_fild01'];
      const hpPct = engine.derivedStats ? Math.max(0, engine.saveData.character.currentHp / engine.derivedStats.maxHp) : 1;

      MapRenderer.renderMap(
        ctx,
        currentMap,
        engine.playerPos,
        engine.playerDir,
        engine.playerState,
        engine.playerAnimFrame,
        engine.playerAttackAnimationProgress,
        hpPct,
        engine.activeMonsters,
        engine.droppedItems,
        engine.floatingTexts,
        engine.weatherParticles,
        engine.levelUpEffect,
        engine.attackParticles,
        engine.mapFadeAlpha,
        engine.mapTransitionName,
        engine.saveData?.character.name || 'Cavaleiro',
        engine.saveData?.character.headStyle ?? 0
      );

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#253423] flex items-center justify-center overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block shadow-inner cursor-crosshair"
      />
    </div>
  );
};
