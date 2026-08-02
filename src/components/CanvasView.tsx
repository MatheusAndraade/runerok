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

    let animFrameId: number;
    let lastTime = performance.now();
    let logicAcc = 0;
    const LOGIC_STEP = 0.05; // 20Hz logic updates (50ms)

    const renderLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
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
        hpPct,
        engine.activeMonsters,
        engine.droppedItems,
        engine.floatingTexts,
        engine.weatherParticles,
        engine.levelUpEffect,
        engine.attackParticles,
        engine.mapFadeAlpha,
        engine.mapTransitionName,
        engine.saveData?.character.name || 'Cavaleiro'
      );

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-slate-900 shadow-2xl cursor-crosshair"
      />
    </div>
  );
};
