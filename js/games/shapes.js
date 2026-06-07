class ShapesGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        
        // Shape specifications
        this.shapes = [
            {
                id: 'circle',
                name: 'Circle',
                color: 'var(--color-pink)',
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><circle cx="50" cy="50" r="40" fill="var(--color-pink)"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="shape-svg"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="5" stroke-dasharray="6"/></svg>`
            },
            {
                id: 'square',
                name: 'Square',
                color: 'var(--color-blue)',
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="15" y="15" width="70" height="70" rx="10" ry="10" fill="var(--color-blue)"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="15" y="15" width="70" height="70" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="5" stroke-dasharray="6"/></svg>`
            },
            {
                id: 'triangle',
                name: 'Triangle',
                color: 'var(--color-green)',
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,12 88,82 12,82" fill="var(--color-green)"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,12 88,82 12,82" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="5" stroke-dasharray="6"/></svg>`
            },
            {
                id: 'star',
                name: 'Star',
                color: 'var(--color-yellow)',
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="var(--color-yellow)"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="5" stroke-dasharray="6"/></svg>`
            },
            {
                id: 'heart',
                name: 'Heart',
                color: 'var(--color-purple)',
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><path d="M50,85 L18,52 C6,40 6,22 18,10 C30,-2 44,4 50,16 C56,4 70,-2 82,10 C94,22 94,40 82,52 Z" fill="var(--color-purple)"/></svg>`,
                outline: `<svg viewBox="0 0 100 100" class="shape-svg"><path d="M50,85 L18,52 C6,40 6,22 18,10 C30,-2 44,4 50,16 C56,4 70,-2 82,10 C94,22 94,40 82,52 Z" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="5" stroke-dasharray="6"/></svg>`
            }
        ];

        this.matchedCount = 0;
        this.totalShapes = this.shapes.length;
    }

    start() {
        this.matchedCount = 0;
        this.render();
        this.setupDragAndDrop();
    }

    render() {
        // Shuffle shapes list for draggable container, and for dropzone container
        const shuffledDraggables = [...this.shapes].sort(() => Math.random() - 0.5);
        const shuffledSlots = [...this.shapes].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="shapes-game">
                <div class="dropzone-container">
                    ${shuffledSlots.map(s => `
                        <div class="shape-slot" data-shape="${s.id}">
                            ${s.outline}
                        </div>
                    `).join('')}
                </div>
                <div class="draggable-container">
                    ${shuffledDraggables.map(s => `
                        <div class="draggable-shape" data-shape="${s.id}" style="position: relative; left: 0; top: 0;">
                            ${s.svg}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const draggables = this.container.querySelectorAll('.draggable-shape');
        const slots = this.container.querySelectorAll('.shape-slot');

        draggables.forEach(draggable => {
            let startX = 0, startY = 0;
            let currentX = 0, currentY = 0;
            let initialOffsetLeft = 0, initialOffsetTop = 0;
            let isDragging = false;

            draggable.addEventListener('pointerdown', (e) => {
                // Initialize context sounds
                if (window.gameAudio) window.gameAudio.init();

                isDragging = true;
                draggable.classList.add('dragging');
                draggable.setPointerCapture(e.pointerId);

                // Play drag grabbing sound
                if (window.gameAudio) window.gameAudio.playDrag();

                // Get coordinates relative to screen
                startX = e.clientX;
                startY = e.clientY;

                // Save starting styles
                initialOffsetLeft = parseFloat(draggable.style.left) || 0;
                initialOffsetTop = parseFloat(draggable.style.top) || 0;
            });

            draggable.addEventListener('pointermove', (e) => {
                if (!isDragging) return;

                // Move element based on pointer delta
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                currentX = initialOffsetLeft + deltaX;
                currentY = initialOffsetTop + deltaY;

                draggable.style.left = `${currentX}px`;
                draggable.style.top = `${currentY}px`;

                // Highlight slot if we are hovering over it
                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                slots.forEach(slot => {
                    if (slot.classList.contains('matched')) return;
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
                });
            });

            draggable.addEventListener('pointerup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                draggable.classList.remove('dragging');
                draggable.releasePointerCapture(e.pointerId);

                const shapeId = draggable.dataset.shape;
                const rect = draggable.getBoundingClientRect();
                const centerXPx = rect.left + rect.width / 2;
                const centerYPx = rect.top + rect.height / 2;

                let matchedSlot = null;

                slots.forEach(slot => {
                    if (slot.classList.contains('matched')) return;
                    const slotRect = slot.getBoundingClientRect();
                    const isHovered = (
                        centerXPx >= slotRect.left &&
                        centerXPx <= slotRect.right &&
                        centerYPx >= slotRect.top &&
                        centerYPx <= slotRect.bottom
                    );

                    if (isHovered) {
                        slot.classList.remove('hovered');
                        if (slot.dataset.shape === shapeId) {
                            matchedSlot = slot;
                        }
                    }
                });

                if (matchedSlot) {
                    // Success! Fit it in perfectly
                    matchedSlot.classList.add('matched');
                    
                    // Replace transparent SVG outline with the colorful matching SVG
                    const matchedInfo = this.shapes.find(s => s.id === shapeId);
                    matchedSlot.innerHTML = matchedInfo.svg;
                    
                    // Remove the draggable element
                    draggable.remove();

                    if (window.gameAudio) window.gameAudio.playSuccess();
                    
                    this.matchedCount++;
                    this.updateProgress();

                    if (this.matchedCount === this.totalShapes) {
                        setTimeout(() => this.onWin(), 600);
                    }
                } else {
                    // Fail! Slide back nicely
                    draggable.classList.add('shake');
                    if (window.gameAudio) window.gameAudio.playError();
                    
                    // Smooth transition reset
                    draggable.style.transition = 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    draggable.style.left = '0px';
                    draggable.style.top = '0px';

                    setTimeout(() => {
                        draggable.style.transition = '';
                        draggable.classList.remove('shake');
                    }, 400);
                }
            });

            // Handle cancellation cases
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
        for (let i = 0; i < this.totalShapes; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < this.matchedCount ? ' active' : '');
            star.innerText = '⭐';
            progressStarsContainer.appendChild(star);
        }
    }
}

window.ShapesGame = ShapesGame;
