// ============================================================
// main.js — 主入口：界面切换、游戏启动
// ============================================================

// ===== 屏幕切换 =====
function showScreen(name) {
  document.querySelectorAll('.screen-container').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');
  GameState.screen = name;
}

function showMenu() {
  showScreen('menu');
  Engine.stop();
}

function goToMenu() {
  showMenu();
}

// ===== 新游戏流程 =====
function startNewGame() {
  // 随机选3个角色
  const picks = pickRandomCharacters(GameState.totalLXP, 3);
  if (picks.length === 0) {
    alert('没有可用角色！请先积累 LXP。');
    return;
  }

  showScreen('char-select');
  renderCharacterSelect(picks);
}

function renderCharacterSelect(picks) {
  const container = document.getElementById('char-cards');
  if (!container) return;

  container.innerHTML = picks.map((char, i) => {
    const fullStats = getCharacterFullStats(char);
    const tierLabel = char.tier === 'beginner' ? '新手' : char.tier === 'advanced' ? '进阶' : '高手';
    const tierClass = char.tier === 'beginner' ? 'beginner' : char.tier === 'advanced' ? 'advanced' : 'expert';
    return `
      <div class="char-card ${i === 0 ? 'selected' : ''}" onclick="selectCharacter(${char.id})" data-char-id="${char.id}">
        <div class="char-card-avatar" style="background-image:url('assets/characters/${getCharAssetPath(char)}');"></div>
        <div class="char-card-body">
          <div class="char-card-name">${char.name}</div>
          <div class="char-card-name-cn">${char.nameCN} · ${tierLabel}</div>
          <div class="char-card-tagline">"${char.taglineCN}"</div>
          <div class="char-stats">
            ${renderStatBadges(char.stats)}
          </div>
          <div class="char-data">
            <span>💰 $${fullStats.cash.toLocaleString()}</span>
            <span>📚 ${fullStats.studentLoan >= 0 ? '+$' : '-$'}${Math.abs(fullStats.studentLoan).toLocaleString()}</span>
            <span>⚡ ${fullStats.staminaMax}</span>
          </div>
          <div class="char-trait-info">
            ${char.traitDescCN}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 解锁栏
  const unlockBar = document.getElementById('char-unlock-bar');
  if (unlockBar) {
    const unlocked = getUnlockedCharacters(GameState.totalLXP).length;
    const pct = Math.min(100, (GameState.totalLXP / 5000) * 100);
    unlockBar.innerHTML = `
      <span class="unlock-icon">🔓</span> 已解锁 Unlocked: <b>${unlocked}/20</b> &nbsp;&nbsp;
      <div class="lxp-bar-bg"><div class="lxp-bar-fill" style="width:${pct}%"></div></div>
      &nbsp;&nbsp; <span class="lxp-icon">⭐</span> 人生经验 LXP: <b>${GameState.totalLXP}</b>
    `;
  }

  // 重置选择
  GameState.selectedCharacter = picks[0];
  document.getElementById('btn-confirm-char').disabled = false;
}

function selectCharacter(id) {
  const char = CHARACTERS.find(c => c.id === id);
  if (!char) return;
  GameState.selectedCharacter = char;
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-char-id="${id}"]`);
  if (card) card.classList.add('selected');
  document.getElementById('btn-confirm-char').disabled = false;
}

function confirmCharacter() {
  if (!GameState.selectedCharacter) return;
  showWorldMap();
}

function getAvatarBg(char) {
  const bgs = {
    'avg-joe': 'linear-gradient(135deg, #B0BEC5, #78909C)',
    'summa': 'linear-gradient(135deg, #FFF9C4, #FFD54F)',
    'athlete': 'linear-gradient(135deg, #A5D6A7, #66BB6A)',
    'veteran': 'linear-gradient(135deg, #90CAF9, #42A5F5)',
    'frugal': 'linear-gradient(135deg, #CE93D8, #AB47BC)',
    'union': 'linear-gradient(135deg, #BBDEFB, #64B5F6)',
  };
  return bgs[char.skin] || 'linear-gradient(135deg, #B0BEC5, #78909C)';
}

function getCharAssetPath(char) {
  const slugs = {
    1: 'char-01-average-joe', 2: 'char-02-summa-cum-laude',
    3: 'char-03-college-athlete', 4: 'char-04-veteran',
    5: 'char-05-frugal-minimalist', 6: 'char-06-union-worker',
    7: 'char-07-immigrant-dreamer', 8: 'char-08-single-parent',
    9: 'char-09-college-dropout', 10: 'char-10-dink-couple',
    11: 'char-11-the-networker', 12: 'char-12-phd-holder',
    13: 'char-13-night-shift-worker', 14: 'char-14-gig-economy',
    15: 'char-15-disabled-pro', 16: 'char-16-lucky-charm',
    17: 'char-17-legacy-run', 18: 'char-18-trust-fund-baby',
    19: 'char-19-influencer', 20: 'char-20-self-taught-genius',
  };
  return (slugs[char.id] || `char-${String(char.id).padStart(2,'0')}-unknown`) + '.png';
}

function getWorldAssetPath(worldId) {
  const slugs = {
    1: 'world-w1-first-steps', 2: 'world-w2-the-hustle',
    3: 'world-w3-settling-down', 4: 'world-w4-the-system',
    5: 'world-w5-the-cut-line'
  };
  return (slugs[worldId] || `world-w${worldId}-unknown`) + '.png';
}

function renderStatBadges(stats) {
  const labels = { sta: '体', soc: '社', edu: '学', wlth: '财', car: '职' };
  const titles = { sta: '体力 Stamina', soc: '社交 Social', edu: '教育 Education', wlth: '财富 Wealth', car: '职业 Career' };
  return Object.entries(stats).map(([key, val]) =>
    `<div class="stat-badge ${val}" title="${titles[key]}">${labels[key]}${val}</div>`
  ).join('');
}

// ===== 世界地图 =====
function showWorldMap() {
  showScreen('world-map');
  renderWorldMap();
}

function renderWorldMap() {
  const container = document.getElementById('world-cards');
  if (!container) return;

  const worlds = [
    { id: 1, scene: '🏫', name: 'First Steps', nameCN: '初入社会', color: '#4CAF50', theme: 'w1' },
    { id: 2, scene: '🏙', name: 'The Hustle', nameCN: '奋斗爬升', color: '#2196F3', theme: 'w2' },
    { id: 3, scene: '🏡', name: 'Settling Down', nameCN: '成家立业', color: '#FF9800', theme: 'w3' },
    { id: 4, scene: '🏦', name: 'The System', nameCN: '系统博弈', color: '#9C27B0', theme: 'w4' },
    { id: 5, scene: '🔴', name: 'The Cut Line', nameCN: '斩杀线', color: '#F44336', theme: 'w5' }
  ];

  container.innerHTML = worlds.map(w => {
    const wp = GameState.worldProgress[w.id];
    const unlocked = wp && wp.unlocked;
    const clearedCount = wp ? wp.cleared.filter(c => c).length : 0;
    const totalLevels = w.id === 1 ? 5 : w.id === 2 ? 4 : 5;
    const allCleared = clearedCount >= totalLevels;
    const stars = Array.from({length: totalLevels}, (_, i) => i < clearedCount ? '★' : '☆').join('');
    const cls = unlocked ? 'world-card' : 'world-card locked';

    return `
      <div class="${cls}" onclick="${unlocked ? `goToLevelSelect(${w.id})` : ''}">
        <div class="world-card-scene ${w.theme}" style="background-image:url('assets/worlds/${getWorldAssetPath(w.id)}');"></div>
        <div class="world-card-body" ${w.id === 5 ? 'style="border-top:3px solid var(--cutline-red);"' : ''}>
          <div class="world-card-num" style="${w.id === 5 ? 'color:var(--cutline-red)' : ''}">WORLD ${w.id}</div>
          <div class="world-card-name" style="${w.id === 5 ? 'color:var(--cutline-red)' : ''}">${w.name}</div>
          <div class="world-card-name-cn">${w.nameCN}</div>
          <div class="world-card-dots">${stars}</div>
          <div class="world-card-progress">${clearedCount}/${totalLevels} 关</div>
          <div class="world-card-btn" style="${unlocked && !allCleared ? `background:${w.color};color:#fff;` : ''}">
            ${unlocked ? (allCleared ? '重玩 Replay' : '进入 Enter') : '未解锁 Locked'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function goToWorldMap() {
  showWorldMap();
}

// ===== 关卡选择 =====
function goToLevelSelect(worldId) {
  showScreen('level-select');
  const world = getWorld(worldId);
  if (!world) return;

  document.getElementById('level-world-title').textContent = `🌍 WORLD ${worldId}`;
  document.getElementById('level-world-subtitle').textContent = `${world.nameCN} · ${world.name}`;

  renderLevelPath(worldId, world);
}

function renderLevelPath(worldId, world) {
  const container = document.getElementById('level-path');
  if (!container) return;

  const wp = GameState.worldProgress[worldId];
  const nextUncleared = GameState.getNextUnclearedLevel(worldId);

  let html = '';
  world.levels.forEach((level, i) => {
    if (i > 0) {
      const connectorCls = wp && wp.cleared[i-1] ? 'level-connector' : 'level-connector dashed';
      html += `<div class="${connectorCls}"></div>`;
    }

    let cls = 'level-node';
    if (level.boss) cls += ' boss';
    if (wp && wp.cleared[i]) cls += ' cleared';
    else if (i === nextUncleared && (i === 0 || wp.cleared[i-1])) cls += ' current';
    else if (i > nextUncleared) cls += ' locked';

    html += `
      <div class="${cls}" onclick="startLevel(${worldId}, ${i})">
        <span style="font-family:'Bangers',cursive;font-size:14px;">${level.id}</span>
        <span style="font-family:'Noto Sans SC',sans-serif;font-weight:700;font-size:10px;">${level.nameCN}</span>
        <span style="font-size:8px;opacity:0.6;">${level.name}</span>
      </div>
    `;
  });

  container.innerHTML = html;

  // 默认显示第一个未通关的关卡信息
  showLevelInfo(worldId, nextUncleared);
}

function showLevelInfo(worldId, levelIndex) {
  const panel = document.getElementById('level-info-panel');
  const level = getLevel(worldId, levelIndex);
  if (!level || !panel) return;

  const objLabels = {
    finish: '终点型 Finish',
    lane: '跑道型 Lane',
    risk: '风险型 Risk',
    collect: '收集型 Collect',
    composite: '复合型 Composite'
  };
  const objCN = {
    finish: '到达终点', lane: '跑道策略', risk: '风险管理',
    collect: '收集挑战', composite: '综合考验'
  };

  panel.innerHTML = `
    <h3>${level.id}: ${level.name}<br><span style="font-size:0.45em;font-family:'Noto Sans SC',sans-serif;">${level.nameCN}</span></h3>
    <div class="level-info-row">
      <span>🏁 ${level.length}m</span>
      <span>🔄 ${level.cycles} 周期</span>
      <span>🎯 ${objCN[level.objectiveType]} · ${objLabels[level.objectiveType]}</span>
    </div>
    <div class="level-info-row">
      <span>⭐ ${'★'.repeat(level.difficulty)}${'☆'.repeat(5-level.difficulty)}</span>
      ${level.boss ? '<span style="border-color:var(--cutline-red);color:var(--cutline-red);">👑 Boss关</span>' : ''}
      ${level.checkpoint ? '<span style="border-color:var(--positive);color:var(--positive);">💚 检查点</span>' : ''}
    </div>
    <div style="margin-top:12px;">
      <button class="btn-main btn-red" onclick="startLevel(${worldId}, ${GameState.getNextUnclearedLevel(worldId)})" style="font-size:16px;padding:10px 36px;min-width:auto;">
        ▶ 开始 START
      </button>
    </div>
  `;
}

// ===== 开始游戏 =====
function startLevel(worldId, levelIndex) {
  if (!GameState.selectedCharacter) {
    alert('请先选择角色！');
    return;
  }

  const level = getLevel(worldId, levelIndex);
  if (!level) return;

  // 检查是否已解锁
  const wp = GameState.worldProgress[worldId];
  if (!wp || !wp.unlocked) return;
  if (levelIndex > 0 && !wp.cleared[levelIndex - 1]) {
    // 未解锁
    levelIndex = GameState.getNextUnclearedLevel(worldId);
  }

  showScreen('game');
  Engine.start(GameState.selectedCharacter, worldId, levelIndex);
}

// ===== 结算界面 =====
function showResult(won, lxpEarned, reason) {
  showScreen('result');
  const panel = document.getElementById('result-panel');
  if (!panel) return;

  const gd = GameState.gameData;
  const char = GameState.selectedCharacter;

  if (won) {
    // 结局判定
    let badge, badgeCN, title, quote;
    if (gd.netWorth >= 1000000) {
      badge = '🏆 THE 1%'; badgeCN = '顶尖富豪 · The 1%'; title = 'Perfect Win!';
      quote = '"You didn\'t just beat the system. You became it."';
    } else if (gd.netWorth >= 300000) {
      badge = '🛤 UPPER MIDDLE'; badgeCN = '中上阶层 · Upper Middle'; title = 'Safe Landing!';
      quote = '"The cut line flashes, but you\'re already through."';
    } else if (gd.netWorth >= 50000) {
      badge = '😰 SURVIVOR'; badgeCN = '幸存者 · Survivor'; title = 'Barely Made It!';
      quote = '"You made it. Barely. The line grazed your shoulder."';
    } else if (gd.netWorth >= 0) {
      badge = '⚠ ON THE EDGE'; badgeCN = '边缘挣扎 · On the Edge'; title = 'Cut Line Victim';
      quote = '"The line cut clean. But tomorrow is another run."';
    } else {
      badge = '❌ FELL SHORT'; badgeCN = '未能达标 · Fell Short'; title = 'Try Again!';
      quote = '"You fell. Get up. Run again."';
    }

    panel.innerHTML = `
      <div class="result-badge">${badge}</div>
      <div class="result-badge-cn">${badgeCN}</div>
      <div class="result-title">🏆 ${title}</div>
      <div class="result-quote">${quote}</div>
      <div class="result-grid">
        <div class="result-stat"><div class="result-stat-val">👤</div><div class="result-stat-label">${char.nameCN} ${char.name}</div></div>
        <div class="result-stat"><div class="result-stat-val positive">$${Math.floor(gd.netWorth).toLocaleString()}</div><div class="result-stat-label">净资产 Net Worth</div></div>
        <div class="result-stat"><div class="result-stat-val">${22 + Math.floor(gd.distance / gd.totalDistance * 13)}岁</div><div class="result-stat-label">年龄 Age</div></div>
        <div class="result-stat"><div class="result-stat-val">${gd.married ? '💍' : '💔'}${gd.children > 0 ? '👶'.repeat(gd.children) : ''}</div><div class="result-stat-label">${gd.married ? '已婚' : '单身'} ${gd.children > 0 ? '+'+gd.children+'孩' : ''}</div></div>
      </div>
      <div style="margin:14px 0;font-size:15px;">
        ⭐ 获得经验 LXP: <b style="color:var(--gold)">+${lxpEarned}</b> &nbsp;|&nbsp; 📊 累计 Total: <b style="color:var(--gold)">${GameState.totalLXP} LXP</b>
      </div>
      <div class="result-btns">
        <button class="btn-main btn-red" onclick="retryLevel()" style="font-size:14px;padding:10px 22px;min-width:auto;">🔄 重试 Retry</button>
        <button class="btn-main" onclick="goToLevelSelect(${GameState.currentWorld})" style="font-size:14px;padding:10px 22px;min-width:auto;">🗺 关卡 Levels</button>
        <button class="btn-main btn-gold" onclick="goToMenu()" style="font-size:14px;padding:10px 22px;min-width:auto;">🏠 主菜单 Menu</button>
      </div>
    `;
  } else {
    panel.innerHTML = `
      <div class="result-badge" style="color:var(--negative);">💀 GAME OVER</div>
      <div class="result-badge-cn">${reason === 'stamina' ? '体力耗尽' : '失败'} · Defeated</div>
      <div class="result-quote">"每一次失败都是为下一次积累经验。"</div>
      <div class="result-grid">
        <div class="result-stat"><div class="result-stat-val">👤</div><div class="result-stat-label">${char.nameCN}</div></div>
        <div class="result-stat"><div class="result-stat-val" style="color:${gd.netWorth >= 0 ? 'var(--positive)' : 'var(--negative)'}">$${Math.floor(gd.netWorth).toLocaleString()}</div><div class="result-stat-label">净资产</div></div>
        <div class="result-stat"><div class="result-stat-val">${Math.floor(gd.distance)}m</div><div class="result-stat-label">跑了多远</div></div>
      </div>
      <div style="margin:14px 0;font-size:15px;">
        ⭐ 获得经验 LXP: <b style="color:var(--gold)">+${lxpEarned}</b>
      </div>
      <div class="result-btns">
        <button class="btn-main btn-red" onclick="retryLevel()" style="font-size:14px;padding:10px 22px;min-width:auto;">🔄 重试 Retry</button>
        <button class="btn-main btn-gold" onclick="goToMenu()" style="font-size:14px;padding:10px 22px;min-width:auto;">🏠 主菜单 Menu</button>
      </div>
    `;
  }
}

function retryLevel() {
  startLevel(GameState.currentWorld, GameState.currentLevelIndex);
}

// ===== 占位功能 =====
function showCharacterGallery() {
  alert('角色图鉴 — 开发中 Character Gallery WIP\n\n已解锁: ' + getUnlockedCharacters(GameState.totalLXP).length + '/20');
}
function showSettings() { alert('设置 Settings — 开发中 WIP'); }
function showBonusLevels() {
  const unlocked = BONUS_LEVELS.filter(b => {
    const wp = GameState.worldProgress[b.unlockWorld];
    return wp && wp.unlocked;
  });
  if (unlocked.length === 0) {
    alert('暂无解锁的趣味关卡！\nNo bonus levels unlocked yet!');
    return;
  }
  alert('趣味关卡 Bonus Levels:\n\n' + unlocked.map(b => `${b.emoji} ${b.nameCN} ${b.name} (${b.length}m, $${b.netWorthGoal.toLocaleString()})`).join('\n'));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  GameState.init();
});
