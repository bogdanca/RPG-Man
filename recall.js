// Recall System - League of Legends style

class RecallSystem {
    constructor(game) {
        this.game = game;
        this.isRecalling = false;
        this.recallProgress = 0;
        this.recallDuration = 2000; // 2 seconds
        this.recallStartTime = 0;
        
        this.setupRecallButton();
        this.drawRecallIcon();
    }
    
    drawRecallIcon() {
        const canvas = document.getElementById('recall-icon');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Old LoL recall icon style - teleport/portal swirl
        // Outer circle
        ctx.fillStyle = '#4169e1'; // Royal blue
        ctx.fillRect(4, 8, 24, 16);
        ctx.fillRect(6, 6, 20, 20);
        ctx.fillRect(8, 4, 16, 24);
        ctx.fillRect(10, 3, 12, 26);
        
        // Inner spiral
        ctx.fillStyle = '#87ceeb'; // Light blue
        ctx.fillRect(12, 10, 8, 2);
        ctx.fillRect(14, 12, 4, 2);
        ctx.fillRect(12, 14, 8, 2);
        ctx.fillRect(10, 16, 12, 2);
        ctx.fillRect(12, 18, 8, 2);
        ctx.fillRect(14, 20, 4, 2);
        
        // Center bright spot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 14, 4, 4);
        
        // Stars/sparkles around
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(4, 4, 2, 2);
        ctx.fillRect(26, 4, 2, 2);
        ctx.fillRect(4, 26, 2, 2);
        ctx.fillRect(26, 26, 2, 2);
        
        // Dark outline
        ctx.fillStyle = '#191970'; // Midnight blue
        ctx.fillRect(10, 2, 12, 1);
        ctx.fillRect(8, 3, 2, 1);
        ctx.fillRect(22, 3, 2, 1);
        ctx.fillRect(4, 7, 2, 2);
        ctx.fillRect(26, 7, 2, 2);
        ctx.fillRect(3, 9, 1, 14);
        ctx.fillRect(28, 9, 1, 14);
        ctx.fillRect(4, 23, 2, 2);
        ctx.fillRect(26, 23, 2, 2);
        ctx.fillRect(8, 28, 2, 1);
        ctx.fillRect(22, 28, 2, 1);
        ctx.fillRect(10, 29, 12, 1);
    }
    
    setupRecallButton() {
        const recallBtn = document.getElementById('recall-btn');
        if (recallBtn) {
            recallBtn.addEventListener('click', () => this.startRecall());
        }
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
