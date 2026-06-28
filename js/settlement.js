// ============================================================
// settlement.js — 结算浮层 + 深度面板
// ============================================================

const Settlement = {
  cycleCount: 0,

  init() {},

  triggerCycle() {
    const gd = GameState.gameData;
    const settleData = Economy.settle();
    gd.cycleIncome = 0;

    // Combo评分
    const score = Combo.calculateScore();
    gd.scoreRating = score.rating;

    // 应用评分乘数
    const bonus = settleData.net * (score.multiplier - 1.0);
    gd.cash += bonus;
    gd.netWorth = gd.cash + gd.loan;

    this.cycleCount++;

    // 记录到深度结算面板
    SettlementPanel.recordCycle(settleData, score, []);
    AudioFX.settlementPopup();

    // 显示浮层
    this.showFloat(settleData, score);

    // 触发随机事件 — 从 LEVELS 获取当前世界参数
    const world = getWorld(GameState.currentWorld);
    const level = world ? world.levels[GameState.currentLevelIndex] : null;
    const worldParams = world ? world.params : {};
    const segmentProb = gd.currentSegment === 's1' ? 0.6 : gd.currentSegment === 's2' ? 0.8 : 1.0;
    if (Math.random() < segmentProb) {
      const event = Events.trigger(worldParams, GameState.currentWorld, gd.currentSegment);
      if (event) {
        setTimeout(() => Events.showPopup(event), 200);
        AudioFX.eventTrigger(event.category === 'positive');
        SettlementPanel.recordEvent(event);
      }
    }

    // 重置评分数据
    gd.perfectDodges = 0;
    gd.totalObstacles = 0;
    gd.dodgedObstacles = 0;
    gd.collectiblesPicked = 0;
    gd.totalCollectibles = 0;
    gd.maxCombo = 0;
  },

  showFloat(data, score) {
    const floatEl = document.getElementById('settlement-float');
    const contentEl = document.getElementById('settlement-content');
    if (!floatEl || !contentEl) return;

    contentEl.innerHTML = `
      <div class="settlement-row"><span>💵 收入 Income</span><span style="color:var(--positive)">+$${Math.floor(data.income).toLocaleString()}</span></div>
      <div class="settlement-row"><span>📉 支出 Expense</span><span style="color:var(--negative)">-$${Math.floor(data.expense).toLocaleString()}</span></div>
      <div class="settlement-divider"></div>
      <div class="settlement-row"><span>📊 净现金流 Net</span><span style="color:${data.net >= 0 ? 'var(--positive)' : 'var(--negative)'}">${data.net >= 0 ? '+' : ''}$${Math.floor(data.net).toLocaleString()}</span></div>
      <div class="settlement-row"><span>💰 净资产 NW</span><span>$${Math.floor(data.netWorth).toLocaleString()}</span></div>
      <div class="settlement-rating">⚡ ${score.rating} (${score.score})</div>
    `;

    floatEl.style.display = 'block';
    setTimeout(() => { floatEl.style.display = 'none'; }, 3000);
  },

  showWarning(msgCN, msgEN) {
    const popup = document.getElementById('event-popup');
    if (!popup) return;
    popup.innerHTML = `<h3 style="color:var(--cutline-red)">⚠ ${msgCN}</h3><p>${msgEN}</p>`;
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 3000);
  }
};
