// ============================================================
// hud.js — HUD渲染（P4升级：角色信息 + 事件记录 + 跑道锁定提示）
// ============================================================

const HUD = {
  eventLog: [],

  init() {
    this.eventLog = [];
    const logEl = document.getElementById('event-log');
    if (logEl) logEl.style.display = 'block';
  },

  update() {
    const gd = GameState.gameData;
    if (!gd) return;

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
      if (gd.combo >= 3) {
        comboEl.style.display = 'block';
        comboEl.textContent = `⚡ ×${gd.comboMultiplier.toFixed(1)}`;
      } else {
        comboEl.style.display = 'none';
      }
    }

    // 角色信息
    const charInfo = document.getElementById('hud-char-info');
    if (charInfo && GameState.selectedCharacter) {
      const c = GameState.selectedCharacter;
      const seg = gd.currentSegment === 's1' ? '早期' : gd.currentSegment === 's2' ? '中期' : '后期';
      charInfo.innerHTML = `
        <span class="hud-char-name">${c.nameCN}</span>
        <span class="hud-char-seg">${seg}</span>
        <span class="hud-char-cash">💵 $${Math.floor(gd.cash).toLocaleString()}</span>
        <span class="hud-char-income">📈 $${Math.floor(gd.incomePerSec)}/s</span>
      `;
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

    // ===== 跑道按钮状态 =====
    for (let i = 0; i < 3; i++) {
      const ind = document.getElementById('lane-ind-' + i);
      if (ind) {
        ind.style.opacity = i === gd.currentLane ? '0.9' : '0.3';
        ind.style.display = i < gd.lanesOpen ? 'block' : 'none';
      }
      // 底部按钮锁定状态
      const btnIds = ['hud-btn-corp', 'hud-btn-startup', 'hud-btn-hustle'];
      const btn = document.getElementById(btnIds[i]);
      if (btn) {
        if (i >= gd.lanesOpen) {
          btn.classList.add('hud-btn-locked');
          btn.title = '未解锁 Unlocked later';
        } else if (gd.switchCooldown > 0) {
          btn.classList.add('hud-btn-locked');
          btn.title = `冷却中 Cooldown: ${Math.ceil(gd.switchCooldown / gd.speed)}s`;
        } else {
          btn.classList.remove('hud-btn-locked');
          btn.title = i === gd.currentLane ? '当前跑道 Current' : '点击切换 Switch';
        }
      }
    }

    // 跑道锁定提示
    const laneHint = document.getElementById('lane-lock-hint');
    if (laneHint) {
      if (gd.lanesOpen === 1) {
        laneHint.style.display = 'block';
        laneHint.textContent = '🔒 本关仅开放企业跑道 · Corp only this level';
      } else if (gd.switchCooldown > 0) {
        laneHint.style.display = 'block';
        laneHint.textContent = `⏳ 切换冷却 ${Math.ceil(gd.switchCooldown / gd.speed)}s`;
      } else {
        laneHint.style.display = 'none';
      }
    }
  },

  // 添加事件记录
  addEvent(event) {
    this.eventLog.unshift({
      time: new Date(),
      name: event.nameCN || event.name,
      category: event.category || 'neutral',
      desc: event.descCN || event.desc || ''
    });
    if (this.eventLog.length > 20) this.eventLog.length = 20;
    this.renderEventLog();
  },

  addCustomLog(text, category = 'neutral') {
    this.eventLog.unshift({ time: new Date(), name: text, category, desc: '' });
    if (this.eventLog.length > 20) this.eventLog.length = 20;
    this.renderEventLog();
  },

  renderEventLog() {
    const listEl = document.getElementById('event-log-list');
    if (!listEl) return;
    const colors = { positive: '#4CAF50', negative: '#F44336', neutral: '#FF9800' };
    listEl.innerHTML = this.eventLog.map(e => `
      <div class="event-log-entry" style="border-left:3px solid ${colors[e.category] || colors.neutral};">
        <span class="event-log-dot" style="background:${colors[e.category] || colors.neutral};"></span>
        <span class="event-log-name">${e.name}</span>
      </div>
    `).join('');
  }
};
