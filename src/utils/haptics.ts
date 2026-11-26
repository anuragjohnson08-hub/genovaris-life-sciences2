export type HapticKind = 'selection' | 'light' | 'medium' | 'success' | 'warning';

const VIBRATION_PATTERNS: Record<HapticKind, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 16,
  success: [10, 38, 14],
  warning: [14, 28, 14],
};

let audioCtx: AudioContext | null = null;
let subtleSoundEnabled = false;

export function setSubtleTactileSound(enabled: boolean): void {
  subtleSoundEnabled = enabled;
}

export function isSubtleTactileSoundEnabled(): boolean {
  return subtleSoundEnabled;
}

function playTactileMicroDetent(kind: HapticKind): void {
  if (!subtleSoundEnabled || typeof window === 'undefined') return;
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    if (!audioCtx) {
      audioCtx = new AudioContextCtor();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const baseFreq =
      kind === 'selection'
        ? 1180
        : kind === 'light'
          ? 960
          : kind === 'success'
            ? 1320
            : kind === 'warning'
              ? 640
              : 840;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.016);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.02);
  } catch {
    // Gracefully ignore audio context restrictions
  }
}

/**
 * Triggers iOS-inspired subtle haptic feedback using the Vibration API when available
 * and an optional ultra-quiet acoustic detent when opted in by the user.
 */
export function triggerHaptic(kind: HapticKind = 'selection'): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(VIBRATION_PATTERNS[kind]);
    } catch {
      // Ignore environments where vibrate is blocked
    }
  }
  playTactileMicroDetent(kind);
}
