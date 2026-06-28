// ============================================================
// modelLoader.js — GLB 模型加载与管理
// 支持角色模型、道具模型、障碍物模型的异步加载和缓存
// ============================================================

const ModelLoader = {
  loader: null,
  cache: {},

  init() {
    this.loader = new THREE.GLTFLoader();
  },

  /** 加载单个模型（带缓存） */
  async load(key, path) {
    if (this.cache[key]) return this.cache[key].clone();
    if (!this.loader) this.init();

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.cache[key] = gltf.scene;
          resolve(gltf.scene.clone());
        },
        (progress) => {
          // 加载进度（可选）
          if (progress.total > 0) {
            const pct = Math.round(progress.loaded / progress.total * 100);
            if (pct % 25 === 0) console.log(`[ModelLoader] ${key}: ${pct}%`);
          }
        },
        (err) => {
          console.warn(`[ModelLoader] 加载失败: ${key} (${path})`, err.message);
          resolve(null); // 返回 null 让调用方回退到程序化模型
        }
      );
    });
  },

  /** 预加载多个模型 */
  async preload(list) {
    const results = await Promise.allSettled(
      list.map(({ key, path }) => this.load(key, path))
    );
    const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[ModelLoader] 预加载完成: ${loaded}/${list.length}`);
    return loaded;
  },

  /** 获取角色模型路径 */
  getCharacterPath(charId) {
    return `assets/models/char-${String(charId).padStart(2, '0')}.glb`;
  },

  /** 获取障碍物模型路径 */
  getObstaclePath(typeName) {
    return `assets/models/obstacle-${typeName}.glb`;
  },

  /** 获取道具模型路径 */
  getItemPath(itemName) {
    return `assets/models/item-${itemName}.glb`;
  }
};

window.ModelLoader = ModelLoader;
