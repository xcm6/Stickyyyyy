import MathGame from './MathGame.js';
import SliderGame from './SliderGame.js';
import PuzzleGame from './PuzzleGame.js';
import CameraGame from './CameraGame.js';
import ConnectGame from './ConnectGame.js';
import DodgeGame from './DodgeGame.js';
import ReactionGame from './ReactionGame.js';
import TargetGame from './TargetGame.js';

export default class GameManager {
    constructor(containerId, onComplete) {
        this.container = document.getElementById(containerId);
        this.onComplete = onComplete;
        this.currentGameType = null;
    }

    startDailyChallenge() {
        this.container.innerHTML = ''; // 清空容器
        
        // 1. 定义游戏池
        const games = [
            { class: MathGame, name: 'math' },
            { class: SliderGame, name: 'slider' },
            { class: PuzzleGame, name: 'puzzle' },
            { class: ConnectGame, name: 'connect' },
            { class: DodgeGame, name: 'dodge' },
            { class: ReactionGame, name: 'reaction' },
            { class: TargetGame, name: 'target' }
        ];
        
        // 2. 随机选一个
        const selected = games[Math.floor(Math.random() * games.length)];
        this.currentGameType = selected.name;
        
        // 3. 记录游戏类型到 localStorage（用于统计）
        this.recordGamePlay(selected.name);
        
        // 4. 实例化并开始
        const gameInstance = new selected.class(this.container, () => {
            // 验证通过后的回调 -> 启动相机
            this.startCameraPhase();
        });
        gameInstance.render();
    }
    
    recordGamePlay(gameType) {
        // 记录游戏类型到 localStorage
        const key = `game_stats_${new Date().toISOString().split('T')[0]}`;
        const stats = JSON.parse(localStorage.getItem(key) || '{}');
        stats[gameType] = (stats[gameType] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(stats));
        
        // 也记录到全局统计
        const globalKey = 'game_stats_global';
        const globalStats = JSON.parse(localStorage.getItem(globalKey) || '{}');
        globalStats[gameType] = (globalStats[gameType] || 0) + 1;
        localStorage.setItem(globalKey, JSON.stringify(globalStats));
    }
    
    getCurrentGameType() {
        return this.currentGameType;
    }

    startCameraPhase() {
        this.container.innerHTML = ''; // 清空容器
        
        const camera = new CameraGame(this.container, (photoData) => {
            // 拍照完成后的回调 -> 提交数据
            this.onComplete(photoData);
        });
        camera.render();
    }
}