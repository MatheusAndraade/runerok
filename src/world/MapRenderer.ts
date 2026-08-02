import { ActiveMonster, DroppedItemInstance, MapData, Position, CombatFloatingText, AttackParticle, PlayerState } from '../types/game';
import { ITEMS } from '../data/items';

const fieldBackground = new Image();
fieldBackground.src = '/game-assets/prontera-field.png';

const spriteAtlas = new Image();
spriteAtlas.src = '/game-assets/sprite-atlas.png';

const spriteAtlasBack = new Image();
spriteAtlasBack.src = '/game-assets/sprite-atlas-back.png';

const MONSTER_SPRITES: Record<string, number> = {
  poring: 1,
  fabre: 2,
  lunatic: 3,
  pupa: 4,
  poporing: 5,
  rocker: 6,
  spore: 7,
  jiboia: 8,
  zombie: 9,
  skeleton: 10,
  pecopeco: 11,
  soldier_skeleton: 12,
  metaller: 13,
  orc_warrior: 14,
  zenorc: 15,
  high_orc: 16,
  mummy: 17,
  anolian: 18,
  minorous: 19,
  clock: 20,
  alarm: 21,
  injustice: 22,
  raydric: 23,
  golem_lava: 24,
  doppelganger: 23
};

function drawAtlasSprite(
  ctx: CanvasRenderingContext2D,
  index: number,
  x: number,
  y: number,
  size: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'down'
): boolean {
  const atlas = direction === 'up' ? spriteAtlasBack : spriteAtlas;
  if (!atlas.complete || atlas.naturalWidth === 0) return false;

  const cols = 5;
  const rows = 5;
  const sourceW = atlas.naturalWidth / cols;
  const sourceH = atlas.naturalHeight / rows;
  const col = index % cols;
  const row = Math.floor(index / cols);

  ctx.save();
  ctx.translate(x, y);
  if (direction === 'right') ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    atlas,
    col * sourceW,
    row * sourceH,
    sourceW,
    sourceH,
    -size / 2,
    -size * 0.72,
    size,
    size
  );
  ctx.restore();
  return true;
}

export class MapRenderer {
  public static renderMap(
    ctx: CanvasRenderingContext2D,
    map: MapData,
    playerPos: Position,
    playerDir: 'left' | 'right' | 'up' | 'down',
    playerState: PlayerState,
    playerAnimFrame: number,
    hpPercent: number,
    monsters: ActiveMonster[],
    droppedItems: DroppedItemInstance[],
    floatingTexts: CombatFloatingText[],
    weatherParticles: Array<{ x: number; y: number; speed: number; size: number }>,
    levelUpEffect: { active: boolean; progress: number },
    attackParticles: AttackParticle[] = [],
    mapFadeAlpha: number = 0,
    mapTransitionName: string = '',
    playerName: string = 'Cavaleiro'
  ) {
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    const mapW = map.width || 800;
    const mapH = map.height || 600;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Calculate camera zoom scale to fit entire combat map nicely on screen
    const scale = Math.min(canvasW / mapW, canvasH / mapH);
    const offsetX = (canvasW - mapW * scale) / 2;
    const offsetY = (canvasH - mapH * scale) / 2;

    ctx.save();
    // Extend the painted field behind the playable bounds instead of showing letterboxes.
    if (map.theme === 'grass' && fieldBackground.complete && fieldBackground.naturalWidth > 0) {
      ctx.drawImage(fieldBackground, 0, 0, canvasW, canvasH);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // Translate and scale coordinate system to full map bounds
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Clip rendering strictly to map area
    ctx.beginPath();
    ctx.rect(0, 0, mapW, mapH);
    ctx.clip();

    // 1. Draw Ground Base according to Theme
    MapRenderer.drawGround(ctx, map, mapW, mapH);

    // 2. Draw Obstacles (Trees, Rocks, Walls, Water)
    map.obstacles.forEach(obs => {
      // Grass maps already contain detailed foliage and rocks in the painted backdrop.
      if (map.theme !== 'grass') MapRenderer.drawObstacle(ctx, obs);
    });

    // 3. Draw Dropped Items
    droppedItems.forEach(item => {
      MapRenderer.drawDroppedItem(ctx, item);
    });

    // 4. Draw Monsters
    monsters.forEach(m => {
      if (m.state !== 'DEAD') {
        MapRenderer.drawMonster(ctx, m);
      }
    });

    // 5. Draw Knight Player Character with Save Name
    MapRenderer.drawPlayer(ctx, playerPos, playerDir, playerState, playerAnimFrame, hpPercent, playerName);

    // 6. Draw Level Up Golden Effect Ring
    if (levelUpEffect.active) {
      MapRenderer.drawLevelUpRing(ctx, playerPos, levelUpEffect.progress);
    }

    // 7. Draw Attack Spark Particles
    if (attackParticles && attackParticles.length > 0) {
      ctx.save();
      attackParticles.forEach(p => {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Spark trail line
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 8. Draw Floating Combat Text
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.floor(16 * ft.scale)}px sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.opacity));
      ctx.fillText(ft.text, ft.x - 15, ft.y);
      ctx.restore();
    });

