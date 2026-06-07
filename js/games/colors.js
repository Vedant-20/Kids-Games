class ColorsGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        
        // Define color baskets
        this.baskets = [
            { id: 'red', name: 'Red', emoji: '🍎', class: 'basket-red' },
            { id: 'blue', name: 'Blue', emoji: '🐳', class: 'basket-blue' },
            { id: 'green', name: 'Green', emoji: '🐸', class: 'basket-green' },
            { id: 'yellow', name: 'Yellow', emoji: '🐥', class: 'basket-yellow' }
        ];

        // Define items matching each basket
        this.itemsPool = {
            red: [
                { emoji: '🍎', name: 'Apple' },
                { emoji: '🍓', name: 'Strawberry' },
                { emoji: '🍒', name: 'Cherries' },
                { emoji: '🍅', name: 'Tomato' }
            ],
            blue: [
                { emoji: '🐳', name: 'Whale' },
                { emoji: '🐬', name: 'Dolphin' },
                { emoji: '🫐', name: 'Blueberries' },
                { emoji: '💎', name: 'Gem' }
            ],
            green: [
                { emoji: '🥦', name: 'Broccoli' },
                { emoji: '🐸', name: 'Frog' },
                { emoji: '🐢', name: 'Turtle' },
                { emoji: 'pear', emoji: '🍐', name: 'Pear' }
            ],
            yellow: [
                { emoji: '🍌', name: 'Banana' },
                { emoji: '🍋', name: 'Lemon' },
                { emoji: '🐥', name: 'Chick' },
                { emoji: '🧀', name: 'Cheese' }
            ]
        };

        this.totalToSort = 5; // Sort 5 items per session
        this.sortedCount = 0;
        this.activeItems = [];
    }

    start() {
        this.sortedCount = 0;
        this.generateItems();
        this.render();
        this.setupDragAndDrop();
    }

    generateItems() {
        this.activeItems = [];
        const colors = ['red', 'blue', 'green', 'yellow'];

        // Pick 5 random items from different colors to sort
        for (let i = 0; i < this.totalToSort; i++) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const pool = this.itemsPool[randomColor];
            const item = pool[Math.floor(Math.random() * pool.length)];
            this.activeItems.push({
                color: randomColor,
                emoji: item.emoji,
                name: item.name,
                id: `item-${i}`
            });
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="colors-game">
                <div class="baskets-row">
                    ${this.baskets.map(b => `
                        <div class="color-basket ${b.class}" data-color="${b.id}">
                            <span class="basket-icon">${b.emoji}</span>
                            <span class="basket-label">${b.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="color-items-row">
                    ${this.activeItems.map(item => `
                        <div class="color-item" data-id="${item.id}" data-color="${item.color}" style="position: relative; left: 0; top: 0;">
                            ${item.emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const draggables = this.container.querySelectorAll('.color-item');
        const baskets = this.container.querySelectorAll('.color-basket');

        draggables.forEach(draggable => {
            let startX = 0, startY = 0;
            let currentX = 0, currentY = 0;
            let initialOffsetLeft = 0, initialOffsetTop = 0;
            let isDragging = false;

            draggable.addEventListener('pointerdown', (e) => {
                if (window.gameAudio) window.gameAudio.init();

                isDragging = true;
                draggable.classList.add('dragging');
                draggable.setPointerCapture(e.pointerId);

                if (window.gameAudio) window.gameAudio.playDrag();

                startX = e.clientX;
                startY = e.clientY;

                initialOffsetLeft = parseFloat(draggable.style.left) || 0;
                initialOffsetTop = parseFloat(draggable.style.top) || 0;
            });

            draggable.addEventListener('pointermove', (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                currentX = initialOffsetLeft + deltaX;
                currentY = initialOffsetTop + deltaY;

                draggable.style.left = `${currentX}px`;
                draggable.style.top = `${currentY}px`;

                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                baskets.forEach(basket => {
                    const basketRect = basket.getBoundingClientRect();
                    const isHovered = (
                        centerXPx >= basketRect.left &&
                        centerXPx <= basketRect.right &&
                        centerYPx >= basketRect.top &&
                        centerYPx <= basketRect.bottom
                    );

                    if (isHovered) {
                        basket.classList.add('hovered');
                    } else {
                        basket.classList.remove('hovered');
                    }
                });
            });

            draggable.addEventListener('pointerup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                draggable.classList.remove('dragging');
                draggable.releasePointerCapture(e.pointerId);

                const itemColor = draggable.dataset.color;
                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                let matchedBasket = null;

                baskets.forEach(basket => {
                    const basketRect = basket.getBoundingClientRect();
                    const isHovered = (
                        centerXPx >= basketRect.left &&
                        centerXPx <= basketRect.right &&
                        centerYPx >= basketRect.top &&
                        centerYPx <= basketRect.bottom
                    );

                    if (isHovered) {
                        basket.classList.remove('hovered');
                        if (basket.dataset.color === itemColor) {
                            matchedBasket = basket;
                        }
                    }
                });

                if (matchedBasket) {
                    // Correct Basket! Spark a little scale animation on basket and remove item
                    matchedBasket.classList.add('hovered');
                    setTimeout(() => matchedBasket.classList.remove('hovered'), 400);

                    // Drop inside basket animation
                    draggable.style.transition = 'all 0.3s ease';
                    draggable.style.transform = 'scale(0) translateY(40px)';
                    draggable.style.opacity = '0';

                    if (window.gameAudio) window.gameAudio.playSuccess();

                    setTimeout(() => {
                        draggable.remove();
                    }, 300);

                    this.sortedCount++;
                    this.updateProgress();

                    if (this.sortedCount === this.totalToSort) {
                        setTimeout(() => this.onWin(), 600);
                    }
                } else {
                    // Wrong basket or drop in empty space!
                    draggable.classList.add('shake');
                    if (window.gameAudio) window.gameAudio.playError();

                    draggable.style.transition = 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    draggable.style.left = '0px';
                    draggable.style.top = '0px';

                    setTimeout(() => {
                        draggable.style.transition = '';
                        draggable.classList.remove('shake');
                    }, 400);
                }
            });

            draggable.addEventListener('pointercancel', () => {
                if (isDragging) {
                    isDragging = false;
                    draggable.classList.remove('dragging');
                    draggable.style.left = '0px';
                    draggable.style.top = '0px';
                }
            });
        });
    }

    updateProgress() {
        const progressStarsContainer = document.getElementById('game-progress');
        if (!progressStarsContainer) return;

        progressStarsContainer.innerHTML = '';
        for (let i = 0; i < this.totalToSort; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < this.sortedCount ? ' active' : '');
            star.innerText = '⭐';
            progressStarsContainer.appendChild(star);
        }
    }
}

window.ColorsGame = ColorsGame;
