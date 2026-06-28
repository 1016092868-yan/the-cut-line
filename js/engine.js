// ============================================================
// engine.js — 3D 跑酷引擎核心循环 (Three.js)
// 第三人称追尾视角 + 独立跑道按键
// ============================================================

let gameLoopId = null;
let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60;

const Engine = {

  async start(character, worldId, levelIndex) {
    const world = getWorld(worldId);
    const level = world.levels[levelIndex];

    await Game3D.init('game-container');
    Game3D.setWorld(worldId);

    GameState.currentWorld = worldId;
    GameState.currentLevelIndex = levelIndex;
    GameState.resetGameData(character, level, world.params);
    GameState.isRunning = true;
    GameState.isPaused = false;
    GameState.isGameOver = false;

    const gd = GameState.gameData;
    gd.totalDistance = level.length;
    gd.speed = 20 * (level.specialRules.includes('speed_boost_1.05x') ? 1.05 : 1.0);
    Game3D.gameData = gd;

    // 初始化子系统
    Lanes3D.init(level.length);
    Environment3D.init(worldId);
    Player3D.init();
    Obstacles3D.init(level, world.params);
    Collectibles3D.init(level, world.params);
    Cutline3D.init(level.length);
    Effects3D.init();
    HUD.init();
    AudioFX.init();
    SettlementPanel.init();

    // 特殊规则
    if (level.specialRules.includes('corporate_only')) {
      gd.currentLane = 0;
      gd.lanesOpen = 1;
    }

    showScreen('game');

    // 首次游戏触发教程
    Tutorial.init();
    if (!Tutorial.completed) {
      GameState.isPaused = true;
      setTimeout(() => Tutorial.start(), 500);
    }

    lastTime = performance.now();
    accumulator = 0;
    gameLoopId = requestAnimationFrame((t) => Engine.loop(t));
  },

  stop() {
    GameState.isRunning = false;
    if (gameLoopId) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
    }
  },

  pause() {
    GameState.isPaused = true;
  },

  resume() {
    GameState.isPaused = false;
  },

  loop(timestamp) {
    if (!GameState.isRunning) return;

    const frameTime = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;

    // 先更新输入（确保按键状态在 fixedUpdate 之前就绪）
    Input.update();

    if (!GameState.isPaused) {
      accumulator += frameTime;
      while (accumulator >= FIXED_STEP) {
        Engine.fixedUpdate(FIXED_STEP / 1000);
        accumulator -= FIXED_STEP;
      }
      Engine.render3D();
    }

    gameLoopId = requestAnimationFrame((t) => Engine.loop(t));
  },

  fixedUpdate(dt) {
    const gd = GameState.gameData;
    if (!gd) return;

    // 推进距离
    gd.distance += gd.speed * dt;
    gd.cycleDistance += gd.speed * dt;
    Game3D.scrollSpeed = gd.speed;

    // 赛段
    const progress = gd.distance / gd.totalDistance;
    if (progress < 0.33) gd.currentSegment = 's1';
    else if (progress < 0.66) gd.currentSegment = 's2';
    else gd.currentSegment = 's3';

    // 冷却
    if (gd.switchCooldown > 0) gd.switchCooldown -= gd.speed * dt;

    // 更新子系统
    Player3D.update(dt);
    Stamina.update(dt);
    Economy.update(dt);
    Obstacles3D.update(dt);
    Collectibles3D.update(dt);
    Combo.update(dt);
    Cutline3D.update(dt);
    Environment3D.update(dt);
    Effects3D.update(dt);
    Events.update(dt);
    Lanes3D.update(dt);

    // 跑动音效
    AudioFX.footstep(gd.speed / 20);

    // 斩杀线警告音
    const staminaPct = gd.stamina / gd.staminaMax;
    if (staminaPct < 0.2) AudioFX.cutlineWarning(1 - staminaPct);
    if (gd.netWorth < -80000) AudioFX.cutlineWarning(0.7);

    // 500m 结算
    if (gd.cycleDistance >= 500) {
      gd.cycleDistance -= 500;
      gd.cycleCount++;
      Settlement.triggerCycle();
    }

    if (gd.distance >= gd.totalDistance) Engine.finishLevel();
    if (gd.stamina <= 0) Engine.gameOver('stamina');
  },

  render3D() {
    const gd = GameState.gameData;
    const cam = Game3D.camera;

    // 第三人称追尾视角：相机始终在角色正后方
    const targetX = Player3D.currentLaneX;
    const targetY = 3.5 + Player3D.bounceOffset * 0.2;
    const targetZ = Player3D.worldZ + 7;

    // 平滑跟随（lerp factor可调）
    const lerp = 0.12;
    cam.position.x += (targetX - cam.position.x) * lerp;
    cam.position.y += (targetY - cam.position.y) * lerp;
    cam.position.z += (targetZ - cam.position.z) * lerp;

    // 注视点：角色前方远处
    const lookX = targetX;
    const lookY = 1.6;
    const lookZ = Player3D.worldZ - 25;
    cam.lookAt(lookX, lookY, lookZ);

    // 体力低时 FOV 增大（紧张感）
    const staminaPct = gd.stamina / gd.staminaMax;
    const baseFov = 68;
    const targetFov = staminaPct < 0.15 ? 82 : staminaPct < 0.35 ? 76 : baseFov;
    cam.fov += (targetFov - cam.fov) * 0.06;

    // 天空球跟随相机
    if (Game3D.skyDome) {
      Game3D.skyDome.position.set(cam.position.x, 0, cam.position.z);
    }

    Game3D.render();
    HUD.update();
  },

  finishLevel() {
    this.stop();
    const gd = GameState.gameData;
    const level = getLevel(GameState.currentWorld, GameState.currentLevelIndex);
    const won = this.checkVictory(level);
    let lxpEarned = won ? 100 : 20;
    lxpEarned += Math.min(Math.floor(gd.netWorth / 10000) * 5, 500);
    if (won && GameState.worldProgress[GameState.currentWorld].cleared.filter(c => c).length === 0) {
      lxpEarned += 200;
    }
    GameState.addLXP(lxpEarned);
    if (won) {
      GameState.clearLevel(GameState.currentWorld, GameState.currentLevelIndex);
      level.unlocks.forEach(u => {
        if (u === 'world_2') GameState.unlockWorld(2);
        if (u === 'world_3') GameState.unlockWorld(3);
        if (u === 'world_4') GameState.unlockWorld(4);
        if (u === 'world_5') GameState.unlockWorld(5);
      });
    }
    // 使用深度结算面板替代简单弹窗
    SettlementPanel.show(won, lxpEarned, level);
  },

  gameOver(reason) {
    this.stop();
    GameState.isGameOver = true;
    GameState.addLXP(10);
    AudioFX.gameOver();
    SettlementPanel.show(false, 10, null);
  },

  checkVictory(level) {
    const gd = GameState.gameData;
    const vc = level.victory;
    if (!vc || !vc.conditions) return true;
    for (const cond of vc.conditions) {
      if (cond.type === 'net_worth' && gd.netWorth < cond.value) return false;
      if (cond.type === 'switch_count' && cond.operator === '>=' && gd.laneSwitches < cond.value) return false;
      if (cond.type === 'switch_count' && cond.operator === '<=' && gd.laneSwitches > cond.value) return false;
      if (cond.type === 'collect_count' && gd.collectiblesPicked < cond.value) return false;
      if (cond.type === 'max_combo' && gd.maxCombo < cond.value) return false;
    }
    return true;
  },

  // ===== 独立跑道切换 =====
  // directLane: 0=上道(Corp), 1=中道(Startup), 2=下道(SideHustle)
  switchToLane(directLane) {
    const gd = GameState.gameData;
    if (gd.switchCooldown > 0) return;
    if (GameState.isPaused || GameState.isGameOver) return;
    if (directLane < 0 || directLane >= gd.lanesOpen) return;
    if (directLane === gd.currentLane) return; // 已经是该跑道

    gd.currentLane = directLane;
    gd.laneSwitches++;
    gd.switchCooldown = 50;
    gd.stamina = Math.max(0, gd.stamina - 3);
    gd.cycleIncome *= 0.85;
    Player3D.startLaneSwitch(directLane);
    AudioFX.laneSwitch();
  }
};
