class XylophoneGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        
        // Define keys, colors, and frequencies
        this.keys = [
            { note: 'C4', freq: 261.63, color: '#ff4d6d', height: 260 },
            { note: 'D4', freq: 293.66, color: '#ff9f1c', height: 242 },
            { note: 'E4', freq: 329.63, color: '#ffca3a', height: 224 },
            { note: 'F4', freq: 349.23, color: '#38b000', height: 206 },
            { note: 'G4', freq: 392.00, color: '#00b4d8', height: 188 },
            { note: 'A4', freq: 440.00, color: '#0077b6', height: 170 },
            { note: 'B4', freq: 493.88, color: '#9d4edd', height: 152 },
            { note: 'C5', freq: 523.25, color: '#d946ef', height: 134 }
        ];

        this.notesPlayed = 0;
        this.targetNotes = 10;
        this.active = false;
    }

    start() {
        this.notesPlayed = 0;
        this.active = true;
        this.render();
        this.setupInteraction();
    }

    stop() {
        this.active = false;
    }

    render() {
        this.container.innerHTML = `
            <div class="xylo-game-container">
                <!-- Instruction bar -->
                <div class="xylo-instruction">Tap the colorful keys to play music! 🎶</div>
                
                <!-- Xylophone Board -->
                <div class="xylo-board">
                    <!-- Wooden support bars -->
                    <div class="xylo-support xylo-support-top"></div>
                    <div class="xylo-support xylo-support-bottom"></div>

                    <!-- Keys -->
                    <div class="xylo-keys-row">
                        ${this.keys.map((k, index) => `
                            <div class="xylo-key" data-note="${k.note}" data-freq="${k.freq}" style="background-color: ${k.color}; height: ${k.height}px; width: 55px;">
                                <div class="xylo-screw xylo-screw-top"></div>
                                <span class="xylo-note-label">${k.note.charAt(0)}</span>
                                <div class="xylo-screw xylo-screw-bottom"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Custom finish button -->
                <button class="btn-large" id="btn-finish-music" style="margin-top: 2rem;">Finish Music 🎵</button>
            </div>
        `;
    }

    setupInteraction() {
        const keyElements = this.container.querySelectorAll('.xylo-key');
        const finishButton = document.getElementById('btn-finish-music');

        keyElements.forEach(keyEl => {
            keyEl.addEventListener('pointerdown', (e) => {
                if (!this.active) return;
                e.preventDefault();

                // Initialize AudioContext
                if (window.gameAudio) window.gameAudio.init();

                const freq = parseFloat(keyEl.dataset.freq);
                const note = keyEl.dataset.note;

                // Play synthesized chime sound
                if (window.gameAudio) {
                    window.gameAudio.playChime(freq);
                }

                // Add bounce feedback animation
                keyEl.classList.add('pressed');
                setTimeout(() => keyEl.classList.remove('pressed'), 150);

                // Spawn visual music note particle
                this.spawnMusicNote(e.clientX, e.clientY);

                // Increment play count
                this.notesPlayed++;
                this.updateProgress();

                // Check victory target
                if (this.notesPlayed === this.targetNotes) {
                    this.active = false;
                    setTimeout(() => {
                        this.onWin();
                    }, 800);
                }
            });
        });

        finishButton.addEventListener('click', () => {
            if (!this.active) return;
            this.active = false;
            this.onWin();
        });
    }

    spawnMusicNote(x, y) {
        const board = this.container.querySelector('.xylo-game-container');
        if (!board) return;

        const noteSymbols = ['🎵', '🎶', '✨', '🎈', '⭐'];
        const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        
        const particle = document.createElement('div');
        particle.className = 'xylo-particle';
        particle.innerText = symbol;
        
        const rect = board.getBoundingClientRect();
        const left = x - rect.left - 15;
        const top = y - rect.top - 15;

        particle.style.left = `${left}px`;
        particle.style.top = `${top}px`;

        board.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    updateProgress() {
        const progressStarsContainer = document.getElementById('game-progress');
        if (!progressStarsContainer) return;

        progressStarsContainer.innerHTML = '';
        for (let i = 0; i < this.targetNotes; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < this.notesPlayed ? ' active' : '');
            star.innerText = '⭐';
            progressStarsContainer.appendChild(star);
        }
    }
}

window.XylophoneGame = XylophoneGame;
