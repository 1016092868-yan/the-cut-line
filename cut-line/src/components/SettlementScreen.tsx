import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { getCharacterMonologue } from '../data/monologues';

export function SettlementScreen() {
  const { lastResult, character, monthIndex, level, proceedToNextMonth } = useGameStore();

  if (!lastResult || !character || !level) return null;

  const result = lastResult;
  const isPositive = result.netCashFlow >= 0;
  const monologue = getCharacterMonologue(character, result.netCashFlow, result.stamina);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex items-center justify-center bg-black/80"
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="card-border bg-paper text-ink p-8 max-w-md w-full mx-4"
      >
        <h2 className="font-heading text-2xl text-center mb-1">📊 {level.monthName}结算</h2>
        <div className="border-t-2 border-ink/20 my-3" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>💵 月收入</span>
            <span className="font-mono text-income">+${result.income.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>📉 月支出</span>
            <span className="font-mono text-expense">-${result.expense.toFixed(0)}</span>
          </div>
          <div className="border-t border-ink/20 pt-2 flex justify-between font-bold text-base">
            <span>📊 净现金流</span>
            <motion.span
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`font-mono ${isPositive ? 'text-income' : 'text-expense'}`}
            >
              {isPositive ? '+' : ''}${result.netCashFlow.toFixed(0)}
            </motion.span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>💰 净资产</span>
            <motion.span
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`font-mono ${result.netWorth >= 0 ? 'text-income' : 'text-expense'}`}
            >
              ${result.netWorth.toFixed(0)}
            </motion.span>
          </div>
        </div>

        <div className="border-t-2 border-ink/20 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>❤ 体力</span><span className="font-mono">{Math.round(result.stamina)}/100</span></div>
          <div className="flex justify-between"><span>🤝 社交</span><span className="font-mono">{Math.round(result.social)}%</span></div>
        </div>

        {/* 角色独白 —— 数据驱动 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-3 bg-ink/5 rounded-lg text-sm italic text-center"
        >
          {monologue}
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full mt-4"
          onClick={proceedToNextMonth}
        >
          继续 → {monthIndex < 11 ? `第${monthIndex + 2}月` : '结局'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
