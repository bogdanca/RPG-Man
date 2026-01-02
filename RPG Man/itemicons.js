// Item Icon Generator

class ItemIconGenerator {
    static generateIcon(slot, level) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Get item data
        const gearData = GEAR_SLOTS[slot];
        const itemData = gearData.levels[level];
        
        // Determine tier colors
        const tier = this.getTier(level);
        
        // Draw based on slot type
        switch(slot) {
            case 'weapon':
                this.drawWeapon(ctx, tier);
                break;
            case 'armor':
                this.drawArmor(ctx, tier);
                break;
            case 'trinket':
                this.drawTrinket(ctx, tier);
                break;
            case 'boots':
                this.drawBoots(ctx, tier);
                break;
        }
        
        return canvas.toDataURL();
    }
    
    static getTier(level) {
        if (level === 0) return 'none';
        if (level === 1) return 'leather';
        if (level === 2) return 'copper';
        if (level === 3) return 'iron';
        if (level === 4) return 'diamond';
        return 'none';
    }
    
    static getTierColors(tier) {
        const colors = {
            none: { primary: '#888', secondary: '#666', highlight: '#aaa' },
            leather: { primary: '#8b4513', secondary: '#654321', highlight: '#a0522d' },
            copper: { primary: '#cd7f32', secondary: '#b8732c', highlight: '#e69138' },
            iron: { primary: '#708090', secondary: '#556b7d', highlight: '#909db0' },
            diamond: { primary: '#40e0d0', secondary: '#20c0b0', highlight: '#60fff0' }
        };
        return colors[tier] || colors.none;
    }
    
    static drawWeapon(ctx, tier) {
        const colors = this.getTierColors(tier);
        
        if (tier === 'none') {
            // Empty/None
            ctx.fillStyle = '#444';
            ctx.fillRect(14, 14, 4, 4);
            return;
        }
        
        // Blade
        ctx.fillStyle = colors.primary;
        ctx.fillRect(14, 4, 4, 16); // Vertical blade
        ctx.fillRect(16, 6, 2, 2);  // Blade tip
        ctx.fillRect(12, 6, 2, 2);  // Blade tip
        
        // Highlight on blade
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(15, 8, 1, 10);
        
        // Edge
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(13, 8, 1, 10);
        ctx.fillRect(18, 8, 1, 10);
        
        // Guard
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(10, 19, 12, 2);
        
        // Handle
        ctx.fillStyle = '#654321';
        ctx.fillRect(14, 21, 4, 6);
        
        // Pommel
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(13, 27, 6, 3);
    }
    
    static drawArmor(ctx, tier) {
        const colors = this.getTierColors(tier);
        
        if (tier === 'none') {
            // Empty/None
            ctx.fillStyle = '#444';
            ctx.fillRect(14, 14, 4, 4);
            return;
        }
        
        // Chestplate body
        ctx.fillStyle = colors.primary;
        ctx.fillRect(10, 10, 12, 14);
        
        // Shoulder pads
        ctx.fillRect(8, 10, 4, 4);
        ctx.fillRect(20, 10, 4, 4);
        
        // Highlight
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(11, 11, 2, 10);
        
        // Detail lines
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(16, 12, 4, 1);
        ctx.fillRect(16, 15, 4, 1);
        ctx.fillRect(16, 18, 4, 1);
        
        // Belt
        ctx.fillStyle = '#654321';
        ctx.fillRect(10, 23, 12, 2);
        
        // Buckle
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(14, 23, 4, 2);
    }
    
    static drawTrinket(ctx, tier) {
        const colors = this.getTierColors(tier);
        
        if (tier === 'none') {
            // Empty/None
            ctx.fillStyle = '#444';
            ctx.fillRect(14, 14, 4, 4);
            return;
        }
        
        // Ring circle
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circle
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(16, 16, 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Gem
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(14, 12, 4, 4);
        
        // Gem highlight
        ctx.fillStyle = '#d291ff';
        ctx.fillRect(15, 13, 2, 1);
        
        // Lucky charm symbols (based on tier)
        const tierLevel = tier === 'leather' ? 1 : tier === 'copper' ? 2 : tier === 'iron' ? 3 : tier === 'diamond' ? 4 : 0;
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < tierLevel; i++) {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
            const x = 16 + Math.cos(angle) * 10;
            const y = 16 + Math.sin(angle) * 10;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
    
    static drawBoots(ctx, tier) {
        const colors = this.getTierColors(tier);
        
        if (tier === 'none') {
            // Bare feet
            ctx.fillStyle = '#ffdab9';
            ctx.fillRect(10, 22, 5, 6);
            ctx.fillRect(17, 22, 5, 6);
            return;
        }
        
        // Left boot
        ctx.fillStyle = colors.primary;
        ctx.fillRect(9, 20, 6, 8);
        ctx.fillRect(9, 27, 8, 2); // Sole
        
        // Left boot highlight
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(10, 21, 2, 6);
        
        // Left boot details
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(11, 23, 3, 1);
        ctx.fillRect(11, 25, 3, 1);
        
        // Right boot
        ctx.fillStyle = colors.primary;
        ctx.fillRect(17, 20, 6, 8);
        ctx.fillRect(15, 27, 8, 2); // Sole
        
        // Right boot highlight
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(20, 21, 2, 6);
        
        // Right boot details
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(18, 23, 3, 1);
        ctx.fillRect(18, 25, 3, 1);
        
        // Laces/buckles (for higher tiers)
        if (tier === 'iron' || tier === 'diamond') {
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(12, 22, 1, 1);
            ctx.fillRect(20, 22, 1, 1);
        }
        
        // Diamond boots glow
        if (tier === 'diamond') {
            ctx.strokeStyle = '#60fff0';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.strokeRect(8, 19, 8, 10);
            ctx.strokeRect(16, 19, 8, 10);
            ctx.globalAlpha = 1;
        }
    }
}
