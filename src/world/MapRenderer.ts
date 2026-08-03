import { ActiveMonster, DroppedItemInstance, MapData, Position, CombatFloatingText, AttackParticle, PlayerState } from '../types/game';
import { ITEMS } from '../data/items';
import { ITEM_SPRITE_INDEX, getItemSpritePath } from '../data/itemSprites';
import { GUILD_NPCS } from '../data/guildNpcs';

const fieldBackgrounds: Record<string, HTMLImageElement> = {};
[
  ['prt_fild01', '/game-assets/prontera-field-01.png'],
  ['prt_fild04', '/game-assets/prontera-field-04.png'],
  ['prontera_guild', '/game-assets/maps/prontera-guild.png'],
  ['pay_dun00', '/game-assets/maps/payon-cave.png'],
  ['moc_fild07', '/game-assets/maps/sograt-desert.png'],
  ['orc_dun01', '/game-assets/maps/orc-dungeon.png'],
  ['cmd_fild02', '/game-assets/maps/comodo-beach.png'],
  ['c_tower1', '/game-assets/maps/clock-tower.png'],
  ['gl_prison', '/game-assets/maps/glast-prison.png'],
  ['ra_san01', '/game-assets/maps/volcano-sanctuary.png']
].forEach(([id, source]) => {
  const image = new Image();
  image.src = source;
  fieldBackgrounds[id] = image;
});

const defaultFieldBackground = new Image();
defaultFieldBackground.src = '/game-assets/prontera-field.png';

const SPRITE_NAMES = [
  'player', 'poring', 'fabre', 'lunatic', 'pupa',
  'poporing', 'rocker', 'spore', 'jiboia', 'zombie',
  'skeleton', 'pecopeco', 'soldier_skeleton', 'metaller', 'orc_warrior',
  'zenorc', 'high_orc', 'mummy', 'anolian', 'minorous',
  'clock', 'alarm', 'injustice', 'raydric', 'golem_lava'
];

type SpritePose = 'idle' | 'up' | 'walk' | 'walk-up' | 'attack' | 'attack-up';
const spriteImages: Record<SpritePose, Record<string, HTMLImageElement>> = {
  idle: {}, up: {}, walk: {}, 'walk-up': {}, attack: {}, 'attack-up': {}
};

(Object.keys(spriteImages) as SpritePose[]).forEach(pose => {
  SPRITE_NAMES.forEach(name => {
    const image = new Image();
    image.src = `/game-assets/sprites/${pose}/${name}.png`;
    spriteImages[pose][name] = image;
  });
});

type FacingDirection = 'left' | 'right' | 'up' | 'down';
type OfficialPose = 'idle' | 'walk' | 'attack' | 'death';
type OfficialFrameSet = Partial<Record<OfficialPose, Partial<Record<'left' | 'up' | 'down', HTMLImageElement[]>>>>;

const officialFrames: Record<string, OfficialFrameSet> = {};
const officialCounts: Record<string, Record<OfficialPose, Partial<Record<'left' | 'up' | 'down', number>>>> = {
  knight: {
    idle: { down: 1, left: 1, up: 1 },
    walk: { down: 2, left: 2, up: 2 },
    attack: { down: 2, left: 2, up: 2 },
    death: { down: 1 }
  },
  poring: {
    idle: { down: 2, left: 2, up: 2 },
    walk: { down: 8, left: 4, up: 8 },
    attack: { down: 4, left: 4, up: 4 },
    death: { down: 3 }
  },
  lunatic: {
    idle: { down: 4, left: 4, up: 4 },
    walk: { down: 4, left: 4, up: 4 },
    attack: { down: 4, left: 4, up: 4 },
    death: { down: 3 }
  },
  fabre: {
    idle: { down: 2, left: 2, up: 2 },
    walk: { down: 4, left: 5, up: 4 },
    attack: { down: 5, left: 5, up: 5 },
    death: { down: 4 }
  },
  pupa: {
    idle: { down: 2, left: 2, up: 2 },
    walk: { down: 5, left: 5, up: 5 },
    attack: { down: 3, left: 3, up: 3 },
    death: { down: 3 }
  },
  poporing: {
    idle: { down: 4, left: 4, up: 4 },
    walk: { down: 4, left: 4, up: 4 },
    attack: { down: 4, left: 4, up: 4 },
    death: {}
  },
  spore: {
    idle: { down: 8, left: 8, up: 8 },
    walk: { down: 8, left: 8, up: 8 },
    attack: { down: 5, left: 5, up: 5 },
    death: {}
  },
  rocker: {
    idle: { down: 6, left: 6, up: 6 },
    walk: { down: 3, left: 3, up: 3 },
    attack: { down: 3, left: 3, up: 3 },
    death: {}
  }
};

