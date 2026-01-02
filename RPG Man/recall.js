// Recall System - League of Legends style

class RecallSystem {
    constructor(game) {
        this.game = game;
        this.isRecalling = false;
        this.recallProgress = 0;
        this.recallDuration = 2000; // 2 seconds
        this.recallStartTime = 0;

        this.setupRecallButton();
    }

    setupRecallButton() {
        const recallBtn = document.getElementById('recall-btn');
        if (recallBtn) {
            recallBtn.addEventListener('click', () => this.startRecall());
        }

        // Add keybind "B"
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'b' || e.key === 'B') && !e.repeat) {
                this.startRecall();
            }
        });
    }

    startRecall() {
        // Can't recall if already recalling, dead, or in hub
        if (this.isRecalling || this.game.player.hp <= 0 || this.game.currentZone === 'hub') {
            if (this.game.currentZone === 'hub') {
                this.game.ui.showNotification('Already in hub!', 'damage');
            }
            return;
        }

        // Can't recall during combat or while paused
        if (this.game.paused) {
            return;
        }

        this.isRecalling = true;
        this.recallProgress = 0;
        this.recallStartTime = Date.now();
        this.game.player.isRecalling = true;
        this.game.player.recallProgress = 0;

        this.game.ui.showNotification('Recalling...', 'item');
    }

    cancelRecall() {
        if (this.isRecalling) {
            this.isRecalling = false;
            this.recallProgress = 0;
            this.game.player.isRecalling = false;
            this.game.player.recallProgress = 0;
            this.game.ui.showNotification('Recall cancelled!', 'damage');
        }
    }

    update(deltaTime) {
        if (!this.isRecalling) return;

        const elapsed = Date.now() - this.recallStartTime;
        this.recallProgress = elapsed / this.recallDuration;
        this.game.player.recallProgress = this.recallProgress;

        if (elapsed >= this.recallDuration) {
            // Recall complete!
            this.completeRecall();
        }
    }

    completeRecall() {
        this.isRecalling = false;
        this.recallProgress = 0;
        this.game.player.isRecalling = false;
        this.game.player.recallProgress = 0;

        // Teleport to hub
        this.game.loadZone('hub');
        this.game.ui.showNotification('Returned to hub!', 'level-up');
    }

    // Called when player takes damage
    onPlayerDamaged() {
        this.cancelRecall();
    }
}
