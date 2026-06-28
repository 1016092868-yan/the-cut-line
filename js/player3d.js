// ============================================================
// player3d.js — 3D 角色（纹理升级版）
// ============================================================

const Player3D = {
  model: null, body: null, head: null,
  leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
  worldZ: 0, currentLaneX: 0, targetLaneX: 0,
  isJumping: false, isSliding: false,
  jumpTimer: 0, slideTimer: 0, bounceOffset: 0, runTime: 0,

  init() {
    const group = Game3D.playerGroup;
    while (group.children.length > 0) group.remove(group.children[0]);
    this.model = new THREE.Group();
    this.worldZ = 0;
    this.currentLaneX = Game3D.getLaneX(1);
    this.targetLaneX = this.currentLaneX;
    this.isJumping = this.isSliding = false;
    this.jumpTimer = this.slideTimer = this.bounceOffset = this.runTime = 0;

    const skinColor = 0xFFCC80;
    const shirtColor = 0x4488cc;
    const pantsColor = 0x37474F;
    const shoeColor = 0x333333;
    const faceTex = Textures.face('#FFCC80', '#2c1810');
    const shirtTex = Textures.shirt('#4488cc', 'stripe');
    faceTex.colorSpace = THREE.SRGBColorSpace;
    shirtTex.colorSpace = THREE.SRGBColorSpace;

    // 身体
    const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.8, 6, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.6, metalness: 0.05 });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.1;
    this.body.castShadow = true;
    this.model.add(this.body);

    // 头
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 1.9;
    this.head.castShadow = true;
    this.model.add(this.head);

    // 头发（简单几何体）
    const hairGeo = new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.95;
    hair.scale.set(1, 0.35, 1);
    this.model.add(hair);

    // 手臂
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    this.leftArm = new THREE.Mesh(armGeo, armMat); this.leftArm.position.set(-0.5, 1.4, 0); this.leftArm.castShadow = true; this.model.add(this.leftArm);
    this.rightArm = new THREE.Mesh(armGeo, armMat); this.rightArm.position.set(0.5, 1.4, 0); this.rightArm.castShadow = true; this.model.add(this.rightArm);

    // 手
    const handGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const handMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    const lh = new THREE.Mesh(handGeo, handMat); lh.position.set(-0.5, 1.05, 0); this.model.add(lh);
    const rh = new THREE.Mesh(handGeo, handMat); rh.position.set(0.5, 1.05, 0); this.model.add(rh);

    // 腿
    const legGeo = new THREE.CapsuleGeometry(0.12, 0.6, 4, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
    this.leftLeg = new THREE.Mesh(legGeo, legMat); this.leftLeg.position.set(-0.18, 0.4, 0); this.leftLeg.castShadow = true; this.model.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(legGeo, legMat); this.rightLeg.position.set(0.18, 0.4, 0); this.rightLeg.castShadow = true; this.model.add(this.rightLeg);

    // 鞋
    const shoeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.3);
    const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5 });
    const ls = new THREE.Mesh(shoeGeo, shoeMat); ls.position.set(-0.18, 0.05, 0.05); this.model.add(ls);
    const rs = new THREE.Mesh(shoeGeo, shoeMat); rs.position.set(0.18, 0.05, 0.05); this.model.add(rs);

    // 领带（装饰）
    const tieGeo = new THREE.BoxGeometry(0.06, 0.3, 0.02);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.3 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.3, 0.35);
    this.model.add(tie);

    this.model.position.set(this.currentLaneX, 0, this.worldZ);
    group.add(this.model);
  },

  update(dt) {
    const gd = GameState.gameData; if (!gd) return;
    this.runTime += dt * 8;
    this.targetLaneX = Game3D.getLaneX(gd.currentLane);
    this.currentLaneX += (this.targetLaneX - this.currentLaneX) * 0.2;

    const targetLane = Input.getTargetLane();
    if (targetLane !== null) {
      if (targetLane === 'left') Engine.switchToLane(gd.currentLane - 1);
      else if (targetLane === 'right') Engine.switchToLane(gd.currentLane + 1);
      else Engine.switchToLane(targetLane);
    }

    // 跳跃：使用 isDown 检测持续按住（更灵敏），配合跳跃冷却
    if (Input.isDown('Space') && !this.isJumping && !this.isSliding) { this.isJumping = true; this.jumpTimer = 0.35; }
    if (this.isJumping) {
      this.jumpTimer -= dt;
      this.bounceOffset = Math.sin(Math.max(0, this.jumpTimer) / 0.35 * Math.PI) * 2.8;
      if (this.jumpTimer <= 0) { this.isJumping = false; this.bounceOffset = 0; }
    }

    // 下蹲：使用 isDown 检测持续按住
    if (Input.isDown('ArrowDown') && !this.isSliding && !this.isJumping) { this.isSliding = true; this.slideTimer = 0.35; }
    if (this.isSliding) { this.slideTimer -= dt; if (this.slideTimer <= 0) this.isSliding = false; }

    const legSwing = Math.sin(this.runTime) * 0.6;
    this.leftLeg.rotation.x = legSwing; this.rightLeg.rotation.x = -legSwing;
    this.leftArm.rotation.x = -legSwing; this.rightArm.rotation.x = legSwing;

    const slideScale = this.isSliding ? 0.5 : 1.0;
    this.model.scale.y += (slideScale - this.model.scale.y) * 0.2;
    this.model.position.x = this.currentLaneX;
    this.model.position.y = this.bounceOffset;
    this.model.position.z = this.worldZ;
  },

  startLaneSwitch(newLane) { this.targetLaneX = Game3D.getLaneX(newLane); }
};

window.Player3D = Player3D;
