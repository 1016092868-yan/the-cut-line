// ============================================================
// obstacles.js — 障碍物系统
// ============================================================

const Obstacles = {
  list: [],
  spawnTimer: 0,
  density: 0.5,
  types: [
    { id: 'deadline', emoji: '🚧', name: 'Deadline', nameCN: '截止日', damage: 5, incomePenalty: 2, speedPenalty: 0, segment: 's2' },
    { id: 'toxic_boss', emoji: '👔', name: 'Toxic Boss', nameCN: '烂老板', damage: 8, incomePenalty: 0.10, speedPenalty: 0, segment: 'all' },
    { id: 'traffic', emoji: '🚗', name: 'Traffic Jam', nameCN: '堵车', damage: 3, incomePenalty: 0, speedPenalty: 0.5, segment: 'all', needCar: true },
    { id: 'burnout', emoji: '💻', name: 'Burnout', nameCN: '过劳', damage: 15, incomePenalty: 0, speedPenalty: 0, segment: 's3', forceSwitch: true },
    { id: 'market_crash', emoji: '📉', name: 'Crash', nameCN: '崩盘', damage: 0, incomePenalty: 0, speedPenalty: 0, segment: 's2', wealthLoss: 0.05 },
    { id: 'sick_wave', emoji: '🦠', name: 'Sick Wave', nameCN: '流感', damage: 10, incomePenalty: 0, speedPenalty: 0, segment: 'all' }
  ],

  init(level, worldParams) {
    this.list = [];
    this.spawnTimer = 0;
    this.density = worldParams.obstacleDensity;
    if (level.specialRules.includes('obstacles_reduced_30')) this.density *= 0.7;
    if (level.specialRules.includes('obstacle_density_2x')) this.density *= 2.0;
  },

  update(dt) {
    const gd = GameState.gameData;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnTimer = (0.5 + Math.random() * 1.5) / this.density;
      this.spawn();
    }

    // 移动障碍物 + 碰撞检测
    const scrollSpeed = gd.speed;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const obs = this.list[i];
      obs.x -= scrollSpeed * dt;

      // 碰撞检测
      if (!obs.hit && Math.abs(obs.x - Player.x) < 40 && obs.lane === gd.currentLane) {
        // 检查跳跃/滑铲闪避
        const dodged = (obs.type === 'deadline' && Player.isJumping) ||
                       (obs.type === 'toxic_boss' && Player.isSliding) ||
                       Player.isJumping;

        if (dodged) {
          obs.hit = true;
          gd.dodgedObstacles++;
          gd.totalObstacles++;
          // 完美闪避判定
          const distToPlayer = Math.abs(obs.x - Player.x);
          if (distToPlayer < 25) {
            gd.perfectDodges++;
            Combo.onPerfectDodge();
          } else {
            Combo.onNormalDodge();
          }
        } else {
          // 碰撞
          obs.hit = true;
          gd.totalObstacles++;
          this.applyDamage(obs);
          Combo.onHit();
        }
      }

      // 超出屏幕移除
      if (obs.x < -100) {
        if (!obs.hit) gd.totalObstacles++;
        this.list.splice(i, 1);
      }
    }
  },

  spawn() {
    const gd = GameState.gameData;
    const availableTypes = this.types.filter(t => {
      if (t.segment !== 'all' && t.segment !== gd.currentSegment) return false;
      if (t.needCar && !gd.assets.includes('car')) return false;
      return true;
    });
    if (availableTypes.length === 0) return;

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const lane = Math.floor(Math.random() * Math.min(gd.lanesOpen, 3));

    this.list.push({
      type: type.id,
      emoji: type.emoji,
      name: type.name,
      nameCN: type.nameCN,
      x: Player.x + 400 + Math.random() * 400,
      lane: lane,
      damage: type.damage,
      incomePenalty: type.incomePenalty,
      speedPenalty: type.speedPenalty,
      wealthLoss: type.wealthLoss || 0,
      forceSwitch: type.forceSwitch || false,
      hit: false,
      y: Lanes.laneY ? Lanes.laneY[lane] : 200
    });
  },

  applyDamage(obs) {
    const gd = GameState.gameData;
    gd.stamina = Math.max(0, gd.stamina - obs.damage);
    if (obs.incomePenalty > 0) {
      gd.incomePerSec *= (1 - obs.incomePenalty);
      setTimeout(() => {
        gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult;
      }, obs.incomePenalty > 0.05 ? 3000 : 2000);
    }
    if (obs.wealthLoss > 0) {
      gd.cash *= (1 - obs.wealthLoss);
      gd.netWorth = gd.cash + gd.loan;
    }
    if (obs.forceSwitch) {
      gd.currentLane = 0; // 强制切到Corporate
    }
  },

  render(ctx) {
    this.list.forEach(obs => {
      const y = Lanes.laneY ? Lanes.laneY[obs.lane] : 200 + obs.lane * 150;
      ctx.font = '32px sans-serif';
      ctx.fillText(obs.emoji, obs.x, y);
      if (obs.hit) {
        ctx.fillStyle = 'rgba(255,0,0,0.3)';
        ctx.fillRect(obs.x - 20, y - 30, 40, 40);
      }
    });
  }
};
