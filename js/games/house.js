class HouseGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        
        // Element templates & target coordinates relative to an 800x380 playground
        this.components = [
            {
                id: 'sun',
                name: 'Sun',
                width: 80,
                height: 80,
                targetX: 620,
                targetY: 40,
                svg: `<svg viewBox="0 0 100 100" class="house-svg"><circle cx="50" cy="50" r="40" fill="#ffb703"/><circle cx="50" cy="50" r="30" fill="#fb8500"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="house-svg-outline"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'tree',
                name: 'Tree',
                width: 100,
                height: 140,
                targetX: 120,
                targetY: 240,
                svg: `<svg viewBox="0 0 100 140" class="house-svg"><rect x="42" y="90" width="16" height="50" rx="5" fill="#8b5a2b"/><polygon points="50,10 90,65 10,65" fill="#38b000"/><polygon points="50,35 85,85 15,85" fill="#2d6a4f"/></svg>`,
                outline: `<svg viewBox="0 0 100 140" class="house-svg-outline"><rect x="42" y="90" width="16" height="50" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/><polygon points="50,10 90,65 10,65" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/><polygon points="50,35 85,85 15,85" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'chimney',
                name: 'Chimney',
                width: 30,
                height: 60,
                targetX: 330,
                targetY: 110,
                svg: `<svg viewBox="0 0 30 60" class="house-svg"><rect x="0" y="0" width="30" height="60" fill="#9d4edd" rx="3"/><rect x="-5" y="0" width="40" height="12" fill="#7b2cbf" rx="2"/></svg>`,
                outline: `<svg viewBox="0 0 30 60" class="house-svg-outline"><rect x="0" y="0" width="30" height="60" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'wall',
                name: 'Base Wall',
                width: 160,
                height: 140,
                targetX: 310,
                targetY: 240,
                svg: `<svg viewBox="0 0 160 140" class="house-svg"><rect x="0" y="0" width="160" height="140" fill="#4ea8de" rx="10"/></svg>`,
                outline: `<svg viewBox="0 0 160 140" class="house-svg-outline"><rect x="0" y="0" width="160" height="140" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'roof',
                name: 'Roof',
                width: 180,
                height: 90,
                targetX: 300,
                targetY: 160,
                svg: `<svg viewBox="0 0 180 90" class="house-svg"><polygon points="90,5 175,85 5,85" fill="#ff6b9d"/><polygon points="90,15 160,85 20,85" fill="#ff4d88"/></svg>`,
                outline: `<svg viewBox="0 0 180 90" class="house-svg-outline"><polygon points="90,5 175,85 5,85" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'window',
                name: 'Window',
                width: 45,
                height: 45,
                targetX: 335,
                targetY: 265,
                svg: `<svg viewBox="0 0 45 45" class="house-svg" id="house-window-glass"><rect x="0" y="0" width="45" height="45" fill="#fff" stroke="#ffca3a" stroke-width="4" rx="5"/><line x1="22.5" y1="0" x2="22.5" y2="45" stroke="#ffca3a" stroke-width="4"/><line x1="0" y1="22.5" x2="45" y2="22.5" stroke="#ffca3a" stroke-width="4"/></svg>`,
                outline: `<svg viewBox="0 0 45 45" class="house-svg-outline"><rect x="0" y="0" width="45" height="45" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            },
            {
                id: 'door',
                name: 'Door',
                width: 50,
                height: 90,
                targetX: 395,
                targetY: 290,
                svg: `<svg viewBox="0 0 50 90" class="house-svg"><rect x="0" y="0" width="50" height="90" fill="#fb8500" rx="8"/><circle cx="12" cy="45" r="5" fill="#fff"/></svg>`,
                outline: `<svg viewBox="0 0 50 90" class="house-svg-outline"><rect x="0" y="0" width="50" height="90" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-dasharray="5"/></svg>`
            }
        ];

        this.placedCount = 0;
        this.totalComponents = this.components.length;
        this.active = false;
        this.smokeInterval = null;
    }

    start() {
        this.placedCount = 0;
        this.active = true;
        this.render();
        this.setupDragAndDrop();
    }

    stop() {
        this.active = false;
        if (this.smokeInterval) {
            clearInterval(this.smokeInterval);
            this.smokeInterval = null;
        }
    }

    render() {
        const shuffledDraggables = [...this.components].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="house-game-arena">
                <!-- Sky & Grass landscape area (800x380 px) -->
                <div class="house-canvas" id="house-canvas">
                    <div class="house-grass-ground"></div>
                    
                    <!-- Silhouettes -->
                    ${this.components.map(c => `
                        <div class="house-blueprint-slot" id="slot-${c.id}" style="position: absolute; left: ${c.targetX}px; top: ${c.targetY}px; width: ${c.width}px; height: ${c.height}px;">
                            ${c.outline}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Bottom building materials tray -->
                <div class="house-tray" id="house-tray">
                    ${shuffledDraggables.map(c => `
                        <div class="house-draggable-item" data-id="${c.id}" style="width: ${c.width}px; height: ${c.height}px; position: relative; left: 0; top: 0; z-index: 10;">
                            ${c.svg}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const draggables = this.container.querySelectorAll('.house-draggable-item');

        draggables.forEach(draggable => {
            let startX = 0, startY = 0;
            let currentX = 0, currentY = 0;
            let initialOffsetLeft = 0, initialOffsetTop = 0;
            let isDragging = false;
            let compId = draggable.dataset.id;
            let compInfo = this.components.find(c => c.id === compId);

            draggable.addEventListener('pointerdown', (e) => {
                if (!this.active) return;
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

                // Calculate overlaps via coordinate-independent getBoundingClientRect
                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                const slot = document.getElementById(`slot-${compId}`);
                if (slot) {
                    const slotRect = slot.getBoundingClientRect();
                    const isHovered = (
                        centerXPx >= slotRect.left &&
                        centerXPx <= slotRect.right &&
                        centerYPx >= slotRect.top &&
                        centerYPx <= slotRect.bottom
                    );

                    if (isHovered) {
                        slot.classList.add('hovered');
                    } else {
                        slot.classList.remove('hovered');
                    }
                }
            });

            draggable.addEventListener('pointerup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                draggable.classList.remove('dragging');
                draggable.releasePointerCapture(e.pointerId);

                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                const slot = document.getElementById(`slot-${compId}`);
                let isMatched = false;

                if (slot) {
                    const slotRect = slot.getBoundingClientRect();
                    isMatched = (
                        centerXPx >= slotRect.left &&
                        centerXPx <= slotRect.right &&
                        centerYPx >= slotRect.top &&
                        centerYPx <= slotRect.bottom
                    );
                }

                if (isMatched) {
                    // Success! Remove hovered outline, make slot matched (showing the colored block inside canvas)
                    slot.classList.remove('hovered');
                    slot.classList.add('matched');
                    
                    // Snap! Replace slot outline SVG with colored SVG inside slot element
                    slot.innerHTML = compInfo.svg;
                    slot.style.opacity = '1'; // Make fully visible since outline was translucent
                    
                    // Remove draggable from bottom tray
                    draggable.remove();

                    if (window.gameAudio) window.gameAudio.playSuccess();

                    this.placedCount++;
                    this.updateProgress();

                    if (this.placedCount === this.totalComponents) {
                        this.celebrateCompletion();
                    }
                } else {
                    // Return to tray
                    if (window.gameAudio) window.gameAudio.playError();
                    draggable.classList.add('shake');

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

    celebrateCompletion() {
        // 1. Turn window glowing yellow
        const windowGlass = document.getElementById('house-window-glass');
        if (windowGlass) {
            const rect = windowGlass.querySelector('rect');
            if (rect) rect.setAttribute('fill', '#ffe246');
        }

        // 2. Start chimney smoke particles inside canvas area
        const canvas = document.getElementById('house-canvas');
        this.smokeInterval = setInterval(() => {
            if (!this.active) return;
            const smoke = document.createElement('div');
            smoke.className = 'smoke-particle';
            smoke.style.left = '340px'; // center of chimney slot
            smoke.style.top = '100px';
            canvas.appendChild(smoke);

            setTimeout(() => {
                smoke.remove();
            }, 1000);
        }, 300);

        // 3. Complete Game
        setTimeout(() => {
            this.onWin();
        }, 1200);
    }

    updateProgress() {
        const progressStarsContainer = document.getElementById('game-progress');
        if (!progressStarsContainer) return;

        progressStarsContainer.innerHTML = '';
        for (let i = 0; i < this.totalComponents; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < this.placedCount ? ' active' : '');
            star.innerText = '⭐';
            progressStarsContainer.appendChild(star);
        }
    }
}

window.HouseGame = HouseGame;
