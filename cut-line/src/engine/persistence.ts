// localStorage持久化 —— 跨局数据保存

const STORAGE_KEY = 'cut-line-save';

export interface SaveData {
  totalLxp: number;
  unlockedCharacterIds: number[];
  playthroughCount: number;
  characterPlaythroughs: Record<number, number>;
}

const defaultSave: SaveData = {
  totalLxp: 0,
  unlockedCharacterIds: [1, 2, 3, 4, 5, 6],
  playthroughCount: 0,
  characterPlaythroughs: {},
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSave };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      totalLxp: parsed.totalLxp ?? 0,
      unlockedCharacterIds: parsed.unlockedCharacterIds ?? defaultSave.unlockedCharacterIds,
      playthroughCount: parsed.playthroughCount ?? 0,
      characterPlaythroughs: parsed.characterPlaythroughs ?? {},
    };
  } catch (e) {
    console.warn('Failed to load save data:', e);
    return { ...defaultSave };
  }
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save data:', e);
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear save:', e);
  }
}
