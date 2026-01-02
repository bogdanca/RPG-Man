// Drop System for Collectible Items

class Drop {
    constructor(x, y, type, amount = 1) {
        this.x = x;
        this.y = y;
        this.type = type; // 'coin' or 'material'
        this.amount = amount;
        
        // Physics
        this.vx = (Math.random() - 0.5) * 4; // Random horizontal velocity
        this.vy = -8 - Math.random() * 4; // Initial upward velocity
        this.gravity = 0.4;
        this.bounce = 0.5;
        this.onGround = false;
        
        // Visual
        this.size = 12;
        this.bobOffset = 0;
        this.bobSpeed = 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Animation
        this.age = 0;
        this.lifetime = 15000; // 15 seconds before disappearing
        this.collectRadius = 40; // Magnetic collection radius
        this.magnetStrength = 0.3;
        
        // Collection animation
        this.isBeingCollected = false;
        this.collectionTime = 0;
        this.collectionDuration = 300;
        
        // Sparkle particles
        this.sparkleTimer = 0;
        this.sparkles = [];
    }
    
    update(deltaTime, platforms, player) {
        if (this.isBeingCollected) {
            this.collectionTime += deltaTime;
            
            // Move towards player
            let dx = player.x + player.width / 2 - this.x;
            let dy = player.y + player.height / 2 - this.y;
            this.x += dx * 0.2;
            this.y += dy * 0.2;
            
            return this.collectionTime >= this.collectionDuration;
        }
        
        this.age += deltaTime;
        
        // Apply physics
        if (!this.onGround) {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            
            // Friction
            this.vx *= 0.98;
            
            // Check platform collision
            for (let platform of platforms) {
                if (this.vy > 0 && 
                    this.x + this.size > platform.x && 
                    this.x < platform.x + platform.width &&
                    this.y + this.size > platform.y && 
                    this.y < platform.y + platform.height) {
                    
                    this.y = platform.y - this.size;
                    this.vy *= -this.bounce;
                    
                    if (Math.abs(this.vy) < 1) {
                        this.vy = 0;
                        this.onGround = true;
                    }
                }
            }
        }
        
        // Bob animation when on ground
        if (this.onGround) {
            this.bobOffset = Math.sin(this.age / 200) * 3;
        }
        
        // Rotate
        this.rotation += this.rotationSpeed;
        
        // Magnetic pull towards player
        let dx = (player.x + player.width / 2) - this.x;
        let dy = (player.y + player.height / 2) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.collectRadius) {
            let force = this.magnetStrength * (1 - distance / this.collectRadius);
            this.x += (dx / distance) * force * deltaTime * 0.3;
            this.y += (dy / distance) * force * deltaTime * 0.3;
        }
        
        // Update sparkles
        this.sparkleTimer += deltaTime;
        if (this.sparkleTimer > 200) {
            this.sparkleTimer = 0;
            this.addSparkle();
        }
        
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            this.sparkles[i].life -= deltaTime;
            this.sparkles[i].y -= 0.5;
            this.sparkles[i].x += this.sparkles[i].vx;
            
            if (this.sparkles[i].life <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
        
        // Check if collected
        if (distance < 20) {
            this.collect(player);
            return true;
        }
        
        // Check if expired
        return this.age > this.lifetime;
    }
    
    addSparkle() {
        this.sparkles.push({
            x: this.x + Math.random() * this.size,
            y: this.y + Math.random() * this.size,
            vx: (Math.random() - 0.5) * 0.5,
            life: 300,
            maxLife: 300
        });
    }
    
