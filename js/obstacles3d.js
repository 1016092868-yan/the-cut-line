// ============================================================
// obstacles3d.js — 3D 障碍物（P4 升级：AI PNG 纹理 + 独特形状）
// ============================================================

const Obstacles3D = {
  pool: [], activeList: [], textures: {}, spawnTimer: 0, spawnInterval: 1.5,

  init(level, worldParams) {
    try {
    this.pool = [];
    this.activeList = [];
    this.spawnTimer = 0;
    this.density = worldParams.obstacleDensity || 0.5;
    this.spawnInterval = 2.0 - this.density * 1.5;
    this.totalDistance = level.length;

    const group = Game3D.obstacleGroup;
    while (group.children.length > 0) {
      const c = group.children[0];
      this._disposeRecursive(c);
      group.remove(c);
    }

    // 加载 6 种障碍物纹理
    const texLoader = new THREE.TextureLoader();
    const texNames = ['deadline', 'toxic-boss', 'traffic-jam', 'burnout', 'market-crash', 'sick-wave'];
    texNames.forEach(name => {
      const tex = texLoader.load('assets/items/obstacle-' + name + '.png');
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      this.textures[name] = tex;
    });

    // 障碍物定义（含下滑专用低矮型 + 跳跃专用高空型）
    this.types = [
      // 低矮障碍物（需下滑躲避，跳跃无法越过）
      { name: 'barrier', texKey: 'traffic-jam', color: 0xFDD835, scale: [2.0, 0.3, 0.6], damage: 5, shape: 'box', dodgeType: 'slide' },
      // 高空障碍物（需跳跃躲避，下滑无用）
      { name: 'deadline', texKey: 'deadline', color: 0xE53935, scale: [1.0, 0.7, 0.6], damage: 5, shape: 'box', dodgeType: 'jump' },
      { name: 'boss', texKey: 'toxic-boss', color: 0xFF6F00, scale: [0.5, 1.6, 0.5], damage: 8, shape: 'cylinder', dodgeType: 'jump' },
      { name: 'burnout', texKey: 'burnout', color: 0xFF1744, scale: [0.7, 1.2, 0.7], damage: 15, shape: 'sphere', dodgeType: 'jump' },
      { name: 'crash', texKey: 'market-crash', color: 0x880E4F, scale: [0.8, 0.8, 0.8], damage: 10, shape: 'diamond', dodgeType: 'jump' },
      { name: 'sick', texKey: 'sick-wave', color: 0x00C853, scale: [0.8, 0.9, 0.8], damage: 10, shape: 'sphere', dodgeType: 'jump' },
    ];

    // 创建对象池（25 个）
    for (let i = 0; i < 25; i++) {
      const t = this.types[i % this.types.length];
      const obsGroup = new THREE.Group();

      // 主几何体
      let bodyGeo;
      switch (t.shape) {
        case 'cylinder':
          bodyGeo = new THREE.CylinderGeometry(t.scale[0], t.scale[0], t.scale[1], 16);
          break;
        case 'sphere':
          bodyGeo = new THREE.SphereGeometry(t.scale[0], 16, 16);
          break;
        case 'diamond':
          bodyGeo = new THREE.OctahedronGeometry(t.scale[0], 0);
          break;
        default:
          bodyGeo = new THREE.BoxGeometry(t.scale[0], t.scale[1], t.scale[2]);
      }
      const bodyMat = new THREE.MeshToonMaterial({ color: t.color, gradientMap: null });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;
      obsGroup.add(body);

      // 额外几何细节（让障碍物更易识别）
      if (t.name === 'barrier') {
        // 路障条纹
        for (let sx = -0.7; sx < 0.7; sx += 0.2) {
          const stripeGeo = new THREE.BoxGeometry(0.08, 0.32, 0.62);
          const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshToonMaterial({ color: 0x212121 }));
          stripe.position.set(sx, 0, 0);
          obsGroup.add(stripe);
        }
      } else if (t.name === 'deadline') {
        // 文件堆上的红色标记
        const markGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
        const mark = new THREE.Mesh(markGeo, new THREE.MeshToonMaterial({ color: 0xE53935 }));
        mark.position.y = 0.38;
        mark.rotation.x = 0.3;
        obsGroup.add(mark);
      } else if (t.name === 'burnout') {
        // 火焰粒子
        for (let fi = 0; fi < 4; fi++) {
          const flameGeo = new THREE.ConeGeometry(0.2 + fi*0.08, 0.35 + fi*0.15, 8);
          const flame = new THREE.Mesh(flameGeo, new THREE.MeshToonMaterial({ color: [0xFF1744, 0xFF6D00, 0xFFAB00, 0xFFEA00][fi] }));
          flame.position.y = 0.5 + fi * 0.25;
          flame.rotation.z = fi * 0.4;
          obsGroup.add(flame);
        }
      } else if (t.name === 'crash') {
        // 下跌箭头
        const arrowGeo = new THREE.ConeGeometry(0.18, 0.3, 8);
        const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshToonMaterial({ color: 0xE53935 }));
        arrow.position.y = -0.2;
        arrow.rotation.z = Math.PI;
        obsGroup.add(arrow);
      } else if (t.name === 'sick') {
        // 病毒刺突
        for (let si = 0; si < 8; si++) {
          const spikeGeo = new THREE.ConeGeometry(0.04, 0.15, 6);
          const spike = new THREE.Mesh(spikeGeo, new THREE.MeshToonMaterial({ color: 0x76FF03 }));
          const phi = Math.random() * Math.PI;
          const theta = Math.random() * Math.PI * 2;
          spike.position.set(
            Math.sin(phi)*Math.cos(theta)*0.42,
            Math.sin(phi)*Math.sin(theta)*0.42,
            Math.cos(phi)*0.42
          );
          spike.lookAt(new THREE.Vector3(spike.position.x*2, spike.position.y*2, spike.position.z*2));
          obsGroup.add(spike);
        }
      }

      // 底部光晕
      const glowGeo = new THREE.RingGeometry(t.scale[0] * 0.5, t.scale[0] * 1.1, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: t.color, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = -t.scale[1] / 2;
      obsGroup.add(glow);

      obsGroup.visible = false;
      Game3D.obstacleGroup.add(obsGroup);

      this.pool.push({
        group: obsGroup, body, glow,
        active: false, type: t.name, hit: false, lane: 0,
        damage: t.damage, yOff: t.scale[1] / 2, shape: t.shape, color: t.color,
        dodgeType: t.dodgeType || 'jump'
      });
    }
    } catch(e) {
      console.error('[Obstacles3D] init 失败:', e.message);
    }
  },

  _disposeRecursive(obj) {
    if (obj.children) obj.children.forEach(c => this._disposeRecursive(c));
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
    if (obj.geometry) obj.geometry.dispose();
  },

  update(dt) {
    const gd = GameState.gameData;
    if (!gd || !GameState.isRunning || GameState.isPaused) return;

    // 生成障碍物
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this._spawn();
    }

    const speed = gd.speed * dt;
    for (let i = this.activeList.length - 1; i >= 0; i--) {
      const obs = this.activeList[i];
      obs.group.position.z += speed;

      // 滚动动画
      if (obs.shape === 'sphere' || obs.shape === 'diamond') {
        obs.body.rotation.x += dt * 3;
        obs.body.rotation.z += dt * 2;
      }
      obs.body.position.y = obs.yOff + Math.sin(Date.now() / 300 + i) * 0.25;
      if (obs.edge) obs.edge.position.y = obs.body.position.y;

      // 碰撞检测
      if (!obs.hit) {
        const dx = Math.abs(obs.group.position.x - Player3D.currentLaneX);
        const dz = Math.abs(obs.group.position.z - Player3D.worldZ);
        const playerY = Player3D.bounceOffset;

        if (dx < 1.0 && dz < 1.5) {
          const isSlideType = obs.dodgeType === 'slide';
          const isJumpType = obs.dodgeType === 'jump';

          if (isSlideType) {
            // 低矮障碍物：只能下滑躲避，跳跃无法越过
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
            // 高空障碍物：跳跃或下滑躲避
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

      // 超出屏幕回收
      if (obs.group.position.z > 15) {
        obs.group.visible = false;
        obs.active = false;
        obs.hit = false;
        this.activeList.splice(i, 1);
      }
    }
  },

  _spawn() {
    // 找空闲对象
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
