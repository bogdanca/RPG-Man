// Projectile System for Enemy Attacks

class Projectile {
    constructor(x, y, targetX, targetY, damage, speed = 3, color = '#e74c3c') {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.damage = damage;
        this.color = color;
        
        // Calculate direction
        let dx = targetX - x;
        let dy = targetY - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
        
        this.alive = true;
        this.age = 0;
        this.maxAge = 3000; // 3 seconds lifetime
        
        // Visual
        this.rotation = Math.atan2(dy, dx);
        this.trail = [];
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        // Move
        this.x += this.vx;
        this.y += this.vy;
        
        // Add trail
        this.trail.push({ x: this.x, y: this.y, life: 200 });
        
        // Update trail
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= deltaTime;
            if (this.trail[i].life <= 0) {
                this.trail.splice(i, 1);
            }
        }
        
        // Check if expired
        if (this.age > this.maxAge) {
            this.alive = false;
        }
        
        // Check bounds
        if (this.x < -50 || this.x > GAME_CONFIG.width + 50 || 
            this.y < -50 || this.y > GAME_CONFIG.height + 50) {
            this.alive = false;
        }
    }
    
    checkPlayerCollision(player) {
        if (!this.alive) return false;
        
        // Check if player is blocking
        if (player.isBlocking) {
            // Check if projectile is in front of player
            let projectileCenter = this.x + this.width / 2;
            let playerCenter = player.x + player.width / 2;
            
            if ((player.direction > 0 && projectileCenter > playerCenter) ||
                (player.direction < 0 && projectileCenter < playerCenter)) {
                
                // Check collision with block area
                if (checkCollision(this, player)) {
                    this.alive = false;
                    
                    // Spawn block particles
                    if (window.game && window.game.particleSystem) {
                        window.game.particleSystem.emit(this.x, this.y, 10, '#3498db');
                    }
                    
                    // Show blocked text
                    if (window.gameUI) {
                        window.gameUI.showDamage(this.x, this.y, 'BLOCKED!', false, '#3498db');
                    }
                    
                    return true;
                }
            }
        }
        
        // Normal collision
        if (checkCollision(this, player)) {
            this.alive = false;
            player.takeDamage(this.damage);
            return true;
        }
        
        return false;
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            let segment = this.trail[i];
            let alpha = segment.life / 200;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillRect(segment.x, segment.y, 4, 4);
        }
        ctx.globalAlpha = 1;
        
        // Draw projectile
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Outer glow
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Center
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class ProjectileManager {
    constructor() {
        this.projectiles = [];
    }
    
    spawn(x, y, targetX, targetY, damage, speed, color) {
        this.projectiles.push(new Projectile(x, y, targetX, targetY, damage, speed, color));
    }
    
    update(deltaTime, player) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(deltaTime);
            
            // Check player collision
            this.projectiles[i].checkPlayerCollision(player);
            
            // Remove dead projectiles
            if (!this.projectiles[i].alive) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (let projectile of this.projectiles) {
            projectile.draw(ctx);
        }
    }
    
    clear() {
        this.projectiles = [];
    }
}