    // 9. Draw Weather Particles
    MapRenderer.drawWeather(ctx, map.theme, weatherParticles, mapW, mapH);

    // 10. Draw Smooth Map Transition Overlay
    if (mapFadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, mapFadeAlpha));
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, mapW, mapH);

      if (mapTransitionName && mapFadeAlpha > 0.35) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'extrabold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillText(`VIAJANDO PARA ${mapTransitionName.toUpperCase()}...`, mapW / 2, mapH / 2);
      }
      ctx.restore();
    }

    ctx.restore(); // Restore outer camera transform
  }

  private static drawGround(ctx: CanvasRenderingContext2D, map: MapData, w: number, h: number) {
    if (map.theme === 'grass') {
      if (fieldBackground.complete && fieldBackground.naturalWidth > 0) {
        ctx.drawImage(fieldBackground, 0, 0, w, h);
        const tint = ctx.createLinearGradient(0, 0, 0, h);
        tint.addColorStop(0, 'rgba(255,255,210,0.04)');
        tint.addColorStop(1, 'rgba(30,70,20,0.08)');
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, w, h);
        return;
      }

      // Organic Grass Base
      ctx.fillStyle = '#228be6'; // Soft river / background accent or base
      ctx.fillStyle = '#34d399';
      ctx.fillRect(0, 0, w, h);

      // Grass texture tiles
      const tileSize = 40;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#10b981' : '#059669';
          ctx.fillRect(x, y, tileSize, tileSize);

          // Subtle organic grass blade details
          if ((x * 13 + y * 29) % 7 === 0) {
            ctx.fillStyle = '#6ee7b7';
            ctx.fillRect(x + 12, y + 10, 2, 6);
            ctx.fillRect(x + 15, y + 8, 2, 8);
          }
          if ((x * 17 + y * 31) % 5 === 0) {
            ctx.fillStyle = '#fef08a'; // Small wild flower dot
            ctx.beginPath();
            ctx.arc(x + 25, y + 25, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Dirt path running through field
      ctx.fillStyle = 'rgba(180, 130, 80, 0.4)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.4, h * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fill();

    } else if (map.theme === 'cave') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      const tileSize = 40;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#334155' : '#1e293b';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    } else if (map.theme === 'desert') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, w, h);

      const tileSize = 40;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#fde047' : '#eab308';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
      // Sand ripple curves
      ctx.strokeStyle = 'rgba(202, 138, 4, 0.3)';
      ctx.lineWidth = 3;
      for (let i = 50; i < h; i += 80) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.quadraticCurveTo(w / 2, i + 30, w, i);
        ctx.stroke();
      }
    } else if (map.theme === 'gothic' || map.theme === 'dungeon') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const tileSize = 40;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#18181b' : '#27272a';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#090d16';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
      // Glowing lava / rune cracks
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 100); ctx.lineTo(180, 220); ctx.lineTo(240, 200);
      ctx.moveTo(500, 400); ctx.lineTo(580, 480); ctx.lineTo(650, 450);
      ctx.stroke();
    }
  }

  private static drawObstacle(ctx: CanvasRenderingContext2D, obs: { x: number; y: number; w: number; h: number; type: string }) {
    ctx.save();
    // Drop Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h - 4, obs.w * 0.45, obs.h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obs.type === 'tree') {
      const centerX = obs.x + obs.w / 2;
      const bottomY = obs.y + obs.h;
      const trunkW = Math.max(8, obs.w * 0.22);
      const trunkH = obs.h * 0.45;

      // Tree Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(centerX - trunkW / 2, bottomY - trunkH, trunkW, trunkH);
      ctx.fillStyle = '#451a03'; // Trunk shadow
      ctx.fillRect(centerX - trunkW / 2, bottomY - trunkH, trunkW * 0.4, trunkH);

      // Layered Canopy
      const canopyRadius = obs.w * 0.45;
      const canopyCenterY = obs.y + obs.h * 0.38;

      // Outer Deep Leaf Layer
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(centerX, canopyCenterY, canopyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Middle Bright Leaf Layer
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(centerX - canopyRadius * 0.2, canopyCenterY - canopyRadius * 0.2, canopyRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Top Highlight Puff
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(centerX - canopyRadius * 0.3, canopyCenterY - canopyRadius * 0.3, canopyRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'rock') {
      const centerX = obs.x + obs.w / 2;
      const centerY = obs.y + obs.h / 2;
      const radius = obs.w / 2.2;

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'wall' || obs.type === 'building') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
    }
    ctx.restore();
  }

  private static drawDroppedItem(ctx: CanvasRenderingContext2D, item: DroppedItemInstance) {
    const itemData = ITEMS[item.itemId];
    ctx.save();
    // Sparkle pulse
    const pulse = Math.sin(Date.now() / 200) * 3;

    // Item Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(item.x, item.y + 10, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Card highlight beam if card
    if (itemData?.type === 'card') {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 20 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Icon rendering
    ctx.font = '18px sans-serif';
    ctx.fillText(itemData?.icon || '📦', item.x - 9, item.y + pulse);

    ctx.restore();
  }

  private static drawMonster(ctx: CanvasRenderingContext2D, m: ActiveMonster) {
    ctx.save();

    const isHit = (m.hitFlash || 0) > 0;
    const shakeX = isHit ? Math.sin((m.hitFlash || 0) * 80) * 6 : 0;
    const shakeY = isHit ? Math.cos((m.hitFlash || 0) * 80) * 3 : 0;

    ctx.translate(shakeX, shakeY);

    // Monster Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 12, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Procedural RO monster rendering
    const bobbing = Math.sin(Date.now() / 150) * 2;
    const monsterId = m.data.id;
    const spriteIndex = MONSTER_SPRITES[monsterId] ?? (m.data.isMvp ? 23 : 1);
    const spriteSize = m.data.size === 'Grande' ? 82 : m.data.size === 'Pequeno' ? 64 : 72;
    const spriteDrawn = drawAtlasSprite(ctx, spriteIndex, m.x, m.y + bobbing, spriteSize, m.direction);

    if (!spriteDrawn && (monsterId === 'poring' || monsterId === 'poporing')) {
      ctx.fillStyle = isHit ? '#ffffff' : (monsterId === 'poring' ? '#fb7185' : '#4ade80');
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + bobbing, 16, 14 + bobbing * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlights & Blush
      if (!isHit) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(m.x - 6, m.y - 6 + bobbing, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = monsterId === 'poring' ? '#f43f5e' : '#16a34a';
        ctx.beginPath();
        ctx.arc(m.x - 8, m.y + 2 + bobbing, 3, 0, Math.PI * 2);
        ctx.arc(m.x + 8, m.y + 2 + bobbing, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Eyes
      ctx.fillStyle = isHit ? '#ef4444' : '#0f172a';
      ctx.beginPath();
      ctx.arc(m.x - 5, m.y - 2 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.arc(m.x + 5, m.y - 2 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (!spriteDrawn && monsterId === 'fabre') {
      // Caterpillar body
      ctx.fillStyle = isHit ? '#ffffff' : '#84cc16';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(m.x - 10 + i * 10, m.y + bobbing + (i % 2), 9, 0, Math.PI * 2);
        ctx.fill();
      }
      // Antennae
      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x + 8, m.y - 4 + bobbing);
      ctx.lineTo(m.x + 13, m.y - 12 + bobbing);
      ctx.stroke();
    } else if (!spriteDrawn && monsterId === 'lunatic') {
      // Rabbit Body
      ctx.fillStyle = isHit ? '#ffffff' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobbing, 14, 0, Math.PI * 2);
      ctx.fill();
      // Long Ears
      ctx.fillStyle = isHit ? '#ffffff' : '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(m.x - 5, m.y - 18 + bobbing, 4, 10, -0.2, 0, Math.PI * 2);
      ctx.ellipse(m.x + 5, m.y - 18 + bobbing, 4, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(m.x - 5, m.y - 18 + bobbing, 2, 6, -0.2, 0, Math.PI * 2);
      ctx.ellipse(m.x + 5, m.y - 18 + bobbing, 2, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Red eyes
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(m.x - 4, m.y - 2 + bobbing, 2, 0, Math.PI * 2);
      ctx.arc(m.x + 4, m.y - 2 + bobbing, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (!spriteDrawn && monsterId === 'pupa') {
      ctx.fillStyle = isHit ? '#ffffff' : '#a16207';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, 11, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI);
      ctx.stroke();
    } else if (!spriteDrawn && monsterId === 'rocker') {
      ctx.fillStyle = isHit ? '#ffffff' : '#16a34a';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + bobbing, 12, 16, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x - 4, m.y + 4 + bobbing);
      ctx.lineTo(m.x - 14, m.y + 14 + bobbing);
      ctx.moveTo(m.x + 4, m.y + 4 + bobbing);
      ctx.lineTo(m.x + 14, m.y + 14 + bobbing);
      ctx.stroke();
    } else if (!spriteDrawn && monsterId === 'spore') {
      // Mushroom Cap
      ctx.fillStyle = isHit ? '#ffffff' : '#f97316';
      ctx.beginPath();
      ctx.arc(m.x, m.y - 4 + bobbing, 15, Math.PI, 0);
      ctx.fill();
      // White spots
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(m.x - 6, m.y - 9 + bobbing, 3, 0, Math.PI * 2);
      ctx.arc(m.x + 5, m.y - 10 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(m.x - 8, m.y - 4 + bobbing, 16, 12);
    } else if (!spriteDrawn && monsterId === 'pecopeco') {
      // Bird Body & Beak
      ctx.fillStyle = isHit ? '#ffffff' : '#eab308';
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobbing, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(m.x + 10, m.y - 2 + bobbing);
      ctx.lineTo(m.x + 20, m.y + 2 + bobbing);
      ctx.lineTo(m.x + 10, m.y + 6 + bobbing);
      ctx.fill();
    } else if (!spriteDrawn && (monsterId === 'zombie' || monsterId === 'injustice')) {
      ctx.fillStyle = isHit ? '#ffffff' : (monsterId === 'zombie' ? '#475569' : '#1e1b4b');
      ctx.fillRect(m.x - 10, m.y - 18 + bobbing, 20, 28);
      // Glowing Eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(m.x - 6, m.y - 12 + bobbing, 3, 3);
      ctx.fillRect(m.x + 3, m.y - 12 + bobbing, 3, 3);
    } else if (!spriteDrawn && (monsterId === 'skeleton' || monsterId === 'soldier_skeleton')) {
      ctx.fillStyle = isHit ? '#ffffff' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(m.x, m.y - 10 + bobbing, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(m.x - 6, m.y - 2 + bobbing, 12, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(m.x - 4, m.y - 12 + bobbing, 3, 3);
      ctx.fillRect(m.x + 1, m.y - 12 + bobbing, 3, 3);
    } else if (!spriteDrawn && (monsterId === 'orc_warrior' || monsterId === 'high_orc')) {
      ctx.fillStyle = isHit ? '#ffffff' : (monsterId === 'high_orc' ? '#991b1b' : '#15803d');
      ctx.fillRect(m.x - 14, m.y - 22 + bobbing, 28, 34);
      // Horned Helmet
      ctx.fillStyle = '#475569';
      ctx.fillRect(m.x - 14, m.y - 24 + bobbing, 28, 8);
      // Tusks
      ctx.fillStyle = '#fff';
      ctx.fillRect(m.x - 10, m.y - 6 + bobbing, 3, 6);
      ctx.fillRect(m.x + 7, m.y - 6 + bobbing, 3, 6);
    } else if (!spriteDrawn && monsterId === 'raydric') {
      // Dark Knight Armour
      ctx.fillStyle = isHit ? '#ffffff' : '#1e293b';
      ctx.fillRect(m.x - 14, m.y - 22 + bobbing, 28, 36);
      // Glowing Red Visor
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(m.x - 8, m.y - 16 + bobbing, 16, 3);
    } else if (!spriteDrawn && monsterId === 'golem_lava') {
      // Fiery Craggy Golem
      ctx.fillStyle = isHit ? '#ffffff' : '#18181b';
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobbing, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(m.x - 12, m.y - 6 + bobbing);
      ctx.lineTo(m.x + 12, m.y + 8 + bobbing);
      ctx.moveTo(m.x - 6, m.y + 10 + bobbing);
      ctx.lineTo(m.x + 8, m.y - 10 + bobbing);
      ctx.stroke();
    } else if (!spriteDrawn && m.data.isMvp) {
      // Golden aura for MVP Doppelganger
      ctx.fillStyle = isHit ? 'rgba(255, 255, 255, 0.8)' : 'rgba(234, 179, 8, 0.5)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 34 + bobbing, 0, Math.PI * 2);
      ctx.fill();
      // Dark Shadow Knight Body
      ctx.fillStyle = isHit ? '#ffffff' : '#090d16';
      ctx.fillRect(m.x - 16, m.y - 26, 32, 42);
      // Glowing eyes & MVP Crown
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(m.x - 8, m.y - 18, 5, 4);
      ctx.fillRect(m.x + 3, m.y - 18, 5, 4);
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 12px font-mono';
      ctx.fillText('★ MVP ★', m.x - 24, m.y - 32);
    } else if (!spriteDrawn) {
      // Generic monster sprite block
      ctx.fillStyle = isHit ? '#ffffff' : (m.data.behavior === 'AGGRESSIVE' ? '#ef4444' : '#eab308');
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobbing, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isHit) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobbing, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // HP Bar
    const hpPct = Math.max(0, m.currentHp / m.data.hp);
    ctx.fillStyle = '#000';
    ctx.fillRect(m.x - 18, m.y - 28, 36, 5);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : '#ef4444';
    ctx.fillRect(m.x - 17, m.y - 27, 34 * hpPct, 3);

    // Name tag
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(m.data.name, m.x - ctx.measureText(m.data.name).width / 2, m.y - 32);

    ctx.restore();
  }

  private static drawPlayer(
    ctx: CanvasRenderingContext2D,
    pos: Position,
    dir: 'left' | 'right' | 'up' | 'down',
    state: PlayerState,
    animFrame: number,
    hpPercent: number,
    playerName: string = 'Cavaleiro'
  ) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 16, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Knight sprite
    const bob = state === 'MOVING' || state === 'CHASE' ? Math.sin(animFrame * 0.5) * 3 : 0;
    const isAttacking = state === 'ATTACKING' || state === 'CASTING';
    const spriteDrawn = drawAtlasSprite(ctx, 0, pos.x, pos.y + bob, 84, dir);

    if (!spriteDrawn) {
      // Cape / Armor Body fallback
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(pos.x - 12, pos.y - 18 + bob, 24, 28);

      // Red Cape
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(pos.x - (dir === 'left' ? -8 : 14), pos.y - 14 + bob, 8, 22);

      // Silver Knight Helmet
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 22 + bob, 10, 0, Math.PI * 2);
      ctx.fill();

      // Helmet Plume
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pos.x - 2, pos.y - 34 + bob, 4, 8);
    }

    // Sword Swing animation
    if (isAttacking) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const swingAngle = (animFrame % 10) * 0.2;
      ctx.arc(pos.x, pos.y - 10, 28, swingAngle, swingAngle + 1.2);
      ctx.stroke();
    }

    // Floating HP/SP bar under Knight
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(pos.x - 20, pos.y + 22, 40, 5);
    ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(pos.x - 19, pos.y + 23, 38 * hpPercent, 3);

    // Player Title Tag displaying character save name
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    const nameWidth = ctx.measureText(playerName).width;
    ctx.fillText(playerName, pos.x - nameWidth / 2, pos.y - 38 + bob);

    ctx.restore();
  }

  private static drawLevelUpRing(ctx: CanvasRenderingContext2D, pos: Position, progress: number) {
    ctx.save();
    const radius = progress * 60;
    const alpha = 1 - progress;
    ctx.strokeStyle = `rgba(234, 179, 8, ${alpha})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('LEVEL UP!', pos.x - 45, pos.y - radius - 10);
    ctx.restore();
  }

  private static drawWeather(
    ctx: CanvasRenderingContext2D,
    theme: string,
    particles: Array<{ x: number; y: number; speed: number; size: number }>,
    w: number,
    h: number
  ) {
    ctx.save();
    particles.forEach(p => {
      p.y += p.speed;
      if (p.y > h) p.y = 0;

      ctx.fillStyle = theme === 'grass' ? '#dcfce7' : theme === 'desert' ? '#fef08a' : '#94a3b8';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}
