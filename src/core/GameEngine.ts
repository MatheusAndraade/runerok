import {
  SaveData,
  PlayerState,
  Position,
  ActiveMonster,
  DroppedItemInstance,
  CombatFloatingText,
  AttackParticle,
  MonsterData,
  DerivedStats,
  ItemRarity
} from '../types/game';
import { MAPS } from '../data/maps';
import { MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { SKILLS } from '../data/skills';
import { getExpForLevel } from '../data/expTable';
import { CombatCalculator } from '../combat/CombatCalculator';
import { Pathfinder } from '../world/Pathfinder';
import { EventBus } from './EventBus';
import { AudioManager } from './AudioManager';
import { SaveManager } from '../systems/SaveManager';
import { GUILD_MISSIONS, GUILD_RECIPES, GUILD_SHOP } from '../data/guild';
import { createRarityBonuses, rarityValueMultiplier, rollItemRarity } from '../data/rarities';
import { GUILD_NPCS, GuildService } from '../data/guildNpcs';

export class GameEngine {
  private static instance: GameEngine;

  public saveData!: SaveData;
  public derivedStats!: DerivedStats;

  public playerPos: Position = { x: 400, y: 300 };
  public playerDir: 'left' | 'right' | 'up' | 'down' = 'down';
  public playerState: PlayerState = 'SEARCHING';
  public playerAnimFrame: number = 0;
  public playerAttackAnimationProgress: number = 0;
  public playerPath: Position[] = [];

  public activeMonsters: ActiveMonster[] = [];
  public droppedItems: DroppedItemInstance[] = [];
  public floatingTexts: CombatFloatingText[] = [];
  public attackParticles: AttackParticle[] = [];

  public mapFadeAlpha: number = 0;
  public mapTransitionState: 'IDLE' | 'FADING_OUT' | 'FADING_IN' = 'IDLE';
  public pendingMapId: string | null = null;
  public mapTransitionName: string = '';

  public pathfinder!: Pathfinder;
  public isPaused: boolean = false;

  private targetMonsterInstanceId: string | null = null;
  private targetItemInstanceId: string | null = null;

  private lastAttackTime: number = 0;
  private lastSkillTime: Record<string, number> = {};
  private lastPotionTime: number = 0;
  private activeBuffs: Record<string, number> = {};
  private lastAutoSaveTime: number = Date.now();

  // Metrics for Idle Panel
  public metrics = {
    expEarnedWindow: 0,
    zenyEarnedWindow: 0,
    killsWindow: 0,
    damageDealtWindow: 0,
    potionsUsedWindow: 0,
    windowStartTime: Date.now(),
    expPerHour: 0,
    zenyPerHour: 0,
    killsPerMin: 0,
    dps: 0,
    potionsPerHour: 0
  };

  public weatherParticles: Array<{ x: number; y: number; speed: number; size: number }> = [];
  public levelUpEffect = { active: false, progress: 0 };

  private constructor() {
    for (let i = 0; i < 30; i++) {
      this.weatherParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 3
      });
    }
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public init(saveData: SaveData) {
    this.saveData = SaveManager.normalizeSave(saveData);
    this.saveData.character.headStyle ??= 0;
    this.saveData.hotbar ??= [
      { kind: 'skill', refId: 'bowling_bash' },
      { kind: 'skill', refId: 'pierce' },
      { kind: 'skill', refId: 'bash' },
      { kind: 'item', refId: 'pot_red' },
      null, null, null, null, null
    ];
    this.saveData.claimedGuildMissions ??= [];
    this.updateDerivedStats();

    const currentMap = MAPS[saveData.currentMapId] || MAPS['prt_fild01'];
    this.pathfinder = new Pathfinder(currentMap.width, currentMap.height, 20);
    this.pathfinder.setObstacles(currentMap.obstacles);

    this.playerPos = { x: currentMap.width / 2, y: currentMap.height / 2 };
    // React development mode can initialize effects twice. Always rebuild the
    // transient scene so spawn counts remain identical to the map definition.
    this.activeMonsters = [];
    this.droppedItems = [];
    this.spawnMapMonsters();

    AudioManager.getInstance().playBgm(currentMap.bgm);
  }

  public updateDerivedStats() {
    this.derivedStats = CombatCalculator.calculateDerivedStats(
      this.saveData.character.baseLevel,
      { ...this.saveData.character.stats },
      this.saveData.equipment
    );
  }

  public changeMap(newMapId: string) {
    if (!MAPS[newMapId]) return;
    this.saveData.currentMapId = newMapId;
    const currentMap = MAPS[newMapId];

    this.pathfinder = new Pathfinder(currentMap.width, currentMap.height, 20);
    this.pathfinder.setObstacles(currentMap.obstacles);

    this.activeMonsters = [];
    this.droppedItems = [];
    this.playerPos = { x: currentMap.width / 2, y: currentMap.height / 2 };
    this.playerState = 'SEARCHING';
    this.playerPath = [];
    this.targetMonsterInstanceId = null;
    this.targetItemInstanceId = null;

    this.spawnMapMonsters();
    AudioManager.getInstance().playBgm(currentMap.bgm);
    EventBus.getInstance().emit('MAP_CHANGED', currentMap);
  }

  private spawnMapMonsters() {
    const currentMap = MAPS[this.saveData.currentMapId] || MAPS['prt_fild01'];
    currentMap.monsterSpawns.forEach(spawn => {
      const monsterData = MONSTERS[spawn.monsterId];
      if (!monsterData) return;

      for (let i = 0; i < spawn.count; i++) {
        let x = 50 + Math.random() * (currentMap.width - 100);
        let y = 50 + Math.random() * (currentMap.height - 100);

        if (this.pathfinder.isObstacle(x, y)) {
          x = currentMap.width / 2 + (Math.random() * 100 - 50);
          y = currentMap.height / 2 + (Math.random() * 100 - 50);
        }

        const isElite = Math.random() < 0.065;
        const data: MonsterData = isElite ? {
          ...monsterData,
          name: `${monsterData.name} Elite`,
          hp: Math.round(monsterData.hp * 2.4),
          atk: Math.round(monsterData.atk * 1.55),
          def: Math.round(monsterData.def * 1.3),
          mdef: Math.round(monsterData.mdef * 1.3),
          baseExp: Math.round(monsterData.baseExp * 2.5),
          lootTable: monsterData.lootTable.map(drop => ({ ...drop, chance: Math.min(1, drop.chance * 1.65) }))
        } : monsterData;
        this.activeMonsters.push({
          instanceId: `m_${Date.now()}_${Math.random()}`,
          data,
          x,
          y,
          currentHp: data.hp,
          state: 'IDLE',
          lastAttackTime: 0,
          attackAnimationProgress: 0,
          animFrame: 0,
          direction: 'down',
          nextWanderDelay: 1.4 + Math.random() * 2.2,
          isElite
        });
      }
    });
  }

  public spawnAttackSparks(x: number, y: number, colorScheme: 'crit' | 'skill' | 'normal' | 'playerHit' | 'levelUp') {
    const count = colorScheme === 'crit' || colorScheme === 'skill' ? 14 : 8;
    const colors =
      colorScheme === 'crit' ? ['#fde047', '#f59e0b', '#ef4444', '#ffffff'] :
      colorScheme === 'skill' ? ['#60a5fa', '#38bdf8', '#f59e0b', '#ffffff'] :
      colorScheme === 'playerHit' ? ['#f87171', '#dc2626', '#b91c1c'] :
      colorScheme === 'levelUp' ? ['#fde047', '#eab308', '#ffffff'] :
      ['#fbbf24', '#fef08a', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.attackParticles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        size: 2 + Math.random() * 3.5,
        alpha: 1,
        maxLife: 0.35 + Math.random() * 0.3,
        life: 0
      });
    }
  }

  // --- LOGIC TICK (20Hz / 50ms) ---
  public updateLogic(deltaTimeSec: number) {
    if (this.isPaused) return;

    // Map transition fade logic
    if (this.mapTransitionState === 'FADING_OUT') {
      this.mapFadeAlpha += deltaTimeSec * 4.0;
      if (this.mapFadeAlpha >= 1) {
        this.mapFadeAlpha = 1;
        if (this.pendingMapId) {
          this.executeMapTravel(this.pendingMapId);
          this.pendingMapId = null;
        }
        this.mapTransitionState = 'FADING_IN';
      }
    } else if (this.mapTransitionState === 'FADING_IN') {
      this.mapFadeAlpha -= deltaTimeSec * 3.0;
      if (this.mapFadeAlpha <= 0) {
        this.mapFadeAlpha = 0;
        this.mapTransitionState = 'IDLE';
      }
    }

    this.playerAnimFrame++;
    this.playerAttackAnimationProgress = Math.max(0, this.playerAttackAnimationProgress - deltaTimeSec * 5.5);

    // Level Up Effect Animation
    if (this.levelUpEffect.active) {
      this.levelUpEffect.progress += deltaTimeSec * 2;
      if (this.levelUpEffect.progress >= 1.0) {
        this.levelUpEffect.active = false;
        this.levelUpEffect.progress = 0;
      }
    }

    // Floating text update
    const now = Date.now();
    this.floatingTexts = this.floatingTexts.filter(ft => {
      ft.y -= 18 * deltaTimeSec;
      ft.opacity -= 0.45 * deltaTimeSec;
      return ft.opacity > 0;
    });

    // Attack Spark Particles update
    this.attackParticles.forEach(p => {
      p.x += p.vx * deltaTimeSec * 60;
      p.y += p.vy * deltaTimeSec * 60;
      p.vy += 0.08 * deltaTimeSec * 60;
      p.life += deltaTimeSec;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    });
    this.attackParticles = this.attackParticles.filter(p => p.life < p.maxLife);

    // Auto Potion Engine
    this.checkAutoPotion();

    // Ground drops stay visible briefly, then go straight to the inventory.
    this.droppedItems
      .filter(item => now - item.spawnTime >= 2000)
      .forEach(item => this.lootItem(item));

    // Player State Machine Process
    this.processPlayerFSM(deltaTimeSec);

    // Monster AI Process
    this.processMonsterAI(deltaTimeSec);

    // Respawn Monsters
    this.checkMonsterRespawns();

    // Auto Save Check (every 30 seconds)
    if (now - this.lastAutoSaveTime > 30000) {
      this.lastAutoSaveTime = now;
      SaveManager.saveGame(this.saveData);
      EventBus.getInstance().emit('SAVE_COMPLETED');
    }

    // Metrics Calculation Window (every 5 seconds recalculate rate)
    if (now - this.metrics.windowStartTime > 5000) {
      const elapsedHours = (now - this.metrics.windowStartTime) / 3600000;
      const elapsedMins = (now - this.metrics.windowStartTime) / 60000;
      const elapsedSecs = (now - this.metrics.windowStartTime) / 1000;

      this.metrics.expPerHour = Math.floor(this.metrics.expEarnedWindow / Math.max(0.001, elapsedHours));
      this.metrics.zenyPerHour = Math.floor(this.metrics.zenyEarnedWindow / Math.max(0.001, elapsedHours));
      this.metrics.killsPerMin = Number((this.metrics.killsWindow / Math.max(0.001, elapsedMins)).toFixed(1));
      this.metrics.dps = Math.floor(this.metrics.damageDealtWindow / Math.max(0.1, elapsedSecs));
      this.metrics.potionsPerHour = Math.floor(this.metrics.potionsUsedWindow / Math.max(0.001, elapsedHours));

      // Reset rolling window
      this.metrics.expEarnedWindow = 0;
      this.metrics.zenyEarnedWindow = 0;
      this.metrics.killsWindow = 0;
      this.metrics.damageDealtWindow = 0;
      this.metrics.potionsUsedWindow = 0;
      this.metrics.windowStartTime = now;
    }
  }

  private checkAutoPotion() {
    const settings = this.saveData.autoPotionSettings;
    const now = Date.now();
    if (now - this.lastPotionTime < 1000) return; // 1s potion cooldown

    // HP Potion Check
    const hpPct = (this.saveData.character.currentHp / this.derivedStats.maxHp) * 100;
    if (settings.useHpPotion && hpPct <= settings.hpThresholdPercent) {
      const potItem = this.saveData.inventory.find(i => i.itemId === settings.hpPotionId && i.amount > 0);
      if (potItem) {
        potItem.amount--;
        const itemData = ITEMS[potItem.itemId];
        const heal = itemData?.consumableEffect?.hpHeal || 100;

        this.saveData.character.currentHp = Math.min(
          this.derivedStats.maxHp,
          this.saveData.character.currentHp + heal
        );

        this.addFloatingText(`+${heal}`, this.playerPos.x, this.playerPos.y - 15, '#22c55e');
        AudioManager.getInstance().playPotion();
        this.lastPotionTime = now;
        this.metrics.potionsUsedWindow++;
        this.saveData.statistics.totalPotionsUsed++;
      }
    }
  }

  private processPlayerFSM(deltaTimeSec: number) {
    if (this.playerState === 'DEAD' || (this.saveData.character.currentHp <= 0)) {
      this.playerState = 'DEAD';
      return;
    }

    if (this.saveData.currentMapId === 'prontera_guild') {
      this.playerState = 'IDLE';
      this.playerPath = [];
      return;
    }

    // FSM States
    switch (this.playerState) {
      case 'SEARCHING':
        this.findNearestTargetMonster();
        break;

      case 'MOVING':
      case 'CHASE':
        this.moveAlongPlayerPath(deltaTimeSec);
        break;

      case 'ATTACKING':
        this.performKnightAttack();
        break;
    }
  }

  private findNearestTargetMonster() {
    let nearest: ActiveMonster | null = null;
    let minDist = 99999;

    this.activeMonsters.forEach(m => {
      if (m.state === 'DEAD' || m.state === 'RESPAWNING') return;
      const dist = Math.hypot(m.x - this.playerPos.x, m.y - this.playerPos.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = m;
      }
    });

    if (nearest) {
      const targetMonster = nearest as ActiveMonster;
      this.targetMonsterInstanceId = targetMonster.instanceId;

      if (minDist <= this.derivedStats.attackRange) {
        const dx = targetMonster.x - this.playerPos.x;
        const dy = targetMonster.y - this.playerPos.y;
        this.playerDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        this.playerState = 'ATTACKING';
      } else {
        this.playerState = 'CHASE';
        const path = this.pathfinder.findPath(this.playerPos, { x: targetMonster.x, y: targetMonster.y });
        if (path.length > 0) {
          this.playerPath = path;
        } else {
          // Direct fallback step towards monster if path is blocked
          this.playerPath = [{ x: targetMonster.x, y: targetMonster.y }];
        }
      }
    } else {
      // All monsters dead on current map, trigger respawn check
      this.checkMonsterRespawns();
      const currentMap = MAPS[this.saveData.currentMapId] || MAPS['prt_fild01'];
      // Wander towards map center if no active monsters
      const wanderX = Math.max(60, Math.min(currentMap.width - 60, currentMap.width / 2 + (Math.random() * 200 - 100)));
      const wanderY = Math.max(60, Math.min(currentMap.height - 60, currentMap.height / 2 + (Math.random() * 200 - 100)));
      this.playerPath = [{ x: wanderX, y: wanderY }];
      this.playerState = 'MOVING';
    }
  }

  private moveAlongPlayerPath(deltaTimeSec: number) {
    if (this.targetMonsterInstanceId) {
      const target = this.activeMonsters.find(m => m.instanceId === this.targetMonsterInstanceId && m.state !== 'DEAD' && m.state !== 'RESPAWNING');
      if (target && Math.hypot(target.x - this.playerPos.x, target.y - this.playerPos.y) <= this.derivedStats.attackRange) {
        this.playerPath = [];
        this.playerState = 'ATTACKING';
        return;
      }
    }

    if (this.playerPath.length === 0) {
      this.playerState = 'SEARCHING';
      this.targetMonsterInstanceId = null;
      this.targetItemInstanceId = null;
      return;
    }

    const nextWayPoint = this.playerPath[0];
    const dx = nextWayPoint.x - this.playerPos.x;
    const dy = nextWayPoint.y - this.playerPos.y;
    const dist = Math.hypot(dx, dy);

    this.playerDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

    const step = this.derivedStats.moveSpeed * deltaTimeSec;
    if (dist <= step) {
      this.playerPos.x = nextWayPoint.x;
      this.playerPos.y = nextWayPoint.y;
      this.playerPath.shift();

      if (this.playerPath.length === 0) {
        // Destination reached
        if (this.targetMonsterInstanceId) {
          const target = this.activeMonsters.find(m => m.instanceId === this.targetMonsterInstanceId);
          if (target && target.state !== 'DEAD' && target.state !== 'RESPAWNING') {
            const distToTarget = Math.hypot(target.x - this.playerPos.x, target.y - this.playerPos.y);
            if (distToTarget <= this.derivedStats.attackRange) {
              this.playerState = 'ATTACKING';
            } else {
              const path = this.pathfinder.findPath(this.playerPos, { x: target.x, y: target.y });
              this.playerPath = path.length > 0 ? path : [{ x: target.x, y: target.y }];
            }
          } else {
            this.playerState = 'SEARCHING';
            this.targetMonsterInstanceId = null;
          }
        } else {
          this.playerState = 'SEARCHING';
        }
      }
    } else {
      this.playerPos.x += (dx / dist) * step;
      this.playerPos.y += (dy / dist) * step;
    }
  }

  private performKnightAttack() {
    const target = this.activeMonsters.find(m => m.instanceId === this.targetMonsterInstanceId);
    if (!target || target.state === 'DEAD' || target.state === 'RESPAWNING') {
      this.playerState = 'SEARCHING';
      this.targetMonsterInstanceId = null;
      return;
    }

    const faceDx = target.x - this.playerPos.x;
    const faceDy = target.y - this.playerPos.y;
    this.playerDir = Math.abs(faceDx) > Math.abs(faceDy)
      ? (faceDx > 0 ? 'right' : 'left')
      : (faceDy > 0 ? 'down' : 'up');

    const now = Date.now();
    const quickenActive = (this.activeBuffs.two_hand_quicken || 0) > now;
    const quickenLevel = this.getSkillLevel('two_hand_quicken');
    const effectiveAspd = this.derivedStats.aspd * (quickenActive ? 1 + (0.15 + quickenLevel * 0.02) : 1);
    const attackIntervalMs = 1000 / effectiveAspd;

    if (now - this.lastAttackTime >= attackIntervalMs) {
      this.lastAttackTime = now;
      this.playerAttackAnimationProgress = 1;

      // Check skill priority rules
      let skillMultiplier = 1.0;
      let selectedSkillId: string | null = null;

      for (const rule of this.saveData.skillRules) {
        if (!rule.enabled) continue;
        const skill = SKILLS[rule.skillId];
        if (!skill) continue;

        const skillLevel = this.getSkillLevel(skill.id);
        const skillCost = skill.spCost + (skill.spCostPerLevel || 0) * (skillLevel - 1);
        if (this.saveData.character.currentSp < skillCost) continue;

        const lastUsed = this.lastSkillTime[skill.id] || 0;
        if (now - lastUsed < skill.cooldown * 1000) continue;

        // Condition Check
        let conditionMet = false;
        if (rule.condition === 'ALWAYS') conditionMet = true;
        if (rule.condition === 'TARGET_LARGE' && (target.data.size === 'Large' || target.data.size === 'Grande')) conditionMet = true;
        if (rule.condition === 'HP_BELOW_50' && (this.saveData.character.currentHp / this.derivedStats.maxHp) < 0.5) conditionMet = true;
        if (rule.condition === 'ENEMIES_GTE_2') {
          const nearby = this.activeMonsters.filter(m => m.state !== 'DEAD' && m.state !== 'RESPAWNING' && Math.hypot(m.x - this.playerPos.x, m.y - this.playerPos.y) < 120);
          if (nearby.length >= 2) conditionMet = true;
        }
        if (rule.condition === 'ENEMIES_GTE_3') {
          const nearby = this.activeMonsters.filter(m => m.state !== 'DEAD' && m.state !== 'RESPAWNING' && Math.hypot(m.x - this.playerPos.x, m.y - this.playerPos.y) < 135);
          conditionMet = nearby.length >= 3;
        }
        if (rule.condition === 'SP_GTE_30') conditionMet = this.saveData.character.currentSp >= Math.max(30, skillCost);

        if (conditionMet) {
          selectedSkillId = skill.id;
          this.saveData.character.currentSp -= skillCost;
          this.lastSkillTime[skill.id] = now;

          skillMultiplier = (skill.baseMultiplier || 1) + (skill.multiplierPerLevel || 0) * (skillLevel - 1);
          if (skill.id === 'pierce' && (target.data.size === 'Large' || target.data.size === 'Grande')) skillMultiplier *= 1.45;
          if (skill.type === 'BUFF') {
            this.activeBuffs[skill.id] = now + (skill.buffDuration || 45) * 1000;
            skillMultiplier = 1;
          }
          break;
        }
      }

      if (selectedSkillId) {
        const skillName = SKILLS[selectedSkillId]?.name || selectedSkillId;
        this.addFloatingText(skillName, this.playerPos.x, this.playerPos.y - 48, '#fff1a8', 1.15);
      }

      // Calculate Physical Damage
      const { damage, isCrit, isMiss } = CombatCalculator.calculatePhysicalDamage(
        this.derivedStats.atk,
        this.derivedStats.hit,
        this.derivedStats.crit,
        target.data.def,
        target.data.flee,
        skillMultiplier,
        target.data.size === 'Large'
      );

      if (isMiss) {
        this.addFloatingText('ESQUIVOU!', target.x, target.y - 10, '#3b82f6');
      } else {
        target.currentHp -= damage;
        target.hitFlash = 0.25;
        this.metrics.damageDealtWindow += damage;
        this.saveData.statistics.totalDamageDealt += damage;

        // Make hit monster aggressively counter-attack the player
        if (target.currentHp > 0 && target.state !== 'ATTACKING') {
          target.state = 'CHASE';
        }

        if (damage > this.saveData.statistics.highestDamage) {
          this.saveData.statistics.highestDamage = damage;
        }

        if (isCrit) {
          this.addFloatingText(`CRÍTICO! ${damage}`, target.x, target.y - 10, '#ef4444', 1.4);
          this.spawnAttackSparks(target.x, target.y, 'crit');
          AudioManager.getInstance().playCriticalHit();
        } else if (selectedSkillId) {
          this.addFloatingText(`${damage}`, target.x, target.y - 10, '#eab308', 1.3);
          this.spawnAttackSparks(target.x, target.y, 'skill');
          AudioManager.getInstance().playAttack();
        } else {
          this.addFloatingText(`${damage}`, target.x, target.y - 10, '#ffffff', 1.0);
          this.spawnAttackSparks(target.x, target.y, 'normal');
          AudioManager.getInstance().playAttack();
        }

        // Area skills damage every valid creature around the primary target.
        const selectedSkill = selectedSkillId ? SKILLS[selectedSkillId] : null;
        if (selectedSkill?.areaRadius) {
          this.activeMonsters
            .filter(monster => monster.instanceId !== target.instanceId && monster.state !== 'DEAD' && monster.state !== 'RESPAWNING')
            .filter(monster => Math.hypot(monster.x - target.x, monster.y - target.y) <= selectedSkill.areaRadius!)
            .slice(0, Math.max(0, (selectedSkill.maxTargets || 1) - 1))
            .forEach(monster => {
              const areaDamage = Math.max(1, Math.round(damage * (0.78 + Math.random() * 0.16)));
              monster.currentHp -= areaDamage;
              monster.hitFlash = 0.25;
              this.addFloatingText(`${areaDamage}`, monster.x, monster.y - 10, '#f59e0b', 1.15);
              this.spawnAttackSparks(monster.x, monster.y, 'skill');
              this.metrics.damageDealtWindow += areaDamage;
              this.saveData.statistics.totalDamageDealt += areaDamage;
              if (monster.currentHp <= 0) this.handleMonsterDeath(monster);
              else monster.state = 'CHASE';
            });
        }

        // Check if monster died
        if (target.currentHp <= 0) {
          this.handleMonsterDeath(target);
        }
      }
    }
  }

  private handleMonsterDeath(monster: ActiveMonster) {
    monster.state = 'DEAD';
    monster.currentHp = 0;
    monster.deathStartedAt = Date.now();
    monster.respawnStartedAt = undefined;
    monster.targetX = undefined;
    monster.targetY = undefined;
    AudioManager.getInstance().playMonsterDeath();

    this.metrics.killsWindow++;
    this.saveData.statistics.totalMonstersKilled++;
    this.saveData.monsterKills[monster.data.id] = (this.saveData.monsterKills[monster.data.id] || 0) + 1;

    if (monster.data.isMvp) {
      this.saveData.statistics.mvpKills++;
    }

    // Award EXP
    this.saveData.character.baseExp += monster.data.baseExp;
    this.metrics.expEarnedWindow += monster.data.baseExp;

    const zenyReward = Math.max(1, Math.round((monster.data.level * 3 + monster.data.baseExp * 0.35) * (0.85 + Math.random() * 0.3) * (monster.isElite ? 2.5 : 1)));
    this.saveData.character.zeny += zenyReward;
    this.metrics.zenyEarnedWindow += zenyReward;
    this.saveData.statistics.totalZenyEarned += zenyReward;
    this.addFloatingText(`+${zenyReward} Zeny`, monster.x, monster.y - 32, '#eab308');

    // Check Level Up
    this.checkLevelUp();

    // Process Drop Table
    monster.data.lootTable.forEach(drop => {
      if (Math.random() <= drop.chance) {
        const itemData = ITEMS[drop.itemId];
        if (itemData) {
          if (itemData.type === 'card') {
            this.addFloatingText('★ CARTA OBTIDA! ★', monster.x, monster.y - 30, '#f59e0b', 1.5);
            this.spawnAttackSparks(monster.x, monster.y, 'crit');
            AudioManager.getInstance().playCardDrop();
            this.saveData.statistics.totalCardsDropped++;
            if (!this.saveData.cardsDiscovered.includes(itemData.id)) {
              this.saveData.cardsDiscovered.push(itemData.id);
            }
          }

          this.droppedItems.push({
            instanceId: `drop_${Date.now()}_${Math.random()}`,
            itemId: itemData.id,
            x: monster.x + (Math.random() * 20 - 10),
            y: monster.y + (Math.random() * 20 - 10),
            amount: 1,
            spawnTime: Date.now(),
            rarity: ['weapon', 'armor', 'headgear', 'garment', 'shoes', 'accessory'].includes(itemData.type)
              ? rollItemRarity(Boolean(monster.isElite))
              : 'COMMON'
          });
        }
      }
    });

    this.playerState = 'SEARCHING';
    this.targetMonsterInstanceId = null;
  }

  private checkLevelUp() {
    let reqExp = getExpForLevel(this.saveData.character.baseLevel);
    while (this.saveData.character.baseExp >= reqExp && this.saveData.character.baseLevel < 99) {
      this.saveData.character.baseExp -= reqExp;
      this.saveData.character.baseLevel++;

      // Award stat points (3 + Math.floor(baseLevel/5))
      const points = 3 + Math.floor(this.saveData.character.baseLevel / 5);
      this.saveData.character.statPoints += points;
      this.saveData.skillPoints = (this.saveData.skillPoints || 0) + 1;
      this.saveData.character.jobLevel = Math.min(50, (this.saveData.character.jobLevel || 1) + 1);

      this.updateDerivedStats();
      this.saveData.character.currentHp = this.derivedStats.maxHp;
      this.saveData.character.currentSp = this.derivedStats.maxSp;

      this.levelUpEffect = { active: true, progress: 0 };
      this.addFloatingText('SUBIU DE NÍVEL!', this.playerPos.x, this.playerPos.y - 30, '#fde047', 1.5);
      this.spawnAttackSparks(this.playerPos.x, this.playerPos.y, 'levelUp');
      AudioManager.getInstance().playLevelUp();
      EventBus.getInstance().emit('PLAYER_LEVEL_UP', this.saveData.character.baseLevel);

      reqExp = getExpForLevel(this.saveData.character.baseLevel);
    }
  }

  private lootItem(item: DroppedItemInstance) {
    const itemData = ITEMS[item.itemId];
    if (itemData) {
      if (this.saveData.autoLootSettings.autoSellEtc && itemData.type === 'etc') {
        this.saveData.character.zeny += itemData.price;
        this.metrics.zenyEarnedWindow += itemData.price;
        this.saveData.statistics.totalZenyEarned += itemData.price;
        this.addFloatingText(`+${itemData.price} Zeny`, item.x, item.y, '#eab308');
      } else {
        const isEquipment = ['weapon', 'armor', 'headgear', 'garment', 'shoes', 'accessory'].includes(itemData.type);
        const existing = !isEquipment ? this.saveData.inventory.find(i => i.itemId === item.itemId) : undefined;
        if (existing) {
          existing.amount += item.amount;
        } else {
          this.saveData.inventory.push({
            instanceId: `inv_${Date.now()}_${Math.random()}`,
            itemId: item.itemId,
            refineLevel: 0,
            cards: [],
            amount: item.amount,
            rarity: item.rarity || 'COMMON',
            bonusStats: createRarityBonuses(itemData, item.rarity || 'COMMON')
          });
        }
        if (!this.saveData.itemsDiscovered.includes(itemData.id)) {
          this.saveData.itemsDiscovered.push(itemData.id);
        }
        this.addFloatingText(`+1 ${itemData.name}${item.rarity && item.rarity !== 'COMMON' ? ` [${item.rarity}]` : ''}`, item.x, item.y - 10, '#38bdf8');
      }
    }

    this.droppedItems = this.droppedItems.filter(i => i.instanceId !== item.instanceId);
  }

  private processMonsterAI(deltaTimeSec: number) {
    const now = Date.now();
    const currentMap = MAPS[this.saveData.currentMapId] || MAPS['prt_fild01'];

    this.activeMonsters.forEach(m => {
      if (m.state === 'DEAD' || m.state === 'RESPAWNING') return;

      m.animFrame++;
      m.attackAnimationProgress = Math.max(0, m.attackAnimationProgress - deltaTimeSec * 4.5);

      if (m.hitFlash && m.hitFlash > 0) {
        m.hitFlash -= deltaTimeSec;
        if (m.hitFlash < 0) m.hitFlash = 0;
      }

      const edgeMargin = 42;
      if (m.state !== 'ATTACKING' && m.state !== 'CHASE') {
        const hitLeft = m.x <= edgeMargin;
        const hitRight = m.x >= currentMap.width - edgeMargin;
        const hitTop = m.y <= edgeMargin;
        const hitBottom = m.y >= currentMap.height - edgeMargin;
        if (hitLeft || hitRight || hitTop || hitBottom) {
          m.targetX = hitLeft ? edgeMargin + 90 : hitRight ? currentMap.width - edgeMargin - 90 : m.x;
          m.targetY = hitTop ? edgeMargin + 90 : hitBottom ? currentMap.height - edgeMargin - 90 : m.y;
          m.state = 'MOVING';
          const turnDx = m.targetX - m.x;
          const turnDy = m.targetY - m.y;
          m.direction = Math.abs(turnDx) > Math.abs(turnDy)
            ? (turnDx > 0 ? 'right' : 'left')
            : (turnDy > 0 ? 'down' : 'up');
        }
      }

      const distToPlayer = Math.hypot(m.x - this.playerPos.x, m.y - this.playerPos.y);
      const combatDistance = Math.max(50, m.data.attackRange);

      if (m.data.behavior === 'AGGRESSIVE' && distToPlayer < 180 && m.state !== 'ATTACKING') {
        m.state = 'CHASE';
      }

      if (m.state === 'CHASE') {
        if (distToPlayer <= combatDistance) {
          m.state = 'ATTACKING';
        } else {
          // Move towards player
          const dx = this.playerPos.x - m.x;
          const dy = this.playerPos.y - m.y;
          const step = Math.min(m.data.moveSpeed * deltaTimeSec, Math.max(0, distToPlayer - combatDistance));
          m.x += (dx / distToPlayer) * step;
          m.y += (dy / distToPlayer) * step;
          m.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
      } else if (m.state === 'ATTACKING') {
        const faceDx = this.playerPos.x - m.x;
        const faceDy = this.playerPos.y - m.y;
        m.direction = Math.abs(faceDx) > Math.abs(faceDy)
          ? (faceDx > 0 ? 'right' : 'left')
          : (faceDy > 0 ? 'down' : 'up');

        if (distToPlayer > combatDistance + 18) {
          m.state = 'CHASE';
        } else if (now - m.lastAttackTime >= 1000 / m.data.aspd) {
          m.lastAttackTime = now;
          m.attackAnimationProgress = 1;
          // Monster attacks Knight!
          const { damage, isMiss } = CombatCalculator.calculatePhysicalDamage(
            Math.max(1, Math.floor(m.data.atk * 0.86)),
            m.data.hit,
            0,
            this.derivedStats.def,
            this.derivedStats.flee
          );

          if (isMiss) {
            this.addFloatingText('ESQUIVOU!', this.playerPos.x, this.playerPos.y - 15, '#3b82f6');
          } else {
            this.saveData.character.currentHp -= damage;
            this.saveData.statistics.totalDamageTaken += damage;
            this.addFloatingText(`-${damage}`, this.playerPos.x, this.playerPos.y - 15, '#ef4444');
            this.spawnAttackSparks(this.playerPos.x, this.playerPos.y, 'playerHit');

            if (this.saveData.character.currentHp <= 0) {
              this.handlePlayerDeath();
            }
          }
        }
      } else if (m.data.moveSpeed > 0) {
        // --- PASSIVE MONSTER WANDERING MOVEMENT ---
        if (m.state === 'IDLE') {
          m.wanderTimer = (m.wanderTimer || 0) + deltaTimeSec;
          if (m.wanderTimer > (m.nextWanderDelay || 2)) {
            m.wanderTimer = 0;
            m.nextWanderDelay = 1.4 + Math.random() * 2.4;
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 70;
            const tx = Math.max(40, Math.min(currentMap.width - 40, m.x + Math.cos(angle) * dist));
            const ty = Math.max(40, Math.min(currentMap.height - 40, m.y + Math.sin(angle) * dist));

            if (!this.pathfinder.isObstacle(tx, ty)) {
              m.targetX = tx;
              m.targetY = ty;
              m.state = 'MOVING';
            }
          }
        } else if (m.state === 'MOVING') {
          if (m.targetX !== undefined && m.targetY !== undefined) {
            const dx = m.targetX - m.x;
            const dy = m.targetY - m.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4) {
              m.state = 'IDLE';
              m.wanderTimer = 0;
            } else {
              const step = m.data.moveSpeed * 0.56 * deltaTimeSec;
              m.x += (dx / dist) * step;
              m.y += (dy / dist) * step;
              m.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            }
          } else {
            m.state = 'IDLE';
          }
        }
      }
    });

    this.applyActorSeparation(currentMap.width, currentMap.height);
  }

  private applyActorSeparation(mapWidth: number, mapHeight: number) {
    const living = this.activeMonsters.filter(monster => monster.state !== 'DEAD' && monster.state !== 'RESPAWNING');
    const minimumMonsterGap = 38;

    for (let i = 0; i < living.length; i++) {
      const monster = living[i];
      for (let j = i + 1; j < living.length; j++) {
        const other = living[j];
        const dx = other.x - monster.x;
        const dy = other.y - monster.y;
        const distance = Math.max(0.01, Math.hypot(dx, dy));
        if (distance >= minimumMonsterGap) continue;

        const push = (minimumMonsterGap - distance) / 2;
        const nx = dx / distance;
        const ny = dy / distance;
        monster.x -= nx * push;
        monster.y -= ny * push;
        other.x += nx * push;
        other.y += ny * push;
      }

      const playerDx = monster.x - this.playerPos.x;
      const playerDy = monster.y - this.playerPos.y;
      const playerDistance = Math.max(0.01, Math.hypot(playerDx, playerDy));
      if (playerDistance < 48) {
        monster.x = this.playerPos.x + (playerDx / playerDistance) * 48;
        monster.y = this.playerPos.y + (playerDy / playerDistance) * 48;
      }

      monster.x = Math.max(38, Math.min(mapWidth - 38, monster.x));
      monster.y = Math.max(44, Math.min(mapHeight - 38, monster.y));
    }
  }

  public handlePlayerDeath() {
    this.playerState = 'DEAD';
    this.saveData.character.currentHp = 0;
    this.saveData.statistics.totalDeaths++;
    EventBus.getInstance().emit('PLAYER_DIED');
  }

  public respawnPlayer() {
    this.saveData.character.currentHp = this.derivedStats.maxHp;
    this.saveData.character.currentSp = this.derivedStats.maxSp;
    this.changeMap('prontera_guild');
    this.playerState = 'IDLE';
  }

  private checkMonsterRespawns() {
    const now = Date.now();

    this.activeMonsters.forEach(m => {
      if (m.state === 'DEAD') {
        const deathStartedAt = m.deathStartedAt ?? now;
        m.deathStartedAt = deathStartedAt;
        if (now - deathStartedAt < 5000) return;

        const currentMap = MAPS[this.saveData.currentMapId] || MAPS['prt_fild01'];
        const oldX = m.x;
        const oldY = m.y;
        for (let attempt = 0; attempt < 18; attempt++) {
          const candidateX = 55 + Math.random() * (currentMap.width - 110);
          const candidateY = 55 + Math.random() * (currentMap.height - 110);
          if (this.pathfinder.isObstacle(candidateX, candidateY)) continue;
          if (Math.hypot(candidateX - oldX, candidateY - oldY) < 170) continue;
          if (Math.hypot(candidateX - this.playerPos.x, candidateY - this.playerPos.y) < 120) continue;
          m.x = candidateX;
          m.y = candidateY;
          break;
        }
        m.currentHp = m.data.hp;
        m.state = 'RESPAWNING';
        m.respawnStartedAt = now;
        m.animFrame = 0;
        return;
      }

      if (m.state === 'RESPAWNING' && now - (m.respawnStartedAt ?? now) >= 700) {
        m.state = 'IDLE';
        m.deathStartedAt = undefined;
        m.respawnStartedAt = undefined;
        m.wanderTimer = 0;
        m.nextWanderDelay = 1 + Math.random() * 2;
      }
    });
  }

  public addFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      scale,
      opacity: 1.0,
      createdAt: Date.now()
    });
  }

  public forceSave() {
    if (this.saveData) {
      SaveManager.saveGame(this.saveData);
    }
  }

  public allocateStatPoint(stat: 'str' | 'agi' | 'vit' | 'int' | 'dex' | 'luk') {
    if (this.saveData.character.statPoints > 0) {
      this.saveData.character.stats[stat]++;
      this.saveData.character.statPoints--;
      this.updateDerivedStats();
    }
  }

  public equipItem(item: any, slot: any) {
    const currentEquipped = this.saveData.equipment[slot as keyof typeof this.saveData.equipment];
    if (currentEquipped) {
      currentEquipped.isEquipped = false;
      this.saveData.inventory.push(currentEquipped);
    }
    item.isEquipped = true;
    item.equippedSlot = slot;
    this.saveData.equipment[slot as keyof typeof this.saveData.equipment] = item;
    this.saveData.inventory = this.saveData.inventory.filter(i => i.instanceId !== item.instanceId);
    this.updateDerivedStats();
  }

  public unequipItem(slot: any) {
    const item = this.saveData.equipment[slot as keyof typeof this.saveData.equipment];
    if (item) {
      item.isEquipped = false;
      this.saveData.inventory.push(item);
      this.saveData.equipment[slot as keyof typeof this.saveData.equipment] = null;
      this.updateDerivedStats();
    }
  }

  public useConsumable(item: any) {
    const itemData = ITEMS[item.itemId];
    if (!itemData || !itemData.consumableEffect) return;

    if (itemData.consumableEffect.hpHeal) {
      this.saveData.character.currentHp = Math.min(
        this.derivedStats.maxHp,
        this.saveData.character.currentHp + itemData.consumableEffect.hpHeal
      );
      this.addFloatingText(`+${itemData.consumableEffect.hpHeal} HP`, this.playerPos.x, this.playerPos.y - 20, '#10b981');
    }

    item.amount--;
    if (item.amount <= 0) {
      this.saveData.inventory = this.saveData.inventory.filter(i => i.instanceId !== item.instanceId);
    }
  }

  public sellItem(item: any) {
    const itemData = ITEMS[item.itemId];
    if (!itemData) return;

    const income = Math.round(itemData.price * item.amount * rarityValueMultiplier(item.rarity));
    this.saveData.character.zeny += income;
    this.metrics.zenyEarnedWindow += income;
    this.saveData.statistics.totalZenyEarned += income;
    this.saveData.inventory = this.saveData.inventory.filter(i => i.instanceId !== item.instanceId);
  }

  public travelToMap(mapId: string) {
    if (this.saveData.currentMapId === mapId && this.mapTransitionState === 'IDLE') return;

    const targetMap = MAPS[mapId] || MAPS['prt_fild01'];
    this.pendingMapId = mapId;
    this.mapTransitionName = targetMap.name;
    this.mapTransitionState = 'FADING_OUT';
  }

  public interactAt(x: number, y: number): boolean {
    if (this.saveData.currentMapId !== 'prontera_guild') return false;
    const npc = GUILD_NPCS.find(entry => Math.hypot(entry.x - x, entry.y - y) <= 55);
    if (!npc) return false;
    EventBus.getInstance().emit('GUILD_NPC_INTERACT', npc.service as GuildService);
    return true;
  }

  private getSkillLevel(skillId: string): number {
    return Math.max(1, Math.min(10, this.saveData.skillLevels?.[skillId] || 1));
  }

  public upgradeSkill(skillId: string): { success: boolean; message: string } {
    if (!SKILLS[skillId]) return { success: false, message: 'Habilidade desconhecida.' };
    this.saveData.skillLevels ??= {};
    const level = this.getSkillLevel(skillId);
    if (level >= 10) return { success: false, message: 'Habilidade no nível máximo.' };
    if ((this.saveData.skillPoints || 0) <= 0) return { success: false, message: 'Sem pontos de habilidade.' };
    this.saveData.skillLevels[skillId] = level + 1;
    this.saveData.skillPoints!--;
    return { success: true, message: `${SKILLS[skillId].name} evoluiu para Nv.${level + 1}.` };
  }

  private executeMapTravel(mapId: string) {
    this.saveData.currentMapId = mapId;
    const currentMap = MAPS[mapId] || MAPS['prt_fild01'];
    this.pathfinder = new Pathfinder(currentMap.width, currentMap.height, 20);
    this.pathfinder.setObstacles(currentMap.obstacles);
    this.playerPos = { x: currentMap.width / 2, y: currentMap.height / 2 };
    this.activeMonsters = [];
    this.droppedItems = [];
    this.playerPath = [];
    this.playerState = 'SEARCHING';
    this.spawnMapMonsters();
    AudioManager.getInstance().playBgm(currentMap.bgm);
    EventBus.getInstance().emit('MAP_CHANGED', currentMap);
  }

  public refineEquippedItem(slot: any): { success: boolean; message: string } {
    const item = this.saveData.equipment[slot as keyof typeof this.saveData.equipment];
    if (!item) return { success: false, message: 'No item equipped in that slot.' };

    const current = item.refineLevel;
    if (current >= 10) return { success: false, message: 'Item is already at max refine level (+10).' };

    const cost = (current + 1) * 2000;
    if (this.saveData.character.zeny < cost) return { success: false, message: 'Not enough Zeny.' };

    this.saveData.character.zeny -= cost;
    const successChance = current < 4 ? 100 : Math.max(10, 100 - (current - 3) * 15);
    const roll = Math.random() * 100;

    if (roll <= successChance) {
      item.refineLevel++;
      this.updateDerivedStats();
      return { success: true, message: `Refine Success! Item is now +${item.refineLevel}!` };
    } else {
      if (current > 4) item.refineLevel = Math.max(0, item.refineLevel - 1);
      this.updateDerivedStats();
      return { success: false, message: 'Refine Failed! Item level degraded.' };
    }
  }

  public updateSaveData(newSave: SaveData) {
    this.saveData = newSave;
    this.updateDerivedStats();
  }

  public addExp(base: number, job: number) {
    this.saveData.character.baseExp += base;
    const reqExp = getExpForLevel(this.saveData.character.baseLevel);
    while (this.saveData.character.baseExp >= reqExp && this.saveData.character.baseLevel < 99) {
      this.saveData.character.baseExp -= reqExp;
      this.saveData.character.baseLevel++;
      this.saveData.character.statPoints += 5;
      this.saveData.skillPoints = (this.saveData.skillPoints || 0) + 1;
      this.saveData.character.jobLevel = Math.min(50, (this.saveData.character.jobLevel || 1) + 1);
      this.levelUpEffect = { active: true, progress: 1.0 };
      this.addFloatingText('LEVEL UP!', this.playerPos.x, this.playerPos.y - 30, '#f59e0b', 1.5);
    }
    this.updateDerivedStats();
  }

  public grantItem(itemId: string, amount: number, rarity: ItemRarity = 'COMMON') {
    const itemData = ITEMS[itemId];
    const isEquipment = itemData && ['weapon', 'armor', 'headgear', 'garment', 'shoes', 'accessory'].includes(itemData.type);
    const existing = !isEquipment ? this.saveData.inventory.find(i => i.itemId === itemId) : undefined;
    if (existing) {
      existing.amount += amount;
    } else {
      this.saveData.inventory.push({
        instanceId: `grant_${Date.now()}_${Math.random()}`,
        itemId,
        refineLevel: 0,
        cards: [],
        amount,
        rarity,
        bonusStats: itemData ? createRarityBonuses(itemData, rarity) : undefined
      });
    }
  }

  public buyGuildItem(itemId: string): { success: boolean; message: string } {
    const offer = GUILD_SHOP.find(entry => entry.itemId === itemId);
    const item = ITEMS[itemId];
    if (!offer || !item) return { success: false, message: 'Item indisponível.' };
    if (this.saveData.character.zeny < offer.price) return { success: false, message: 'Zeny insuficiente.' };
    this.saveData.character.zeny -= offer.price;
    this.grantItem(itemId, 1);
    return { success: true, message: `${item.name} comprado.` };
  }

  public craftGuildRecipe(recipeId: string): { success: boolean; message: string } {
    const recipe = GUILD_RECIPES.find(entry => entry.id === recipeId);
    if (!recipe) return { success: false, message: 'Receita desconhecida.' };
    if (this.saveData.character.zeny < recipe.zenyCost) return { success: false, message: 'Zeny insuficiente.' };

    const missing = recipe.materials.find(material => {
      const owned = this.saveData.inventory.find(item => item.itemId === material.itemId)?.amount || 0;
      return owned < material.amount;
    });
    if (missing) return { success: false, message: `Materiais insuficientes: ${ITEMS[missing.itemId]?.name || missing.itemId}.` };

    recipe.materials.forEach(material => {
      const owned = this.saveData.inventory.find(item => item.itemId === material.itemId);
      if (!owned) return;
      owned.amount -= material.amount;
      if (owned.amount <= 0) this.saveData.inventory = this.saveData.inventory.filter(item => item.instanceId !== owned.instanceId);
    });
    this.saveData.character.zeny -= recipe.zenyCost;
    const rarity = rollItemRarity(false);
    this.grantItem(recipe.resultItemId, 1, rarity);
    return { success: true, message: `${ITEMS[recipe.resultItemId]?.name || 'Equipamento'} criado com raridade ${rarity}.` };
  }

  public claimGuildMission(missionId: string): { success: boolean; message: string } {
    const mission = GUILD_MISSIONS.find(entry => entry.id === missionId);
    if (!mission) return { success: false, message: 'Missão desconhecida.' };
    this.saveData.claimedGuildMissions ??= [];
    if (this.saveData.claimedGuildMissions.includes(missionId)) return { success: false, message: 'Recompensa já recebida.' };
    if ((this.saveData.monsterKills[mission.monsterId] || 0) < mission.requiredKills) return { success: false, message: 'Objetivo ainda não concluído.' };

    this.saveData.character.zeny += mission.zenyReward;
    if (mission.itemReward) this.grantItem(mission.itemReward.itemId, mission.itemReward.amount);
    this.saveData.claimedGuildMissions.push(missionId);
    return { success: true, message: 'Missão concluída e recompensa recebida.' };
  }
}
