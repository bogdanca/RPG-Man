// UI Manager

class GameUI {
    constructor(game) {
        this.game = game;
        this.processingAction = false; // Prevent spam-clicking
        
        // UI Elements
        this.hpBar = document.getElementById('hp-bar');
        this.hpText = document.getElementById('hp-text');
        this.xpBar = document.getElementById('xp-bar');
        this.xpText = document.getElementById('xp-text');
        this.levelText = document.getElementById('level-text');
        this.coinsText = document.getElementById('coins-text');
        this.materialsText = document.getElementById('materials-text');
        
        this.damageNumbersContainer = document.getElementById('damage-numbers');
        this.notificationsContainer = document.getElementById('notifications');
        
        // Tooltip
        this.tooltip = document.getElementById('item-tooltip');
        this.tooltipName = document.getElementById('tooltip-name');
        this.tooltipType = document.getElementById('tooltip-type');
        this.tooltipStats = document.getElementById('tooltip-stats');
        this.setupTooltips();
        
        // Death screen
        this.deathScreen = document.getElementById('death-screen');
        this.tryAgainBtn = document.getElementById('try-again-btn');
        this.setupDeathScreenListener();
        
        // Panel system
        this.panels = {
            'character-panel': document.getElementById('character-panel'),
            'upgrade-panel': document.getElementById('upgrade-panel'),
            'blacksmith-panel': document.getElementById('blacksmith-panel'),
            'quests-panel': document.getElementById('quests-panel'),
            'potion-shop-panel': document.getElementById('potion-shop-panel')
        };
        this.currentPanel = null;
        
        // Setup event listeners
        this.setupPanelListeners();
        
        // Hub content containers
        this.statUpgradesContainer = document.getElementById('stat-upgrades');
        this.gearUpgradesContainer = document.getElementById('gear-upgrades');
        this.questsContainer = document.getElementById('quests');
        this.sellItemsContainer = document.getElementById('sell-items');
        this.potionShopContainer = document.getElementById('potion-shop-items');
        this.potionSellContainer = document.getElementById('potion-sell-items');
        
        // Setup blacksmith tabs
        this.setupBlacksmithTabs();
        this.setupPotionShopTabs();
        
        // Inventory system
        this.inventorySlots = [];
        this.draggedItem = null;
        this.newItemSlots = new Set(); // Track which slots have new items
        this.hasNewItems = false; // Track if bag has unopened new items
        this.initializeInventory();
        
        // Potion belt system
        this.potionBeltSlots = [null, null, null, null]; // 4 slots for potions
        this.potionBeltHintShown = localStorage.getItem('potionBeltHintShown') === 'true';
        this.potionBeltHint = document.getElementById('potion-belt-hint');
        this.activePotionsDisplay = document.getElementById('active-potions-display');
        
        // Debug: Check if element was found
        if (this.activePotionsDisplay) {
            console.log('✓ Active potions display element found');
        } else {
            console.error('✗ Active potions display element NOT found');
        }
        
        this.initializePotionBelt();
        this.setupPotionBeltHint();
        
        // Feature hints system
        this.hintsShown = {
            quests: localStorage.getItem('hintQuestsShown') === 'true',
            upgrades: localStorage.getItem('hintUpgradesShown') === 'true'
        };
        this.setupFeatureHints();
        
        // Debug system
        this.debugMode = false;
        this.setupDebugButton();
        
        // Tutorial system
        this.setupTutorial();
    }
    
    initializeInventory() {
        const inventoryGrid = document.getElementById('inventory-grid');
        inventoryGrid.innerHTML = '';
        
        // Create 16 inventory slots (4x4 grid)
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotIndex = i;
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('drop', (e) => this.onDrop(e));
            slot.addEventListener('dragleave', (e) => this.onDragLeave(e));
            inventoryGrid.appendChild(slot);
            this.inventorySlots[i] = null;
        }
        
