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

    // ===== 丰富的光照系统 =====
    // 半球光（天空+地面）
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x889966, 1.0);
    this.scene.add(this.hemiLight);

    // 环境光（提亮暗面）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);

    // 主方向光（太阳）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.directionalLight.position.set(15, 25, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 80;
    this.directionalLight.shadow.camera.left = -25;
    this.directionalLight.shadow.camera.right = 25;
    this.directionalLight.shadow.camera.top = 25;
    this.directionalLight.shadow.camera.bottom = -25;
    this.directionalLight.shadow.bias = -0.0005;
    this.scene.add(this.directionalLight);

    // 后方补光（减少正面过暗）
    const backLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    backLight.position.set(0, 3, 10);
    this.scene.add(backLight);

    // 底部补光（减少下方过暗）
    const bottomLight = new THREE.DirectionalLight(0x889966, 0.4);
    bottomLight.position.set(0, -1, 5);
    this.scene.add(bottomLight);

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
      1: { sky: 0x87CEEB, fog: 0xC8E6C9, fogN: 25, fogF: 110, hemiSky: 0x87CEEB, hemiGnd: 0x4a7c3f, sunColor: 0xffeedd, sunInt: 1.8, ambInt: 0.6 },
      2: { sky: 0x90CAF9, fog: 0xB0BEC5, fogN: 25, fogF: 100, hemiSky: 0x90CAF9, hemiGnd: 0x546e7a, sunColor: 0xffffff, sunInt: 1.5, ambInt: 0.7 },
      3: { sky: 0xFFCC80, fog: 0xBCAAA4, fogN: 20, fogF: 90,  hemiSky: 0xFFCC80, hemiGnd: 0x8d6e63, sunColor: 0xffcc88, sunInt: 1.6, ambInt: 0.5 },
      4: { sky: 0x4A148C, fog: 0x311B92, fogN: 15, fogF: 80,  hemiSky: 0x7E57C2, hemiGnd: 0x311B92, sunColor: 0xccccff, sunInt: 1.0, ambInt: 0.8 },
      5: { sky: 0xB71C1C, fog: 0x4A0000, fogN: 10, fogF: 60,  hemiSky: 0xD32F2F, hemiGnd: 0x3E0000, sunColor: 0xff4444, sunInt: 0.8, ambInt: 0.9 }
    };
    const c = configs[worldId] || configs[1];
    this.scene.background = new THREE.Color(c.sky);
    this.scene.fog = new THREE.Fog(c.sky, c.fogN, c.fogF);
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
  },

  getLaneX(laneIndex) { return this.lanePositions[laneIndex] || 0; },
  render() { this.renderer.render(this.scene, this.camera); },
  get delta() { return Math.min(this.clock.getDelta(), 0.1); }
};

window.Game3D = Game3D;
