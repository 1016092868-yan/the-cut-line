import { useEffect, useRef } from 'react';
import { useGameStore } from './stores/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { GameScreen } from './components/GameScreen';
import { EventPopup } from './components/EventPopup';
import { SettlementScreen } from './components/SettlementScreen';
import { EndingScreen } from './components/EndingScreen';
import { sfx } from './engine/sfx';

export default function App() {
  const phase = useGameStore(s => s.phase);
  const prevPhase = useRef(phase);

  // phase变化时播放音效
  useEffect(() => {
    if (prevPhase.current !== phase) {
      switch (phase) {
        case 'event_active': sfx.event(); break;
        case 'settlement': sfx.settle(); break;
        case 'ending': sfx.ending(); break;
      }
      prevPhase.current = phase;
    }
  }, [phase]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-ink text-paper font-body">
      {phase === 'title' && <TitleScreen />}
      {phase === 'character_select' && <CharacterSelect />}
      {phase === 'playing' && <GameScreen />}
      {phase === 'event_active' && <GameScreen />}
      {phase === 'event_active' && <EventPopup />}
      {phase === 'settlement' && <SettlementScreen />}
      {phase === 'ending' && <EndingScreen />}
    </div>
  );
}
