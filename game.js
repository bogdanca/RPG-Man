// Main Game Engine

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.width;
        this.canvas.height = GAME_CONFIG.height;
        
        // Game state
        this.paused = false;
        this.currentZone = 'hub';
        this.zoneXpGained = 0;
        this.previousPortal = null;
        this.nextPortal = null;
        this.portals = [];
        
        // Input
        this.keys = {};
        this.mouseX = GAME_CONFIG.width / 2;
        this.mouseY = GAME_CONFIG.height / 2;
        
        // Game objects
        this.player = new Player(100, 400);
        this.enemies = [];
        this.platforms = [];
        this.particleSystem = new ParticleSystem();
        this.dropManager = new DropManager();
        this.projectileManager = new ProjectileManager();
        this.levelGenerator = new LevelGenerator();
        this.npcManager = new NPCManager();
        
        // Spell effects
        this.thunderstrikeEffect = null;
        
        // UI
        this.ui = new GameUI(this);
        window.gameUI = this.ui;
        window.game = this;
        
        // Timing
        this.lastTime = performance.now();
        this.deltaTime = 0;
        
        // Initialize
        this.loadGame();
        this.loadZone(this.currentZone);
        this.setupInput();
        
        // Show tutorial on first load
        if (!localStorage.getItem('tutorialShown')) {
            setTimeout(() => {
                document.getElementById('tutorial-popup').classList.remove('hidden');
            }, 500);
        }
        
        // Start game loop
        this.loop();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Panel shortcuts
            if (e.key === 'c' || e.key === 'C') {
                this.ui.togglePanel('character-panel');
            }
            if (e.key === 'u' || e.key === 'U') {
                this.ui.togglePanel('upgrade-panel');
            }
            if (e.key === 'b' || e.key === 'B') {
                this.ui.togglePanel('blacksmith-panel');
            }
            if (e.key === 'l' || e.key === 'L') {
                this.ui.togglePanel('quests-panel');
            }
            
            // Thunderstrike spell (Q)
            if (e.key === 'q' || e.key === 'Q') {
                this.castThunderstrike();
            }
            
            // Escape to close panels
            if (e.key === 'Escape' && this.ui.currentPanel) {
                this.ui.closePanel(this.ui.currentPanel);
            }
            
            // Potion belt hotkeys (1-4)
            if (e.key >= '1' && e.key <= '4') {
                const beltSlotIndex = parseInt(e.key) - 1;
                this.ui.usePotionFromBelt(beltSlotIndex);
            }
            
            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button === 0) { // Left click = attack
                this.keys.mouseAttack = true;
            } else if (e.button === 2) { // Right click = block
                this.keys.mouseBlock = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (e.button === 2) { // Release right click to stop blocking
                this.keys.mouseBlock = false;
            }
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Track mouse position for sword direction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Auto-save periodically
        setInterval(() => {
            this.saveGame();
        }, 10000);
        
        // Mobile touch controls
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // Detect mobile device
        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isMobile) return;
        
        // Create mobile control overlay
        const mobileControls = document.createElement('div');
        mobileControls.id = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="mobile-dpad">
                <button class="mobile-btn mobile-up" data-key="ArrowUp">▲</button>
                <div class="mobile-dpad-row">
                    <button class="mobile-btn mobile-left" data-key="ArrowLeft">◀</button>
                    <button class="mobile-btn mobile-right" data-key="ArrowRight">▶</button>
                </div>
            </div>
            <button class="mobile-btn mobile-fullscreen" id="mobile-fullscreen-btn">⛶</button>
            <div class="mobile-actions">
                <button class="mobile-btn mobile-attack" data-action="attack">⚔️</button>
                <button class="mobile-btn mobile-block" data-action="block">🛡️</button>
                <button class="mobile-btn mobile-interact" data-key="e">E</button>
            </div>
        `;
        document.body.appendChild(mobileControls);
        
        // Add mobile control styles
        const style = document.createElement('style');
        style.textContent = `
            #mobile-controls {
                display: flex;
                justify-content: space-between;
                position: fixed;
                bottom: 60px;
                left: 10px;
                right: 10px;
                z-index: 1000;
                pointer-events: none;
            }
            .mobile-dpad, .mobile-actions {
                pointer-events: auto;
            }
            .mobile-dpad {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            .mobile-dpad-row {
                display: flex;
                gap: 40px;
            }
            .mobile-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            }
            .mobile-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid rgba(255, 215, 0, 0.6);
                background: rgba(0, 0, 0, 0.6);
                color: #FFD700;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
            }
            .mobile-btn:active {
                background: rgba(255, 215, 0, 0.3);
                transform: scale(0.95);
            }
            .mobile-attack { background: rgba(220, 50, 50, 0.5); }
            .mobile-block { background: rgba(50, 100, 200, 0.5); }
            .mobile-interact { font-size: 16px; font-weight: bold; }
            .mobile-fullscreen {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                font-size: 18px;
                background: rgba(0, 0, 0, 0.7);
                z-index: 1001;
            }
            .mobile-fullscreen.is-fullscreen {
                background: rgba(255, 215, 0, 0.3);
            }
            
            @media (min-width: 900px) {
                #mobile-controls { display: none; }
                .mobile-fullscreen { display: none; }
            }
        `;
        document.head.appendChild(style);
        
        // Handle touch events for movement buttons
        const movementBtns = mobileControls.querySelectorAll('[data-key]');
        movementBtns.forEach(btn => {
            const key = btn.dataset.key;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            }, { passive: false });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            }, { passive: false });
            
            btn.addEventListener('touchcancel', (e) => {
                this.keys[key] = false;
            });
        });
        
        // Handle attack button
        const attackBtn = mobileControls.querySelector('[data-action="attack"]');
        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.mouseAttack = true;
        }, { passive: false });
        attackBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.mouseAttack = false;
        }, { passive: false });
        
        // Handle block button
        const blockBtn = mobileControls.querySelector('[data-action="block"]');
        blockBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.mouseBlock = true;
        }, { passive: false });
        blockBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.mouseBlock = false;
        }, { passive: false });
        
        // Handle fullscreen toggle button
        const fullscreenBtn = document.getElementById('mobile-fullscreen-btn');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen(fullscreenBtn);
        });
        
        // Update button state on fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton(fullscreenBtn);
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.updateFullscreenButton(fullscreenBtn);
        });
        
        // Prompt user to go fullscreen on first load
        setTimeout(() => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                this.toggleFullscreen(fullscreenBtn);
            }
        }, 1000);
    }
    
    toggleFullscreen(btn) {
        const elem = document.documentElement;
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
        
        if (!isFullscreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    
    updateFullscreenButton(btn) {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
        if (isFullscreen) {
            btn.classList.add('is-fullscreen');
            btn.textContent = '⛶';
        } else {
            btn.classList.remove('is-fullscreen');
            btn.textContent = '⛶';
        }
    }
    
    loadZone(zoneId, entryPortalType = null) {
        // Find zone by ID
        let zone = ZONES.find(z => z.id === zoneId);
        if (!zone) {
            console.error('Zone not found:', zoneId);
            return false;
        }
        
        // Check level requirement
        if (this.player.level < zone.requiredLevel) {
            this.ui.showNotification(`Level ${zone.requiredLevel} required for ${zone.name}!`, 'damage');
            return false;
        }
        
        this.currentZone = zoneId;
        
        // Reset player velocity to prevent momentum carrying over
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Clear all movement keys to prevent auto-walk after zone transition
        this.keys['a'] = false;
        this.keys['A'] = false;
        this.keys['d'] = false;
        this.keys['D'] = false;
        this.keys['w'] = false;
        this.keys['W'] = false;
        this.keys['s'] = false;
        this.keys['S'] = false;
        this.keys[' '] = false;
        this.keys['ArrowLeft'] = false;
        this.keys['ArrowRight'] = false;
        this.keys['ArrowUp'] = false;
        this.keys['ArrowDown'] = false;
        this.keys['e'] = false;
        this.keys['E'] = false;
        this.keys.jumpWasPressed = false;
        
        // Set player spawn position based on entry portal type
        const groundY = this.canvas.height - 80; // Standard ground spawn height
        if (entryPortalType === 'previous') {
            // Came from previous zone via "previous" portal, spawn on RIGHT side (away from previous portal)
            this.player.x = this.canvas.width - 120;
            this.player.y = groundY;
        } else if (entryPortalType === 'next') {
            // Came from next zone via "next" portal, spawn on LEFT side (away from next portal)
            this.player.x = 80;
            this.player.y = groundY;
        } else if (entryPortalType === 'hub' || zone.type === 'dungeon') {
            // Entering dungeon from hub, spawn on LEFT side
            this.player.x = 80;
            this.player.y = groundY;
        }
        // For hub zone, keep player position or use default
        this.zoneXpGained = 0;
        this.previousPortal = null;
        this.nextPortal = null;
        this.portals = [];
        
        // Clear enemies, projectiles, and drops
        this.enemies = [];
        this.projectileManager.clear();
        this.npcManager.clear();
        this.dropManager.clear();
        
        // Set up slime cave background for dungeon
        if (zone.type === 'dungeon') {
            let slimeCave = getSlimeCaveInstance();
            slimeCave.setFloor(zone.floor || 1);
        }
        
        // Generate or load level
        let levelData;
        if (zone.procedural && zone.type === 'dungeon') {
            // Generate random level
            levelData = this.levelGenerator.generateDungeonLevel(zone.floor || 1, zone.floor || 1);
            this.platforms = levelData.platforms;
        } else if (zone.type === 'hub') {
            // Use hub generator
            levelData = this.levelGenerator.generateHub();
            this.platforms = levelData.platforms;
        } else {
            // Use predefined platforms (boss rooms)
            this.platforms = zone.platforms ? zone.platforms.map(p => ({ ...p })) : [];
            levelData = { enemySpawns: [] };
        }
        
        // Spawn enemies
        if (zone.enemyTypes && zone.enemyTypes.length > 0) {
            let count = zone.enemyCount ? 
                Math.floor(Math.random() * (zone.enemyCount.max - zone.enemyCount.min + 1)) + zone.enemyCount.min :
                8;
            
            // Calculate total weight
            let totalWeight = zone.enemyTypes.reduce((sum, e) => sum + e.weight, 0);
            
            // Use procedural spawns if available, otherwise random
            let spawns = levelData.enemySpawns && levelData.enemySpawns.length > 0 ?
                levelData.enemySpawns : [];
            
            // If not enough spawns, add random ones
            while (spawns.length < count) {
                spawns.push({
                    x: 100 + Math.random() * 600,
                    y: 300
                });
            }
            
            // Spawn enemies
            for (let i = 0; i < count; i++) {
                // Pick random enemy type based on weights
                let roll = Math.random() * totalWeight;
                let currentWeight = 0;
                let selectedType = zone.enemyTypes[0].type;
                
                for (let enemyType of zone.enemyTypes) {
                    currentWeight += enemyType.weight;
                    if (roll <= currentWeight) {
                        selectedType = enemyType.type;
                        break;
                    }
                }
                
                let spawn = spawns[i % spawns.length];
                this.enemies.push(new Enemy(selectedType, spawn.x, spawn.y));
            }
        }
        
        // Create portals for dungeon levels
        if (zone.type === 'dungeon') {
            // PREVIOUS PORTAL - goes to previous level or hub
            const previousPortalX = 30;
            const previousPortalY = this.canvas.height - 80;
            
            const previousZoneId = this.getPreviousZone(zone);
            const previousZone = ZONES.find(z => z.id === previousZoneId);
            const previousPortalName = previousZoneId === 'hub' ? 'Hub' : (previousZone ? previousZone.name : 'Hub');
            
            this.previousPortal = new LevelPortal(
                previousPortalX,
                previousPortalY,
                previousZoneId,
                'previous',
                previousPortalName,
                false // Previous portal is always unlocked
            );
            this.previousPortal.open();
            
            // NEXT PORTAL - goes to next level
            const nextPortalX = this.canvas.width - 70;
            const nextPortalY = this.canvas.height - 80;
            
            const nextZoneId = this.getNextZone(zone);
            const nextZone = ZONES.find(z => z.id === nextZoneId);
            const nextPortalName = nextZone ? nextZone.name : 'Exit';
            
            this.nextPortal = new LevelPortal(
                nextPortalX,
                nextPortalY,
                nextZoneId,
                'next',
                nextPortalName,
                true // Next portal starts locked
            );
            
            // Check if next portal should be immediately unlocked
            this.checkPortalUnlock();
        }
        
        // Create portals for hub
        if (zone.portals && zone.portals.length > 0) {
            zone.portals.forEach(portalData => {
                let portal = new Portal(
                    portalData.x, 
                    portalData.y, 
                    portalData.label, 
                    portalData.locked,
                    portalData.isTimeGated || false,
                    portalData.openHour || 11
                );
                portal.targetZone = this.getDungeonEntrance(portalData.targetDungeon);
                this.portals.push(portal);
            });
        }
        
        // Spawn NPCs for this zone
        let npcsForZone = this.npcManager.getNPCsByZone(zoneId);
        for (let npcData of npcsForZone) {
            this.npcManager.addNPC(npcData.x, npcData.y, npcData.type, npcData.name);
        }
        
        this.ui.showNotification(`Entered: ${zone.name}`, 'level-up');
        return true;
    }
    
    getPreviousZone(currentZone) {
        if (currentZone.floor === 1) {
            return 'hub';
        }
        
        // Find previous floor in dungeon
        let prevFloor = currentZone.floor - 1;
        let prevZone = ZONES.find(z => 
            z.dungeon === currentZone.dungeon && 
            z.floor === prevFloor
        );
        
        return prevZone ? prevZone.id : 'hub';
    }
    
    getNextZone(currentZone) {
        if (currentZone.exitToHub) {
            return 'hub';
        }
        
        // Find next floor in dungeon
        let nextFloor = currentZone.floor + 1;
        let nextZone = ZONES.find(z => 
            z.dungeon === currentZone.dungeon && 
            z.floor === nextFloor
        );
        
        return nextZone ? nextZone.id : 'hub';
    }
    
    getDungeonEntrance(dungeonName) {
        let entrance = ZONES.find(z => z.dungeon === dungeonName && z.floor === 1);
        return entrance ? entrance.id : 'hub';
    }
    
    onEnemyKilled(xpGained) {
        this.zoneXpGained += xpGained;
        
        // Check if portal should open based on player level
        this.checkPortalUnlock();
    }
    
    checkPortalUnlock() {
        if (!this.nextPortal) return;
        
        let currentZone = ZONES.find(z => z.id === this.currentZone);
        if (!currentZone) return;
        
        // Get the next zone
        let nextZoneId = this.getNextZone(currentZone);
        let nextZone = ZONES.find(z => z.id === nextZoneId);
        
        // Open portal if player meets the level requirement for the next zone
        if (nextZone && this.player.level >= nextZone.requiredLevel && this.nextPortal.locked) {
            this.nextPortal.locked = false;
            this.nextPortal.open();
            this.ui.showNotification('Next Portal Unlocked!', 'level-up');
        }
    }
    
    upgradePlayerStat(stat) {
        // Prevent spam-clicking
        if (this.ui.processingAction) {
            return;
        }
        this.ui.processingAction = true;
        
        let upgrade = STAT_UPGRADES[stat];
        let currentLevel = this.player.statUpgrades[stat];
        let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
        
        if (this.player.coins >= cost) {
            this.player.coins -= cost;
            this.player.statUpgrades[stat]++;
            this.player.recalculateStats();
            this.ui.updatePanelContent('upgrade-panel');
            this.ui.showNotification(`Upgraded ${upgrade.name}!`, 'level-up');
            this.saveGame();
            
            setTimeout(() => {
                this.ui.processingAction = false;
            }, 100);
        } else {
            this.ui.processingAction = false;
            this.ui.showNotification('Not enough coins!', 'damage');
        }
    }
    
    upgradePlayerGear(slot) {
        // Prevent spam-clicking
        if (this.ui.processingAction) {
            return;
        }
        this.ui.processingAction = true;
        
        let gearData = GEAR_SLOTS[slot];
        // Use craftedGear instead of equipped gear for progression
        let currentCraftedLevel = this.player.craftedGear[slot];
        let nextLevel = currentCraftedLevel + 1;
        
        if (nextLevel >= gearData.levels.length) {
            this.ui.showNotification('Already at max level!', 'damage');
            this.ui.processingAction = false;
            return;
        }
        
        let nextGear = gearData.levels[nextLevel];
        
        if (this.player.coins >= nextGear.coins && this.player.materials >= nextGear.materials) {
            this.player.coins -= nextGear.coins;
            this.player.materials -= nextGear.materials;
            
            // Add item to inventory with flying animation
            const added = this.ui.addItemToInventory(slot, nextLevel, true);
            
            if (added) {
                // Update crafted gear tracker
                this.player.craftedGear[slot] = nextLevel;
                
                // Show flying animation to bag
                this.ui.showCraftedItemAnimation(nextGear.name);
                
                // Mark bag as having new items
                this.ui.markBagAsNew();
                
                this.ui.showNotification(`Crafted ${nextGear.name}!`, 'item');
            } else {
                // Refund if inventory full
                this.player.coins += nextGear.coins;
                this.player.materials += nextGear.materials;
            }
            
            this.ui.updatePanelContent('blacksmith-panel');
            this.saveGame();
            
            // Reset processing flag after a short delay
            setTimeout(() => {
                this.ui.processingAction = false;
            }, 100);
        } else {
            this.ui.processingAction = false;
            this.ui.showNotification('Not enough resources!', 'damage');
        }
    }
    
    update() {
        // Always update UI even when paused (for menu resource updates)
        this.ui.update();
        
        if (this.paused) return;
        
        // Update player
        this.player.update(this.keys, this.platforms, this.enemies, this.deltaTime, this.mouseX, this.mouseY);
        
        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(this.player, this.platforms, this.deltaTime);
        }
        
        // Update projectiles
        this.projectileManager.update(this.deltaTime, this.player);
        
        // Update drops
        this.dropManager.update(this.deltaTime, this.platforms, this.player);
        
        // Update particles
        this.particleSystem.update(this.deltaTime);
        
        // Update spell cooldowns
        this.player.updateSpellCooldowns(this.deltaTime);
        
        // Update thunderstrike effect
        this.updateThunderstrike(this.deltaTime);
        
        // Update portals
        if (this.previousPortal) {
            let targetZone = this.previousPortal.update(this.deltaTime, this.player);
            if (targetZone) {
                this.loadZone(targetZone, 'previous');
                this.keys['e'] = false;
                this.keys['E'] = false;
            }
        }
        if (this.nextPortal) {
            let targetZone = this.nextPortal.update(this.deltaTime, this.player);
            if (targetZone) {
                this.loadZone(targetZone, 'next');
                this.keys['e'] = false;
                this.keys['E'] = false;
            }
        }
        
        // Update portals and check for E key interaction
        for (let portal of this.portals) {
            portal.update(this.deltaTime, this.player);
            if (portal.checkInteraction(this.player, this.keys['e'] || this.keys['E'])) {
                this.loadZone(portal.targetZone, 'hub');
                this.keys['e'] = false;
                this.keys['E'] = false;
            }
        }
        
        // Update NPCs and check for interactions
        this.npcManager.update(this.deltaTime, this.player);
        let interactedNPC = this.npcManager.checkInteractions(this.player, this.keys['e'] || this.keys['E']);
        if (interactedNPC) {
            this.keys['e'] = false;
            this.keys['E'] = false;
            
            // Handle NPC interaction
            if (interactedNPC.type === 'blacksmith') {
                this.ui.openPanel('blacksmith-panel');
            } else if (interactedNPC.type === 'potion_vendor') {
                this.ui.openPanel('potion-shop-panel');
            } else if (interactedNPC.type === 'spirit_healer') {
                // Heal player to full health
                this.player.hp = this.player.stats.maxHp;
                
                // Spawn healing particles
                if (this.particleSystem) {
                    for (let i = 0; i < 30; i++) {
                        this.particleSystem.emit(
                            this.player.x + this.player.width / 2,
                            this.player.y + this.player.height / 2,
                            2,
                            '#87ceeb'
                        );
                    }
                }
                
                // Show notification
                this.ui.showNotification('✨ Fully Healed!', 'level-up');
            }
        }
        
    }
    
    draw() {
        let zone = ZONES.find(z => z.id === this.currentZone);
        if (!zone) return;
        
        // Clear and draw background
        this.ctx.fillStyle = zone.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cave hub decorations (if in hub)
        if (zone.type === 'hub') {
            let caveHub = getCaveHubInstance();
            caveHub.draw(this.ctx);
        }
        
        // Draw slime cave decorations (if in dungeon)
        if (zone.type === 'dungeon') {
            let slimeCave = getSlimeCaveInstance();
            slimeCave.setFloor(zone.floor || 1);
            slimeCave.draw(this.ctx);
        }
        
        // Draw platforms
        if (zone.type === 'dungeon') {
            // Draw mossy slab platforms for dungeon
            for (let platform of this.platforms) {
                this.drawMossyPlatform(this.ctx, platform, zone.floor || 1);
            }
        } else {
            // Regular platforms for hub
            this.ctx.fillStyle = zone.platformColor;
            for (let platform of this.platforms) {
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // Platform edge highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(platform.x, platform.y, platform.width, 2);
                this.ctx.fillStyle = zone.platformColor;
            }
        }
        
        // Draw portals
        for (let portal of this.portals) {
            portal.draw(this.ctx);
        }
        
        // Draw NPCs
        this.npcManager.draw(this.ctx);
        
        // Draw portals
        if (this.previousPortal) {
            this.previousPortal.draw(this.ctx);
        }
        if (this.nextPortal) {
            this.nextPortal.draw(this.ctx);
        }
        
        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Draw projectiles
        this.projectileManager.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw drops
        this.dropManager.draw(this.ctx);
        
        // Draw particles
        this.particleSystem.draw(this.ctx);
        
        // Draw thunderstrike effect (on top of everything)
        this.drawThunderstrike(this.ctx);
        
        // Draw zone info - DISABLED (removed bottom-left zone indicator)
        // this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        // this.ctx.fillRect(10, GAME_CONFIG.height - 40, 300, 30);
        // this.ctx.fillStyle = '#fff';
        // this.ctx.font = '12px monospace';
        // 
        // let portalInfo = '';
        // if (this.nextPortal && this.nextPortal.locked) {
        //     let nextZoneId = this.getNextZone(zone);
        //     let nextZone = ZONES.find(z => z.id === nextZoneId);
        //     if (nextZone) {
        //         portalInfo = ` | Next: Level ${nextZone.requiredLevel} Required`;
        //     }
        // } else if (this.nextPortal && !this.nextPortal.locked) {
        //     portalInfo = ` | Next Portal: Unlocked!`;
        // }
        // this.ctx.fillText(`${zone.name}${portalInfo}`, 20, GAME_CONFIG.height - 17);
        // this.ctx.textAlign = 'left';
    }
    
    drawMossyPlatform(ctx, platform, floor) {
        // Color schemes for each floor
        const floorColors = {
            1: { base: '#3a5a3a', dark: '#2a4a2a', moss: '#4a8a4a', highlight: '#5a9a5a' },  // Green
            2: { base: '#3a4a5a', dark: '#2a3a4a', moss: '#4a7a9a', highlight: '#5a8aaa' },  // Blue
            3: { base: '#5a3a3a', dark: '#4a2a2a', moss: '#8a4a4a', highlight: '#9a5a5a' },  // Red
            4: { base: '#4a3a5a', dark: '#3a2a4a', moss: '#7a4a8a', highlight: '#8a5a9a' }   // Purple
        };
        
        const colors = floorColors[floor] || floorColors[1];
        
        // Base stone slab
        ctx.fillStyle = colors.base;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Stone texture (cracks and variations)
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        
        // Horizontal cracks
        const numCracks = Math.floor(platform.width / 60);
        for (let i = 0; i < numCracks; i++) {
            const x = platform.x + 20 + i * 60 + (Math.sin(platform.x + i) * 10);
            const y = platform.y + 4 + (Math.cos(platform.x + i) * 2);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 15 + Math.sin(i) * 5, y + Math.cos(i) * 2);
            ctx.stroke();
        }
        
        // Vertical cracks
        for (let i = 0; i < numCracks + 1; i++) {
            const x = platform.x + 40 * i + Math.sin(platform.y + i) * 8;
            ctx.beginPath();
            ctx.moveTo(x, platform.y);
            ctx.lineTo(x + Math.cos(i) * 2, platform.y + platform.height);
            ctx.stroke();
        }
        
        // Moss patches
        ctx.fillStyle = colors.moss;
        ctx.globalAlpha = 0.6;
        
        const mossPatches = Math.floor(platform.width / 40);
        for (let i = 0; i < mossPatches; i++) {
            const x = platform.x + 10 + i * 40 + Math.sin(platform.x + i * 10) * 15;
            const y = platform.y + Math.cos(platform.x + i * 5) * 3;
            const width = 15 + Math.sin(i) * 8;
            const height = 3 + Math.cos(i) * 2;
            
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.sin(i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        
        // Moss on edges
        ctx.fillStyle = colors.moss;
        ctx.globalAlpha = 0.4;
        // Top edge moss
        for (let i = 0; i < platform.width; i += 8) {
            if (Math.sin(platform.x + i) > 0.3) {
                ctx.fillRect(platform.x + i, platform.y, 4, 1);
            }
        }
        // Bottom edge moss
        for (let i = 0; i < platform.width; i += 10) {
            if (Math.cos(platform.x + i) > 0.4) {
                ctx.fillRect(platform.x + i, platform.y + platform.height - 1, 5, 1);
            }
        }
        ctx.globalAlpha = 1;
        
        // Stone highlight (top edge)
        ctx.fillStyle = colors.highlight;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(platform.x, platform.y, platform.width, 2);
        ctx.globalAlpha = 1;
        
        // Dark bottom edge
        ctx.fillStyle = colors.dark;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
        ctx.globalAlpha = 1;
        
        // Darker side edges for depth
        ctx.fillStyle = colors.dark;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(platform.x, platform.y, 2, platform.height);
        ctx.fillRect(platform.x + platform.width - 2, platform.y, 2, platform.height);
        ctx.globalAlpha = 1;
    }
    
    loop() {
        let currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 100) this.deltaTime = 100;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.loop());
    }

    saveGame() {
        SaveManager.save({
            player: {
                x: this.player.x,
                y: this.player.y,
                hp: this.player.hp,
                xp: this.player.xp,
                level: this.player.level,
                coins: this.player.coins,
                materials: this.player.materials,
                statUpgrades: this.player.statUpgrades,
                gear: this.player.gear,
                craftedGear: this.player.craftedGear,
                questProgress: this.player.questProgress
            },
            currentZone: this.currentZone,
            inventory: this.ui.inventorySlots
        });
    }
    
    loadGame() {
        let data = SaveManager.load();
        if (data && data.player) {
            this.player.x = data.player.x;
            this.player.y = data.player.y;
            this.player.hp = data.player.hp;
            this.player.xp = data.player.xp;
            this.player.level = data.player.level;
            this.player.coins = data.player.coins;
            this.player.materials = data.player.materials;
            this.player.statUpgrades = data.player.statUpgrades;
            this.player.gear = data.player.gear;
            this.player.craftedGear = data.player.craftedGear || { weapon: 0, armor: 0, trinket: 0, boots: 0 };
            this.player.questProgress = data.player.questProgress;
            this.player.recalculateStats();
            
            if (data.currentZone) {
                this.currentZone = data.currentZone;
            }
            
            // Load inventory
            if (data.inventory) {
                this.ui.inventorySlots = data.inventory;
                this.ui.renderInventory();
            }
            
            console.log('Game loaded from save');
        }
    }
    
    castThunderstrike() {
        if (!this.player.castThunderstrike()) {
            return;
        }
        
        // Create thunderstrike effect
        const playerCenterX = this.player.x + this.player.width / 2;
        
        this.thunderstrikeEffect = {
            x: playerCenterX,
            startY: 0,
            endY: this.canvas.height,
            time: 0,
            duration: 800,
            bolts: [],
            hitEnemies: new Set()
        };
        
        // Generate lightning bolt paths
        for (let i = 0; i < 3; i++) {
            const bolt = this.generateLightningBolt(
                playerCenterX + (i - 1) * 60,
                0,
                playerCenterX + (i - 1) * 60 + (Math.random() - 0.5) * 40,
                this.canvas.height - 50
            );
            this.thunderstrikeEffect.bolts.push(bolt);
        }
        
        // Play sound effect (if available)
        if (window.soundManager) {
            window.soundManager.play('lightning');
        }
        
        // Calculate damage (base + small scaling from player damage)
        const baseDamage = this.player.spells.thunderstrike.damage;
        const bonusDamage = Math.floor(this.player.stats.damage * 0.3);
        const totalDamage = baseDamage + bonusDamage;
        
        // Damage all enemies on screen
        for (let enemy of this.enemies) {
            if (enemy.alive) {
                // Apply lightning damage
                enemy.takeDamage(totalDamage, false);
                
                // Show blue lightning damage
                if (this.ui) {
                    this.ui.showDamage(
                        enemy.x + enemy.width / 2,
                        enemy.y,
                        totalDamage,
                        false,
                        '#64B4FF' // Blue lightning color
                    );
                }
                
                // Spawn lightning particles on enemy
                for (let j = 0; j < 5; j++) {
                    this.particleSystem.emit(
                        enemy.x + Math.random() * enemy.width,
                        enemy.y + Math.random() * enemy.height,
                        2,
                        '#64B4FF'
                    );
                }
            }
        }
    }
    
    generateLightningBolt(startX, startY, endX, endY) {
        const points = [{ x: startX, y: startY }];
        const segments = 12;
        const dx = (endX - startX) / segments;
        const dy = (endY - startY) / segments;
        
        for (let i = 1; i < segments; i++) {
            const jitter = (Math.random() - 0.5) * 60;
            points.push({
                x: startX + dx * i + jitter,
                y: startY + dy * i
            });
        }
        
        points.push({ x: endX, y: endY });
        
        // Generate branches
        const branches = [];
        for (let i = 2; i < points.length - 2; i += 3) {
            if (Math.random() > 0.4) {
                const branchPoints = [];
                const branchLength = 3 + Math.floor(Math.random() * 3);
                let bx = points[i].x;
                let by = points[i].y;
                const direction = Math.random() > 0.5 ? 1 : -1;
                
                branchPoints.push({ x: bx, y: by });
                for (let j = 0; j < branchLength; j++) {
                    bx += direction * (15 + Math.random() * 20);
                    by += 20 + Math.random() * 15;
                    branchPoints.push({ x: bx, y: by });
                }
                branches.push(branchPoints);
            }
        }
        
        return { points, branches };
    }
    
    updateThunderstrike(deltaTime) {
        if (!this.thunderstrikeEffect) return;
        
        this.thunderstrikeEffect.time += deltaTime;
        
        if (this.thunderstrikeEffect.time >= this.thunderstrikeEffect.duration) {
            this.thunderstrikeEffect = null;
        }
    }
    
    drawThunderstrike(ctx) {
        if (!this.thunderstrikeEffect) return;
        
        const effect = this.thunderstrikeEffect;
        const progress = effect.time / effect.duration;
        const alpha = progress < 0.3 ? 1 : 1 - ((progress - 0.3) / 0.7);
        
        ctx.save();
        
        // Draw screen flash at start
        if (progress < 0.1) {
            ctx.fillStyle = `rgba(100, 180, 255, ${0.3 * (1 - progress / 0.1)})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw each bolt
        for (let bolt of effect.bolts) {
            // Main bolt glow
            ctx.strokeStyle = `rgba(100, 180, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this.drawLightningPath(ctx, bolt.points);
            
            // Medium glow
            ctx.strokeStyle = `rgba(150, 200, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 8;
            this.drawLightningPath(ctx, bolt.points);
            
            // Core
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 3;
            this.drawLightningPath(ctx, bolt.points);
            
            // Draw branches
            for (let branch of bolt.branches) {
                ctx.strokeStyle = `rgba(100, 180, 255, ${alpha * 0.4})`;
                ctx.lineWidth = 6;
                this.drawLightningPath(ctx, branch);
                
                ctx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.7})`;
                ctx.lineWidth = 2;
                this.drawLightningPath(ctx, branch);
            }
        }
        
        // Ground impact effect
        if (progress < 0.5) {
            const impactAlpha = (1 - progress / 0.5) * alpha;
            const impactRadius = 50 + progress * 100;
            
            for (let bolt of effect.bolts) {
                const endPoint = bolt.points[bolt.points.length - 1];
                
                const gradient = ctx.createRadialGradient(
                    endPoint.x, endPoint.y, 0,
                    endPoint.x, endPoint.y, impactRadius
                );
                gradient.addColorStop(0, `rgba(100, 180, 255, ${impactAlpha * 0.8})`);
                gradient.addColorStop(0.5, `rgba(100, 180, 255, ${impactAlpha * 0.3})`);
                gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(endPoint.x, endPoint.y, impactRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    drawLightningPath(ctx, points) {
        if (points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
