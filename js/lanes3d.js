// ============================================================
// lanes3d.js — 三跑道（纹理升级版）
// ============================================================

const Lanes3D = {
  segments: [], segmentLength: 20, totalSegments: 8, scrollAccum: 0, totalDistance: 12000,

  init(totalDist) {
    try {
    this.totalDistance = totalDist; this.segments = []; this.scrollAccum = 0;
    const group = Game3D.laneGroup;
    while (group.children.length > 0) group.remove(group.children[0]);

    const roadTex = Textures.asphalt();
    roadTex.repeat.set(1, 1);
    const roadWidth = Game3D.laneWidth * 3 + 1;
    const laneColors = [0x4CAF50, 0x2196F3, 0x9C27B0];
    const laneTexes = laneColors.map(c => Textures.laneOverlay('#' + c.toString(16).padStart(6, '0')));
    const lineTex = Textures.laneLine();
    lineTex.repeat.set(1, 4);

    for (let i = 0; i < this.totalSegments; i++) {
      const z = -i * this.segmentLength;
      const seg = { z, meshes: [] };

      // 跑道主体（沥青纹理）
      const roadGeo = new THREE.PlaneGeometry(roadWidth, this.segmentLength);
      const roadMat = new THREE.MeshToonMaterial({ map: roadTex, roughness: 0.85, metalness: 0.05 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2; road.position.set(0, -0.05, z); road.receiveShadow = true;
      group.add(road); seg.meshes.push(road);

      // 三条车道
      for (let l = 0; l < 3; l++) {
        const x = Game3D.lanePositions[l];
        const laneGeo = new THREE.PlaneGeometry(Game3D.laneWidth - 0.15, this.segmentLength);
        const laneMat = new THREE.MeshToonMaterial({ map: laneTexes[l], roughness: 0.7, metalness: 0.1, transparent: true, opacity: 0.5 });
        const lane = new THREE.Mesh(laneGeo, laneMat);
        lane.rotation.x = -Math.PI / 2; lane.position.set(x, 0.01, z); lane.receiveShadow = true;
        group.add(lane); seg.meshes.push(lane);
      }

      // 分隔线
      for (let d = 0; d < 2; d++) {
        const dx = (Game3D.lanePositions[d] + Game3D.lanePositions[d + 1]) / 2;
        const divGeo = new THREE.PlaneGeometry(0.2, this.segmentLength);
        const divMat = new THREE.MeshToonMaterial({ map: lineTex, roughness: 0.4, emissive: 0x444444, emissiveIntensity: 0.3, depthWrite: false });
        const div = new THREE.Mesh(divGeo, divMat);
        div.rotation.x = -Math.PI / 2; div.position.set(dx, 0.03, z);
        group.add(div); seg.meshes.push(div);
      }
      this.segments.push(seg);
    }

    // 路肩（两侧护栏）
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < this.totalSegments; i++) {
        const z = -i * this.segmentLength;
        const curbGeo = new THREE.BoxGeometry(0.3, 0.2, this.segmentLength);
        const curbMat = new THREE.MeshToonMaterial({ color: 0xcccccc, roughness: 0.5 });
        const curb = new THREE.Mesh(curbGeo, curbMat);
        curb.position.set(side * (roadWidth / 2 + 0.15), 0.1, z);
        curb.receiveShadow = true; curb.castShadow = true;
        group.add(curb);
        // 添加到第一个segment以便滚动
        if (i === 0 && this.segments[0]) this.segments[0].meshes.push(curb);
      }
    }
    } catch(e) {
      console.error('[Lanes3D] init 失败:', e.message);
    }
  },

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    const speed = gd.speed * dt;
    this.scrollAccum += speed;
    for (const seg of this.segments) {
      seg.z += speed;
      if (seg.z > this.segmentLength) seg.z -= this.segmentLength * this.totalSegments;
      for (const mesh of seg.meshes) mesh.position.z = seg.z;
    }
  }
};

window.Lanes3D = Lanes3D;
