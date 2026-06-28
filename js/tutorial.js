// ============================================================
// tutorial.js — 交互式教程引导系统 (P3)
// 新玩家首次游戏时自动触发，6 步引导
// ============================================================

const Tutorial = {
  active: false,
  step: 0,
  completed: false,
  skipped: false,

  steps: [
    {
      id: 'welcome',
      title: '欢迎来到斩杀线！', titleEN: 'Welcome to The Cut Line!',
      text: '你将从 22 岁开始奔跑，穿越人生的 13 年。做出选择、躲避障碍、收集机遇——跑赢你的斩杀线。',
      textEN: 'You start at age 22, running through 13 years of life. Make choices, dodge obstacles, collect opportunities — outrun your Cut Line.',
      target: null, // 全屏
      position: 'center',
    },
    {
      id: 'lanes',
      title: '三条跑道，三种人生', titleEN: 'Three Lanes, Three Lives',
      text: '按 1/2/3 或 A/S/D 键切换跑道。每条跑道代表不同的职业路径：企业、创业、副业。体力消耗和收入各不相同。',
      textEN: 'Press 1/2/3 or A/S/D to switch lanes. Each lane is a career path: Corporate, Startup, Hustle — different stamina drain and income.',
      target: '.hud-lane-buttons',
      position: 'top',
    },
    {
      id: 'obstacles',
      title: '躲避障碍物', titleEN: 'Dodge Obstacles',
      text: '前方会出现各种人生障碍——截止日期、交通堵塞、有毒老板。切换跑道或跳跃来躲避。完美闪避可获得 Combo 加成！',
      textEN: 'Life obstacles appear ahead — deadlines, traffic jams, toxic bosses. Switch lanes or jump to dodge. Perfect dodges build your Combo!',
      target: '#game-container',
      position: 'bottom',
    },
    {
      id: 'collectibles',
      title: '收集机遇', titleEN: 'Collect Opportunities',
      text: '现金、能量饮料、技能书、护盾令牌——这些都是你跑赢斩杀线的资源。靠近即可自动收集。',
      textEN: 'Cash, energy drinks, skill books, shield tokens — resources to outrun the Cut Line. Collect by running near them.',
      target: '#game-container',
      position: 'bottom',
    },
    {
      id: 'cutline',
      title: '警惕斩杀线', titleEN: 'Beware the Cut Line',
      text: '屏幕右侧的红色激光墙就是斩杀线。当经济崩溃、体力耗尽、社交崩塌或时间用尽时，它会逼近你。被追上则游戏结束。',
      textEN: 'The red laser wall on your right is the Cut Line. When economy, stamina, social, or time collapse, it closes in. Game over if caught.',
      target: '#game-container',
      position: 'right',
    },
    {
      id: 'start',
      title: '准备好了吗？', titleEN: 'Ready?',
      text: '每一局都是独一无二的人生。做出选择，承担后果。愿你能跑赢自己的斩杀线！',
      textEN: 'Every run is a unique life. Make choices, face consequences. May you outrun your own Cut Line!',
      target: null,
      position: 'center',
    },
  ],

  init() {
    // 检查是否首次游戏
    const seen = localStorage.getItem('tutorial_seen');
    if (seen === 'true') {
      this.completed = true;
      return;
    }
  },

  start() {
    if (this.completed || this.active) return;
    this.active = true;
    this.step = 0;
    this.skipped = false;
    this.showStep();
  },

  showStep() {
    if (this.step >= this.steps.length) {
      this.finish();
      return;
    }

    const step = this.steps[this.step];
    const overlay = document.getElementById('tutorial-overlay');
    const bubble = document.getElementById('tutorial-bubble');

    if (!overlay || !bubble) return;

    overlay.style.display = 'flex';

    // 构建内容
    const isLast = this.step === this.steps.length - 1;
    const skipBtn = `<button class="tutorial-skip" onclick="Tutorial.skip()">跳过 Skip ▶</button>`;
    const nextBtn = isLast
      ? `<button class="tutorial-next" onclick="Tutorial.finish()">开始游戏! Let's Go! 🏃</button>`
      : `<button class="tutorial-next" onclick="Tutorial.next()">下一步 Next →</button>`;

    bubble.innerHTML = `
      <div class="tutorial-step-indicator">${this.step + 1} / ${this.steps.length}</div>
      <h3 class="tutorial-title">${step.title}</h3>
      <div class="tutorial-title-en">${step.titleEN}</div>
      <p class="tutorial-text">${step.text}</p>
      <p class="tutorial-text-en">${step.textEN}</p>
      <div class="tutorial-actions">
        ${skipBtn}
        ${nextBtn}
      </div>
    `;

    // 高亮目标元素
    this.highlightTarget(step.target);
    this.positionBubble(step.position);

    AudioFX.uiClick();
  },

  highlightTarget(selector) {
    // 清除旧高亮
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));

    if (!selector) return;

    const target = document.querySelector(selector);
    if (target) {
      target.classList.add('tutorial-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  positionBubble(position) {
    const bubble = document.getElementById('tutorial-bubble');
    if (!bubble) return;

    // 重置
    bubble.style.top = '';
    bubble.style.bottom = '';
    bubble.style.left = '';
    bubble.style.right = '';
    bubble.style.transform = '';

    switch (position) {
      case 'top':
        bubble.style.bottom = '100px';
        bubble.style.left = '50%';
        bubble.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        bubble.style.top = '120px';
        bubble.style.left = '50%';
        bubble.style.transform = 'translateX(-50%)';
        break;
      case 'right':
        bubble.style.top = '50%';
        bubble.style.right = '20px';
        bubble.style.transform = 'translateY(-50%)';
        break;
      case 'left':
        bubble.style.top = '50%';
        bubble.style.left = '20px';
        bubble.style.transform = 'translateY(-50%)';
        break;
      default: // center
        bubble.style.top = '50%';
        bubble.style.left = '50%';
        bubble.style.transform = 'translate(-50%, -50%)';
    }
  },

  next() {
    this.step++;
    this.showStep();
    AudioFX.uiClick();
  },

  skip() {
    this.skipped = true;
    this.finish();
  },

  finish() {
    this.active = false;
    this.completed = true;
    localStorage.setItem('tutorial_seen', 'true');

    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';

    // 清除高亮
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));

    // 恢复游戏
    if (GameState.isPaused && !GameState.isGameOver) {
      GameState.isPaused = false;
    }
  },

  // 外部调用：重新观看教程
  replay() {
    this.completed = false;
    this.active = false;
    this.step = 0;
    localStorage.removeItem('tutorial_seen');
    this.start();
  }
};
