// ============================================================
// cutline.js — 斩杀线视觉系统
// ============================================================

const Cutline = {
  x: 0,
  totalDistance: 0,

  init(w, h, totalDist) {
    this.w = w;
    this.h = h;
    this.totalDistance = totalDist;
    this.x = w - 60;
  },

  update(dt) {},

  render(ctx) {
    const gd = GameState.gameData;
    const progress = gd.distance / this.totalDistance;

    let alpha, width, glowRadius;
    if (progress < 0.5) {
      alpha = 0.2 + progress * 0.3;
      width = 2;
      glowRadius = 20;
    } else if (progress < 0.75) {
      alpha = 0.4 + (progress - 0.5) * 1.2;
      width = 4;
      glowRadius = 40;
    } else if (progress < 0.92) {
      alpha = 0.7 + (progress - 0.75) * 1.5;
      width = 6;
      glowRadius = 60;
    } else {
      alpha = 0.9 + (progress - 0.92) * 1.0;
      width = 8 + (progress - 0.92) * 20;
      glowRadius = 100;
    }

    // 斩杀线主体
    ctx.strokeStyle = `rgba(255,23,68,${alpha})`;
    ctx.lineWidth = width;
    ctx.shadowColor = `rgba(255,23,68,${alpha * 0.8})`;
    ctx.shadowBlur = glowRadius;
    ctx.beginPath();
    ctx.moveTo(this.x, 0);
    ctx.lineTo(this.x, this.h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 脉冲波
    if (progress >= 0.92) {
      const pulsePhase = (Date.now() % 2000) / 2000;
      ctx.strokeStyle = `rgba(255,23,68,${0.3 * (1 - pulsePhase)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x - pulsePhase * 200, 0);
      ctx.lineTo(this.x - pulsePhase * 200, this.h);
      ctx.stroke();
    }

    // 斩杀时刻四线全触发效果
    const triggered = Object.values(gd.cutlineTriggered).filter(v => v).length;
    if (triggered >= 4) {
      ctx.fillStyle = `rgba(255,0,0,${0.1 + Math.sin(Date.now() / 200) * 0.05})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }
};
