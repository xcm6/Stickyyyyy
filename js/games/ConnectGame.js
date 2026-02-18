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
                <div class="connect-header">
                    <h3>Check All Dots</h3>
                    <div class="connect-progress">
                        <span id="connectCount">0</span>/<span id="connectTotal">${this.DOTS}</span> filled
                    </div>
                </div>
                <div class="connect-arena" id="connectArena"></div>
                <div class="connect-hint">Click all dots to fill them</div>
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

        // 点的配置 (18px + 3px*2 border = 24px diameter)
        const DOT_RADIUS = 12; // 点的半径
        const EDGE_PADDING = 5; // 额外的边缘padding
        const EDGE_MARGIN = DOT_RADIUS + EDGE_PADDING; // 从边缘到点中心的最小距离
        const MIN_DISTANCE = 60; // 点之间中心的最小距离
        
        // 随机生成不重叠的点位置
        const positions = [];
        const maxAttempts = 500; // 最大尝试次数
        
        for (let i = 0; i < this.DOTS; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            let currentMinDistance = MIN_DISTANCE;
            
            while (!validPosition && attempts < maxAttempts) {
                // 随机生成位置，保持边距
                x = EDGE_MARGIN + Math.random() * (arenaWidth - 2 * EDGE_MARGIN);
                y = EDGE_MARGIN + Math.random() * (arenaHeight - 2 * EDGE_MARGIN);
                
                // 确保点完全在边界内
                if (x < EDGE_MARGIN || x > arenaWidth - EDGE_MARGIN ||
                    y < EDGE_MARGIN || y > arenaHeight - EDGE_MARGIN) {
                    attempts++;
                    continue;
                }
                
                // 检查是否与已有点冲突
                validPosition = true;
                for (const existingPos of positions) {
                    const dx = x - existingPos.x;
                    const dy = y - existingPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < currentMinDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
                
                // 如果尝试了很多次还没找到，放松距离约束
                if (attempts > maxAttempts / 2 && !validPosition) {
                    currentMinDistance = Math.max(DOT_RADIUS * 2.5, currentMinDistance * 0.9);
                }
            }
            
            // 确保添加位置（即使没找到完美位置也要添加）
            if (validPosition) {
                positions.push({ x, y });
            } else if (positions.length < this.DOTS) {
                // 如果实在找不到，使用最后生成的位置
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
                    showToast('Perfect! All dots connected!', 'success');
                    setTimeout(() => this.onSuccess(), 800);
                }
            });
            
            this.arena.appendChild(el);
        });
        
        this.totalEl.textContent = this.DOTS;
    }
}
