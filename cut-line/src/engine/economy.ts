// 经济结算引擎 —— 对齐统一参数表v1.2

import type { Character } from '../data/characters';
import { GAME_CONFIG, TIME_BLOCKS } from '../data/gameConfig';

export interface TimeBlockAllocation {
  work: number;     // 固定60h
  overtime: number; // 0-20h
  social: number;   // 0-15h
  learning: number; // 0-10h
  rest: number;     // 0-20h
  gray: number;     // 0-15h
}

export interface MonthlyResult {
  income: number;
  expense: number;
  netCashFlow: number;
  netWorth: number;
  stamina: number;
  social: number;
  cutlineTriggers: number;
  grayTotalHours: number;
}

export function calculateIncome(char: Character, alloc: TimeBlockAllocation, monthlyWageOverride?: number): number {
  const wage = monthlyWageOverride ?? char.hourlyWage;
  const workIncome = wage * GAME_CONFIG.workHoursFixed;
  const overtimeIncome = char.overtimeMax > 0
    ? wage * TIME_BLOCKS.overtime.incomeMultiplier * alloc.overtime
    : 0;
  const grayIncome = char.grayAvailable
    ? TIME_BLOCKS.gray.incomePerHour * alloc.gray
    : 0;
  return workIncome + overtimeIncome + grayIncome;
}

export function calculateExpense(char: Character, billMultiplier: number, unexpectedExpense = 0): number {
  const fixedBills = char.monthlyExpenseTotal * billMultiplier;
  return fixedBills + unexpectedExpense;
}

export function calculateStaminaChange(
  char: Character,
  alloc: TimeBlockAllocation,
  currentStamina: number,
): number {
  let change = 0;
  // 加班消耗
  change -= alloc.overtime * TIME_BLOCKS.overtime.staminaCostPerHour;
  // 休息恢复
  const restEfficiency = currentStamina > 90 ? 0.5 : 1.0; // 体力>90时效率减半
  change += alloc.rest * TIME_BLOCKS.rest.staminaPerHour * char.restMultiplier * restEfficiency;
  return change;
}

export function calculateSocialChange(
  char: Character,
  alloc: TimeBlockAllocation,
): number {
  return alloc.social * TIME_BLOCKS.social.socialValuePerHour;
}

export function getLearningBoost(cumulativeLearningHours: number, multiplier: number): number {
  const boost = Math.floor(cumulativeLearningHours / 10) * TIME_BLOCKS.learning.incomeBoostPer10h * multiplier;
  return Math.min(boost, TIME_BLOCKS.learning.incomeBoostMax);
}

export function settleMonth(
  char: Character,
  alloc: TimeBlockAllocation,
  prevNetWorth: number,
  prevStamina: number,
  prevSocial: number,
  billMultiplier: number,
  unexpectedExpense: number,
  grayTotalHours: number,
  monthlyWageOverride?: number,
): MonthlyResult {
  const income = calculateIncome(char, alloc, monthlyWageOverride);
  const expense = calculateExpense(char, billMultiplier, unexpectedExpense);
  const netCashFlow = income - expense;
  const netWorth = prevNetWorth + netCashFlow;

  const staminaChange = calculateStaminaChange(char, alloc, prevStamina);
  const stamina = Math.max(0, Math.min(100, prevStamina + staminaChange));

  const socialChange = calculateSocialChange(char, alloc);
  const social = Math.max(0, Math.min(100, prevSocial + socialChange));

  const newGrayTotal = grayTotalHours + alloc.gray;

  return {
    income,
    expense,
    netCashFlow,
    netWorth,
    stamina,
    social,
    cutlineTriggers: 0, // 由cutline.ts计算
    grayTotalHours: newGrayTotal,
  };
}

// 结局判定
export function determineEnding(
  netWorth: number,
  grayTotalHours: number,
  assetsCount: number,
  cutlineTriggers: number,
  observerEventsCompleted: number,
  npcsHelped: number,
): string {
  if (netWorth < 0) return 'victim';
  if (observerEventsCompleted >= 4 && npcsHelped >= 2 && netWorth >= 20000) return 'awakened';
  if (grayTotalHours >= 30 && netWorth >= 0) return 'gray_survivor';
  if (netWorth >= 80000 && assetsCount >= 2 && cutlineTriggers === 0 && grayTotalHours < 30) return 'elite';
  if (netWorth >= 20000 && assetsCount >= 1 && grayTotalHours < 30) return 'upper_middle';
  return 'survivor';
}

export function getEndingLabel(ending: string): string {
  const labels: Record<string, string> = {
    victim: '💀 Cut Line Victim',
    survivor: '🥉 Survivor',
    upper_middle: '🥈 Upper Middle',
    elite: '🥇 Elite',
    gray_survivor: '🕶 Gray Survivor',
    awakened: '🔮 Awakened',
  };
  return labels[ending] ?? 'Unknown';
}

export function getEndingNarrative(ending: string): string {
  const narratives: Record<string, string> = {
    victim: '斩杀线追上了你。铁岸市明天还会有日出。只是没有人在乎你是否看到。',
    survivor: '你活下来了。仅此而已。窗外的铁岸市和昨天一样。但今天——你还在。',
    upper_middle: '你过得还不错。斩杀线还在头顶——但它现在离得足够远。',
    elite: '你赢了。但代价是什么？你看着镜子里的人——还是22岁出发时的那个人吗？',
    gray_survivor: '你活下来了。但你已经不是进入游戏时的那个人。你成了系统阴影的一部分。',
    awakened: '现在你知道了。你要怎么做？你改变不了整个系统。但你刚刚改变了三个人的命运。',
  };
  return narratives[ending] ?? '';
}
