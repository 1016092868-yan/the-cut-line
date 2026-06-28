// ============================================================
// input.js — 键盘+触摸输入管理 (P3 升级：增强触摸手势)
// 独立跑道按键: 1/2/3 或 A/S/D 直接切到对应跑道
// ============================================================

const Input = {
  keys: {},
  justPressed: {},
  justReleased: {},
  touchStart: null,
  touchMoved: false,
  touchStartTime: 0,
  _lastTap: 0,
  isMobile: false,

  init() {
    // 检测移动端
    this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (this.isMobile) document.body.classList.add('mobile-device');

    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;

      const preventKeys = [
        'Digit1','Digit2','Digit3',
        'KeyA','KeyS','KeyD',
        'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
        'Space','KeyW','KeyQ','KeyE',
        'KeyB','KeyL','KeyM','KeyC','KeyP',
        'Escape','Tab'
      ];
      if (preventKeys.includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.justReleased[e.code] = true;
    });

    // 触摸支持
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('touchstart', (e) => {
        this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.touchMoved = false;
        this.touchStartTime = Date.now();
      }, { passive: true });

      gameContainer.addEventListener('touchmove', (e) => {
        if (!this.touchStart) return;
        this.touchMoved = true;
        // 阻止页面滚动
        if (GameState.isRunning) e.preventDefault();
      }, { passive: false });

      gameContainer.addEventListener('touchend', (e) => {
        if (!this.touchStart) return;

        const dt = Date.now() - this.touchStartTime;
        const dx = e.changedTouches[0].clientX - this.touchStart.x;
        const dy = e.changedTouches[0].clientY - this.touchStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 快速点击 → 视为按钮（不触发滑动手势）
        if (dt < 300 && dist < 20) {
          // 双击暂停
          if (dt < 300 && Date.now() - this._lastTap < 350) {
            this.justPressed['KeyP'] = true;
          }
          this._lastTap = Date.now();
          this.touchStart = null;
          this.touchMoved = false;
          return;
        }

        if (!this.touchMoved) return;

        // 水平滑动 → 换道
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
          if (dx > 0) this.justPressed['ArrowRight'] = true;
          else this.justPressed['ArrowLeft'] = true;
        }
        // 上滑 → 跳跃
        if (dy < -40 && Math.abs(dy) > Math.abs(dx)) {
          this.justPressed['Space'] = true;
        }
        // 下滑 → 滑铲
        if (dy > 40 && Math.abs(dy) > Math.abs(dx)) {
          this.justPressed['ArrowDown'] = true;
        }

        this.touchStart = null;
        this.touchMoved = false;
      });
    }
  },

  update() {
    this.justPressed = {};
    this.justReleased = {};
  },

  isDown(code) { return !!this.keys[code]; },
  wasPressed(code) { return !!this.justPressed[code]; },
  wasReleased(code) { return !!this.justReleased[code]; },

  // ===== 独立跑道按键 =====
  get lane1() { return this.wasPressed('Digit1') || this.wasPressed('KeyA'); },
  get lane2() { return this.wasPressed('Digit2') || this.wasPressed('KeyS'); },
  get lane3() { return this.wasPressed('Digit3') || this.wasPressed('KeyD'); },

  // ===== 相对切换（保留兼容） =====
  get laneLeft()  { return this.wasPressed('ArrowLeft') || this.wasPressed('KeyQ'); },
  get laneRight() { return this.wasPressed('ArrowRight') || this.wasPressed('KeyE'); },

  // ===== 动作按键 =====
  get jump()  { return this.wasPressed('Space') || this.wasPressed('ArrowUp') || this.wasPressed('KeyW'); },
  get slide() { return this.wasPressed('ArrowDown'); },

  // ===== 面板按键 =====
  get shop()  { return this.wasPressed('KeyB'); },
  get loan()  { return this.wasPressed('KeyL'); },
  get marry() { return this.wasPressed('KeyM'); },
  get child() { return this.wasPressed('KeyC'); },
  get pause() { return this.wasPressed('KeyP') || this.wasPressed('Escape'); },
  get stats() { return this.wasPressed('Tab'); },

  // ===== 获取目标跑道（独立按键优先） =====
  getTargetLane() {
    if (this.lane1) return 0;
    if (this.lane2) return 1;
    if (this.lane3) return 2;
    if (this.laneLeft) return 'left';
    if (this.laneRight) return 'right';
    return null;
  }
};
