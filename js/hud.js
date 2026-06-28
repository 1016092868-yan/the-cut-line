// ============================================================
// hud.js — HUD渲染（DOM更新）
// ============================================================

const HUD = {

  init() {},

  update() {
    const gd = GameState.gameData;

    // 净资产
    const nwEl = document.getElementById('hud-net-worth');
    if (nwEl) {
      const sign = gd.netWorth >= 0 ? '+' : '';
      nwEl.textContent = `💰 ${sign}$${Math.floor(gd.netWorth).toLocaleString()}`;
      nwEl.style.color = gd.netWorth >= 0 ? 'var(--positive)' : 'var(--negative)';
    }

    // 体力条
    const staminaPct = gd.stamina / gd.staminaMax * 100;
    const sf = document.getElementById('hud-stamina-fill');
    if (sf) sf.style.width = staminaPct + '%';
    const sl = document.getElementById('hud-stamina-label');
    if (sl) sl.textContent = `${Math.floor(gd.stamina)}/${gd.staminaMax}`;

    // Combo
    const comboEl = document.getElementById('hud-combo');
    if (comboEl) {
      if (gd.combo >= 5) {
        comboEl.style.display = 'block';
        comboEl.textContent = `⚡ ×${gd.comboMultiplier.toFixed(1)}`;
      } else {
        comboEl.style.display = 'none';
      }
    }

    // 状态图标
    const statusEl = document.getElementById('hud-status-icons');
    if (statusEl) {
      let icons = '';
      if (gd.married) icons += '💍';
      if (gd.children >= 1) icons += '👶';
      if (gd.children >= 2) icons += '👶';
      if (gd.assets.includes('house_suburban') || gd.assets.includes('house_villa')) icons += '🏠';
      if (gd.assets.includes('car_used') || gd.assets.includes('car_new')) icons += '🚗';
      if (gd.fitnessLevel >= 2) icons += '🏋';
      statusEl.textContent = icons;
    }

    // 结婚按钮
    const marryReady = document.getElementById('hud-marry-ready');
    const btnMarry = document.getElementById('btn-marry');
    if (marryReady && btnMarry) {
      const canMarry = !gd.married && gd.netWorth >= 50000 && gd.distance / gd.totalDistance >= 0.3;
      marryReady.style.display = canMarry ? 'flex' : 'none';
      btnMarry.style.display = canMarry ? 'flex' : 'none';
    }

    // ===== 跑道指示器高亮 =====
    for (let i = 0; i < 3; i++) {
      const ind = document.getElementById('lane-ind-' + i);
      if (ind) {
        if (i === gd.currentLane) {
          ind.classList.add('active');
        } else {
          ind.classList.remove('active');
        }
        // 未开放的跑道隐藏
        ind.style.display = i < gd.lanesOpen ? 'block' : 'none';
      }
    }
  }
};
