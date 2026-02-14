import { showToast } from '../utils.js';

export default class ConnectGame {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        
        this.DOTS = 5;
        this.dots = [];
        this.connected = 0;
        this.arena = null;
    }

    render() {
        this.container.innerHTML = `
            <div class="connect-container">
                <div class="connect-info">
                    <div>Filled: <b id="connectCount">0</b> / <b id="connectTotal">${this.DOTS}</b></div>
                </div>
                <div class="connect-arena" id="connectArena"></div>
                <div class="connect-hint">Click all dots to fill them.</div>
            </div>
        `;

        this.arena = this.container.querySelector('#connectArena');
        this.countEl = this.container.querySelector('#connectCount');
        this.totalEl = this.container.querySelector('#connectTotal');

        this.makeDots();
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    makeDots() {
        // 清空已有的点
        this.arena.querySelectorAll('.connect-dot').forEach(d => d.remove());
        this.dots = [];
        this.connected = 0;
        this.countEl.textContent = this.connected;

        // 获取 arena 实际尺寸
        const arenaWidth = this.arena.clientWidth;
        const arenaHeight = this.arena.clientHeight;

        // 点的配置
        const DOT_RADIUS = 11; // 点的半径 (18px/2 + 2px border)
        const EDGE_MARGIN = 50; // 从边缘到点中心的最小距离
        const MIN_DISTANCE = 80; // 点之间中心的最小距离
        
        // 随机生成不重叠的点位置
        const positions = [];
        const maxAttempts = 200; // 最大尝试次数
        
        for (let i = 0; i < this.DOTS; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            
            while (!validPosition && attempts < maxAttempts) {
                // 随机生成位置，保持边距
                x = EDGE_MARGIN + Math.random() * (arenaWidth - 2 * EDGE_MARGIN);
                y = EDGE_MARGIN + Math.random() * (arenaHeight - 2 * EDGE_MARGIN);
                
                // 检查是否与已有点冲突
                validPosition = true;
                for (const existingPos of positions) {
                    const dx = x - existingPos.x;
                    const dy = y - existingPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < MIN_DISTANCE) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                positions.push({ x, y });
            }
        }
        
        // 在每个位置创建一个点
        positions.forEach((pos, index) => {
            const x = pos.x;
            const y = pos.y;
            
            // 创建点的数据
            const dotData = { x, y, el: null, done: false };
            this.dots.push(dotData);
            
            // 创建 DOM 元素
            const el = document.createElement('div');
            el.className = 'connect-dot';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            
            // 更新元素引用
            dotData.el = el;
            
            // 添加点击事件
            el.addEventListener('click', () => {
                if (dotData.done) return;
                
                dotData.done = true;
                el.classList.add('done');
                this.connected++;
                this.countEl.textContent = this.connected;

                if (this.connected === this.DOTS) {
                    showToast('PASS', 'success');
                    setTimeout(() => this.onSuccess(), 800);
                }
            });
            
            this.arena.appendChild(el);
        });
        
        this.totalEl.textContent = this.DOTS;
    }
}
