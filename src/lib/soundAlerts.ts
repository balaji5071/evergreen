/**
 * Restaurant Kitchen & Staff Loud Order Bell Chime
 * Synthesizes a loud, distinct 3-note kitchen order counter bell ring (G5 -> C6 -> E6 chime)
 * using the Web Audio API. Works in all browsers without external media assets.
 */
export function playKitchenOrderBellSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Helper to trigger a bell chime note at specified start time
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      // Bell envelope: sharp attack, smooth decay
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // First Ring (G5 -> C6 -> E6)
    playNote(783.99, 0.0, 0.35);  // G5
    playNote(1046.50, 0.15, 0.35); // C6
    playNote(1318.51, 0.30, 0.60); // E6

    // Second Ring repeat for emphasis after 0.75 seconds
    playNote(783.99, 0.75, 0.35);  // G5
    playNote(1046.50, 0.90, 0.35); // C6
    playNote(1318.51, 1.05, 0.80); // E6
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}
