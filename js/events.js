// ============================================================
// events.js — 随机事件引擎（40+ 事件，5 世界差异化）
// P0/P1 升级：修复触发链路 + 扩充事件库
// ============================================================

const Events = {

  // ============ 事件池：按类别 + 世界索引 ============
  pool: {
    // ---------- 负面事件 ----------
    negative: [
      // 通用
      { id: 'sick', world: [0,1,2,3,4,5], name: '生病 Sick', nameCN: '生病',
        desc: '医药费 $12,000，体力 -30', descCN: '医药费 $12,000，体力 -30',
        effect: (gd) => { gd.cash -= 12000; gd.stamina = Math.max(0, gd.stamina - 30); gd.netWorth = gd.cash + gd.loan; } },
      { id: 'layoff', world: [0,2,3,4], name: '裁员 Laid Off', nameCN: '被裁员',
        desc: '收入归零 6 秒', descCN: '收入归零 6 秒',
        effect: (gd) => { gd.incomePerSec = 0; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 6000); } },
      { id: 'market_crash', world: [0,2,3,4,5], name: '股市崩盘 Market Crash', nameCN: '股市崩盘',
        desc: '现金 -20%', descCN: '现金损失 20%',
        effect: (gd) => { gd.cash *= 0.8; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'industry_winter', world: [0,2,4], name: '行业寒冬 Industry Winter', nameCN: '行业寒冬',
        desc: '收入 -35% 持续 10 秒', descCN: '收入 -35%，持续 10 秒',
        effect: (gd) => { gd.incomePerSec *= 0.65; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 10000); } },
      { id: 'car_breakdown', world: [0,1,2,3], name: '汽车抛锚 Car Breakdown', nameCN: '汽车抛锚',
        desc: '维修费 $5,000', descCN: '维修费 $5,000',
        effect: (gd) => { gd.cash -= 5000; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'tax_audit', world: [0,3,4,5], name: '税务审计 Tax Audit', nameCN: '税务审计',
        desc: '补缴税款 $15,000', descCN: '补缴 $15,000',
        effect: (gd) => { gd.cash -= 15000; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'divorce', world: [0,3,4,5], name: '离婚 Divorce', nameCN: '离婚',
        desc: '净资产 -30%，体力 -40', descCN: '净资产 -30%，体力 -40',
        effect: (gd) => { if (gd.married) { gd.cash *= 0.7; gd.married = false; gd.stamina = Math.max(0, gd.stamina - 40); gd.netWorth = gd.cash + gd.loan; } } },
      { id: 'identity_theft', world: [0,2,3,4], name: '身份盗窃 Identity Theft', nameCN: '身份盗窃',
        desc: '现金 -$8,000，信用降级', descCN: '损失 $8,000',
        effect: (gd) => { gd.cash -= 8000; gd.loanRateMod = (gd.loanRateMod || 0) + 0.01; gd.netWorth = gd.cash + gd.loan; } },
      // W1 专属
      { id: 'failed_exam', world: [1], name: '挂科 Failed Exam', nameCN: '挂科',
        desc: '补考费 $3,000，体力 -15', descCN: '补考费 $3,000',
        effect: (gd) => { gd.cash -= 3000; gd.stamina = Math.max(0, gd.stamina - 15); gd.netWorth = gd.cash + gd.loan; } },
      // W2 专属
      { id: 'toxic_colleague', world: [2], name: '职场霸凌 Toxic Colleague', nameCN: '职场霸凌',
        desc: '体力 -25，收入 -10% 5 秒', descCN: '体力 -25',
        effect: (gd) => { gd.stamina = Math.max(0, gd.stamina - 25); gd.incomePerSec *= 0.9; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 5000); } },
      // W3 专属
      { id: 'child_emergency', world: [3], name: '孩子急诊 Child Emergency', nameCN: '孩子急诊',
        desc: '医药费 $20,000', descCN: '医药费 $20,000',
        effect: (gd) => { if (gd.children > 0) { gd.cash -= 20000; gd.netWorth = gd.cash + gd.loan; } } },
      // W4 专属
      { id: 'fraud_investment', world: [4], name: '投资欺诈 Fraud Investment', nameCN: '投资欺诈',
        desc: '损失 $50,000', descCN: '损失 $50,000',
        effect: (gd) => { gd.cash -= 50000; gd.netWorth = gd.cash + gd.loan; } },
      // W5 专属
      { id: 'total_collapse', world: [5], name: '全面崩盘 Total Collapse', nameCN: '全面崩盘',
        desc: '现金 -50%，体力 -50，收入 -50% 10 秒', descCN: '全面崩盘',
        effect: (gd) => { gd.cash *= 0.5; gd.stamina = Math.max(0, gd.stamina - 50); gd.incomePerSec *= 0.5; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 10000); gd.netWorth = gd.cash + gd.loan; } },
    ],

    // ---------- 正面事件 ----------
    positive: [
      // 通用
      { id: 'promotion', world: [0,2,3,4], name: '升职 Promotion', nameCN: '升职',
        desc: '基础收入 +25%，持续 8 秒', descCN: '收入 +25%',
        effect: (gd) => { gd.incomePerSec *= 1.25; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 8000); } },
      { id: 'bonus', world: [0,2,3,4], name: '年终奖 Bonus', nameCN: '年终奖',
        desc: '获得 $30,000', descCN: '+$30,000',
        effect: (gd) => { gd.cash += 30000; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'mentor', world: [0,1,2,3], name: '贵人 Mentor', nameCN: '贵人相助',
        desc: '下次负面事件免疫', descCN: '下次负面免疫',
        effect: (gd) => { gd.shieldActive = true; } },
      { id: 'side_hustle_boom', world: [0,2,3,4], name: '副业爆单 Side Hustle', nameCN: '副业爆单',
        desc: '收入 +35%，持续 8 秒', descCN: '收入 +35%',
        effect: (gd) => { gd.incomePerSec *= 1.35; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 8000); } },
      { id: 'inheritance', world: [0,3,4,5], name: '遗产继承 Inheritance', nameCN: '遗产继承',
        desc: '+$50,000', descCN: '+$50,000',
        effect: (gd) => { gd.cash += 50000; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'lottery_win', world: [0,1,2,3,4,5], name: '中奖 Lottery Win', nameCN: '彩票中奖',
        desc: '+$100,000！', descCN: '+$100,000！',
        effect: (gd) => { gd.cash += 100000; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'scholarship', world: [0,1], name: '奖学金 Scholarship', nameCN: '奖学金',
        desc: '学贷 -$20,000', descCN: '学贷减免 $20,000',
        effect: (gd) => { gd.loan += 20000; if (gd.loan > 0) gd.loan = 0; gd.netWorth = gd.cash + gd.loan; } },
      { id: 'free_insurance', world: [0,3,4], name: '免费保险 Free Insurance', nameCN: '免费保险',
        desc: '获得健康保险（体力恢复 +0.3）', descCN: '健康保险',
        effect: (gd) => { if (!gd.insurances.includes('health')) { gd.insurances.push('health'); gd.staminaRecovery = (gd.staminaRecovery || 0.6) + 0.3; } } },
      // W1 专属
      { id: 'intern_offer', world: [1], name: '实习 Offer Intern Offer', nameCN: '实习机会',
        desc: '基础收入 +$20/秒', descCN: '收入提升',
        effect: (gd) => { gd.baseIncomePerSec += 20; gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; } },
      // W2 专属
      { id: 'stock_vest', world: [2], name: '股票归属 Stock Vesting', nameCN: '股票归属',
        desc: '+$25,000', descCN: '+$25,000',
        effect: (gd) => { gd.cash += 25000; gd.netWorth = gd.cash + gd.loan; } },
      // W3 专属
      { id: 'family_gift', world: [3], name: '家庭赠礼 Family Gift', nameCN: '家庭赠礼',
        desc: '+$15,000，体力 +15', descCN: '+$15,000',
        effect: (gd) => { gd.cash += 15000; gd.stamina = Math.min(gd.staminaMax, gd.stamina + 15); gd.netWorth = gd.cash + gd.loan; } },
      // W4 专属
      { id: 'lawsuit_win', world: [4], name: '诉讼胜诉 Lawsuit Win', nameCN: '诉讼胜诉',
        desc: '+$80,000', descCN: '+$80,000',
        effect: (gd) => { gd.cash += 80000; gd.netWorth = gd.cash + gd.loan; } },
      // W5 专属
      { id: 'second_chance', world: [5], name: '绝处逢生 Second Chance', nameCN: '绝处逢生',
        desc: '体力回满，收入翻倍 5 秒', descCN: '绝处逢生',
        effect: (gd) => { gd.stamina = gd.staminaMax; gd.incomePerSec *= 2.0; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 5000); } },
    ],

    // ---------- 中性事件（含选择分支）----------
    neutral: [
      { id: 'job_hop', world: [0,2,3,4], name: '跳槽 Job Hop', nameCN: '跳槽',
        desc: '接受新工作？收入可能变高也可能变低', descCN: '接受新工作？',
        choices: [
          { label: '接受 Accept', labelCN: '接受', effect: (gd) => { gd.baseIncomePerSec = 80 + Math.random() * 80; gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; } },
          { label: '拒绝 Decline', labelCN: '拒绝', effect: () => {} }
        ] },
      { id: 'training', world: [0,1,2,3,4], name: '培训 Training', nameCN: '培训机会',
        desc: '花 $3,000 参加培训？基础收入 +5%', descCN: '花 $3,000 提升 5% 收入？',
        choices: [
          { label: '参加 Attend', labelCN: '参加', effect: (gd) => { gd.cash -= 3000; gd.baseIncomePerSec *= 1.05; gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; gd.netWorth = gd.cash + gd.loan; } },
          { label: '跳过 Skip', labelCN: '跳过', effect: () => {} }
        ] },
      { id: 'startup_offer', world: [0,2,4], name: '创业邀请 Startup Offer', nameCN: '创业邀请',
        desc: '加入初创公司？放弃稳定收入换股权', descCN: '放弃稳定收入换股权？',
        choices: [
          { label: '加入 Join', labelCN: '加入', effect: (gd) => { gd.baseIncomePerSec *= 0.5; gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; gd.cash += 100000 * Math.random(); gd.netWorth = gd.cash + gd.loan; } },
          { label: '婉拒 Pass', labelCN: '婉拒', effect: () => {} }
        ] },
      { id: 'marriage_proposal', world: [0,2,3], name: '求婚 Marriage Proposal', nameCN: '求婚',
        desc: '花费 $15,000 结婚？双收入但体力上限 -15', descCN: '花 $15,000 结婚？',
        choices: [
          { label: '结婚 Marry', labelCN: '结婚', effect: (gd) => { if (!gd.married) { gd.cash -= 15000; gd.married = true; gd.staminaMax -= 15; gd.incomePerSec *= 1.25; gd.netWorth = gd.cash + gd.loan; } } },
          { label: '暂缓 Wait', labelCN: '暂缓', effect: () => {} }
        ] },
      { id: 'investment_opp', world: [0,3,4,5], name: '投资机会 Investment', nameCN: '投资机会',
        desc: '投入 $10,000？50% 概率翻倍，50% 归零', descCN: '赌 $10,000？',
        choices: [
          { label: '投资 Invest', labelCN: '投资', effect: (gd) => { gd.cash -= 10000; if (Math.random() > 0.5) gd.cash += 20000; gd.netWorth = gd.cash + gd.loan; } },
          { label: '保守 Pass', labelCN: '保守', effect: () => {} }
        ] },
      { id: 'charity_drive', world: [0,3,4,5], name: '慈善募捐 Charity', nameCN: '慈善募捐',
        desc: '捐赠 $5,000？社会声望提升（+10% 收入 5 秒）', descCN: '捐 $5,000？',
        choices: [
          { label: '捐赠 Donate', labelCN: '捐赠', effect: (gd) => { gd.cash -= 5000; gd.incomePerSec *= 1.1; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 5000); gd.netWorth = gd.cash + gd.loan; } },
          { label: '跳过 Skip', labelCN: '跳过', effect: () => {} }
        ] },
    ]
  },

  cooldown: 0,
  active: false,
  queue: [],

  // ============ 更新循环 ============
  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  },

  // ============ 触发事件（按世界和赛段过滤）============
  trigger(worldParams, worldId = 1, segment = 's1') {
    if (this.cooldown > 0) return null;
    this.cooldown = 2.5; // 冷却 2.5 秒

    const prob = worldParams ? worldParams.negativeEventProb : 0.25;
    const roll = Math.random();
    let category;
    if (roll < prob) category = 'negative';
    else if (roll < prob + 0.30) category = 'positive';
    else category = 'neutral';

    // 过滤当前世界可用事件
    const available = this.pool[category].filter(e => e.world.includes(0) || e.world.includes(worldId));
    if (available.length === 0) return null;

    const event = available[Math.floor(Math.random() * available.length)];

    // 免疫检查
    const gd = GameState.gameData;
    if (category === 'negative' && gd.shieldActive) {
      gd.shieldActive = false;
      return { ...event, category, shielded: true };
    }

    // 自动效果事件（无选择分支）
    if (!event.choices && event.effect) {
      event.effect(gd);
    }

    return { ...event, category };
  },

  // ============ 弹窗展示 ============
  showPopup(event) {
    const gd = GameState.gameData;
    const popup = document.getElementById('event-popup');
    if (!popup) return;

    if (event.shielded) {
      popup.innerHTML = `
        <div class="event-header" style="border-left:4px solid var(--gold);">
          <div class="event-icon">🛡</div>
          <h3>${event.nameCN || event.name}</h3>
        </div>
        <p class="event-desc">🛡 贵人护体！负面事件已免疫 Shielded!</p>
      `;
    } else if (event.choices) {
      // 中性事件：显示选择按钮
      const color = event.category === 'negative' ? 'var(--negative)' : event.category === 'positive' ? 'var(--positive)' : 'var(--warning)';
      popup.innerHTML = `
        <div class="event-header" style="border-left:4px solid ${color};">
          <h3>${event.nameCN || event.name}</h3>
          <div class="event-name-en">${event.name}</div>
        </div>
        <p class="event-desc">${event.descCN || event.desc}</p>
        <div class="event-choices">
          ${event.choices.map((c, i) => `
            <button class="event-choice ${i === 0 ? 'good' : 'neutral'}" onclick="Events.resolveChoice('${event.id}', ${i})">
              ${c.labelCN || c.label}
            </button>
          `).join('')}
        </div>
      `;
    } else {
      // 正面/负面：自动效果
      const color = event.category === 'negative' ? 'var(--negative)' : 'var(--positive)';
      popup.innerHTML = `
        <div class="event-header" style="border-left:4px solid ${color};">
          <h3 style="color:${color}">${event.nameCN || event.name}</h3>
          <div class="event-name-en">${event.name}</div>
        </div>
        <p class="event-desc">${event.descCN || event.desc}</p>
      `;
    }

    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, event.choices ? 0 : 2800);
  },

  // ============ 选择分支处理 ============
  resolveChoice(eventId, choiceIndex) {
    const allNeutral = Object.values(this.pool.neutral);
    const event = allNeutral.find(e => e.id === eventId);
    if (event && event.choices[choiceIndex]) {
      event.choices[choiceIndex].effect(GameState.gameData);
    }
    document.getElementById('event-popup').style.display = 'none';
  }
};
