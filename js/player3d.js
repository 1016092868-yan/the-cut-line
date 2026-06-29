// ============================================================
// player3d.js — 3D角色（GLB模型优先 + 程序化回退）
// 优先加载 assets/models/char-XX.glb，失败则用程序化模型
// ============================================================

const Player3D = {
  model: null, body: null, head: null,
  leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
  worldZ: 0, currentLaneX: 0, targetLaneX: 0,
  isJumping: false, isSliding: false,
  jumpTimer: 0, slideTimer: 0, bounceOffset: 0, runTime: 0,
  glowRing: null,
  isGLB: false,

  async init() {
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
    this.worldZ = 0;
    this.currentLaneX = Game3D.getLaneX(1);
    this.targetLaneX = this.currentLaneX;
    this.isJumping = this.isSliding = false;
    this.jumpTimer = this.slideTimer = this.bounceOffset = this.runTime = 0;

    const char = GameState.selectedCharacter;

    // 尝试加载 GLB 模型
    const glbPath = ModelLoader.getCharacterPath(char.id);
    const glbModel = await ModelLoader.load('char-' + char.id, glbPath);

    if (glbModel) {
      // ✅ 使用 GLB 模型
      this.isGLB = true;
      this.model = glbModel;
      this.model.scale.set(1.2, 1.2, 1.2);
      this.model.position.set(this.currentLaneX, 0, this.worldZ);
      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      group.add(this.model);
      console.log('[Player3D] 使用GLB模型: char-' + char.id);
    } else {
      // ❌ 回退到程序化模型
      this.isGLB = false;
      this._buildProcedural(group, char);
      console.log('[Player3D] 回退到程序化模型: char-' + char.id);
    }
  },

  _buildProcedural(group, char) {
    // ===== 原有程序化建模代码（保持不变）=====

    // 配色方案 — 鲜明对比，每个角色不同
    const schemes = [
      { skin: 0xFFCC80, hair: 0x3E2723, top: 0x4488cc, bottom: 0x37474F, shoe: 0x2c2c2c, accent: 0xcc3333 },
      { skin: 0xF5D0A9, hair: 0x1a1a1a, top: 0x2E7D32, bottom: 0x263238, shoe: 0x3E2723, accent: 0x1565C0 },
      { skin: 0xE0AC69, hair: 0x4E342E, top: 0xC62828, bottom: 0x1B2631, shoe: 0x424242, accent: 0xFFD700 },
      { skin: 0xC68642, hair: 0x212121, top: 0x6A1B9A, bottom: 0x212121, shoe: 0x111111, accent: 0xFF9800 },
      { skin: 0xFFE0BD, hair: 0x5D4037, top: 0xE65100, bottom: 0x3E2723, shoe: 0x4E342E, accent: 0x2196F3 },
      { skin: 0xD4A574, hair: 0x1B1B1B, top: 0x37474F, bottom: 0x424242, shoe: 0x1a1a1a, accent: 0x4CAF50 },
    ];
    const ci = (char.id - 1) % 6;
    const cs = schemes[ci];

    // ===== 使用 MeshToonMaterial 实现卡通渲染（神庙逃亡风格关键！）=====
    // ToonMaterial = 清晰的明暗分界 + 光泽高光，简洁但不简陋

    // === 身体（修身比例，增加衣物细节）===
    const bodyGeo = new THREE.CapsuleGeometry(0.30, 0.95, 12, 20);
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

    // 腰带
    const beltGeo = new THREE.TorusGeometry(0.30, 0.03, 8, 16);
    const beltMat = new THREE.MeshToonMaterial({ color: 0x333333 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.72;
    this.model.add(belt);

    // 衣服拉链线
    const zipGeo = new THREE.BoxGeometry(0.02, 0.45, 0.02);
    const zipMat = new THREE.MeshToonMaterial({ color: cs.accent });
    const zip = new THREE.Mesh(zipGeo, zipMat);
    zip.position.set(0, 1.25, 0.30);
    this.model.add(zip);

    // === 头部（Canvas绘制面部贴图）===
    const headGeo = new THREE.SphereGeometry(0.28, 24, 24);
    // 用Canvas生成面部贴图
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256; faceCanvas.height = 256;
    const fctx = faceCanvas.getContext('2d');
    // 肤色底
    fctx.fillStyle = '#' + cs.skin.toString(16).padStart(6, '0');
    fctx.fillRect(0, 0, 256, 256);
    // 脸颊红润
    const blushGrad = fctx.createRadialGradient(70, 140, 10, 70, 140, 50);
    blushGrad.addColorStop(0, 'rgba(255,120,120,0.2)');
    blushGrad.addColorStop(1, 'rgba(255,120,120,0)');
    fctx.fillStyle = blushGrad; fctx.fillRect(0, 0, 256, 256);
    const blushGrad2 = fctx.createRadialGradient(186, 140, 10, 186, 140, 50);
    blushGrad2.addColorStop(0, 'rgba(255,120,120,0.2)');
    blushGrad2.addColorStop(1, 'rgba(255,120,120,0)');
    fctx.fillStyle = blushGrad2; fctx.fillRect(0, 0, 256, 256);
    // 眉毛
    fctx.fillStyle = '#' + cs.hair.toString(16).padStart(6, '0');
    fctx.beginPath(); fctx.ellipse(70, 92, 28, 8, 0, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.ellipse(186, 92, 28, 8, 0, 0, Math.PI*2); fctx.fill();
    // 眼白
    fctx.fillStyle = '#ffffff';
    fctx.beginPath(); fctx.ellipse(70, 112, 22, 14, 0, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.ellipse(186, 112, 22, 14, 0, 0, Math.PI*2); fctx.fill();
    // 虹膜
    fctx.fillStyle = '#5D4037';
    fctx.beginPath(); fctx.arc(70, 112, 10, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.arc(186, 112, 10, 0, Math.PI*2); fctx.fill();
    // 瞳孔
    fctx.fillStyle = '#000';
    fctx.beginPath(); fctx.arc(70, 112, 5, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.arc(186, 112, 5, 0, Math.PI*2); fctx.fill();
    // 高光
    fctx.fillStyle = '#fff';
    fctx.beginPath(); fctx.arc(67, 109, 2, 0, Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.arc(183, 109, 2, 0, Math.PI*2); fctx.fill();
    // 鼻子
    fctx.fillStyle = 'rgba(0,0,0,0.1)';
    fctx.beginPath(); fctx.ellipse(128, 140, 8, 5, 0, 0, Math.PI*2); fctx.fill();
    // 嘴
    fctx.fillStyle = '#c96b7a';
    fctx.beginPath();
    fctx.moveTo(90, 170); fctx.quadraticCurveTo(128, 178, 166, 170);
    fctx.quadraticCurveTo(128, 185, 90, 170);
    fctx.fill();

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.minFilter = THREE.LinearFilter;
    faceTex.magFilter = THREE.LinearFilter;
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

    // 手（手掌+手指，更像真人）
    // 左手掌
    const palmGeo = new THREE.BoxGeometry(0.10, 0.08, 0.12);
    const palmMat = new THREE.MeshToonMaterial({ color: cs.skin });
    const lPalm = new THREE.Mesh(palmGeo, palmMat);
    lPalm.position.set(-0.46, 1.15, 0.05);
    this.model.add(lPalm);
    const rPalm = new THREE.Mesh(palmGeo, palmMat);
    rPalm.position.set(0.46, 1.15, 0.05);
    this.model.add(rPalm);
    // 手指（左右各4根小圆柱）
    for (let s = -1; s <= 1; s += 2) {
      for (let f = 0; f < 4; f++) {
        const fingerGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.08, 6);
        const finger = new THREE.Mesh(fingerGeo, palmMat);
        finger.position.set(s*0.46 + (f-1.5)*0.028, 1.08, 0.10);
        finger.rotation.x = 0.3;
        this.model.add(finger);
      }
    }

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

    // === 鞋（多层运动鞋造型）===
    for (let s = -1; s <= 1; s += 2) {
      const sx = s * 0.15;
      // 鞋底
      const soleGeo = new THREE.BoxGeometry(0.22, 0.06, 0.36);
      const soleMat = new THREE.MeshToonMaterial({ color: 0x111111 });
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.set(sx, 0.04, 0.08);
      sole.castShadow = true;
      this.model.add(sole);
      // 鞋身
      const bodyGeo2 = new THREE.BoxGeometry(0.20, 0.12, 0.32);
      const bodyMat2 = new THREE.MeshToonMaterial({ color: cs.shoe });
      const body2 = new THREE.Mesh(bodyGeo2, bodyMat2);
      body2.position.set(sx, 0.12, 0.08);
      body2.castShadow = true;
      this.model.add(body2);
      // 鞋头（白色）
      const toeGeo2 = new THREE.BoxGeometry(0.18, 0.07, 0.10);
      const toeMat2 = new THREE.MeshToonMaterial({ color: 0xeeeeee });
      const toe2 = new THREE.Mesh(toeGeo2, toeMat2);
      toe2.position.set(sx, 0.13, 0.23);
      this.model.add(toe2);
      // 鞋带区
      const laceGeo = new THREE.BoxGeometry(0.14, 0.02, 0.08);
      const laceMat = new THREE.MeshToonMaterial({ color: 0xcccccc });
      const lace = new THREE.Mesh(laceGeo, laceMat);
      lace.position.set(sx, 0.18, 0.15);
      this.model.add(lace);
    }

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
