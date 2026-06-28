// ============================================================
// lanes.js — 三跑道背景渲染
// ============================================================

const Lanes = {
  w: 0, h: 0,
  laneColors: ['rgba(76,175,80,0.06)', 'rgba(33,150,243,0.06)', 'rgba(156,39,176,0.06)'],
  laneLabels: ['🏢 企业 Corporate', '🚀 创业 Startup', '💼 副业 Side Hustle'],
  buildings: [],
  scrollOffset: 0,

  init(w, h) {
    this.w = w;
    this.h = h;
    this.buildings = [];
    // 生成建筑
    for (let i = 0; i < 30; i++) {
      this.buildings.push({
        x: i * 200 + Math.random() * 150,
        width: 30 + Math.random() * 60,
        height: 60 + Math.random() * 150,
        color: `hsl(${200 + Math.random() * 40}, 20%, ${20 + Math.random() * 20}%)`
      });
    }
  },

  update(dt) {},

  render(ctx) {
    const gd = GameState.gameData;
    const progress = gd.distance / gd.totalDistance;

    // 天空渐变
    let skyTop, skyBot;
    if (gd.currentSegment === 's1') {
      skyTop = '#87CEEB'; skyBot = '#B0BEC5';
    } else if (gd.currentSegment === 's2') {
      skyTop = '#FFCC80'; skyBot = '#8D6E63';
    } else {
      skyTop = '#EF5350'; skyBot = '#37474F';
    }
    const grad = ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.w, this.h);

    // 建筑滚动
    this.scrollOffset = (gd.distance * 0.3) % 200;
    ctx.fillStyle = 'rgba(55,71,79,0.4)';
    this.buildings.forEach(b => {
      const bx = b.x - this.scrollOffset;
      if (bx > -100 && bx < this.w + 100) {
        ctx.fillRect(bx, this.h - 100 - b.height, b.width, b.height);
        ctx.strokeStyle = 'rgba(38,50,56,0.3)';
        ctx.strokeRect(bx, this.h - 100 - b.height, b.width, b.height);
      }
    });

    // 地面
    ctx.fillStyle = '#37474F';
    ctx.fillRect(0, this.h - 100, this.w, 100);
    ctx.fillStyle = '#455A64';
    ctx.fillRect(0, this.h - 100, this.w, 4);

    // 三跑道
    const laneHeight = (this.h - 260) / 3;
    for (let i = 0; i < 3; i++) {
      const y = 120 + i * laneHeight;
      ctx.fillStyle = this.laneColors[i];
      ctx.fillRect(0, y, this.w, laneHeight);

      // 跑道分隔线
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([10, 20]);
      ctx.beginPath();
      ctx.moveTo(0, y + laneHeight);
      ctx.lineTo(this.w, y + laneHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // 跑道标签
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px "Noto Sans SC", "Nunito", sans-serif';
      ctx.fillText(this.laneLabels[i], 20, y + 24);

      // 当前跑道高亮
      if (i === gd.currentLane) {
        ctx.strokeStyle = 'rgba(255,215,0,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, y, this.w, laneHeight);
      }
    }

    // 进度条
    const progY = this.h - 85;
    const progW = this.w - 40;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(20, progY, progW, 8);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(20, progY, progW * Math.min(progress, 1), 8);
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Fredoka One", "Noto Sans SC", sans-serif';
    ctx.fillText(`← ${Math.floor(gd.distance)}m / ${gd.totalDistance}m  Age:${22 + Math.floor(progress * 13)} →`, 20, progY - 4);
  }
};
