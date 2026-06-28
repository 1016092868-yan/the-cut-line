// ============================================================
// player3d.js — 3D 角色（P4 升级：AI 纹理 + 精致模型）
// 使用 AI 角色卡牌图做纹理，保留 3D 身体结构
// ============================================================

const Player3D = {
  model: null, body: null, head: null, nameLabel: null,
  leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
  worldZ: 0, currentLaneX: 0, targetLaneX: 0,
  isJumping: false, isSliding: false,
  jumpTimer: 0, slideTimer: 0, bounceOffset: 0, runTime: 0,
  charTexture: null, faceTexture: null, glowRing: null,

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

    // 获取当前角色
    const char = GameState.selectedCharacter;
    const assetPath = 'assets/characters/' + getCharAssetPath(char);

    // 加载 AI 卡牌图
    const texLoader = new THREE.TextureLoader();
    this.charTexture = texLoader.load(assetPath);
    this.charTexture.colorSpace = THREE.SRGBColorSpace;
    this.charTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.charTexture.magFilter = THREE.LinearFilter;

    // 从卡牌图裁剪面部区域（用于头部纹理）
    // 面部在卡牌图上方 15%-45% 区域
    this.faceTexture = this.charTexture.clone();
    this.faceTexture.offset.set(0.15, 0.25);
    this.faceTexture.repeat.set(0.7, 0.35);
    this.faceTexture.needsUpdate = true;

    // 颜色方案：根据角色 ID 变化（从卡牌图无法实时取色，使用角色预设）
    const skinColors = [0xFFCC80, 0xF5D0A9, 0xE0AC69, 0xC68642, 0xFFE0BD, 0xD4A574];
    const shirtColors = [0x4488cc, 0x2E7D32, 0xC62828, 0x6A1B9A, 0xE65100, 0x37474F];
    const pantsColors = [0x37474F, 0x263238, 0x1B2631, 0x212121, 0x3E2723, 0x424242];
    const ci = (char.id - 1) % 6;
    const skinColor = skinColors[ci];
    const shirtColor = shirtColors[ci];
    const pantsColor = pantsColors[ci];

    // ===== 身体（更修长的比例）=====
    const bodyGeo = new THREE.CapsuleGeometry(0.32, 0.9, 8, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5, metalness: 0.08 });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.2;
    this.body.castShadow = true;
    this.body.receiveShadow = true;
    this.model.add(this.body);

    // 身体纹理带（从卡牌图中间裁剪衣服区域）
    if (this.charTexture) {
      const stripeTex = this.charTexture.clone();
      stripeTex.offset.set(0.0, 0.5);
      stripeTex.repeat.set(1.0, 0.3);
      stripeTex.needsUpdate = true;
      const stripeMat = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.5, metalness: 0.08, transparent: true, opacity: 0.5 });
      const stripeGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.4, 16, 1, true);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 1.3;
      this.model.add(stripe);
    }

    // ===== 头部（更大更明显）=====
    const headGeo = new THREE.SphereGeometry(0.30, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ map: this.faceTexture, roughness: 0.4, metalness: 0.02 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 2.05;
    this.head.castShadow = true;
    this.model.add(this.head);

    // 头发
    const hairGeo = new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.6 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.1;
    hair.scale.set(1, 0.4, 1);
    this.model.add(hair);

    // 后脑头发
    const backHairGeo = new THREE.SphereGeometry(0.31, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.y = 2.0;
    backHair.scale.set(1, 0.35, 0.7);
    this.model.add(backHair);

    // ===== 手臂 =====
    const armGeo = new THREE.CapsuleGeometry(0.09, 0.55, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.48, 1.5, 0);
    this.leftArm.castShadow = true;
    this.model.add(this.leftArm);
    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.48, 1.5, 0);
    this.rightArm.castShadow = true;
    this.model.add(this.rightArm);

    // 手
    const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const handMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4 });
    const lh = new THREE.Mesh(handGeo, handMat);
    lh.position.set(-0.48, 1.12, 0);
    this.model.add(lh);
    const rh = new THREE.Mesh(handGeo, handMat);
    rh.position.set(0.48, 1.12, 0);
    this.model.add(rh);

    // ===== 腿 =====
    const legGeo = new THREE.CapsuleGeometry(0.11, 0.65, 4, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.16, 0.45, 0);
    this.leftLeg.castShadow = true;
    this.model.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.16, 0.45, 0);
    this.rightLeg.castShadow = true;
    this.model.add(this.rightLeg);

    // 鞋
    const shoeGeo = new THREE.BoxGeometry(0.22, 0.12, 0.32);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.4 });
    const ls = new THREE.Mesh(shoeGeo, shoeMat);
    ls.position.set(-0.16, 0.06, 0.06);
    this.model.add(ls);
    const rs = new THREE.Mesh(shoeGeo, shoeMat);
    rs.position.set(0.16, 0.06, 0.06);
    this.model.add(rs);

    // ===== 配饰 =====
    // 领带
    const tieGeo = new THREE.BoxGeometry(0.05, 0.35, 0.02);
    const tieColor = [0xcc3333, 0x1565C0, 0x2E7D32, 0xF9A825, 0x6A1B9A, 0xBF360C][ci];
    const tieMat = new THREE.MeshStandardMaterial({ color: tieColor, roughness: 0.25, metalness: 0.1 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.45, 0.33);
    this.model.add(tie);

    // 腰带
    const beltGeo = new THREE.TorusGeometry(0.33, 0.03, 8, 16);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.3, metalness: 0.3 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.85;
    this.model.add(belt);

    // ===== 底部光晕 =====
    const glowGeo = new THREE.RingGeometry(0.3, 0.5, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, side: THREE.DoubleSide,
      transparent: true, opacity: 0.25, depthWrite: false
    });
    this.glowRing = new THREE.Mesh(glowGeo, glowMat);
    this.glowRing.rotation.x = -Math.PI / 2;
    this.glowRing.position.y = 0.02;
    this.model.add(this.glowRing);

    // 阴影盘
    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, side: THREE.DoubleSide,
      transparent: true, opacity: 0.3, depthWrite: false
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.model.add(shadow);

    this.model.position.set(this.currentLaneX, 0, this.worldZ);
    group.add(this.model);
  },

  _createNameLabel(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(20, 5, 216, 54, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "Noto Sans SC", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 40);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const geo = new THREE.PlaneGeometry(1.2, 0.3);
    const label = new THREE.Mesh(geo, mat);
    return label;
  },

  update(dt) {
    const gd = GameState.gameData;
    if (!gd) return;
    this.runTime += dt * 8;
    this.targetLaneX = Game3D.getLaneX(gd.currentLane);
    this.currentLaneX += (this.targetLaneX - this.currentLaneX) * 0.2;

    // 跑道切换
    const targetLane = Input.getTargetLane();
    if (targetLane !== null) {
      if (targetLane === 'left') Engine.switchToLane(gd.currentLane - 1);
      else if (targetLane === 'right') Engine.switchToLane(gd.currentLane + 1);
      else Engine.switchToLane(targetLane);
    }

    // 跳跃（持续按住检测 + 冷却）
    if ((Input.isDown('Space') || Input.isDown('ArrowUp') || Input.isDown('KeyW')) && !this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpTimer = 0.32;
    }
    if (this.isJumping) {
      this.jumpTimer -= dt;
      this.bounceOffset = Math.sin(Math.max(0, this.jumpTimer) / 0.32 * Math.PI) * 3.0;
      if (this.jumpTimer <= 0) { this.isJumping = false; this.bounceOffset = 0; }
    }

    // 下蹲（持续按住检测）
    if (Input.isDown('ArrowDown') && !this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = 0.32;
    }
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.isSliding = false;
    }

    // 行走动画
    const legSwing = Math.sin(this.runTime) * 0.55;
    this.leftLeg.rotation.x = legSwing;
    this.rightLeg.rotation.x = -legSwing;
    this.leftArm.rotation.x = -legSwing;
    this.rightArm.rotation.x = legSwing;

    // 下蹲缩放
    const slideScale = this.isSliding ? 0.5 : 1.0;
    this.model.scale.y += (slideScale - this.model.scale.y) * 0.25;

    // 呼吸效果
    const breathe = 1.0 + Math.sin(this.runTime * 0.5) * 0.015;
    this.model.scale.x = breathe;
    this.model.scale.z = breathe;

    // 位置更新
    this.model.position.x = this.currentLaneX;
    this.model.position.y = this.bounceOffset;
    this.model.position.z = this.worldZ;

    // 光晕脉冲
    if (this.glowRing) {
      const pulse = 0.2 + Math.sin(this.runTime * 2) * 0.08;
      this.glowRing.material.opacity = pulse;
      this.glowRing.scale.setScalar(1.0 + Math.sin(this.runTime * 1.5) * 0.1);
    }
  },

  startLaneSwitch(newLane) {
    this.targetLaneX = Game3D.getLaneX(newLane);
  }
};

window.Player3D = Player3D;
