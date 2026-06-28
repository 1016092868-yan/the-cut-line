// ============================================================
// collectibles3d.js — 3D 收集品（图标升级版）
// 使用生成的图标纹理，玩家一眼可识别
// ============================================================

const Collectibles3D = {
  pool: [], activeList: [], spawnTimer: 0, density: 1.5,
  itemTextures: {},

  init(level, worldParams) {
    this.density = worldParams.collectibleDensity;
    const group = Game3D.collectibleGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.pool = []; this.activeList = []; this.spawnTimer = 0;

    // 加载图标纹理
    const iconNames = ['cash-bill', 'energy-drink', 'stock-option', 'shield-token', 'skill-book'];
    iconNames.forEach(name => {
      const tex = new THREE.TextureLoader().load('assets/items/item-' + name + '.png');
      tex.colorSpace = THREE.SRGBColorSpace;
      this.itemTextures[name] = tex;
    });

    // 5种收集品定义（现在用图标plane）
    const typeDefs = [
      { name: 'cash-bill', effect: 0, color: 0x4CAF50, value: 500 },
      { name: 'energy-drink', effect: 1, color: 0x2196F3, value: 15 },
      { name: 'stock-option', effect: 2, color: 0xFFA000, value: 1.5 },
      { name: 'shield-token', effect: 3, color: 0x90A4AE, value: 1 },
      { name: 'skill-book', effect: 4, color: 0x9C27B0, value: 0.02 },
    ];

    for (let i = 0; i < 25; i++) {
      const td = typeDefs[i % typeDefs.length];

      // 使用图标纹理的 plane + 背面发光底板
      const group = new THREE.Group();

      // 图标面片
      const geo = new THREE.PlaneGeometry(0.8, 0.8);
      const tex = this.itemTextures[td.name];
      const mat = tex
        ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        : new THREE.MeshBasicMaterial({ color: td.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
      const sprite = new THREE.Mesh(geo, mat);
      group.add(sprite);

      // 底部发光环
      const ringGeo = new THREE.TorusGeometry(0.4, 0.04, 6, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: td.color, transparent: true, opacity: 0.6, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.45;
      group.add(ring);

      group.visible = false;
      Game3D.collectibleGroup.add(group);

      this.pool.push({
        group, sprite, ring,
        active: false, type: td.name, effect: td.effect,
        picked: false, lane: 0, color: td.color, value: td.value
      });
    }
  },

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnTimer = (0.5 + Math.random() * 1.0) / this.density; this.spawn(); }
    const speed = gd.speed;

    for (let i = this.activeList.length - 1; i >= 0; i--) {
      const col = this.activeList[i];
      col.group.position.z += speed * dt;
      col.group.rotation.y += dt * 3;
      col.group.position.y = 1.8 + Math.sin(Date.now() / 350 + i) * 0.35;

      // 始终面向相机
      col.group.children[0].lookAt(Game3D.camera.position);

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
