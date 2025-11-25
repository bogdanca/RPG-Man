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
        
        // Animation
        this.animTime = 0;
        this.hurtFlash = 0;
        this.respawnAnimation = 0; // 0 = not spawning, >0 = spawning animation timer
        
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
        }
        
        // Apply gravity (except flying enemies)
        if (this.behavior !== 'fly') {
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
                'shadow_wraith': 'enemyDeathSpirit'
            };
            
            const soundName = soundMap[this.type] || 'enemyDeathSlime';
            window.soundManager.play(soundName);
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
        
        // Respawn after delay
        setTimeout(() => {
            this.respawn();
        }, 5000);
    }
    
    respawn() {
        this.alive = true;
        this.hp = this.maxHp;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.hurtFlash = 0;
        this.respawnAnimation = 800; // 800ms spawn animation
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Respawn animation effect
        if (this.respawnAnimation > 0) {
            let progress = 1 - (this.respawnAnimation / 800);
            // Fade in
            ctx.globalAlpha = progress;
            // Scale up from center
            let scale = 0.3 + (progress * 0.7);
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(this.x, this.y);
            ctx.translate(-this.x, -this.y);
        }
        
        // Hurt flash (but not during respawn animation)
        if (this.hurtFlash > 0 && this.respawnAnimation <= 0) {
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
}
