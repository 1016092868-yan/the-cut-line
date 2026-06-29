// ============================================================
// characterTextures.js — 高质量角色贴图生成器
// 用 Canvas 2D 绘制细腻的服装纹理、面部贴图、配饰纹理
// 每个角色有独特的面部特征和服装风格
// ============================================================

const CharacterTextures = {
  _cache: {},

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
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  },

  _cached(key, w, h, fn) {
    if (this._cache[key]) return this._cache[key];
    this._cache[key] = this._makeTexture(w, h, fn);
    return this._cache[key];
  },

  // ============ 角色完整纹理包 ============

  /** 获取某个角色的所有纹理 */
  getCharacterTextures(charId) {
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return null;

    const schemeIdx = (charId - 1) % 6;
    const scheme = CharacterTextures._schemes[schemeIdx];

    return {
      face: this.getFaceTexture(char, scheme),
      bodyFront: this.getBodyFrontTexture(char, scheme),
      bodyBack: this.getBodyBackTexture(char, scheme),
      arm: this.getArmTexture(char, scheme),
      leg: this.getLegTexture(char, scheme),
      shoe: this.getShoeTexture(char, scheme),
      hair: scheme.hair,
      skin: scheme.skin,
      topColor: scheme.top,
      bottomColor: scheme.bottom,
      shoeColor: scheme.shoe,
      accentColor: scheme.accent,
    };
  },

  // 6种配色方案
  _schemes: [
    { skin: '#FFCC80', skinDark: '#E6A84D', hair: '#3E2723', top: '#4488cc', topDark: '#2E6BA0', bottom: '#37474F', bottomDark: '#263238', shoe: '#2c2c2c', accent: '#cc3333' },
    { skin: '#F5D0A9', skinDark: '#D4A574', hair: '#1a1a1a', top: '#2E7D32', topDark: '#1B5E20', bottom: '#263238', bottomDark: '#1a1a1a', shoe: '#3E2723', accent: '#1565C0' },
    { skin: '#E0AC69', skinDark: '#C68642', hair: '#4E342E', top: '#C62828', topDark: '#8E1A1A', bottom: '#1B2631', bottomDark: '#111827', shoe: '#424242', accent: '#FFD700' },
    { skin: '#C68642', skinDark: '#A0662A', hair: '#212121', top: '#6A1B9A', topDark: '#4A0F6E', bottom: '#212121', bottomDark: '#111111', shoe: '#111111', accent: '#FF9800' },
    { skin: '#FFE0BD', skinDark: '#E6B88A', hair: '#5D4037', top: '#E65100', topDark: '#B23D00', bottom: '#3E2723', bottomDark: '#2C1A16', shoe: '#4E342E', accent: '#2196F3' },
    { skin: '#D4A574', skinDark: '#B0885A', hair: '#1B1B1B', top: '#37474F', topDark: '#263238', bottom: '#424242', bottomDark: '#2d2d2d', shoe: '#1a1a1a', accent: '#4CAF50' },
  ],

  // ============ 面部贴图（512×512，高精度）============

  getFaceTexture(char, scheme) {
    const key = `face_char_${char.id}`;
    return this._cached(key, 512, 512, (ctx, w, h) => {
      // 皮肤底色
      ctx.fillStyle = scheme.skin;
      ctx.fillRect(0, 0, w, h);

      // 微妙肤色变化（脸颊红润）
      const blushGrad = ctx.createRadialGradient(w*0.25, h*0.55, 20, w*0.25, h*0.55, 80);
      blushGrad.addColorStop(0, 'rgba(255, 120, 120, 0.15)');
      blushGrad.addColorStop(1, 'rgba(255, 120, 120, 0)');
      ctx.fillStyle = blushGrad;
      ctx.fillRect(0, 0, w, h);
      const blushGrad2 = ctx.createRadialGradient(w*0.75, h*0.55, 20, w*0.75, h*0.55, 80);
      blushGrad2.addColorStop(0, 'rgba(255, 120, 120, 0.15)');
      blushGrad2.addColorStop(1, 'rgba(255, 120, 120, 0)');
      ctx.fillStyle = blushGrad2;
      ctx.fillRect(0, 0, w, h);

      // 额头高光
      const fgGrad = ctx.createRadialGradient(w*0.5, h*0.25, 20, w*0.5, h*0.35, 120);
      fgGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
      fgGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = fgGrad;
      ctx.fillRect(0, 0, w, h);

      // === 眉毛 ===
      ctx.fillStyle = scheme.hair;
      // 左眉
      ctx.beginPath();
      ctx.moveTo(w*0.18, h*0.36); ctx.quadraticCurveTo(w*0.25, h*0.32, w*0.35, h*0.35);
      ctx.lineTo(w*0.35, h*0.38); ctx.quadraticCurveTo(w*0.25, h*0.35, w*0.18, h*0.39);
      ctx.closePath(); ctx.fill();
      // 右眉
      ctx.beginPath();
      ctx.moveTo(w*0.65, h*0.35); ctx.quadraticCurveTo(w*0.75, h*0.32, w*0.82, h*0.36);
      ctx.lineTo(w*0.82, h*0.39); ctx.quadraticCurveTo(w*0.75, h*0.35, w*0.65, h*0.38);
      ctx.closePath(); ctx.fill();

      // === 眼睛 ===
      // 眼白
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(w*0.25, h*0.44, 28, 18, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w*0.75, h*0.44, 28, 18, 0, 0, Math.PI*2); ctx.fill();

      // 虹膜
      const irisColors = ['#4a7c59', '#5D4037', '#2c5282', '#6B4226', '#3e5c3a', '#3e2723'];
      const irisColor = irisColors[(char.id-1) % irisColors.length];
      ctx.fillStyle = irisColor;
      ctx.beginPath(); ctx.arc(w*0.25, h*0.44, 13, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.75, h*0.44, 13, 0, Math.PI*2); ctx.fill();

      // 瞳孔
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(w*0.25, h*0.44, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.75, h*0.44, 6, 0, Math.PI*2); ctx.fill();

      // 瞳孔高光
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w*0.24, h*0.42, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.74, h*0.42, 2.5, 0, Math.PI*2); ctx.fill();

      // 上眼线
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(w*0.25, h*0.44, 26, 17, 0, Math.PI*0.15, Math.PI*0.85); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w*0.75, h*0.44, 26, 17, 0, Math.PI*0.15, Math.PI*0.85); ctx.stroke();

      // 下睫毛（淡）
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(w*0.25, h*0.45, 24, 16, 0, Math.PI*0.9, Math.PI*1.1); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w*0.75, h*0.45, 24, 16, 0, Math.PI*0.9, Math.PI*1.1); ctx.stroke();

      // === 鼻子 ===
      ctx.fillStyle = scheme.skinDark;
      ctx.beginPath(); ctx.ellipse(w*0.5, h*0.52, 10, 6, 0, 0, Math.PI*2); ctx.fill();
      // 鼻梁阴影
      const noseGrad = ctx.createLinearGradient(w*0.5, h*0.4, w*0.5, h*0.55);
      noseGrad.addColorStop(0, 'rgba(0,0,0,0)');
      noseGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
      noseGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = noseGrad;
      ctx.beginPath(); ctx.moveTo(w*0.45, h*0.4); ctx.lineTo(w*0.55, h*0.4);
      ctx.lineTo(w*0.53, h*0.54); ctx.lineTo(w*0.47, h*0.54); ctx.closePath(); ctx.fill();

      // 鼻孔
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.arc(w*0.47, h*0.54, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.53, h*0.54, 3, 0, Math.PI*2); ctx.fill();

      // === 嘴 ===
      ctx.fillStyle = '#c96b7a';
      ctx.beginPath();
      ctx.moveTo(w*0.35, h*0.64);
      ctx.quadraticCurveTo(w*0.42, h*0.66, w*0.5, h*0.65);
      ctx.quadraticCurveTo(w*0.58, h*0.66, w*0.65, h*0.64);
      ctx.quadraticCurveTo(w*0.58, h*0.70, w*0.5, h*0.69);
      ctx.quadraticCurveTo(w*0.42, h*0.70, w*0.35, h*0.64);
      ctx.fill();

      // 唇线
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w*0.35, h*0.64);
      ctx.quadraticCurveTo(w*0.5, h*0.62, w*0.65, h*0.64);
      ctx.stroke();

      // 唇中缝
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(w*0.38, h*0.65);
      ctx.quadraticCurveTo(w*0.5, h*0.67, w*0.62, h*0.65);
      ctx.stroke();

      // === 面部轮廓阴影（颧骨下方） ===
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.beginPath();
      ctx.moveTo(w*0.15, h*0.5); ctx.quadraticCurveTo(w*0.2, h*0.58, w*0.3, h*0.56);
      ctx.lineTo(w*0.3, h*0.52); ctx.quadraticCurveTo(w*0.2, h*0.54, w*0.15, h*0.48);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w*0.85, h*0.5); ctx.quadraticCurveTo(w*0.8, h*0.58, w*0.7, h*0.56);
      ctx.lineTo(w*0.7, h*0.52); ctx.quadraticCurveTo(w*0.8, h*0.54, w*0.85, h*0.48);
      ctx.closePath(); ctx.fill();

      // === 眉毛上的细微阴影 ===
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(w*0.17, h*0.30, w*0.2, 6);
      ctx.fillRect(w*0.63, h*0.30, w*0.2, 6);
    });
  },

  // ============ 身体前贴图（512×1024，T恤/夹克）============

  getBodyFrontTexture(char, scheme) {
    const key = `bodyFront_char_${char.id}`;
    return this._cached(key, 512, 1024, (ctx, w, h) => {
      // 底色
      ctx.fillStyle = scheme.top;
      ctx.fillRect(0, 0, w, h);

      // 布料纹理（细微横纹）
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random()*0.02})`;
        ctx.fillRect(0, y, w, 1);
      }

      // 中央褶皱线
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w*0.5, h*0.05); ctx.lineTo(w*0.5, h*0.95); ctx.stroke();

      // 两侧褶皱
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(w*0.3, h*0.1); ctx.quadraticCurveTo(w*0.35, h*0.5, w*0.28, h*0.9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*0.7, h*0.1); ctx.quadraticCurveTo(w*0.65, h*0.5, w*0.72, h*0.9); ctx.stroke();

      // === 领口 ===
      ctx.fillStyle = scheme.accent;
      ctx.beginPath();
      ctx.moveTo(w*0.25, h*0.02);
      ctx.quadraticCurveTo(w*0.5, h*0.12, w*0.75, h*0.02);
      ctx.quadraticCurveTo(w*0.78, h*0.08, w*0.72, h*0.10);
      ctx.quadraticCurveTo(w*0.5, h*0.18, w*0.28, h*0.10);
      ctx.quadraticCurveTo(w*0.22, h*0.08, w*0.25, h*0.02);
      ctx.fill();

      // 领口内圈
      ctx.fillStyle = scheme.topDark;
      ctx.beginPath();
      ctx.moveTo(w*0.30, h*0.03);
      ctx.quadraticCurveTo(w*0.5, h*0.10, w*0.70, h*0.03);
      ctx.quadraticCurveTo(w*0.72, h*0.06, w*0.68, h*0.08);
      ctx.quadraticCurveTo(w*0.5, h*0.14, w*0.32, h*0.08);
      ctx.quadraticCurveTo(w*0.28, h*0.06, w*0.30, h*0.03);
      ctx.fill();

      // === 纽扣/拉链线 ===
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w*0.5, h*0.15); ctx.lineTo(w*0.5, h*0.55); ctx.stroke();

      // 纽扣
      for (let y = 0.18; y < 0.55; y += 0.08) {
        ctx.fillStyle = scheme.accent;
        ctx.beginPath(); ctx.arc(w*0.5, h*y, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(w*0.5-1, h*y-1, 1.5, 0, Math.PI*2); ctx.fill();
      }

      // === 左胸口袋 ===
      ctx.fillStyle = scheme.topDark;
      ctx.fillRect(w*0.28, h*0.18, w*0.12, h*0.11);
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 1;
      ctx.strokeRect(w*0.28, h*0.18, w*0.12, h*0.11);
      // 口袋盖
      ctx.fillStyle = scheme.topDark;
      ctx.beginPath();
      ctx.moveTo(w*0.27, h*0.18); ctx.lineTo(w*0.41, h*0.18);
      ctx.lineTo(w*0.41, h*0.20); ctx.lineTo(w*0.27, h*0.20);
      ctx.closePath(); ctx.fill();

      // === 角色特有装饰 ===
      this._drawCharacterAccents(ctx, w, h, char, scheme);
    });
  },

  // ============ 身体后贴图 ============

  getBodyBackTexture(char, scheme) {
    const key = `bodyBack_char_${char.id}`;
    return this._cached(key, 512, 1024, (ctx, w, h) => {
      ctx.fillStyle = scheme.top;
      ctx.fillRect(0, 0, w, h);

      // 布料纹理
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random()*0.02})`;
        ctx.fillRect(0, y, w, 1);
      }

      // 背部中缝
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w*0.5, h*0.05); ctx.lineTo(w*0.5, h*0.95); ctx.stroke();

      // 肩胛骨区域褶皱
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(w*0.3, h*0.15); ctx.quadraticCurveTo(w*0.35, h*0.3, w*0.45, h*0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*0.7, h*0.15); ctx.quadraticCurveTo(w*0.65, h*0.3, w*0.55, h*0.25); ctx.stroke();

      // 领口（后面）
      ctx.fillStyle = scheme.accent;
      ctx.beginPath();
      ctx.moveTo(w*0.30, h*0.02);
      ctx.quadraticCurveTo(w*0.5, h*0.08, w*0.70, h*0.02);
      ctx.quadraticCurveTo(w*0.68, h*0.05, w*0.50, h*0.10);
      ctx.quadraticCurveTo(w*0.32, h*0.05, w*0.30, h*0.02);
      ctx.fill();
    });
  },

  // ============ 手臂贴图 ============

  getArmTexture(char, scheme) {
    const key = `arm_char_${char.id}`;
    return this._cached(key, 256, 512, (ctx, w, h) => {
      ctx.fillStyle = scheme.top;
      ctx.fillRect(0, 0, w, h);

      // 袖子纹理
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random()*0.02})`;
        ctx.fillRect(0, y, w, 1);
      }

      // 袖口
      ctx.fillStyle = scheme.accent;
      ctx.fillRect(0, h*0.85, w, h*0.08);

      // 肘部褶皱
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h*0.45); ctx.quadraticCurveTo(w*0.5, h*0.43, w, h*0.45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h*0.50); ctx.quadraticCurveTo(w*0.5, h*0.48, w, h*0.50); ctx.stroke();
    });
  },

  // ============ 腿部贴图 ============

  getLegTexture(char, scheme) {
    const key = `leg_char_${char.id}`;
    return this._cached(key, 256, 512, (ctx, w, h) => {
      ctx.fillStyle = scheme.bottom;
      ctx.fillRect(0, 0, w, h);

      // 裤子纹理
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random()*0.02})`;
        ctx.fillRect(0, y, w, 1);
      }

      // 裤线
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w*0.5, 0); ctx.lineTo(w*0.5, h); ctx.stroke();

      // 膝盖褶皱
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 0.8;
      for (let ky = 0.4; ky < 0.55; ky += 0.03) {
        ctx.beginPath();
        ctx.moveTo(w*0.2, h*ky); ctx.quadraticCurveTo(w*0.5, h*(ky+0.01), w*0.8, h*ky);
        ctx.stroke();
      }

      // 裤脚
      ctx.fillStyle = scheme.bottomDark;
      ctx.fillRect(0, h*0.90, w, h*0.10);
    });
  },

  // ============ 鞋子贴图 ============

  getShoeTexture(char, scheme) {
    const key = `shoe_char_${char.id}`;
    return this._cached(key, 256, 256, (ctx, w, h) => {
      ctx.fillStyle = scheme.shoe;
      ctx.fillRect(0, 0, w, h);

      // 鞋面纹理（帆布/皮革感）
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random()*0.03})`;
        ctx.fillRect(0, y, w, 1);
      }

      // 鞋带区（白色）
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(w*0.2, h*0.1); ctx.lineTo(w*0.8, h*0.1);
      ctx.lineTo(w*0.85, h*0.5); ctx.lineTo(w*0.15, h*0.5);
      ctx.closePath(); ctx.fill();

      // 鞋带交叉线
      ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const y = h*(0.15 + i*0.06);
        ctx.beginPath();
        if (i % 2 === 0) {
          ctx.moveTo(w*0.2, y); ctx.lineTo(w*0.8, y+1);
        } else {
          ctx.moveTo(w*0.8, y); ctx.lineTo(w*0.2, y+1);
        }
        ctx.stroke();
      }

      // 鞋头（白色）
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.moveTo(w*0.1, h*0.55);
      ctx.quadraticCurveTo(w*0.1, h*0.9, w*0.5, h*0.95);
      ctx.quadraticCurveTo(w*0.9, h*0.9, w*0.9, h*0.55);
      ctx.quadraticCurveTo(w*0.7, h*0.7, w*0.5, h*0.72);
      ctx.quadraticCurveTo(w*0.3, h*0.7, w*0.1, h*0.55);
      ctx.fill();

      // 鞋底
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, h*0.88, w, h*0.12);

      // 侧面品牌标志线
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w*0.15, h*0.55);
      ctx.quadraticCurveTo(w*0.5, h*0.65, w*0.85, h*0.55);
      ctx.stroke();
    });
  },

  // ============ 角色特有装饰 ============

  _drawCharacterAccents(ctx, w, h, char, scheme) {
    const id = char.id;

    if (id === 1) {
      // 普通人：简单条纹T恤
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = 0.35; y < 0.65; y += 0.06) {
        ctx.fillRect(w*0.2, h*y, w*0.6, h*0.02);
      }
    } else if (id === 2) {
      // 学霸：格纹衬衫感
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let y = 0.2; y < 0.8; y += 0.06) ctx.fillRect(w*0.15, h*y, w*0.7, h*0.015);
      for (let x = 0.2; x < 0.8; x += 0.06) ctx.fillRect(w*x, h*0.2, w*0.015, h*0.6);
    } else if (id === 3) {
      // 运动员：运动背心号码
      ctx.fillStyle = scheme.accent;
      ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
      ctx.fillText('07', w*0.5, h*0.55);
    } else if (id === 4) {
      // 退伍军人：勋章/徽章
      ctx.fillStyle = scheme.accent;
      ctx.beginPath(); ctx.arc(w*0.5, h*0.35, 15, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w*0.5, h*0.35, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = scheme.accent;
      ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      ctx.fillText('★', w*0.5, h*0.355);
    } else if (id === 5) {
      // 极简主义者：纯色无装饰（已经是最简）
    } else if (id === 6) {
      // 工会成员：工装口袋
      ctx.fillStyle = scheme.bottom;
      ctx.fillRect(w*0.30, h*0.40, w*0.15, h*0.12);
      ctx.fillRect(w*0.55, h*0.42, w*0.15, h*0.12);
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 1;
      ctx.strokeRect(w*0.30, h*0.40, w*0.15, h*0.12);
      ctx.strokeRect(w*0.55, h*0.42, w*0.15, h*0.12);
    } else if (id === 7) {
      // 移民：民族风围巾图案
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(w*0.2, h*(0.3 + i*0.1));
        ctx.quadraticCurveTo(w*0.5, h*(0.25 + i*0.1), w*0.8, h*(0.3 + i*0.1));
        ctx.lineWidth = 2; ctx.strokeStyle = scheme.accent; ctx.stroke();
      }
    } else if (id === 9) {
      // 辍学创业者：连帽衫抽绳
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w*0.45, h*0.12); ctx.lineTo(w*0.45, h*0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*0.55, h*0.12); ctx.lineTo(w*0.55, h*0.25); ctx.stroke();
      // 绳头
      ctx.fillStyle = scheme.accent;
      ctx.beginPath(); ctx.arc(w*0.45, h*0.26, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.55, h*0.26, 3, 0, Math.PI*2); ctx.fill();
    } else if (id === 10) {
      // 丁克夫妇：精致领结
      ctx.fillStyle = scheme.accent;
      ctx.beginPath();
      ctx.moveTo(w*0.5, h*0.16);
      ctx.lineTo(w*0.38, h*0.10); ctx.lineTo(w*0.38, h*0.22); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w*0.5, h*0.16);
      ctx.lineTo(w*0.62, h*0.10); ctx.lineTo(w*0.62, h*0.22); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = scheme.accent;
      ctx.beginPath(); ctx.arc(w*0.5, h*0.16, 5, 0, Math.PI*2); ctx.fill();
    } else if (id === 11) {
      // 人脉大师：西装领
      ctx.fillStyle = scheme.topDark;
      ctx.beginPath();
      ctx.moveTo(w*0.50, h*0.15); ctx.lineTo(w*0.30, h*0.35);
      ctx.lineTo(w*0.50, h*0.25); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w*0.50, h*0.15); ctx.lineTo(w*0.70, h*0.35);
      ctx.lineTo(w*0.50, h*0.25); ctx.closePath(); ctx.fill();
      // 口袋方巾
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(w*0.30, h*0.22); ctx.lineTo(w*0.30, h*0.15);
      ctx.lineTo(w*0.35, h*0.18); ctx.closePath(); ctx.fill();
    } else if (id === 12) {
      // 博士学者：毛衣花纹
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = 0.25; y < 0.7; y += 0.04) {
        ctx.fillRect(w*0.2, h*y, w*0.6, h*0.015);
      }
      // 菱形花纹
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      for (let dy = 0.25; dy < 0.65; dy += 0.08) {
        ctx.beginPath();
        ctx.moveTo(w*0.5, h*dy); ctx.lineTo(w*0.35, h*(dy+0.04));
        ctx.lineTo(w*0.5, h*(dy+0.08)); ctx.lineTo(w*0.65, h*(dy+0.04));
        ctx.closePath(); ctx.stroke();
      }
    } else if (id === 14) {
      // 零工：潮牌大Logo
      ctx.fillStyle = scheme.accent;
      ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
      ctx.fillText('GIG', w*0.5, h*0.45);
    } else if (id === 16) {
      // 幸运星：四叶草
      ctx.fillStyle = scheme.accent;
      this._drawClover(ctx, w*0.5, h*0.4, 20);
    } else if (id === 18) {
      // 富二代：名牌Logo
      ctx.fillStyle = scheme.accent;
      ctx.font = 'bold italic 28px serif'; ctx.textAlign = 'center';
      ctx.fillText('LUXE', w*0.5, h*0.45);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      ctx.strokeText('LUXE', w*0.5, h*0.45);
    } else if (id === 19) {
      // 网红：心形+点赞
      ctx.fillStyle = scheme.accent;
      this._drawHeart(ctx, w*0.4, h*0.4, 12);
      ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
      ctx.fillText('❤', w*0.6, h*0.45);
    } else if (id === 20) {
      // 自学天才：代码风格
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '14px monospace'; ctx.textAlign = 'left';
      ctx.fillText('while(alive) {', w*0.25, h*0.35);
      ctx.fillText('  learn();', w*0.28, h*0.42);
      ctx.fillText('  build();', w*0.28, h*0.49);
      ctx.fillText('}', w*0.25, h*0.56);
    }
  },

  _drawClover(ctx, cx, cy, size) {
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 2;
      const x = cx + Math.cos(angle) * size * 0.5;
      const y = cy + Math.sin(angle) * size * 0.5;
      ctx.beginPath(); ctx.arc(x, y, size*0.45, 0, Math.PI*2); ctx.fill();
    }
  },

  _drawHeart(ctx, cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size*0.3);
    ctx.bezierCurveTo(cx, cy - size*0.5, cx - size, cy - size*0.5, cx - size, cy + size*0.1);
    ctx.bezierCurveTo(cx - size, cy + size*0.6, cx, cy + size, cx, cy + size*1.2);
    ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size*0.6, cx + size, cy + size*0.1);
    ctx.bezierCurveTo(cx + size, cy - size*0.5, cx, cy - size*0.5, cx, cy + size*0.3);
    ctx.fill();
  },
};

window.CharacterTextures = CharacterTextures;
