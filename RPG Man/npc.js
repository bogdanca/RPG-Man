// NPC System

class NPC {
    constructor(x, y, type, name) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.type = type;
        this.name = name;
        
        // Interaction
        this.interactRadius = 50;
        this.playerNearby = false;
        
        // Animation
        this.animTime = 0;
        this.bobOffset = 0;
    }
    
    update(deltaTime, player) {
        this.animTime += deltaTime;
        
        // Bob animation
        this.bobOffset = Math.sin(this.animTime / 500) * 2;
        
        // Check if player is nearby
        let dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        let dy = (player.y + player.height / 2) - (this.y + this.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        this.playerNearby = distance < this.interactRadius;
    }
    
    checkInteraction(player, key) {
        if (this.playerNearby && key) {
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        
        let drawY = this.y + this.bobOffset;
        
        // Draw blacksmith character (similar style to player)
        if (this.type === 'blacksmith') {
            // Skin tone
            ctx.fillStyle = '#ffdab9';
            
            // Head
            ctx.fillRect(this.x + 8, drawY + 4, 8, 8);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 9, drawY + 6, 2, 2);
            ctx.fillRect(this.x + 13, drawY + 6, 2, 2);
            
            // Beard (brown)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 8, drawY + 10, 8, 3);
            
            // Body (leather apron)
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 6, drawY + 12, 12, 12);
            
            // Apron straps
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 8, drawY + 12, 2, 4);
            ctx.fillRect(this.x + 14, drawY + 12, 2, 4);
            
            // Arms
            ctx.fillStyle = '#ffdab9';
            ctx.fillRect(this.x + 4, drawY + 14, 3, 8);
            ctx.fillRect(this.x + 17, drawY + 14, 3, 8);
            
            // Hammer in hand
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 3, drawY + 20, 2, 4);
            ctx.fillStyle = '#808080';
            ctx.fillRect(this.x + 2, drawY + 18, 4, 3);
            
            // Legs
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(this.x + 8, drawY + 24, 4, 8);
            ctx.fillRect(this.x + 12, drawY + 24, 4, 8);
        }
        
        // Draw potion vendor (alchemist with robes and potions)
        if (this.type === 'potion_vendor') {
            // Skin tone
            ctx.fillStyle = '#ffdab9';
            
            // Head
            ctx.fillRect(this.x + 8, drawY + 4, 8, 8);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 9, drawY + 6, 2, 2);
            ctx.fillRect(this.x + 13, drawY + 6, 2, 2);
            
            // Wizard hat (purple)
            ctx.fillStyle = '#8B008B';
            ctx.fillRect(this.x + 7, drawY, 10, 4); // Brim
            ctx.fillRect(this.x + 9, drawY - 6, 6, 6); // Top
            ctx.fillRect(this.x + 10, drawY - 8, 4, 2); // Tip
            
            // Hat star decoration
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 11, drawY + 1, 2, 2);
            
            // Robe body (green alchemist robe)
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x + 5, drawY + 12, 14, 14);
            
            // Robe trim (gold)
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(this.x + 6, drawY + 12, 2, 14); // Left trim
            ctx.fillRect(this.x + 16, drawY + 12, 2, 14); // Right trim
            ctx.fillRect(this.x + 5, drawY + 12, 14, 2); // Top trim
            
            // Belt with potion bottles
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 6, drawY + 18, 12, 2);
            
            // Potion bottles on belt
            // Red potion
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(this.x + 7, drawY + 17, 2, 3);
            // Blue potion
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(this.x + 11, drawY + 17, 2, 3);
            // Green potion
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x + 15, drawY + 17, 2, 3);
            
            // Arms/sleeves
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x + 3, drawY + 14, 3, 8);
            ctx.fillRect(this.x + 18, drawY + 14, 3, 8);
            
            // Hands
            ctx.fillStyle = '#ffdab9';
            ctx.fillRect(this.x + 3, drawY + 20, 3, 3);
            ctx.fillRect(this.x + 18, drawY + 20, 3, 3);
            
            // Potion bottle in hand (glowing)
            const glowPulse = Math.sin(this.animTime / 400) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(138, 43, 226, ${glowPulse})`;
            ctx.fillRect(this.x + 1, drawY + 19, 3, 5);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 1, drawY + 19, 3, 1); // Cork
            
            // Legs
            ctx.fillStyle = '#2F4F2F';
            ctx.fillRect(this.x + 8, drawY + 26, 4, 6);
            ctx.fillRect(this.x + 12, drawY + 26, 4, 6);
        }
        
        // Draw spirit healer (WoW-style ethereal being)
        if (this.type === 'spirit_healer') {
            // Glowing aura
            const glowPulse = Math.sin(this.animTime / 300) * 0.3 + 0.7;
            ctx.shadowBlur = 15 * glowPulse;
            ctx.shadowColor = '#87ceeb';
            
            // Ethereal glow around character
            ctx.fillStyle = `rgba(135, 206, 235, ${0.2 * glowPulse})`;
            ctx.fillRect(this.x, drawY, this.width, this.height);
            
            // Face (glowing pale)
            ctx.fillStyle = '#e6f7ff';
            ctx.fillRect(this.x + 8, drawY + 4, 8, 8);
            
            // Eyes (glowing blue)
            ctx.fillStyle = '#00bfff';
            ctx.fillRect(this.x + 9, drawY + 6, 2, 2);
            ctx.fillRect(this.x + 13, drawY + 6, 2, 2);
            
            // Hood/robe (ethereal blue-white)
            ctx.fillStyle = '#b0e0e6';
            ctx.fillRect(this.x + 6, drawY + 2, 12, 4); // Hood
            ctx.fillRect(this.x + 5, drawY + 6, 14, 2); // Hood sides
            
            // Robe body (light blue with transparency)
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(this.x + 5, drawY + 12, 14, 14);
            
            // Robe highlights
            ctx.fillStyle = '#add8e6';
            ctx.fillRect(this.x + 6, drawY + 12, 2, 14);
            ctx.fillRect(this.x + 16, drawY + 12, 2, 14);
            
            // Sleeves (wide, flowing)
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(this.x + 2, drawY + 14, 4, 6);
            ctx.fillRect(this.x + 18, drawY + 14, 4, 6);
            
            // Hands (glowing)
            ctx.fillStyle = '#e6f7ff';
            ctx.fillRect(this.x + 2, drawY + 20, 3, 3);
            ctx.fillRect(this.x + 19, drawY + 20, 3, 3);
            
            // Ethereal bottom (fading out)
            ctx.fillStyle = `rgba(135, 206, 235, 0.6)`;
            ctx.fillRect(this.x + 7, drawY + 26, 10, 4);
            ctx.fillStyle = `rgba(135, 206, 235, 0.3)`;
            ctx.fillRect(this.x + 8, drawY + 30, 8, 2);
            
            // Floating particles around healer
            for (let i = 0; i < 3; i++) {
                const particleAngle = (this.animTime / 1000 + i * (Math.PI * 2 / 3));
                const particleX = this.x + this.width / 2 + Math.cos(particleAngle) * 15;
                const particleY = drawY + 10 + Math.sin(particleAngle) * 10;
                ctx.fillStyle = `rgba(135, 206, 235, ${0.6 * glowPulse})`;
                ctx.fillRect(particleX - 2, particleY - 2, 4, 4);
            }
            
            ctx.shadowBlur = 0;
        }
        
        // Interaction prompt
        if (this.playerNearby) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(this.x - 20, drawY - 30, this.width + 40, 22);
            
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, this.x + this.width / 2, drawY - 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '9px monospace';
            ctx.fillText('Press E', this.x + this.width / 2, drawY - 12);
        }
        
        ctx.restore();
    }
}

class NPCManager {
    constructor() {
        this.npcs = [];
    }
    
    addNPC(x, y, type, name) {
        const npc = new NPC(x, y, type, name);
        this.npcs.push(npc);
        return npc;
    }
    
    update(deltaTime, player) {
        for (let npc of this.npcs) {
            npc.update(deltaTime, player);
        }
    }
    
    checkInteractions(player, key) {
        for (let npc of this.npcs) {
            if (npc.checkInteraction(player, key)) {
                return npc;
            }
        }
        return null;
    }
    
    draw(ctx) {
        for (let npc of this.npcs) {
            npc.draw(ctx);
        }
    }
    
    clear() {
        this.npcs = [];
    }
    
    getNPCsByZone(zoneId) {
        // Define NPCs for specific zones
        const npcsByZone = {
            'hub': [
                { x: 160, y: 518, type: 'blacksmith', name: 'Blacksmith' },
                { x: 400, y: 518, type: 'potion_vendor', name: 'Alchemist' },
                { x: 640, y: 518, type: 'spirit_healer', name: 'Spirit Healer' }
            ]
        };
        
        return npcsByZone[zoneId] || [];
    }
}
