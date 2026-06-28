// ============================================================
// environment3d.js — 5个世界3D环境（纹理升级版）
// ============================================================

const Environment3D = {
  buildings: [], trees: [], lamps: [],

  init(worldId) {
    const group = Game3D.worldGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.buildings = []; this.trees = []; this.lamps = [];

    // 世界配置（P4 升级：更丰富的差异化）
    const configs = {
      1: { groundColor: 0x5a8f4a, buildingStyles: ['brick', 'brick', 'window'], windowColor: '#ffffcc', bldColors: [0x8D6E63, 0xA1887F, 0xBCAAA4, 0xD7CCC8], treeDensity: 0.5, grassColor: 0x66BB6A, sidewalkColor: 0xBDBDBD },
      2: { groundColor: 0x546e7a, buildingStyles: ['glass', 'glass', 'window'], windowColor: '#bbdefb', bldColors: [0x37474F, 0x455A64, 0x546E7A, 0x607D8B], treeDensity: 0.15, grassColor: 0x78909C, sidewalkColor: 0x90A4AE },
      3: { groundColor: 0x8d6e63, buildingStyles: ['brick', 'window', 'window'], windowColor: '#ffe082', bldColors: [0xFFAB91, 0xFFCC80, 0xFFE082, 0xFFF176], treeDensity: 0.4, grassColor: 0xA5D6A7, sidewalkColor: 0xBCAAA4 },
      4: { groundColor: 0x311B92, buildingStyles: ['glass', 'glass', 'neon'], windowColor: '#e1bee7', bldColors: [0x4A148C, 0x6A1B9A, 0x7B1FA2, 0x9C27B0], treeDensity: 0, grassColor: 0x4527A0, sidewalkColor: 0x5E35B1 },
      5: { groundColor: 0x3E0000, buildingStyles: ['ruin', 'ruin', 'neon'], windowColor: '#ff0000', bldColors: [0xB71C1C, 0xC62828, 0xD32F2F, 0xE53935], treeDensity: 0, grassColor: 0x4A0000, sidewalkColor: 0x620000 }
    };
    const cfg = configs[worldId] || configs[1];

    // 地面
    const groundGeo = new THREE.PlaneGeometry(60, 200);
    const groundTex = Textures.asphalt();
    groundTex.repeat.set(3, 10);
    const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9, color: cfg.groundColor });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.1, -60); ground.receiveShadow = true;
    group.add(ground);

    // 建筑纹理预生成
    const brickTex = Textures.brickWall();
    brickTex.repeat.set(1, 2);
    const glassTex = Textures.glassFacade(worldId === 4 ? 30 : 0);
    glassTex.repeat.set(1, 2);
    const windowTex = Textures.windowGrid(6, 4, cfg.windowColor);
    windowTex.repeat.set(1, 1);

    // 建筑
    for (let i = 0; i < 35; i++) {
      const side = (Math.random() > 0.5 ? 1 : -1);
      const z = -i * 7 - Math.random() * 4;
      const h = 4 + Math.random() * 14;
      const w = 1.5 + Math.random() * 2.5;
      const style = cfg.buildingStyles[Math.floor(Math.random() * cfg.buildingStyles.length)];

      const geo = new THREE.BoxGeometry(w, h, w);
      let mat;
      if (style === 'brick') mat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 });
      else if (style === 'glass') mat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.3, metalness: 0.5 });
      else if (style === 'neon') {
        mat = new THREE.MeshStandardMaterial({ color: cfg.bldColors[Math.floor(Math.random() * cfg.bldColors.length)], roughness: 0.4, emissive: cfg.bldColors[0], emissiveIntensity: 0.3 });
      } else mat = new THREE.MeshStandardMaterial({ map: windowTex, roughness: 0.7 });

      const bld = new THREE.Mesh(geo, mat);
      bld.position.set(side * (10 + Math.random() * 5), h / 2, z);
      bld.castShadow = true; bld.receiveShadow = true;
      group.add(bld);
      this.buildings.push({ mesh: bld, side, z });

      // 树木
      if (Math.random() < cfg.treeDensity) {
        const tx = side * (6 + Math.random() * 3);
        const tz = z + Math.random() * 5;
        // 树干
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 2, 6);
        const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 }));
        trunk.position.set(tx, 1, tz); trunk.castShadow = true;
        group.add(trunk);
        // 树冠
        const crownGeo = new THREE.ConeGeometry(1.2, 2.5, 8, 4);
        const crown = new THREE.Mesh(crownGeo, new THREE.MeshStandardMaterial({ color: 0x388E3C, roughness: 0.8 }));
        crown.position.set(tx, 2.8, tz); crown.castShadow = true;
        group.add(crown);
        this.trees.push({ trunk, crown, z: tz });
      }
    }

    // 路灯
    for (let i = 0; i < 12; i++) {
      const side = (Math.random() > 0.5 ? 1 : -1);
      const z = -i * 18;
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5, 8);
      const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.6 }));
      pole.position.set(side * 8, 2.5, z); pole.castShadow = true;
      group.add(pole);
      const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const bulb = new THREE.Mesh(bulbGeo, new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffdd88, emissiveIntensity: 0.8, roughness: 0.2 }));
      bulb.position.set(side * 8, 5.2, z);
      group.add(bulb);
      this.lamps.push({ pole, bulb, side, z });
    }
  },

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    const speed = gd.speed * dt;
    for (const b of this.buildings) { b.mesh.position.z += speed; if (b.mesh.position.z > 20) b.mesh.position.z -= 245; }
    for (const t of this.trees) { t.trunk.position.z += speed; t.crown.position.z += speed; if (t.trunk.position.z > 20) { t.trunk.position.z -= 245; t.crown.position.z = t.trunk.position.z; } }
    for (const l of this.lamps) { l.pole.position.z += speed; l.bulb.position.z += speed; if (l.pole.position.z > 20) { l.pole.position.z -= 216; l.bulb.position.z = l.pole.position.z; } }
  }
};

window.Environment3D = Environment3D;
