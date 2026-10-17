// Subsistema de Som e Sintetizador Web Audio API

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(action) {
    if (action === 'step') playTone(90, 'triangle', 0.05);
    if (action === 'collect') { playTone(440, 'sine', 0.1); setTimeout(() => playTone(880, 'sine', 0.15), 80); }
    if (action === 'coins') { playTone(587, 'sine', 0.1); setTimeout(() => playTone(1174, 'sine', 0.2), 100); }
    if (action === 'animal') { playTone(150, 'sawtooth', 0.25); }
}