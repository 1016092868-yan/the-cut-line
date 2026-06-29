// ============================================================
// effects3d.js — 粒子特效系统（v3增强版）
// 金币旋转粒子、完美闪避波纹、Combo爆发彩虹
// ============================================================

const Effects3D = {
  particles: [],
  activeParticles: [],

  init() {
    const group = Game3D.effectGroup;
    while (group.children.length > 0) {
      const c = group.children[0];
      if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
      if (c.geometry) c.geometry.dispose();
      group.remove(c);
    }
    this.particles = [];
    this.activeParticles = [];

    // 200 粒子池
    for (let i = 0; i < 200; i++) {
      const size = 0.04 + Math.random() * 0.15;
      const geo = new THREE.SphereGeometry(size, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      const particle = new THREE.Mesh(geo, mat);
      particle.visible = false;
      group.add(particle);
      this.particles.push({
        mesh: particle, active: false,
        life: 0, maxLife: 0,
        velocity: new THREE.Vector3(),
        color: 0xffffff,
        type: 'default', // default, coin, ring, combo
        rotSpeed: 0,
        scaleSpeed: 0,
      });
    }
  },

  // ===== 碰撞特效 =====
  spawnHitEffect(pos) {
    this._burst(pos, 0xff4444, 15, 0.6, 'default');
  },

  // ===== 收集特效（金币旋转） =====
  spawnCollectEffect(pos) {
    this._burst(pos, 0xFFD700, 8, 0.4, 'coin');
    this._ringBurst(pos, 0xFFD700, 8);
  },

  // ===== 完美闪避特效（蓝色波纹） =====
  spawnPerfectEffect(pos) {
    this._ringBurst(pos, 0x2196F3, 16);
    this._burst(pos, 0x64B5F6, 8, 0.5, 'ring');
  },

  // ===== Combo爆发（彩虹粒子） =====
  spawnComboEffect(pos, level) {
    const colors = [0xFF1744, 0xFF9100, 0xFFEA00, 0x00E676, 0x2979FF, 0xD500F9];
    const count = 6 + level * 4;
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this._spawnSingle(pos, color, 0.5 + Math.random() * 0.5, 'combo');
    }
  },

  // ===== 升级特效 =====
  spawnLevelUpEffect(pos) {
    this._ringBurst(pos, 0xFFD700, 20);
    this._burst(pos, 0xFFFFFF, 12, 0.8, 'default');
    // 上升光柱
    for (let i = 0; i < 6; i++) {
      const p = this._getInactive();
      if (!p) break;
      p.mesh.position.copy(pos);
      p.mesh.position.x += (Math.random() - 0.5) * 0.5;
      p.mesh.position.z += (Math.random() - 0.5) * 0.5;
      p.mesh.visible = true;
      p.active = true;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.velocity.set((Math.random()-0.5)*0.5, 3 + Math.random()*2, (Math.random()-0.5)*0.5);
      p.color = 0xFFD700;
      p.mesh.material.color.setHex(0xFFD700);
      p.mesh.material.opacity = 1;
      p.type = 'default';
    }
  },

  // ===== 内部方法 =====

  _burst(position, color, count, duration, type) {
    let spawned = 0;
    for (const p of this.particles) {
      if (!p.active && spawned < count) {
        p.mesh.position.copy(position);
        p.mesh.visible = true;
        p.active = true;
        p.life = duration;
        p.maxLife = duration;
        p.velocity.set(
          (Math.random() - 0.5) * 5,
          Math.random() * 4,
          (Math.random() - 0.5) * 5
        );
        p.color = color;
        p.type = type;
        p.rotSpeed = (Math.random() - 0.5) * 10;
        p.scaleSpeed = 1 + Math.random();
        p.mesh.material.color.setHex(color);
        p.mesh.material.opacity = 1;
        p.mesh.scale.setScalar(1);
        spawned++;
      }
    }
  },

  _ringBurst(position, color, count) {
    let spawned = 0;
    for (const p of this.particles) {
      if (!p.active && spawned < count) {
        const angle = (spawned / count) * Math.PI * 2;
        const speed = 3;
        p.mesh.position.copy(position);
        p.mesh.visible = true;
        p.active = true;
        p.life = 0.35;
        p.maxLife = 0.35;
        p.velocity.set(Math.cos(angle) * speed, 0.5, Math.sin(angle) * speed);
        p.color = color;
        p.type = 'ring';
        p.rotSpeed = 0;
        p.scaleSpeed = 0.8;
        p.mesh.material.color.setHex(color);
        p.mesh.material.opacity = 1;
        p.mesh.scale.setScalar(1);
        spawned++;
      }
    }
  },

  _spawnSingle(position, color, duration, type) {
    const p = this._getInactive();
    if (!p) return;
    p.mesh.position.copy(position);
    p.mesh.visible = true;
    p.active = true;
    p.life = duration;
    p.maxLife = duration;
    p.velocity.set(
      (Math.random() - 0.5) * 6,
      2 + Math.random() * 4,
      (Math.random() - 0.5) * 6
    );
    p.color = color;
    p.type = type;
    p.rotSpeed = (Math.random() - 0.5) * 15;
    p.scaleSpeed = 1 + Math.random() * 0.5;
    p.mesh.material.color.setHex(color);
    p.mesh.material.opacity = 1;
    p.mesh.scale.setScalar(1);
  },

  _getInactive() {
    for (const p of this.particles) {
      if (!p.active) return p;
    }
    return null;
  },

  // ===== 更新 =====

  update(dt) {
    for (const p of this.particles) {
      if (p.active) {
        p.life -= dt;
        const progress = 1 - p.life / p.maxLife;

        // 位置
        p.mesh.position.x += p.velocity.x * dt;
        p.mesh.position.y += p.velocity.y * dt;
        p.mesh.position.z += p.velocity.z * dt;

        // 重力
        p.velocity.y -= 6 * dt;

        // 根据类型做特殊动画
        if (p.type === 'coin') {
          // 金币旋转（绕Y轴）
          p.mesh.rotation.y += p.rotSpeed * dt;
          p.mesh.rotation.x += p.rotSpeed * 0.5 * dt;
        } else if (p.type === 'combo') {
          // combo粒子缩放弹跳
          p.mesh.scale.setScalar(1 + Math.sin(progress * Math.PI) * p.scaleSpeed * 0.5);
        } else if (p.type === 'ring') {
          // 环状粒子水平扩散
          p.mesh.scale.setScalar(0.5 + progress * p.scaleSpeed);
        }

        // 淡出
        const fadeOutStart = 0.3;
        if (progress > fadeOutStart) {
          p.mesh.material.opacity = 1 - (progress - fadeOutStart) / (1 - fadeOutStart);
        }

        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          p.mesh.scale.setScalar(1);
          p.mesh.rotation.set(0, 0, 0);
        }
      }
    }
  }
};

window.Effects3D = Effects3D;
