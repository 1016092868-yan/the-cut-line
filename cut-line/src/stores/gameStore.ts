// 游戏主状态 —— Zustand Store (v2.0 优化版)
// 修复：移除dead import、移除非空断言、数据驱动、localStorage持久化、拆分长方法

import { create } from 'zustand';
import type { Character } from '../data/characters';
import type { LevelConfig } from '../data/levels';
import { LEVELS, getLevel } from '../data/levels';
import type { GameEvent } from '../data/events';
import { getRandomEvents, getEventById } from '../data/events';
import {
  settleMonth, determineEnding, getEndingLabel, getEndingNarrative,
  type TimeBlockAllocation, type MonthlyResult,
} from '../engine/economy';
import { getCutlineStatus, type CutlineState } from '../engine/cutline';
import { loadSave, saveSave, type SaveData } from '../engine/persistence';
import {
  calculateEarnedLxp, getUnlockedCharacters,
  STARTER_CHARACTER_IDS, PAST_LIFE_CASH_BONUS,
} from '../data/constants';

type GamePhase = 'title' | 'character_select' | 'playing' | 'event_active' | 'settlement' | 'ending';

interface GameState {
  phase: GamePhase;
  character: Character | null;
  monthIndex: number;
  level: LevelConfig | null;

  // 资源
  netWorth: number;
  stamina: number;
  social: number;
  creditScore: number;
  grayTotalHours: number;
  cumulativeLearningHours: number;
  assetsCount: number;
  filesExpired: number;
  consecutiveNegativeSocial: number;

  // 斩杀线
  cutline: CutlineState;
  cutlineTriggers: number;

  // 时间块
  allocation: TimeBlockAllocation;
  allocationLocked: boolean;

  // 事件
  currentEvents: GameEvent[];
  currentEventIndex: number;

  // 结算
  lastResult: MonthlyResult | null;
  endingLabel: string;
  endingNarrative: string;

  // 引导
  leoContacted: boolean;
  observerEventsCompleted: number;
  npcsHelped: number;
  activeActionUsed: boolean;
  assetPurchased: string | null;

  // LXP与跨局成长
  lxp: number;
  totalLxp: number;
  unlockedCharacterIds: number[];
  playthroughCount: number;
  characterPlaythroughs: Record<number, number>;
  pastLifeMemory: boolean;

  // 婚姻/育儿
  isMarried: boolean;
  hasChild: boolean;
  _pastLifeTriggered: boolean;

  // Actions
  startGame: () => void;
  selectCharacter: (char: Character) => void;
  setAllocation: (alloc: Partial<TimeBlockAllocation>) => void;
  confirmAllocation: () => void;
  resolveEvent: (eventId: string, choiceIndex: number) => void;
  nextMonth: () => void;
  proceedToNextMonth: () => void;
  applyEventEffects: (effects: Record<string, number>) => void;
  useActiveAction: (actionId: string) => void;
  purchaseAsset: (assetId: string, cost: number) => void;
  resetGame: () => void;
}

const defaultAllocation: TimeBlockAllocation = {
  work: 60, overtime: 0, social: 0, learning: 0, rest: 0, gray: 0,
};

// 从localStorage加载存档
const savedData: SaveData = loadSave();

// 安全获取角色和关卡
function requireCharacter(state: GameState): Character {
  if (!state.character) throw new Error('Character is null');
  return state.character;
}

function requireLevel(state: GameState): LevelConfig {
  if (!state.level) throw new Error('Level is null');
  return state.level;
}

// 计算斩杀线新状态
function computeCutline(
  netWorth: number, stamina: number, social: number,
  consecutiveNegativeSocial: number, filesExpired: number,
): CutlineState {
  return {
    economic: getCutlineStatus('economic', netWorth),
    stamina: getCutlineStatus('stamina', stamina),
    social: getCutlineStatus('social', social, consecutiveNegativeSocial),
    existence: getCutlineStatus('existence', 0, 0, filesExpired),
  };
}

