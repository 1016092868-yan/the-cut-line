// ============================================================
// collectibles.js — 收集品系统
// ============================================================

const Collectibles = {
  list: [],
  spawnTimer: 0,
  density: 1.5,
  types: [
    { id: 'cash', emoji: '💵', name: 'Cash', nameCN: '现金', effect: 'cash', value: 500 },
    { id: 'energy', emoji: '⚡', name: 'Energy Drink', nameCN: '能量饮料', effect: 'stamina', value: 15 },
    { id: 'stock', emoji: '📈', name: 'Stock Option', nameCN: '股票期权', effect: 'passive_boost', value: 1.5 },
    { id: 'shield', emoji: '🛡', name: 'Shield', nameCN: '护盾', effect: 'shield', value: 1 },
    { id: 'skill', emoji: '🎓', name: 'Skill Book', nameCN: '技能书', effect: 'permanent_income', value: 0.02 }
  ],

  init(level, worldParams) {
    this.list = [];
    this.spawnTimer = 0;
    this.density = worldParams.collectibleDensity;
  },

  update(dt) {
    const gd = GameState.gameData;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = (0.8 + Math.random() * 1.5) / this.density;
      this.spawn();
    }

    const scrollSpeed = gd.speed;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const col = this.list[i];
      col.x -= scrollSpeed * dt;

      // 拾取判定
      if (!col.picked && Math.abs(col.x - Player.x) < 30 && col.lane === gd.currentLane) {
        col.picked = true;
        gd.collectiblesPicked++;
        gd.totalCollectibles++;
        this.applyEffect(col);
      }

      if (col.x < -100) {
        if (!col.picked) gd.totalCollectibles++;
        this.list.splice(i, 1);
      }
    }
  },

  spawn() {
    const gd = GameState.gameData;
    const type = this.types[Math.floor(Math.random() * this.types.length)];
    const lane = Math.floor(Math.random() * Math.min(gd.lanesOpen, 3));
    this.list.push({
      ...type,
      x: Player.x + 300 + Math.random() * 500,
      lane: lane,
      picked: false,
      y: Lanes.laneY ? Lanes.laneY[lane] : 200 + lane * 150
    });
  },

  applyEffect(col) {
    const gd = GameState.gameData;
    switch (col.effect) {
      case 'cash':
        gd.cash += col.value;
        gd.netWorth = gd.cash + gd.loan;
        break;
      case 'stamina':
        gd.stamina = Math.min(gd.staminaMax, gd.stamina + col.value);
        break;
      case 'passive_boost':
        gd.incomePerSec *= col.value;
        setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 8000);
        break;
      case 'shield':
        gd.shieldActive = true;
        break;
      case 'permanent_income':
        gd.baseIncomePerSec *= (1 + col.value);
        gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult;
        break;
    }
  },

  render(ctx) {
    this.list.forEach(col => {
      if (!col.picked) {
        const y = Lanes.laneY ? Lanes.laneY[col.lane] : 200 + col.lane * 150;
        ctx.font = '24px sans-serif';
        ctx.fillText(col.emoji, col.x, y - 20);
      }
    });
  }
};
