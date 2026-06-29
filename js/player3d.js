// ============================================================
// player3d.js — 3D角色（GLB模型优先 + 高质量纹理程序化回退）
// v3: 使用 CharacterTextures 生成细腻贴图
// ============================================================

const Player3D = {
  model: null, body: null, head: null,
  leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
  leftHand: null, rightHand: null, leftShoe: null, rightShoe: null,
  hairGroup: null, shadowDisc: null, glowRing: null,
  worldZ: 0, currentLaneX: 0, targetLaneX: 0,
  isJumping: false, isSliding: false,
  jumpTimer: 0, slideTimer: 0, bounceOffset: 0, runTime: 0,
  isGLB: false, textures: null,

  async init() {
    const group = Game3D.playerGroup;
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        else child.material.dispose();
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
    if (!char) return;

    // 尝试加载 GLB 模型
    const glbPath = ModelLoader.getCharacterPath(char.id);
    const glbModel = await ModelLoader.load('char-' + char.id, glbPath);

    if (glbModel) {
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
      this.isGLB = false;
      this._buildTextured(group, char);
      console.log('[Player3D] 使用纹理程序化模型: char-' + char.id);
    }
  },

  _buildTextured(group, char) {
    try {
      this._buildTexturedInner(group, char);
    } catch(e) {
      console.error('[Player3D] 纹理构建失败，回退到简单模型:', e.message);
      this._buildSimple(group, char);
    }
  },

  _buildTexturedInner(group, char) {
    this.model = new THREE.Group();

    // 获取角色纹理
    this.textures = CharacterTextures.getCharacterTextures(char.id);
    if (!this.textures) { this._buildSimple(group, char); return; }

    const tx = this.textures;

    // ===== 光照参考：MeshToonMaterial 卡通风格 =====

    // === 身体（躯干） ===
    const bodyGeo = new THREE.CapsuleGeometry(0.30, 0.95, 12, 20);
    // 用前端贴图
    const bodyTex = tx.bodyFront;
    bodyTex.wrapS = THREE.ClampToEdgeWrapping;
    bodyTex.wrapT = THREE.ClampToEdgeWrapping;
    bodyTex.repeat.set(1, 1);
    const bodyMat = new THREE.MeshToonMaterial({
      map: bodyTex,
      gradientMap: null,
    });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.25;
    this.body.castShadow = true;
    this.body.receiveShadow = true;
    this.model.add(this.body);

    // === 头部 ===
    const headGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const faceTex = tx.face;
    faceTex.wrapS = THREE.ClampToEdgeWrapping;
    faceTex.wrapT = THREE.ClampToEdgeWrapping;
    const headMat = new THREE.MeshToonMaterial({
      map: faceTex,
      gradientMap: null,
    });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 2.1;
    this.head.castShadow = true;
    this.model.add(this.head);

    // === 头发 ===
    this.hairGroup = new THREE.Group();
    const hairColorHex = parseInt((tx.hair || '#3E2723').replace('#', ''), 16);
    const hairMat = new THREE.MeshToonMaterial({ color: hairColorHex });
    // 顶部
    const hairTopGeo = new THREE.SphereGeometry(0.30, 16, 12, 0, Math.PI*2, 0, Math.PI*0.55);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.y = 2.18;
    hairTop.scale.set(1, 0.45, 1);
    this.hairGroup.add(hairTop);
    // 后部
    const hairBackGeo = new THREE.SphereGeometry(0.29, 14, 10, 0, Math.PI*2, Math.PI*0.48, Math.PI*0.42);
    const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
    hairBack.position.set(0, 2.08, -0.06);
    hairBack.scale.set(1, 0.4, 0.65);
    this.hairGroup.add(hairBack);
    // 两侧（鬓角）
    for (let s = -1; s <= 1; s += 2) {
      const sideGeo = new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI*2, Math.PI*0.4, Math.PI*0.3);
      const sideHair = new THREE.Mesh(sideGeo, hairMat);
      sideHair.position.set(s*0.24, 2.05, 0.08);
      this.hairGroup.add(sideHair);
    }
    this.model.add(this.hairGroup);

    // === 手臂 ===
    const armGeo = new THREE.CapsuleGeometry(0.085, 0.60, 8, 12);
    const armTex = tx.arm;
    armTex.wrapS = THREE.ClampToEdgeWrapping;
    armTex.wrapT = THREE.ClampToEdgeWrapping;
    const armMat = new THREE.MeshToonMaterial({ map: armTex, gradientMap: null });

    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.46, 1.55, 0.02);
    this.leftArm.rotation.z = 0.1;
    this.leftArm.castShadow = true;
    this.model.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.46, 1.55, 0.02);
    this.rightArm.rotation.z = -0.1;
    this.rightArm.castShadow = true;
    this.model.add(this.rightArm);

    // 手（肤色球体）
    const handGeo = new THREE.SphereGeometry(0.085, 12, 12);
    const skinColorHex = parseInt((tx.skin || '#FFCC80').replace('#', ''), 16);
    const handMat = new THREE.MeshToonMaterial({ color: skinColorHex });
    this.leftHand = new THREE.Mesh(handGeo, handMat);
    this.leftHand.position.set(-0.46, 1.13, 0.05);
    this.model.add(this.leftHand);
    this.rightHand = new THREE.Mesh(handGeo, handMat);
    this.rightHand.position.set(0.46, 1.13, 0.05);
    this.model.add(this.rightHand);

    // === 腿 ===
    const legGeo = new THREE.CapsuleGeometry(0.105, 0.70, 8, 12);
    const legTex = tx.leg;
    legTex.wrapS = THREE.ClampToEdgeWrapping;
    legTex.wrapT = THREE.ClampToEdgeWrapping;
    const legMat = new THREE.MeshToonMaterial({ map: legTex, gradientMap: null });

    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.15, 0.48, 0);
    this.leftLeg.castShadow = true;
    this.model.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.15, 0.48, 0);
    this.rightLeg.castShadow = true;
    this.model.add(this.rightLeg);

    // === 鞋 ===
    const shoeTex = tx.shoe;
    shoeTex.wrapS = THREE.ClampToEdgeWrapping;
    shoeTex.wrapT = THREE.ClampToEdgeWrapping;

    // 左鞋主体
    const shoeBodyGeo = new THREE.BoxGeometry(0.20, 0.14, 0.34, 4, 4, 4);
    const shoeMat = new THREE.MeshToonMaterial({ map: shoeTex, gradientMap: null });
    this.leftShoe = new THREE.Mesh(shoeBodyGeo, shoeMat);
    this.leftShoe.position.set(-0.15, 0.07, 0.08);
    this.leftShoe.castShadow = true;
    this.model.add(this.leftShoe);

    // 右鞋
    this.rightShoe = new THREE.Mesh(shoeBodyGeo, shoeMat);
    this.rightShoe.position.set(0.15, 0.07, 0.08);
    this.rightShoe.castShadow = true;
    this.model.add(this.rightShoe);

    // === 阴影盘 ===
    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, side: THREE.DoubleSide,
      transparent: true, opacity: 0.35, depthWrite: false
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.005;
    this.model.add(this.shadowDisc);

    // === 光晕 ===
    const accentCol = parseInt((tx.accentColor || '#cc3333').replace('#', ''), 16);
    const glowGeo = new THREE.RingGeometry(0.25, 0.45, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: accentCol, side: THREE.DoubleSide,
      transparent: true, opacity: 0.18, depthWrite: false
    });
    this.glowRing = new THREE.Mesh(glowGeo, glowMat);
    this.glowRing.rotation.x = -Math.PI / 2;
    this.glowRing.position.y = 0.015;
    this.model.add(this.glowRing);

    this.model.position.set(this.currentLaneX, 0, this.worldZ);
    group.add(this.model);
  },

  // 极简回退（无纹理时）
  _buildSimple(group, char) {
    this.model = new THREE.Group();
    const cs = [
      { skin: 0xFFCC80, hair: 0x3E2723, top: 0x4488cc, bottom: 0x37474F, shoe: 0x2c2c2c, accent: 0xcc3333 },
      { skin: 0xF5D0A9, hair: 0x1a1a1a, top: 0x2E7D32, bottom: 0x263238, shoe: 0x3E2723, accent: 0x1565C0 },
      { skin: 0xE0AC69, hair: 0x4E342E, top: 0xC62828, bottom: 0x1B2631, shoe: 0x424242, accent: 0xFFD700 },
      { skin: 0xC68642, hair: 0x212121, top: 0x6A1B9A, bottom: 0x212121, shoe: 0x111111, accent: 0xFF9800 },
      { skin: 0xFFE0BD, hair: 0x5D4037, top: 0xE65100, bottom: 0x3E2723, shoe: 0x4E342E, accent: 0x2196F3 },
      { skin: 0xD4A574, hair: 0x1B1B1B, top: 0x37474F, bottom: 0x424242, shoe: 0x1a1a1a, accent: 0x4CAF50 },
    ][(char.id - 1) % 6];

    const bodyGeo = new THREE.CapsuleGeometry(0.30, 0.95, 8, 14);
    this.body = new THREE.Mesh(bodyGeo, new THREE.MeshToonMaterial({ color: cs.top }));
    this.body.position.y = 1.25; this.body.castShadow = true; this.body.receiveShadow = true;
    this.model.add(this.body);

    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    this.head = new THREE.Mesh(headGeo, new THREE.MeshToonMaterial({ color: cs.skin }));
    this.head.position.y = 2.1; this.head.castShadow = true;
    this.model.add(this.head);

    const armGeo = new THREE.CapsuleGeometry(0.085, 0.60, 4, 8);
    const armMat = new THREE.MeshToonMaterial({ color: cs.top });
    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.46, 1.55, 0.02); this.leftArm.rotation.z = 0.1; this.leftArm.castShadow = true;
    this.model.add(this.leftArm);
    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.46, 1.55, 0.02); this.rightArm.rotation.z = -0.1; this.rightArm.castShadow = true;
    this.model.add(this.rightArm);

    const legGeo = new THREE.CapsuleGeometry(0.105, 0.70, 4, 8);
    const legMat = new THREE.MeshToonMaterial({ color: cs.bottom });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.15, 0.48, 0); this.leftLeg.castShadow = true;
    this.model.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.15, 0.48, 0); this.rightLeg.castShadow = true;
    this.model.add(this.rightLeg);

    const shoeGeo = new THREE.BoxGeometry(0.20, 0.14, 0.34);
    const shoeMat = new THREE.MeshToonMaterial({ color: cs.shoe });
    this.leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    this.leftShoe.position.set(-0.15, 0.07, 0.08); this.leftShoe.castShadow = true;
    this.model.add(this.leftShoe);
    this.rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    this.rightShoe.position.set(0.15, 0.07, 0.08); this.rightShoe.castShadow = true;
    this.model.add(this.rightShoe);

    this.model.position.set(this.currentLaneX, 0, this.worldZ);
    group.add(this.model);
  },

  update(dt) {
    if (!this.model) return;
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
    if (this.leftLeg && this.rightLeg) {
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
    }
    if (this.leftArm && this.rightArm) {
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.8;
    }

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
