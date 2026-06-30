// 音效引擎 —— 使用Web Audio API合成，无需外部音频文件

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// 播放简单音调
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// 播放序列
function playSequence(notes: Array<[number, number, OscillatorType?]>, interval = 0.1) {
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note[0], note[1], note[2] ?? 'sine', 0.08), i * interval * 1000);
  });
}

export const sfx = {
  // 按钮点击
  click: () => playTone(800, 0.05, 'square', 0.05),

  // 确认分配
  confirm: () => playSequence([[523, 0.08], [659, 0.08], [784, 0.12]], 0.06),

  // 事件弹出
  event: () => playTone(440, 0.15, 'triangle', 0.06),

  // 正面事件
  positive: () => playSequence([[523, 0.1, 'sine'], [659, 0.1, 'sine'], [784, 0.15, 'sine']], 0.08),

  // 负面事件
  negative: () => playSequence([[330, 0.1, 'sawtooth'], [220, 0.15, 'sawtooth']], 0.08),

  // 斩杀线警告（状态下降）
  cutlineWarning: () => playTone(200, 0.3, 'sawtooth', 0.1),

  // 斩杀时刻（全屏触发）
  cutlineTrigger: () => {
    playTone(80, 0.5, 'sawtooth', 0.15);
    setTimeout(() => playTone(60, 0.8, 'sawtooth', 0.12), 200);
    setTimeout(() => playTone(40, 1.0, 'sawtooth', 0.1), 500);
  },

  // 月末结算
  settle: () => playSequence([[440, 0.08], [523, 0.08], [440, 0.08], [523, 0.12]], 0.05),

  // 数字跳动（收入增加）
  coin: () => playTone(987, 0.05, 'square', 0.04),

  // 数字跳动（支出）
  expense: () => playTone(330, 0.08, 'square', 0.04),

  // Boss关开始
  bossStart: () => {
    playTone(100, 0.3, 'sawtooth', 0.1);
    setTimeout(() => playTone(80, 0.5, 'sawtooth', 0.1), 200);
  },

  // 结局
  ending: () => {
    playSequence([
      [523, 0.3, 'sine'], [659, 0.3, 'sine'], [784, 0.3, 'sine'],
      [1047, 0.5, 'sine']
    ], 0.15);
  },

  // 观测者消息
  observer: () => {
    playTone(1200, 0.02, 'square', 0.03);
    setTimeout(() => playTone(1200, 0.02, 'square', 0.03), 100);
    setTimeout(() => playTone(800, 0.1, 'square', 0.04), 200);
  },
};
