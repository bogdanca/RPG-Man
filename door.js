// Door and Portal System

class Door {
    constructor(x, y, width, height, targetZone, doorType = 'right', zoneName = null, zoneLevel = null, locked = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetZone = targetZone;
        this.doorType = doorType; // 'left' or 'right'
        this.zoneName = zoneName;
        this.zoneLevel = zoneLevel;
        this.locked = locked;
        
        // Animation state
        this.isOpen = false;
        this.openProgress = 0; // 0 to 1
        this.openSpeed = 0.02;
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowPulse = 0;
        this.particles = [];
        this.particleTimer = 0;
        
        // Interaction
        this.playerNearby = false;
        this.interactRadius = 60;
    }
    
    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            
            // Spawn opening particles
            if (window.game && window.game.particleSystem) {
                for (let i = 0; i < 30; i++) {
                    window.game.particleSystem.emit(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        1,
                        '#ffd700'
                    );
                }
            }
        }
    }
    
    update(deltaTime, player) {
        // Opening animation
        if (this.isOpen && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + this.openSpeed);
            this.glowIntensity = this.openProgress;
        }
        
        // Glow pulse
        this.glowPulse += deltaTime * 0.003;
        
        // Check if player is nearby
        let dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        let dy = (player.y + player.height / 2) - (this.y + this.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        this.playerNearby = distance < this.interactRadius;
        
        // Generate particles when open
        if (this.isOpen && this.openProgress > 0.5) {
            this.particleTimer += deltaTime;
            if (this.particleTimer > 100) {
                this.particleTimer = 0;
                this.addDoorParticle();
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= deltaTime;
            p.y += p.vy;
            p.x += Math.sin(p.y * 0.1) * 0.5;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Check if player enters with E key
        if (!this.locked && this.isOpen && this.openProgress >= 1 && this.playerNearby) {
            if (window.game && (window.game.keys['e'] || window.game.keys['E'])) {
                return this.targetZone;
            }
        }
        
        return null;
    }
    
    addDoorParticle() {
        this.particles.push({
            x: this.x + Math.random() * this.width,
            y: this.y + this.height,
            vy: -1 - Math.random(),
            life: 1000,
            maxLife: 1000
        });
    }
    
    draw(ctx) {
        ctx.save();
        
        const frameWidth = 16;
        const frameHeight = 20;
        const archDepth = 8;
        
        // Apply perspective skew transform for side view
        // Left doors lean to the right, right doors lean to the left
        const skewAngle = this.doorType === 'left' ? 0.15 : -0.15;
        ctx.transform(1, 0, skewAngle, 1, 0, 0);
        
        // Outer glow when open and accessible
        if (this.isOpen && this.openProgress >= 1) {
            const pulseVal = Math.sin(this.glowPulse) * 0.3 + 0.7;
            const glowColor = this.doorType === 'left' ? '135, 206, 235' : '255, 215, 0';
            
            ctx.shadowBlur = 60 * pulseVal;
            ctx.shadowColor = `rgba(${glowColor}, 0.8)`;
            ctx.fillStyle = `rgba(${glowColor}, ${0.1 * pulseVal})`;
            ctx.fillRect(this.x - 30, this.y - 30, this.width + 60, this.height + 40);
            ctx.shadowBlur = 0;
        }
        
        // Stone archway frame - 3D effect
        // Back wall
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(this.x - frameWidth - archDepth, this.y - frameHeight, this.width + (frameWidth + archDepth) * 2, this.height + frameHeight + 5);
        
        // Arch top (rounded)
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y, this.width / 2 + frameWidth, 0, Math.PI, true);
        ctx.fillStyle = '#3a3a3a';
        ctx.fill();
        
        // Side stone pillars with depth
        const gradient1 = ctx.createLinearGradient(this.x - frameWidth - archDepth, 0, this.x - frameWidth, 0);
        gradient1.addColorStop(0, '#2a2a2a');
        gradient1.addColorStop(1, '#4a4a4a');
        ctx.fillStyle = gradient1;
        ctx.fillRect(this.x - frameWidth - archDepth, this.y, frameWidth + archDepth, this.height + 5);
        
        const gradient2 = ctx.createLinearGradient(this.x + this.width + frameWidth, 0, this.x + this.width + frameWidth + archDepth, 0);
        gradient2.addColorStop(0, '#4a4a4a');
        gradient2.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = gradient2;
        ctx.fillRect(this.x + this.width + frameWidth, this.y, frameWidth + archDepth, this.height + 5);
        
        // Stone brick texture
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const brickY = this.y + (i * 20);
            ctx.beginPath();
            ctx.moveTo(this.x - frameWidth - archDepth, brickY);
            ctx.lineTo(this.x + this.width + frameWidth + archDepth, brickY);
            ctx.stroke();
        }
        
        // Inner stone frame
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - frameWidth, this.y, this.width + frameWidth * 2, this.height);
        
        // Door opening/portal area
        if (this.isOpen && this.openProgress > 0) {
            // Magical portal/opening effect
            const portalGradient = ctx.createRadialGradient(
                this.x + this.width / 2,
                this.y + this.height / 2,
                0,
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width * 0.7
            );
            
            const pulseVal = Math.sin(this.glowPulse) * 0.2 + 0.8;
            const opacity = this.openProgress;
            
            if (this.doorType === 'left') {
                // Blue/cyan portal for left door (going back)
                portalGradient.addColorStop(0, `rgba(135, 206, 235, ${opacity * pulseVal})`);
                portalGradient.addColorStop(0.4, `rgba(100, 149, 237, ${opacity * 0.8})`);
                portalGradient.addColorStop(0.7, `rgba(70, 130, 180, ${opacity * 0.6})`);
                portalGradient.addColorStop(1, `rgba(25, 25, 112, ${opacity * 0.3})`);
            } else {
                // Golden portal for right door (going forward)
                portalGradient.addColorStop(0, `rgba(255, 255, 220, ${opacity * pulseVal})`);
                portalGradient.addColorStop(0.3, `rgba(255, 215, 0, ${opacity * 0.9})`);
                portalGradient.addColorStop(0.6, `rgba(255, 165, 0, ${opacity * 0.7})`);
                portalGradient.addColorStop(1, `rgba(218, 165, 32, ${opacity * 0.4})`);
            }
            
            ctx.fillStyle = portalGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Swirling energy effect
            ctx.save();
            ctx.globalAlpha = this.openProgress * 0.6;
            const swirls = 8;
            for (let i = 0; i < swirls; i++) {
                const angle = (this.glowPulse * 0.5 + i * Math.PI * 2 / swirls) % (Math.PI * 2);
                const radius = (this.width / 3) * (1 + Math.sin(this.glowPulse * 2 + i) * 0.2);
                const x = this.x + this.width / 2 + Math.cos(angle) * radius;
                const y = this.y + this.height / 2 + Math.sin(angle) * radius * 0.8;
                
                const swirlColor = this.doorType === 'left' ? '173, 216, 230' : '255, 250, 205';
                ctx.fillStyle = `rgba(${swirlColor}, ${0.8 - (i / swirls) * 0.5})`;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            
            // Light rays emanating from center
            if (this.openProgress >= 1) {
                ctx.save();
                ctx.globalAlpha = (Math.sin(this.glowPulse * 3) * 0.3 + 0.4) * this.openProgress;
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                
                const rayColor = this.doorType === 'left' ? '#87CEEB' : '#FFD700';
                const rayCount = 12;
                for (let i = 0; i < rayCount; i++) {
                    const angle = (i / rayCount) * Math.PI * 2;
                    ctx.rotate(angle / rayCount);
                    ctx.fillStyle = rayColor;
                    ctx.fillRect(0, -2, this.width, 4);
                }
                ctx.restore();
            }
        } else {
            // Closed door - wooden with metal reinforcements
            const doorOffset = this.locked ? 0 : Math.min(this.openProgress * this.width * 0.2, 0);
            
            // Door shadow/depth
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(this.x + doorOffset, this.y, this.width, this.height);
            
            // Main wooden door surface
            const woodGradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
            woodGradient.addColorStop(0, '#4a3326');
            woodGradient.addColorStop(0.5, '#5c4033');
            woodGradient.addColorStop(1, '#4a3326');
            ctx.fillStyle = woodGradient;
            ctx.fillRect(this.x + doorOffset + 2, this.y + 2, this.width - 4, this.height - 4);
            
            // Vertical wooden planks
            ctx.fillStyle = '#3a2a1a';
            for (let i = 0; i < 4; i++) {
                const plankX = this.x + doorOffset + (i * this.width / 4) + 8;
                ctx.fillRect(plankX, this.y + 2, 2, this.height - 4);
            }
            
            // Wood grain detail
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#6d4d3d';
            for (let y = 10; y < this.height - 10; y += 6) {
                const grainWidth = 30 + Math.sin(y * 0.3) * 10;
                ctx.fillRect(this.x + doorOffset + 8, this.y + y, grainWidth, 2);
            }
            ctx.globalAlpha = 1;
            
            // Metal reinforcement bands
            const metalGradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
            metalGradient.addColorStop(0, '#1a1a1a');
            metalGradient.addColorStop(0.5, '#3a3a3a');
            metalGradient.addColorStop(1, '#1a1a1a');
            
            ctx.fillStyle = metalGradient;
            ctx.fillRect(this.x + doorOffset + 4, this.y + 18, this.width - 8, 6);
            ctx.fillRect(this.x + doorOffset + 4, this.y + this.height - 24, this.width - 8, 6);
            
            // Metal rivets
            ctx.fillStyle = '#2a2a2a';
            const rivetPositions = [15, this.width / 2, this.width - 15];
            for (let rx of rivetPositions) {
                for (let ry of [20, this.height - 22]) {
                    ctx.beginPath();
                    ctx.arc(this.x + doorOffset + rx, this.y + ry, 3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#4a4a4a';
                    ctx.beginPath();
                    ctx.arc(this.x + doorOffset + rx - 1, this.y + ry - 1, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#2a2a2a';
                }
            }
            
            // Door handle/ring
            if (!this.locked) {
                ctx.strokeStyle = '#8b7355';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x + doorOffset + this.width - 18, this.y + this.height / 2, 6, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.fillStyle = '#d4a574';
                ctx.beginPath();
                ctx.arc(this.x + doorOffset + this.width - 18, this.y + this.height / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Lock icon if locked
            if (this.locked) {
                ctx.fillStyle = '#666';
                ctx.fillRect(this.x + this.width / 2 - 8, this.y + this.height / 2 - 5, 16, 12);
                ctx.fillRect(this.x + this.width / 2 - 5, this.y + this.height / 2 - 12, 10, 8);
                ctx.fillStyle = '#888';
                ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height / 2 - 1, 4, 6);
            }
        }
        
        // Draw particles
        for (let p of this.particles) {
            let alpha = p.life / p.maxLife;
            const particleColor = this.doorType === 'left' ? '135, 206, 235' : '255, 215, 0';
            ctx.fillStyle = `rgba(${particleColor}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Door label above door
        if (this.zoneName) {
            const textY = this.y - 50;
            const labelText = this.doorType === 'left' ? 
                (this.zoneName === 'Hub' ? 'Hub' : this.zoneName) : 
                (this.locked ? '🔒 Locked' : this.zoneName);
            
            // Background panel for text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(this.x - 30, textY - 25, this.width + 60, 35);
            
            // Border
            ctx.strokeStyle = this.locked ? '#666' : '#8b7355';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 30, textY - 25, this.width + 60, 35);
            
            // Label text
            ctx.fillStyle = this.locked ? '#888' : (this.doorType === 'left' ? '#87ceeb' : '#ffd700');
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(labelText, this.x + this.width / 2, textY - 3);
        }
        
        // Interaction prompt
        if (this.playerNearby) {
            if (this.locked) {
                // Show locked message
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(this.x - 20, this.y - 30, this.width + 40, 22);
                
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x - 20, this.y - 30, this.width + 40, 22);
                
                ctx.fillStyle = '#888';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Complete Level', this.x + this.width / 2, this.y - 15);
            } else if (this.isOpen && this.openProgress >= 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(this.x - 20, this.y - 30, this.width + 40, 22);
                
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x - 20, this.y - 30, this.width + 40, 22);
                
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Press E to Enter', this.x + this.width / 2, this.y - 15);
            }
        }
        
        ctx.restore();
    }
}

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
