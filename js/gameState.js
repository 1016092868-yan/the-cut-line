// ============================================================
// gameState.js — 全局游戏状态管理
// ============================================================

const GameState = {
  // 屏幕状态
  screen: 'menu',           // menu | char-select | world-map | level-select | game | result

  // 玩家选择
  selectedCharacter: null,
  totalLXP: 0,              // 累计人生经验值

  // 世界进度
  worldProgress: {
    1: { unlocked: true, cleared: [false,false,false,false,false] },
    2: { unlocked: false, cleared: [false,false,false,false] },
    3: { unlocked: false, cleared: [false,false,false,false,false] },
    4: { unlocked: false, cleared: [false,false,false,false,false] },
    5: { unlocked: false, cleared: [false,false,false,false,false] }
  },

  // 当前游戏
  currentWorld: 1,
  currentLevelIndex: 0,
  isRunning: false,
  isPaused: false,
  isGameOver: false,

  // 游戏内数据（由引擎更新）
  gameData: {
    distance: 0,              // 当前距离 (m)
    totalDistance: 0,         // 总距离 (m)
    speed: 20,                // 基础速度 m/s
    currentLane: 1,           // 0=上, 1=中, 2=下
    laneSwitches: 0,          // 切换次数
    switchCooldown: 0,        // 切换冷却剩余距离
    stamina: 100,
    staminaMax: 100,
    netWorth: 0,
    cash: 5000,
    loan: -40000,
    incomePerSec: 0,
    combo: 0,
    maxCombo: 0,
    comboMultiplier: 1.0,
    scoreRating: 'B',
    perfectDodges: 0,
    totalObstacles: 0,
    dodgedObstacles: 0,
    collectiblesPicked: 0,
    totalCollectibles: 0,
    married: false,
    children: 0,
    assets: [],               // ['car', 'house', 'fitness_basic', ...]
    insurances: [],
    fitnessLevel: 0,
    activeEvents: [],
    cutlineTriggered: { economic: false, stamina: false, social: false, time: false },
    cycleIncome: 0,
    cycleExpense: 0,
  },

  init() {
    // 尝试从 localStorage 加载进度
    this.loadProgress();
    Input.init();
    showMenu();
  },

  resetGameData(character, levelConfig, worldParams) {
    const fullStats = getCharacterFullStats(character);
    this.selectedCharacter = character;
    this.gameData = {
      distance: 0,
      totalDistance: levelConfig.length,
      speed: 20,
      currentLane: 1,
      laneSwitches: 0,
      switchCooldown: 0,
      stamina: fullStats.staminaMax,
      staminaMax: fullStats.staminaMax,
      staminaRecovery: fullStats.staminaRecovery,
      netWorth: fullStats.cash + fullStats.studentLoan,
      cash: fullStats.cash,
      loan: fullStats.studentLoan,
      incomePerSec: 120 * fullStats.baseIncomeMult,
      baseIncomePerSec: 120,
      incomeMult: fullStats.baseIncomeMult,
      combo: 0,
      maxCombo: 0,
      comboMultiplier: 1.0,
      scoreRating: 'B',
      perfectDodges: 0,
      totalObstacles: 0,
      dodgedObstacles: 0,
      collectiblesPicked: 0,
      totalCollectibles: 0,
      married: false,
      children: 0,
      assets: [],
      insurances: [],
      fitnessLevel: 0,
      activeEvents: [],
      cutlineTriggered: { economic: false, stamina: false, social: false, time: false },
      cycleIncome: 0,
      cycleExpense: 0,
      cycleDistance: 0,
      currentSegment: 's1',
      eventCooldown: 0,
      negativeEventStreak: 0,
      // 角色特质数据
      trait: character.trait,
      traitData: {},
      // 世界参数
      worldParams: worldParams,
      // 结算周期
      cycleCount: 0,
      lastCycleDistance: 0,
      // 婚姻
      weddingCost: fullStats.weddingCost,
      divorceRate: fullStats.divorceRate,
      // 贷款
      loanRateMod: fullStats.loanRateMod,
      assetPriceMult: fullStats.assetPriceMult,
      lanesOpen: fullStats.lanesOpen,
      passiveIncomeMult: fullStats.passiveIncomeMult,
      trainingCostMult: fullStats.trainingCostMult,
    };
  },

  // 本地存储
  saveProgress() {
    const data = {
      totalLXP: this.totalLXP,
      worldProgress: this.worldProgress
    };
    localStorage.setItem('the-cut-line-progress', JSON.stringify(data));
  },

  loadProgress() {
    try {
      const raw = localStorage.getItem('the-cut-line-progress');
      if (raw) {
        const data = JSON.parse(raw);
        this.totalLXP = data.totalLXP || 0;
        if (data.worldProgress) {
          Object.assign(this.worldProgress, data.worldProgress);
        }
      }
    } catch(e) {
      console.log('No saved progress found, starting fresh.');
    }
  },

  addLXP(amount) {
    this.totalLXP += amount;
    this.saveProgress();
  },

  unlockWorld(worldId) {
    if (this.worldProgress[worldId]) {
      this.worldProgress[worldId].unlocked = true;
    }
    this.saveProgress();
  },

  clearLevel(worldId, levelIndex) {
    if (this.worldProgress[worldId]) {
      this.worldProgress[worldId].cleared[levelIndex] = true;
    }
    this.saveProgress();
  },

  getNextUnclearedLevel(worldId) {
    const wp = this.worldProgress[worldId];
    if (!wp) return 0;
    for (let i = 0; i < wp.cleared.length; i++) {
      if (!wp.cleared[i]) return i;
    }
    return wp.cleared.length - 1; // all cleared, return last
  }
};
