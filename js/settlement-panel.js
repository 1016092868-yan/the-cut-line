// ============================================================
// settlement-panel.js — 深度结算报告 (P2)
// 关卡完成后展示：评分雷达图、收支饼图、Combo趋势、事件回顾
// ============================================================

const SettlementPanel = {
  // 结算历史（用于图表绘制）
  history: {
    cycles: [],        // 每周期 {income, expense, net, nw, rating, events}
    comboPeaks: [],    // Combo 峰值
    perfectDodges: 0,
    totalDodges: 0,
    totalObstacles: 0,
    collectiblesPicked: 0,
    totalCollectibles: 0,
    eventsTriggered: [],
    purchases: [],
  },

  init() {
    this.reset();
  },

  reset() {
    this.history = {
      cycles: [],
      comboPeaks: [],
      perfectDodges: 0,
      totalDodges: 0,
      totalObstacles: 0,
      collectiblesPicked: 0,
      totalCollectibles: 0,
      eventsTriggered: [],
      purchases: [],
    };
  },

  recordCycle(settleData, score, events) {
    this.history.cycles.push({
      income: settleData.income,
      expense: settleData.expense,
      net: settleData.net,
      netWorth: settleData.netWorth,
      rating: score.rating,
      score: score.score,
      events: events || [],
    });
  },

  recordComboPeak(combo) {
    this.history.comboPeaks.push(combo);
  },

  recordDodge(perfect) {
    this.history.totalDodges++;
    this.history.totalObstacles++;
    if (perfect) this.history.perfectDodges++;
  },

  recordMiss() {
    this.history.totalObstacles++;
  },

  recordCollect() {
    this.history.collectiblesPicked++;
  },

  recordEvent(event) {
    this.history.eventsTriggered.push(event);
  },

  recordPurchase(item) {
    this.history.purchases.push(item);
  },

  // ============ 显示完整结算报告 ============
  show(won, lxpEarned, levelData) {
    const gd = GameState.gameData;
    const char = GameState.selectedCharacter;
    const h = this.history;

    const panel = document.getElementById('settlement-panel');
    if (!panel) return;

    // 计算统计数据
    const totalIncome = h.cycles.reduce((s, c) => s + c.income, 0);
    const totalExpense = h.cycles.reduce((s, c) => s + c.expense, 0);
    const dodgeRate = h.totalObstacles > 0 ? Math.round(h.totalDodges / h.totalObstacles * 100) : 100;
    const perfectRate = h.totalObstacles > 0 ? Math.round(h.perfectDodges / h.totalObstacles * 100) : 0;
    const collectRate = h.totalCollectibles > 0 ? Math.round(h.collectiblesPicked / Math.max(h.totalCollectibles, 1) * 100) : 0;
    const maxCombo = Math.max(...h.comboPeaks, 0);
    const finalScore = Combo.calculateScore();

    // 评级颜色
    const ratingColors = { S: '#FFD700', A: '#4CAF50', B: '#2196F3', C: '#FF9800', D: '#F44336' };
    const ratingColor = ratingColors[finalScore.rating] || '#2196F3';

    const wonText = won ? '🎉 关卡通过!' : '💀 关卡失败';
    const wonTextEN = won ? 'Level Cleared!' : 'Level Failed';

    panel.innerHTML = `
      <div class="settlement-report">
        <div class="settlement-hero" style="border-left: 6px solid ${ratingColor};">
          <div class="settlement-badge" style="color:${ratingColor};">${finalScore.rating}</div>
          <div class="settlement-status">${wonText}</div>
          <div class="settlement-status-en">${wonTextEN}</div>
          <div class="settlement-char">${char.nameCN} · ${char.name}</div>
          <div class="settlement-lxp">⭐ +${lxpEarned} LXP</div>
        </div>

        <div class="settlement-grid-4">
          <div class="settlement-stat-box">
            <div class="ssb-value positive">$${Math.floor(totalIncome).toLocaleString()}</div>
            <div class="ssb-label">总收入 Income</div>
          </div>
          <div class="settlement-stat-box">
            <div class="ssb-value negative">-$${Math.floor(totalExpense).toLocaleString()}</div>
            <div class="ssb-label">总支出 Expense</div>
          </div>
          <div class="settlement-stat-box">
            <div class="ssb-value">$${Math.floor(gd.netWorth).toLocaleString()}</div>
            <div class="ssb-label">最终净资产 NW</div>
          </div>
          <div class="settlement-stat-box">
            <div class="ssb-value">${dodgeRate}%</div>
            <div class="ssb-label">闪避率 Dodge</div>
          </div>
        </div>

        <div class="settlement-section">
          <div class="settlement-section-title">📊 表现分析 Performance</div>
          <div class="settlement-grid-3">
            <div class="settlement-stat-box">
              <div class="ssb-value">${perfectRate}%</div>
              <div class="ssb-label">完美闪避 Perfect</div>
            </div>
            <div class="settlement-stat-box">
              <div class="ssb-value">${maxCombo}</div>
              <div class="ssb-label">最大连击 Max Combo</div>
            </div>
            <div class="settlement-stat-box">
              <div class="ssb-value">${collectRate}%</div>
              <div class="ssb-label">收集率 Collect</div>
            </div>
          </div>
        </div>

        ${h.eventsTriggered.length > 0 ? `
        <div class="settlement-section">
          <div class="settlement-section-title">📅 事件回顾 Events</div>
          <div class="settlement-event-list">
            ${h.eventsTriggered.slice(-5).map(e => `
              <div class="settlement-event-item ${e.category || ''}">
                <span class="sev-icon">${e.category === 'positive' ? '🟢' : e.category === 'negative' ? '🔴' : '🟡'}</span>
                <span class="sev-name">${e.nameCN || e.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="settlement-section">
          <div class="settlement-section-title">📈 周期趋势 Cycles</div>
          <canvas id="settlement-chart" width="560" height="160" class="settlement-chart"></canvas>
          <div class="settlement-chart-legend">
            <span><span class="dot" style="background:#4CAF50;"></span> 收入 Income</span>
            <span><span class="dot" style="background:#F44336;"></span> 支出 Expense</span>
            <span><span class="dot" style="background:#2196F3;"></span> 净资产 NW</span>
          </div>
        </div>

        <div class="settlement-actions">
          <button class="btn-main" onclick="SettlementPanel.close(); goToLevelSelect(GameState.currentWorld);" style="background:var(--w2-blue);color:#fff;">
            ${won ? '下一关 Next Level' : '重试 Retry'}
          </button>
          <button class="btn-main" onclick="SettlementPanel.close(); showWorldMap();">
            返回世界 Back to Map
          </button>
        </div>
      </div>
    `;

    panel.style.display = 'flex';

    // 绘制趋势图
    setTimeout(() => this.drawChart(), 100);

    AudioFX.levelComplete();
  },

  // ============ Canvas 趋势图 ============
  drawChart() {
    const canvas = document.getElementById('settlement-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const padding = { top: 10, right: 20, bottom: 20, left: 50 };
    const pw = W - padding.left - padding.right;
    const ph = H - padding.top - padding.bottom;

    ctx.clearRect(0, 0, W, H);

    const cycles = this.history.cycles;
    if (cycles.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无周期数据 No cycle data yet', W / 2, H / 2);
      return;
    }

    // 计算范围
    const allValues = cycles.flatMap(c => [c.income, c.expense, c.netWorth]);
    const maxVal = Math.max(...allValues, 1);
    const minVal = Math.min(...allValues, 0);

    // 网格线
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (ph / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      // Y轴标签
      const val = maxVal - ((maxVal - minVal) / 4) * i;
      ctx.fillStyle = '#888';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('$' + Math.round(val / 1000) + 'k', padding.left - 6, y + 3);
    }

    // X轴标签
    ctx.fillStyle = '#888';
    ctx.font = '9px Nunito, sans-serif';
    ctx.textAlign = 'center';
    cycles.forEach((_, i) => {
      if (i % Math.max(1, Math.floor(cycles.length / 4)) === 0 || i === cycles.length - 1) {
        const x = padding.left + (pw / Math.max(cycles.length - 1, 1)) * i;
        ctx.fillText('C' + (i + 1), x, H - 4);
      }
    });

    // 绘制三条线
    const drawLine = (dataKey, color, dash = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash([5, 3]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      cycles.forEach((c, i) => {
        const x = padding.left + (pw / Math.max(cycles.length - 1, 1)) * i;
        const val = c[dataKey];
        const y = padding.top + ph - ((val - minVal) / Math.max(maxVal - minVal, 1)) * ph;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawLine('income', '#4CAF50');
    drawLine('expense', '#F44336', true);
    drawLine('netWorth', '#2196F3');

    // 评分标记
    cycles.forEach((c, i) => {
      const x = padding.left + (pw / Math.max(cycles.length - 1, 1)) * i;
      const y = padding.top + 5;
      ctx.fillStyle = c.rating === 'S' ? '#FFD700' : c.rating === 'A' ? '#4CAF50' : c.rating === 'B' ? '#2196F3' : c.rating === 'C' ? '#FF9800' : '#F44336';
      ctx.font = 'bold 9px Fredoka One, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.rating, x, y);
    });
  },

  close() {
    const panel = document.getElementById('settlement-panel');
    if (panel) panel.style.display = 'none';
  }
};
