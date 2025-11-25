// Stat Icons - Pixel Art

class StatIcons {
    static drawLevelIcon(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Star/Badge icon for level
        ctx.fillStyle = '#ffd700';
        
        // Center star
        ctx.fillRect(7, 2, 2, 2);
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(4, 6, 8, 2);
        ctx.fillRect(3, 8, 10, 2);
        ctx.fillRect(5, 10, 6, 2);
        ctx.fillRect(6, 12, 4, 2);
        ctx.fillRect(7, 14, 2, 1);
        
        // Shine effect
        ctx.fillStyle = '#ffed4e';
        ctx.fillRect(6, 4, 2, 1);
        ctx.fillRect(5, 6, 2, 1);
        
        // Dark outline
        ctx.fillStyle = '#8b7500';
        ctx.fillRect(6, 1, 4, 1);
        ctx.fillRect(4, 3, 1, 1);
        ctx.fillRect(11, 3, 1, 1);
        ctx.fillRect(3, 7, 1, 1);
        ctx.fillRect(12, 7, 1, 1);
    }
    
    static drawCoinsIcon(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Gold coin
        ctx.fillStyle = '#ffd700';
        
        // Main coin body
        ctx.fillRect(5, 3, 6, 10);
        ctx.fillRect(4, 5, 8, 6);
        ctx.fillRect(3, 6, 10, 4);
        
        // Coin highlight
        ctx.fillStyle = '#ffed4e';
        ctx.fillRect(5, 4, 4, 2);
        ctx.fillRect(4, 6, 2, 2);
        
        // Coin shadow
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(8, 11, 3, 2);
        ctx.fillRect(9, 10, 2, 1);
        
        // Dark outline
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(5, 2, 6, 1);
        ctx.fillRect(4, 4, 1, 1);
        ctx.fillRect(11, 4, 1, 1);
        ctx.fillRect(3, 5, 1, 2);
        ctx.fillRect(12, 5, 1, 2);
        ctx.fillRect(2, 6, 1, 4);
        ctx.fillRect(13, 6, 1, 4);
        ctx.fillRect(3, 10, 1, 2);
        ctx.fillRect(12, 10, 1, 2);
        ctx.fillRect(4, 12, 1, 1);
        ctx.fillRect(11, 12, 1, 1);
        ctx.fillRect(5, 13, 6, 1);
        
        // Sparkle
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 5, 1, 1);
    }
    
    static drawMaterialsIcon(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Gear/cog icon
        ctx.fillStyle = '#708090';
        
        // Center hub
        ctx.fillRect(6, 6, 4, 4);
        
        // Teeth
        ctx.fillRect(7, 2, 2, 4); // Top
        ctx.fillRect(7, 10, 2, 4); // Bottom
        ctx.fillRect(2, 7, 4, 2); // Left
        ctx.fillRect(10, 7, 4, 2); // Right
        
        // Diagonal teeth
        ctx.fillRect(4, 4, 2, 2); // Top-left
        ctx.fillRect(10, 4, 2, 2); // Top-right
        ctx.fillRect(4, 10, 2, 2); // Bottom-left
        ctx.fillRect(10, 10, 2, 2); // Bottom-right
        
        // Highlight
        ctx.fillStyle = '#98a5b5';
        ctx.fillRect(6, 6, 2, 1);
        ctx.fillRect(7, 3, 1, 1);
        ctx.fillRect(3, 7, 1, 1);
        
        // Center hole
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(7, 7, 2, 2);
        
        // Dark outline
        ctx.fillStyle = '#3a4a5a';
        ctx.fillRect(8, 1, 1, 1);
        ctx.fillRect(7, 1, 1, 1);
        ctx.fillRect(1, 7, 1, 1);
        ctx.fillRect(1, 8, 1, 1);
        ctx.fillRect(7, 14, 1, 1);
        ctx.fillRect(8, 14, 1, 1);
        ctx.fillRect(14, 7, 1, 1);
        ctx.fillRect(14, 8, 1, 1);
    }
    
    static initializeIcons() {
        // Draw all icons once
        const levelCanvas = document.getElementById('level-icon');
        const coinsCanvas = document.getElementById('coins-icon');
        const materialsCanvas = document.getElementById('materials-icon');
        
        if (levelCanvas) this.drawLevelIcon(levelCanvas);
        if (coinsCanvas) this.drawCoinsIcon(coinsCanvas);
        if (materialsCanvas) this.drawMaterialsIcon(materialsCanvas);
    }
}

// Initialize icons when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StatIcons.initializeIcons());
} else {
    StatIcons.initializeIcons();
}
