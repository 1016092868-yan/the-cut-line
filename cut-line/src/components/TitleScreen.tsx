import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

// 飘落的纸张粒子
const papers = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 8 + Math.random() * 6,
  size: 15 + Math.random() * 20,
  rotate: Math.random() * 360,
  type: ['📄', '📋', '✉️', '📝'][Math.floor(Math.random() * 4)],
}));

export function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);
  const totalLxp = useGameStore(s => s.totalLxp);
  const unlockedCount = useGameStore(s => s.unlockedCharacterIds.length);
  const playthroughCount = useGameStore(s => s.playthroughCount);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)' }}>

      {/* 飘落纸张 */}
      {papers.map(p => (
        <motion.div
          key={p.id}
          className="absolute text-2xl opacity-20"
          style={{ left: `${p.x}%`, fontSize: `${p.size}px` }}
          initial={{ y: -100, rotate: p.rotate }}
          animate={{ y: '110vh', rotate: p.rotate + 180 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          {p.type}
        </motion.div>
      ))}

      {/* 红色斩杀线 */}
      <motion.div
        className="absolute right-0 top-1/3 w-3/4 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF1744 30%, #FF1744 70%, transparent)',
          boxShadow: '0 0 20px #FF1744, 0 0 40px rgba(255,23,68,0.5)',
        }}
        animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 城市剪影 */}
      <div className="absolute bottom-0 w-full h-32 opacity-30"
        style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200' preserveAspectRatio='none'%3E%3Cpath fill='%231A1A2E' d='M0,200 L0,120 L40,120 L40,80 L80,80 L80,100 L120,100 L120,60 L160,60 L160,90 L200,90 L200,40 L240,40 L240,70 L280,70 L280,110 L320,110 L320,50 L360,50 L360,90 L400,90 L400,130 L440,130 L440,70 L480,70 L480,100 L520,100 L520,30 L560,30 L560,80 L600,80 L600,120 L640,120 L640,60 L680,60 L680,90 L720,90 L720,50 L760,50 L760,100 L800,100 L800,140 L840,140 L840,70 L880,70 L880,110 L920,110 L920,40 L960,40 L960,80 L1000,80 L1000,120 L1040,120 L1040,90 L1080,90 L1080,60 L1120,60 L1120,100 L1160,100 L1160,80 L1200,80 L1200,200 Z'/%3E%3C/svg%3E") bottom/cover no-repeat`,
        }}
      />

      {/* 标题 */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="text-center mb-8 z-10"
      >
        <h1 className="font-title text-7xl text-paper mb-2" style={{ textShadow: '4px 4px 0 #FF1744, 8px 8px 0 rgba(0,0,0,0.3)' }}>
          THE CUT LINE
        </h1>
        <p className="font-heading text-2xl text-gray-400">Run For Your Life</p>
      </motion.div>

      {/* 存档信息 */}
      {playthroughCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-4 text-center text-sm text-gray-500 z-10"
        >
          <span className="text-yellow-400">⭐ {totalLxp.toLocaleString()} LXP</span>
          <span className="mx-2">|</span>
          <span>🔓 {unlockedCount}/20 角色</span>
          <span className="mx-2">|</span>
          <span>🎮 {playthroughCount} 局</span>
        </motion.div>
      )}

      {/* 按钮 */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 4 }}
        className="btn-primary text-xl px-12 py-4 z-10"
        onClick={startGame}
      >
        ▶ {playthroughCount > 0 ? 'CONTINUE' : 'NEW GAME'}
      </motion.button>

      {/* 底部 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 text-center text-gray-500 text-sm z-10"
      >
        <p>生存策略 × 时间管理 × 叙事事件 | 20角色 × 12个月 × 6结局</p>
        <p className="mt-1 text-gray-600 italic">The Cut Line doesn't care. But someone does.</p>
      </motion.div>
    </div>
  );
}
