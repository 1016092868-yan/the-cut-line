// ============================================================
// combo.js — Combo连击系统
// ============================================================

const Combo = {

  update(dt) {
    // Combo 衰减：每5秒无完美闪避则Combo-1
    const gd = GameState.gameData;
    if (!this._decayTimer) this._decayTimer = 0;
    this._decayTimer += dt;
    if (this._decayTimer >= 5 && gd.combo > 0) {
      gd.combo = Math.max(0, gd.combo - 1);
      this._decayTimer = 0;
      this.updateMultiplier();
    }
  },

  onPerfectDodge() {
    const gd = GameState.gameData;
    gd.combo++;
    gd.maxCombo = Math.max(gd.maxCombo, gd.combo);
    this._decayTimer = 0;
    this.updateMultiplier();
    AudioFX.comboUp(gd.combo);
    SettlementPanel.recordComboPeak(gd.combo);
  },

  onNormalDodge() {
    this._decayTimer = 0;
  },

  onHit() {
    const gd = GameState.gameData;
    gd.combo = 0;
    this.updateMultiplier();
  },

  updateMultiplier() {
    const gd = GameState.gameData;
    const c = gd.combo;
    if (c >= 20) gd.comboMultiplier = 2.0;
    else if (c >= 15) gd.comboMultiplier = 1.8;
    else if (c >= 10) gd.comboMultiplier = 1.5;
    else if (c >= 5) gd.comboMultiplier = 1.2;
    else gd.comboMultiplier = 1.0;
  },

  // 赛段操作评分
  calculateScore() {
    const gd = GameState.gameData;
    if (gd.totalObstacles === 0) return { rating: 'B', score: 50, multiplier: 1.0 };

    const dodgeRate = gd.dodgedObstacles / Math.max(gd.totalObstacles, 1);
    const perfectRate = gd.perfectDodges / Math.max(gd.totalObstacles, 1);
    const collectRate = gd.collectiblesPicked / Math.max(gd.totalCollectibles, 1);
    const comboAvg = gd.maxCombo / 20; // normalized to 0-1

    const score = dodgeRate * 40 + comboAvg * 30 + collectRate * 20 + perfectRate * 10;
    let rating, mult;
    if (score >= 90) { rating = 'S'; mult = 1.30; }
    else if (score >= 75) { rating = 'A'; mult = 1.15; }
    else if (score >= 50) { rating = 'B'; mult = 1.00; }
    else if (score >= 25) { rating = 'C'; mult = 0.85; }
    else { rating = 'D'; mult = 0.70; }

    return { rating, score: Math.round(score), multiplier: mult };
  }
};
