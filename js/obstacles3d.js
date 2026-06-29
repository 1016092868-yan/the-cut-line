// ============================================================
// obstacles3d.js — 3D障碍物（语义化造型 + 贴图）
// v3: 每个障碍物有独特的3D造型，一眼可识别
// ============================================================

const Obstacles3D = {
  pool: [], activeList: [], spawnTimer: 0, spawnInterval: 1.5,

  init(level, worldParams) {
    this.pool = [];
    this.activeList = [];
    this.spawnTimer = 0;
    this.density = worldParams.obstacleDensity || 0.5;
    this.spawnInterval = 2.0 - this.density * 1.5;
    this.totalDistance = level.length;

    const group = Game3D.obstacleGroup;
    while (group.children.length > 0) {
      const c = group.children[0];
      if (c.children) c.children.forEach(ch => {
        if (ch.material) {
          if (ch.material.map) ch.material.map.dispose();
          if (Array.isArray(ch.material)) ch.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
          else ch.material.dispose();
        }
        if (ch.geometry) ch.geometry.dispose();
      });
      group.remove(c);
    }

    // 障碍物定义
    const typeDefs = [
      { name: 'barrier', color: 0xFDD835, damage: 5, dodgeType: 'slide', build: this._buildBarrier },
      { name: 'deadline', color: 0xE53935, damage: 5, dodgeType: 'jump', build: this._buildDeadline },
      { name: 'boss', color: 0xFF6F00, damage: 8, dodgeType: 'jump', build: this._buildBoss },
      { name: 'burnout', color: 0xFF1744, damage: 15, dodgeType: 'jump', build: this._buildBurnout },
      { name: 'crash', color: 0x880E4F, damage: 10, dodgeType: 'jump', build: this._buildCrash },
      { name: 'sick', color: 0x00C853, damage: 10, dodgeType: 'jump', build: this._buildSick },
    ];

    for (let i = 0; i < 25; i++) {
      const td = typeDefs[i % typeDefs.length];
      const obsGroup = td.build(td);
      obsGroup.visible = false;
      Game3D.obstacleGroup.add(obsGroup);

      this.pool.push({
        group: obsGroup,
        active: false, type: td.name, hit: false, lane: 0,
        damage: td.damage, color: td.color,
        dodgeType: td.dodgeType || 'jump'
      });
    }
  },

  // ============ 路障：黄色横杆（下滑躲避）============
  _buildBarrier(td) {
    const group = new THREE.Group();

    // 横杆
    const barGeo = new THREE.BoxGeometry(2.5, 0.2, 0.25);
    const barMat = new THREE.MeshToonMaterial({ color: 0xFDD835 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = 0.45;
    bar.castShadow = true;
    group.add(bar);

    // 条纹
    for (let x = -1.0; x < 1.0; x += 0.25) {
      const stripeGeo = new THREE.BoxGeometry(0.10, 0.22, 0.27);
      const stripeMat = new THREE.MeshToonMaterial({ color: 0x212121 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(x, 0.45, 0);
      group.add(stripe);
    }

    // 支撑柱
    for (let s = -1; s <= 1; s += 2) {
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
      const poleMat = new THREE.MeshToonMaterial({ color: 0x616161 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(s * 1.1, 0.22, 0);
      pole.castShadow = true;
      group.add(pole);
    }

    // 发光
    const glowGeo = new THREE.RingGeometry(0.6, 1.3, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 截止日期：文件堆 + 红色印章 ============
  _buildDeadline(td) {
    const group = new THREE.Group();

    // 文件堆叠
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.BoxGeometry(0.9 - i*0.05, 0.03, 0.7 - i*0.05);
      const shade = 0.7 + i * 0.05;
      const mat = new THREE.MeshToonMaterial({ color: new THREE.Color().setHSL(0.13, 0.1, shade) });
      const paper = new THREE.Mesh(geo, mat);
      paper.position.y = i * 0.04;
      paper.rotation.z = (i - 2.5) * 0.06;
      paper.rotation.x = (i - 2.5) * 0.03;
      paper.castShadow = true;
      group.add(paper);
    }

    // 红色"截止"印章
    const stampGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16);
    const stampMat = new THREE.MeshToonMaterial({ color: 0xE53935 });
    const stamp = new THREE.Mesh(stampGeo, stampMat);
    stamp.position.y = 0.28;
    stamp.rotation.x = Math.PI * 0.25;
    stamp.rotation.z = Math.PI * 0.15;
    group.add(stamp);

    // 发光
    const glowGeo = new THREE.RingGeometry(0.3, 0.55, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 坏老板：格子间挡板 + 领带 ============
  _buildBoss(td) {
    const group = new THREE.Group();

    // 办公桌挡板
    const panelGeo = new THREE.BoxGeometry(1.2, 0.9, 0.08);
    const panelMat = new THREE.MeshToonMaterial({ color: 0x90A4AE });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = 0.45;
    panel.castShadow = true;
    group.add(panel);

    // 挡板纹理线
    const lineGeo = new THREE.BoxGeometry(1.1, 0.02, 0.10);
    const lineMat = new THREE.MeshToonMaterial({ color: 0x607D8B });
    for (let y = 0.15; y < 0.85; y += 0.2) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, y, 0.04);
      group.add(line);
    }

    // 红色领带
    const tieGeo = new THREE.Shape();
    tieGeo.moveTo(-0.05, -0.35);
    tieGeo.lineTo(0.05, -0.35);
    tieGeo.lineTo(0.08, 0.2);
    tieGeo.lineTo(0, 0.35);
    tieGeo.lineTo(-0.08, 0.2);
    tieGeo.closePath();
    const tieExtSettings = { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 };
    const tieExtGeo = new THREE.ExtrudeGeometry(tieGeo, tieExtSettings);
    const tieMat = new THREE.MeshToonMaterial({ color: 0xE53935 });
    const tie = new THREE.Mesh(tieExtGeo, tieMat);
    tie.position.set(0, 0.45, 0.06);
    group.add(tie);

    // 发光
    const glowGeo = new THREE.RingGeometry(0.3, 0.65, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 过劳：火焰粒子 ============
  _buildBurnout(td) {
    const group = new THREE.Group();

    // 中央暗核
    const coreGeo = new THREE.SphereGeometry(0.20, 12, 12);
    const coreMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.35;
    group.add(core);

    // 火焰层（多层锥形）
    for (let i = 0; i < 3; i++) {
      const flameGeo = new THREE.ConeGeometry(0.3 + i*0.15, 0.5 + i*0.2, 8, 8);
      const hue = 0.02 + i * 0.02; // 红→橙
      const sat = 1.0 - i * 0.1;
      const light = 0.4 + i * 0.1;
      const flameMat = new THREE.MeshToonMaterial({ color: new THREE.Color().setHSL(hue, sat, light) });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.55 + i * 0.25;
      flame.rotation.z = i * 0.3;
      flame.rotation.x = i * 0.2;
      flame.castShadow = true;
      group.add(flame);
    }

    // 烟
    const smokeGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const smokeMat = new THREE.MeshToonMaterial({ color: 0x616161, transparent: true, opacity: 0.6 });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.y = 1.2;
    smoke.scale.set(1.5, 1, 1.5);
    group.add(smoke);

    // 发光
    const glowGeo = new THREE.RingGeometry(0.2, 0.5, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 市场崩盘：红色下跌箭头 + 破碎图表 ============
  _buildCrash(td) {
    const group = new THREE.Group();

    // 破碎的柱状图
    const barColors = [0x880E4F, 0xB71C1C, 0xC62828, 0xE53935];
    for (let i = 0; i < 4; i++) {
      const h = 0.15 + Math.random() * 0.3;
      const barGeo = new THREE.BoxGeometry(0.12, h, 0.12);
      const barMat = new THREE.MeshToonMaterial({ color: barColors[i] });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.25 + i * 0.16, h/2, 0);
      bar.rotation.z = -0.1 + Math.random() * 0.2;
      bar.castShadow = true;
      group.add(bar);
    }

    // 大红色下跌箭头
    const arrowShaftGeo = new THREE.BoxGeometry(0.10, 0.40, 0.10);
    const arrowMat = new THREE.MeshToonMaterial({ color: 0xE53935 });
    const shaft = new THREE.Mesh(arrowShaftGeo, arrowMat);
    shaft.position.y = 0.40;
    shaft.castShadow = true;
    group.add(shaft);

    const arrowTipGeo = new THREE.ConeGeometry(0.18, 0.25, 8, 8);
    const tip = new THREE.Mesh(arrowTipGeo, arrowMat);
    tip.position.y = 0.15;
    tip.rotation.z = Math.PI;
    tip.castShadow = true;
    group.add(tip);

    // 百分比标签
    const labelGeo = new THREE.PlaneGeometry(0.30, 0.15);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0xE53935, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0.15, 0.55, 0.1);
    group.add(label);

    // 发光
    const glowGeo = new THREE.RingGeometry(0.25, 0.5, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 生病：病毒形状 ============
  _buildSick(td) {
    const group = new THREE.Group();

    // 病毒核心
    const coreGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const coreMat = new THREE.MeshToonMaterial({ color: 0x00C853 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.40;
    core.castShadow = true;
    group.add(core);

    // 刺突
    for (let i = 0; i < 12; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.15, 6, 6);
      const spikeMat = new THREE.MeshToonMaterial({ color: 0x76FF03 });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(
        0.25 * Math.sin(phi) * Math.cos(theta),
        0.40 + 0.25 * Math.sin(phi) * Math.sin(theta),
        0.25 * Math.cos(phi)
      );
      spike.lookAt(new THREE.Vector3(
        0.25 * Math.sin(phi) * Math.cos(theta) * 2,
        0.40 + 0.25 * Math.sin(phi) * Math.sin(theta) * 2,
        0.25 * Math.cos(phi) * 2
      ));
      group.add(spike);
    }

    // 绿色粒子光晕
    for (let i = 0; i < 6; i++) {
      const pGeo = new THREE.SphereGeometry(0.04, 4, 4);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x76FF03, transparent: true, opacity: 0.5, depthWrite: false });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set((Math.random()-0.5)*0.7, 0.40+(Math.random()-0.5)*0.7, (Math.random()-0.5)*0.7);
      p.userData = { offset: Math.random()*Math.PI*2, speed: 1+Math.random()*2 };
      group.add(p);
    }

    // 发光
    const glowGeo = new THREE.RingGeometry(0.2, 0.45, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: td.color, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.05;
    group.add(glow);

    return group;
  },

  // ============ 运行时 ============

  update(dt) {
    const gd = GameState.gameData;
    if (!gd || !GameState.isRunning || GameState.isPaused) return;

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this._spawn();
    }

    const speed = gd.speed * dt;
    for (let i = this.activeList.length - 1; i >= 0; i--) {
      const obs = this.activeList[i];
      obs.group.position.z += speed;

      // 动态动画
      const time = Date.now() / 1000;
      if (obs.type === 'burnout') {
        obs.group.rotation.y += dt * 2;
        // 火焰缩放动画
        obs.group.children.forEach((c, ci) => {
          if (ci > 0 && ci < 4) c.scale.setScalar(1 + Math.sin(time*8 + ci)*0.1);
        });
      }
      if (obs.type === 'sick') {
        obs.group.rotation.y += dt * 1.5;
        // 粒子漂浮
        obs.group.children.forEach(c => {
          if (c.userData && c.userData.offset !== undefined) {
            c.position.y += Math.sin(time*c.userData.speed + c.userData.offset) * dt * 0.5;
          }
        });
      }
      if (obs.type === 'crash') {
        obs.group.rotation.z = Math.sin(time * 3) * 0.05;
      }

      // 碰撞检测
      if (!obs.hit) {
        const dx = Math.abs(obs.group.position.x - Player3D.currentLaneX);
        const dz = Math.abs(obs.group.position.z - Player3D.worldZ);
        const playerY = Player3D.bounceOffset;

        if (dx < 1.0 && dz < 1.5) {
          const isSlideType = obs.dodgeType === 'slide';
          const isJumpType = obs.dodgeType === 'jump';

          if (isSlideType) {
            if (Player3D.isSliding) {
              obs.hit = true; gd.dodgedObstacles++; gd.totalObstacles++;
              if (dz < 0.6) { gd.perfectDodges++; Combo.onPerfectDodge(); AudioFX.perfectDodge(); SettlementPanel.recordDodge(true); }
              else { Combo.onNormalDodge(); AudioFX.dodge(); SettlementPanel.recordDodge(false); }
            } else {
              obs.hit = true; gd.totalObstacles++;
              gd.stamina = Math.max(0, gd.stamina - obs.damage);
              Effects3D.spawnHitEffect(obs.group.position);
              Combo.onHit(); AudioFX.hit();
              SettlementPanel.recordMiss();
            }
          } else if (isJumpType) {
            if (playerY > 1.5) {
              obs.hit = true; gd.dodgedObstacles++; gd.totalObstacles++;
              if (dz < 0.6) { gd.perfectDodges++; Combo.onPerfectDodge(); AudioFX.perfectDodge(); SettlementPanel.recordDodge(true); }
              else { Combo.onNormalDodge(); AudioFX.dodge(); SettlementPanel.recordDodge(false); }
            } else if (Player3D.isSliding) {
              obs.hit = true; gd.dodgedObstacles++; gd.totalObstacles++;
              Combo.onNormalDodge(); AudioFX.dodge(); SettlementPanel.recordDodge(false);
            } else {
              obs.hit = true; gd.totalObstacles++;
              gd.stamina = Math.max(0, gd.stamina - obs.damage);
              Effects3D.spawnHitEffect(obs.group.position);
              Combo.onHit(); AudioFX.hit();
              SettlementPanel.recordMiss();
            }
          }
        }
      }

      // 回收
      if (obs.group.position.z > 15) {
        obs.group.visible = false;
        obs.active = false;
        obs.hit = false;
        this.activeList.splice(i, 1);
      }
    }
  },

  _spawn() {
    let obs = null;
    for (const o of this.pool) {
      if (!o.active) { obs = o; break; }
    }
    if (!obs) return;

    const lane = Math.floor(Math.random() * GameState.gameData.lanesOpen);
    const x = Game3D.lanePositions[lane];
    obs.group.position.set(x, 0, -80 - Math.random() * 20);
    obs.group.visible = true;
    obs.active = true;
    obs.hit = false;
    obs.lane = lane;
    this.activeList.push(obs);
  }
};

window.Obstacles3D = Obstacles3D;
