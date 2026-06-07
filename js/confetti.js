class ConfettiCelebration {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.particles = [];
        this.colors = ['#FF69B4', '#FFD700', '#00FFFF', '#ADFF2F', '#FF4500', '#DA70D6', '#1E90FF'];
        
        window.addEventListener('resize', () => {
            if (this.active) {
                this.resizeCanvas();
            }
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.active = true;
        this.canvas.style.display = 'block';
        this.resizeCanvas();
        this.particles = [];

        // Create particles
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * -this.canvas.height - 20,
                size: Math.random() * 10 + 8,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 5 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 4 - 2,
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        this.animate();
    }

    stop() {
        this.active = false;
        this.canvas.style.display = 'none';
        this.particles = [];
    }

    animate() {
        if (!this.active) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let stillActive = false;

        this.particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            if (p.y < this.canvas.height) {
                stillActive = true;
            }

            this.ctx.save();
            this.ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });

        if (stillActive) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    }
}

window.ConfettiCelebration = ConfettiCelebration;
