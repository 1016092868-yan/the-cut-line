import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { CHARACTERS } from '../data/characters';
import type { Character } from '../data/characters';

const gradeColors: Record<string, string> = {
  S: 'text-yellow-400', A: 'text-gray-300', B: 'text-amber-600',
  C: 'text-gray-500', D: 'text-gray-700',
};

export function CharacterSelect() {
  const selectCharacter = useGameStore(s => s.selectCharacter);
  const unlockedCharacterIds = useGameStore(s => s.unlockedCharacterIds);
  const totalLxp = useGameStore(s => s.totalLxp);
  const characterPlaythroughs = useGameStore(s => s.characterPlaythroughs);
  const [selected, setSelected] = useState<Character | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // 从已解锁角色中随机选3个
  const [choices] = useState(() => {
    const unlocked = CHARACTERS.filter(c => unlockedCharacterIds.includes(c.id));
    const shuffled = [...unlocked].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // 下一解锁阈值
  const unlockThresholds = [0, 200, 500, 1000, 2000, 3500, 5000];
  const nextThreshold = unlockThresholds.find(t => t > totalLxp) ?? 5000;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-ink overflow-y-auto">
      <h2 className="font-heading text-3xl mb-2 text-center">🌟 CHOOSE YOUR CHARACTER</h2>
      <p className="text-gray-400 text-sm mb-4 text-center">"每局随机3选1 — 命运从不给你太多选择"</p>

      {/* LXP状态栏 */}
      <div className="mb-6 px-4 py-2 bg-black/40 rounded-lg border border-gray-700 text-sm flex gap-4">
        <span className="text-gray-400">🔓 已解锁: {unlockedCharacterIds.length}/20</span>
        <span className="text-yellow-400">⭐ LXP: {totalLxp.toLocaleString()}</span>
        <span className="text-gray-500">下一解锁: {nextThreshold.toLocaleString()}</span>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {choices.map((char) => {
          const playthroughs = characterPlaythroughs[char.id] ?? 0;
          const isPastLife = playthroughs >= 1;
          return (
            <div
              key={char.id}
              onMouseEnter={() => setHovered(char.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(char)}
              className={`card-border bg-paper text-ink p-5 cursor-pointer transition-all duration-200 w-64 ${
                selected?.id === char.id ? 'scale-105 ring-4 ring-yellow-400' : 'hover:scale-102'
              }`}
              style={{ transform: hovered === char.id ? 'translateY(-4px)' : undefined }}
            >
              {/* 多周目标记 */}
              {isPastLife && (
                <div className="text-xs text-purple-400 mb-1 font-bold">💭 前世记忆 (+$2,000)</div>
              )}

              <h3 className="font-heading text-lg mb-1">{char.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{char.nameEn}</p>
              <p className="text-xs text-gray-500 italic mb-3 min-h-[2.5rem]">"{char.tagline}"</p>

              {/* 五维属性 */}
              <div className="flex gap-2 mb-3 text-sm justify-center">
                {(['stamina', 'social', 'education', 'wealth', 'career'] as const).map(attr => (
                  <div key={attr} className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">
                      {attr === 'stamina' ? '💪' : attr === 'social' ? '🤝' : attr === 'education' ? '🎓' : attr === 'wealth' ? '💰' : '💼'}
                    </span>
                    <span className={`font-bold ${gradeColors[char.attributes[attr]] || 'text-gray-600'}`}>
                      {char.attributes[attr]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">💵 起始</span>
                  <span className="font-mono font-bold text-income">
                    ${(char.startingCash + (isPastLife ? 2000 : 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">🎓 学贷</span>
                  <span className="font-mono text-expense">-{char.studentLoan ? `$${(char.studentLoan/1000).toFixed(0)}K` : '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">⏰ 时薪</span>
                  <span className="font-mono">${char.hourlyWage.toFixed(0)}/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">📉 月支出</span>
                  <span className="font-mono text-expense">${char.monthlyExpenseTotal}</span>
                </div>
                {playthroughs > 0 && (
                  <div className="text-center text-purple-400 mt-1">已游玩 {playthroughs} 次</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <button
          className="btn-primary text-lg px-8 py-3 animate-pulse"
          onClick={() => selectCharacter(selected)}
        >
          选择 {selected.name} →
        </button>
      )}
    </div>
  );
}
