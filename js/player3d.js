// ============================================================
// player3d.js — 3D角色（神庙逃亡风格：精致低多边形 + 卡通渲染）
// 画风：PvZ 漫画厚涂 × 神庙逃亡质感
// ============================================================

const Player3D = {
  model: null, body: null, head: null,
  leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
  worldZ: 0, currentLaneX: 0, targetLaneX: 0,
  isJumping: false, isSliding: false,
  jumpTimer: 0, slideTimer: 0, bounceOffset: 0, runTime: 0,
  glowRing: null,

  init() {
    const group = Game3D.playerGroup;
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }
    this.model = new THREE.Group();
    this.worldZ = 0;
    this.currentLaneX = Game3D.getLaneX(1);
    this.targetLaneX = this.currentLaneX;
    this.isJumping = this.isSliding = false;
    this.jumpTimer = this.slideTimer = this.bounceOffset = this.runTime = 0;

    const char = GameState.selectedCharacter;
    const ci = (char.id - 1) % 6;

    // 配色方案 — 鲜明对比，每个角色不同
    const schemes = [
      { skin: 0xFFCC80, hair: 0x3E2723, top: 0x4488cc, bottom: 0x37474F, shoe: 0x2c2c2c, accent: 0xcc3333 },
      { skin: 0xF5D0A9, hair: 0x1a1a1a, top: 0x2E7D32, bottom: 0x263238, shoe: 0x3E2723, accent: 0x1565C0 },
      { skin: 0xE0AC69, hair: 0x4E342E, top: 0xC62828, bottom: 0x1B2631, shoe: 0x424242, accent: 0xFFD700 },
      { skin: 0xC68642, hair: 0x212121, top: 0x6A1B9A, bottom: 0x212121, shoe: 0x111111, accent: 0xFF9800 },
      { skin: 0xFFE0BD, hair: 0x5D4037, top: 0xE65100, bottom: 0x3E2723, shoe: 0x4E342E, accent: 0x2196F3 },
      { skin: 0xD4A574, hair: 0x1B1B1B, top: 0x37474F, bottom: 0x424242, shoe: 0x1a1a1a, accent: 0x4CAF50 },
    ];
    const cs = schemes[ci];

    // ===== 使用 MeshToonMaterial 实现卡通渲染（神庙逃亡风格关键！）=====
    // ToonMaterial = 清晰的明暗分界 + 光泽高光，简洁但不简陋

    // === 身体（修身比例，更接近真人）===
    const bodyGeo = new THREE.CapsuleGeometry(0.30, 0.95, 8, 14);
    const bodyMat = new THREE.MeshToonMaterial({ color: cs.top, gradientMap: null });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.25;
    this.body.castShadow = true;
    this.body.receiveShadow = true;
    this.model.add(this.body);

    // 衣服下摆（T恤底部色带）
    const hemGeo = new THREE.TorusGeometry(0.31, 0.04, 8, 16);
    const hemMat = new THREE.MeshToonMaterial({ color: cs.accent });
    const hem = new THREE.Mesh(hemGeo, hemMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = 0.78;
    this.model.add(hem);

    // === 头部 ===
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    // 加载AI卡牌图做面部纹理
    const texLoader = new THREE.TextureLoader();
    const faceTex = texLoader.load('assets/characters/' + getCharAssetPath(char));
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.minFilter = THREE.LinearFilter;
    faceTex.magFilter = THREE.LinearFilter;
    // 裁剪卡牌图的上半部分（头部区域）
    faceTex.offset.set(0.15, 0.28);
    faceTex.repeat.set(0.7, 0.30);
    faceTex.needsUpdate = true;

    const headMat = new THREE.MeshToonMaterial({ map: faceTex, gradientMap: null });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 2.1;
    this.head.castShadow = true;
    this.model.add(this.head);

    // 头发（更有型的发型）
    const hairGroup = new THREE.Group();
    // 头顶
    const hairTopGeo = new THREE.SphereGeometry(0.30, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMat = new THREE.MeshToonMaterial({ color: cs.hair });
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.y = 2.15;
    hairTop.scale.set(1, 0.45, 1);
    hairGroup.add(hairTop);
    // 后脑
    const hairBackGeo = new THREE.SphereGeometry(0.29, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.4);
    const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
    hairBack.position.y = 2.05;
    hairBack.position.z = -0.05;
    hairBack.scale.set(1, 0.4, 0.65);
    hairGroup.add(hairBack);
    this.model.add(hairGroup);

    // === 手臂（更自然的比例）===
    const armGeo = new THREE.CapsuleGeometry(0.085, 0.60, 4, 8);
    const armMat = new THREE.MeshToonMaterial({ color: cs.top });
    // 左臂
    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.46, 1.55, 0.02);
    this.leftArm.rotation.z = 0.1;
    this.leftArm.castShadow = true;
    this.model.add(this.leftArm);
    // 右臂
    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.46, 1.55, 0.02);
    this.rightArm.rotation.z = -0.1;
    this.rightArm.castShadow = true;
    this.model.add(this.rightArm);

    // 手
    const handGeo = new THREE.SphereGeometry(0.085, 8, 8);
    const handMat = new THREE.MeshToonMaterial({ color: cs.skin });
    const lh = new THREE.Mesh(handGeo, handMat);
    lh.position.set(-0.46, 1.15, 0.05);
    this.model.add(lh);
    const rh = new THREE.Mesh(handGeo, handMat);
    rh.position.set(0.46, 1.15, 0.05);
    this.model.add(rh);

    // === 腿 ===
    const legGeo = new THREE.CapsuleGeometry(0.105, 0.70, 4, 8);
    const legMat = new THREE.MeshToonMaterial({ color: cs.bottom });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.15, 0.48, 0);
    this.leftLeg.castShadow = true;
    this.model.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.15, 0.48, 0);
    this.rightLeg.castShadow = true;
    this.model.add(this.rightLeg);

    // === 鞋（更真实的运动鞋形状）===
    const shoeGeo = new THREE.BoxGeometry(0.20, 0.14, 0.34);
    const shoeMat = new THREE.MeshToonMaterial({ color: cs.shoe });
    // 左鞋
    const ls = new THREE.Mesh(shoeGeo, shoeMat);
    ls.position.set(-0.15, 0.07, 0.08);
    ls.castShadow = true;
    this.model.add(ls);
    // 鞋头（白色）
    const toeGeo = new THREE.BoxGeometry(0.16, 0.08, 0.10);
    const toeMat = new THREE.MeshToonMaterial({ color: 0xeeeeee });
    const ltoe = new THREE.Mesh(toeGeo, toeMat);
    ltoe.position.set(-0.15, 0.10, 0.22);
    this.model.add(ltoe);
    // 右鞋
    const rs = new THREE.Mesh(shoeGeo, shoeMat);
    rs.position.set(0.15, 0.07, 0.08);
    rs.castShadow = true;
    this.model.add(rs);
    const rtoe = new THREE.Mesh(toeGeo, toeMat);
    rtoe.position.set(0.15, 0.10, 0.22);
    this.model.add(rtoe);

    // === 配饰 ===
    // 领口
    const collarGeo = new THREE.TorusGeometry(0.12, 0.025, 6, 12);
    const collarMat = new THREE.MeshToonMaterial({ color: cs.accent });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.72, 0.28);
    collar.rotation.x = Math.PI * 0.3;
    this.model.add(collar);

    // === 底部阴影盘 ===
    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, side: THREE.DoubleSide,
      transparent: true, opacity: 0.35, depthWrite: false
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    this.model.add(shadow);

    // === 底部光晕 ===
    const glowGeo = new THREE.RingGeometry(0.25, 0.45, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: cs.accent, side: THREE.DoubleSide,
      transparent: true, opacity: 0.18, depthWrite: false
    });
    this.glowRing = new THREE.Mesh(glowGeo, glowMat);
    this.glowRing.rotation.x = -Math.PI / 2;
    this.glowRing.position.y = 0.015;
    this.model.add(this.glowRing);

    this.model.position.set(this.currentLaneX, 0, this.worldZ);
    group.add(this.model);
  },

  update(dt) {
    const gd = GameState.gameData;
    if (!gd) return;
    this.runTime += dt * 9;
    this.targetLaneX = Game3D.getLaneX(gd.currentLane);
    this.currentLaneX += (this.targetLaneX - this.currentLaneX) * 0.18;

    // 跑道切换
    const targetLane = Input.getTargetLane();
    if (targetLane !== null) {
      if (targetLane === 'left') Engine.switchToLane(gd.currentLane - 1);
      else if (targetLane === 'right') Engine.switchToLane(gd.currentLane + 1);
      else Engine.switchToLane(targetLane);
    }

    // 跳跃
    if ((Input.isDown('Space') || Input.isDown('ArrowUp') || Input.isDown('KeyW')) && !this.isJumping && !this.isSliding) {
      this.isJumping = true; this.jumpTimer = 0.30;
    }
    if (this.isJumping) {
      this.jumpTimer -= dt;
      this.bounceOffset = Math.sin(Math.max(0, this.jumpTimer) / 0.30 * Math.PI) * 3.2;
      if (this.jumpTimer <= 0) { this.isJumping = false; this.bounceOffset = 0; }
    }

    // 下蹲
    if (Input.isDown('ArrowDown') && !this.isSliding && !this.isJumping) {
      this.isSliding = true; this.slideTimer = 0.30;
    }
    if (this.isSliding) { this.slideTimer -= dt; if (this.slideTimer <= 0) this.isSliding = false; }

    // 跑步动画
    const swing = Math.sin(this.runTime) * 0.5;
    this.leftLeg.rotation.x = swing;
    this.rightLeg.rotation.x = -swing;
    this.leftArm.rotation.x = -swing * 0.8;
    this.rightArm.rotation.x = swing * 0.8;

    // 下蹲缩放
    const targetScaleY = this.isSliding ? 0.45 : 1.0;
    this.model.scale.y += (targetScaleY - this.model.scale.y) * 0.3;

    // 呼吸微动
    const breathe = 1.0 + Math.sin(this.runTime * 0.6) * 0.01;
    this.model.scale.x = breathe;
    this.model.scale.z = breathe;

    // 位置
    this.model.position.x = this.currentLaneX;
    this.model.position.y = this.bounceOffset;
    this.model.position.z = this.worldZ;

    // 光晕脉冲
    if (this.glowRing) {
      this.glowRing.material.opacity = 0.12 + Math.sin(this.runTime * 2.5) * 0.06;
    }
  },

  startLaneSwitch(newLane) {
    this.targetLaneX = Game3D.getLaneX(newLane);
  }
};

window.Player3D = Player3D;
