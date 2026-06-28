// ============================================================
// game3d.js — Three.js 3D 场景初始化（光照升级版）
// ============================================================

const Game3D = {
  scene: null, camera: null, renderer: null, clock: null,
  ambientLight: null, directionalLight: null, hemiLight: null,
  pointLights: [],
  worldGroup: null, laneGroup: null, obstacleGroup: null,
  collectibleGroup: null, playerGroup: null, cutlineGroup: null, effectGroup: null,
  gameData: null, scrollSpeed: 0, worldId: 1,
  laneWidth: 2.5,
  lanePositions: [-3.75, 0, 3.75],
  laneColors: [0x4CAF50, 0x2196F3, 0x9C27B0],
  skyDome: null,
  _resizeBound: false,

  async init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.scene) this._disposeScene(this.scene);
    this.scene = new THREE.Scene();

    if (!this.camera) {
      this.camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.5, 200);
    }
    this.camera.position.set(0, 5, 10);

    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.top = '0'; this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.zIndex = '1';
      container.insertBefore(this.renderer.domElement, container.firstChild);
    }
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.clock = new THREE.Clock();
    this.pointLights = [];

    // ===== 神庙逃亡风格光照：清晰阴影 + 环境光提亮 + 方向光增强立体感 =====
    // 半球光（天空暖色 + 地面冷色 = 自然立体感）
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x445566, 0.9);
    this.scene.add(this.hemiLight);

    // 环境光（整体提亮，避免暗面死黑）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(this.ambientLight);

    // 主方向光（太阳 — 高角度产生清晰阴影）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    this.directionalLight.position.set(10, 20, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 80;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    this.directionalLight.shadow.bias = -0.0003;
    this.directionalLight.shadow.normalBias = 0.02;
    this.scene.add(this.directionalLight);

    // 前方补光（角色正面不暗）
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
    frontLight.position.set(0, 2, -5);
    this.scene.add(frontLight);

    // 底部反弹光（地面反射，减少下方死黑）
    const bounceLight = new THREE.DirectionalLight(0x889999, 0.3);
    bounceLight.position.set(0, -1, 3);
    this.scene.add(bounceLight);

    // 对象容器
    this.worldGroup = new THREE.Group();
    this.laneGroup = new THREE.Group();
    this.obstacleGroup = new THREE.Group();
    this.collectibleGroup = new THREE.Group();
    this.playerGroup = new THREE.Group();
    this.cutlineGroup = new THREE.Group();
    this.effectGroup = new THREE.Group();
    this.scene.add(this.worldGroup, this.laneGroup, this.obstacleGroup,
      this.collectibleGroup, this.playerGroup, this.cutlineGroup, this.effectGroup);

    if (!this._resizeBound) {
      this._resizeBound = true;
      window.addEventListener('resize', () => this.onResize(container));
    }
  },

  onResize(container) {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  },

  _disposeScene(scene) {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  },

  setWorld(worldId) {
    this.worldId = worldId;
    const configs = {
      1: { sky: 0xB3E5FC, fog: 0xC8E6C9, fogN: 20, fogF: 90,  hemiSky: 0xFFF8E1, hemiGnd: 0x4a7c3f, sunColor: 0xffffff, sunInt: 3.0, ambInt: 1.2 },
      2: { sky: 0x90CAF9, fog: 0xB0BEC5, fogN: 18, fogF: 85,  hemiSky: 0xE3F2FD, hemiGnd: 0x546e7a, sunColor: 0xffffff, sunInt: 2.8, ambInt: 1.3 },
      3: { sky: 0xFFCC80, fog: 0xD7CCC8, fogN: 15, fogF: 75,  hemiSky: 0xFFF3E0, hemiGnd: 0x8d6e63, sunColor: 0xffeedd, sunInt: 2.8, ambInt: 1.0 },
      4: { sky: 0x311B92, fog: 0x311B92, fogN: 12, fogF: 60,  hemiSky: 0x7E57C2, hemiGnd: 0x1A237E, sunColor: 0xccccff, sunInt: 1.8, ambInt: 1.4 },
      5: { sky: 0xB71C1C, fog: 0x4A0000, fogN: 8,  fogF: 45,  hemiSky: 0xD32F2F, hemiGnd: 0x1B0000, sunColor: 0xff6666, sunInt: 1.5, ambInt: 1.5 }
    };
    const c = configs[worldId] || configs[1];
    this.scene.background = new THREE.Color(c.sky);
    this.scene.fog = new THREE.Fog(c.fog, c.fogN, c.fogF);
    if (this.hemiLight) {
      this.hemiLight.color.set(c.hemiSky);
      this.hemiLight.groundColor.set(c.hemiGnd);
    }
    if (this.directionalLight) {
      this.directionalLight.color.set(c.sunColor);
      this.directionalLight.intensity = c.sunInt;
    }
    if (this.ambientLight) this.ambientLight.intensity = c.ambInt;
    this.renderer.toneMappingExposure = worldId === 5 ? 0.8 : 1.0;

    // ===== 天空球（使用世界场景图） =====
    const worldAssetPath = 'assets/worlds/' + getWorldAssetPath(worldId);
    const texLoader = new THREE.TextureLoader();
    texLoader.load(worldAssetPath, (worldTex) => {
      worldTex.colorSpace = THREE.SRGBColorSpace;
      worldTex.minFilter = THREE.LinearFilter;
      worldTex.magFilter = THREE.LinearFilter;

      if (this.skyDome) {
        this.skyDome.material.map = worldTex;
        this.skyDome.material.needsUpdate = true;
      } else {
        const skyGeo = new THREE.SphereGeometry(90, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({ map: worldTex, side: THREE.BackSide, depthWrite: false });
        this.skyDome = new THREE.Mesh(skyGeo, skyMat);
        this.skyDome.renderOrder = -1;
        this.scene.add(this.skyDome);
      }
    });
  },

  getLaneX(laneIndex) { return this.lanePositions[laneIndex] || 0; },
  render() { this.renderer.render(this.scene, this.camera); },
  get delta() { return Math.min(this.clock.getDelta(), 0.1); }
};

window.Game3D = Game3D;
