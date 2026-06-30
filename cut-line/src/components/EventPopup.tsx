import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { sfx } from '../engine/sfx';

export function EventPopup() {
  const { currentEvents, currentEventIndex, resolveEvent } = useGameStore();

  if (currentEvents.length === 0) return null;

  const event = currentEvents[currentEventIndex];
  if (!event) return null;

  // 根据事件类型选择音效
  const handleResolve = (eventId: string, choiceIndex: number) => {
    if (event.type === 'positive') sfx.positive();
    else if (event.type === 'negative' || event.type === 'high_pressure') sfx.negative();
    else if (event.type === 'boss') sfx.bossStart();
    else if (event.type === 'observer') sfx.observer();
    else sfx.click();
    resolveEvent(eventId, choiceIndex);
  };

  const typeColors: Record<string, string> = {
    positive: 'border-income', negative: 'border-expense', neutral: 'border-warning',
    high_pressure: 'border-cutline', gray: 'border-gray', seasonal: 'border-info',
    boss: 'border-red-800', character: 'border-yellow-500', observer: 'border-green-400',
  };
  const typeLabels: Record<string, string> = {
    positive: '🎉', negative: '⚠', neutral: '💬', high_pressure: '🔴',
    gray: '🕶', seasonal: '📅', boss: '💀', character: '👤', observer: '📡',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${event.id}-${currentEventIndex}`}
          initial={{ x: 300, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -300, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`card-border bg-paper text-ink p-6 max-w-2xl w-full mx-4 shadow-2xl ${typeColors[event.type] || 'border-ink'}`}
          style={{ borderWidth: '4px' }}
        >
          {/* 事件标题 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{typeLabels[event.type] || '⚡'}</span>
            <h3 className="font-heading text-xl">{event.name}</h3>
            {currentEvents.length > 1 && (
              <span className="ml-auto text-xs text-gray-500">
                事件 {currentEventIndex + 1}/{currentEvents.length}
              </span>
            )}
          </div>

          {/* 叙事文本 */}
          <div className="bg-ink/5 rounded-lg p-4 mb-4 text-base leading-relaxed">
            {event.narrative}
          </div>

          {/* 选项 */}
          <div className="space-y-2">
            {event.choices.map((choice, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, backgroundColor: '#1A1A2E', color: '#F5F0E8' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleResolve(event.id, idx)}
                className="w-full text-left p-3 rounded-lg border-2 border-ink transition-colors duration-150 group"
                style={{ backgroundColor: '#F5F0E8', color: '#1A1A2E' }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-sm">{choice.text}</span>
                  <div className="flex gap-2 text-xs ml-2 flex-shrink-0">
                    {choice.costHours ? <span className="text-orange-500">⏰{choice.costHours}h</span> : null}
                    {choice.costMoney ? <span className="text-expense">-${choice.costMoney}</span> : null}
                    {choice.effects.cash ? (
                      <span className={choice.effects.cash > 0 ? 'text-income' : 'text-expense'}>
                        {choice.effects.cash > 0 ? '+' : ''}${choice.effects.cash}
                      </span>
                    ) : null}
                    {choice.effects.stamina ? (
                      <span className={choice.effects.stamina > 0 ? 'text-rest' : 'text-expense'}>
                        {choice.effects.stamina > 0 ? '+' : ''}{choice.effects.stamina}❤
                      </span>
                    ) : null}
                    {choice.effects.social ? (
                      <span className={choice.effects.social > 0 ? 'text-social' : 'text-expense'}>
                        {choice.effects.social > 0 ? '+' : ''}{choice.effects.social}🤝
                      </span>
                    ) : null}
                  </div>
                </div>
                {choice.narrativeReaction && (
                  <p className="text-xs text-gray-500 mt-1 italic">"{choice.narrativeReaction}"</p>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
