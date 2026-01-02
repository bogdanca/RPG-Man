// Enemy Class

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.config = ENEMY_TYPES[type];

        this.x = x;
        this.y = y;
        this.width = this.config.width;
        this.height = this.config.height;

        this.hp = this.config.hp;
        this.maxHp = this.config.hp;
        this.damage = this.config.damage;
        this.damageMax = this.config.damageMax || this.config.damage; // Support random damage
        this.speed = this.config.speed;

        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.direction = Math.random() > 0.5 ? 1 : -1;

        this.alive = true;
        this.behavior = this.config.behavior;

        // AI state
        this.patrolTimer = 0;
        this.attackCooldown = 0;
        this.stateTime = 0;
        this.jumpTimer = 0;
        this.shootTimer = 0;
        this.squishScale = 1;

        // Phantom Dragon specific
        this.isInvisible = false;
        this.invisTimer = 0;
        this.phaseTimer = 0;
        this.breathTimer = 0;
        this.opacity = 1;
        this.targetOpacity = 1;
        this.boneRotation = 0;
        this.wingPhase = 0;
        this.eyeGlow = 0;
        this.breathParticles = [];
        this.ghostTrail = [];

        // Animation
        this.animTime = 0;
        this.hurtFlash = 0;
        this.respawnAnimation = 500; // Animate on initial spawn too

        // Spawn position for respawn
        this.spawnX = x;
        this.spawnY = y;
    }

    update(player, platforms, deltaTime) {
        if (!this.alive) return;

        this.stateTime += deltaTime;
        this.animTime += deltaTime;
        this.hurtFlash = Math.max(0, this.hurtFlash - deltaTime);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        this.respawnAnimation = Math.max(0, this.respawnAnimation - deltaTime);

        // Behavior AI
        switch (this.behavior) {
            case 'patrol':
                this.patrolBehavior(platforms, deltaTime);
                break;
            case 'fly':
                this.flyBehavior(player, deltaTime);
                break;
            case 'chase':
                this.chaseBehavior(player, platforms, deltaTime);
                break;
            case 'boss':
                this.bossBehavior(player, platforms, deltaTime);
                break;
            case 'slime_jump':
                this.slimeJumpBehavior(player, platforms, deltaTime);
                break;
            case 'slime_shooter':
                this.slimeShooterBehavior(player, platforms, deltaTime);
                break;
            case 'slime_boss':
                this.slimeBossBehavior(player, platforms, deltaTime);
                break;
            case 'phantom_dragon':
                this.phantomDragonBehavior(player, platforms, deltaTime);
                break;
        }

        // Apply gravity (except flying enemies and phantom dragon)
        if (this.behavior !== 'fly' && this.behavior !== 'phantom_dragon') {
            this.vy += GAME_CONFIG.gravity;
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Platform collision (non-flying)
        if (this.behavior !== 'fly') {
            this.onGround = false;
            for (let platform of platforms) {
                if (this.vy >= 0 && checkCollision(this, platform)) {
                    if (this.y + this.height - this.vy <= platform.y + 5) {
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.onGround = true;
                    }
                }
            }
        }

        // Screen bounds
        if (this.x < 0) {
            this.x = 0;
            this.direction *= -1;
        }
        if (this.x + this.width > GAME_CONFIG.width) {
            this.x = GAME_CONFIG.width - this.width;
            this.direction *= -1;
        }

        // Deal damage to player on collision
        if (checkCollision(this, player) && this.attackCooldown <= 0) {
            // Random damage between base damage and damageMax
            const damageAmount = this.damageMax
                ? Math.floor(Math.random() * (this.damageMax - this.damage + 1)) + this.damage
                : this.damage;
            player.takeDamage(damageAmount);
            this.attackCooldown = 1000;
        }
    }

    patrolBehavior(platforms, deltaTime) {
        this.patrolTimer += deltaTime;

        if (this.patrolTimer > 2000) {
            this.direction *= -1;
            this.patrolTimer = 0;
        }

        this.vx = this.speed * this.direction;
    }

    flyBehavior(player, deltaTime) {
        // Hover up and down
        let hoverOffset = Math.sin(this.animTime / 500) * 2;

        // Move towards player
        let dx = player.x - this.x;
        if (Math.abs(dx) > 100) {
            this.vx = Math.sign(dx) * this.speed;
            this.direction = Math.sign(dx);
        } else {
            this.vx *= 0.9;
        }

        this.vy = hoverOffset;

        // Stay in air
        if (this.y < 100) this.vy = 1;
        if (this.y > 400) this.vy = -1;
    }

    chaseBehavior(player, platforms, deltaTime) {
        let dx = player.x - this.x;
        let distanceToPlayer = Math.abs(dx);

        if (distanceToPlayer < 300) {
            // Chase player
            this.vx = Math.sign(dx) * this.speed;
            this.direction = Math.sign(dx);

            // Jump if player is above
            if (player.y < this.y - 50 && this.onGround && Math.random() < 0.02) {
                this.vy = -10;
            }
        } else {
            // Patrol when player is far
            this.vx = this.speed * this.direction;

            if (Math.random() < 0.01) {
                this.direction *= -1;
            }
        }
    }

    bossBehavior(player, platforms, deltaTime) {
        let dx = player.x - this.x;
        let distanceToPlayer = Math.abs(dx);

        // Aggressive chase
        if (distanceToPlayer > 50) {
            this.vx = Math.sign(dx) * this.speed;
            this.direction = Math.sign(dx);
        } else {
            this.vx *= 0.7;
        }

        // Jump frequently
        if (this.onGround && Math.random() < 0.03) {
            this.vy = -12;
        }

        // Faster attacks
        if (checkCollision(this, player) && this.attackCooldown <= 0) {
            player.takeDamage(this.damage);
            this.attackCooldown = 800;
        }
    }

    slimeJumpBehavior(player, platforms, deltaTime) {
        this.jumpTimer += deltaTime;

        // Minecraft-style slime: Jump periodically
        if (this.onGround && this.jumpTimer > this.config.jumpInterval) {
            this.vy = this.config.jumpPower;
            this.jumpTimer = 0;

            // Random horizontal movement
            if (Math.random() < 0.5) {
                this.direction *= -1;
            }
        }

        // Move in direction
        this.vx = this.speed * this.direction;

        // Squish animation
        if (this.onGround && Math.abs(this.vy) < 0.5) {
            this.squishScale = 1 + Math.sin(this.animTime / 100) * 0.1;
        } else {
            // Stretch when in air
            this.squishScale = 0.8 + Math.abs(this.vy) * 0.02;
        }
    }

    slimeShooterBehavior(player, platforms, deltaTime) {
        this.jumpTimer += deltaTime;
        this.shootTimer += deltaTime;

        // Jump like normal slime
        if (this.onGround && this.jumpTimer > this.config.jumpInterval) {
            this.vy = this.config.jumpPower;
            this.jumpTimer = 0;

            // Face player when jumping
            let dx = player.x - this.x;
            this.direction = Math.sign(dx);
        }

        // Move slowly toward player
        let dx = player.x - this.x;
        if (Math.abs(dx) > 100) {
            this.vx = Math.sign(dx) * this.speed;
        } else {
            this.vx *= 0.5;
        }

        // Shoot projectiles
        if (this.shootTimer > this.config.shootCooldown && this.onGround) {
            this.shootTimer = 0;
            this.shootProjectile(player);
        }

        // Squish animation
        if (this.onGround && Math.abs(this.vy) < 0.5) {
            this.squishScale = 1 + Math.sin(this.animTime / 100) * 0.1;
        } else {
            this.squishScale = 0.8 + Math.abs(this.vy) * 0.02;
        }
    }

    slimeBossBehavior(player, platforms, deltaTime) {
        this.jumpTimer += deltaTime;
        this.shootTimer += deltaTime;

        // Aggressive jumping
        if (this.onGround && this.jumpTimer > this.config.jumpInterval) {
            this.vy = this.config.jumpPower;
            this.jumpTimer = 0;

            // Always face player
            let dx = player.x - this.x;
            this.direction = Math.sign(dx);
        }

        // Chase player
        let dx = player.x - this.x;
        if (Math.abs(dx) > 50) {
            this.vx = Math.sign(dx) * this.speed;
        } else {
            this.vx *= 0.8;
        }

        // Shoot projectiles more frequently
        if (this.shootTimer > this.config.shootCooldown) {
            this.shootTimer = 0;
            this.shootProjectile(player);

            // Boss shoots multiple projectiles in a spread
            if (this.hp < this.maxHp / 2) {
                setTimeout(() => {
                    this.shootProjectile(player, -15);
                    this.shootProjectile(player, 15);
                }, 100);
            }
        }

        // Squish animation
        if (this.onGround && Math.abs(this.vy) < 0.5) {
            this.squishScale = 1 + Math.sin(this.animTime / 80) * 0.15;
        } else {
            this.squishScale = 0.7 + Math.abs(this.vy) * 0.03;
        }
    }

    phantomDragonBehavior(player, platforms, deltaTime) {
        this.shootTimer += deltaTime;
        this.invisTimer += deltaTime;
        this.phaseTimer += deltaTime;
        this.breathTimer += deltaTime;
        this.wingPhase += deltaTime * 0.005;
        this.boneRotation += deltaTime * 0.001;
        this.eyeGlow = 0.5 + Math.sin(this.animTime * 0.003) * 0.5;

        // Update ghost trail
        if (this.animTime % 50 < deltaTime) {
            this.ghostTrail.push({
                x: this.x,
                y: this.y,
                opacity: 0.5,
                life: 500
            });
            if (this.ghostTrail.length > 10) {
                this.ghostTrail.shift();
            }
        }

        // Update ghost trail fade
        for (let i = this.ghostTrail.length - 1; i >= 0; i--) {
            this.ghostTrail[i].life -= deltaTime;
            this.ghostTrail[i].opacity = this.ghostTrail[i].life / 500 * 0.3;
            if (this.ghostTrail[i].life <= 0) {
                this.ghostTrail.splice(i, 1);
            }
        }

        // Invisibility cycle
        const invisDuration = this.config.invisDuration || 3000;
        const visibleDuration = this.config.visibleDuration || 4000;
        const cycleDuration = invisDuration + visibleDuration;
        const cyclePosition = this.invisTimer % cycleDuration;

        if (cyclePosition < visibleDuration) {
            // Visible phase
            this.isInvisible = false;
            this.targetOpacity = 0.7; // Semi-transparent even when "visible"
        } else {
            // Invisible phase - much harder to see
            this.isInvisible = true;
            this.targetOpacity = 0.1;
        }

        // Smooth opacity transition
        this.opacity += (this.targetOpacity - this.opacity) * 0.05;

        // Flying behavior - hover and chase
        let hoverOffset = Math.sin(this.animTime / 400) * 3;

        // Move towards player
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        if (Math.abs(dx) > 80) {
            this.vx = Math.sign(dx) * this.speed;
            this.direction = Math.sign(dx);
        } else {
            this.vx *= 0.95;
        }

        // Vertical movement - try to stay above player
        let targetY = player.y - 100;
        if (this.y > targetY + 30) {
            this.vy = -1.5;
        } else if (this.y < targetY - 30) {
            this.vy = 1;
        } else {
            this.vy = hoverOffset * 0.3;
        }

        // Keep in bounds
        if (this.y < 80) this.vy = 1;
        if (this.y > 450) this.vy = -2;

        // Phase shift (teleport) ability
        const phaseShiftCooldown = this.config.phaseShiftCooldown || 8000;
        if (this.phaseTimer > phaseShiftCooldown && this.hp < this.maxHp * 0.7) {
            this.phaseTimer = 0;
            // Teleport to random position
            this.x = 100 + Math.random() * 600;
            this.y = 150 + Math.random() * 200;

            // Spawn phase particles
            if (window.game && window.game.particleSystem) {
                for (let i = 0; i < 20; i++) {
                    window.game.particleSystem.emit(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        3,
                        '#87ceeb'
                    );
                }
            }
        }

        // Ghostly breath attack (spread projectiles)
        const breathCooldown = this.config.breathCooldown || 5000;
        if (this.breathTimer > breathCooldown) {
            this.breathTimer = 0;
            // Fire spread of ghostly projectiles
            for (let angle = -30; angle <= 30; angle += 15) {
                this.shootProjectile(player, angle);
            }
        }

        // Regular projectile attack
        if (this.shootTimer > this.config.shootCooldown && !this.isInvisible) {
            this.shootTimer = 0;
            this.shootProjectile(player);

            // Extra projectiles when low HP
            if (this.hp < this.maxHp / 3) {
                setTimeout(() => {
                    this.shootProjectile(player, -20);
                    this.shootProjectile(player, 20);
                }, 150);
            }
        }

        // Update breath particles
        for (let i = this.breathParticles.length - 1; i >= 0; i--) {
            let p = this.breathParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime;
            if (p.life <= 0) {
                this.breathParticles.splice(i, 1);
            }
        }
    }

    shootProjectile(player, angleOffset = 0) {
        if (window.game && window.game.projectileManager) {
            let targetX = player.x + player.width / 2;
            let targetY = player.y + player.height / 2;

            // Apply angle offset for spread shots
            if (angleOffset !== 0) {
                let angle = Math.atan2(targetY - this.y, targetX - this.x);
                angle += angleOffset * Math.PI / 180;
                let distance = 500;
                targetX = this.x + Math.cos(angle) * distance;
                targetY = this.y + Math.sin(angle) * distance;
            }

            window.game.projectileManager.spawn(
                this.x + this.width / 2,
                this.y + this.height / 2,
                targetX,
                targetY,
                this.config.projectileDamage,
                this.config.projectileSpeed,
                this.config.projectileColor
            );
        }
    }

    takeDamage(amount, isCrit = false) {
        this.hp -= amount;
        this.hurtFlash = 200;

        // Show damage number
        if (window.gameUI) {
            window.gameUI.showDamage(
                this.x + this.width / 2,
                this.y,
                amount,
                isCrit
            );
        }

        // Knockback
        this.vx = -this.direction * 3;

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.alive = false;

        // Play death sound based on enemy type
        if (window.soundManager) {
            const soundMap = {
                'green_slime_weak': 'enemyDeathSlime',
                'blue_slime': 'enemyDeathSlime',
                'red_slime': 'enemyDeathSlime',
                'purple_slime': 'enemyDeathSlime',
                'cave_bat': 'enemyDeathBat',
                'fire_bat': 'enemyDeathBat',
                'ice_bat': 'enemyDeathBat',
                'skeleton': 'enemyDeathSkeleton',
                'skeleton_warrior': 'enemyDeathSkeleton',
                'armored_skeleton': 'enemyDeathSkeleton',
                'stone_golem': 'enemyDeathGolem',
                'crystal_golem': 'enemyDeathGolem',
                'dark_spirit': 'enemyDeathSpirit',
                'shadow_wraith': 'enemyDeathSpirit',
                'phantom_dragon': 'enemyDeathSpirit'
            };

            const soundName = soundMap[this.type] || 'enemyDeathSlime';
            window.soundManager.play(soundName);
        }

        // Special victory message for Phantom Dragon
        if (this.type === 'phantom_dragon') {
            if (window.gameUI) {
                window.gameUI.showNotification('🐉 The Phantom Dragon has been vanquished!', 'level-up');
                setTimeout(() => {
                    window.gameUI.showNotification('✨ The Deep Mines are cleansed... for now.', 'level-up');
                }, 2000);
            }

            // Unlock Thunderstrike spell
            if (window.game && window.game.player) {
                setTimeout(() => {
                    window.game.player.unlockThunderstrike();
                }, 3000);
            }
        }

        // Drop rewards
        if (window.game && window.game.player) {
            let player = window.game.player;
            let dropManager = window.game.dropManager;

            // Give XP directly (no drop animation needed)
            player.gainXP(this.config.xp);

            // Spawn coin drops (animated)
            if (this.config.coins > 0 && dropManager) {
                dropManager.spawnCoins(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.config.coins
                );
            }

            // Spawn material drops (with chance)
            if (dropManager) {
                let materialDropChance = this.config.materialDropChance || 0;

                // If materials property exists, use it as guaranteed drop amount
                if (this.config.materials) {
                    dropManager.spawnMaterials(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        this.config.materials
                    );
                } else if (Math.random() < materialDropChance) {
                    // Otherwise use chance-based drop
                    dropManager.spawnMaterials(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        1
                    );
                }
            }

            // Update quest progress
            player.updateQuests(this.type);

            // Notify game for kill tracking (pass XP value)
            if (window.game.onEnemyKilled) {
                window.game.onEnemyKilled(this.config.xp);
            }
        }

        // Respawn after delay (but not bosses)
        const isBoss = this.type === 'slime_king' || this.type === 'phantom_dragon';
        if (!isBoss) {
            setTimeout(() => {
                this.respawn();
            }, 5000);
        }
    }

    respawn() {
        this.alive = true;
        this.hp = this.maxHp;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.hurtFlash = 0;
        this.respawnAnimation = 500; // 500ms spawn animation
    }

    draw(ctx) {
        if (!this.alive) return;

        // Special drawing for Phantom Dragon
        if (this.behavior === 'phantom_dragon') {
            this.drawPhantomDragon(ctx);
            return;
        }

        ctx.save();

        // Respawn animation effect with Elastic Pop & Flash
        if (this.respawnAnimation > 0) {
            let progress = 1 - (this.respawnAnimation / 500);

            // Elastic Scale (Overshoot)
            // Goes from 0 -> 1.2 -> 1.0
            let scale;
            if (progress < 0.7) {
                // Scale up to 1.2
                scale = (progress / 0.7) * 1.2;
            } else {
                // Settle back to 1.0
                scale = 1.2 - ((progress - 0.7) / 0.3) * 0.2;
            }

            // Fade in
            ctx.globalAlpha = Math.min(1, progress * 2); // Fade in quickly

            // Apply scale from center
            // We translate to center, scale, then must translate back by the CENTER coordinates (not just dimensions)
            // because we are drawing in world coordinates later.
            // Transform: Translate(C) * Scale(S) * Translate(-C)
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

            // Draw flash overlay
            // ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`; // Flash fades out
        } else {
            ctx.translate(this.x, this.y);
            ctx.translate(-this.x, -this.y);

            // Normal hurt flash
            // ctx.fillStyle = (this.hurtFlash > 0) ? '#fff' : this.config.color;
        }

        // Apply spawn flash color if animating, otherwise normal color logic
        if (this.respawnAnimation > 0) {
            let progress = 1 - (this.respawnAnimation / 500);
            // Mix white and color? Canvas doesn't do that easily.
            // Let's just create a strong flash at the start
            if (progress < 0.3) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = this.config.color;
            }
        } else if (this.hurtFlash > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = this.config.color;
        }

        // Draw enemy body with squish animation for slimes
        if (this.behavior.includes('slime')) {
            let scaleX = 1 / this.squishScale;
            let scaleY = this.squishScale;

            // Draw squished slime body
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height);
            ctx.scale(scaleX, scaleY);

            // Slime body (rounded)
            ctx.beginPath();
            ctx.ellipse(0, -this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Slime shine/highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-this.width / 4, -this.height * 0.6, this.width / 6, this.height / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Draw eyes (without transform)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            let eyeY = this.y + this.height * 0.35;
            if (this.direction > 0) {
                ctx.fillRect(this.x + this.width - 12, eyeY, 5, 5);
                ctx.fillRect(this.x + this.width - 20, eyeY, 4, 4);
            } else {
                ctx.fillRect(this.x + 7, eyeY, 5, 5);
                ctx.fillRect(this.x + 15, eyeY, 4, 4);
            }
        } else {
            // Regular draw for non-slime enemies
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw eyes/face
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            let eyeY = this.y + this.height * 0.3;
            if (this.direction > 0) {
                ctx.fillRect(this.x + this.width - 10, eyeY, 4, 4);
            } else {
                ctx.fillRect(this.x + 6, eyeY, 4, 4);
            }
        }

        // HP bar
        if (this.hp < this.maxHp) {
            let barWidth = this.width;
            let barHeight = 4;
            let barY = this.y - 8;

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x, barY, barWidth, barHeight);

            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x, barY, barWidth * (this.hp / this.maxHp), barHeight);
        }

        ctx.restore();
    }

    drawPhantomDragon(ctx) {
        ctx.save();

        // Draw ghost trail first
        for (let ghost of this.ghostTrail) {
            ctx.globalAlpha = ghost.opacity * this.opacity;
            this.drawDragonBody(ctx, ghost.x, ghost.y, true);
        }

        // Main dragon body
        ctx.globalAlpha = this.opacity;
        this.drawDragonBody(ctx, this.x, this.y, false);

        // HP bar (always visible)
        ctx.globalAlpha = 1;
        if (this.hp < this.maxHp) {
            let barWidth = this.width;
            let barHeight = 6;
            let barY = this.y - 15;

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x, barY, barWidth, barHeight);

            // Gradient HP bar
            let gradient = ctx.createLinearGradient(this.x, barY, this.x + barWidth, barY);
            gradient.addColorStop(0, '#4a0080');
            gradient.addColorStop(1, '#87ceeb');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, barY, barWidth * (this.hp / this.maxHp), barHeight);

            // Boss name
            ctx.fillStyle = '#87ceeb';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Phantom Dragon', this.x + this.width / 2, barY - 5);
        }

        ctx.restore();
    }

    drawDragonBody(ctx, x, y, isGhost) {
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;
        const wingFlap = Math.sin(this.wingPhase) * 0.3;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Ghostly glow effect
        if (!isGhost) {
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
            glowGradient.addColorStop(0, `rgba(135, 206, 235, ${0.3 * this.eyeGlow})`);
            glowGradient.addColorStop(0.5, `rgba(75, 0, 130, ${0.15 * this.eyeGlow})`);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(-80, -80, 160, 160);
        }

        // Wing bones (left)
        ctx.save();
        ctx.translate(-30, -10);
        ctx.rotate(-0.5 - wingFlap);
        this.drawWing(ctx, -1, isGhost);
        ctx.restore();

        // Wing bones (right)
        ctx.save();
        ctx.translate(30, -10);
        ctx.rotate(0.5 + wingFlap);
        this.drawWing(ctx, 1, isGhost);
        ctx.restore();

        // Skeletal body
        const bodyColor = isGhost ? 'rgba(135, 206, 235, 0.3)' :
            (this.hurtFlash > 0 ? '#fff' : 'rgba(180, 200, 220, 0.8)');

        // Ribcage
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(0, -5 + i * 8, 25 - i * 2, 8, 0, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();
        }

        // Spine
        ctx.beginPath();
        ctx.moveTo(0, -20);
        for (let i = 0; i < 8; i++) {
            ctx.lineTo(Math.sin(i * 0.5 + this.boneRotation) * 3, -20 + i * 8);
        }
        ctx.stroke();

        // Tail (wavy spine extension)
        ctx.beginPath();
        ctx.moveTo(0, 40);
        for (let i = 0; i < 6; i++) {
            let tailX = Math.sin(this.animTime * 0.003 + i * 0.8) * (10 + i * 3);
            ctx.lineTo(tailX, 40 + i * 10);
        }
        ctx.stroke();

        // Skull
        ctx.fillStyle = bodyColor;

        // Skull base
        ctx.beginPath();
        ctx.ellipse(0, -30, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.beginPath();
        ctx.moveTo(-15, -35);
        ctx.lineTo(-30, -30);
        ctx.lineTo(-25, -25);
        ctx.lineTo(-15, -28);
        ctx.closePath();
        ctx.fill();

        // Horns
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -42);
        ctx.quadraticCurveTo(-20, -55, -8, -60);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -42);
        ctx.quadraticCurveTo(20, -55, 8, -60);
        ctx.stroke();

        // Eye sockets
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(-8, -32, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -32, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing eyes
        if (!isGhost) {
            const eyeColor = this.isInvisible ?
                `rgba(255, 100, 100, ${this.eyeGlow * 0.5})` :
                `rgba(135, 206, 235, ${this.eyeGlow})`;
            ctx.fillStyle = eyeColor;
            ctx.shadowColor = eyeColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(-8, -32, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(8, -32, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Teeth
        ctx.fillStyle = bodyColor;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-28 + i * 4, -26);
            ctx.lineTo(-26 + i * 4, -20);
            ctx.lineTo(-24 + i * 4, -26);
            ctx.closePath();
            ctx.fill();
        }

        // Ghostly particles around body
        if (!isGhost && !this.isInvisible) {
            for (let i = 0; i < 5; i++) {
                let angle = this.animTime * 0.002 + i * Math.PI * 0.4;
                let radius = 50 + Math.sin(this.animTime * 0.005 + i) * 10;
                let px = Math.cos(angle) * radius;
                let py = Math.sin(angle) * radius * 0.5;

                ctx.fillStyle = `rgba(135, 206, 235, ${0.3 + Math.sin(this.animTime * 0.01 + i) * 0.2})`;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    drawWing(ctx, side, isGhost) {
        const wingColor = isGhost ? 'rgba(135, 206, 235, 0.2)' : 'rgba(100, 150, 200, 0.4)';
        const boneColor = isGhost ? 'rgba(180, 200, 220, 0.3)' : 'rgba(180, 200, 220, 0.8)';

        // Wing bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;

        // Main wing bone
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(side * 50, -20);
        ctx.stroke();

        // Finger bones
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(side * 50, -20);
            ctx.lineTo(side * (60 + i * 10), -30 + i * 15);
            ctx.stroke();
        }

        // Ghostly wing membrane
        ctx.fillStyle = wingColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(side * 50, -20);
        ctx.lineTo(side * 80, -30);
        ctx.lineTo(side * 70, 0);
        ctx.lineTo(side * 60, 25);
        ctx.lineTo(side * 30, 10);
        ctx.closePath();
        ctx.fill();
    }
}
