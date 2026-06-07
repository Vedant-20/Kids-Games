class BlocksGame {
    constructor(container, onWin) {
        this.container = container;
        this.onWin = onWin;
        this.targetHeight = 5;
        this.tower = []; // Array of placed block objects: { element, color, width, height, x, y }
        this.colors = ['pink', 'blue', 'green', 'yellow', 'orange', 'purple'];
    }

    start() {
        this.tower = [];
        this.render();
        this.setupDragAndDrop();
    }

    render() {
        this.container.innerHTML = `
            <div class="blocks-game">
                <div class="blocks-palette" id="blocks-palette">
                    <!-- Palettes blocks will be dynamically generated here -->
                </div>
                <div class="stack-canvas-area" id="stack-area">
                    <div class="tower-height-indicator" id="height-indicator">Height: 0 / ${this.targetHeight} 🧱</div>
                    <div class="stack-platform" id="stack-platform"></div>
                    <!-- Placed blocks will be here -->
                </div>
            </div>
        `;
        this.fillPalette();
    }

    fillPalette() {
        const palette = document.getElementById('blocks-palette');
        if (!palette) return;

        palette.innerHTML = '';
        // Create 5 blocks of different colors in the palette
        for (let i = 0; i < 5; i++) {
            const color = this.colors[i % this.colors.length];
            const block = document.createElement('div');
            block.className = `toy-block block-${color}`;
            block.dataset.color = color;
            block.draggable = false;
            block.innerText = '🧱';
            palette.appendChild(block);
        }
    }

    setupDragAndDrop() {
        const palette = document.getElementById('blocks-palette');
        const stackArea = document.getElementById('stack-area');
        const platform = document.getElementById('stack-platform');

        // Event delegation on palette blocks
        palette.addEventListener('pointerdown', (e) => {
            const blockTemplate = e.target.closest('.toy-block');
            if (!blockTemplate) return;

            if (window.gameAudio) window.gameAudio.init();

            // Create a new active block in the stack area to drag
            const color = blockTemplate.dataset.color;
            const newBlock = document.createElement('div');
            newBlock.className = `placed-block block-${color}`;
            newBlock.dataset.color = color;
            newBlock.style.width = '120px';
            newBlock.style.height = '50px';
            newBlock.innerText = '🧱';

            // Position it initially where the click happened (relative to stack area)
            const stackAreaRect = stackArea.getBoundingClientRect();
            let initialX = e.clientX - stackAreaRect.left - 60; // center block
            let initialY = e.clientY - stackAreaRect.top - 25;

            newBlock.style.left = `${initialX}px`;
            newBlock.style.top = `${initialY}px`;
            stackArea.appendChild(newBlock);

            // Trigger manual dragging on this new block
            this.handleBlockDrag(newBlock, e, stackArea, platform);
        });
    }

    handleBlockDrag(block, startEvent, stackArea, platform) {
        let isDragging = true;
        block.classList.add('dragging');
        block.setPointerCapture(startEvent.pointerId);

        if (window.gameAudio) window.gameAudio.playDrag();

        const stackAreaRect = stackArea.getBoundingClientRect();
        
        // Calculate offsets
        let startX = startEvent.clientX;
        let startY = startEvent.clientY;
        let initialLeft = parseFloat(block.style.left);
        let initialTop = parseFloat(block.style.top);

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let currentX = initialLeft + deltaX;
            let currentY = initialTop + deltaY;

            // Clamp inside stack area boundaries
            currentX = Math.max(0, Math.min(stackAreaRect.width - 120, currentX));
            currentY = Math.max(0, Math.min(stackAreaRect.height - 50, currentY));

            block.style.left = `${currentX}px`;
            block.style.top = `${currentY}px`;
        };

        const onPointerUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            block.classList.remove('dragging');
            block.releasePointerCapture(e.pointerId);

            // Clean up event listeners
            block.removeEventListener('pointermove', onPointerMove);
            block.removeEventListener('pointerup', onPointerUp);

            const blockWidth = 120;
            const blockHeight = 50;
            const blockX = parseFloat(block.style.left);
            const blockY = parseFloat(block.style.top);

            const platformRect = platform.getBoundingClientRect();
            const platformTopY = platformRect.top - stackAreaRect.top;
            const platformCenterX = (platformRect.left + platformRect.right) / 2 - stackAreaRect.left;

            let targetX = 0;
            let targetY = 0;
            let shouldSnap = false;

            if (this.tower.length === 0) {
                // First block: snap to the center of the platform
                // Platform Y coordinate is platformTopY. The block should sit on top of it.
                const distToPlatformY = Math.abs((blockY + blockHeight) - platformTopY);
                const blockCenterX = blockX + blockWidth / 2;
                const distToPlatformX = Math.abs(blockCenterX - platformCenterX);

                // If within snap range (120px vertically and 100px horizontally)
                if (distToPlatformY < 100 && distToPlatformX < 120) {
                    targetX = platformCenterX - blockWidth / 2;
                    targetY = platformTopY - blockHeight;
                    shouldSnap = true;
                }
            } else {
                // Subsequent blocks: stack on top of the previous block
                const topBlock = this.tower[this.tower.length - 1];
                const topBlockTopY = topBlock.y;
                const topBlockCenterX = topBlock.x + blockWidth / 2;

                const distToTopBlockY = Math.abs((blockY + blockHeight) - topBlockTopY);
                const blockCenterX = blockX + blockWidth / 2;
                const distToTopBlockX = Math.abs(blockCenterX - topBlockCenterX);

                // If within snap range
                if (distToTopBlockY < 90 && distToTopBlockX < 100) {
                    targetX = topBlock.x; // Snap perfectly aligned with block below
                    targetY = topBlockTopY - blockHeight;
                    shouldSnap = true;
                }
            }

            if (shouldSnap) {
                // Snap animation
                block.style.transition = 'all 0.15s ease-out';
                block.style.left = `${targetX}px`;
                block.style.top = `${targetY}px`;

                // Add to tower data
                const towerBlock = {
                    element: block,
                    color: block.dataset.color,
                    x: targetX,
                    y: targetY,
                    width: blockWidth,
                    height: blockHeight
                };
                this.tower.push(towerBlock);

                // Play pitch that goes up with the tower height
                if (window.gameAudio) {
                    // C4 (261.63Hz) up to G4 (392Hz) depending on height
                    const baseFreq = 261.63;
                    const stepMultiplier = 1.122; // Semitone approx
                    const noteFreq = baseFreq * Math.pow(stepMultiplier, this.tower.length * 2);
                    window.gameAudio.playTone(noteFreq, 'sine', 0.2, 0.3, 0.01);
                }

                // Update height UI
                this.updateHeightUI();

                // Check win condition
                if (this.tower.length === this.targetHeight) {
                    setTimeout(() => this.onWin(), 600);
                }
            } else {
                // Failed drop: Fall down out of the screen using CSS transition
                if (window.gameAudio) window.gameAudio.playError();
                
                block.style.transition = 'top 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045), left 0.5s ease-out, opacity 0.5s';
                block.style.top = `${stackAreaRect.height + 100}px`;
                block.style.left = `${blockX + (Math.random() * 80 - 40)}px`;
                block.style.opacity = '0';

                setTimeout(() => {
                    block.remove();
                }, 600);
            }
        };

        block.addEventListener('pointermove', onPointerMove);
        block.addEventListener('pointerup', onPointerUp);
    }

    updateHeightUI() {
        const heightIndicator = document.getElementById('height-indicator');
        if (heightIndicator) {
            heightIndicator.innerText = `Height: ${this.tower.length} / ${this.targetHeight} 🧱`;
        }

        // Update top bar progress stars
        const progressStarsContainer = document.getElementById('game-progress');
        if (progressStarsContainer) {
            progressStarsContainer.innerHTML = '';
            for (let i = 0; i < this.targetHeight; i++) {
                const star = document.createElement('span');
                star.className = 'star' + (i < this.tower.length ? ' active' : '');
                star.innerText = '⭐';
                progressStarsContainer.appendChild(star);
            }
        }
    }
}

window.BlocksGame = BlocksGame;