        // Make equipment slots droppable
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('drop', (e) => this.onDropEquipment(e));
            slot.addEventListener('dragleave', (e) => this.onDragLeave(e));
        });
    }
    
    update() {
        let player = this.game.player;
        
        // Update HP bar
        let hpPercent = (player.hp / player.stats.maxHp) * 100;
        this.hpBar.style.width = hpPercent + '%';
        this.hpText.textContent = `${Math.ceil(player.hp)}/${player.stats.maxHp}`;
        
        // Update XP bar
        let requiredXP = XP_FORMULA(player.level);
        let xpPercent = (player.xp / requiredXP) * 100;
        this.xpBar.style.width = xpPercent + '%';
        this.xpText.textContent = `${player.xp}/${requiredXP}`;
        
        // Update stats display
        this.levelText.textContent = player.level;
        this.coinsText.textContent = player.coins;
        this.materialsText.textContent = player.materials;
        
        // Update active potions display
        this.updateActivePotionsDisplay();
        
        // Update current panel if open
        if (this.currentPanel === 'character-panel') {
            this.updateCharacterPanel();
            this.renderInventory();
        }
    }
    
    setupDeathScreenListener() {
        if (this.tryAgainBtn) {
            this.tryAgainBtn.addEventListener('click', () => {
                if (this.game && this.game.player) {
                    this.game.player.respawnFromDeath();
                }
            });
        }
    }
    
    setupBlacksmithTabs() {
        const tabs = document.querySelectorAll('.blacksmith-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and contents
                document.querySelectorAll('.blacksmith-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.blacksmith-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const tabName = tab.dataset.tab;
                const content = document.getElementById(`blacksmith-${tabName}-content`);
                if (content) {
                    content.classList.add('active');
                    
                    // Update sell panel when switching to it
                    if (tabName === 'sell') {
                        this.updateSellPanel();
                    }
                }
            });
        });
    }
    
    setupPotionShopTabs() {
        const potionPanel = document.getElementById('potion-shop-panel');
        if (!potionPanel) return;
        
        const tabs = potionPanel.querySelectorAll('.blacksmith-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and contents in potion shop
                potionPanel.querySelectorAll('.blacksmith-tab').forEach(t => t.classList.remove('active'));
                potionPanel.querySelectorAll('.blacksmith-tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const tabName = tab.dataset.tab;
                const content = document.getElementById(`${tabName}-content`);
                if (content) {
                    content.classList.add('active');
                    
                    // Update panels when switching
                    if (tabName === 'potion-sell') {
                        this.updatePotionSellPanel();
                    } else if (tabName === 'potion-buy') {
                        this.updatePotionShop();
                    }
                }
            });
        });
    }
    
    setupPanelListeners() {
        // Panel icon buttons
        const panelIcons = document.querySelectorAll('.panel-icon');
        panelIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const panelId = icon.getAttribute('data-panel');
                this.togglePanel(panelId);
            });
        });
        
        // Close buttons
        const closeButtons = document.querySelectorAll('.close-panel');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const panelId = btn.getAttribute('data-panel');
                this.closePanel(panelId);
            });
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.currentPanel) {
                const panelElement = this.panels[this.currentPanel];
                const panelIcons = document.getElementById('panel-icons');
                
                if (!panelElement.contains(e.target) && !panelIcons.contains(e.target)) {
                    this.closePanel(this.currentPanel);
                }
            }
        });
        
        // Prevent clicks inside panels from closing
        Object.values(this.panels).forEach(panel => {
            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    togglePanel(panelId) {
        if (this.currentPanel === panelId) {
            this.closePanel(panelId);
        } else {
            this.openPanel(panelId);
        }
    }
    
    openPanel(panelId) {
        // Close any open panel first
        if (this.currentPanel) {
            this.closePanel(this.currentPanel);
        }
        
        // Open new panel
        const panel = this.panels[panelId];
        if (panel) {
            panel.classList.remove('hidden');
            this.currentPanel = panelId;
            
            // Clear "NEW" badge when opening inventory
            if (panelId === 'character-panel' && this.hasNewItems) {
                this.hasNewItems = false;
                this.updateBagIndicator();
            }
            
            // Remove feature hints when panels are opened
            if (panelId === 'quests-panel' && !this.hintsShown.quests) {
                this.hintsShown.quests = true;
                localStorage.setItem('hintQuestsShown', 'true');
                this.updateFeatureHints();
            }
            if (panelId === 'upgrade-panel' && !this.hintsShown.upgrades) {
                this.hintsShown.upgrades = true;
                localStorage.setItem('hintUpgradesShown', 'true');
                this.updateFeatureHints();
            }
            
            // Pause game when panel opens
            this.game.paused = true;
            
            // Set active state on icon
            const icon = document.querySelector(`.panel-icon[data-panel="${panelId}"]`);
            if (icon) icon.classList.add('active');
            
            // Update panel content
            this.updatePanelContent(panelId);
        }
    }
    
    closePanel(panelId) {
        const panel = this.panels[panelId];
        if (panel) {
            panel.classList.add('hidden');
            if (this.currentPanel === panelId) {
                this.currentPanel = null;
            }
            
            // Unpause game when panel closes
            this.game.paused = false;
            
            // Remove active state from icon
            const icon = document.querySelector(`.panel-icon[data-panel="${panelId}"]`);
            if (icon) icon.classList.remove('active');
        }
    }
    
    updatePanelContent(panelId) {
        switch(panelId) {
            case 'character-panel':
                this.updateCharacterPanel();
                this.renderInventory();
                break;
            case 'upgrade-panel':
                this.updateStatUpgrades();
                break;
            case 'blacksmith-panel':
                this.updateGearUpgrades();
                break;
            case 'quests-panel':
                this.updateQuests();
                break;
            case 'potion-shop-panel':
                this.updatePotionShop();
                break;
        }
    }
    
    updateStatUpgrades() {
        let player = this.game.player;
        this.statUpgradesContainer.innerHTML = '';
        
        for (let stat in STAT_UPGRADES) {
            let upgrade = STAT_UPGRADES[stat];
            let currentLevel = player.statUpgrades[stat];
            let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
            
            let currentValue = this.getStatValue(player, stat);
            let nextValue = currentValue + upgrade.increment;
            
            let div = document.createElement('div');
            div.className = 'upgrade-item';
            div.innerHTML = `
                <div><strong>${upgrade.name}</strong></div>
                <div>Level: ${currentLevel} → ${currentLevel + 1}</div>
                <div>Value: ${this.formatStatValue(stat, currentValue)} → ${this.formatStatValue(stat, nextValue)}</div>
                <button class="btn btn-small" onclick="window.game.upgradePlayerStat('${stat}')">
                    Upgrade (${cost} 💰)
                </button>
            `;
            
            this.statUpgradesContainer.appendChild(div);
        }
    }
    
    getStatValue(player, stat) {
        if (stat === 'maxHp') return player.stats.maxHp;
        if (stat === 'damage') return player.stats.damage;
        if (stat === 'defense') return player.stats.defense;
        if (stat === 'speed') return player.stats.speed;
        if (stat === 'critChance') return player.stats.critChance;
        return 0;
    }
    
    formatStatValue(stat, value) {
        if (stat === 'critChance') {
            return (value * 100).toFixed(1) + '%';
        }
        return value.toFixed(1);
    }
    
    updateGearUpgrades() {
        if (!this.gearUpgradesContainer) {
            console.error('Gear upgrades container not found');
            return;
        }
        
        let player = this.game.player;
        if (!player || !player.craftedGear) {
            console.error('Player or craftedGear not initialized');
            return;
        }
        
        this.gearUpgradesContainer.innerHTML = '';
        
        for (let slot in GEAR_SLOTS) {
            let gearData = GEAR_SLOTS[slot];
            // Use craftedGear to show next tier available after crafting
            let currentLevel = player.craftedGear[slot] || 0;
            let nextLevel = currentLevel + 1;
            
            if (nextLevel < gearData.levels.length) {
                let nextGear = gearData.levels[nextLevel];
                
                // Skip level 0 items (they're just placeholders)
                if (nextLevel === 0) {
                    continue;
                }
                
                let div = document.createElement('div');
                div.className = 'upgrade-item';
                
                let bonusText = this.getGearBonusText(nextGear);
                
                // Generate icon with error handling
                let iconDataUrl = '';
                try {
                    iconDataUrl = ItemIconGenerator.generateIcon(slot, nextLevel);
                } catch (e) {
                    console.error('Error generating icon:', e);
                    iconDataUrl = '';
                }
                
                div.innerHTML = `
                    <div class="upgrade-item-header">
                        ${iconDataUrl ? `<img src="${iconDataUrl}" class="upgrade-item-icon" style="width: 32px; height: 32px; image-rendering: pixelated;">` : ''}
                        <div>
                            <div><strong>${gearData.name}</strong></div>
                            <div>${nextGear.name}</div>
                        </div>
                    </div>
                    <div>${bonusText}</div>
                    <button class="btn btn-small" onclick="window.game.upgradePlayerGear('${slot}')">
                        Craft (${nextGear.coins} 💰, ${nextGear.materials} 🔧)
                    </button>
                `;
                
                this.gearUpgradesContainer.appendChild(div);
            } else {
                let div = document.createElement('div');
                div.className = 'upgrade-item';
                div.innerHTML = `
                    <div><strong>${gearData.name}</strong></div>
                    <div>✨ Max Level ✨</div>
                `;
                this.gearUpgradesContainer.appendChild(div);
            }
        }
    }
    
    getGearBonusText(gear) {
        let bonuses = [];
        if (gear.damage) bonuses.push(`+${gear.damage} DMG`);
        if (gear.defense) bonuses.push(`+${gear.defense} DEF`);
        if (gear.hp) bonuses.push(`+${gear.hp} HP`);
        if (gear.speed) bonuses.push(`+${gear.speed} SPD`);
        if (gear.critChance) bonuses.push(`+${(gear.critChance * 100).toFixed(0)}% CRIT`);
        return bonuses.join(', ');
    }
    
    updateSellPanel() {
        if (!this.sellItemsContainer) return;
        
        const player = this.game.player;
        this.sellItemsContainer.innerHTML = '';
        
        // Get all items from inventory (excluding empty slots)
        const sellableItems = this.inventorySlots
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item !== null);
        
        if (sellableItems.length === 0) {
            this.sellItemsContainer.innerHTML = `
                <div class="sell-item-empty">
                    <div style="font-size: 48px; margin-bottom: 10px;">👜</div>
                    <div>Your bag is empty!</div>
                    <div style="font-size: 12px; margin-top: 10px; color: #666;">Craft items at the Blacksmith to sell them here</div>
                </div>
            `;
            return;
        }
        
        sellableItems.forEach(({ item, index }) => {
            const gearData = GEAR_SLOTS[item.slot].levels[item.level];
            const craftingCost = gearData.coins + gearData.materials;
            const sellValue = Math.floor(craftingCost * 0.3);
            
            // Generate icon
            let iconDataUrl = '';
            try {
                iconDataUrl = ItemIconGenerator.generateIcon(item.slot, item.level);
            } catch (e) {
                iconDataUrl = '';
            }
            
            const div = document.createElement('div');
            div.className = 'sell-item';
            div.innerHTML = `
                <div class="sell-item-info">
                    ${iconDataUrl ? `<img src="${iconDataUrl}" class="sell-item-icon">` : ''}
                    <div class="sell-item-details">
                        <div class="sell-item-name">${gearData.name}</div>
                        <div class="sell-item-type">${GEAR_SLOTS[item.slot].name}</div>
                        <div class="sell-item-value">Crafting Value: ${craftingCost} → Sell: <span style="color: #4CAF50; font-weight: bold;">${sellValue} coins</span></div>
                    </div>
                </div>
                <div class="sell-item-action">
                    <div class="sell-item-price">💰 ${sellValue}</div>
                    <div class="sell-item-hint">CLICK TO SELL</div>
                </div>
            `;
            
            // Add hover effect to show selling action
            div.addEventListener('mouseenter', () => {
                div.style.background = 'linear-gradient(90deg, rgba(76, 175, 80, 0.2), rgba(255, 215, 0, 0.15))';
            });
            
            div.addEventListener('mouseleave', () => {
                div.style.background = '';
            });
            
            div.addEventListener('click', () => {
                this.sellItem(index, gearData.name, sellValue);
            });
            
            this.sellItemsContainer.appendChild(div);
        });
    }
    
    updatePotionShop() {
        if (!this.potionShopContainer) return;
        
        const player = this.game.player;
        this.potionShopContainer.innerHTML = '';
        
        // Display all available potions
        for (let potionId in POTIONS) {
            const potion = POTIONS[potionId];
            
            const div = document.createElement('div');
            div.className = 'potion-item';
            
            // Create potion icon with color
            const iconHTML = `
                <div class="potion-icon">
                    <div class="potion-icon-cork"></div>
                    <div class="potion-icon-bottle"></div>
                    <div style="position: absolute; top: 20%; left: 15%; width: 70%; height: 60%; background: ${potion.color}; opacity: 0.8; border-radius: 0 0 50% 50%;"></div>
                </div>
            `;
            
            div.innerHTML = `
                <div class="potion-item-info">
                    ${iconHTML}
                    <div class="potion-details">
                        <div class="potion-name">${potion.name}</div>
                        <div class="potion-description">${potion.description}</div>
                    </div>
                </div>
                <div class="potion-action">
                    <div class="potion-price">💰 ${potion.price}</div>
                    <div class="potion-hint">CLICK TO BUY</div>
                </div>
            `;
            
            // Check if player can afford
            if (player.coins < potion.price) {
                div.style.opacity = '0.5';
                div.style.cursor = 'not-allowed';
            } else {
                div.addEventListener('click', () => {
                    this.buyPotion(potionId, potion);
                });
            }
            
            this.potionShopContainer.appendChild(div);
        }
    }
    
    updatePotionSellPanel() {
        if (!this.potionSellContainer) return;
        
        const player = this.game.player;
        this.potionSellContainer.innerHTML = '';
        
        // Filter inventory for potions only
        const potionsInInventory = [];
        this.inventorySlots.forEach((item, index) => {
            if (item && item.isPotion) {
                potionsInInventory.push({ item, index });
            }
        });
        
        if (potionsInInventory.length === 0) {
            this.potionSellContainer.innerHTML = '<div class="sell-item-empty">No potions in your bag to sell</div>';
            return;
        }
        
        // Display each potion with sell option
        potionsInInventory.forEach(({ item, index }) => {
            const potion = POTIONS[item.potionId];
            const sellValue = Math.floor(potion.price * 0.3);
            
            const div = document.createElement('div');
            div.className = 'sell-item';
            
            // Create potion icon
            const iconHTML = `
                <div class="potion-icon-small">
                    <div class="potion-icon-cork"></div>
                    <div class="potion-icon-bottle"></div>
                    <div style="position: absolute; top: 20%; left: 15%; width: 70%; height: 60%; background: ${item.color}; opacity: 0.8; border-radius: 0 0 50% 50%;"></div>
                </div>
            `;
            
            div.innerHTML = `
                <div class="sell-item-icon">${iconHTML}</div>
                <div class="sell-item-info">
                    <div class="sell-item-name">${item.name} x${item.quantity}</div>
                    <div class="sell-item-value">
                        <span style="color: #888; text-decoration: line-through; font-size: 11px;">Value: ${potion.price}</span>
                        <span style="color: #FFD700; font-weight: bold; font-size: 13px;"> → Sell: ${sellValue}</span>
                    </div>
                </div>
                <div class="sell-item-action">
                    <div class="sell-item-price">💰 ${sellValue}</div>
                    <div class="sell-item-hint">CLICK TO SELL</div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                this.sellPotion(index, item.name, sellValue, item.quantity);
            });
            
            this.potionSellContainer.appendChild(div);
        });
    }
    
    sellPotion(inventoryIndex, potionName, sellValue, quantity) {
        const confirmMessage = 
            `💰 SELL POTION FROM YOUR BAG?\n\n` +
            `Potion: ${potionName} x${quantity}\n` +
            `Sell Price: ${sellValue} coins (per potion)\n` +
            `Total: ${sellValue * quantity} coins\n\n` +
            `This will:\n` +
            `✓ Remove ${quantity} potion(s) from your bag\n` +
            `✓ Give you ${sellValue * quantity} coins\n\n` +
            `Proceed with sale?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        const player = this.game.player;
        const item = this.inventorySlots[inventoryIndex];
        
        if (!item || !item.isPotion) {
            this.showNotification('Potion not found!', 'damage');
            return;
        }
        
        // Give coins for entire stack
        const totalCoins = sellValue * item.quantity;
        player.coins += totalCoins;
        
        // Remove from inventory
        this.inventorySlots[inventoryIndex] = null;
        
        // Remove from belt if it's there
        this.potionBeltSlots.forEach((beltPotion, i) => {
            if (beltPotion && beltPotion.potionId === item.potionId) {
                this.potionBeltSlots[i] = null;
            }
        });
        
        // Update UI
        this.updatePotionSellPanel();
        this.renderInventory();
        this.renderPotionBelt();
        this.game.saveGame();
        
        // Show notification
        this.showNotification(`Sold ${potionName} x${item.quantity} for ${totalCoins} coins! (💰 +${totalCoins})`, 'item');
        
        // Play coin sound
        if (window.soundManager) {
            window.soundManager.play('coin');
        }
    }
    
    buyPotion(potionId, potion) {
        const player = this.game.player;
        
        // Check if player can afford
        if (player.coins < potion.price) {
            this.showNotification('Not enough coins!', 'damage');
            return;
        }
        
        // Check if inventory has space (or if there's a stack with room)
        const canAddPotion = this.canAddPotionToInventory(potionId);
        if (!canAddPotion) {
            this.showNotification('Inventory Full! (Max 5 per stack)', 'damage');
            return;
        }
        
        // Deduct coins
        player.coins -= potion.price;
        
        // Add potion to inventory with stacking
        this.addPotionToInventory(potionId, potion.name, true);
        
        // Update UI
        this.updatePotionShop();
        this.renderPotionBelt(); // Update belt quantity display
        this.game.saveGame();
        
        // Show notification
        this.showNotification(`Purchased ${potion.name}!`, 'item');
        
        // Show tutorial hint on first purchase
        this.showPotionBeltHint();
        
        // Play coin sound
        if (window.soundManager) {
            window.soundManager.play('coin');
        }
    }
    
    canAddPotionToInventory(potionId) {
        // Check if there's an existing stack with room (< 5)
        const existingStack = this.inventorySlots.find(item => 
            item && item.potionId === potionId && item.quantity < 5
        );
        
        if (existingStack) return true;
        
        // Otherwise check if there's an empty slot
        return this.inventorySlots.some(slot => slot === null);
    }
    
    addPotionToInventory(potionId, potionName, animate = false) {
        const potion = POTIONS[potionId];
        
        // Try to add to existing stack first
        const existingStackIndex = this.inventorySlots.findIndex(item =>
            item && item.potionId === potionId && item.quantity < 5
        );
        
        if (existingStackIndex !== -1) {
            // Add to existing stack
            this.inventorySlots[existingStackIndex].quantity++;
            
            if (animate) {
                this.newItemSlots.add(existingStackIndex);
            }
            
            this.renderInventory();
            return true;
        }
        
        // Otherwise create new stack in empty slot
        const emptySlotIndex = this.inventorySlots.findIndex(s => s === null);
        
        if (emptySlotIndex === -1) {
            this.showNotification('Inventory Full!', 'damage');
            return false;
        }
        
        this.inventorySlots[emptySlotIndex] = {
            potionId: potionId,
            name: potionName,
            quantity: 1,
            isPotion: true,
            color: potion.color
        };
        
        if (animate) {
            this.newItemSlots.add(emptySlotIndex);
        }
        
        this.renderInventory();
        return true;
    }
    
    initializePotionBelt() {
        const beltSlots = document.querySelectorAll('.potion-belt-slot');
        
        beltSlots.forEach((slot, index) => {
            // Allow dropping potions onto belt slots
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                this.onDropToBelt(e, index);
            });
            
            // Click to use potion
            slot.addEventListener('click', () => {
                this.usePotionFromBelt(index);
            });
        });
    }
    
    setupPotionBeltHint() {
        if (!this.potionBeltHint) return;
        
        // Add click handler to "Got it!" button
        const closeBtn = this.potionBeltHint.querySelector('.hint-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.hidePotionBeltHint();
            });
        }
    }
    
    showPotionBeltHint() {
        // Only show if not shown before
        if (this.potionBeltHintShown || !this.potionBeltHint) return;
        
        this.potionBeltHint.classList.remove('hidden');
        this.potionBeltHintShown = true;
        localStorage.setItem('potionBeltHintShown', 'true');
    }
    
    hidePotionBeltHint() {
        if (!this.potionBeltHint) return;
        this.potionBeltHint.classList.add('hidden');
    }
    
    onDropToBelt(e, beltSlotIndex) {
        if (!this.draggedItem) return;
        
        const item = this.draggedItem.item;
        
        // Only potions can be added to belt
        if (!item.isPotion) {
            this.showNotification('Only potions can be added to belt!', 'damage');
            return;
        }
        
        // Add potion to belt
        this.potionBeltSlots[beltSlotIndex] = {
            potionId: item.potionId,
            name: item.name,
            color: item.color,
            inventoryIndex: this.draggedItem.sourceIndex
        };
        
        this.renderPotionBelt();
        this.showNotification(`${item.name} added to slot ${beltSlotIndex + 1}`, 'item');
        
        // Hide hint since player learned the mechanic
        this.hidePotionBeltHint();
    }
    
    renderPotionBelt() {
        const beltSlots = document.querySelectorAll('.potion-belt-slot');
        
        this.potionBeltSlots.forEach((potion, index) => {
            const slot = beltSlots[index];
            
            // Clear slot
            const existingIcon = slot.querySelector('.belt-potion-icon');
            if (existingIcon) {
                existingIcon.remove();
            }
            
            // Clear quantity badge
            const existingBadge = slot.querySelector('.belt-quantity');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            if (potion) {
                slot.classList.add('has-potion');
                
                // Find quantity in inventory
                const inventoryItem = this.inventorySlots.find(item => 
                    item && item.isPotion && item.potionId === potion.potionId
                );
                const quantity = inventoryItem ? inventoryItem.quantity : 0;
                
                // Create potion icon
                const potionDiv = document.createElement('div');
                potionDiv.className = 'belt-potion-icon';
                potionDiv.innerHTML = `
                    <div class="potion-icon-small">
                        <div class="potion-icon-cork"></div>
                        <div class="potion-icon-bottle"></div>
                        <div style="position: absolute; top: 20%; left: 15%; width: 70%; height: 60%; background: ${potion.color}; opacity: 0.8; border-radius: 0 0 50% 50%;"></div>
                    </div>
                `;
                slot.appendChild(potionDiv);
                
                // Add quantity badge
                if (quantity > 0) {
                    const quantityBadge = document.createElement('div');
                    quantityBadge.className = 'belt-quantity';
                    quantityBadge.textContent = quantity;
                    slot.appendChild(quantityBadge);
                }
            } else {
                slot.classList.remove('has-potion');
            }
        });
    }
    
    usePotionFromBelt(beltSlotIndex) {
        const beltPotion = this.potionBeltSlots[beltSlotIndex];
        if (!beltPotion) return;
        
        // Find the inventory item
        const inventoryItem = this.inventorySlots.find(item => 
            item && item.isPotion && item.potionId === beltPotion.potionId
        );
        
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            // Remove from belt if no longer in inventory
            this.potionBeltSlots[beltSlotIndex] = null;
            this.renderPotionBelt();
            this.showNotification('No potions left!', 'damage');
            return;
        }
        
        // Use the potion
        const player = this.game.player;
        const success = player.usePotion(beltPotion.potionId);
        
        if (success) {
            // Decrease quantity in inventory
            inventoryItem.quantity--;
            
            // Remove from inventory if quantity reaches 0
            if (inventoryItem.quantity <= 0) {
                const inventoryIndex = this.inventorySlots.indexOf(inventoryItem);
                this.inventorySlots[inventoryIndex] = null;
                
                // Remove from belt too
                this.potionBeltSlots[beltSlotIndex] = null;
            }
            
            this.renderInventory();
            this.renderPotionBelt();
            this.game.saveGame();
        }
    }
    
    usePotionFromInventory(inventoryIndex) {
        const item = this.inventorySlots[inventoryIndex];
        
        // Verify this is a potion
        if (!item || !item.isPotion || !item.potionId) {
            this.showNotification('Not a valid potion!', 'damage');
            return;
        }
        
        // Check if there's quantity available
        if (item.quantity <= 0) {
            this.showNotification('No potions left in this stack!', 'damage');
            return;
        }
        
        const player = this.game.player;
        const success = player.usePotion(item.potionId);
        
        if (success) {
            // Decrease quantity by 1
            item.quantity--;
            
            if (item.quantity <= 0) {
                // Remove from inventory
                this.inventorySlots[inventoryIndex] = null;
                
                // Remove from belt if it's there
                this.potionBeltSlots.forEach((beltPotion, i) => {
                    if (beltPotion && beltPotion.potionId === item.potionId) {
                        this.potionBeltSlots[i] = null;
                    }
                });
            }
            
            this.renderInventory();
            this.renderPotionBelt(); // Update belt quantity display
            this.game.saveGame();
        }
    }
    
    sellItem(inventoryIndex, itemName, sellValue) {
        // Enhanced confirmation with clear details
        const confirmMessage = 
            `💰 SELL ITEM FROM YOUR BAG?\n\n` +
            `Item: ${itemName}\n` +
            `Sell Price: ${sellValue} coins\n\n` +
            `This will:\n` +
            `✓ Remove item from your bag\n` +
            `✓ Give you ${sellValue} coins\n\n` +
            `Proceed with sale?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Remove item from inventory
        this.inventorySlots[inventoryIndex] = null;
        
        // Give player coins
        const previousCoins = this.game.player.coins;
        this.game.player.coins += sellValue;
        
        // Update UI
        this.updateSellPanel();
        this.renderInventory();
        this.game.saveGame();
        
        // Show detailed notification
        this.showNotification(`💰 Sold ${itemName} for ${sellValue} coins! (${previousCoins} → ${this.game.player.coins})`, 'coins');
        
        // Play coin sound
        if (window.soundManager) {
            window.soundManager.play('coin');
        }
    }
    
    setupTooltips() {
        // Add event listeners for showing tooltips on item hover
        document.addEventListener('mousemove', (e) => {
            const target = e.target.closest('.inventory-slot, .equipment-slot');
            if (target && (target.classList.contains('has-item') || target.classList.contains('equipped'))) {
                this.showTooltip(target, e.clientX, e.clientY);
            } else {
                this.hideTooltip();
            }
        });
    }
    
    showTooltip(element, x, y) {
        // Get item data from element
        const slotType = element.dataset.slot;
        const itemType = element.dataset.itemType;
        const itemLevel = parseInt(element.dataset.itemLevel || 0);
        
        if (!itemType || itemLevel === 0) {
            this.hideTooltip();
            return;
        }
        
        // Get gear data
        const gearData = GEAR_SLOTS[itemType].levels[itemLevel];
        if (!gearData) {
            this.hideTooltip();
            return;
        }
        
        // Populate tooltip
        this.tooltipName.textContent = gearData.name;
        this.tooltipType.textContent = GEAR_SLOTS[itemType].name;
        
        // Build stats display
        let statsHTML = '';
        if (gearData.damage) statsHTML += `<div class="tooltip-stat positive">⚔️ +${gearData.damage} Damage</div>`;
        if (gearData.defense) statsHTML += `<div class="tooltip-stat positive">🛡️ +${gearData.defense} Defense</div>`;
        if (gearData.hp) statsHTML += `<div class="tooltip-stat positive">❤️ +${gearData.hp} Max HP</div>`;
        if (gearData.speed) statsHTML += `<div class="tooltip-stat positive">⚡ +${gearData.speed} Speed</div>`;
        if (gearData.critChance) statsHTML += `<div class="tooltip-stat positive">✨ +${(gearData.critChance * 100).toFixed(0)}% Crit Chance</div>`;
        
        this.tooltipStats.innerHTML = statsHTML;
        
        // Position tooltip
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y + 15) + 'px';
        this.tooltip.classList.add('visible');
    }
    
    hideTooltip() {
        this.tooltip.classList.remove('visible');
    }
    
    updateQuests() {
        let player = this.game.player;
        this.questsContainer.innerHTML = '';
        
        QUESTS.forEach(quest => {
            let progress = player.questProgress[quest.id];
            let completed = progress.completed;
            let current = progress.progress;
            let target = quest.target.count;
            
            let div = document.createElement('div');
            div.className = 'quest-item';
            
            if (completed) {
                div.innerHTML = `
                    <div><strong>${quest.name}</strong> ✅</div>
                    <div style="color: #2ecc71;">Completed!</div>
                `;
            } else {
                div.innerHTML = `
                    <div><strong>${quest.name}</strong></div>
                    <div>${quest.description}</div>
                    <div>Progress: ${current}/${target}</div>
                    <div style="font-size: 10px; color: #f39c12;">
                        Reward: ${quest.reward.xp} XP, ${quest.reward.coins} 💰
                    </div>
                `;
            }
            
            this.questsContainer.appendChild(div);
        });
    }
    
    showDamage(x, y, amount, isCrit) {
        let div = document.createElement('div');
        div.className = 'damage-number ' + (isCrit ? 'crit' : 'damage');
        div.textContent = isCrit ? `${amount}!` : amount;
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        
        this.damageNumbersContainer.appendChild(div);
        
        setTimeout(() => {
            div.remove();
        }, 1000);
    }
    showNotification(message, type = '') {
        let div = document.createElement('div');
        div.className = 'notification ' + type;
        div.textContent = message;
        
        this.notificationsContainer.appendChild(div);
        
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
    
    showXPGain(x, y, amount) {
        // Show XP under the XP bar
        const xpIndicator = document.getElementById('xp-gain-indicator');
        if (xpIndicator) {
            // Update text (if multiple XP gains happen, show the latest one)
            xpIndicator.textContent = `+${amount} XP`;
            
            // Remove existing animation class
            xpIndicator.classList.remove('show');
            
            // Force reflow to restart animation
            void xpIndicator.offsetWidth;
            
            // Add animation class
            xpIndicator.classList.add('show');
            
            // Remove class after animation completes
            setTimeout(() => {
                xpIndicator.classList.remove('show');
            }, 1000);
        }
    }
    
    updateActivePotionsDisplay() {
        if (!this.activePotionsDisplay) {
            console.warn('Active potions display element not found!');
            return;
        }
        
        const player = this.game.player;
        if (!player) return;
        
        // Check if player has active buffs
        if (!player.activeBuffs || player.activeBuffs.length === 0) {
            // Only clear if there are currently children
            if (this.activePotionsDisplay.children.length > 0) {
                this.activePotionsDisplay.innerHTML = '';
            }
            return;
        }
        
        // Only recreate if count changed - otherwise just update existing
        if (this.activePotionsDisplay.children.length !== player.activeBuffs.length) {
            // Clear and rebuild
            this.activePotionsDisplay.innerHTML = '';
            
            // Display each active buff
            player.activeBuffs.forEach((buff, index) => {
                const potionDiv = document.createElement('div');
                potionDiv.className = 'active-potion-item';
                potionDiv.dataset.buffIndex = index;
            
            // Calculate time remaining
            const totalDuration = POTIONS[buff.potionId]?.effect?.duration || 300000;
            const timeRemaining = Math.ceil(buff.duration / 1000); // Convert to seconds
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Calculate progress percentage
            const progressPercent = (buff.duration / totalDuration) * 100;
            
            // Create themed potion bottle icon
            potionDiv.innerHTML = `
                <div class="active-potion-icon">
                    <div class="potion-icon-small">
                        <div class="potion-icon-cork"></div>
                        <div class="potion-icon-bottle"></div>
                        <div class="potion-icon-liquid" style="background: ${buff.color};"></div>
                    </div>
                </div>
                <div class="active-potion-info">
                    <div class="active-potion-name">${buff.name}</div>
                    <div class="active-potion-timer">${timeText}</div>
                    <div class="active-potion-progress">
                        <div class="active-potion-progress-bar" style="width: ${progressPercent}%; background: linear-gradient(90deg, ${buff.color}, ${buff.color}CC); box-shadow: 0 0 8px ${buff.color}80;"></div>
                    </div>
                </div>
            `;
            
                this.activePotionsDisplay.appendChild(potionDiv);
            });
        } else {
            // Update existing elements (just timers and progress bars)
            player.activeBuffs.forEach((buff, index) => {
                const potionDiv = this.activePotionsDisplay.children[index];
                if (!potionDiv) return;
                
                const totalDuration = POTIONS[buff.potionId]?.effect?.duration || 300000;
                const timeRemaining = Math.ceil(buff.duration / 1000);
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                const progressPercent = (buff.duration / totalDuration) * 100;
                
                // Update only the timer and progress bar
                const timerElement = potionDiv.querySelector('.active-potion-timer');
                const progressElement = potionDiv.querySelector('.active-potion-progress-bar');
                
                if (timerElement) timerElement.textContent = timeText;
                if (progressElement) {
                    progressElement.style.width = `${progressPercent}%`;
                    progressElement.style.background = `linear-gradient(90deg, ${buff.color}, ${buff.color}CC)`;
                    progressElement.style.boxShadow = `0 0 8px ${buff.color}80`;
                }
            });
        }
    }
    
    showDeathScreen() {
        if (this.deathScreen) {
            this.deathScreen.classList.remove('hidden');
            this.game.paused = true;
        }
    }
    
    hideDeathScreen() {
        if (this.deathScreen) {
            this.deathScreen.classList.add('hidden');
            this.game.paused = false;
        }
    }
    
    updateCharacterPanel() {
        let player = this.game.player;
        
        // Update equipment slots in character panel
        for (let slot in GEAR_SLOTS) {
            let gearLevel = player.gear[slot];
            let gearData = GEAR_SLOTS[slot].levels[gearLevel];
            let slotElement = document.querySelector(`#character-panel [data-slot="${slot}"]`);
            let nameElement = document.getElementById(`${slot}-name-panel`);
            
            if (slotElement && nameElement) {
                nameElement.textContent = gearData.name;
                
                // Clear previous content
                const existingIcon = slotElement.querySelector('.equipment-icon');
                if (existingIcon) existingIcon.remove();
                
                // Update visual state and draggability
                if (gearLevel > 0) {
                    slotElement.classList.remove('empty');
                    slotElement.classList.add('equipped');
                    slotElement.draggable = true; // Allow dragging equipped items
                    
                    // Add item icon
                    const iconImg = document.createElement('img');
                    iconImg.className = 'equipment-icon';
                    iconImg.src = this.getItemIcon(slot, gearLevel);
                    iconImg.style.imageRendering = 'pixelated';
                    iconImg.style.width = '32px';
                    iconImg.style.height = '32px';
                    
                    // Fallback to emoji if icon fails
                    iconImg.onerror = () => {
                        iconImg.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'equipment-icon';
                        fallback.style.fontSize = '24px';
                        const emojiMap = { weapon: '⚔️', armor: '🛡️', trinket: '💍', boots: '👢' };
                        fallback.textContent = emojiMap[slot] || '📦';
                        slotElement.appendChild(fallback);
                    };
                    
                    slotElement.appendChild(iconImg);
                    
                    // Add dragstart handler for equipped items
                    slotElement.ondragstart = (e) => {
                        this.draggedItem = {
                            item: {
                                slot: slot,
                                level: gearLevel,
                                name: gearData.name,
                                icon: this.getItemIcon(slot, gearLevel)
                            },
                            sourceSlot: slotElement,
                            fromEquipment: true,
                            equipmentSlotType: slot
                        };
                        slotElement.classList.add('dragging');
                    };
                    
                    // Add double-click handler for equipped items
                    slotElement.ondblclick = (e) => {
                        this.onDoubleClickEquipment(slot, gearLevel, gearData.name);
                    };
                    
                    // Add data attributes for tooltip
                    slotElement.dataset.itemType = slot;
                    slotElement.dataset.itemLevel = gearLevel;
                } else {
                    slotElement.classList.add('empty');
                    slotElement.classList.remove('equipped');
                    slotElement.draggable = false; // Can't drag empty slots
                    slotElement.ondragstart = null; // Remove drag handler
                    slotElement.ondblclick = null; // Remove double-click handler
                    
                    // Remove tooltip data
                    delete slotElement.dataset.itemType;
                    delete slotElement.dataset.itemLevel;
                }
            }
        }
        
        // Update stat displays in character panel
        document.getElementById('stat-damage-panel').textContent = player.stats.damage;
        document.getElementById('stat-defense-panel').textContent = player.stats.defense;
        document.getElementById('stat-hp-panel').textContent = player.stats.maxHp;
        document.getElementById('stat-speed-panel').textContent = player.stats.speed.toFixed(1);
        document.getElementById('stat-crit-panel').textContent = (player.stats.critChance * 100).toFixed(1) + '%';
    }
    
    // Drag and Drop Handlers
    onDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }
    
    onDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    onDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const targetSlotIndex = parseInt(e.currentTarget.dataset.slotIndex);
        
        if (!this.draggedItem) return;
        
        // Check if dragging from equipment slot
        if (this.draggedItem.fromEquipment) {
            const player = this.game.player;
            const slotType = this.draggedItem.equipmentSlotType;
            
            // Unequip the item and put it in inventory
            const targetItem = this.inventorySlots[targetSlotIndex];
            this.inventorySlots[targetSlotIndex] = this.draggedItem.item;
            
            // If target slot had an item, it stays there (no swap for unequipping)
            // Clear the equipment slot
            player.gear[slotType] = 0;
            player.recalculateStats();
            
            this.draggedItem.sourceSlot.classList.remove('dragging');
            this.draggedItem = null;
            
            this.renderInventory();
            this.updateCharacterPanel();
            this.showNotification('Item unequipped!', 'item');
            this.game.saveGame();
        } else if (targetSlotIndex !== this.draggedItem.sourceIndex) {
            // Normal inventory slot to inventory slot drag
            const targetItem = this.inventorySlots[targetSlotIndex];
            const sourceIndex = this.draggedItem.sourceIndex;
            
            this.inventorySlots[targetSlotIndex] = this.draggedItem.item;
            this.inventorySlots[sourceIndex] = targetItem;
            
            this.draggedItem.sourceSlot.classList.remove('dragging');
            this.draggedItem = null;
            this.renderInventory();
        }
    }
    
    onDropEquipment(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (!this.draggedItem) return;
        
        const targetSlotType = e.currentTarget.dataset.slot;
        const item = this.draggedItem.item;
        
        // Check if item matches slot type
        if (item.slot === targetSlotType) {
            const player = this.game.player;
            const currentEquippedLevel = player.gear[targetSlotType];
            
            // Check if there's already an item equipped in this slot
            if (currentEquippedLevel > 0) {
                // Swap: Put currently equipped item back into inventory
                const currentEquippedData = GEAR_SLOTS[targetSlotType].levels[currentEquippedLevel];
                
                const oldEquippedItem = {
                    slot: targetSlotType,
                    level: currentEquippedLevel,
                    name: currentEquippedData.name,
                    icon: this.getItemIcon(targetSlotType, currentEquippedLevel)
                };
                
                // Put old item in the inventory slot where new item came from
                this.inventorySlots[this.draggedItem.sourceIndex] = oldEquippedItem;
                
                // Equip new item
                player.gear[targetSlotType] = item.level;
                player.recalculateStats();
                
                this.renderInventory();
                this.updateCharacterPanel();
                this.showNotification(`Swapped ${currentEquippedData.name} with ${item.name}!`, 'item');
            } else {
                // No item equipped, just equip the new one
                player.gear[targetSlotType] = item.level;
                player.recalculateStats();
                
                // Remove from inventory
                this.inventorySlots[this.draggedItem.sourceIndex] = null;
                
                this.renderInventory();
                this.updateCharacterPanel();
                this.showNotification(`Equipped ${item.name}!`, 'item');
            }
            
            // Save game
            if (this.game) this.game.saveGame();
        } else {
            this.showNotification(`Cannot equip ${item.name} in ${targetSlotType} slot!`, 'damage');
        }
        
        if (this.draggedItem) {
            this.draggedItem.sourceSlot.classList.remove('dragging');
            this.draggedItem = null;
        }
    }
    
    renderInventory() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const slots = inventoryGrid.querySelectorAll('.inventory-slot');
        
        this.inventorySlots.forEach((item, index) => {
            const slot = slots[index];
            slot.innerHTML = '';
            slot.className = 'inventory-slot';
            
            if (item) {
                slot.classList.add('has-item');
                
                // Add glow effect for new items
                if (this.newItemSlots.has(index)) {
                    slot.classList.add('new-item-glow');
                }
                
                slot.draggable = true;
                slot.addEventListener('dragstart', (e) => this.onDragStart(e, index));
                
                if (item.isPotion) {
                    // Potion rendering
                    slot.dataset.itemType = 'potion';
                    slot.dataset.potionId = item.potionId;
                    
                    // Create potion bottle icon
                    const potionDiv = document.createElement('div');
                    potionDiv.className = 'inventory-potion-icon';
                    potionDiv.innerHTML = `
                        <div class="potion-icon-small">
                            <div class="potion-icon-cork"></div>
                            <div class="potion-icon-bottle"></div>
                            <div style="position: absolute; top: 20%; left: 15%; width: 70%; height: 60%; background: ${item.color}; opacity: 0.8; border-radius: 0 0 50% 50%;"></div>
                        </div>
                    `;
                    slot.appendChild(potionDiv);
                    
                    // Add quantity badge (always show for potions)
                    if (item.quantity && item.quantity > 0) {
                        const quantityBadge = document.createElement('div');
                        quantityBadge.className = 'item-quantity';
                        quantityBadge.textContent = item.quantity;
                        slot.appendChild(quantityBadge);
                    }
                    
                    const name = document.createElement('div');
                    name.className = 'item-name';
                    name.textContent = item.name;
                    slot.appendChild(name);
                    
                    // Add click to use potion (single click)
                    slot.addEventListener('click', (e) => {
                        // Don't use if dragging
                        if (this.draggedItem) return;
                        this.usePotionFromInventory(index);
                    });
                    
                    // Add right-click to use potion (alternate method)
                    slot.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.usePotionFromInventory(index);
                    });
                } else {
                    // Gear rendering (existing code)
                    // Add double-click to equip
                    slot.addEventListener('dblclick', (e) => this.onDoubleClickItem(e, index));
                    
                    // Add data attributes for tooltip
                    slot.dataset.itemType = item.slot;
                    slot.dataset.itemLevel = item.level;
                    
                    const icon = document.createElement('img');
                    icon.className = 'item-icon';
                    icon.src = item.icon;
                    icon.style.imageRendering = 'pixelated';
                    icon.style.width = '32px';
                    icon.style.height = '32px';
                    
                    // Ensure icon loads properly
                    icon.onerror = () => {
                        // Fallback to emoji if icon fails to load
                        icon.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.style.fontSize = '24px';
                        const emojiMap = { weapon: '⚔️', armor: '🛡️', trinket: '💍', boots: '👢' };
                        fallback.textContent = emojiMap[item.slot] || '📦';
                        slot.appendChild(fallback);
                    };
                    
                    slot.appendChild(icon);
                    
                    const name = document.createElement('div');
                    name.className = 'item-name';
                    name.textContent = item.name;
                    slot.appendChild(name);
                }
            } else {
                slot.draggable = false;
                delete slot.dataset.itemType;
                delete slot.dataset.itemLevel;
            }
        });
    }
    
    onDragStart(e, index) {
        this.draggedItem = {
            item: this.inventorySlots[index],
            sourceIndex: index,
            sourceSlot: e.currentTarget,
            fromEquipment: false
        };
        e.currentTarget.classList.add('dragging');
        
        // Remove new item glow when interacted with
        if (this.newItemSlots.has(index)) {
            this.newItemSlots.delete(index);
            e.currentTarget.classList.remove('new-item-glow');
        }
    }
    
    onDoubleClickItem(e, index) {
        const item = this.inventorySlots[index];
        if (!item) return;
        
        // Remove new item glow when interacted with
        if (this.newItemSlots.has(index)) {
            this.newItemSlots.delete(index);
        }
        
        const player = this.game.player;
        const targetSlotType = item.slot;
        const currentEquippedLevel = player.gear[targetSlotType];
        
        // Check if there's already an item equipped in this slot
        if (currentEquippedLevel > 0) {
            // Swap: Put currently equipped item back into inventory
            const currentEquippedData = GEAR_SLOTS[targetSlotType].levels[currentEquippedLevel];
            
            const oldEquippedItem = {
                slot: targetSlotType,
                level: currentEquippedLevel,
                name: currentEquippedData.name,
                icon: this.getItemIcon(targetSlotType, currentEquippedLevel)
            };
            
            // Put old item in the inventory slot where new item was
            this.inventorySlots[index] = oldEquippedItem;
            
            // Equip new item
            player.gear[targetSlotType] = item.level;
            player.recalculateStats();
            
            this.renderInventory();
            this.updateCharacterPanel();
            this.showNotification(`Swapped ${currentEquippedData.name} with ${item.name}!`, 'item');
        } else {
            // No item equipped, just equip the new one
            player.gear[targetSlotType] = item.level;
            player.recalculateStats();
            
            // Remove from inventory
            this.inventorySlots[index] = null;
            
            this.renderInventory();
            this.updateCharacterPanel();
            this.showNotification(`Equipped ${item.name}!`, 'item');
        }
        
        // Save game
        if (this.game) this.game.saveGame();
        
        // Visual feedback - briefly highlight equipment slot
        const equipSlot = document.querySelector(`#character-panel [data-slot="${targetSlotType}"]`);
        if (equipSlot) {
            equipSlot.style.transform = 'scale(1.1)';
            equipSlot.style.transition = 'transform 0.2s';
            setTimeout(() => {
                equipSlot.style.transform = '';
            }, 200);
        }
    }
    
    onDoubleClickEquipment(slotType, currentLevel, currentName) {
        const player = this.game.player;
        
        // Find first empty inventory slot
        const emptySlotIndex = this.inventorySlots.findIndex(s => s === null);
        
        if (emptySlotIndex === -1) {
            this.showNotification('Inventory Full! Cannot unequip.', 'damage');
            return;
        }
        
        // Create item object for the currently equipped item
        const unequippedItem = {
            slot: slotType,
            level: currentLevel,
            name: currentName,
            icon: this.getItemIcon(slotType, currentLevel)
        };
        
        // Put item in first empty inventory slot
        this.inventorySlots[emptySlotIndex] = unequippedItem;
        
        // Unequip item
        player.gear[slotType] = 0;
        player.recalculateStats();
        
        // Update UI
        this.renderInventory();
        this.updateCharacterPanel();
        this.showNotification(`Unequipped ${currentName}!`, 'item');
        
        // Save game
        if (this.game) this.game.saveGame();
        
        // Visual feedback - briefly highlight inventory slot
        setTimeout(() => {
            const inventoryGrid = document.getElementById('inventory-grid');
            const slots = inventoryGrid.querySelectorAll('.inventory-slot');
            const targetSlot = slots[emptySlotIndex];
            if (targetSlot) {
                targetSlot.style.transform = 'scale(1.15)';
                targetSlot.style.transition = 'transform 0.2s';
                setTimeout(() => {
                    targetSlot.style.transform = '';
                }, 200);
            }
        }, 50);
    }
    
    showCraftedItemAnimation(itemName) {
        // Create flying item animation to bag icon
        const blacksmithPanel = document.getElementById('blacksmith-panel');
        const bagIcon = document.querySelector('.panel-icon[data-panel="character-panel"]');
        
        if (!bagIcon) return;
        
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-crafted-item';
        flyingItem.textContent = '📦';
        
        // Position at blacksmith panel center
        const panelRect = blacksmithPanel.getBoundingClientRect();
        flyingItem.style.left = (panelRect.left + panelRect.width / 2) + 'px';
        flyingItem.style.top = (panelRect.top + panelRect.height / 2) + 'px';
        
        document.body.appendChild(flyingItem);
        
        // Animate to bag icon
        const bagRect = bagIcon.getBoundingClientRect();
        const targetX = bagRect.left + bagRect.width / 2;
        const targetY = bagRect.top + bagRect.height / 2;
        
        setTimeout(() => {
            flyingItem.style.left = targetX + 'px';
            flyingItem.style.top = targetY + 'px';
            flyingItem.style.transform = 'scale(0.3)';
            flyingItem.style.opacity = '0';
        }, 50);
        
        // Remove after animation
        setTimeout(() => {
            flyingItem.remove();
        }, 800);
    }
    
    markBagAsNew() {
        this.hasNewItems = true;
        this.updateBagIndicator();
    }
    
    updateBagIndicator() {
        const bagIcon = document.querySelector('.panel-icon[data-panel="character-panel"]');
        if (!bagIcon) return;
        
        let newBadge = bagIcon.querySelector('.new-badge');
        
        if (this.hasNewItems && !newBadge) {
            // Add "NEW" badge
            newBadge = document.createElement('div');
            newBadge.className = 'new-badge';
            newBadge.textContent = 'NEW';
            bagIcon.appendChild(newBadge);
            
            // Add pulsing animation to icon
            bagIcon.classList.add('has-new-items');
        } else if (!this.hasNewItems && newBadge) {
            // Remove badge
            newBadge.remove();
            bagIcon.classList.remove('has-new-items');
        }
    }
    
    addItemToInventory(slot, level, animate = false) {
        // Find first empty slot
        const emptySlotIndex = this.inventorySlots.findIndex(s => s === null);
        
        if (emptySlotIndex === -1) {
            this.showNotification('Inventory Full!', 'damage');
            return false;
        }
        
        const gearData = GEAR_SLOTS[slot].levels[level];
        
        this.inventorySlots[emptySlotIndex] = {
            slot: slot,
            level: level,
            name: gearData.name,
            icon: this.getItemIcon(slot, level)
        };
        
        // Mark this slot as having a new item
        if (animate) {
            this.newItemSlots.add(emptySlotIndex);
        }
        
        this.renderInventory();
        
        return true;
    }
    
    setupDebugButton() {
        const debugBtn = document.getElementById('debug-btn');
        const debugMenu = document.getElementById('debug-menu');
        const closeDebugBtn = document.getElementById('close-debug-btn');
        const toggleInfiniteBtn = document.getElementById('toggle-infinite-btn');
        const resetGameBtn = document.getElementById('reset-game-btn');
        const killPlayerBtn = document.getElementById('kill-player-btn');
        const infiniteStatus = document.getElementById('infinite-status');
        
        // Open debug menu
        debugBtn.addEventListener('click', () => {
            debugMenu.classList.remove('hidden');
            this.game.paused = true;
            this.updateDebugInfo();
        });
        
        // Close debug menu
        closeDebugBtn.addEventListener('click', () => {
            debugMenu.classList.add('hidden');
            this.game.paused = false;
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !debugMenu.classList.contains('hidden')) {
                debugMenu.classList.add('hidden');
                this.game.paused = false;
            }
        });
        
        // Toggle infinite resources
        toggleInfiniteBtn.addEventListener('click', () => {
            this.debugMode = !this.debugMode;
            const player = this.game.player;
            
            if (this.debugMode) {
                // Set to infinite resources
                player.coins = 999999;
                player.materials = 999999;
                toggleInfiniteBtn.classList.add('active');
                infiniteStatus.textContent = 'ON';
                infiniteStatus.style.color = '#2ecc71';
                this.showNotification('Debug: Infinite Resources ON!', 'level-up');
            } else {
                // Set to zero
                player.coins = 0;
                player.materials = 0;
                toggleInfiniteBtn.classList.remove('active');
                infiniteStatus.textContent = 'OFF';
                infiniteStatus.style.color = '#e74c3c';
                this.showNotification('Debug: Resources Reset to 0', 'damage');
            }
            
            this.updateDebugInfo();
            this.game.saveGame();
        });
        
        // Kill player button
        killPlayerBtn.addEventListener('click', () => {
            this.game.player.die();
            this.showNotification('Testing death...', 'damage');
        });
        
        // Reset game button
        resetGameBtn.addEventListener('click', () => {
            const confirmed = confirm(
                '⚠️ WARNING ⚠️\n\n' +
                'This will:\n' +
                '• Delete ALL save data\n' +
                '• Reset your progress to Level 1\n' +
                '• Clear inventory and equipment\n' +
                '• Remove all upgrades\n\n' +
                'This action CANNOT be undone!\n\n' +
                'Are you sure you want to continue?'
            );
            
            if (confirmed) {
                // Clear all localStorage
                localStorage.clear();
                
                // Show notification before reload
                this.showNotification('Game Reset! Reloading...', 'damage');
                
                // Reload page after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
        
        // Zone teleport functionality
        const zoneTeleportSelect = document.getElementById('zone-teleport-select');
        const teleportBtn = document.getElementById('teleport-btn');
        
        // Populate zone dropdown
        ZONES.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = `${zone.name} ${zone.type === 'dungeon' ? `(Floor ${zone.floor})` : ''} - Lvl ${zone.requiredLevel}+`;
            zoneTeleportSelect.appendChild(option);
        });
        
        // Teleport button
        teleportBtn.addEventListener('click', () => {
            const selectedZone = zoneTeleportSelect.value;
            if (!selectedZone) {
                this.showNotification('Select a zone first!', 'damage');
                return;
            }
            
            // Force load zone (bypasses level requirements)
            const zone = ZONES.find(z => z.id === selectedZone);
            if (!zone) {
                this.showNotification('Zone not found!', 'damage');
                return;
            }
            
            // Temporarily store original loadZone method
            const originalLoadZone = this.game.loadZone.bind(this.game);
            
            // Override loadZone to bypass level check
            this.game.loadZone = function(zoneId) {
                let zone = ZONES.find(z => z.id === zoneId);
                if (!zone) {
                    console.error('Zone not found:', zoneId);
                    return false;
                }
                
                // Skip level requirement check - just load it
                this.currentZone = zoneId;
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
                    levelData = this.levelGenerator.generateDungeonLevel(zone.floor || 1, zone.floor || 1);
                    this.platforms = levelData.platforms;
                } else if (zone.type === 'hub') {
                    levelData = this.levelGenerator.generateHub();
                    this.platforms = levelData.platforms;
                } else {
                    this.platforms = zone.platforms ? zone.platforms.map(p => ({ ...p })) : [];
                    levelData = { enemySpawns: [] };
                }
                
                // Spawn enemies
                if (zone.enemyTypes && zone.enemyTypes.length > 0) {
                    let count = zone.enemyCount ? 
                        Math.floor(Math.random() * (zone.enemyCount.max - zone.enemyCount.min + 1)) + zone.enemyCount.min :
                        8;
                    
                    let totalWeight = zone.enemyTypes.reduce((sum, e) => sum + e.weight, 0);
                    let spawns = levelData.enemySpawns && levelData.enemySpawns.length > 0 ?
                        levelData.enemySpawns : [];
                    
                    while (spawns.length < count) {
                        spawns.push({ x: 100 + Math.random() * 600, y: 300 });
                    }
                    
                    for (let i = 0; i < count; i++) {
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
                    const previousPortalX = 30;
                    const previousPortalY = this.canvas.height - 80;
                    const previousZoneId = this.getPreviousZone(zone);
                    const previousZone = ZONES.find(z => z.id === previousZoneId);
                    const previousPortalName = previousZoneId === 'hub' ? 'Hub' : (previousZone ? previousZone.name : 'Hub');
                    
                    this.previousPortal = new LevelPortal(previousPortalX, previousPortalY, previousZoneId, 'previous', previousPortalName, false);
                    this.previousPortal.open();
                    
                    const nextPortalX = this.canvas.width - 70;
                    const nextPortalY = this.canvas.height - 80;
                    const nextZoneId = this.getNextZone(zone);
                    const nextZone = ZONES.find(z => z.id === nextZoneId);
                    const nextPortalName = nextZone ? nextZone.name : 'Exit';
                    
                    this.nextPortal = new LevelPortal(nextPortalX, nextPortalY, nextZoneId, 'next', nextPortalName, true);
                    this.checkPortalUnlock();
                }
                
                // Create portals for hub
                if (zone.portals && zone.portals.length > 0) {
                    zone.portals.forEach(portalData => {
                        let portal = new Portal(portalData.x, portalData.y, portalData.label, portalData.locked);
                        portal.targetZone = this.getDungeonEntrance(portalData.targetDungeon);
                        this.portals.push(portal);
                    });
                }
                
                // Spawn NPCs
                let npcsForZone = this.npcManager.getNPCsByZone(zoneId);
                for (let npcData of npcsForZone) {
                    this.npcManager.addNPC(npcData.x, npcData.y, npcData.type, npcData.name);
                }
                
                this.ui.showNotification(`DEBUG: Teleported to ${zone.name}`, 'level-up');
                return true;
            }.bind(this.game);
            
            // Execute teleport
            this.game.loadZone(selectedZone);
            
            // Restore original method
            this.game.loadZone = originalLoadZone;
            
            // Close debug menu
            debugMenu.classList.add('hidden');
            this.game.paused = false;
            
            // Update debug info
            this.updateDebugInfo();
        });
    }
    
    updateDebugInfo() {
        const player = this.game.player;
        document.getElementById('debug-coins').textContent = player.coins.toLocaleString();
        document.getElementById('debug-materials').textContent = player.materials.toLocaleString();
        document.getElementById('debug-level').textContent = player.level;
        document.getElementById('debug-xp').textContent = player.xp.toLocaleString();
        
        // Update current zone
        const currentZone = ZONES.find(z => z.id === this.game.currentZone);
        const zoneDisplay = currentZone ? currentZone.name : 'Unknown';
        document.getElementById('debug-zone').textContent = zoneDisplay;
    }
    
    getItemIcon(slot, level) {
        // Use the ItemIconGenerator for proper icons
        return ItemIconGenerator.generateIcon(slot, level);
    }
    
    setupFeatureHints() {
        // Show hints after tutorial if not already shown
        setTimeout(() => {
            this.updateFeatureHints();
        }, 2000); // Wait 2 seconds after game loads
    }
    
    updateFeatureHints() {
        const questIcon = document.querySelector('.panel-icon[data-panel="quests-panel"]');
        const upgradeIcon = document.querySelector('.panel-icon[data-panel="upgrade-panel"]');
        
        // Quests hint
        if (questIcon) {
            let questHint = questIcon.querySelector('.feature-hint');
            if (!this.hintsShown.quests && !questHint) {
                questHint = document.createElement('div');
                questHint.className = 'feature-hint';
                questHint.innerHTML = '!<div class="hint-tooltip">Check out Quests! (Q)</div>';
                questIcon.appendChild(questHint);
            } else if (this.hintsShown.quests && questHint) {
                questHint.remove();
            }
        }
        
        // Upgrades hint
        if (upgradeIcon) {
            let upgradeHint = upgradeIcon.querySelector('.feature-hint');
            if (!this.hintsShown.upgrades && !upgradeHint) {
                upgradeHint = document.createElement('div');
                upgradeHint.className = 'feature-hint';
                upgradeHint.innerHTML = '!<div class="hint-tooltip">Upgrade your Stats! (U)</div>';
                upgradeIcon.appendChild(upgradeHint);
            } else if (this.hintsShown.upgrades && upgradeHint) {
                upgradeHint.remove();
            }
        }
    }
    
    setupTutorial() {
        const tutorialPopup = document.getElementById('tutorial-popup');
        const okBtn = document.getElementById('tutorial-ok-btn');
        
        // Check if tutorial has been shown before
        const tutorialShown = localStorage.getItem('tutorialShown');
        
        if (!tutorialShown) {
            // First time playing - show tutorial
            tutorialPopup.classList.remove('hidden');
            this.game.paused = true;
            
            okBtn.addEventListener('click', () => {
                tutorialPopup.classList.add('hidden');
                this.game.paused = false;
                localStorage.setItem('tutorialShown', 'true');
                this.showNotification('Good luck, adventurer!', 'level-up');
            });
        }
    }
}