Object.entries(officialCounts).forEach(([entity, poses]) => {
  officialFrames[entity] = {};
  (Object.keys(poses) as OfficialPose[]).forEach(pose => {
    officialFrames[entity][pose] = {};
    Object.entries(poses[pose]).forEach(([direction, count]) => {
      const frames: HTMLImageElement[] = [];
      for (let index = 0; index < (count || 0); index++) {
        const image = new Image();
        const root = entity === 'knight' ? '/game-assets/official/knight' : `/game-assets/official/monsters/${entity}`;
        image.src = `${root}/${pose}/${direction}/${index}.png`;
        frames.push(image);
      }
      officialFrames[entity][pose]![direction as 'left' | 'up' | 'down'] = frames;
    });
  });
});

const officialHeads: Array<Record<'left' | 'up' | 'down', HTMLImageElement>> = Array.from({ length: 10 }, (_, style) => {
  const result = {} as Record<'left' | 'up' | 'down', HTMLImageElement>;
  (['left', 'up', 'down'] as const).forEach(direction => {
    const image = new Image();
    image.src = `/game-assets/official/heads/head-${String(style).padStart(2, '0')}/${direction}.png`;
    result[direction] = image;
  });
  return result;
});

const guildNpcImages: Record<string, HTMLImageElement> = {};
['kafra-merchant', 'blacksmith', 'mission-clerk'].forEach(name => {
  const image = new Image();
  image.src = `/game-assets/official/npcs/${name}.png`;
  guildNpcImages[name] = image;
});

function drawOfficialEntity(
  ctx: CanvasRenderingContext2D,
  entity: string,
  x: number,
  y: number,
  height: number,
  direction: FacingDirection,
  pose: OfficialPose,
  animFrame: number,
  attackProgress: number = 0,
  headStyle?: number
): boolean {
  const sourceDirection = direction === 'right' ? 'left' : direction;
  const poseFrames = officialFrames[entity]?.[pose]?.[sourceDirection]
    || officialFrames[entity]?.[pose]?.down
    || officialFrames[entity]?.idle?.[sourceDirection]
    || officialFrames[entity]?.idle?.down;
  if (!poseFrames?.length) return false;

  const normalizedProgress = Math.max(0, Math.min(1, attackProgress));
  const index = pose === 'attack'
    ? Math.min(poseFrames.length - 1, Math.floor((1 - normalizedProgress) * poseFrames.length))
    : pose === 'death'
      ? Math.min(poseFrames.length - 1, Math.floor(normalizedProgress * poseFrames.length))
      : Math.floor(animFrame / (pose === 'idle' ? 10 : 5)) % poseFrames.length;
  const frame = poseFrames[index];
  if (!frame?.complete || frame.naturalWidth === 0) return false;

  ctx.save();
  ctx.translate(x, y);
  if (direction === 'right') ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  const width = height * (frame.naturalWidth / Math.max(1, frame.naturalHeight));
  const attackPhase = pose === 'attack' ? Math.sin((1 - normalizedProgress) * Math.PI) : 0;
  ctx.drawImage(frame, -width / 2, -height * 0.78 + attackPhase * 2, width, height);

  // The current Knight frames already contain the head, keeping both layers perfectly aligned.
  if (entity === 'knight' && headStyle !== undefined && pose === 'death') {
    const style = Math.max(0, Math.min(officialHeads.length - 1, headStyle));
    const head = officialHeads[style]?.[sourceDirection];
    if (head?.complete && head.naturalWidth > 0) {
      const directionOffset = sourceDirection === 'up' ? -1 : sourceDirection === 'left' ? 1 : 0;
      const headHeight = height * 0.42;
      const headWidth = headHeight * (head.naturalWidth / Math.max(1, head.naturalHeight));
      ctx.drawImage(head, -headWidth / 2 + directionOffset, -height * 0.9 + attackPhase * 1.25, headWidth, headHeight);
    }
  }
  ctx.restore();
  return true;
}

