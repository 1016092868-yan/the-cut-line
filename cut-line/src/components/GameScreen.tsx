import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { GAME_CONFIG, TIME_BLOCKS } from '../data/gameConfig';
import type { TimeBlockAllocation } from '../engine/economy';
import { getCutlineNarrative } from '../engine/cutline';
import type { CutlineState } from '../engine/cutline';

const blockConfig = [
  { key: 'work' as const, label: '🏢 工作', color: 'bg-work', thumbColor: '#78909C', fixed: true },
  { key: 'overtime' as const, label: '🔥 加班', color: 'bg-overtime', thumbColor: '#FF7043', fixed: false },
  { key: 'social' as const, label: '🤝 社交', color: 'bg-social', thumbColor: '#42A5F5', fixed: false },
  { key: 'learning' as const, label: '📚 学习', color: 'bg-learning', thumbColor: '#66BB6A', fixed: false },
  { key: 'rest' as const, label: '😴 休息', color: 'bg-rest', thumbColor: '#26C6DA', fixed: false },
  { key: 'gray' as const, label: '🕶 灰色', color: 'bg-gray', thumbColor: '#7B1FA2', fixed: false },
];

const activeActions = [
  { id: 'contact_friend', label: '📞 联系旧友', hours: 2, desc: '下月可能触发正面社交事件' },
  { id: 'find_side_job', label: '🔍 寻找副业', hours: 5, desc: '可能解锁$200-500/月额外收入' },
  { id: 'apply_loan', label: '🏦 申请贷款', hours: 2, desc: '获得贷款选项' },
  { id: 'update_resume', label: '📝 更新简历', hours: 3, desc: '可能触发面试事件' },
  { id: 'contact_leo', label: '🕶 联系利奥', hours: 1, desc: '触发灰色经济机会（需利奥已接触）' },
  { id: 'help_neighbor', label: '🤝 帮助邻居', hours: 3, desc: '+社区连接，+社交' },
];

const assetOptions = [
  { id: 'southside_apartment', label: '🏠 南岸公寓', cost: 5000, desc: '首付$5K，月维护$300，年增值3-8%' },
  { id: 'midtown_townhouse', label: '🏡 中环联排', cost: 15000, desc: '首付$15K，月维护$600，年增值5-12%' },
  { id: 'index_fund', label: '📈 指数基金', cost: 2000, desc: '投入$2K，年收益-5%~+15%' },
];

