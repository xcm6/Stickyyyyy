import { showToast } from '../utils.js';

export default class ReactionGame {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        
        this.PROMPTS = ['CLICK', 'TAP'];
        this.WIN_GOOD = 2;
        this.GOOD_MS = 700;
        this.DELAY_MIN = 1500;
        this.DELAY_MAX = 3500;
        
        this.mode = 'idle';
        this.timer = null;
        this.shownAt = 0;
        this.round = 0;
        this.good = 0;
    }

    render() {
        this.container.innerHTML = `
            <div class="reaction-container">
                <div class="reaction-info">
                    <div>Round: <b id="reactionRound">1</b>/2</div>
                    <div>Good: <b id="reactionGood">0</b>/2</div>
                    <div>Last: <b id="reactionLast">—</b></div>
                </div>
                <div class="reaction-pad" id="reactionPad">
                    <div class="reaction-state" id="reactionState">CLICK TO START</div>
                </div>
                <div class="reaction-sub" id="reactionSub">
                    Wait... then click when the word appears. Don't click early.
                </div>
            </div>
        `;

        this.pad = this.container.querySelector('#reactionPad');
        this.stateEl = this.container.querySelector('#reactionState');
        this.subEl = this.container.querySelector('#reactionSub');
        this.roundEl = this.container.querySelector('#reactionRound');
        this.goodEl = this.container.querySelector('#reactionGood');
        this.lastEl = this.container.querySelector('#reactionLast');

        this.pad.addEventListener('click', () => this.handleClick());
    }

    handleClick() {
        if (this.mode === 'idle') {
            this.startRound();
            return;
        }

        if (this.mode === 'waiting') {
            clearTimeout(this.timer);
            this.mode = 'idle';
            this.stateEl.textContent = 'TOO EARLY';
            this.subEl.textContent = 'Click to try the round again.';
            this.lastEl.textContent = 'early';
            return;
        }

        if (this.mode === 'show') {
            const ms = Math.round(performance.now() - this.shownAt);
            this.lastEl.textContent = ms + 'ms';

            if (ms <= this.GOOD_MS) {
                this.good++;
                this.goodEl.textContent = this.good;
                this.round++;

                if (this.good >= this.WIN_GOOD) {
                    this.win();
                    return;
                }

                if (this.round >= this.PROMPTS.length) {
                    this.win();
                    return;
                }

                this.mode = 'idle';
                this.stateEl.textContent = 'NICE';
                this.subEl.textContent = `Good! Click to start Round ${this.round + 1}.`;
            } else {
                this.mode = 'idle';
                this.stateEl.textContent = 'SLOW';
                this.subEl.textContent = `Try again. Need under ${this.GOOD_MS}ms. Click to retry Round ${this.round + 1}.`;
            }
            return;
        }

        if (this.mode === 'done') {
            // Already won, ignore clicks
        }
    }

    startRound() {
        clearTimeout(this.timer);
        this.mode = 'waiting';
        this.stateEl.textContent = 'WAIT...';
        this.subEl.textContent = `Round ${this.round + 1}: wait for "${this.PROMPTS[this.round]}".`;
        this.roundEl.textContent = this.round + 1;

        const delay = this.DELAY_MIN + Math.random() * (this.DELAY_MAX - this.DELAY_MIN);
        this.timer = setTimeout(() => {
            this.mode = 'show';
            this.stateEl.textContent = this.PROMPTS[this.round];
            this.subEl.textContent = 'NOW CLICK!';
            this.shownAt = performance.now();
        }, delay);
    }

    win() {
        this.mode = 'done';
        this.stateEl.textContent = 'PASS ✓';
        this.subEl.textContent = `2 good reactions under ${this.GOOD_MS}ms.`;
        clearTimeout(this.timer);
        showToast('PASS', 'success');
        setTimeout(() => this.onSuccess(), 1000);
    }
}
