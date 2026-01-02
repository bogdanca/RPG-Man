// Player Class

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_CONFIG.width;
        this.height = PLAYER_CONFIG.height;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.canDoubleJump = true;

        // Stats
        this.level = 1;
        this.xp = 0;
        this.coins = 0;
        this.materials = 0;

        this.stats = { ...PLAYER_CONFIG.baseStats };
        this.hp = this.stats.maxHp;

        this.statUpgrades = {
            maxHp: 0,
            damage: 0,
            defense: 0,
            speed: 0,
            critChance: 0
        };

        this.gear = {
            weapon: 0,
            armor: 0,
            trinket: 0,
            boots: 0
        };

        // Track highest crafted tier (for blacksmith progression)
        this.craftedGear = {
            weapon: 0,
            armor: 0,
            trinket: 0,
            boots: 0
        };

        // Combat
        this.isAttacking = false;
        this.attackTime = 0;
        this.attackDirection = 1;
        this.invulnerable = false;

        // Level up animation
        this.isLevelingUp = false;
        this.levelUpProgress = 0;
        this.levelUpDuration = 2000;

        // Jump grace period (coyote time)
        this.jumpGraceTime = 0;

        // Potions and buffs
        this.potions = {
            health_potion: 0,
            elixir_strength: 0,
            elixir_defense: 0,
            elixir_speed: 0
        };
        this.activeBuffs = [];
        this.jumpBufferTime = 0;

        // Spells
        this.spells = {
            thunderstrike: {
                unlocked: false,
                cooldown: 0,
                maxCooldown: 45000, // 45 seconds
                damage: 75 // Base damage (tripled from 25), scales slightly with player damage
            }
        };

        // Check if spell was previously unlocked
        this.loadSpellUnlockState();
        this.invulnerableTime = 0;
        this.isBlocking = false;
        this.blockReduction = 0; // 100% damage reduction when blocking

        // Animation
        this.direction = 1; // 1 = right, -1 = left
        this.animTime = 0;

        // Quests
        this.questProgress = {};
        QUESTS.forEach(quest => {
            this.questProgress[quest.id] = { completed: false, progress: 0 };
        });
    }

    update(keys, platforms, enemies, deltaTime, mouseX, mouseY) {
        // Store mouse position for attack direction
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        // Update direction based on mouse position
        if (mouseX !== undefined) {
            const playerCenterX = this.x + this.width / 2;
            if (mouseX < playerCenterX) {
                this.direction = -1;
            } else if (mouseX > playerCenterX) {
                this.direction = 1;
            }
        }

        // Blocking (mouse right click) - check early to apply movement penalty
        this.isBlocking = keys.mouseBlock || false;

        // Movement - base speed + speed stat bonus
        let moveSpeed = PLAYER_CONFIG.baseMovementSpeed + this.stats.speed;

        // Reduce movement speed by 50% when blocking
        if (this.isBlocking) {
            moveSpeed *= 0.5;
        }

        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vx = -moveSpeed;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vx = moveSpeed;
        } else {
            this.vx *= GAME_CONFIG.friction;
        }

        // Update jump timers
        if (this.jumpGraceTime > 0) this.jumpGraceTime -= deltaTime;
        if (this.jumpBufferTime > 0) this.jumpBufferTime -= deltaTime;

        // Jumping with improved mechanics
        const jumpKeyPressed = keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '];

        // Grace period when leaving ground (coyote time)
        if (this.onGround) {
            this.jumpGraceTime = 150; // 150ms grace period after leaving ground
            this.canDoubleJump = true; // Reset double jump when on ground
        }

        // Detect new jump press (key wasn't pressed last frame, is pressed now)
        const jumpJustPressed = jumpKeyPressed && !keys.jumpWasPressed;

        // Buffer jump input (can press jump slightly before landing)
        if (jumpJustPressed) {
            this.jumpBufferTime = 150; // 150ms buffer window
        }

        // Can't jump while blocking
        if (!this.isBlocking) {
            // First jump (with grace period and buffer)
            if ((this.onGround || this.jumpGraceTime > 0) && this.jumpBufferTime > 0) {
                this.vy = -PLAYER_CONFIG.jumpPower;
                this.onGround = false;
                this.jumpGraceTime = 0;
                this.jumpBufferTime = 0;
            }
            // Double jump (when key is pressed again while in air) - Removed grace time check for better response
            else if (jumpJustPressed && this.canDoubleJump && !this.onGround) {
                this.vy = -PLAYER_CONFIG.doubleJumpPower;
                this.canDoubleJump = false;
            }
        }

        // Store previous key state for next frame
        keys.jumpWasPressed = jumpKeyPressed;

        // Gravity
        const gravity = PLAYER_CONFIG.gravity !== undefined ? PLAYER_CONFIG.gravity : GAME_CONFIG.gravity;
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Screen bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_CONFIG.width) this.x = GAME_CONFIG.width - this.width;

        // Platform collision
        this.onGround = false;

        // Drop through platform when pressing S (only on platforms, not ground)
        const pressingDown = keys['s'] || keys['S'] || keys['ArrowDown'];
        let shouldDropThrough = false;

        for (let platform of platforms) {
            if (this.vy >= 0 && checkCollision(this, platform)) {
                // Check if player is coming from above the platform
                const playerBottom = this.y + this.height;
                const playerBottomPrev = playerBottom - this.vy;

                if (playerBottomPrev <= platform.y + 20) {
                    // Check if this is the ground platform (y >= 500) or a regular platform
                    const isGroundPlatform = platform.y >= 500;

                    // Allow drop-through if pressing down and not on ground platform
                    if (pressingDown && !isGroundPlatform) {
                        shouldDropThrough = true;
                        continue; // Skip this platform
                    }

                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.canDoubleJump = true;
                }
            }
        }

        // Attack (mouse only) - can't attack while blocking
        this.attackTime -= deltaTime;
        if (keys.mouseAttack && this.attackTime <= 0 && !this.isAttacking && !this.isBlocking) {
            this.attack(enemies);
            // keys.mouseAttack = false; // Removed to allow continuous attacking while holding button
        }

        if (this.isAttacking) {
            if (this.attackTime <= PLAYER_CONFIG.attackCooldown - 100) {
                this.isAttacking = false;
            }
        }

        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTime -= deltaTime;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Update active buffs
        this.updateBuffs(deltaTime);

        // Animation
        this.animTime += deltaTime;

        // Update level up animation
        if (this.isLevelingUp) {
            const elapsed = Date.now() - this.levelUpStartTime;
            this.levelUpProgress = Math.min(1, elapsed / this.levelUpDuration);

            if (elapsed >= this.levelUpDuration) {
                this.isLevelingUp = false;
                this.levelUpProgress = 0;
            }
        }
    }

    attack(enemies) {
        this.isAttacking = true;
        this.attackTime = PLAYER_CONFIG.attackCooldown;

        // Play sword swing sound
        if (window.soundManager) {
            window.soundManager.play('swordSwing');
        }

        // Auto-aim logic
        let closestEnemy = null;
        let minDistance = Infinity;
        const autoAimRange = 150; // Pixels
        const playerCenterX = this.x + this.width / 2;
        const playerCenterY = this.y + this.height / 2;

        for (let enemy of enemies) {
            if (!enemy.alive) continue;

            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;

            const dx = enemyCenterX - playerCenterX;
            const dy = enemyCenterY - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        }

        // Determine attack direction preference
        // 1. Closest enemy in range (Auto-aim)
        // 2. Mouse position
        // 3. Current facing direction

        if (closestEnemy && minDistance <= autoAimRange) {
            const enemyCenterX = closestEnemy.x + closestEnemy.width / 2;
            this.attackDirection = enemyCenterX >= playerCenterX ? 1 : -1;
        } else if (this.mouseX !== undefined) {
            this.attackDirection = this.mouseX >= playerCenterX ? 1 : -1;
        } else {
            this.attackDirection = this.direction;
        }

        let attackX = this.x + (this.attackDirection > 0 ? this.width : -PLAYER_CONFIG.attackRange);

        // Extended hitbox with more vertical range (up and down)
        const verticalExtension = 15; // Extra pixels up and down
        let attackBox = {
            x: attackX,
            y: this.y - verticalExtension,
            width: PLAYER_CONFIG.attackRange,
            height: this.height + (verticalExtension * 2)
        };

        for (let enemy of enemies) {
            if (enemy.alive && checkCollision(attackBox, enemy)) {
                let damage = this.stats.damage;
                let isCrit = Math.random() < this.stats.critChance;
                if (isCrit) {
                    damage *= 2;
                }
                enemy.takeDamage(damage, isCrit);
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnerable) return;

        let actualDamage = Math.max(1, amount - this.stats.defense);

        // Apply blocking - 100% damage reduction
        if (this.isBlocking) {
            actualDamage = 0;

            // Show blocked indicator
            if (window.gameUI) {
                window.gameUI.showNotification('🛡️ Blocked!', 'item');
                window.gameUI.showDamage(this.x + this.width / 2, this.y, 'BLOCKED!', false, '#3498db');
            }

            // Don't set invulnerability or take damage when blocking
            return;
        }

        this.hp -= actualDamage;
        this.invulnerable = true;
        this.invulnerableTime = 1000;

        // Play damage sound
        if (window.soundManager) {
            window.soundManager.play('playerDamage');
        }

        // Cancel recall
        if (window.game && window.game.recallSystem) {
            window.game.recallSystem.onPlayerDamaged();
        }

        // Show damage
        if (window.gameUI) {
            window.gameUI.showDamage(this.x + this.width / 2, this.y, actualDamage, false);
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.hp = 0;

        // Play 8-bit death sound
        if (window.soundManager) {
            window.soundManager.play('playerDeath');
        }

        // Show death screen
        if (window.gameUI) {
            window.gameUI.showDeathScreen();
        }
    }

    respawnFromDeath() {
        this.hp = this.stats.maxHp;
        this.x = 100;
        this.y = 400;
        this.vx = 0;
        this.vy = 0;

        // Check if died in Deep Mines - mark as failed for today
        if (window.game && window.game.currentZone === 'deep_mines_boss') {
            // Mark Deep Mines as failed for today
            const today = new Date().toDateString();
            SafeStorage.setItem('deepMinesFailedDate', today);

            if (window.gameUI) {
                window.gameUI.hideDeathScreen();
                window.gameUI.showNotification('💀 The Phantom Dragon claims another soul...', 'damage');
                setTimeout(() => {
                    window.gameUI.showNotification('⏰ Deep Mines sealed until tomorrow', 'damage');
                }, 1500);
            }

            // Teleport back to hub
            window.game.loadZone('hub');
            return;
        }

        // Lose inventory using Hardcore settings but only 20% of resources

        // Reset gear to basics
        this.gear = { weapon: 0, armor: 0, trinket: 0, boots: 0 };

        // Reset potions
        this.potions = {
            health_potion: 0,
            elixir_strength: 0,
            elixir_defense: 0,
            elixir_speed: 0
        };

        // Lose 20% of resources (Coins, Materials, XP)
        let lostCoins = Math.floor(this.coins * 0.2);
        this.coins -= lostCoins;

        let lostMaterials = Math.floor(this.materials * 0.2);
        this.materials -= lostMaterials;

        let lostXP = Math.floor(this.xp * 0.2);
        this.xp -= lostXP;
        // Ensure non-negative
        if (this.coins < 0) this.coins = 0;
        if (this.materials < 0) this.materials = 0;
        if (this.xp < 0) this.xp = 0;

        if (window.gameUI) {
            window.gameUI.hideDeathScreen();

            // Clear inventory slots
            window.gameUI.inventorySlots = new Array(16).fill(null);
            window.gameUI.newItemSlots = new Set();
            window.gameUI.hasNewItems = false;

            // Clear potion belt
            window.gameUI.potionBeltSlots = [null, null, null, null];

            // Update UI
            window.gameUI.renderInventory();
            window.gameUI.renderPotionBelt();
            window.gameUI.updateActivePotionsDisplay();
            window.gameUI.updateCharacterPanel(); // Update gear slots

            window.gameUI.showNotification(`Lost inventory, ${lostCoins} coins, ${lostMaterials} materials, and ${lostXP} XP`, 'damage');
        }

        // Recalculate stats based on wiped gear
        this.recalculateStats();

        // Respawn in Hub
        if (window.game) {
            window.game.loadZone('hub');
            // Force safe spawn in hub
            this.x = 100;
            this.y = 400;
            this.vx = 0;
            this.vy = 0;
            window.game.saveGame();
        }
    }

    gainXP(amount) {
        this.xp += amount;

        // Show XP pop-up (WoW style)
        if (window.gameUI) {
            window.gameUI.showXPGain(this.x + this.width / 2, this.y, amount);
        }

        // Check for level up if not at max level
        if (this.level < 99) {
            let requiredXP = XP_FORMULA(this.level);
            if (this.xp >= requiredXP) {
                this.levelUp();
            }
        }
    }

    levelUp() {
        // Enforce level cap
        if (this.level >= 99) return;

        this.xp -= XP_FORMULA(this.level);
        this.level++;

        // Stat boost on level up
        this.stats.maxHp += 5;
        this.hp = this.stats.maxHp;
        this.stats.damage += 1;
        this.stats.defense += 1;

        // Start level up animation
        this.isLevelingUp = true;
        this.levelUpProgress = 0;
        this.levelUpStartTime = Date.now();

        // Play level up sound
        if (window.soundManager) {
            window.soundManager.play('levelUp');
        }

        if (window.gameUI) {
            window.gameUI.showNotification(`🎉 Level Up! Now Level ${this.level}`, 'level-up');
        }

        // Check for more level ups if still under cap
        if (this.level < 99 && this.xp >= XP_FORMULA(this.level)) {
            this.levelUp();
        }
    }

    gainCoins(amount) {
        this.coins += amount;
    }

    gainMaterials(amount) {
        this.materials += amount;
        if (window.gameUI) {
            window.gameUI.showNotification(`+${amount} Material`, 'item');
        }
    }

    updateQuests(enemyType) {
        QUESTS.forEach(quest => {
            if (!this.questProgress[quest.id].completed &&
                quest.target.enemy === enemyType) {
                this.questProgress[quest.id].progress++;

                if (this.questProgress[quest.id].progress >= quest.target.count) {
                    this.completeQuest(quest);
                }
            }
        });
    }

    completeQuest(quest) {
        this.questProgress[quest.id].completed = true;
        this.gainXP(quest.reward.xp);
        this.gainCoins(quest.reward.coins);

        if (window.gameUI) {
            window.gameUI.showNotification(`✅ Quest Complete: ${quest.name}`, 'level-up');
        }
    }

    recalculateStats() {
        // Start with base stats
        this.stats.maxHp = PLAYER_CONFIG.baseStats.maxHp;
        this.stats.damage = PLAYER_CONFIG.baseStats.damage;
        this.stats.defense = PLAYER_CONFIG.baseStats.defense;
        this.stats.speed = PLAYER_CONFIG.baseStats.speed;
        this.stats.critChance = PLAYER_CONFIG.baseStats.critChance;

        // Add stat upgrades
        this.stats.maxHp += this.statUpgrades.maxHp * STAT_UPGRADES.maxHp.increment;
        this.stats.damage += this.statUpgrades.damage * STAT_UPGRADES.damage.increment;
        this.stats.defense += this.statUpgrades.defense * STAT_UPGRADES.defense.increment;
        this.stats.speed += this.statUpgrades.speed * STAT_UPGRADES.speed.increment;
        this.stats.critChance += this.statUpgrades.critChance * STAT_UPGRADES.critChance.increment;

        // Add gear bonuses (all stats from equipment including boots defense)
        for (let slot in this.gear) {
            let gearLevel = this.gear[slot];
            let gearData = GEAR_SLOTS[slot].levels[gearLevel];

            if (gearData.damage) this.stats.damage += gearData.damage;
            if (gearData.defense) this.stats.defense += gearData.defense;
            if (gearData.hp) this.stats.maxHp += gearData.hp;
            if (gearData.speed) this.stats.speed += gearData.speed;
            if (gearData.critChance) this.stats.critChance += gearData.critChance;
        }

        // Add active buff bonuses
        for (let buff of this.activeBuffs) {
            if (buff.stat === 'damage') this.stats.damage += buff.value;
            if (buff.stat === 'defense') this.stats.defense += buff.value;
            if (buff.stat === 'speed') this.stats.speed += buff.value;
        }

        // Restore HP to new max if needed
        if (this.hp > this.stats.maxHp) {
            this.hp = this.stats.maxHp;
        }
    }

    draw(ctx) {
        ctx.save();

        // Invulnerability flash
        if (this.invulnerable && Math.floor(this.animTime / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Center point for drawing
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Flip for direction (use attack direction when attacking, otherwise player direction)
        const drawDirection = this.isAttacking ? this.attackDirection : this.direction;
        if (drawDirection < 0) {
            ctx.translate(centerX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-centerX, 0);
        }

        // Calculate sword swing angle based on attack progress
        let swordAngle = 0;
        if (this.isAttacking) {
            const attackProgress = 1 - (this.attackTime / PLAYER_CONFIG.attackCooldown);
            swordAngle = Math.sin(attackProgress * Math.PI) * -120; // Swing arc
        }

        // Draw sword (behind player if not attacking, in front when attacking)
        if (!this.isAttacking || swordAngle < -60) {
            this.drawSword(ctx, swordAngle, drawDirection);
        }

        // Draw pixel art character body
        this.drawPixelBody(ctx);

        // Draw shield when blocking (in front of player)
        if (this.isBlocking) {
            this.drawShield(ctx);
        }

        // Draw sword in front when mid-swing
        if (this.isAttacking && swordAngle >= -60) {
            this.drawSword(ctx, swordAngle, drawDirection);
        }

        // Draw shield on back when armor is equipped (level 1+)
        if (this.gear.armor > 0 && !this.isBlocking) {
            this.drawShieldOnBack(ctx);
        }

        ctx.restore();

        // Draw level up animation
        if (this.isLevelingUp) {
            this.drawLevelUpAnimation(ctx);
        }

        // Draw recall animation
        if (this.isRecalling) {
            this.drawRecallAnimation(ctx);
        }
    }

    drawRecallAnimation(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const progress = this.recallProgress || 0;
        const time = Date.now() / 50;

        ctx.save();

        // Portal base rings - expanding and contracting
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const phase = (time * 0.1 + i / ringCount * Math.PI * 2) % (Math.PI * 2);
            const size = 30 + Math.sin(phase) * 5;
            const alpha = 0.5 + Math.sin(phase) * 0.3;

            ctx.beginPath();
            ctx.ellipse(centerX, this.y + this.height, size, size * 0.3, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Rising particles
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            // Pseudo-random particles based on time and index
            const pTime = (time + i * 17.3) * 0.05;
            const pPhase = pTime % 1;

            // Spiral upward movement
            const angle = pTime * 5 + i;
            const radius = 25 * (1 - pPhase);
            const height = pPhase * 80;

            const px = centerX + Math.cos(angle) * radius;
            const py = this.y + this.height - height;

            const alpha = 1 - pPhase; // Fade out as they go up

            ctx.fillStyle = `rgba(150, 220, 255, ${alpha})`;
            ctx.fillRect(px, py, 2, 2);
        }

        // Channeling aura around player
        const auraAlpha = 0.3 + Math.sin(time * 0.2) * 0.2;
        ctx.fillStyle = `rgba(65, 105, 225, ${auraAlpha})`;
        ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);

        // Progress bar/circle above head
        const barY = this.y - 15;
        const barWidth = 40;
        const barHeight = 4;

        // Bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);

        // Bar fill
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth * progress, barHeight);

        // Progress text
        if (progress > 0) {
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            // ctx.fillText(Math.ceil((1 - progress) * 2) + 's', centerX, barY - 5);
        }

        ctx.restore();
    }

    drawLevelUpAnimation(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const progress = this.levelUpProgress;
        const time = Date.now() / 50;

        ctx.save();

        // WoW-style light beams shooting up
        const beamCount = 8;
        for (let i = 0; i < beamCount; i++) {
            const angle = (i / beamCount) * Math.PI * 2 + time * 0.05;
            const distance = 20 + progress * 15;
            const x = centerX + Math.cos(angle) * distance;
            const beamHeight = 80 * (1 - progress);
            const width = 6 - progress * 3;

            // Beam gradient
            const alpha = (1 - progress) * 0.8;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.fillRect(x - width / 2, this.y - beamHeight, width, beamHeight);

            // Beam top glow
            ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
            ctx.fillRect(x - width / 2, this.y - beamHeight, width, 8);
        }

        // Central pillar of light
        const pillarAlpha = (1 - progress) * 0.6;
        ctx.fillStyle = `rgba(255, 255, 255, ${pillarAlpha})`;
        ctx.fillRect(centerX - 4, this.y - 100 * (1 - progress), 8, 100 * (1 - progress));

        ctx.fillStyle = `rgba(255, 215, 0, ${pillarAlpha})`;
        ctx.fillRect(centerX - 6, this.y - 100 * (1 - progress), 12, 100 * (1 - progress));

        // Ground circle expanding (yellow/gold)
        ctx.strokeStyle = `rgba(255, 215, 0, ${1 - progress})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.height, 40 * progress, 0, Math.PI * 2);
        ctx.stroke();

        // Inner circle
        ctx.strokeStyle = `rgba(255, 255, 200, ${0.8 - progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.height, 25 * progress, 0, Math.PI * 2);
        ctx.stroke();

        // Particle bursts
        const particleCount = 16;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const burstProgress = Math.min(1, progress * 2);
            const distance = burstProgress * 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            const size = 4 * (1 - burstProgress);

            if (size > 0) {
                ctx.fillStyle = `rgba(255, 215, 0, ${1 - burstProgress})`;
                ctx.fillRect(x - size / 2, y - size / 2, size, size);

                // Sparkle
                ctx.fillStyle = `rgba(255, 255, 255, ${(1 - burstProgress) * 0.8})`;
                ctx.fillRect(x - size / 4, y - size / 4, size / 2, size / 2);
            }
        }

        // Player glow
        ctx.fillStyle = `rgba(255, 215, 0, ${(1 - progress) * 0.4})`;
        ctx.fillRect(this.x - 15, this.y - 15, this.width + 30, this.height + 30);

        // Spinning stars around player
        for (let i = 0; i < 5; i++) {
            const starAngle = time * 0.1 + (i / 5) * Math.PI * 2;
            const starRadius = 30;
            const starX = centerX + Math.cos(starAngle) * starRadius;
            const starY = centerY + Math.sin(starAngle) * starRadius;
            const starAlpha = (1 - progress) * 0.9;

            // Star shape (pixel art)
            ctx.fillStyle = `rgba(255, 255, 0, ${starAlpha})`;
            ctx.fillRect(starX - 1, starY - 3, 2, 6); // Vertical
            ctx.fillRect(starX - 3, starY - 1, 6, 2); // Horizontal
            ctx.fillRect(starX - 2, starY - 2, 4, 4); // Center
        }

        // "LEVEL UP!" text
        if (progress < 0.7) {
            const textAlpha = progress < 0.3 ? progress / 0.3 : 1 - ((progress - 0.3) / 0.4);
            ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
            ctx.strokeStyle = `rgba(139, 69, 19, ${textAlpha})`;
            ctx.font = 'bold 20px monospace';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            const textY = this.y - 40 - progress * 20;
            ctx.strokeText('LEVEL UP!', centerX, textY);
            ctx.fillText('LEVEL UP!', centerX, textY);
        }

        ctx.restore();
    }

    drawPixelBody(ctx) {
        const x = this.x;
        const y = this.y;
        const pixelSize = 3; // 3x3 pixel blocks for better proportions (6x11 grid = 18x33px, centered in 24x32 box)
        const offsetX = 3; // Center horizontally in 24px width

        // Calculate animation offsets
        const isMoving = Math.abs(this.vx) > 0.5;
        const walkCycle = Math.floor(this.animTime / 150) % 4; // 4 frame walk cycle
        const bobOffset = isMoving ? Math.sin(this.animTime / 100) * 1 : 0;

        // Blocking lean
        const blockLean = this.isBlocking ? -2 : 0;

        // Attack recoil
        const attackRecoil = this.isAttacking ? Math.sin((1 - this.attackTime / PLAYER_CONFIG.attackCooldown) * Math.PI) * 2 : 0;

        // Helper function to draw pixel blocks
        const pixel = (offsetXPos, offsetYPos, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                x + offsetX + offsetXPos * pixelSize + blockLean + attackRecoil,
                y + offsetYPos * pixelSize + bobOffset,
                pixelSize,
                pixelSize
            );
        };

        // Character colors
        const headColor = '#f0c090'; // Skin tone
        const hairColor = '#8B4513'; // Brown hair
        const eyeColor = '#000000';

        // Armor colors based on equipped armor tier
        let armorColor, armorHighlight, armorDark;
        const armorTier = this.gear.armor || 0;

        if (armorTier >= 4) {
            // Diamond Armor - cyan/light blue
            armorColor = '#5CE1E6';
            armorHighlight = '#A0F0F0';
            armorDark = '#3BA8AD';
        } else if (armorTier >= 3) {
            // Iron Armor - silver/gray
            armorColor = '#A8A8A8';
            armorHighlight = '#D0D0D0';
            armorDark = '#707070';
        } else if (armorTier >= 2) {
            // Copper Armor - copper/orange-brown
            armorColor = '#B87333';
            armorHighlight = '#DA8A4A';
            armorDark = '#8B5A2B';
        } else if (armorTier >= 1) {
            // Leather Armor - brown
            armorColor = '#8B5A2B';
            armorHighlight = '#A67C52';
            armorDark = '#5C3D1E';
        } else {
            // No Armor - basic cloth/shirt
            armorColor = '#5A6B7C';
            armorHighlight = '#7A8B9C';
            armorDark = '#3A4B5C';
        }

        const armColor = '#f0c090';
        const pantsColor = '#4A4A4A';
        const bootColor = '#2C1810';
        const beltColor = '#8B4513';

        // Hair (top 2 rows)
        for (let i = 1; i < 5; i++) {
            pixel(i, 0, hairColor);
            pixel(i, 1, hairColor);
        }

        // Face (rows 2-3)
        for (let i = 1; i < 5; i++) {
            pixel(i, 2, headColor);
            pixel(i, 3, headColor);
        }

        // Eyes (blink during attack)
        if (!this.isAttacking || this.attackTime > PLAYER_CONFIG.attackCooldown - 50) {
            pixel(1, 2, eyeColor);
            pixel(4, 2, eyeColor);
        }

        // Torso with armor (rows 4-6)
        for (let i = 1; i < 5; i++) {
            pixel(i, 4, armorColor);
            pixel(i, 5, armorColor);
            pixel(i, 6, armorColor);
        }
        // Armor highlights
        pixel(2, 4, armorHighlight);
        pixel(3, 4, armorHighlight);

        // Add shoulder pads for Copper+ armor (tier 2+)
        if (armorTier >= 2) {
            pixel(0, 3, armorColor);
            pixel(5, 3, armorColor);
            pixel(0, 4, armorDark);
            pixel(5, 4, armorDark);
        }

        // Add chest plate detail for Iron+ armor (tier 3+)
        if (armorTier >= 3) {
            pixel(2, 5, armorHighlight);
            pixel(3, 5, armorHighlight);
        }

        // Add gem/diamond detail for Diamond armor (tier 4)
        if (armorTier >= 4) {
            pixel(2, 5, '#FFFFFF'); // White gem center
            pixel(3, 5, '#FFFFFF');
        }

        // Arms (animated for attacking)
        const armOffset = this.isAttacking ? 1 : 0;

        // Left arm (shield arm) - with armor sleeve for tier 2+
        if (armorTier >= 2) {
            pixel(0, 4, armorColor);
            pixel(0, 5, armorDark);
        } else {
            pixel(0, 4, armColor);
            pixel(0, 5, armColor);
        }
        pixel(0, 6, armColor); // Hand always skin

        // Right arm (sword arm) - with armor sleeve for tier 2+
        if (armorTier >= 2) {
            pixel(5, 4 + armOffset, armorColor);
            pixel(5, 5 + armOffset, armorDark);
        } else {
            pixel(5, 4 + armOffset, armColor);
            pixel(5, 5 + armOffset, armColor);
        }
        pixel(5, 6 + armOffset, armColor); // Hand always skin

        // Belt (row 6)
        for (let i = 1; i < 5; i++) {
            pixel(i, 6, beltColor);
        }
        pixel(2, 6, '#FFD700'); // Gold buckle
        pixel(3, 6, '#FFD700');

        // Legs with walking animation (rows 7-9)
        let leftLegOffset = 0;
        let rightLegOffset = 0;

        if (isMoving) {
            // Alternate leg positions
            if (walkCycle === 0 || walkCycle === 2) {
                rightLegOffset = 1;
            } else {
                leftLegOffset = 1;
            }
        }

        // Left leg
        pixel(1, 7 + leftLegOffset, pantsColor);
        pixel(1, 8 + leftLegOffset, pantsColor);
        pixel(2, 7 + leftLegOffset, pantsColor);
        pixel(2, 8 + leftLegOffset, pantsColor);

        // Right leg
        pixel(3, 7 + rightLegOffset, pantsColor);
        pixel(3, 8 + rightLegOffset, pantsColor);
        pixel(4, 7 + rightLegOffset, pantsColor);
        pixel(4, 8 + rightLegOffset, pantsColor);

        // Boots (rows 9-10)
        pixel(1, 9 + leftLegOffset, bootColor);
        pixel(2, 9 + leftLegOffset, bootColor);
        pixel(1, 10 + leftLegOffset, bootColor);
        pixel(2, 10 + leftLegOffset, bootColor);

        pixel(3, 9 + rightLegOffset, bootColor);
        pixel(4, 9 + rightLegOffset, bootColor);
        pixel(3, 10 + rightLegOffset, bootColor);
        pixel(4, 10 + rightLegOffset, bootColor);
    }

    drawSword(ctx, angle, direction) {
        ctx.save();

        // Hand position - aligned with arm pixel
        // Body is 6 pixels wide. Right arm is at pixel index 5.
        // Hand is at row index 6 (4-6 are arm/hand).
        const pixelSize = 4; // Assuming 4x scaling or similar based on visual observation
        // Actually, let's look at drawPixelBody to see scale. pixel(x, y, color) likely draws a rect.
        // If pixel() uses this.width/6, then each pixel is ~width/6.

        // Let's rely on relative positioning to width/height
        // Hand is roughly at 80-90% width and 60% height
        const handX = this.x + this.width * 0.9;
        const handY = this.y + this.height * 0.65;

        // Attack recoil
        const attackRecoil = this.isAttacking ? Math.sin((1 - this.attackTime / PLAYER_CONFIG.attackCooldown) * Math.PI) * 2 : 0;

        ctx.translate(handX + attackRecoil, handY);
        ctx.rotate((angle * Math.PI) / 180);

        // Determine sword appearance based on upgrade level
        const weaponTier = this.gear.weapon || 0;
        let bladeColor, bladeHighlight, bladeEdge, guardColor, guardHighlight, pommelColor;

        if (weaponTier >= 3) {
            // Diamond Sword (Tier 3) - Blue
            bladeColor = '#2E67F8';      // Royal Blue
            bladeHighlight = '#87CEFA';  // Sky Blue
            bladeEdge = '#00008B';       // Dark Blue
            guardColor = '#FFD700';      // Gold Guard
            guardHighlight = '#FFFACD';  // Light Gold
            pommelColor = '#2E67F8';     // Blue Pommel
        } else if (weaponTier >= 2) {
            // Iron Sword (Tier 2) - White/Steel-like
            bladeColor = '#F4F4F8';      // White Steel
            bladeHighlight = '#FFFFFF';  // Pure White
            bladeEdge = '#B0B0C0';       // Cool Silver Edge
            guardColor = '#4A4A4A';      // Dark Iron Guard
            guardHighlight = '#696969';
            pommelColor = '#F4F4F8';     // Steel Pommel
        } else if (weaponTier >= 1) {
            // Copper Sword (Tier 1)
            bladeColor = '#B87333';      // Copper
            bladeHighlight = '#DA8A4A';  // Bright Copper
            bladeEdge = '#8B5A2B';       // Dark Bronze
            guardColor = '#5C4033';      // Dark Brown Guard
            guardHighlight = '#8B5A2B';
            pommelColor = '#B87333';
        } else {
            // Wooden Sword (Tier 0) - Default
            bladeColor = '#8B5A2B';      // Wood Brown
            bladeHighlight = '#A07050';  // Light Wood
            bladeEdge = '#5C4033';       // Dark Wood
            guardColor = '#4A3015';      // Darker Wood
            guardHighlight = '#654321';
            pommelColor = '#8B5A2B';
        }

        // Pivot is at the hand. Draw handle extending outwards/backwards slightly.
        // Handle (grip) - centered on pivot (hand)
        ctx.fillStyle = '#4A3015';
        ctx.fillRect(0, -3, 8, 6); // Handle starts at 0 (hand) and goes out

        // Sword blade starts after handle
        ctx.fillStyle = bladeColor;
        ctx.fillRect(8, -2, 28, 4); // Blade starts at 8

        // Blade highlight
        ctx.fillStyle = bladeHighlight;
        ctx.fillRect(8, -2, 28, 1);

        // Blade edge (darker)
        ctx.fillStyle = bladeEdge;
        ctx.fillRect(8, 1, 28, 1);

        // Sword tip (pointed)
        ctx.fillStyle = bladeColor;
        ctx.beginPath();
        ctx.moveTo(36, -2);
        ctx.lineTo(40, 0);
        ctx.lineTo(36, 2);
        ctx.fill();

        // Tip highlight/edge
        ctx.fillStyle = bladeHighlight;
        ctx.beginPath();
        ctx.moveTo(36, -2);
        ctx.lineTo(40, 0);
        ctx.lineTo(36, -0.5);
        ctx.fill();

        ctx.fillStyle = bladeEdge;
        ctx.beginPath();
        ctx.moveTo(36, 2);
        ctx.lineTo(40, 0);
        ctx.lineTo(36, 1);
        ctx.fill();

        // Cross guard (between handle and blade)
        ctx.fillStyle = guardColor;
        ctx.fillRect(6, -6, 4, 12); // Shifted to be at connection point

        // Guard highlights
        ctx.fillStyle = guardHighlight;
        ctx.fillRect(6, -6, 4, 2);
        ctx.fillRect(6, 4, 4, 2);

        // Pommel (end of handle)
        ctx.fillStyle = pommelColor;
        ctx.fillRect(-4, -4, 4, 8); // Shifted to end of handle

        // Diamond sword glow effect (Blue)
        if (weaponTier >= 3) {
            ctx.shadowColor = '#2E67F8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(8, -2, 30, 4); // Subtle glow overlay
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    drawShield(ctx) {
        // Shield position at left arm (closer to body)
        // Body width is this.width. Left arm is at pixel index 0.
        const shieldX = this.x - 2;
        const shieldY = this.y + this.height * 0.45;

        // Blocking animation - shield comes forward/up
        const blockOffsetX = this.isBlocking ? 5 : 0;
        const blockOffsetY = this.isBlocking ? -2 : 0;

        ctx.save();
        ctx.translate(blockOffsetX, blockOffsetY);

        // Shield base (metal) - kite shield shape
        ctx.fillStyle = '#7C8B9C';
        ctx.beginPath();
        ctx.moveTo(shieldX, shieldY); // Top left
        ctx.lineTo(shieldX + 14, shieldY + 2); // Top right (slanted)
        ctx.lineTo(shieldX + 14, shieldY + 22); // Right side
        ctx.lineTo(shieldX + 7, shieldY + 28); // Bottom point
        ctx.lineTo(shieldX, shieldY + 22); // Left side
        ctx.closePath();
        ctx.fill();

        // Shield rim
        ctx.strokeStyle = '#5A6B7C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shieldX, shieldY);
        ctx.lineTo(shieldX + 14, shieldY + 2);
        ctx.lineTo(shieldX + 14, shieldY + 22);
        ctx.lineTo(shieldX + 7, shieldY + 28);
        ctx.lineTo(shieldX, shieldY + 22);
        ctx.closePath();
        ctx.stroke();

        // Shield boss (center decoration)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(shieldX + 7, shieldY + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Blue emblem stripe
        ctx.fillStyle = '#3498db';
        ctx.fillRect(shieldX + 5, shieldY + 8, 4, 8);

        // Highlight
        ctx.fillStyle = '#A0B0C0';
        ctx.fillRect(shieldX + 2, shieldY + 4, 2, 18);

        ctx.restore();
    }

    drawShieldOnBack(ctx) {
        // Shield on back (smaller, visible when not blocking)
        const shieldX = this.x + 2;
        const shieldY = this.y + this.height * 0.35;

        ctx.save();

        // Shield base (metal) - smaller kite shield on back
        ctx.fillStyle = '#7C8B9C';
        ctx.beginPath();
        ctx.moveTo(shieldX, shieldY);
        ctx.lineTo(shieldX + 8, shieldY + 1);
        ctx.lineTo(shieldX + 8, shieldY + 12);
        ctx.lineTo(shieldX + 4, shieldY + 16);
        ctx.lineTo(shieldX, shieldY + 12);
        ctx.closePath();
        ctx.fill();

        // Shield rim
        ctx.strokeStyle = '#5A6B7C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(shieldX, shieldY);
        ctx.lineTo(shieldX + 8, shieldY + 1);
        ctx.lineTo(shieldX + 8, shieldY + 12);
        ctx.lineTo(shieldX + 4, shieldY + 16);
        ctx.lineTo(shieldX, shieldY + 12);
        ctx.closePath();
        ctx.stroke();

        // Shield boss (center)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(shieldX + 4, shieldY + 7, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    usePotion(potionId) {
        // This method now only applies potion effects
        // Inventory management is handled by the UI layer
        const potion = POTIONS[potionId];
        if (!potion) return false;

        // Apply effect
        if (potion.effect.type === 'heal') {
            // Check if already at full health
            if (this.hp >= this.stats.maxHp) {
                if (window.gameUI) {
                    window.gameUI.showNotification('Already at full health!', 'damage');
                }
                return false;
            }

            const healAmount = Math.min(potion.effect.value, this.stats.maxHp - this.hp);
            this.hp += healAmount;
            if (window.gameUI) {
                window.gameUI.showNotification(`+${healAmount} HP`, 'item');
                window.gameUI.showDamage(this.x + this.width / 2, this.y, `+${healAmount}`, false, '#2ecc71');
            }

            // Play heal sound
            if (window.soundManager) {
                window.soundManager.play('heal');
            }
        } else if (potion.effect.type === 'buff') {
            // Check if buff is already active
            const existingBuff = this.activeBuffs.find(b => b.stat === potion.effect.stat);
            if (existingBuff) {
                // Refresh duration
                existingBuff.duration = potion.effect.duration;
                if (window.gameUI) {
                    window.gameUI.showNotification(`${potion.name} refreshed!`, 'item');
                    window.gameUI.updateActivePotionsDisplay();
                }
            } else {
                // Add new buff with name and color for UI display
                this.activeBuffs.push({
                    stat: potion.effect.stat,
                    value: potion.effect.value,
                    duration: potion.effect.duration,
                    name: potion.name,
                    color: potion.color,
                    potionId: potionId
                });
                if (window.gameUI) {
                    window.gameUI.showNotification(`${potion.name} activated!`, 'level-up');
                    window.gameUI.updateActivePotionsDisplay();
                }
            }
            // Recalculate stats with new buff
            this.recalculateStats();

            // Play buff sound
            if (window.soundManager) {
                window.soundManager.play('coin');
            }
        }

        return true;
    }

    updateBuffs(deltaTime) {
        let buffsExpired = false;

        // Update all active buffs
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            this.activeBuffs[i].duration -= deltaTime;

            // Remove expired buffs
            if (this.activeBuffs[i].duration <= 0) {
                const expiredBuff = this.activeBuffs.splice(i, 1)[0];
                buffsExpired = true;

                if (window.gameUI) {
                    const buffNames = {
                        'damage': 'Strength',
                        'defense': 'Defense',
                        'speed': 'Speed'
                    };
                    window.gameUI.showNotification(`${buffNames[expiredBuff.stat]} buff expired`, 'damage');
                    window.gameUI.updateActivePotionsDisplay();
                }
            }
        }

        // Recalculate stats if any buffs expired
        if (buffsExpired) {
            this.recalculateStats();
        }

        // Update potion display every frame to show timers (only when game is not paused)
        if (this.activeBuffs.length > 0 && window.gameUI && window.game && !window.game.paused) {
            window.gameUI.updateActivePotionsDisplay();
        }
    }

    getSaveData() {
        return {
            level: this.level,
            xp: this.xp,
            coins: this.coins,
            materials: this.materials,
            hp: this.hp,
            statUpgrades: this.statUpgrades,
            gear: this.gear,
            craftedGear: this.craftedGear,
            questProgress: this.questProgress,
            potions: this.potions
        };
    }

    loadSaveData(data) {
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.coins = data.coins || 0;
        this.materials = data.materials || 0;
        this.hp = data.hp || PLAYER_CONFIG.baseStats.maxHp;
        this.statUpgrades = data.statUpgrades || { maxHp: 0, damage: 0, defense: 0, speed: 0, critChance: 0 };

        // Ensure all gear slots exist (for backward compatibility with old saves)
        this.gear = {
            weapon: 0,
            armor: 0,
            trinket: 0,
            boots: 0,
            ...(data.gear || {})
        };

        this.craftedGear = {
            weapon: 0,
            armor: 0,
            trinket: 0,
            boots: 0,
            ...(data.craftedGear || {})
        };

        this.questProgress = data.questProgress || {};

        // Load potions (for backward compatibility with old saves)
        this.potions = data.potions || {
            health_potion: 0,
            elixir_strength: 0,
            elixir_defense: 0,
            elixir_speed: 0
        };

        this.recalculateStats();

        // Load spell unlock state
        this.loadSpellUnlockState();
    }

    loadSpellUnlockState() {
        const unlocked = SafeStorage.getItem('thunderstrikeUnlocked') === 'true';
        this.spells.thunderstrike.unlocked = unlocked;
        this.updateSpellSlotUI();
    }

    unlockThunderstrike() {
        if (!this.spells.thunderstrike.unlocked) {
            this.spells.thunderstrike.unlocked = true;
            SafeStorage.setItem('thunderstrikeUnlocked', 'true');
            this.updateSpellSlotUI();

            // Play unlock animation
            const spellSlot = document.getElementById('spell-slot');
            if (spellSlot) {
                spellSlot.classList.add('unlocked');
                setTimeout(() => spellSlot.classList.remove('unlocked'), 1000);
            }

            if (window.gameUI) {
                window.gameUI.showNotification('⚡ Thunderstrike spell unlocked!', 'level-up');
            }
        }
    }

    updateSpellSlotUI() {
        const spellSlot = document.getElementById('spell-slot');
        if (!spellSlot) return;

        if (this.spells.thunderstrike.unlocked) {
            spellSlot.classList.remove('locked');
            spellSlot.title = 'Thunderstrike (Q) - 45s cooldown';
        } else {
            spellSlot.classList.add('locked');
            spellSlot.title = 'Thunderstrike (Q) - Defeat the Phantom Dragon to unlock';
        }
    }

    updateSpellCooldowns(deltaTime) {
        if (this.spells.thunderstrike.cooldown > 0) {
            this.spells.thunderstrike.cooldown -= deltaTime;
            if (this.spells.thunderstrike.cooldown < 0) {
                this.spells.thunderstrike.cooldown = 0;
            }
            this.updateSpellCooldownUI();
        }
    }

    updateSpellCooldownUI() {
        const spellSlot = document.getElementById('spell-slot');
        const cooldownOverlay = spellSlot?.querySelector('.spell-cooldown-overlay');
        const cooldownText = spellSlot?.querySelector('.spell-cooldown-text');

        if (!spellSlot || !cooldownOverlay || !cooldownText) return;

        const spell = this.spells.thunderstrike;

        if (spell.cooldown > 0) {
            spellSlot.classList.add('on-cooldown');
            const percent = (spell.cooldown / spell.maxCooldown) * 100;
            cooldownOverlay.style.height = percent + '%';
            cooldownText.textContent = Math.ceil(spell.cooldown / 1000) + 's';
        } else {
            spellSlot.classList.remove('on-cooldown');
            cooldownOverlay.style.height = '0%';
            cooldownText.textContent = '';
        }
    }

    canCastThunderstrike() {
        return this.spells.thunderstrike.unlocked &&
            this.spells.thunderstrike.cooldown <= 0 &&
            this.hp > 0;
    }

    castThunderstrike() {
        if (!this.canCastThunderstrike()) {
            if (!this.spells.thunderstrike.unlocked && window.gameUI) {
                window.gameUI.showNotification('⚡ Spell locked - Defeat the Phantom Dragon', 'damage');
            } else if (this.spells.thunderstrike.cooldown > 0 && window.gameUI) {
                const remaining = Math.ceil(this.spells.thunderstrike.cooldown / 1000);
                window.gameUI.showNotification(`⚡ Thunderstrike on cooldown (${remaining}s)`, 'damage');
            }
            return false;
        }

        // Start cooldown
        this.spells.thunderstrike.cooldown = this.spells.thunderstrike.maxCooldown;

        // Play cast animation on UI
        const spellSlot = document.getElementById('spell-slot');
        if (spellSlot) {
            spellSlot.classList.add('casting');
            setTimeout(() => spellSlot.classList.remove('casting'), 300);
        }

        return true;
    }
}
