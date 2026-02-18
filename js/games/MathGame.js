import { randInt, showToast } from '../utils.js';

export default class MathGame {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.q = this.generateQuestion();
    }

    generateQuestion() {
        const a = randInt(1, 9);
        const b = randInt(1, 9);
        // 随机加法或乘法
        if (Math.random() > 0.5) {
            return { str: `${a} + ${b} = ?`, ans: a + b };
        } else {
            return { str: `${a} × ${b} = ?`, ans: a * b };
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="math-container">
                <div class="math-header">
                    <h3>Solve to Check-in</h3>
                    <div class="math-subtitle">Answer the question below</div>
                </div>
                <div class="math-question">${this.q.str}</div>
                <div class="math-input-wrapper">
                    <input type="number" id="mathInput" class="math-input" placeholder="?" inputmode="numeric" autofocus>
                </div>
                <button id="verifyBtn" class="primary-btn math-verify-btn">Verify Answer</button>
            </div>
        `;

        const btn = this.container.querySelector('#verifyBtn');
        const input = this.container.querySelector('#mathInput');

        // 绑定点击和回车事件
        const check = () => {
            const answer = parseInt(input.value);
            if (isNaN(answer)) {
                showToast("Please enter a number", "error");
                return;
            }
            
            if (answer === this.q.ans) {
                input.classList.add('correct');
                btn.disabled = true;
                setTimeout(() => this.onSuccess(), 500);
            } else {
                input.classList.add('shake');
                showToast("Wrong answer, try again!", "error");
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.value = '';
                    input.focus();
                }, 500);
            }
        };

        btn.onclick = check;
        input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
    }
}