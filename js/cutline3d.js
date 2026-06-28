// ============================================================
// cutline3d.js — 3D 斩杀线激光墙（多层效果升级版）
// ============================================================

const Cutline3D = {
  wall: null, innerWall: null, glowRings: [], groundProj: null,
  totalDistance: 12000, pulsePhase: 0,

  init(totalDist) {
    this.totalDistance = totalDist;
    const group = Game3D.cutlineGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.glowRings = []; this.pulsePhase = 0;

    // 激光扫描纹理
    const scanTex = Textures.laserScan();
    scanTex.wrapS = THREE.ClampToEdgeWrapping;
    scanTex.wrapT = THREE.RepeatWrapping;
    scanTex.repeat.set(1, 4);

    // 主激光墙 — 使用纹理
    const wallGeo = new THREE.PlaneGeometry(22, 35);
    const wallMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }, alpha: { value: 0.35 }, scanTex: { value: scanTex }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time, alpha;
        uniform sampler2D scanTex;
        void main() {
          float s = texture2D(scanTex, vec2(vUv.x, vUv.y + time * 0.3)).r;
          float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
          float heat = 1.0 + sin(vUv.y * 60.0 + time * 5.0) * 0.3;
          gl_FragColor = vec4(vec3(1.0, 0.05 * heat, 0.02), alpha * s * edge * heat);
        }
      `,
      transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    this.wall = new THREE.Mesh(wallGeo, wallMat);
    this.wall.position.set(0, 12, -40);
    group.add(this.wall);

    // 内层发光
    const innerGeo = new THREE.PlaneGeometry(24, 38);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
    this.innerWall = new THREE.Mesh(innerGeo, innerMat);
    this.innerWall.position.set(0, 12, -39.5);
    group.add(this.innerWall);

    // 多层脉冲环
    for (let i = 0; i < 8; i++) {
      const ringGeo = new THREE.TorusGeometry(12 + i * 1.5, 0.15, 8, 40);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 - i * 0.025, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 12, -38 - i * 2);
      group.add(ring);
      this.glowRings.push(ring);
    }

    // 地面投影
    const projGeo = new THREE.PlaneGeometry(20, 3);
    const projMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false });
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

    let alpha;
    if (progress < 0.5) alpha = 0.2 + progress * 0.3;
    else if (progress < 0.75) alpha = 0.35 + (progress - 0.5) * 1.5;
    else if (progress < 0.92) alpha = 0.65 + (progress - 0.75) * 1.5;
    else alpha = 0.9;

    this.wall.material.uniforms.alpha.value = alpha;
    this.wall.material.uniforms.time.value = this.pulsePhase;
    this.innerWall.material.opacity = 0.05 + Math.sin(this.pulsePhase * 5) * 0.04;

    // 脉冲环扩散
    this.glowRings.forEach((ring, i) => {
      ring.position.z = this.wall.position.z - i * 2;
      ring.material.opacity = (0.15 - i * 0.02) + Math.sin(this.pulsePhase * 3 + i) * 0.05;
    });

    // 斩杀时刻
    const triggered = Object.values(gd.cutlineTriggered).filter(v => v).length;
    if (triggered >= 4) {
      this.wall.material.uniforms.alpha.value = 0.92 + Math.sin(this.pulsePhase * 10) * 0.08;
    }
  }
};

window.Cutline3D = Cutline3D;
