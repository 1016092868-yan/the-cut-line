// ============================================================
// generate-assets.js — 程序化生成角色卡片和世界插画
// 用 Canvas 2D 绘制占位图，等拿到 AI 生成图后替换
// 用法：node generate-assets.js
// ============================================================

const fs = require('fs');
const { createCanvas } = require('canvas');

const CHARACTERS_DIR = __dirname + '/assets/characters';
const WORLDS_DIR = __dirname + '/assets/worlds';

// 确保目录存在
fs.mkdirSync(CHARACTERS_DIR, { recursive: true });
fs.mkdirSync(WORLDS_DIR, { recursive: true });

// ============ 角色配置 ============
const chars = [
  { id: '01', name: 'Average Joe', cn: '普通人', skin: '#FFCC80', hair: '#5D4037', shirt: '#B0BEC5', bg: '#E0E0E0', emoji: '🧑' },
  { id: '02', name: 'Summa Cum Laude', cn: '学霸', skin: '#FFDBAC', hair: '#1A1A1A', shirt: '#FFF9C4', bg: '#FFF8E1', emoji: '🎓' },
  { id: '03', name: 'College Athlete', cn: '运动员', skin: '#8D5524', hair: '#1A1A1A', shirt: '#4CAF50', bg: '#E8F5E9', emoji: '🏋' },
  { id: '04', name: 'Veteran', cn: '退伍军人', skin: '#FFCC80', hair: '#795548', shirt: '#546E7A', bg: '#ECEFF1', emoji: '🇺🇸' },
  { id: '05', name: 'Frugal Minimalist', cn: '极简主义者', skin: '#FFDBAC', hair: '#8D6E63', shirt: '#EFEBE9', bg: '#F5F5F5', emoji: '🧵' },
  { id: '06', name: 'Union Worker', cn: '工会成员', skin: '#C68642', hair: '#3E2723', shirt: '#1565C0', bg: '#E3F2FD', emoji: '🛠' },
];

// ============ 世界配置 ============
const worlds = [
  { id: 'w1', name: 'First Steps', cn: '初入社会', sky: '#87CEEB', ground: '#4CAF50', emoji: '🏫' },
  { id: 'w2', name: 'The Hustle', cn: '奋斗爬升', sky: '#90CAF9', ground: '#2196F3', emoji: '🏙' },
  { id: 'w3', name: 'Settling Down', cn: '成家立业', sky: '#FFCC80', ground: '#FF9800', emoji: '🏡' },
  { id: 'w4', name: 'The System', cn: '系统博弈', sky: '#7E57C2', ground: '#9C27B0', emoji: '🏦' },
  { id: 'w5', name: 'The Cut Line', cn: '斩杀线', sky: '#B71C1C', ground: '#F44336', emoji: '🔴' },
];

// ============ 绘制角色卡片 ============
function drawCharacterCard(char) {
  const w = 512, h = 512;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = char.bg;
  ctx.fillRect(0, 0, w, h);

  // 粗黑边框
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // 头部
  ctx.fillStyle = char.skin;
  ctx.beginPath();
  ctx.arc(w / 2, 180, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 头发
  ctx.fillStyle = char.hair;
  ctx.beginPath();
  ctx.arc(w / 2, 160, 82, Math.PI, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(w / 2 - 25, 170, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w / 2 + 25, 170, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1A1A2E';
  ctx.beginPath(); ctx.arc(w / 2 - 23, 172, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w / 2 + 23, 172, 8, 0, Math.PI * 2); ctx.fill();

  // 嘴
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(w / 2, 210, 20, 0.1, Math.PI - 0.1); ctx.stroke();

  // 身体
  ctx.fillStyle = char.shirt;
  ctx.fillRect(w / 2 - 60, 270, 120, 100);
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 4;
  ctx.strokeRect(w / 2 - 60, 270, 120, 100);

  // 名字
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(char.cn, w / 2, 430);
  ctx.font = '18px "Nunito", sans-serif';
  ctx.fillText(char.name, w / 2, 460);

  // Emoji
  ctx.font = '48px sans-serif';
  ctx.fillText(char.emoji, w / 2, 500);

  return canvas;
}

// ============ 绘制世界插画 ============
function drawWorldCard(world) {
  const w = 800, h = 400;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // 天空渐变
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, world.sky);
  grad.addColorStop(0.6, world.ground);
  grad.addColorStop(1, '#1A1A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 建筑剪影
  ctx.fillStyle = '#1A1A2E';
  for (let i = 0; i < 15; i++) {
    const bx = i * 55 + Math.random() * 10;
    const bh = 60 + Math.random() * 150;
    const bw = 30 + Math.random() * 40;
    ctx.fillRect(bx, h - 80 - bh, bw, bh);
  }

  // 地面
  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(0, h - 30, w, 30);

  // 粗黑边框
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.cn, w / 2, 60);
  ctx.font = '20px "Nunito", sans-serif';
  ctx.fillText(world.name, w / 2, 90);

  // Emoji
  ctx.font = '64px sans-serif';
  ctx.fillText(world.emoji, w / 2, 170);

  return canvas;
}

// ============ 生成所有图像 ============
console.log('Generating character cards...');
chars.forEach(c => {
  const canvas = drawCharacterCard(c);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(`${CHARACTERS_DIR}/char-${c.id}-${c.name.toLowerCase().replace(/\s+/g, '-')}.png`, buf);
  console.log(`  ✅ char-${c.id}: ${c.cn}`);
});

console.log('Generating world illustrations...');
worlds.forEach(w => {
  const canvas = drawWorldCard(w);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(`${WORLDS_DIR}/world-${w.id}-${w.name.toLowerCase().replace(/\s+/g, '-')}.png`, buf);
  console.log(`  ✅ world-${w.id}: ${w.cn}`);
});

console.log('\n🎨 All assets generated!');
console.log(`   Characters: ${CHARACTERS_DIR}/`);
console.log(`   Worlds: ${WORLDS_DIR}/`);