// 检查斩杀线触发计数
function countNewTriggers(oldCutline: CutlineState, newCutline: CutlineState): number {
  let count = 0;
  (Object.keys(newCutline) as Array<keyof CutlineState>).forEach(dim => {
    if (newCutline[dim] === 'triggered' && oldCutline[dim] !== 'triggered') count++;
  });
  return count;
}

// 主动行动配置
const ACTIVE_ACTIONS: Record<string, { costHours: number; successRate: number; effect: string }> = {
  contact_friend: { costHours: 2, successRate: 0.70, effect: 'social_event' },
  find_side_job: { costHours: 5, successRate: 0.50, effect: 'extra_income' },
  apply_loan: { costHours: 2, successRate: 0.80, effect: 'loan_option' },
  update_resume: { costHours: 3, successRate: 0.60, effect: 'interview_event' },
  contact_leo: { costHours: 1, successRate: 0.60, effect: 'gray_opportunity' },
  help_neighbor: { costHours: 3, successRate: 0.90, effect: 'community_connection' },
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  character: null,
  monthIndex: 0,
  level: null,

  netWorth: 0,
  stamina: 100,
  social: 65,
  creditScore: 680,
  grayTotalHours: 0,
  cumulativeLearningHours: 0,
  assetsCount: 0,
  filesExpired: 0,
  consecutiveNegativeSocial: 0,

  cutline: { economic: 'safe', stamina: 'safe', social: 'safe', existence: 'safe' },
  cutlineTriggers: 0,

  allocation: { ...defaultAllocation },
  allocationLocked: false,

  currentEvents: [],
  currentEventIndex: 0,

  lastResult: null,
  endingLabel: '',
  endingNarrative: '',

  leoContacted: false,
  observerEventsCompleted: 0,
  npcsHelped: 0,
  activeActionUsed: false,
  assetPurchased: null,

  lxp: 0,
  totalLxp: savedData.totalLxp,
  unlockedCharacterIds: savedData.unlockedCharacterIds,
  playthroughCount: savedData.playthroughCount,
  characterPlaythroughs: savedData.characterPlaythroughs,
  pastLifeMemory: false,

  isMarried: false,
  hasChild: false,
  _pastLifeTriggered: false,

  startGame: () => {
    set({
      phase: 'character_select',
      character: null,
      monthIndex: 0,
      netWorth: 0, stamina: 100, social: 65, creditScore: 680,
      grayTotalHours: 0, cumulativeLearningHours: 0, assetsCount: 0,
      filesExpired: 0, consecutiveNegativeSocial: 0,
      cutline: { economic: 'safe', stamina: 'safe', social: 'safe', existence: 'safe' },
      cutlineTriggers: 0,
      allocation: { ...defaultAllocation },
      allocationLocked: false,
      currentEvents: [], currentEventIndex: 0,
      lastResult: null, endingLabel: '', endingNarrative: '',
      leoContacted: false, observerEventsCompleted: 0, npcsHelped: 0,
      activeActionUsed: false, assetPurchased: null,
      level: LEVELS[0],
    });
  },

  selectCharacter: (char) => {
    const prevPlaythroughs = get().characterPlaythroughs[char.id] ?? 0;
    const isPastLife = prevPlaythroughs >= 1;
    const startingCash = isPastLife ? char.startingCash + PAST_LIFE_CASH_BONUS : char.startingCash;

    set({
      character: char,
      netWorth: startingCash,
      stamina: char.staminaMax,
      social: 65,
      phase: 'playing',
      monthIndex: 0,
      level: LEVELS[0],
      allocation: { ...defaultAllocation, work: 60 },
      isMarried: char.isMarried,
      hasChild: char.hasChild,
      pastLifeMemory: isPastLife,
      _pastLifeTriggered: false,
      leoContacted: false,
      observerEventsCompleted: 0,
      npcsHelped: 0,
      cutlineTriggers: 0,
      grayTotalHours: 0,
      cumulativeLearningHours: 0,
      assetsCount: 0,
    });
  },

  setAllocation: (alloc) => {
    set((state) => ({ allocation: { ...state.allocation, ...alloc } }));
  },

  confirmAllocation: () => {
    const state = get();
    if (state.allocationLocked) return;

    const level = requireLevel(state);
    const randomEvents = getRandomEvents(level.randomPool, level.randomCount);
    const fixedEvents = level.fixedEvents
      .map(id => getEventById(id))
      .filter(Boolean) as GameEvent[];

    let allEvents = [...fixedEvents, ...randomEvents];

    // 婚姻互动（3/5/7月）
    if (state.isMarried && [3, 5, 7].includes(level.month)) {
      const marEvent = state.social < 50 ? getEventById('E-MAR-02') : getEventById('E-MAR-01');
      if (marEvent) allEvents.push(marEvent);
    }

    // 育儿互动（3/5/7月）
    if (state.hasChild && [3, 5, 7].includes(level.month)) {
      const kidEvent = state.social < 50 ? getEventById('E-KID-02') : getEventById('E-KID-01');
      if (kidEvent) allEvents.push(kidEvent);
    }

    // 前世记忆（2周目+，3月）
    if (state.pastLifeMemory && level.month === 3 && !state._pastLifeTriggered) {
      allEvents.unshift({
        id: 'past_life_memory', name: '既视感', type: 'neutral' as const,
        narrative: '你好像经历过这个。上一世的记忆在浮现。"也许这次——你可以做出不同的选择。"',
        choices: [
          { text: '利用前世记忆', effects: { mood: 10 }, narrativeReaction: '你选择了不同的路。' },
          { text: '忽略它', effects: { mood: 0 }, narrativeReaction: '你选择了不依赖记忆。' },
        ],
      });
    }

    if (allEvents.length > 0) {
      set({ currentEvents: allEvents, currentEventIndex: 0, phase: 'event_active', allocationLocked: true });
    } else {
      get().nextMonth();
    }
  },

  resolveEvent: (eventId, choiceIndex) => {
    const state = get();
    const event = state.currentEvents[state.currentEventIndex];
    if (!event || event.id !== eventId) return;
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    get().applyEventEffects(choice.effects);

    // 特殊事件处理
    if (eventId === 'leo_first_contact' && choiceIndex === 0) set({ leoContacted: true });
    if (eventId === 'E-OB01' && choiceIndex === 0) set({ observerEventsCompleted: Math.min(4, state.observerEventsCompleted + 1) });
    if (eventId === 'E-OB02' && choiceIndex === 0) set({ observerEventsCompleted: Math.min(4, state.observerEventsCompleted + 1) });
    if (eventId === 'past_life_memory') set({ _pastLifeTriggered: true });

    // 4月Boss：报税结果
    if (eventId === 'E-S04_boss') {
      const roll = Math.random();
      let taxResult: { cash: number; narrative: string };
      if (roll < 0.40) {
        const refund = Math.floor(500 + Math.random() * 2500);
        taxResult = { cash: refund, narrative: `退税！+$${refund}。你盯着数字看了很久。` };
      } else if (roll < 0.95) {
        const payment = Math.floor(500 + Math.random() * 1500);
        taxResult = { cash: -payment, narrative: `补税。-$${payment}。你早就知道会这样。` };
      } else {
        const auditCost = Math.floor(3000 + Math.random() * 2000);
        taxResult = { cash: -auditCost, narrative: `审计。-$${auditCost}。需要更多时间。更多文件。` };
      }
      get().applyEventEffects({ cash: taxResult.cash, mood: taxResult.cash > 0 ? 10 : -15 });
      const nextIdx = state.currentEventIndex + 1;
      if (nextIdx < state.currentEvents.length) {
        const newEvents = [...state.currentEvents];
        newEvents[nextIdx] = {
          id: 'E-S04_result', name: '报税结果', type: 'boss' as const,
          narrative: taxResult.narrative, choices: [{ text: '继续', effects: {} }],
        };
        set({ currentEvents: newEvents });
      }
    }

    // 7月Boss：斩杀线扫描
    if (eventId === 'cutline_scan_boss') {
      const dims = (['economic', 'stamina', 'social', 'existence'] as const);
      const order: Record<string, number> = { triggered: 5, critical: 4, danger: 3, warning: 2, safe: 1 };
      let worstDim = dims[0];
      for (const dim of dims) {
        if (order[state.cutline[dim]] > order[state.cutline[worstDim]]) worstDim = dim;
      }
      const newCutline = { ...state.cutline };
      if (newCutline[worstDim] === 'safe' || newCutline[worstDim] === 'warning') {
        newCutline[worstDim] = 'danger';
      }
      set({ cutline: newCutline });
    }

    // 前进
    const nextIndex = state.currentEventIndex + 1;
    if (nextIndex < state.currentEvents.length) {
      set({ currentEventIndex: nextIndex });
    } else {
      get().nextMonth();
    }
  },

  applyEventEffects: (effects) => {
    set((state) => ({
      netWorth: state.netWorth + (effects.cash ?? 0),
      stamina: Math.max(0, Math.min(100, state.stamina + (effects.stamina ?? 0))),
      social: Math.max(0, Math.min(100, state.social + (effects.social ?? 0))),
    }));
  },

  nextMonth: () => {
    try {
      const state = get();
      const char = requireCharacter(state);
      const level = requireLevel(state);
      const alloc = state.allocation;

      // 6月压力关约束
      const effectiveAlloc = { ...alloc };
      if (level.month === 6) {
        effectiveAlloc.overtime = Math.min(alloc.overtime, char.overtimeMax - 5);
      }

      // 意外支出
      const unexpectedExpense = Math.random() < (level.expenseProb - 1)
        ? Math.floor(Math.random() * 300 + 100) * level.expenseProb : 0;

      // 随机时薪
      const monthlyWageOverride = char.wageType === 'random'
        ? 15 + Math.random() * 30 : undefined;

      // 结算
      const result = settleMonth(
        char, effectiveAlloc, state.netWorth, state.stamina, state.social,
        level.billMult, unexpectedExpense, state.grayTotalHours, monthlyWageOverride,
      );

      const newLearningHours = state.cumulativeLearningHours + alloc.learning;
      const newCutline = computeCutline(result.netWorth, result.stamina, result.social, state.consecutiveNegativeSocial, state.filesExpired);
      const newTriggers = countNewTriggers(state.cutline, newCutline);
      const totalTriggers = state.cutlineTriggers + newTriggers;
      const allTriggered = Object.values(newCutline).every(s => s === 'triggered');

      set({
        netWorth: result.netWorth, stamina: result.stamina, social: result.social,
        grayTotalHours: result.grayTotalHours, cumulativeLearningHours: newLearningHours,
        cutline: newCutline, cutlineTriggers: totalTriggers, lastResult: result,
        allocationLocked: false, currentEvents: [], currentEventIndex: 0,
      });

      if (allTriggered || state.monthIndex >= 11) {
        // 结局判定
        const ending = determineEnding(
          result.netWorth, result.grayTotalHours, state.assetsCount,
          totalTriggers, state.observerEventsCompleted, state.npcsHelped,
        );

        // LXP计算
        const isFirstTime = (state.characterPlaythroughs[char.id] ?? 0) === 0;
        const earnedLxp = calculateEarnedLxp(result.netWorth, ending, isFirstTime);

        // 更新游玩次数
        const newCharPlaythroughs = { ...state.characterPlaythroughs };
        newCharPlaythroughs[char.id] = (newCharPlaythroughs[char.id] ?? 0) + 1;

        // 更新LXP和解锁
        const newTotalLxp = state.totalLxp + earnedLxp;
        const newUnlocked = getUnlockedCharacters(newTotalLxp, state.unlockedCharacterIds);

        // 持久化
        const saveData: SaveData = {
          totalLxp: newTotalLxp,
          unlockedCharacterIds: newUnlocked,
          playthroughCount: state.playthroughCount + 1,
          characterPlaythroughs: newCharPlaythroughs,
        };
        saveSave(saveData);

        set({
          phase: 'ending',
          endingLabel: getEndingLabel(ending),
          endingNarrative: getEndingNarrative(ending),
          lxp: earnedLxp,
          totalLxp: newTotalLxp,
          unlockedCharacterIds: newUnlocked,
          playthroughCount: state.playthroughCount + 1,
          characterPlaythroughs: newCharPlaythroughs,
        });
      } else {
        set({ phase: 'settlement' });
      }
    } catch (e) {
      console.error('nextMonth error:', e);
      set({ phase: 'title' });
    }
  },

  useActiveAction: (actionId: string) => {
    try {
      const state = get();
      if (state.activeActionUsed || state.allocationLocked) return;
      const action = ACTIVE_ACTIONS[actionId];
      if (!action) return;
      if (actionId === 'contact_leo' && !state.leoContacted) return;

      const usedHours = Object.values(state.allocation).reduce((a, b) => a + b, 0);
      const remaining = 120 - usedHours;
      if (remaining < action.costHours) return;

      const newAlloc = { ...state.allocation };
      const deductFrom = Math.min(newAlloc.rest, action.costHours);
      newAlloc.rest -= deductFrom;
      const remainingCost = action.costHours - deductFrom;
      if (remainingCost > 0) newAlloc.overtime = Math.max(0, newAlloc.overtime - remainingCost);

      const success = Math.random() < action.successRate;
      const effects: Record<string, number> = {};
      if (success) {
        switch (action.effect) {
          case 'social_event': effects.social = 10; break;
          case 'extra_income': effects.cash = 300; break;
          case 'loan_option': effects.cash = 1000; break;
          case 'interview_event': effects.social = 5; break;
          case 'community_connection': effects.social = 5; break;
        }
      }
      if (actionId === 'help_neighbor') effects.social = (effects.social ?? 0) + 5;

      set({
        allocation: newAlloc, activeActionUsed: true,
        netWorth: state.netWorth + (effects.cash ?? 0),
        social: Math.max(0, Math.min(100, state.social + (effects.social ?? 0))),
        npcsHelped: actionId === 'help_neighbor' ? state.npcsHelped + 1 : state.npcsHelped,
      });
    } catch (e) {
      console.error('useActiveAction error:', e);
    }
  },

  purchaseAsset: (assetId: string, cost: number) => {
    const state = get();
    if (state.netWorth < cost || state.assetPurchased) return;
    set({ netWorth: state.netWorth - cost, assetsCount: state.assetsCount + 1, assetPurchased: assetId });
  },

  proceedToNextMonth: () => {
    const state = get();
    const nextIdx = state.monthIndex + 1;
    set({
      monthIndex: nextIdx, level: getLevel(nextIdx),
      allocation: { ...defaultAllocation }, phase: 'playing',
      activeActionUsed: false, assetPurchased: null,
    });
  },

  resetGame: () => {
    set({
      phase: 'title', character: null, monthIndex: 0, level: null,
      netWorth: 0, stamina: 100, social: 65, creditScore: 680,
      grayTotalHours: 0, cumulativeLearningHours: 0, assetsCount: 0,
      filesExpired: 0, consecutiveNegativeSocial: 0,
      cutline: { economic: 'safe', stamina: 'safe', social: 'safe', existence: 'safe' },
      cutlineTriggers: 0,
      allocation: { ...defaultAllocation }, allocationLocked: false,
      currentEvents: [], currentEventIndex: 0,
      lastResult: null, endingLabel: '', endingNarrative: '',
      leoContacted: false, observerEventsCompleted: 0, npcsHelped: 0,
      activeActionUsed: false, assetPurchased: null,
      pastLifeMemory: false, _pastLifeTriggered: false,
    });
  },
}));
