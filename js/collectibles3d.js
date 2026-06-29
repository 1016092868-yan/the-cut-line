// ============================================================
// collectibles3d.js — 3D收集品（真正的3D模型 + 贴图）
// v3: 不再用平面纸片，每个道具都有体积感的3D造型
// ============================================================

const Collectibles3D = {
  pool: [], activeList: [], spawnTimer: 0, density: 1.5,

  init(level, worldParams) {
    this.density = worldParams.collectibleDensity;
    const group = Game3D.collectibleGroup;
    while (group.children.length > 0) {
      const c = group.children[0];
      if (c.children) c.children.forEach(ch => {
        if (ch.material) { if (ch.material.map) ch.material.map.dispose(); ch.material.dispose(); }
        if (ch.geometry) ch.geometry.dispose();
      });
      group.remove(c);
    }
    this.pool = []; this.activeList = []; this.spawnTimer = 0;

    // 5种收集品定义
    const typeDefs = [
      { name: 'cash-bill', effect: 0, color: 0x4CAF50, value: 500, build: this._buildCash },
      { name: 'energy-drink', effect: 1, color: 0x2196F3, value: 15, build: this._buildEnergyDrink },
      { name: 'stock-option', effect: 2, color: 0xFFA000, value: 1.5, build: this._buildStock },
      { name: 'shield-token', effect: 3, color: 0x90A4AE, value: 1, build: this._buildShield },
      { name: 'skill-book', effect: 4, color: 0x9C27B0, value: 0.02, build: this._buildBook },
    ];

    for (let i = 0; i < 25; i++) {
      const td = typeDefs[i % typeDefs.length];
      const itemGroup = td.build(td);
      itemGroup.visible = false;
      Game3D.collectibleGroup.add(itemGroup);

      this.pool.push({
        group: itemGroup,
        active: false, type: td.name, effect: td.effect,
        picked: false, lane: 0, color: td.color, value: td.value
      });
    }
  },

  // ============ 钞票：多层叠放的3D钞票 ============
  _buildCash(td) {
    const group = new THREE.Group();

    // 多层钞票堆叠
    const billMat = new THREE.MeshToonMaterial({ color: 0x4CAF50 });
    const billMat2 = new THREE.MeshToonMaterial({ color: 0x388E3C });
    const billMat3 = new THREE.MeshToonMaterial({ color: 0x2E7D32 });

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(0.65, 0.02, 0.35, 2, 1, 2);
      const mat = i === 0 ? billMat : (i % 2 ? billMat2 : billMat3);
      const bill = new THREE.Mesh(geo, mat);
      bill.position.y = i * 0.03;
      bill.rotation.y = (i - 2) * 0.08;
      bill.rotation.x = (i - 2) * 0.04;
      bill.castShadow = true;
      group.add(bill);
    }

    // 绑带
    const bandGeo = new THREE.BoxGeometry(0.10, 0.18, 0.38);
    const bandMat = new THREE.MeshToonMaterial({ color: 0xcccccc });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0, 0.08, 0);
    group.add(band);

    // 底部发光
    const glowGeo = new THREE.RingGeometry(0.25, 0.45, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 能量饮料：3D易拉罐 ============
  _buildEnergyDrink(td) {
    const group = new THREE.Group();

    // 罐身
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.60, 16);
    const bodyMat = new THREE.MeshToonMaterial({ color: 0x1565C0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.30;
    body.castShadow = true;
    group.add(body);

    // 罐身装饰条纹
    const stripeGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.04, 16, 1, true);
    const stripeMat = new THREE.MeshToonMaterial({ color: 0xFFD700 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.45;
    group.add(stripe);

    const stripe2Geo = new THREE.CylinderGeometry(0.21, 0.21, 0.04, 16, 1, true);
    const stripe2 = new THREE.Mesh(stripe2Geo, stripeMat);
    stripe2.position.y = 0.18;
    group.add(stripe2);

    // 顶盖
    const topGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.06, 16);
    const topMat = new THREE.MeshToonMaterial({ color: 0xcccccc, metalness: 0.5 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.62;
    group.add(top);

    // 拉环
    const ringGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 16);
    const ring = new THREE.Mesh(ringGeo, topMat);
    ring.position.y = 0.66;
    group.add(ring);

    // 底部发光
    const glowGeo = new THREE.RingGeometry(0.18, 0.35, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 股票期权：3D上升箭头 ============
  _buildStock(td) {
    const group = new THREE.Group();

    // 底座
    const baseGeo = new THREE.BoxGeometry(0.45, 0.08, 0.35);
    const baseMat = new THREE.MeshToonMaterial({ color: 0x424242 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.04;
    base.castShadow = true;
    group.add(base);

    // 箭头杆
    const shaftGeo = new THREE.BoxGeometry(0.10, 0.55, 0.10);
    const shaftMat = new THREE.MeshToonMaterial({ color: 0xFFA000 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.30;
    shaft.castShadow = true;
    group.add(shaft);

    // 箭头尖
    const tipGeo = new THREE.ConeGeometry(0.15, 0.25, 8, 8);
    const tipMat = new THREE.MeshToonMaterial({ color: 0x4CAF50 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 0.65;
    tip.castShadow = true;
    group.add(tip);

    // 百分比标签面
    const labelGeo = new THREE.PlaneGeometry(0.30, 0.20);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, 0.42, 0.15);
    group.add(label);

    // 底部发光
    const glowGeo = new THREE.RingGeometry(0.18, 0.35, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.02;
    group.add(glow);

    return group;
  },

  // ============ 护盾令牌：3D六边形盾牌 ============
  _buildShield(td) {
    const group = new THREE.Group();

    // 六边形盾牌
    const shieldShape = new THREE.Shape();
    const r = 0.30;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI / 3) - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shieldShape.moveTo(x, y);
      else shieldShape.lineTo(x, y);
    }
    shieldShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMat = new THREE.MeshToonMaterial({ color: 0x90A4AE, metalness: 0.4 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.z = -0.04;
    shield.castShadow = true;
    group.add(shield);

    // 边框
    const edgeShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI / 3) - Math.PI / 2;
      const x = Math.cos(angle) * (r + 0.02);
      const y = Math.sin(angle) * (r + 0.02);
      if (i === 0) edgeShape.moveTo(x, y);
      else edgeShape.lineTo(x, y);
    }
    edgeShape.closePath();
    const edgeGeo = new THREE.ExtrudeGeometry(edgeShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 });
    const edgeMat = new THREE.MeshToonMaterial({ color: 0xFFD700, metalness: 0.6 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.z = -0.03;
    group.add(edge);

    // 中心S标志
    const sGeo = new THREE.SphereGeometry(0.10, 8, 8);
    const sMat = new THREE.MeshToonMaterial({ color: 0x2196F3 });
    const sMark = new THREE.Mesh(sGeo, sMat);
    sMark.position.z = 0.07;
    group.add(sMark);

    // 底部发光
    const glowGeo = new THREE.RingGeometry(0.2, 0.4, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.35;
    group.add(glow);

    return group;
  },

  // ============ 技能书：3D书本 ============
  _buildBook(td) {
    const group = new THREE.Group();

    // 书脊
    const spineGeo = new THREE.BoxGeometry(0.06, 0.40, 0.28);
    const spineMat = new THREE.MeshToonMaterial({ color: 0x5D4037 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.castShadow = true;
    group.add(spine);

    // 封面
    const coverGeo = new THREE.BoxGeometry(0.30, 0.42, 0.04);
    const coverMat = new THREE.MeshToonMaterial({ color: 0x9C27B0 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.set(0.16, 0.01, 0);
    cover.castShadow = true;
    group.add(cover);

    // 封底
    const backGeo = new THREE.BoxGeometry(0.30, 0.42, 0.04);
    const backMat = new THREE.MeshToonMaterial({ color: 0x7B1FA2 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(-0.16, -0.01, 0);
    back.castShadow = true;
    group.add(back);

    // 书页
    for (let i = 0; i < 4; i++) {
      const pageGeo = new THREE.BoxGeometry(0.28, 0.38, 0.01);
      const pageMat = new THREE.MeshToonMaterial({ color: 0xFFF8E1 });
      const page = new THREE.Mesh(pageGeo, pageMat);
      page.position.set(0.01 * i, 0, 0);
      group.add(page);
    }

    // 书名标签
    const labelGeo = new THREE.PlaneGeometry(0.20, 0.08);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0.20, 0, 0);
    group.add(label);

    // 底部发光
    const glowGeo = new THREE.RingGeometry(0.15, 0.32, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.22;
    group.add(glow);

    return group;
  },

  // ============ 运行时 ============

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnTimer = (0.5 + Math.random() * 1.0) / this.density; this.spawn(); }
    const speed = gd.speed;

    for (let i = this.activeList.length - 1; i >= 0; i--) {
      const col = this.activeList[i];
      col.group.position.z += speed * dt;
      col.group.rotation.y += dt * 2.5;
      col.group.position.y = 1.8 + Math.sin(Date.now() / 350 + i) * 0.35;

      if (!col.picked) {
        const dx = Math.abs(col.group.position.x - Player3D.currentLaneX);
        const dz = Math.abs(col.group.position.z - Player3D.worldZ);
        if (dx < 1.2 && dz < 1.2) {
          col.picked = true; gd.collectiblesPicked++; gd.totalCollectibles++;
          col.group.visible = false; col.active = false;
          this._applyEffect(col.effect, col.value);
          Effects3D.spawnCollectEffect(col.group.position);
          AudioFX.collect();
          SettlementPanel.recordCollect();
          this.activeList.splice(i, 1);
        }
      }
      if (col.group.position.z > 15) {
        col.group.visible = false; col.active = false; col.picked = false;
        this.activeList.splice(i, 1);
      }
    }
  },

  spawn() {
    const gd = GameState.gameData;
    for (const col of this.pool) {
      if (!col.active) {
        const lane = Math.floor(Math.random() * Math.min(gd.lanesOpen, 3));
        col.group.position.set(Game3D.getLaneX(lane), 1.8, -35 - Math.random() * 15);
        col.group.visible = true; col.active = true; col.picked = false; col.lane = lane;
        this.activeList.push(col); break;
      }
    }
  },

  _applyEffect(type, value) {
    const gd = GameState.gameData;
    switch (type) {
      case 0: gd.cash += value; break;
      case 1: gd.stamina = Math.min(gd.staminaMax, gd.stamina + value); break;
      case 2: gd.incomePerSec *= value; setTimeout(() => { gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; }, 8000); break;
      case 3: gd.shieldActive = true; break;
      case 4: gd.baseIncomePerSec *= (1 + value); gd.incomePerSec = gd.baseIncomePerSec * gd.incomeMult; break;
    }
    gd.netWorth = gd.cash + gd.loan;
  }
};

window.Collectibles3D = Collectibles3D;
