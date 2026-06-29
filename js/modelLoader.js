// ============================================================
// modelLoader.js — GLB 模型加载与管理
// 支持角色模型、道具模型、障碍物模型的异步加载和缓存
// ============================================================

const ModelLoader = {
  loader: null,
  cache: {},

  init() {
    if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
      this.loader = new THREE.GLTFLoader();
      this._available = true;
    } else {
      console.warn('[ModelLoader] THREE.GLTFLoader 不可用，GLB加载已禁用');
      this._available = false;
    }
  },

  /** 加载单个模型（带缓存 + 超时回退） */
  async load(key, path) {
    if (this.cache[key]) return this.cache[key].clone();
    if (this.loader === null) this.init();
    if (!this._available) return null; // GLTFLoader不可用，直接返回null走程序化回退

    return new Promise((resolve) => {
      let settled = false;

      // 超时保护：3秒后自动回退到程序化模型
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          console.warn(`[ModelLoader] 超时: ${key} — 回退到程序化模型`);
          resolve(null);
        }
      }, 3000);

      try {
        this.loader.load(
          path,
          (gltf) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            this.cache[key] = gltf.scene;
            resolve(gltf.scene.clone());
          },
          (progress) => {
            // 加载进度
            if (progress.total > 0) {
              const pct = Math.round(progress.loaded / progress.total * 100);
              if (pct % 25 === 0) console.log(`[ModelLoader] ${key}: ${pct}%`);
            }
          },
          (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            console.warn(`[ModelLoader] 加载失败: ${key}`, err?.message || err);
            resolve(null);
          }
        );
      } catch (e) {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          console.warn(`[ModelLoader] 异常: ${key}`, e.message);
          resolve(null);
        }
      }
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
