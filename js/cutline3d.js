// ============================================================
// cutline3d.js — 3D 斩杀线激光墙（不阻挡视线版）
// 缩小尺寸 + 降低透明度 + 靠近时淡化
// ============================================================

const Cutline3D = {
  wall: null, innerWall: null, glowRings: [], groundProj: null,
  totalDistance: 12000, pulsePhase: 0,

  init(totalDist) {
    this.totalDistance = totalDist;
    const group = Game3D.cutlineGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.glowRings = []; this.pulsePhase = 0;

    const scanTex = Textures.laserScan();
    scanTex.wrapS = THREE.ClampToEdgeWrapping;
    scanTex.wrapT = THREE.RepeatWrapping;
    scanTex.repeat.set(1, 4);

    // 主激光墙 — 更窄更低（不挡视野）
    const wallGeo = new THREE.PlaneGeometry(16, 25);
    const wallMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, alpha: { value: 0.15 }, scanTex: { value: scanTex } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time, alpha;
        uniform sampler2D scanTex;
        void main() {
          float s = texture2D(scanTex, vec2(vUv.x, vUv.y + time * 0.3)).r;
          float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
          gl_FragColor = vec4(vec3(1.0, 0.05, 0.02), alpha * s * edge * 0.7);
        }
      `,
      transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    this.wall = new THREE.Mesh(wallGeo, wallMat);
    this.wall.position.set(0, 8, -40);
    group.add(this.wall);

    // 内层发光（更淡）
    const innerGeo = new THREE.PlaneGeometry(18, 28);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false });
    this.innerWall = new THREE.Mesh(innerGeo, innerMat);
    this.innerWall.position.set(0, 8, -39.5);
    group.add(this.innerWall);

    // 脉冲环（减少数量，更细）
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(9 + i * 1.5, 0.08, 6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.12 - i * 0.025, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 8, -38 - i * 2);
      group.add(ring);
      this.glowRings.push(ring);
    }

    // 地面投影（更小更淡）
    const projGeo = new THREE.PlaneGeometry(14, 2);
    const projMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
    this.groundProj = new THREE.Mesh(projGeo, projMat);
    this.groundProj.rotation.x = -Math.PI / 2;
    this.groundProj.position.set(0, 0.05, -40);
    group.add(this.groundProj);
  },

  update(dt) {
    const gd = GameState.gameData;
    if (!gd || !this.wall) return;
    const progress = gd.distance / this.totalDistance;
    this.pulsePhase += dt;

    const targetZ = -40 + progress * 36;
    this.wall.position.z += (targetZ - this.wall.position.z) * 0.08;
    this.innerWall.position.z = this.wall.position.z + 0.5;
    if (this.groundProj) this.groundProj.position.z = this.wall.position.z;

    // 靠近时淡化（关键！离玩家越近越透明，不挡路）
    const distToPlayer = Math.abs(this.wall.position.z - Player3D.worldZ);
    const distFade = Math.max(0, Math.min(1, (distToPlayer - 5) / 15));

    let alpha;
    if (progress < 0.5) alpha = 0.08 + progress * 0.15;
    else if (progress < 0.75) alpha = 0.15 + (progress - 0.5) * 0.4;
    else if (progress < 0.92) alpha = 0.25 + (progress - 0.75) * 0.5;
    else alpha = 0.35;

    alpha *= distFade; // 靠近时变透明

    this.wall.material.uniforms.alpha.value = alpha;
    this.wall.material.uniforms.time.value = this.pulsePhase;
    this.innerWall.material.opacity = 0.02 + Math.sin(this.pulsePhase * 5) * 0.02;

    this.glowRings.forEach((ring, i) => {
      ring.position.z = this.wall.position.z - i * 2;
      ring.material.opacity = (0.08 - i * 0.02) * distFade + Math.sin(this.pulsePhase * 3 + i) * 0.03;
    });

    const triggered = Object.values(gd.cutlineTriggered).filter(v => v).length;
    if (triggered >= 4) {
      this.wall.material.uniforms.alpha.value = Math.min(0.5, alpha * 1.5);
    }
  }
};

window.Cutline3D = Cutline3D;
