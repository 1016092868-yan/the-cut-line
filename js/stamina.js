// ============================================================
// stamina.js — 体力系统
// ============================================================

const Stamina = {

  update(dt) {
    const gd = GameState.gameData;

    // 跑道消耗
    const laneDrain = [0.3, 0.6, 1.0]; // Corporate, Startup, Side Hustle
    let drain = laneDrain[gd.currentLane] || 0.6;

    // 年龄衰减
    const progress = gd.distance / gd.totalDistance;
    if (progress >= 0.66) drain += 0.2;
    else if (progress >= 0.33) drain += 0.1;

    // 自然恢复
    let recovery = 0.6;

    // 资产加成
    if (gd.assets.includes('house_suburban')) recovery += 0.2;
    if (gd.assets.includes('house_villa')) recovery += 0.3;
    if (gd.assets.includes('car_used')) recovery += 0.1;
    if (gd.assets.includes('car_new')) recovery += 0.15;

    // 健身加成
    const fitnessRecovery = [0, 0.1, 0.2, 0.3, 0.5];
    recovery += fitnessRecovery[gd.fitnessLevel] || 0;

    // 角色恢复加成
    recovery += (gd.staminaRecovery - 0.6);

    // 净变化
    const net = recovery - drain;
    gd.stamina = Math.min(gd.staminaMax, Math.max(0, gd.stamina + net * dt));

    // 体力斩杀线
    if (gd.stamina / gd.staminaMax < 0.1 && !gd.cutlineTriggered.stamina) {
      gd.cutlineTriggered.stamina = true;
      gd.currentLane = 0; // 强制Corporate
      gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult * 0.5;
      Settlement.showWarning('体力斩杀线触发！过劳预警', 'Stamina Cut Line! Overwork Alert');
    }
    if (gd.stamina / gd.staminaMax > 0.25 && gd.cutlineTriggered.stamina) {
      gd.cutlineTriggered.stamina = false;
      gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; // 恢复
    }
  }
};
