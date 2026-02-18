import { showToast } from '../utils.js';

export default class DodgeGame {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        
        this.playing = false;
        this.startAt = 0;
        this.lastFrame = 0;
        this.spawnTimerMs = 0;
        
        this.playerX = 0;
        this.moveDir = 0;
        this.dragging = false;
        
        this.blocks = [];
        this.caught = 0;
        
        // 设置
        this.CATCH_GOAL = 10;
        this.PLAYER_W = 46;
        this.PLAYER_H = 14;
        this.PLAYER_Y_PAD = 20;
        this.BLOCK_SIZE = 26;
        this.BASE_BLOCK_SPEED = 1.1;
        this.SPAWN_EVERY_MS = 650;
        
        this.arenaW = 0;
        this.arenaH = 0;
    }

    render() {
        this.container.innerHTML = `
            <div class="dodge-container">
                <div class="dodge-header">
                    <h3>Catch Blocks</h3>
                    <div class="dodge-progress">
                        Caught: <span id="dodgeCaught">0</span>/${this.CATCH_GOAL}
                    </div>
                </div>
                <div class="dodge-arena" id="dodgeArena">
                    <div class="dodge-player" id="dodgePlayer"></div>
                </div>
                <div class="dodge-hint">Use A/D or ← → keys, or drag the player</div>
            </div>
        `;

        this.arena = this.container.querySelector('#dodgeArena');
        this.playerEl = this.container.querySelector('#dodgePlayer');
        this.caughtEl = this.container.querySelector('#dodgeCaught');

        this.measure();
        this.setupControls();
        this.startGame();
    }

    measure() {
        const r = this.arena.getBoundingClientRect();
        this.arenaW = r.width;
        this.arenaH = r.height;
    }

    setPlayerX(x) {
        this.playerX = Math.max(this.PLAYER_W / 2, Math.min(this.arenaW - this.PLAYER_W / 2, x));
        this.playerEl.style.left = this.playerX + 'px';
    }

    clearBlocks() {
        for (const b of this.blocks) b.el.remove();
        this.blocks.length = 0;
    }

    spawnBlock() {
        const el = document.createElement('div');
        el.className = 'dodge-block';
        
        const x = Math.random() * (this.arenaW - this.BLOCK_SIZE);
        const y = -this.BLOCK_SIZE - 6;
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        
        this.arena.appendChild(el);
        this.blocks.push({ el, x, y });
    }

    checkCatch() {
        const px = this.playerX - this.PLAYER_W / 2;
        const py = this.arenaH - this.PLAYER_Y_PAD - this.PLAYER_H;
        const pw = this.PLAYER_W;
        const ph = this.PLAYER_H;

        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            const bx = b.x, by = b.y, bw = this.BLOCK_SIZE, bh = this.BLOCK_SIZE;
            const overlap =
                bx < px + pw &&
                bx + bw > px &&
                by < py + ph &&
                by + bh > py;
            if (overlap) {
                // 接住了！移除方块并加分
                b.el.remove();
                this.blocks.splice(i, 1);
                this.caught++;
                this.caughtEl.textContent = this.caught;
                
                if (this.caught >= this.CATCH_GOAL) {
                    this.endGame(true);
                }
            }
        }
    }

    endGame(win) {
        this.playing = false;
        if (win) {
            showToast('Perfect! All blocks caught!', 'success');
            setTimeout(() => this.onSuccess(), 800);
        }
    }

    loop(ts) {
        if (!this.playing) return;

        if (!this.lastFrame) this.lastFrame = ts;
        const dtMs = ts - this.lastFrame;
        const dt = dtMs / 16.67;
        this.lastFrame = ts;

        const playerSpeed = 5.2;
        if (!this.dragging) this.setPlayerX(this.playerX + this.moveDir * playerSpeed * dt);

        this.spawnTimerMs += dtMs;
        while (this.spawnTimerMs >= this.SPAWN_EVERY_MS) {
            this.spawnTimerMs -= this.SPAWN_EVERY_MS;
            this.spawnBlock();
        }

        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            b.y += this.BASE_BLOCK_SPEED * 3.1 * dt;
            b.el.style.top = b.y + 'px';

            if (b.y > this.arenaH + this.BLOCK_SIZE + 20) {
                b.el.remove();
                this.blocks.splice(i, 1);
            }
        }

        this.checkCatch();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    startGame() {
        this.measure();
        this.clearBlocks();
        
        this.playing = true;
        this.startAt = performance.now();
        this.lastFrame = 0;
        this.spawnTimerMs = 0;
        this.moveDir = 0;
        this.dragging = false;
        this.caught = 0;
        
        this.caughtEl.textContent = this.caught;
        
        this.setPlayerX(this.arenaW / 2);
        requestAnimationFrame((ts) => this.loop(ts));
    }

    setupControls() {
        const keydownHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.moveDir = -1;
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.moveDir = 1;
        };

        const keyupHandler = (e) => {
            if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && this.moveDir === -1) this.moveDir = 0;
            if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && this.moveDir === 1) this.moveDir = 0;
        };

        const pointerX = (evt) => {
            const r = this.arena.getBoundingClientRect();
            const p = (evt.touches && evt.touches[0]) ? evt.touches[0] : evt;
            return p.clientX - r.left;
        };

        const mousedownHandler = (e) => {
            this.dragging = true;
            this.setPlayerX(pointerX(e));
        };

        const mousemoveHandler = (e) => {
            if (!this.dragging) return;
            this.setPlayerX(pointerX(e));
        };

        const mouseupHandler = () => {
            this.dragging = false;
        };

        const touchstartHandler = (e) => {
            e.preventDefault();
            this.dragging = true;
            this.setPlayerX(pointerX(e));
        };

        const touchmoveHandler = (e) => {
            e.preventDefault();
            if (!this.dragging) return;
            this.setPlayerX(pointerX(e));
        };

        const touchendHandler = () => {
            this.dragging = false;
        };

        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);
        this.arena.addEventListener('mousedown', mousedownHandler);
        window.addEventListener('mousemove', mousemoveHandler);
        window.addEventListener('mouseup', mouseupHandler);
        this.arena.addEventListener('touchstart', touchstartHandler, { passive: false });
        this.arena.addEventListener('touchmove', touchmoveHandler, { passive: false });
        this.arena.addEventListener('touchend', touchendHandler);
    }
}
