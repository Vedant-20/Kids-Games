class MemoryGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        this.animals = ['🦁', '🐶', '🐱'];
        this.cards = []; // 6 card objects: { id, emoji, matched, element }
        this.flippedCards = []; // Tracking active flips
        this.matchedPairs = 0;
        this.totalPairs = this.animals.length;
        this.lockBoard = false;
    }

    start() {
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.lockBoard = false;
        this.generateCards();
        this.render();
        this.setupInteraction();
    }

    generateCards() {
        // Double the list to make pairs
        const cardsList = [...this.animals, ...this.animals];
        // Shuffle cards list
        const shuffledList = cardsList.sort(() => Math.random() - 0.5);
        
        this.cards = shuffledList.map((emoji, index) => ({
            id: index,
            emoji: emoji,
            matched: false
        }));
    }

    render() {
        this.container.innerHTML = `
            <div class="memory-game-container">
                <div class="memory-grid">
                    ${this.cards.map(card => `
                        <div class="memory-card" data-id="${card.id}">
                            <div class="memory-card-inner">
                                <div class="memory-card-front">
                                    ${card.emoji}
                                </div>
                                <div class="memory-card-back">
                                    ❓
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupInteraction() {
        const cardElements = this.container.querySelectorAll('.memory-card');
        
        cardElements.forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                if (this.lockBoard) return;
                
                const cardId = parseInt(cardEl.dataset.id);
                const cardObj = this.cards.find(c => c.id === cardId);

                // Prevent clicking already matched or already flipped cards
                if (cardObj.matched || this.flippedCards.some(c => c.id === cardId)) {
                    return;
                }

                // Initialize AudioContext on first tap
                if (window.gameAudio) window.gameAudio.init();

                // Flip card visually
                cardEl.classList.add('flipped');
                if (window.gameAudio) window.gameAudio.playFlip();

                this.flippedCards.push({
                    obj: cardObj,
                    el: cardEl
                });

                if (this.flippedCards.length === 2) {
                    this.checkMatch();
                }
            });
        });
    }

    checkMatch() {
        this.lockBoard = true;
        const [card1, card2] = this.flippedCards;

        if (card1.obj.emoji === card2.obj.emoji) {
            // It's a match!
            card1.obj.matched = true;
            card2.obj.matched = true;
            
            card1.el.classList.add('matched');
            card2.el.classList.add('matched');

            if (window.gameAudio) window.gameAudio.playSuccess();

            this.matchedPairs++;
            this.updateProgress();

            this.flippedCards = [];
            this.lockBoard = false;

            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.onWin(), 600);
            }
        } else {
            // No match! Flip them back down after a delay
            setTimeout(() => {
                card1.el.classList.remove('flipped');
                card2.el.classList.remove('flipped');
                
                if (window.gameAudio) window.gameAudio.playError();
                
                this.flippedCards = [];
                this.lockBoard = false;
            }, 1000);
        }
    }

    updateProgress() {
        const progressStarsContainer = document.getElementById('game-progress');
        if (!progressStarsContainer) return;

        progressStarsContainer.innerHTML = '';
        for (let i = 0; i < this.totalPairs; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < this.matchedPairs ? ' active' : '');
            star.innerText = '⭐';
            progressStarsContainer.appendChild(star);
        }
    }
}

window.MemoryGame = MemoryGame;
