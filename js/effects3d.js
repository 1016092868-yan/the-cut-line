// ============================================================
// effects3d.js — 粒子特效系统
// ============================================================

const Effects3D = {
  particles: [],

  init() {
    const group = Game3D.effectGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.particles = [];

    // 创建粒子池
    for (let i = 0; i < 50; i++) {
      const geo = new THREE.SphereGeometry(0.08, 4, 4);
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
  },

  spawnHitEffect(pos) {
    this.burst(pos, 0xff4444, 8, 0.5);
  },

  spawnCollectEffect(pos) {
    this.burst(pos, 0x44ff44, 6, 0.4);
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
          (Math.random() - 0.5) * 4,
          Math.random() * 3,
          (Math.random() - 0.5) * 4
        );
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
        p.velocity.y -= 5 * dt;
        p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
    }
  }
};

window.Effects3D = Effects3D;