export function GameScreen() {
  const {
    character, level, monthIndex, netWorth, stamina, social,
    cutline, allocation, allocationLocked, leoContacted,
    activeActionUsed, assetsCount,
    setAllocation, confirmAllocation, useActiveAction, purchaseAsset,
  } = useGameStore();

  const [showActions, setShowActions] = useState(false);
  const [showAssets, setShowAssets] = useState(false);

  if (!character || !level) return null;

  const char = character;
  const lvl = level;
  const alloc = allocation;

  const isBlockUnlocked = (key: string): boolean => {
    if (lvl.unlockedBlocks.includes('all')) return true;
    return lvl.unlockedBlocks.includes(key);
  };

  const grayUnlocked = isBlockUnlocked('gray') && leoContacted;

  const usedHours = alloc.work + alloc.overtime + alloc.social + alloc.learning + alloc.rest + alloc.gray;
  const remainingHours = GAME_CONFIG.hoursPerMonth - usedHours;

  const workIncome = char.hourlyWage * GAME_CONFIG.workHoursFixed;
  const overtimeIncome = char.overtimeMax > 0
    ? char.hourlyWage * TIME_BLOCKS.overtime.incomeMultiplier * alloc.overtime : 0;
  const grayIncome = char.grayAvailable && leoContacted
    ? TIME_BLOCKS.gray.incomePerHour * alloc.gray : 0;
  const estimatedIncome = workIncome + overtimeIncome + grayIncome;
  const estimatedExpense = char.monthlyExpenseTotal * lvl.billMult;

  const getMaxHours = (key: keyof TimeBlockAllocation): number => {
    if (key === 'work') return 60;
    if (key === 'overtime') return char.overtimeMax;
    if (key === 'social') return char.socialMax;
    if (key === 'learning') return TIME_BLOCKS.learning.maxHours;
    if (key === 'rest') return TIME_BLOCKS.rest.maxHours;
    if (key === 'gray') return char.grayAvailable && leoContacted ? char.grayMaxHours : 0;
    return 0;
  };

  const overtimeMax = lvl.month === 6 ? Math.max(0, char.overtimeMax - 5) : char.overtimeMax;

  const handleSliderChange = (key: keyof TimeBlockAllocation, value: number) => {
    if (allocationLocked) return;
    if (key === 'work') return;
    const max = key === 'overtime' ? overtimeMax : getMaxHours(key);
    const clamped = Math.min(value, max, remainingHours + alloc[key]);
    setAllocation({ [key]: clamped } as Partial<TimeBlockAllocation>);
  };

  const canUseActiveActions = lvl.unlockedBlocks.includes('active') || lvl.unlockedBlocks.includes('all');
  const canUseAssets = lvl.unlockedBlocks.includes('assets') || lvl.unlockedBlocks.includes('all');

  // 斩杀线是否触发
  const anyTriggered = Object.values(cutline).some(s => s === 'triggered');

  // Boss关标识
  const isBossMonth = lvl.type === 'boss';
  const isPressureMonth = lvl.type === 'pressure';

  // 月份叙事提示
  const monthNarratives: Record<number, string> = {
    10: '你以为准备好了，其实你什么都不知道。',
    11: '感恩节。家人团聚。账单也在团聚。',
    12: '圣诞节。礼物清单在面前。你算了一下总价。然后闭上了眼睛。',
    1: '新年。"今年会不一样。"你对自己说。',
    2: '灰色经济的诱惑。利奥不笑。他从来不笑。',
    3: '关系开始出现裂痕。不是突然的——是累积的。',
    4: '报税日。可能是退税——可能是补税。你不知道。',
    5: '系统在收紧。不是突然的——是渐渐的。',
    6: '年中。你停下来看了一眼。已经跑了六个月了。',
    7: '斩杀线在逼近。你能感受到它。不是看到——是感受到。',
    8: '你必须选择。合规？灰色？还是放弃？',
    9: '结局锁定了。最后几步——无法回头。',
  };

  return (
    <div className={`w-full h-full flex flex-col p-3 ${anyTriggered ? 'cutline-active' : ''}`}>
      {/* 顶部状态栏 */}
      <motion.div
        className={`flex items-center justify-between mb-1 px-4 py-2 bg-black/40 rounded-xl border ${isBossMonth ? 'border-cutline' : 'border-gray-700'} ${isBossMonth ? 'cutline-active' : ''}`}
        layout
      >
        <div className="flex items-center gap-3 text-sm">
          <span className="font-heading text-lg text-cutline">{lvl.monthName}</span>
          {isBossMonth && <span className="text-xs px-2 py-0.5 bg-cutline/30 text-cutline rounded font-bold">⚠ BOSS</span>}
          {isPressureMonth && <span className="text-xs px-2 py-0.5 bg-orange-500/30 text-orange-400 rounded font-bold">压力</span>}
          <span className="text-gray-600">|</span>
          <span className="font-bold">{char.name}</span>
          <span className="text-gray-600">|</span>
          <motion.span
            key={netWorth}
            initial={{ scale: 1.15, color: netWorth >= 0 ? '#4CAF50' : '#F44336' }}
            animate={{ scale: 1, color: '#F5F0E8' }}
            className="font-mono font-bold"
          >
            ${netWorth.toLocaleString()}
          </motion.span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={stamina < 20 ? 'text-expense font-bold' : ''}>❤ {Math.round(stamina)}/100</span>
          <span className={social < 30 ? 'text-expense font-bold' : ''}>🤝 {Math.round(social)}%</span>
          <span className="text-gray-500 text-xs">第{monthIndex + 1}/12月</span>
        </div>
      </motion.div>

      {/* 月份叙事提示条 */}
      <div className={`mb-2 px-4 py-1 rounded-lg text-center text-xs italic ${
        isBossMonth ? 'bg-cutline/10 text-cutline' : isPressureMonth ? 'bg-orange-500/10 text-orange-400' : 'bg-black/20 text-gray-500'
      }`}>
        {monthNarratives[lvl.month] || ''}
      </div>

      {/* 主体区域 */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* 左侧：时间块分配 */}
        <div className="flex-1 bg-black/30 rounded-xl border border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-heading text-xl mb-2 text-center">⏰ 时间分配</h3>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
            <span>可用: {GAME_CONFIG.hoursPerMonth}h</span>
            <span className={remainingHours < 0 ? 'text-expense font-bold' : ''}>剩余: {remainingHours}h</span>
          </div>

          <div className="space-y-3">
            {blockConfig.map(block => {
              const unlocked = block.key === 'work' ? true : isBlockUnlocked(block.key) && (block.key !== 'gray' || leoContacted);
              const max = block.key === 'overtime' ? overtimeMax : getMaxHours(block.key);
              const value = alloc[block.key];
              const percentage = max > 0 ? (value / max) * 100 : 0;

              return (
                <div key={block.key} className={`${!unlocked ? 'opacity-30' : ''}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">
                      {block.label}
                      {block.fixed && <span className="text-xs text-gray-500 ml-2">[固定]</span>}
                      {!unlocked && !block.fixed && <span className="text-xs text-gray-600 ml-2">[未解锁]</span>}
                    </span>
                    <span className="font-mono text-sm">
                      {value}h
                      {block.key === 'overtime' && value > 0 && <span className="text-income ml-2">+${(char.hourlyWage * 1.5 * value).toFixed(0)}</span>}
                      {block.key === 'gray' && value > 0 && <span className="text-income ml-2">+${value * 25}</span>}
                      {block.key === 'overtime' && value > 0 && <span className="text-expense ml-1">-{value * 3}❤</span>}
                      {block.key === 'rest' && value > 0 && <span className="text-rest ml-2">+{value * 5}❤</span>}
                      {block.key === 'social' && value > 0 && <span className="text-social ml-2">+{value * 2}🤝</span>}
                    </span>
                  </div>
                  {block.fixed ? (
                    <div className="h-6 bg-work rounded-full border-2 border-ink relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">60h — 固定</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={block.key === 'social' && lvl.month === 6 ? 2 : 0}
                        max={max}
                        value={value}
                        disabled={!unlocked || allocationLocked}
                        onChange={(e) => handleSliderChange(block.key, Number(e.target.value))}
                        className={`flex-1 ${block.color}`}
                        style={{ accentColor: block.thumbColor }}
                      />
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${block.color}`}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 预估 */}
          <div className="mt-4 p-3 bg-black/40 rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">预估月收入</span><span className="font-mono text-income">+${estimatedIncome.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">预估月支出</span><span className="font-mono text-expense">-${estimatedExpense.toFixed(0)}</span></div>
            <div className="flex justify-between font-bold border-t border-gray-700 pt-1">
              <span>预估净现金流</span>
              <span className={`font-mono ${(estimatedIncome - estimatedExpense) >= 0 ? 'text-income' : 'text-expense'}`}>
                {(estimatedIncome - estimatedExpense) >= 0 ? '+' : ''}${(estimatedIncome - estimatedExpense).toFixed(0)}
              </span>
            </div>
          </div>

          {/* 主动行动 + 资产 按钮 */}
          <div className="flex gap-2 mt-3">
            {canUseActiveActions && (
              <button
                className={`flex-1 text-sm py-2 rounded-lg border-2 border-ink ${activeActionUsed ? 'bg-gray-700 text-gray-500' : 'bg-info/20 text-info'}`}
                onClick={() => setShowActions(!showActions)}
                disabled={activeActionUsed || allocationLocked}
              >
                🎯 主动行动 {activeActionUsed ? '(已用)' : '(1次)'}
              </button>
            )}
            {canUseAssets && (
              <button
                className={`flex-1 text-sm py-2 rounded-lg border-2 border-ink ${assetsCount > 0 ? 'bg-income/20' : 'bg-gray-800'}`}
                onClick={() => setShowAssets(!showAssets)}
                disabled={allocationLocked}
              >
                🏠 资产 ({assetsCount})
              </button>
            )}
          </div>

          {/* 主动行动面板 */}
          <AnimatePresence>
            {showActions && !activeActionUsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-black/40 rounded-lg space-y-2">
                  <p className="text-xs text-gray-500 text-center">本月可使用1次主动行动</p>
                  {activeActions.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { useActiveAction(a.id); setShowActions(false); }}
                      disabled={a.id === 'contact_leo' && !leoContacted}
                      className="w-full text-left p-2 rounded border border-gray-600 hover:bg-gray-700 disabled:opacity-30 text-xs"
                    >
                      <span className="font-bold">{a.label}</span>
                      <span className="text-gray-500 ml-2">⏰{a.hours}h</span>
                      <p className="text-gray-500 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 资产面板 */}
          <AnimatePresence>
            {showAssets && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-black/40 rounded-lg space-y-2">
                  <p className="text-xs text-gray-500 text-center">当前净资产: ${netWorth.toLocaleString()}</p>
                  {assetOptions.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { purchaseAsset(a.id, a.cost); setShowAssets(false); }}
                      disabled={netWorth < a.cost}
                      className="w-full text-left p-2 rounded border border-gray-600 hover:bg-gray-700 disabled:opacity-30 text-xs"
                    >
                      <span className="font-bold">{a.label}</span>
                      <span className="text-expense ml-2">-${a.cost.toLocaleString()}</span>
                      <p className="text-gray-500 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 确认按钮 */}
          {!allocationLocked && (
            <motion.button
              className="btn-primary w-full mt-4"
              onClick={confirmAllocation}
              disabled={remainingHours < 0}
              whileTap={{ scale: 0.97 }}
            >
              {remainingHours < 0 ? '⚠ 时间超限' : '✓ 确认分配'}
            </motion.button>
          )}
          {allocationLocked && <div className="text-center mt-4 text-sm text-gray-500">— 处理事件中 —</div>}
        </div>

        {/* 右侧：账单+斩杀线 */}
        <div className="w-72 flex flex-col gap-2">
          {/* 本月账单 */}
          <div className="bg-black/30 rounded-xl border border-gray-700 p-3">
            <h3 className="font-heading text-base mb-2">📋 本月账单</h3>
            <div className="space-y-1 text-xs">
              {char.monthlyBills.rent > 0 && <div className="flex justify-between"><span>🏠 房租</span><span className="font-mono text-expense">-${char.monthlyBills.rent}</span></div>}
              {char.monthlyBills.studentLoan > 0 && <div className="flex justify-between"><span>🎓 学贷</span><span className="font-mono text-expense">-${char.monthlyBills.studentLoan}</span></div>}
              {char.monthlyBills.childcare > 0 && <div className="flex justify-between"><span>👶 育儿</span><span className="font-mono text-expense">-${char.monthlyBills.childcare}</span></div>}
              {char.monthlyBills.insurance > 0 && <div className="flex justify-between"><span>🏥 保险</span><span className="font-mono text-expense">-${char.monthlyBills.insurance}</span></div>}
              {char.monthlyBills.other > 0 && <div className="flex justify-between"><span>📦 其他</span><span className="font-mono text-expense">-${char.monthlyBills.other}</span></div>}
              <div className="flex justify-between font-bold border-t border-gray-700 pt-1 mt-1">
                <span>总计 ×{lvl.billMult}</span>
                <span className="font-mono text-expense">-${(char.monthlyExpenseTotal * lvl.billMult).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* 斩杀线状态 */}
          <div className="bg-black/30 rounded-xl border border-gray-700 p-3 flex-1">
            <h3 className="font-heading text-base mb-2">🔴 斩杀线状态</h3>
            <div className="space-y-2">
              {(['economic', 'stamina', 'social', 'existence'] as Array<keyof CutlineState>).map(dim => {
                const status = cutline[dim];
                const colors: Record<string, string> = {
                  safe: 'text-income', warning: 'text-yellow-400',
                  danger: 'text-orange-500', critical: 'text-expense', triggered: 'text-cutline',
                };
                const icons: Record<string, string> = {
                  safe: '🟢', warning: '🟡', danger: '🟠', critical: '🔴', triggered: '💀',
                };
                return (
                  <div key={dim}>
                    <div className={`text-xs font-bold ${colors[status]}`}>
                      {icons[status]} {dim === 'economic' ? '💰 经济' : dim === 'stamina' ? '❤ 体力' : dim === 'social' ? '🤝 社交' : '📋 存在'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{getCutlineNarrative(dim, status)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 斩杀时刻全屏效果 */}
      <AnimatePresence>
        {anyTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-cutline/20" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, repeat: 2 }}
              className="font-title text-6xl text-cutline"
              style={{ textShadow: '4px 4px 0 #1A1A2E' }}
            >
              CUT LINE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
