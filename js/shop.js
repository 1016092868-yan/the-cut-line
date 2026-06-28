// ============================================================
// shop.js — 商店面板（P1 升级：AI 道具图 + 分类标签 + 弹窗 UI）
// ============================================================

const Shop = {
  isOpen: false,

  // 商品定义：id, icon(图片), name, nameCN, price, downPayment, effect, effectCN, category, assetId
  items: {
    housing: [
      { id: 'house_suburban', name: 'Suburban Apartment', nameCN: '郊区公寓',
        price: 120000, downPayment: 24000,
        effect: '❤ Recovery +0.2, +$400/cycle', effectCN: '体力恢复 +0.2，+$400/周期',
        icon: '🏠' },
      { id: 'house_villa', name: 'Detached Villa', nameCN: '独栋别墅',
        price: 350000, downPayment: 70000,
        effect: '❤ Recovery +0.3, +$1,200/cycle', effectCN: '体力恢复 +0.3，+$1,200/周期',
        icon: '🏡' },
    ],
    vehicles: [
      { id: 'car_used', name: 'Used Car', nameCN: '二手车',
        price: 8000, downPayment: 8000,
        effect: '❤ Recovery +0.1, Cooldown -50%', effectCN: '体力恢复 +0.1，切换冷却减半',
        icon: '🚗' },
      { id: 'car_new', name: 'New Car', nameCN: '新车',
        price: 28000, downPayment: 28000,
        effect: '❤ Recovery +0.15, Income +3%', effectCN: '体力恢复 +0.15，收入 +3%',
        icon: '🚙' },
    ],
    fitness: [
      { id: 'fitness_1', name: 'Basic Gym', nameCN: '基础健身', level: 1,
        price: 50, effect: '+10 Stamina Max', effectCN: '体力上限 +10',
        icon: '🏃' },
      { id: 'fitness_2', name: 'Pro Gym', nameCN: '进阶健身', level: 2,
        price: 150, effect: '+20 Stamina Max', effectCN: '体力上限 +20',
        icon: '🏋' },
      { id: 'fitness_3', name: 'Elite Gym', nameCN: '精英健身', level: 3,
        price: 350, effect: '+30 Stamina Max', effectCN: '体力上限 +30',
        icon: '💪' },
    ],
    consumables: [
      { id: 'energy_boost', name: 'Energy Boost', nameCN: '能量饮料',
        price: 2000, effect: 'Instantly +30 Stamina', effectCN: '立即恢复 30 体力',
        icon: '⚡', consumable: true },
      { id: 'shield_token', name: 'Shield Token', nameCN: '护盾令牌',
        price: 5000, effect: 'Immune to next negative event', effectCN: '免疫下次负面事件',
        icon: '🛡', consumable: true },
      { id: 'cash_injection', name: 'Cash Injection', nameCN: '现金注入',
        price: 10000, effect: 'Instantly +$15,000', effectCN: '立即获得 $15,000',
        icon: '💵', consumable: true },
    ],
    certifications: [
      { id: 'cert_pmp', name: 'PMP Certificate', nameCN: 'PMP 认证',
        price: 8000, effect: 'Base Income +$15/sec', effectCN: '基础收入 +$15/秒',
        icon: '📋' },
      { id: 'cert_cfa', name: 'CFA Certificate', nameCN: 'CFA 认证',
        price: 12000, effect: 'Base Income +$25/sec', effectCN: '基础收入 +$25/秒',
        icon: '📊' },
    ]
  },

  // 分类中文名
  categoryNames: {
    housing: '🏠 房产 Housing',
    vehicles: '🚗 车辆 Vehicles',
    fitness: '🏋 健身 Fitness',
    consumables: '🎒 消耗品 Consumables',
    certifications: '📜 认证 Certifications',
  },

  init() {},

  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('shop-panel');
    if (!panel) return;
    if (this.isOpen) {
      this.render();
      panel.style.display = 'block';
      Engine.pause();
    } else {
      panel.style.display = 'none';
      Engine.resume();
    }
  },

  render() {
    const gd = GameState.gameData;
    const panel = document.getElementById('shop-panel');
    if (!panel) return;

    const cash = gd.cash;

    let html = `
      <div class="shop-header">
        <h2>🛒 商店 SHOP</h2>
        <div class="shop-close" onclick="Shop.toggle()">✕</div>
      </div>
      <div class="shop-cash-bar">
        <span class="shop-cash-label">可用现金 Available</span>
        <span class="shop-cash-value">$${Math.floor(cash).toLocaleString()}</span>
      </div>
      <div class="shop-categories">
    `;

    // 渲染每个分类
    for (const [catKey, items] of Object.entries(this.items)) {
      html += `
        <div class="shop-category">
          <div class="shop-cat-title">${this.categoryNames[catKey]}</div>
          <div class="shop-items-grid">
      `;

      for (const item of items) {
        html += this.renderItem(item, cash, gd, catKey);
      }

      html += `</div></div>`;
    }

    html += `
      </div>
      <div class="shop-footer">
        <button class="btn-main" onclick="Shop.toggle()" style="font-size:14px;padding:10px 30px;min-width:auto;">
          关闭 Close
        </button>
      </div>
    `;

    panel.innerHTML = html;
  },

  renderItem(item, cash, gd, catKey) {
    let owned = false;
    if (catKey === 'fitness') {
      owned = gd.fitnessLevel >= item.level;
    } else if (catKey === 'consumables') {
      owned = false; // 消耗品可重复购买
    } else if (catKey === 'certifications') {
      owned = gd.certifications && gd.certifications.includes(item.id);
    } else {
      owned = gd.assets.includes(item.id);
    }

    const canAfford = cash >= item.price;
    const locked = owned || !canAfford;
    const cls = locked ? 'shop-item-card locked' : 'shop-item-card';

    let btnHTML;
    if (owned) {
      btnHTML = `<div class="shop-item-btn owned">✅ 已拥有 Owned</div>`;
    } else if (!canAfford) {
      btnHTML = `<div class="shop-item-btn disabled">🔒 资金不足</div>`;
    } else {
      const action = catKey === 'fitness'
        ? `Shop.buyFitness(${item.level}, ${item.price})`
        : catKey === 'consumables'
        ? `Shop.buyConsumable('${item.id}', ${item.price})`
        : `Shop.buy('${item.id}', ${item.price})`;
      btnHTML = `<div class="shop-item-btn buy" onclick="${action}">购买 BUY</div>`;
    }

    return `
      <div class="${cls}">
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-info">
          <div class="shop-item-name">${item.nameCN}</div>
          <div class="shop-item-name-en">${item.name}</div>
          <div class="shop-item-price">$${item.price.toLocaleString()}</div>
          <div class="shop-item-effect">${item.effectCN || item.effect}</div>
          ${btnHTML}
        </div>
      </div>
    `;
  },

  buy(assetId, price) {
    const gd = GameState.gameData;
    if (gd.cash < price) return;
    gd.cash -= price;
    if (!gd.assets.includes(assetId)) gd.assets.push(assetId);
    gd.netWorth = gd.cash + gd.loan;
    this.render();
  },

  buyFitness(level, price) {
    const gd = GameState.gameData;
    if (gd.cash < price || gd.fitnessLevel >= level) return;
    gd.cash -= price;
    const oldMax = gd.staminaMax;
    gd.fitnessLevel = level;
    gd.staminaMax += level * 10;
    gd.stamina = Math.min(gd.staminaMax, gd.stamina + (gd.staminaMax - oldMax));
    gd.netWorth = gd.cash + gd.loan;
    this.render();
  },

  buyConsumable(itemId, price) {
    const gd = GameState.gameData;
    if (gd.cash < price) return;
    gd.cash -= price;
    gd.netWorth = gd.cash + gd.loan;

    switch (itemId) {
      case 'energy_boost':
        gd.stamina = Math.min(gd.staminaMax, gd.stamina + 30);
        break;
      case 'shield_token':
        gd.shieldActive = true;
        break;
      case 'cash_injection':
        gd.cash += 15000;
        gd.netWorth = gd.cash + gd.loan;
        break;
    }
    this.render();
  }
};

// ============ 全局函数（HTML onclick 调用）============
function toggleShop() { Shop.toggle(); }
function toggleLoan() { alert('贷款面板 Loan Panel — 开发中 WIP'); }
function triggerMarriage() {
  const gd = GameState.gameData;
  if (gd.married) return;
  if (gd.cash < 15000) return;
  gd.cash -= 15000;
  gd.married = true;
  gd.staminaMax -= 15;
  gd.incomePerSec *= 1.25;
  gd.netWorth = gd.cash + gd.loan;
  const popup = document.getElementById('event-popup');
  if (popup) {
    popup.innerHTML = '<div class="event-header" style="border-left:4px solid var(--w3-orange);"><h3>💍 恭喜结婚! Congratulations!</h3></div><p class="event-desc">双收入 +25%，体力上限 -15</p>';
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2500);
  }
}
function togglePause() {
  GameState.isPaused = !GameState.isPaused;
  document.getElementById('pause-overlay').style.display = GameState.isPaused ? 'flex' : 'none';
}
function quitToMenu() {
  Engine.stop();
  GameState.isPaused = false;
  document.getElementById('pause-overlay').style.display = 'none';
  showMenu();
}