    collect(player) {
        if (this.isBeingCollected) return;
        
        this.isBeingCollected = true;
        
        // Give rewards to player
        if (this.type === 'coin') {
            player.gainCoins(this.amount);
            // Play addictive coin sound
            if (window.soundManager) {
                window.soundManager.play('coin');
            }
        } else if (this.type === 'material') {
            player.gainMaterials(this.amount);
            // Play crystalline material sound
            if (window.soundManager) {
                window.soundManager.play('material');
            }
        }
        
        // Play collection particle effect
        if (window.game && window.game.particleSystem) {
            let color = this.type === 'coin' ? '#ffd700' : '#3498db';
            window.game.particleSystem.emit(this.x, this.y, 8, color);
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw sparkles
        for (let sparkle of this.sparkles) {
            let alpha = sparkle.life / sparkle.maxLife;
            ctx.fillStyle = this.type === 'coin' ? '#fff9b0' : '#a8d8ff';
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
        }
        ctx.globalAlpha = 1;
        
        // Fade out when collecting or expiring
        let alpha = 1;
        if (this.isBeingCollected) {
            alpha = 1 - (this.collectionTime / this.collectionDuration);
        } else if (this.age > this.lifetime - 2000) {
            alpha = (this.lifetime - this.age) / 2000;
        }
        
        ctx.globalAlpha = alpha;
        
        // Apply bob offset
        let drawY = this.y + this.bobOffset;
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.size / 2, drawY + this.size + 2, this.size * 0.6, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw drop
        ctx.translate(this.x + this.size / 2, drawY + this.size / 2);
        ctx.rotate(this.rotation);
        
        if (this.type === 'coin') {
            // Gold coin
            // Outer circle
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle (shine)
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Center emblem
            ctx.fillStyle = '#d4af37';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            // Highlight
            ctx.fillStyle = '#fffacd';
            ctx.beginPath();
            ctx.arc(-2, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.type === 'material') {
            // Material crystal
            // Outer shape
            ctx.fillStyle = '#2980b9';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = (i / 6) * Math.PI * 2;
                let x = Math.cos(angle) * this.size / 2;
                let y = Math.sin(angle) * this.size / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Inner glow
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = (i / 6) * Math.PI * 2;
                let x = Math.cos(angle) * (this.size / 2 - 2);
                let y = Math.sin(angle) * (this.size / 2 - 2);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = '#a8d8ff';
            ctx.beginPath();
            ctx.arc(-2, -2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw amount if > 1
        if (this.amount > 1) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.strokeText(`x${this.amount}`, this.x + this.size / 2, drawY - 5);
            ctx.fillText(`x${this.amount}`, this.x + this.size / 2, drawY - 5);
        }
        
        ctx.globalAlpha = 1;
    }
}

class DropManager {
    constructor() {
        this.drops = [];
    }
    
    spawnDrop(x, y, type, amount = 1) {
        this.drops.push(new Drop(x, y, type, amount));
    }
    
    spawnCoins(x, y, amount) {
        // Spawn multiple coin drops if amount is large
        if (amount <= 5) {
            this.spawnDrop(x, y, 'coin', amount);
        } else {
            // Split into multiple drops
            let numDrops = Math.min(Math.ceil(amount / 3), 5);
            for (let i = 0; i < numDrops; i++) {
                let dropAmount = Math.floor(amount / numDrops);
                if (i === numDrops - 1) dropAmount += amount % numDrops;
                
                setTimeout(() => {
                    this.spawnDrop(x + (Math.random() - 0.5) * 20, y, 'coin', dropAmount);
                }, i * 50);
            }
        }
    }
    
    spawnMaterials(x, y, amount) {
        for (let i = 0; i < amount; i++) {
            setTimeout(() => {
                this.spawnDrop(x + (Math.random() - 0.5) * 20, y, 'material', 1);
            }, i * 50);
        }
    }
    
    update(deltaTime, platforms, player) {
        for (let i = this.drops.length - 1; i >= 0; i--) {
            let shouldRemove = this.drops[i].update(deltaTime, platforms, player);
            if (shouldRemove) {
                this.drops.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (let drop of this.drops) {
            drop.draw(ctx);
        }
    }
    
    clear() {
        // Remove all drops (called when changing levels)
        this.drops = [];
    }
}
