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
      const group = new THREE.Group();

      // 3D几何体 + 底部光环（不用贴图plane）
      switch (td.name) {
        case 'cash-bill': {
          // 钞票堆叠
          for (let j = 0; j < 5; j++) {
            const billGeo = new THREE.BoxGeometry(0.55, 0.02, 0.30);
            const bill = new THREE.Mesh(billGeo, new THREE.MeshToonMaterial({ color: j === 0 ? 0x4CAF50 : 0x388E3C }));
            bill.position.y = j * 0.03;
            bill.rotation.y = (j - 2) * 0.06;
            bill.castShadow = true;
            group.add(bill);
          }
          // 绑带
          const bandGeo = new THREE.BoxGeometry(0.08, 0.16, 0.33);
          group.add(new THREE.Mesh(bandGeo, new THREE.MeshToonMaterial({ color: 0xeeeeee })));
          break;
        }
        case 'energy-drink': {
          // 易拉罐
          const canGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.55, 16);
          group.add(new THREE.Mesh(canGeo, new THREE.MeshToonMaterial({ color: 0x1565C0 })));
          // 拉环
          const ringGeo2 = new THREE.TorusGeometry(0.06, 0.012, 8, 16);
          const ring2 = new THREE.Mesh(ringGeo2, new THREE.MeshToonMaterial({ color: 0xcccccc }));
          ring2.position.y = 0.32;
          group.add(ring2);
          break;
        }
        case 'stock-option': {
          // 上升箭头
          const shaftGeo = new THREE.BoxGeometry(0.08, 0.45, 0.08);
          group.add(new THREE.Mesh(shaftGeo, new THREE.MeshToonMaterial({ color: 0xFFA000 })));
          const tipGeo = new THREE.ConeGeometry(0.14, 0.20, 8);
          const tip = new THREE.Mesh(tipGeo, new THREE.MeshToonMaterial({ color: 0x4CAF50 }));
          tip.position.y = 0.32;
          group.add(tip);
          break;
        }
        case 'shield-token': {
          // 六边形盾牌
          const shape = new THREE.Shape();
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI / 3) - Math.PI / 2;
            const px = Math.cos(angle) * 0.28;
            const py = Math.sin(angle) * 0.28;
            if (a === 0) shape.moveTo(px, py);
            else shape.lineTo(px, py);
          }
          shape.closePath();
          const extGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
          group.add(new THREE.Mesh(extGeo, new THREE.MeshToonMaterial({ color: 0x90A4AE, metalness: 0.3 })));
          break;
        }
        case 'skill-book': {
          // 书本
          const coverGeo = new THREE.BoxGeometry(0.28, 0.38, 0.04);
          group.add(new THREE.Mesh(coverGeo, new THREE.MeshToonMaterial({ color: 0x9C27B0 })));
          const spineGeo = new THREE.BoxGeometry(0.05, 0.38, 0.26);
          const spine = new THREE.Mesh(spineGeo, new THREE.MeshToonMaterial({ color: 0x5D4037 }));
          spine.position.x = -0.15;
          group.add(spine);
          // 书页
          for (let p = 0; p < 3; p++) {
            const pageGeo = new THREE.BoxGeometry(0.26, 0.35, 0.01);
            const page = new THREE.Mesh(pageGeo, new THREE.MeshToonMaterial({ color: 0xFFF8E1 }));
            page.position.x = 0.01 * p;
            group.add(page);
          }
          break;
        }
      }

      // 底部发光环
      const ringGeo3 = new THREE.RingGeometry(0.22, 0.38, 16);
      const ringMat3 = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false });
      const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
      ring3.rotation.x = -Math.PI / 2;
      ring3.position.y = -0.05;
      group.add(ring3);

      group.visible = false;
      Game3D.collectibleGroup.add(group);

      this.pool.push({
        group, ring: ring3,
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
