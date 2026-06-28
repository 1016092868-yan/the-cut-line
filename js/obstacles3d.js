// ============================================================
// obstacles3d.js — 3D 障碍物（纹理升级版）
// ============================================================

const Obstacles3D = {
  pool: [], activeList: [], spawnTimer: 0, density: 0.5,

  init(level, worldParams) {
    this.density = worldParams.obstacleDensity;
    if (level.specialRules.includes('obstacles_reduced_30')) this.density *= 0.7;
    if (level.specialRules.includes('obstacle_density_2x')) this.density *= 2.0;
    const group = Game3D.obstacleGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.pool = []; this.activeList = []; this.spawnTimer = 0;

    // 障碍物类型定义
    this.types = [
      { name: 'deadline', color: 0xf5f5f0, scale: [1.2, 1.0, 0.8], yOff: 0.5, damage: 5 },
      { name: 'boss', color: 0xcc3333, scale: [0.6, 1.8, 0.6], yOff: 0.9, damage: 8 },
      { name: 'traffic', color: 0xffcc00, scale: [2.0, 1.0, 1.2], yOff: 0.5, damage: 3 },
      { name: 'burnout', color: 0x222222, scale: [1.0, 1.5, 1.0], yOff: 0.75, damage: 15 },
      { name: 'crash', color: 0xff0000, scale: [0.8, 1.2, 0.8], yOff: 0.6, damage: 0 },
      { name: 'sick', color: 0x44ff44, scale: [1.0, 1.0, 1.0], yOff: 0.5, damage: 10 }
    ];

    // 预生成纹理
    const docTex = Textures.documents(); docTex.repeat.set(1, 1);
    const carTex = Textures.carSide('#ffcc00'); carTex.repeat.set(1, 1);

    for (let i = 0; i < 25; i++) {
      const t = this.types[i % this.types.length];
      let geo, mat;
      if (t.name === 'deadline') {
        geo = new THREE.BoxGeometry(t.scale[0], t.scale[1], t.scale[2]);
        mat = new THREE.MeshStandardMaterial({ map: docTex, roughness: 0.7 });
      } else if (t.name === 'traffic') {
        geo = new THREE.BoxGeometry(t.scale[0], t.scale[1], t.scale[2]);
        mat = new THREE.MeshStandardMaterial({ map: carTex, roughness: 0.4, metalness: 0.6 });
      } else if (t.name === 'boss') {
        geo = new THREE.CylinderGeometry(t.scale[0], t.scale[0] * 1.2, t.scale[1], 8);
        mat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.4, emissive: 0x330000, emissiveIntensity: 0.4 });
      } else if (t.name === 'burnout') {
        geo = new THREE.SphereGeometry(t.scale[0], 8, 8);
        mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, emissive: 0x111111, emissiveIntensity: 0.5, transparent: true, opacity: 0.7 });
      } else if (t.name === 'sick') {
        geo = new THREE.SphereGeometry(t.scale[0], 8, 8);
        mat = new THREE.MeshStandardMaterial({ color: 0x44ff44, roughness: 0.3, emissive: 0x004400, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 });
      } else {
        geo = new THREE.BoxGeometry(t.scale[0], t.scale[1], t.scale[2]);
        mat = new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.5, emissive: t.color, emissiveIntensity: 0.3 });
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.y = t.yOff;
      group.add(mesh);
      this.pool.push({ mesh, active: false, type: t.name, hit: false, lane: 0, damage: t.damage, yOff: t.yOff });
    }
  },

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnTimer = (0.35 + Math.random() * 1.0) / this.density; this.spawn(); }
    const speed = gd.speed;
    for (let i = this.activeList.length - 1; i >= 0; i--) {
      const obs = this.activeList[i];
      obs.mesh.position.z += speed * dt;
      if (obs.type === 'burnout' || obs.type === 'sick') {
        obs.mesh.rotation.y += dt * 2;
        obs.mesh.position.y = obs.yOff + Math.sin(Date.now() / 400 + i) * 0.3;
      }
      if (!obs.hit) {
        const dx = Math.abs(obs.mesh.position.x - Player3D.currentLaneX);
        const dz = Math.abs(obs.mesh.position.z - Player3D.worldZ);
        const playerY = Player3D.bounceOffset;
        if (dx < 1.0 && dz < 1.5) {
          if (playerY > 1.5) {
            obs.hit = true; gd.dodgedObstacles++; gd.totalObstacles++;
            if (dz < 0.6) { gd.perfectDodges++; Combo.onPerfectDodge(); AudioFX.perfectDodge(); SettlementPanel.recordDodge(true); } else { Combo.onNormalDodge(); AudioFX.dodge(); SettlementPanel.recordDodge(false); }
          } else if (Player3D.isSliding && obs.mesh.position.y > 0.9) {
            obs.hit = true; gd.dodgedObstacles++; gd.totalObstacles++; Combo.onNormalDodge(); AudioFX.dodge(); SettlementPanel.recordDodge(false);
          } else {
            obs.hit = true; gd.totalObstacles++;
            gd.stamina = Math.max(0, gd.stamina - obs.damage);
            Effects3D.spawnHitEffect(obs.mesh.position);
            Combo.onHit();
            AudioFX.hit();
            SettlementPanel.recordMiss();
          }
        }
      }
      if (obs.mesh.position.z > 15) { obs.mesh.visible = false; obs.active = false; obs.hit = false; this.activeList.splice(i, 1); }
    }
  },

  spawn() {
    const gd = GameState.gameData;
    for (const obs of this.pool) {
      if (!obs.active) {
        const lane = Math.floor(Math.random() * Math.min(gd.lanesOpen, 3));
        obs.mesh.position.set(Game3D.getLaneX(lane), obs.yOff, -40 - Math.random() * 20);
        obs.mesh.visible = true; obs.active = true; obs.hit = false; obs.lane = lane;
        this.activeList.push(obs);
        break;
      }
    }
  }
};

window.Obstacles3D = Obstacles3D;