const itemImages: Record<string, HTMLImageElement> = {};
Object.keys(ITEM_SPRITE_INDEX).forEach(itemId => {
  const image = new Image();
  image.src = getItemSpritePath(itemId);
  itemImages[itemId] = image;
});

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

function drawEntitySprite(
  ctx: CanvasRenderingContext2D,
  entityName: string,
  x: number,
  y: number,
  size: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'down',
  pose: 'idle' | 'walk' | 'attack' = 'idle'
): boolean {
  const spritePose: SpritePose = pose === 'attack'
    ? (direction === 'up' ? 'attack-up' : 'attack')
    : pose === 'walk' ? (direction === 'up' ? 'walk-up' : 'walk') : direction === 'up' ? 'up' : 'idle';
  const sprite = spriteImages[spritePose][entityName];
  if (!sprite?.complete || sprite.naturalWidth === 0) return false;

  ctx.save();
  ctx.translate(x, y);
  if (direction === 'right') ctx.scale(-1, 1);
  const preserveRockerFrame = entityName === 'rocker';
  const drawHeight = size;
  const drawWidth = preserveRockerFrame
    ? drawHeight * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight))
    : size;
  ctx.imageSmoothingEnabled = !preserveRockerFrame;
  ctx.drawImage(sprite, -drawWidth / 2, -drawHeight * 0.72, drawWidth, drawHeight);
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
    playerAttackAnimationProgress: number,
    hpPercent: number,
    monsters: ActiveMonster[],
    droppedItems: DroppedItemInstance[],
    floatingTexts: CombatFloatingText[],
    weatherParticles: Array<{ x: number; y: number; speed: number; size: number }>,
    levelUpEffect: { active: boolean; progress: number },
    attackParticles: AttackParticle[] = [],
    mapFadeAlpha: number = 0,
    mapTransitionName: string = '',
    playerName: string = 'Cavaleiro',
    playerHeadStyle: number = 0
  ) {
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    const mapW = map.width || 800;
    const mapH = map.height || 600;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // The canvas is the playable area: scale it to its exact bounds so the
    // source image is never repeated and actors can never enter side panels.
    const scaleX = canvasW / mapW;
    const scaleY = canvasH / mapH;

    ctx.save();
    // Translate and scale coordinate system to full map bounds
    ctx.scale(scaleX, scaleY);

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

    if (map.id === 'prontera_guild') MapRenderer.drawGuildNpcs(ctx);

    // 3. Draw Dropped Items
    droppedItems.forEach(item => {
      MapRenderer.drawDroppedItem(ctx, item);
    });

    // 4. Draw Monsters
    monsters.forEach(m => MapRenderer.drawMonster(ctx, m));

    // 5. Draw Knight Player Character with Save Name
    MapRenderer.drawPlayer(ctx, playerPos, playerDir, playerState, playerAnimFrame, playerAttackAnimationProgress, hpPercent, playerName, playerHeadStyle);

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
      const isNumber = /^[+-]?\d+$/.test(ft.text.trim());
      ctx.fillStyle = ft.color;
      ctx.font = `900 ${Math.floor((isNumber ? 22 : 15) * ft.scale)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#080808';
      ctx.lineWidth = isNumber ? 4 : 2.5;
      ctx.lineJoin = 'round';
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.opacity));
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
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
    const paintedBackground = fieldBackgrounds[map.id];
    if (paintedBackground?.complete && paintedBackground.naturalWidth > 0) {
      ctx.drawImage(paintedBackground, 0, 0, w, h);
      return;
    }

    if (map.theme === 'grass') {
      const fieldBackground = fieldBackgrounds[map.id] || defaultFieldBackground;
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

  private static drawGuildNpcs(ctx: CanvasRenderingContext2D) {
    GUILD_NPCS.forEach(npc => {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 15, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      const sprite = guildNpcImages[npc.sprite];
      if (sprite?.complete && sprite.naturalWidth > 0) {
        const width = npc.height * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight));
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, npc.x - width / 2, npc.y - npc.height + 18, width, npc.height);
      }
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Tahoma';
      ctx.fillText(npc.name, npc.x, npc.y - npc.height + 8);
      ctx.fillStyle = '#ffe6a7';
      ctx.font = '9px Tahoma';
      ctx.fillText(`${npc.role} • clique`, npc.x, npc.y - npc.height + 19);
      ctx.restore();
    });
    return;
    // Legacy fallback kept below for old generated sprite sheets.
    const npcs = [
      { x: 165, y: 300, name: 'Mercadora Kafra', role: 'Compra e venda', sprite: 'kafra-merchant', height: 86 },
      { x: 640, y: 300, name: 'Hollgrehenn', role: 'Forja e montagem', sprite: 'blacksmith', height: 92 },
      { x: 400, y: 150, name: 'Agente de Missões', role: 'Contratos da guilda', sprite: 'mission-clerk', height: 88 }
    ];

    npcs.forEach(npc => {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 15, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      const sprite = guildNpcImages[npc.sprite];
      if (sprite?.complete && sprite.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        const width = npc.height * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight));
        ctx.drawImage(sprite, npc.x - width / 2, npc.y - npc.height + 18, width, npc.height);
      }
      ctx.font = 'bold 11px Tahoma';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      ctx.fillText(npc.name, npc.x, npc.y - npc.height + 8);
      ctx.font = '9px Tahoma';
      ctx.fillStyle = '#ffe6a7';
      ctx.fillText(npc.role, npc.x, npc.y - npc.height + 19);
      ctx.restore();
    });
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

    // Item sprite rendering
    const itemSprite = itemImages[item.itemId];
    if (itemSprite?.complete && itemSprite.naturalWidth > 0) {
      ctx.drawImage(itemSprite, item.x - 17, item.y - 18 + pulse, 34, 34);
    } else {
      ctx.font = '18px sans-serif';
      ctx.fillText(itemData?.icon || '📦', item.x - 9, item.y + pulse);
    }

    ctx.restore();
  }

  private static drawMonster(ctx: CanvasRenderingContext2D, m: ActiveMonster) {
    ctx.save();

    const now = Date.now();
    const deathProgress = m.state === 'DEAD'
      ? Math.min(1, (now - (m.deathStartedAt ?? now)) / 650)
      : 0;
    if (m.state === 'DEAD' && deathProgress >= 1) {
      ctx.restore();
      return;
    }
    if (m.state === 'DEAD') {
      ctx.globalAlpha = 1 - deathProgress;
      ctx.translate(m.x, m.y);
      ctx.rotate(deathProgress * 0.42 * (m.direction === 'left' ? -1 : 1));
      ctx.scale(1 + deathProgress * 0.12, Math.max(0.12, 1 - deathProgress * 0.82));
      ctx.translate(-m.x, -m.y);
    } else if (m.state === 'RESPAWNING') {
      const respawnProgress = Math.min(1, (now - (m.respawnStartedAt ?? now)) / 700);
      const eased = 1 - Math.pow(1 - respawnProgress, 3);
      ctx.globalAlpha = Math.max(0.15, eased);
      ctx.translate(m.x, m.y);
      ctx.scale(0.25 + eased * 0.75, 0.25 + eased * 0.75);
      ctx.translate(-m.x, -m.y);
    }

    const isHit = (m.hitFlash || 0) > 0;
    const shakeX = isHit ? Math.sin((m.hitFlash || 0) * 80) * 6 : 0;
    const shakeY = isHit ? Math.cos((m.hitFlash || 0) * 80) * 3 : 0;

    ctx.translate(shakeX, shakeY);

    if (m.isElite && m.state !== 'DEAD') {
      ctx.strokeStyle = `rgba(168,85,247,${0.68 + Math.sin(now / 170) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 8, 25, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Monster Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 12, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Procedural RO monster rendering
    const monsterId = m.data.id;
    const bobbing = monsterId === 'lunatic' ? 0 : Math.sin(Date.now() / 150) * 2;
    const spriteIndex = MONSTER_SPRITES[monsterId] ?? (m.data.isMvp ? 23 : 1);
    const spriteName = SPRITE_NAMES[spriteIndex] || 'poring';
    const spriteSize = m.data.size === 'Grande' ? 82 : m.data.size === 'Pequeno' ? 64 : 72;
    const isMoving = m.state === 'MOVING' || m.state === 'CHASE';
    const pose = m.attackAnimationProgress > 0 ? 'attack' : isMoving ? 'walk' : 'idle';
    const hasOfficialSprite = ['poring', 'lunatic', 'fabre', 'pupa', 'poporing', 'spore', 'rocker'].includes(monsterId);
    const officialPose: OfficialPose = m.state === 'DEAD' ? 'death' : pose;
    const officialHeight = m.data.size === 'Grande' ? 62 : m.data.size === 'Pequeno' ? 46 : 54;
    const officialDrawn = hasOfficialSprite && drawOfficialEntity(
      ctx,
      monsterId,
      m.x,
      m.y + bobbing,
      officialHeight,
      m.direction,
      officialPose,
      m.animFrame,
      m.state === 'DEAD' ? deathProgress : m.attackAnimationProgress
    );
    const spriteDrawn = officialDrawn || drawEntitySprite(ctx, spriteName, m.x, m.y + bobbing, spriteSize, m.direction, pose);

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

    if (m.state === 'DEAD') {
      ctx.restore();
      return;
    }

    // HP Bar
    const hpPct = Math.max(0, m.currentHp / m.data.hp);
    ctx.fillStyle = '#000';
    ctx.fillRect(m.x - 18, m.y + 19, 36, 5);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : '#ef4444';
    ctx.fillRect(m.x - 17, m.y + 20, 34 * hpPct, 3);

    // Name tag
    ctx.fillStyle = m.isElite ? '#f0abfc' : '#fff';
    ctx.font = '10px sans-serif';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    const label = m.isElite ? `★ ${m.data.name}` : m.data.name;
    ctx.textAlign = 'center';
    ctx.fillText(label, m.x, m.y + 35);

    ctx.restore();
  }

  private static drawPlayer(
    ctx: CanvasRenderingContext2D,
    pos: Position,
    dir: 'left' | 'right' | 'up' | 'down',
    state: PlayerState,
    animFrame: number,
    attackAnimationProgress: number,
    hpPercent: number,
    playerName: string = 'Cavaleiro',
    headStyle: number = 0
  ) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 16, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Knight sprite
    // The official walk sequence already contains foot/body motion. Additional
    // vertical bobbing made the whole character look like it was hopping.
    const bob = 0;
    const isAttacking = state === 'ATTACKING' || state === 'CASTING';
    const pose = isAttacking && attackAnimationProgress > 0
      ? 'attack'
      : (state === 'MOVING' || state === 'CHASE') ? 'walk' : 'idle';
    const officialDrawn = drawOfficialEntity(
      ctx,
      'knight',
      pos.x,
      pos.y + bob,
      82,
      dir,
      pose,
      animFrame,
      attackAnimationProgress,
      headStyle
    );
    const spriteDrawn = officialDrawn || drawEntitySprite(ctx, 'player', pos.x, pos.y + bob, 84, dir, pose);

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
