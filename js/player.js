// ============================================================
// player.js — 玩家状态和渲染
// ============================================================

const Player = {
  x: 0, y: 0,
  laneY: [0, 0, 0],
  isJumping: false,
  isSliding: false,
  jumpTimer: 0,
  slideTimer: 0,
  bounceOffset: 0,
  runFrame: 0,
  runTimer: 0,

  init(w, h) {
    this.w = w;
    this.h = h;
    const laneHeight = (h - 160) / 3; // 扣除HUD区域
    this.laneY = [
      120 + laneHeight * 0.5,
      120 + laneHeight * 1.5,
      120 + laneHeight * 2.5
    ];
    this.x = w * 0.25;
    this.y = this.laneY[1];
  },

  update(dt) {
    const gd = GameState.gameData;
    this.y = this.laneY[gd.currentLane];

    // 跳跃
    if (Input.wasPressed('Space') && !this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpTimer = 0.35;
    }
    if (this.isJumping) {
      this.jumpTimer -= dt;
      this.bounceOffset = Math.sin((0.35 - this.jumpTimer) / 0.35 * Math.PI) * 60;
      if (this.jumpTimer <= 0) {
        this.isJumping = false;
        this.bounceOffset = 0;
      }
    }

    // 滑铲
    if (Input.wasPressed('ArrowDown') && Input.isDown('ArrowDown') && !this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = 0.4;
    }
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.isSliding = false;
    }

    // 跑步动画
    this.runTimer += dt;
    if (this.runTimer > 0.15) { this.runTimer = 0; this.runFrame = (this.runFrame + 1) % 4; }

    // 换道
    if (Input.up && !Input.isDown('ArrowDown')) Engine.switchLane(-1);
    if (Input.down && !Input.isDown('ArrowUp')) Engine.switchLane(1);
  },

  render(ctx) {
    const gd = GameState.gameData;
    const y = this.y - this.bounceOffset;
    const scale = this.isSliding ? 0.6 : 1.0;

    ctx.save();
    ctx.translate(this.x, y);
    ctx.scale(1, scale);

    // 体力状态颜色
    let bodyColor = '#FFD54F';
    if (gd.stamina / gd.staminaMax < 0.1) bodyColor = '#EF5350';
    else if (gd.stamina / gd.staminaMax < 0.3) bodyColor = '#FF9800';
    else if (gd.stamina / gd.staminaMax < 0.7) bodyColor = '#FFCA28';

    // 简单像素风小人
    const legOffset = this.isSliding ? 0 : Math.sin(this.runFrame * Math.PI / 2) * 8;

    // 身体
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-12, -30 + (this.isSliding ? 10 : 0), 24, 30);
    ctx.strokeStyle = '#1A1A2E';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -30 + (this.isSliding ? 10 : 0), 24, 30);

    // 头
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(0, -40 + (this.isSliding ? 10 : 0), 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 眼睛
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(4, -44 + (this.isSliding ? 10 : 0), 4, 4);

    // 腿
    ctx.fillStyle = '#37474F';
    if (!this.isSliding) {
      ctx.fillRect(-8, 0, 8, 12 + legOffset);
      ctx.fillRect(0, 0, 8, 12 - legOffset);
    }

    // 如果有Combo特效
    if (gd.combo >= 20) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -20, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};
