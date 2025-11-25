// Level Portal System - Shining lights to travel between levels

class LevelPortal {
    constructor(x, y, targetZone, portalType = 'next', zoneName = null, locked = false) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.targetZone = targetZone;
        this.portalType = portalType; // 'previous' or 'next'
        this.zoneName = zoneName;
        this.locked = locked;
        this.isOpen = !locked;
        
        // Visual effects
        this.glowPulse = 0;
        this.particles = [];
        this.particleTimer = 0;
        
        // Interaction
        this.playerNearby = false;
        this.interactRadius = 60;
    }
    
    open() {
        this.isOpen = true;
        this.locked = false;
    }
    
    update(deltaTime, player) {
        this.glowPulse += deltaTime * 0.003;
        
        // Check if player is nearby
        let dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        let dy = (player.y + player.height / 2) - (this.y + this.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        this.playerNearby = distance < this.interactRadius;
        
        // Update particles
        this.particleTimer += deltaTime;
        if (this.particleTimer > 50 && this.isOpen) {
            this.particleTimer = 0;
            this.addPortalParticle();
        }
        
        this.particles = this.particles.filter(p => p.life > 0);
        for (let particle of this.particles) {
            particle.y -= particle.speed;
            particle.life -= deltaTime;
            particle.x += Math.sin(particle.y * 0.1) * 0.5;
        }
        
        // Check for interaction
        if (this.isOpen && this.playerNearby && (window.game.keys['e'] || window.game.keys['E'])) {
            return this.targetZone;
        }
        
        return null;
    }
    
    addPortalParticle() {
        const color = this.portalType === 'previous' ? 
            { r: 135, g: 206, b: 235 } : // Light blue for previous
            { r: 255, g: 215, b: 0 };    // Gold for next
        
        this.particles.push({
            x: this.x + this.width / 2 + (Math.random() - 0.5) * 30,
            y: this.y + this.height,
            speed: 0.5 + Math.random() * 0.5,
            life: 2000,
            color: color
        });
    }
    
    draw(ctx) {
        if (!this.isOpen) return;
        
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Pulsing values
        const pulseVal = Math.sin(this.glowPulse) * 0.3 + 0.7;
        const color = this.portalType === 'previous' ? 
            '135, 206, 235' : // Light blue
            '255, 215, 0';     // Gold
        
        // Outer glow
        const outerGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 50 * pulseVal
        );
        outerGradient.addColorStop(0, `rgba(${color}, 0.6)`);
        outerGradient.addColorStop(0.5, `rgba(${color}, 0.3)`);
        outerGradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.fillStyle = outerGradient;
        ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
        
        // Core light
        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 25
        );
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * pulseVal})`);
        coreGradient.addColorStop(0.4, `rgba(${color}, ${0.8 * pulseVal})`);
        coreGradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25 * pulseVal, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particles
        for (let particle of this.particles) {
            const alpha = particle.life / 2000;
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw tooltip when player is nearby
        if (this.playerNearby) {
            const tooltipText = this.portalType === 'previous' ? 
                `← Previous: ${this.zoneName}` : 
                `Next: ${this.zoneName} →`;
            
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            
            // Tooltip background
            const textWidth = ctx.measureText(tooltipText).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(centerX - textWidth / 2 - 8, this.y - 35, textWidth + 16, 24);
            
            // Tooltip border
            ctx.strokeStyle = `rgba(${color}, 0.8)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX - textWidth / 2 - 8, this.y - 35, textWidth + 16, 24);
            
            // Tooltip text
            ctx.fillStyle = `rgba(${color}, 1)`;
            ctx.fillText(tooltipText, centerX, this.y - 18);
            
            // "Press E" prompt
            ctx.font = '12px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('Press E', centerX, this.y - 48);
        }
        
        ctx.restore();
    }
}

// Hub Portal System (for the main hub portals to dungeons)
class Portal {
    constructor(x, y, label = 'Portal', locked = false) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.label = label;
        this.locked = locked;
        
        // Animation
        this.rotation = 0;
        this.pulse = 0;
        this.particles = [];
        this.particleTimer = 0;
        
        // Interaction
        this.playerNearby = false;
        this.interactRadius = 60;
    }
    
    update(deltaTime, player) {
        // Don't animate or allow interaction if locked
        if (!this.locked) {
            this.rotation += deltaTime * 0.001;
            this.pulse += deltaTime * 0.003;
            
            // Check if player is nearby
            let dx = (player.x + player.width / 2) - (this.x + this.width / 2);
            let dy = (player.y + player.height / 2) - (this.y + this.height / 2);
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            this.playerNearby = distance < this.interactRadius;
            
            // Generate particles
            this.particleTimer += deltaTime;
            if (this.particleTimer > 50) {
                this.particleTimer = 0;
                this.addPortalParticle();
            }
        } else {
            this.playerNearby = false;
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= deltaTime;
            p.angle += p.speed;
            p.radius += p.radiusSpeed;
            
            if (p.life <= 0 || p.radius > this.width) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    addPortalParticle() {
        this.particles.push({
            angle: Math.random() * Math.PI * 2,
            radius: 5,
            radiusSpeed: 0.5,
            speed: 0.05,
            life: 2000,
            maxLife: 2000
        });
    }
    
    checkInteraction(player, key) {
        if (!this.locked && this.playerNearby && checkCollision(this, player) && key) {
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Choose colors based on locked state
        let portalColor = this.locked ? '100, 100, 100' : '138, 43, 226';
        let labelColor = this.locked ? '#666' : '#8a2be2';
        
        // Portal particles (only if not locked)
        if (!this.locked) {
            for (let p of this.particles) {
                let x = this.x + this.width / 2 + Math.cos(p.angle) * p.radius;
                let y = this.y + this.height / 2 + Math.sin(p.angle) * p.radius;
                let alpha = p.life / p.maxLife;
                
                ctx.fillStyle = `rgba(${portalColor}, ${alpha})`;
                ctx.fillRect(x, y, 3, 3);
            }
        }
        
        // Portal ring
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Outer glow
        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        let pulseVal = this.locked ? 0.3 : Math.sin(this.pulse) * 0.3 + 0.7;
        gradient.addColorStop(0, `rgba(${portalColor}, ${0.8 * pulseVal})`);
        gradient.addColorStop(0.7, `rgba(${portalColor}, ${0.4 * pulseVal})`);
        gradient.addColorStop(1, `rgba(${portalColor}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Portal ring
        ctx.strokeStyle = this.locked ? '#555' : '#8a2be2';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 - 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner swirl (static if locked)
        if (!this.locked) {
            ctx.rotate(this.rotation);
        }
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(${portalColor}, ${0.6 - i * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, (this.width / 2 - 10) - i * 5, 0, Math.PI * 1.5);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - 20, this.y + this.height + 5, this.width + 40, 20);
        
        ctx.fillStyle = labelColor;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height + 19);
        
        // Interaction prompt or locked message
        if (this.locked) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x - 20, this.y - 30, this.width + 40, 20);
            
            ctx.fillStyle = '#888';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('🔒 Locked', this.x + this.width / 2, this.y - 16);
        } else if (this.playerNearby) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x - 20, this.y - 30, this.width + 40, 20);
            
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('Press E to Enter', this.x + this.width / 2, this.y - 16);
        }
        
        ctx.restore();
    }
}
