export class SoundManager {

    constructor() {
        this.audioContext = null;
        this.warningShown = false;
    }

    playCollect() {
        if (!window.AudioContext) {
            this.warnUnavailable(
                new Error("Web Audio API indisponível neste navegador")
            );
            return;
        }

        try {
            this.audioContext ??= new window.AudioContext();

            this.audioContext.resume()
                .then(() => this.playCollectTone())
                .catch(error => this.warnUnavailable(error));
        } catch (error) {
            this.warnUnavailable(error);
        }
    }

    playCollectTone() {
        const context = this.audioContext;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startTime = context.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(740, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            1100,
            startTime + 0.12
        );

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.18);
    }

    warnUnavailable(error) {
        if (this.warningShown) {
            return;
        }

        this.warningShown = true;
        console.warn("Não foi possível reproduzir o efeito sonoro.", error);
    }
}
