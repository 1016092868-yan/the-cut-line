// ============================================================
// textures.js — 程序化纹理生成器
// 用 Canvas 2D 动态生成所有纹理贴图，零外部依赖
// ============================================================

const Textures = {
  _cache: {},

  /** 创建 Canvas 纹理 */
  _makeTexture(width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  },

  /** 带缓存的纹理获取 */
  _cached(key, w, h, fn) {
    if (this._cache[key]) return this._cache[key];
    this._cache[key] = this._makeTexture(w, h, fn);
    return this._cache[key];
  },

  // ============ 跑道纹理 ============

  /** 沥青路面 */
  asphalt() {
    return this._cached('asphalt', 512, 512, (ctx, w, h) => {
      // 基底
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(0, 0, w, h);
      // 噪点纹理
      for (let i = 0; i < 8000; i++) {
        const x = Math.random() * w, y = Math.random() * h;
        const v = 30 + Math.random() * 40;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
      // 裂缝
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        let cx = Math.random() * w, cy = Math.random() * h;
        ctx.moveTo(cx, cy);
        for (let j = 0; j < 6; j++) {
          cx += (Math.random() - 0.5) * 60;
          cy += (Math.random() - 0.5) * 40;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    });
  },

  /** 车道标线（白色虚线） */
  laneLine() {
    return this._cached('laneLine', 64, 512, (ctx, w, h) => {
      ctx.fillStyle = '#ffffff';
      const dashH = 40, gapH = 30;
      for (let y = 0; y < h; y += dashH + gapH) {
        ctx.fillRect(0, y, w, dashH);
      }
    });
  },

  /** 跑道颜色叠加 */
  laneOverlay(colorHex) {
    const key = 'laneOverlay_' + colorHex;
    return this._cached(key, 256, 256, (ctx, w, h) => {
      ctx.fillStyle = colorHex;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    });
  },

  // ============ 建筑纹理 ============

  /** 窗户网格 */
  windowGrid(rows, cols, litColor) {
    const key = `windowGrid_${rows}_${cols}_${litColor}`;
    return this._cached(key, 256, 512, (ctx, w, h) => {
      // 墙面
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(0, 0, w, h);
      const cellW = w / cols, cellH = h / rows;
      const pad = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = Math.random() > 0.3;
          ctx.fillStyle = lit ? litColor : '#1a1a1a';
          ctx.fillRect(c * cellW + pad, r * cellH + pad, cellW - pad * 2, cellH - pad * 2);
        }
      }
    });
  },

  /** 红砖墙 */
  brickWall() {
    return this._cached('brickWall', 256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, w, h);
      const brickW = 40, brickH = 16, gap = 2;
      for (let r = 0; r < h / brickH; r++) {
        const offset = (r % 2) * brickW / 2;
        for (let c = 0; c < w / brickW + 1; c++) {
          const bx = c * brickW + offset - brickW / 2;
          const by = r * brickH;
          const shade = 0.7 + Math.random() * 0.3;
          ctx.fillStyle = `rgba(${Math.floor(139*shade)},${Math.floor(69*shade)},${Math.floor(19*shade)},1)`;
          ctx.fillRect(bx + gap, by + gap, brickW - gap * 2, brickH - gap * 2);
        }
      }
      // 灰缝
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 1;
      for (let r = 0; r < h / brickH; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * brickH);
        ctx.lineTo(w, r * brickH);
        ctx.stroke();
      }
    });
  },

  /** 玻璃幕墙 */
  glassFacade(blueShift = 0) {
    const key = 'glassFacade_' + blueShift;
    return this._cached(key, 256, 512, (ctx, w, h) => {
      const r = 30 + blueShift, g = 60 + blueShift, b = 100 + blueShift;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `rgb(${r+20},${g+20},${b+20})`);
      grad.addColorStop(0.5, `rgb(${r},${g},${b})`);
      grad.addColorStop(1, `rgb(${r-10},${g-10},${b-10})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // 框架线
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    });
  },

  /** 霓虹招牌 */
  neonSign(text, color) {
    const key = 'neonSign_' + text;
    return this._cached(key, 256, 64, (ctx, w, h) => {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = color;
      ctx.font = 'bold 28px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, h / 2 + 10);
      ctx.shadowBlur = 0;
    });
  },

  // ============ 角色纹理 ============

  /** 面部贴图 */
  face(skinColor, eyeColor) {
    const key = `face_${skinColor}`;
    return this._cached(key, 128, 128, (ctx, w, h) => {
      // 肤色底
      ctx.fillStyle = skinColor;
      ctx.fillRect(0, 0, w, h);
      // 眼睛
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(35, 50, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(93, 50, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      // 瞳孔
      ctx.fillStyle = eyeColor || '#2c1810';
      ctx.beginPath(); ctx.arc(38, 52, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(96, 52, 6, 0, Math.PI * 2); ctx.fill();
      // 眉毛
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(22, 38); ctx.lineTo(48, 42); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, 42); ctx.lineTo(106, 38); ctx.stroke();
      // 嘴
      ctx.strokeStyle = '#c44';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(64, 78, 12, 0.1, Math.PI - 0.1); ctx.stroke();
    });
  },

  /** 上衣纹理 */
  shirt(color, pattern) {
    const key = `shirt_${color}`;
    return this._cached(key, 128, 128, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
      if (pattern === 'stripe') {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let y = 0; y < h; y += 12) ctx.fillRect(0, y, w, 5);
      }
      if (pattern === 'plaid') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let y = 0; y < h; y += 16) ctx.fillRect(0, y, w, 4);
        for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 4, h);
      }
    });
  },

  // ============ 障碍物纹理 ============

  /** 文件堆纹理 */
  documents() {
    return this._cached('documents', 256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w * 0.8;
        const y = Math.random() * h * 0.8;
        ctx.save();
        ctx.translate(x + 25, y + 15);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-20, -15, 40, 30);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(-20, -15, 40, 30);
        // 文字线
        ctx.fillStyle = '#ddd';
        for (let l = 0; l < 4; l++) {
          ctx.fillRect(-15, -8 + l * 5, 25 + Math.random() * 8, 2);
        }
        ctx.restore();
      }
    });
  },

  /** 汽车侧面 */
  carSide(bodyColor) {
    const key = 'carSide_' + bodyColor;
    return this._cached(key, 256, 128, (ctx, w, h) => {
      ctx.fillStyle = bodyColor;
      // 车身
      ctx.beginPath();
      ctx.moveTo(30, h); ctx.lineTo(20, h * 0.6);
      ctx.lineTo(60, h * 0.3); ctx.lineTo(140, h * 0.25);
      ctx.lineTo(200, h * 0.3); ctx.lineTo(230, h * 0.6);
      ctx.lineTo(240, h); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke();
      // 车窗
      ctx.fillStyle = '#aad4f0';
      ctx.beginPath();
      ctx.moveTo(65, h * 0.33); ctx.lineTo(135, h * 0.28);
      ctx.lineTo(195, h * 0.33); ctx.lineTo(195, h * 0.55);
      ctx.lineTo(135, h * 0.5); ctx.lineTo(65, h * 0.55);
      ctx.closePath(); ctx.fill();
      // 轮子
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(65, h - 12, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(180, h - 12, 14, 0, Math.PI * 2); ctx.fill();
    });
  },

  // ============ 收集品纹理 ============

  /** 钞票 */
  cashBill() {
    return this._cached('cashBill', 128, 64, (ctx, w, h) => {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', w / 2, h / 2 + 8);
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, w - 4, h - 4);
    });
  },

  /** 能量饮料 */
  energyDrink() {
    return this._cached('energyDrink', 64, 128, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#1565C0');
      grad.addColorStop(0.5, '#42A5F5');
      grad.addColorStop(1, '#1565C0');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(8, 20, w - 16, h - 28, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', w / 2, h / 2 + 5);
    });
  },

  /** 技能书 */
  skillBook(color) {
    const key = 'skillBook_' + color;
    return this._cached(key, 100, 70, (ctx, w, h) => {
      // 书脊
      ctx.fillStyle = color;
      ctx.fillRect(0, 4, 16, h - 8);
      // 封面
      ctx.fillStyle = color;
      ctx.fillRect(16, 0, w - 16, h);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 0, w - 16, h);
      // 标题
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKILL', 16 + (w - 16) / 2, h / 2 + 4);
    });
  },

  // ============ 天空纹理 ============

  /** 渐变天空 */
  skyGradient(topColor, botColor) {
    const key = `sky_${topColor}_${botColor}`;
    return this._cached(key, 512, 512, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, botColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // 云层
      for (let i = 0; i < 10; i++) {
        const cx = Math.random() * w, cy = Math.random() * h * 0.5;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + Math.random() * 40, 0, Math.PI * 2);
        ctx.arc(cx + 30, cy - 10, 20 + Math.random() * 30, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },

  // ============ 斩杀线纹理 ============

  /** 激光扫描线 */
  laserScan() {
    return this._cached('laserScan', 64, 512, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255,0,0,0)');
      grad.addColorStop(0.3, 'rgba(255,50,50,0.8)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.7, 'rgba(255,50,50,0.8)');
      grad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // 扫描线
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, y, w, 4);
      }
    });
  }
};

window.Textures = Textures;
