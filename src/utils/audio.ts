// Audio synthesizer using Web Audio API for responsive feedback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // First high note (C6 ~ 1046 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6
    
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second bell chime
    setTimeout(() => {
      try {
        if (!ctx) return;
        const subNow = ctx.currentTime;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, subNow); // A6
        gain2.gain.setValueAtTime(0.25, subNow);
        gain2.gain.exponentialRampToValueAtTime(0.001, subNow + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(subNow);
        osc2.stop(subNow + 0.42);
      } catch {
        // Ignore audio errors
      }
    }, 100);
  } catch {
    // Ignore audio permission or playback errors
  }
}

export function playCheckoutChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, now); // D6
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
    
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch {
    // Ignore
  }
}

export function playWarningChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.15);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Ignore
  }
}
