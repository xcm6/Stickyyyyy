import { showToast } from '../utils.js';

export default class TargetGame {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        
        this.GOAL = 5;
        this.SPEED = 0.6;  // 降低速度使移动更缓慢
        
        this.hits = 0;
        this.playing = true;
        this.target = null;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.lastTime = 0;
    }

    render() {
        this.container.innerHTML = `
            <div class="target-container">

                <div class="target-info">
                    <div>Hits: <b id="targetHits">0</b> / ${this.GOAL}</div>
                </div>
                <div class="target-arena" id="targetArena"></div>
                <div class="target-hint">Click the moving target. ${this.GOAL} hits to win.</div>
            </div>
        `;

        this.arena = this.container.querySelector('#targetArena');
        this.hitsEl = this.container.querySelector('#targetHits');

        this.createTarget();
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    createTarget() {
        this.target = document.createElement('div');
        this.target.className = 'target-dot';
        this.arena.appendChild(this.target);

        const rect = this.arena.getBoundingClientRect();
        const margin = 60; // 适合新的横屏尺寸的边距
        this.x = this.random(margin, rect.width - margin);
        this.y = this.random(margin, rect.height - margin);

        // 生成随机角度，确保速度大小恒定
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.SPEED;
        this.vy = Math.sin(angle) * this.SPEED;
        
        // 重置时间计数
        this.lastTime = 0;

        this.target.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.playing) return;

            this.hits++;
            this.hitsEl.textContent = this.hits;

            this.target.style.background = '#4CAF50';
            this.target.style.transform = 'translate(-50%, -50%) scale(1.3)';

            setTimeout(() => {
                this.target.remove();

                if (this.hits >= this.GOAL) {
                    this.playing = false;
                    showToast('PASS', 'success');
                    setTimeout(() => this.onSuccess(), 500);
                    return;
                }

                setTimeout(() => {
                    this.createTarget();
                }, 150);
            }, 200);
        });

        this.move();
    }

    move(timestamp = 0) {
        if (!this.playing || !this.target) return;

        // 时间归一化 - 确保速度在不同帧率下保持一致
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 16.67; // 归一化到60fps
        this.lastTime = timestamp;

        const rect = this.arena.getBoundingClientRect();
        const r = 23;

        // 应用速度，考虑时间增量
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        if (this.x < r || this.x > rect.width - r) this.vx *= -1;
        if (this.y < r || this.y > rect.height - r) this.vy *= -1;

        this.target.style.left = this.x + 'px';
        this.target.style.top = this.y + 'px';

        requestAnimationFrame((ts) => this.move(ts));
    }
}
