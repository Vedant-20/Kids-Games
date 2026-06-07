class KidsGameAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(frequency, type, duration, startVol, endVol, pitchSlide = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        if (pitchSlide !== 0) {
            osc.frequency.exponentialRampToValueAtTime(frequency + pitchSlide, this.ctx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(startVol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playDrag() {
        // A short soft pop sound when grabbing an object
        this.playTone(300, 'triangle', 0.08, 0.3, 0.01, -100);
    }

    playSuccess() {
        // Playful double beep (ascending)
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const playBeep = (freq, time, dur) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + dur);
        };

        playBeep(523.25, now, 0.1); // C5
        playBeep(659.25, now + 0.08, 0.15); // E5
    }

    playError() {
        // Cartoonish boing/spring sound (slide down in pitch)
        this.playTone(220, 'triangle', 0.25, 0.4, 0.01, -120);
    }

    playPop() {
        // High pitched wet pop sound (sine decay)
        this.playTone(800, 'sine', 0.08, 0.25, 0.01, -300);
    }

    playFlip() {
        // Quick card flipping swish (low to mid triangle pitch slide)
        this.playTone(150, 'triangle', 0.12, 0.2, 0.01, 150);
    }


    playVictory() {
        // Upbeat major scale arpeggio
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.1;
            const dur = 0.25;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + dur);
        });
    }
}

const gameAudio = new KidsGameAudio();
window.gameAudio = gameAudio;
