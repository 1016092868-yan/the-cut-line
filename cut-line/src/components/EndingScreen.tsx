import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function EndingScreen() {
  const {
    endingLabel, endingNarrative, character, netWorth, stamina, social,
    grayTotalHours, cutlineTriggers, lxp, totalLxp, unlockedCharacterIds,
    resetGame,
  } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black via-ink to-black p-6 overflow-y-auto"
    >
      <div className="max-w-2xl text-center">
        <motion.h1
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
          className="font-title text-5xl mb-4"
          style={{ textShadow: '3px 3px 0 #FF1744' }}
        >
          {endingLabel}
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-black/40 rounded-xl border border-gray-700 p-5 mb-5"
        >
          <p className="text-base leading-relaxed text-paper">{endingNarrative}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500">最终净资产</div>
            <div className={`font-mono text-lg font-bold ${netWorth >= 0 ? 'text-income' : 'text-expense'}`}>
              ${netWorth.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500">体力/社交</div>
            <div className="font-mono text-lg font-bold">{Math.round(stamina)}❤ / {Math.round(social)}🤝</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500">灰色时长</div>
            <div className="font-mono text-lg font-bold text-gray">{grayTotalHours}h</div>
          </div>
        </motion.div>

        {/* LXP结算 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="bg-black/40 rounded-xl border border-yellow-700 p-4 mb-5"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">本局获得</span>
            <span className="font-mono text-xl font-bold text-yellow-400">+{lxp} LXP</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">累计 LXP</span>
            <span className="font-mono text-yellow-400">{totalLxp.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">已解锁角色</span>
            <span className="font-mono">{unlockedCharacterIds.length}/20</span>
          </div>
        </motion.div>

        <p className="text-gray-400 text-xs mb-5">角色：{character?.name} | 斩杀线触发：{cutlineTriggers}次</p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary text-lg px-8 py-3"
          onClick={resetGame}
        >
          🔄 再来一局
        </motion.button>

        <p className="mt-6 text-gray-600 text-xs italic">The Cut Line doesn't care. But someone does.</p>
      </div>
    </motion.div>
  );
}
