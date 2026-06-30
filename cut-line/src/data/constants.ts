// 跨局常量 —— 从gameStore中提取的魔法数字

export const LXP_UNLOCK_THRESHOLDS: Array<{ lxp: number; characterIds: number[] }> = [
  { lxp: 200, characterIds: [7, 8] },
  { lxp: 500, characterIds: [9, 10] },
  { lxp: 1000, characterIds: [11, 12, 13] },
  { lxp: 2000, characterIds: [14, 15, 16] },
  { lxp: 3500, characterIds: [17, 18, 19, 20] },
];

export const STARTER_CHARACTER_IDS = [1, 2, 3, 4, 5, 6];

export const PAST_LIFE_CASH_BONUS = 2000;
export const GRAY_SURVIVOR_THRESHOLD_HOURS = 30;
export const LXP_BASE_COMPLETION = 100;
export const LXP_PER_10K_NETWORTH = 5;
export const LXP_MAX_WEALTH_BONUS = 500;
export const LXP_FIRST_CHARACTER_BONUS = 200;
export const LXP_AWAKENED_BONUS = 500;

export function calculateEarnedLxp(
  netWorth: number,
  ending: string,
  isFirstPlaythrough: boolean,
): number {
  const base = LXP_BASE_COMPLETION;
  const wealth = Math.min(LXP_MAX_WEALTH_BONUS, Math.floor(netWorth / 10000) * LXP_PER_10K_NETWORTH);
  const endingBonus = ending === 'awakened' ? LXP_AWAKENED_BONUS : 0;
  const firstTime = isFirstPlaythrough ? LXP_FIRST_CHARACTER_BONUS : 0;
  return base + wealth + endingBonus + firstTime;
}

export function getUnlockedCharacters(totalLxp: number, currentUnlocked: number[]): number[] {
  const unlocked = [...currentUnlocked];
  for (const threshold of LXP_UNLOCK_THRESHOLDS) {
    if (totalLxp >= threshold.lxp) {
      threshold.characterIds.forEach(id => {
        if (!unlocked.includes(id)) unlocked.push(id);
      });
    }
  }
  return unlocked;
}
