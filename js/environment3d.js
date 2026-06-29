// ============================================================
// environment3d.js — 5个世界3D环境（v3增强版）
// 更细腻的纹理 + 街景装饰物 + 世界独特氛围
// ============================================================

const Environment3D = {
  buildings: [], trees: [], lamps: [], props: [],

  init(worldId) {
    const group = Game3D.worldGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.buildings = []; this.trees = []; this.lamps = []; this.props = [];

    const configs = {
      1: {
        groundColor: 0x5a8f4a, bldColors: [0x8D6E63, 0xA1887F, 0xBCAAA4, 0xD7CCC8],
        windowColor: '#ffffcc', treeDensity: 0.5, grassColor: 0x66BB6A, sidewalkColor: 0xBDBDBD,
        props: ['bench', 'mailbox', 'trashcan'],
        skyTop: '#87CEEB', skyBot: '#C8E6C9'
      },
      2: {
        groundColor: 0x546e7a, bldColors: [0x37474F, 0x455A64, 0x546E7A, 0x607D8B],
        windowColor: '#bbdefb', treeDensity: 0.15, grassColor: 0x78909C, sidewalkColor: 0x90A4AE,
        props: ['bench', 'trashcan'],
        skyTop: '#90CAF9', skyBot: '#B0BEC5'
      },
      3: {
        groundColor: 0x8d6e63, bldColors: [0xFFAB91, 0xFFCC80, 0xFFE082, 0xFFF176],
        windowColor: '#ffe082', treeDensity: 0.4, grassColor: 0xA5D6A7, sidewalkColor: 0xBCAAA4,
        props: ['bench', 'mailbox', 'trashcan', 'flowerpot'],
        skyTop: '#FFCC80', skyBot: '#D7CCC8'
      },
      4: {
        groundColor: 0x311B92, bldColors: [0x4A148C, 0x6A1B9A, 0x7B1FA2, 0x9C27B0],
        windowColor: '#e1bee7', treeDensity: 0, grassColor: 0x4527A0, sidewalkColor: 0x5E35B1,
        props: ['neon_sign', 'trashcan'],
        skyTop: '#311B92', skyBot: '#1A237E'
      },
      5: {
        groundColor: 0x3E0000, bldColors: [0xB71C1C, 0xC62828, 0xD32F2F, 0xE53935],
        windowColor: '#ff0000', treeDensity: 0, grassColor: 0x4A0000, sidewalkColor: 0x620000,
        props: ['ruin', 'trashcan'],
        skyTop: '#B71C1C', skyBot: '#1B0000'
      }
    };
    const cfg = configs[worldId] || configs[1];

    // ===== 地面 =====
    const groundGeo = new THREE.PlaneGeometry(60, 200);
    const groundTex = this._buildGroundTex(cfg);
    groundTex.repeat.set(3, 10);
    const groundMat = new THREE.MeshToonMaterial({ map: groundTex });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.1, -60); ground.receiveShadow = true;
    group.add(ground);

    // ===== 人行道 =====
    for (let side = -1; side <= 1; side += 2) {
      const swGeo = new THREE.PlaneGeometry(3, 200);
      const swTex = this._buildSidewalkTex(cfg.sidewalkColor);
      swTex.repeat.set(1, 20);
      const swMat = new THREE.MeshToonMaterial({ map: swTex });
      const sw = new THREE.Mesh(swGeo, swMat);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(side * 12, 0.01, -60);
      sw.receiveShadow = true;
      group.add(sw);
    }

    // ===== 建筑 =====
    const brickTex = this._buildBrickTex(cfg.bldColors[0]);
    const glassTex = this._buildGlassTex(worldId === 4 ? 30 : 0);
    const windowTex = this._buildWindowTex(cfg.windowColor);

    for (let i = 0; i < 35; i++) {
      const side = (Math.random() > 0.5 ? 1 : -1);
      const z = -i * 7 - Math.random() * 4;
      const h = 4 + Math.random() * 14;
      const w = 1.5 + Math.random() * 2.5;
      const style = Math.random() < 0.33 ? 'brick' : (Math.random() < 0.5 ? 'glass' : 'window');

      const geo = new THREE.BoxGeometry(w, h, w, 2, 2, 2);
      let mat;
      if (style === 'brick') mat = new THREE.MeshToonMaterial({ map: brickTex });
      else if (style === 'glass') mat = new THREE.MeshToonMaterial({ map: glassTex });
      else mat = new THREE.MeshToonMaterial({ map: windowTex });

      const bld = new THREE.Mesh(geo, mat);
      bld.position.set(side * (10 + Math.random() * 5), h / 2, z);
      bld.castShadow = true; bld.receiveShadow = true;
      group.add(bld);
      this.buildings.push({ mesh: bld, side, z });

      // 屋顶装饰（空调外机/水箱）
      if (Math.random() < 0.3) {
        const acGeo = new THREE.BoxGeometry(w*0.4, 0.3, w*0.3);
        const acMat = new THREE.MeshToonMaterial({ color: 0x757575 });
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(bld.position.x + (Math.random()-0.5)*w*0.5, h + 0.15, bld.position.z + (Math.random()-0.5)*w*0.3);
        ac.castShadow = true;
        group.add(ac);
      }

      // 树木
      if (Math.random() < cfg.treeDensity) {
        const tx = side * (6 + Math.random() * 3);
        const tz = z + Math.random() * 5;
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.20, 2, 8);
        const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshToonMaterial({ color: 0x5D4037 }));
        trunk.position.set(tx, 1, tz); trunk.castShadow = true;
        group.add(trunk);

        // 多层树冠（更自然）
        for (let ci = 0; ci < 3; ci++) {
          const crownGeo = new THREE.SphereGeometry(0.8 + ci*0.2, 8, 6);
          const crown = new THREE.Mesh(crownGeo, new THREE.MeshToonMaterial({ color: 0x388E3C }));
          crown.position.set(tx + (ci-1)*0.2, 2.2 + ci*0.6, tz + (ci-1)*0.15);
          crown.scale.set(1, 0.6 + ci*0.15, 1);
          crown.castShadow = true;
          group.add(crown);
          this.trees.push({ mesh: crown, z: tz });
        }
        this.trees.push({ mesh: trunk, z: tz });
      }
    }

    // ===== 路灯 =====
    for (let i = 0; i < 12; i++) {
      const side = (i % 2 === 0 ? 1 : -1);
      const z = -i * 18;

      // 灯柱
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5, 8);
      const poleMat = new THREE.MeshToonMaterial({ color: 0x333333, metalness: 0.3 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(side * 8, 2.5, z); pole.castShadow = true;
      group.add(pole);

      // 灯臂
      const armGeo = new THREE.BoxGeometry(0.06, 0.06, 1.5);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(side * 7.3, 4.9, z);
      group.add(arm);

      // 灯罩
      const shadeGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.5, 8);
      const shadeMat = new THREE.MeshToonMaterial({ color: 0x444444, metalness: 0.5 });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(side * 6.5, 4.7, z);
      group.add(shade);

      // 灯泡
      const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const bulbMat = new THREE.MeshToonMaterial({ color: 0xffffcc, emissive: 0xffdd88, emissiveIntensity: 0.6 });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(side * 6.5, 4.5, z);
      group.add(bulb);

      this.lamps.push({ pole, arm, shade, bulb, z });
    }

    // ===== 街景装饰物 =====
    for (let i = 0; i < 20; i++) {
      const side = (Math.random() > 0.5 ? 1 : -1);
      const z = -i * 10 - Math.random() * 5;
      const propType = cfg.props[Math.floor(Math.random() * cfg.props.length)];

      if (propType === 'bench') this._addBench(group, side * 7.5, z);
      else if (propType === 'mailbox') this._addMailbox(group, side * 7, z);
      else if (propType === 'trashcan') this._addTrashcan(group, side * 6.5, z);
      else if (propType === 'flowerpot') this._addFlowerpot(group, side * 7, z);
      else if (propType === 'neon_sign') this._addNeonSign(group, side * 9, z, worldId);
      else if (propType === 'ruin') this._addRuin(group, side * 8, z);
    }
  },

  // ===== 纹理生成 =====

  _buildGroundTex(cfg) {
    const key = `ground_${cfg.groundColor}`;
    if (CharacterTextures._cache[key]) return CharacterTextures._cache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const col = '#' + cfg.groundColor.toString(16).padStart(6, '0');
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, 512, 512);
    // 沥青噪点
    for (let i = 0; i < 5000; i++) {
      const v = 20 + Math.random() * 30;
      ctx.fillStyle = `rgba(${v},${v},${v},0.3)`;
      ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
    }
    // 路面标记
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(0, y, 512, 4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    CharacterTextures._cache[key] = tex;
    return tex;
  },

  _buildSidewalkTex(colorHex) {
    const key = `sidewalk_${colorHex}`;
    if (CharacterTextures._cache[key]) return CharacterTextures._cache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const col = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, 256, 256);
    // 砖缝
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    CharacterTextures._cache[key] = tex;
    return tex;
  },

  _buildBrickTex(baseColor) {
    const key = `brick_${baseColor}`;
    if (CharacterTextures._cache[key]) return CharacterTextures._cache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const col = '#' + baseColor.toString(16).padStart(6, '0');
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, 256, 256);
    const brickW = 40, brickH = 16;
    for (let r = 0; r < 16; r++) {
      const offset = (r % 2) * brickW / 2;
      for (let c = 0; c < 8; c++) {
        const bx = c * brickW + offset;
        const by = r * brickH;
        ctx.fillStyle = `rgba(${80+Math.random()*40},${40+Math.random()*30},${20+Math.random()*20},0.5)`;
        ctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(bx + 1, by + 1, brickW - 2, brickH - 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    CharacterTextures._cache[key] = tex;
    return tex;
  },

  _buildGlassTex(blueShift) {
    const key = `glass_${blueShift}`;
    if (CharacterTextures._cache[key]) return CharacterTextures._cache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, `rgb(${40+blueShift},${80+blueShift},${120+blueShift})`);
    grad.addColorStop(0.5, `rgb(${60+blueShift},${100+blueShift},${140+blueShift})`);
    grad.addColorStop(1, `rgb(${40+blueShift},${80+blueShift},${120+blueShift})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);
    // 框架
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
    for (let x = 0; x < 256; x += 43) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
    for (let y = 0; y < 512; y += 51) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    CharacterTextures._cache[key] = tex;
    return tex;
  },

  _buildWindowTex(litColor) {
    const key = `window_${litColor}`;
    if (CharacterTextures._cache[key]) return CharacterTextures._cache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 256, 512);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 4; c++) {
        const lit = Math.random() > 0.3;
        ctx.fillStyle = lit ? litColor : '#1a1a1a';
        ctx.fillRect(c*64 + 4, r*64 + 4, 56, 56);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    CharacterTextures._cache[key] = tex;
    return tex;
  },

  // ===== 街景装饰 =====

  _addBench(group, x, z) {
    const benchGroup = new THREE.Group();
    // 座面
    const seatGeo = new THREE.BoxGeometry(1.8, 0.06, 0.35);
    const seatMat = new THREE.MeshToonMaterial({ color: 0x5D4037 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.35; seat.castShadow = true;
    benchGroup.add(seat);
    // 椅腿
    for (let lx = -0.7; lx <= 0.7; lx += 1.4) {
      for (let lz = -0.12; lz <= 0.12; lz += 0.24) {
        const legGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.35, 6);
        const leg = new THREE.Mesh(legGeo, seatMat);
        leg.position.set(lx, 0.17, lz); leg.castShadow = true;
        benchGroup.add(leg);
      }
    }
    benchGroup.position.set(x, 0, z);
    group.add(benchGroup);
    this.props.push({ mesh: benchGroup, z });
  },

  _addMailbox(group, x, z) {
    const mbGroup = new THREE.Group();
    // 支柱
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.0, 8);
    const pole = new THREE.Mesh(poleGeo, new THREE.MeshToonMaterial({ color: 0x616161, metalness: 0.5 }));
    pole.position.y = 0.5; pole.castShadow = true;
    mbGroup.add(pole);
    // 信箱
    const boxGeo = new THREE.BoxGeometry(0.3, 0.35, 0.25);
    const box = new THREE.Mesh(boxGeo, new THREE.MeshToonMaterial({ color: 0x1565C0 }));
    box.position.y = 1.1; box.castShadow = true;
    mbGroup.add(box);
    mbGroup.position.set(x, 0, z);
    group.add(mbGroup);
    this.props.push({ mesh: mbGroup, z });
  },

  _addTrashcan(group, x, z) {
    const tcGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.6, 12);
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshToonMaterial({ color: 0x4CAF50, metalness: 0.3 }));
    body.position.y = 0.3; body.castShadow = true;
    tcGroup.add(body);
    const lidGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12);
    const lid = new THREE.Mesh(lidGeo, new THREE.MeshToonMaterial({ color: 0x388E3C, metalness: 0.3 }));
    lid.position.y = 0.62;
    tcGroup.add(lid);
    tcGroup.position.set(x, 0, z);
    group.add(tcGroup);
    this.props.push({ mesh: tcGroup, z });
  },

  _addFlowerpot(group, x, z) {
    const fpGroup = new THREE.Group();
    const potGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.35, 8);
    const pot = new THREE.Mesh(potGeo, new THREE.MeshToonMaterial({ color: 0xD84315 }));
    pot.position.y = 0.17; pot.castShadow = true;
    fpGroup.add(pot);
    // 花
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6);
    const stem = new THREE.Mesh(stemGeo, new THREE.MeshToonMaterial({ color: 0x4CAF50 }));
    stem.position.y = 0.4;
    fpGroup.add(stem);
    const flowerGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const flower = new THREE.Mesh(flowerGeo, new THREE.MeshToonMaterial({ color: 0xFF4081 }));
    flower.position.y = 0.55;
    fpGroup.add(flower);
    fpGroup.position.set(x, 0, z);
    group.add(fpGroup);
    this.props.push({ mesh: fpGroup, z });
  },

  _addNeonSign(group, x, z, worldId) {
    const texts = ['OPEN', '24/7', 'BAR', 'HOTEL', 'CLUB'];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const signGeo = new THREE.BoxGeometry(1.2, 0.4, 0.06);
    const neonColors = [0xFF4081, 0x00E5FF, 0xFFEA00, 0x76FF03, 0xFF1744];
    const signMat = new THREE.MeshToonMaterial({
      color: neonColors[Math.floor(Math.random()*neonColors.length)],
      emissive: neonColors[Math.floor(Math.random()*neonColors.length)],
      emissiveIntensity: 0.8
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, 3 + Math.random()*2, z);
    group.add(sign);
    this.props.push({ mesh: sign, z });
  },

  _addRuin(group, x, z) {
    const ruinGroup = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.8, 0.5 + Math.random()*0.8, 0.6);
    const mat = new THREE.MeshToonMaterial({ color: 0x616161 });
    const piece = new THREE.Mesh(geo, mat);
    piece.rotation.z = (Math.random() - 0.5) * 0.5;
    piece.rotation.x = (Math.random() - 0.5) * 0.3;
    piece.position.y = geo.parameters.height / 2;
    piece.castShadow = true;
    ruinGroup.add(piece);
    ruinGroup.position.set(x, 0, z);
    group.add(ruinGroup);
    this.props.push({ mesh: ruinGroup, z });
  },

  // ===== 运行时滚动 =====

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    const speed = gd.speed * dt;
    const cycle = 245;

    for (const b of this.buildings) { b.mesh.position.z += speed; if (b.mesh.position.z > 20) b.mesh.position.z -= cycle; }
    for (const t of this.trees) { t.mesh.position.z += speed; if (t.mesh.position.z > 20) t.mesh.position.z -= cycle; }
    for (const l of this.lamps) {
      l.pole.position.z += speed; if (l.pole.position.z > 20) l.pole.position.z -= 216;
      if (l.arm) { l.arm.position.z += speed; if (l.arm.position.z > 20) l.arm.position.z -= 216; }
      if (l.shade) { l.shade.position.z += speed; if (l.shade.position.z > 20) l.shade.position.z -= 216; }
      l.bulb.position.z += speed; if (l.bulb.position.z > 20) l.bulb.position.z -= 216;
    }
    for (const p of this.props) { p.mesh.position.z += speed; if (p.mesh.position.z > 20) p.mesh.position.z -= cycle; }
  }
};

window.Environment3D = Environment3D;
