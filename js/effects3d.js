// ============================================================
// effects3d.js — 粒子特效系统（P4 升级：150 粒子 + 世界主题色）
// ============================================================

const Effects3D = {
  particles: [],

  init() {
    try {
    const group = Game3D.effectGroup;
    while (group.children.length > 0) {
      const c = group.children[0];
      if (c.material) c.material.dispose();
      if (c.geometry) c.geometry.dispose();
      group.remove(c);
    }
    this.particles = [];

    // 150 粒子池
    for (let i = 0; i < 150; i++) {
      const size = 0.05 + Math.random() * 0.15;
      const geo = new THREE.SphereGeometry(size, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      const particle = new THREE.Mesh(geo, mat);
      particle.visible = false;
      group.add(particle);
      this.particles.push({
        mesh: particle,
        active: false,
        life: 0,
        maxLife: 0,
        velocity: new THREE.Vector3(),
        color: 0xffffff
      });
    }
    } catch(e) {
      console.error('[Effects3D] init 失败:', e.message);
    }
  },

  spawnHitEffect(pos) {
    this.burst(pos, 0xff4444, 12, 0.6);
  },

  spawnCollectEffect(pos) {
    this.burst(pos, 0xFFD700, 10, 0.5);
    // 额外的小粒子环
    this.ringBurst(pos, 0xFFD700, 8);
  },

  burst(position, color, count, duration) {
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
        p.mesh.material.color.setHex(color);
        p.mesh.material.opacity = 1;
        spawned++;
      }
    }
  },

  ringBurst(position, color, count) {
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
        p.mesh.material.color.setHex(color);
        p.mesh.material.opacity = 1;
        spawned++;
      }
    }
  },

  update(dt) {
    for (const p of this.particles) {
      if (p.active) {
        p.life -= dt;
        p.mesh.position.x += p.velocity.x * dt;
        p.mesh.position.y += p.velocity.y * dt;
        p.mesh.position.z += p.velocity.z * dt;
        p.velocity.y -= 6 * dt;
        p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
        p.mesh.scale.setScalar(0.6 + (p.life / p.maxLife) * 0.4);
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
    }
  }
};

window.Effects3D = Effects3D;
