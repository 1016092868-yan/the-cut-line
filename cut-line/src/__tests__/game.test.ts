// 单元测试 —— 经济引擎+斩杀线+结局判定+LXP计算

import { describe, test, expect } from 'vitest';
import { calculateIncome, calculateExpense, calculateStaminaChange, determineEnding, getEndingLabel } from '../engine/economy';
import { getCutlineStatus } from '../engine/cutline';
import { calculateEarnedLxp, getUnlockedCharacters, STARTER_CHARACTER_IDS } from '../data/constants';
import { CHARACTERS } from '../data/characters';
import type { TimeBlockAllocation } from '../engine/economy';

const marcus = CHARACTERS[0]; // 马库斯
const zeroAlloc: TimeBlockAllocation = { work: 60, overtime: 0, social: 0, learning: 0, rest: 0, gray: 0 };

describe('经济引擎', () => {
  test('马库斯基础工作收入 = 时薪×60h', () => {
    const income = calculateIncome(marcus, zeroAlloc);
    expect(income).toBeCloseTo(36.67 * 60, 1); // ~$2,200
  });

  test('加班收入 = 时薪×1.5×加班小时', () => {
    const alloc: TimeBlockAllocation = { ...zeroAlloc, overtime: 10 };
    const income = calculateIncome(marcus, alloc);
    const expected = 36.67 * 60 + 36.67 * 1.5 * 10;
    expect(income).toBeCloseTo(expected, 1);
  });

  test('灰色收入 = $25×灰色小时', () => {
    const alloc: TimeBlockAllocation = { ...zeroAlloc, gray: 10 };
    const income = calculateIncome(marcus, alloc);
    const expected = 36.67 * 60 + 25 * 10;
    expect(income).toBeCloseTo(expected, 1);
  });

  test('支出 = 月支出×倍率+意外支出', () => {
    const expense = calculateExpense(marcus, 1.3, 500);
    expect(expense).toBeCloseTo(1870 * 1.3 + 500, 1);
  });

  test('加班消耗体力 -3/h', () => {
    const alloc: TimeBlockAllocation = { ...zeroAlloc, overtime: 10 };
    const change = calculateStaminaChange(marcus, alloc, 80);
    expect(change).toBe(-30); // 10h * -3 = -30
  });

  test('休息恢复体力 +5/h', () => {
    const alloc: TimeBlockAllocation = { ...zeroAlloc, rest: 10 };
    const change = calculateStaminaChange(marcus, alloc, 50);
    expect(change).toBe(50); // 10h * 5 = 50
  });

  test('体力>90时休息效率减半', () => {
    const alloc: TimeBlockAllocation = { ...zeroAlloc, rest: 10 };
    const change = calculateStaminaChange(marcus, alloc, 95);
    expect(change).toBe(25); // 10h * 5 * 0.5 = 25
  });
});

describe('斩杀线状态机', () => {
  test('净资产>$5K → safe', () => {
    expect(getCutlineStatus('economic', 6000)).toBe('safe');
  });

  test('净资产$0~$5K → warning', () => {
    expect(getCutlineStatus('economic', 2500)).toBe('warning');
  });

  test('净资产-$5K~$0 → danger', () => {
    expect(getCutlineStatus('economic', -2000)).toBe('danger');
  });

  test('体力>70 → safe', () => {
    expect(getCutlineStatus('stamina', 80)).toBe('safe');
  });

  test('体力<5 → triggered', () => {
    expect(getCutlineStatus('stamina', 3)).toBe('triggered');
  });

  test('社交<5且连续2次负面 → triggered', () => {
    expect(getCutlineStatus('social', 3, 2)).toBe('triggered');
  });

  test('社交<5但无连续负面 → critical', () => {
    expect(getCutlineStatus('social', 3, 0)).toBe('critical');
  });
});

describe('结局判定', () => {
  test('净资产<$0 → victim', () => {
    expect(determineEnding(-100, 0, 0, 0, 0, 0)).toBe('victim');
  });

  test('净资产≥$0 + 灰色<30h → survivor', () => {
    expect(determineEnding(500, 10, 0, 0, 0, 0)).toBe('survivor');
  });

  test('净资产≥$20K + ≥1资产 + 灰色<30h → upper_middle', () => {
    expect(determineEnding(25000, 5, 1, 0, 0, 0)).toBe('upper_middle');
  });

  test('净资产≥$80K + ≥2资产 + 无触发 + 灰色<30h → elite', () => {
    expect(determineEnding(90000, 10, 2, 0, 0, 0)).toBe('elite');
  });

  test('净资产≥$0 + 灰色≥30h → gray_survivor', () => {
    expect(determineEnding(500, 35, 0, 0, 0, 0)).toBe('gray_survivor');
  });

  test('净资产≥$20K + 观测者≥4 + 帮助≥2 → awakened', () => {
    expect(determineEnding(25000, 10, 0, 0, 4, 2)).toBe('awakened');
  });

  test('结局标签正确', () => {
    expect(getEndingLabel('victim')).toContain('Victim');
    expect(getEndingLabel('survivor')).toContain('Survivor');
    expect(getEndingLabel('elite')).toContain('Elite');
  });
});

describe('LXP系统', () => {
  test('基础通关 = 100 LXP', () => {
    const lxp = calculateEarnedLxp(0, 'survivor', false);
    expect(lxp).toBe(100); // 0净资产 → 0财富奖励
  });

  test('首次角色通关 = 100+200 = 300 LXP', () => {
    const lxp = calculateEarnedLxp(0, 'survivor', true);
    expect(lxp).toBe(300);
  });

  test('净资产$50K = 100+25 = 125 LXP', () => {
    const lxp = calculateEarnedLxp(50000, 'survivor', false);
    expect(lxp).toBe(125); // 50000/10000*5 = 25
  });

  test('觉醒结局 = 100+500 = 600 LXP', () => {
    const lxp = calculateEarnedLxp(0, 'awakened', false);
    expect(lxp).toBe(600);
  });

  test('LXP 200解锁角色7-8', () => {
    const unlocked = getUnlockedCharacters(200, STARTER_CHARACTER_IDS);
    expect(unlocked).toContain(7);
    expect(unlocked).toContain(8);
  });

  test('LXP 3500解锁全部角色', () => {
    const unlocked = getUnlockedCharacters(3500, STARTER_CHARACTER_IDS);
    expect(unlocked.length).toBe(20);
  });
});

describe('角色数据完整性', () => {
  test('20个角色全部有staminaMax', () => {
    CHARACTERS.forEach(c => {
      expect(c.staminaMax).toBeGreaterThan(0);
    });
  });

  test('西蒙(15)体力上限65', () => {
    const simon = CHARACTERS.find(c => c.id === 15);
    expect(simon?.staminaMax).toBe(65);
  });

  test('马库斯(1)有孩子', () => {
    expect(marcus.hasChild).toBe(true);
  });

  test('艾琳&马克(10)已婚', () => {
    const erin = CHARACTERS.find(c => c.id === 10);
    expect(erin?.isMarried).toBe(true);
  });

  test('卢娜(14)时薪类型为random', () => {
    const luna = CHARACTERS.find(c => c.id === 14);
    expect(luna?.wageType).toBe('random');
  });
});
