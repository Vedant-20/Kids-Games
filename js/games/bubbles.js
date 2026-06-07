class BubblesGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        this.targetCount = 15;
        this.poppedCount = 0;
        this.spawnInterval = null;
        this.activeBubbles = [];
        this.colors = [
            'rgba(255, 107, 157, 0.4)', // Pink
            'rgba(78, 168, 222, 0.4)',  // Blue
            'rgba(112, 224, 0, 0.4)',   // Green
            'rgba(255, 202, 58, 0.4)',  // Yellow
            'rgba(157, 78, 221, 0.4)',  // Purple
            'rgba(255, 159, 28, 0.4)'   // Orange
        ];
        this.active = false;
    }

    start() {
        this.poppedCount = 0;
        this.active = true;
        this.activeBubbles = [];
        this.render();

        // Spawn bubbles periodically
        this.spawnBubble(); // Spawn first one immediately
        this.spawnInterval = setInterval(() => {
            if (this.active) {
                this.spawnBubble();
            }
        }, 900);
    }

    stop() {
        this.active = false;
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        // Remove all bubbles
        const playground = document.getElementById('bubble-playground');
        if (playground) {
            playground.innerHTML = '';
        }
    }

    render() {
        this.container.innerHTML = `
            <div id="bubble-playground" style="position: relative; width: 100%; height: 480px; overflow: hidden; background: linear-gradient(to top, #e0f2fe 0%, #bae6fd 100%); border-radius: 25px; border: 4px solid #fff; box-shadow: inset 0 4px 10px rgba(0,0,0,0.05);">
                <!-- Bubbles float up inside here -->
            </div>
        `;
    }

    spawnBubble() {
        const playground = document.getElementById('bubble-playground');
        if (!playground) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble-element';
        
        // Random dimensions
        const size = Math.floor(Math.random() * 40) + 60; // 60px to 100px
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const leftPercent = Math.random() * 85; // 0% to 85%
        const duration = Math.random() * 4 + 4; // 4s to 8s

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${leftPercent}%`;
        bubble.style.backgroundColor = color;
        bubble.style.animationDuration = `${duration}s`;

        // Interactive event listener
        bubble.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.popBubble(bubble);
        });

        // Remove when animation finishes
        bubble.addEventListener('animationend', () => {
            bubble.remove();
        });

        playground.appendChild(bubble);
    }

    popBubble(bubble) {
        if (!this.active || bubble.classList.contains('popping')) return;
        
        bubble.classList.add('popping');
        
        // Sound check
        if (window.gameAudio) {
            window.gameAudio.init();
            window.gameAudio.playPop();
        }

        this.poppedCount++;
        this.updateProgress();

        // Remove after popping animation is complete (150ms)
        setTimeout(() => {
            bubble.remove();
        }, 150);

        if (this.poppedCount === this.targetCount) {
            this.stop();
            setTimeout(() => this.onWin(), 400);
        }
    }

    updateProgress() {
        const progressStarsContainer = document.getElementById('game-progress');
        if (!progressStarsContainer) return;

        progressStarsContainer.innerHTML = '';
        for (let i = 0; i < this.targetCount; i++) {
            // Display star groupings for nursery kids so 15 stars fit nicely
            if (i < this.poppedCount) {
                const star = document.createElement('span');
                star.className = 'star active';
                star.innerText = '⭐';
                progressStarsContainer.appendChild(star);
            }
        }
        
        // Add text count for clarity
        const countIndicator = document.createElement('span');
        countIndicator.style.marginLeft = '10px';
        countIndicator.style.fontWeight = 'bold';
        countIndicator.style.fontSize = '1.2rem';
        countIndicator.style.color = '#333';
        countIndicator.innerText = `(${this.poppedCount}/${this.targetCount})`;
        progressStarsContainer.appendChild(countIndicator);
    }
}

window.BubblesGame = BubblesGame;
