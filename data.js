// Game Constants and Data

const GAME_CONFIG = {
    width: 800,
    height: 600,
    gravity: 0.6,
    friction: 0.85,
    tileSize: 32
};

const PLAYER_CONFIG = {
    width: 24,
    height: 32,
    baseMovementSpeed: 1.0, // Reduced to 1.0 (0.5x speed)
    gravity: 0.1, // Reduced to 0.1 (0.25x gravity) to maintain jump height with half power
    jumpPower: 5, // Reduced to 5 (0.5x power)
    doubleJumpPower: 4, // Reduced to 4 (0.5x power)
    attackCooldown: 350,
    attackRange: 65,
    baseStats: {
        maxHp: 100,
        damage: 10,
        defense: 5,
        speed: 0, // Speed stat now adds bonus to base movement
        critChance: 0.05
    }
};

const ENEMY_TYPES = {
    // Level 1-4 enemies
    green_slime_weak: {
        name: 'Green Slime',
        width: 30,
        height: 30,
        hp: 20,
        speed: 0.8,
        damage: 3,
        damageMax: 5,
        xp: 12,
        coins: 2,
        materialDropChance: 0.4,
        color: '#2ecc71',
        behavior: 'slime_jump',
        jumpInterval: 2000,
        jumpPower: -8
    },

    // Level 4-7 enemies
    green_slime_strong: {
        name: 'Cave Slime',
        width: 32,
        height: 32,
        hp: 40,
        speed: 1.0,
        damage: 8,
        damageMax: 12,
        xp: 40,
        coins: 3,
        materialDropChance: 0.5,
        color: '#27ae60',
        behavior: 'slime_jump',
        jumpInterval: 1800,
        jumpPower: -9
    },

    cave_bat: {
        name: 'Cave Bat',
        width: 28,
        height: 20,
        hp: 35,
        damage: 10,
        damageMax: 14,
        speed: 2,
        xp: 40,
        coins: 3,
        materialDropChance: 0.5,
        color: '#9b59b6',
        behavior: 'fly'
    },

    // Level 7-12 enemies
    cave_bat_strong: {
        name: 'Dire Bat',
        width: 32,
        height: 24,
        hp: 80,
        damage: 18,
        damageMax: 25,
        speed: 2.5,
        xp: 375,
        coins: 7,
        materialDropChance: 0.6,
        color: '#8e44ad',
        behavior: 'fly'
    },

    red_slime: {
        name: 'Fire Slime',
        width: 34,
        height: 34,
        hp: 100,
        speed: 0.6,
        damage: 20,
        damageMax: 30,
        xp: 375,
        coins: 8,
        materialDropChance: 0.65,
        color: '#e74c3c',
        behavior: 'slime_shooter',
        jumpInterval: 2500,
        jumpPower: -7,
        shootCooldown: 3000,
        projectileDamage: 25,
        projectileSpeed: 3,
        projectileColor: '#e74c3c'
    },

    // Boss
    slime_king: {
        name: 'Slime King',
        width: 60,
        height: 60,
        hp: 800,
        damage: 35,
        damageMax: 50,
        speed: 1.5,
        xp: 2000,
        coins: 100,
        materials: 10,
        color: '#16a085',
        behavior: 'slime_boss',
        jumpInterval: 1500,
        jumpPower: -12,
        shootCooldown: 2000,
        projectileDamage: 30,
        projectileSpeed: 4,
        projectileColor: '#1abc9c',
        isBoss: true
    },

    // Deep Mines Boss - Phantom Dragon (Time-gated)
    phantom_dragon: {
        name: 'Phantom Dragon',
        width: 120,
        height: 80,
        hp: 2500,
        damage: 45,
        damageMax: 70,
        speed: 2.0,
        xp: 8000,
        coins: 500,
        materials: 50,
        color: 'rgba(100, 180, 255, 0.3)', // Ghostly blue, semi-transparent
        behavior: 'phantom_dragon',
        shootCooldown: 2500,
        projectileDamage: 40,
        projectileSpeed: 5,
        projectileColor: '#87ceeb',
        // Phantom abilities
        invisDuration: 3000,      // How long it stays invisible
        visibleDuration: 4000,    // How long it stays visible
        breathCooldown: 5000,     // Ghostly breath attack
        breathDamage: 60,
        phaseShiftCooldown: 8000,  // Teleport ability
        isBoss: true
    },
    // Slime Caves II Enemies
    electric_slime: {
        name: 'Electric Slime',
        width: 32,
        height: 32,
        hp: 200,
        speed: 1.2,
        damage: 25,
        damageMax: 35,
        xp: 800,
        coins: 15,
        materialDropChance: 0.7,
        color: '#ffff00',
        behavior: 'slime_jump',
        jumpInterval: 1200,
        jumpPower: -10
    },
    radioactive_slime: {
        name: 'Toxic Slime',
        width: 34,
        height: 34,
        hp: 350,
        speed: 0.9,
        damage: 35,
        damageMax: 45,
        xp: 1200,
        coins: 25,
        materialDropChance: 0.75,
        color: '#2aff2a',
        behavior: 'slime_shooter',
        shootCooldown: 2000,
        projectileDamage: 30,
        projectileColor: '#5aff5a'
    },
    metal_slime: {
        name: 'Metal Slime',
        width: 30,
        height: 30,
        hp: 600, // High HP/Defense equivalent
        speed: 0.5,
        damage: 45,
        damageMax: 55,
        xp: 2000,
        coins: 50,
        materialDropChance: 0.9,
        color: '#c0c0c0',
        behavior: 'slime_jump'
    },
    void_slime: {
        name: 'Void Slime',
        width: 36,
        height: 36,
        hp: 800,
        speed: 1.5,
        damage: 60,
        damageMax: 80,
        xp: 3500,
        coins: 80,
        materialDropChance: 0.8,
        color: '#4a0080',
        behavior: 'slime_boss' // Aggressive
    },
    slime_emperor: {
        name: 'Slime Emperor',
        width: 80,
        height: 80,
        hp: 6000,
        damage: 80,
        damageMax: 120,
        speed: 1.8,
        xp: 15000,
        coins: 2000,
        materials: 100,
        color: '#FFD700',
        behavior: 'slime_boss',
        jumpInterval: 1200,
        jumpPower: -15,
        shootCooldown: 1500,
        projectileDamage: 60,
        projectileSpeed: 6,
        projectileColor: '#8a2be2',
        isBoss: true
    }
};

const ZONES = [
    // Hub/Base (not procedurally generated) - Cave Dungeon Hub
    {
        id: 'hub',
        name: 'The Nexus Cavern',
        requiredLevel: 1,
        type: 'hub',
        backgroundColor: '#2a2a2a',
        platformColor: '#4a3a2a',
        procedural: false,
        portals: [
            { x: 145, y: 340, label: 'Deep Mines', targetDungeon: 'deep_mines', locked: false, isTimeGated: true, openHour: 23, closeHour: 12 },
            { x: 370, y: 300, label: 'Slime Caves', targetDungeon: 'slime_caves', locked: false },
            { x: 595, y: 340, label: 'Crystal Depths', targetDungeon: 'slime_caves', locked: true }
        ]
    },

    // Slime Caves Dungeon - Level 1 (Levels 1-4)
    {
        id: 'slime_caves_1',
        name: 'SC I - Floor 1',
        dungeon: 'slime_caves',
        floor: 1,
        requiredLevel: 1,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#1a3a1a',
        platformColor: '#2d5016',
        enemyTypes: [
            { type: 'green_slime_weak', weight: 1.0 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 480
    },

    // Slime Caves Dungeon - Level 2 (Levels 4-7)
    {
        id: 'slime_caves_2',
        name: 'SC I - Floor 2',
        dungeon: 'slime_caves',
        floor: 2,
        requiredLevel: 5,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#0d1f0d',
        platformColor: '#1a3a1a',
        enemyTypes: [
            { type: 'green_slime_strong', weight: 0.6 },
            { type: 'cave_bat', weight: 0.4 }
        ],
        enemyCount: { min: 7, max: 12 },
        xpRequired: 1600
    },

    // Slime Caves Dungeon - Level 3 (Levels 7-12)
    {
        id: 'slime_caves_3',
        name: 'SC I - Floor 3',
        dungeon: 'slime_caves',
        floor: 3,
        requiredLevel: 10,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#1a0a0a',
        platformColor: '#3a1a1a',
        enemyTypes: [
            { type: 'cave_bat_strong', weight: 0.5 },
            { type: 'red_slime', weight: 0.5 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 8200
    },

    // Slime Caves Dungeon - Floor 4 (Levels 15-20)
    {
        id: 'slime_caves_4',
        name: 'SC I - Floor 4',
        dungeon: 'slime_caves',
        floor: 4,
        requiredLevel: 15,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#2a0a2a', // Purple-ish
        platformColor: '#4a2a4a',
        enemyTypes: [
            { type: 'red_slime', weight: 0.7 },
            { type: 'cave_bat_strong', weight: 0.3 }
        ],
        enemyCount: { min: 8, max: 12 },
        xpRequired: 12000
    },

    // Slime Caves Dungeon - Boss (Level 12)
    {
        id: 'slime_caves_boss',
        name: 'SC I - Boss',
        dungeon: 'slime_caves',
        floor: 4, // Keeping original floor count for compatibility but user asked for 4 floors + boss. 
        // Wait, user said "Floor 4 (existing) - Levels 15-20" then "Boss 20+".
        // Existing data had boss at floor 4 (Level 4).
        // I will shift boss to Floor 5 to match "Floors 1-4... and boss at the end".
        floor: 5,
        requiredLevel: 20,
        type: 'dungeon',
        isBoss: true,
        procedural: false,
        backgroundColor: '#0a1a1a',
        platformColor: '#16a085',
        enemyTypes: [
            { type: 'slime_king', weight: 1.0 }
        ],
        enemyCount: { min: 1, max: 1 },
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 100, y: 450, width: 150, height: 20 },
            { x: 550, y: 450, width: 150, height: 20 },
            { x: 325, y: 350, width: 150, height: 20 }
        ],
        xpRequired: 2000,
        // exitToHub: true, // Replaced with direct link
        nextZoneId: 'slime_caves_ii_1'
    },

    // --- SLIME CAVES II ---

    // Slime Caves II - Floor 1 (Levels 20-25)
    {
        id: 'slime_caves_ii_1',
        name: 'SC II - Floor 1',
        dungeon: 'slime_caves_ii',
        floor: 1,
        requiredLevel: 20,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#2a2a0a',
        platformColor: '#3a3a1a',
        enemyTypes: [
            { type: 'electric_slime', weight: 1.0 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 5000
    },

    // Slime Caves II - Floor 2 (Levels 25-30)
    {
        id: 'slime_caves_ii_2',
        name: 'SC II - Floor 2',
        dungeon: 'slime_caves_ii',
        floor: 2,
        requiredLevel: 25,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#0a2a0a',
        platformColor: '#1a3a1a', // Radioactive
        enemyTypes: [
            { type: 'radioactive_slime', weight: 1.0 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 7500
    },

    // Slime Caves II - Floor 3 (Levels 30-35)
    {
        id: 'slime_caves_ii_3',
        name: 'SC II - Floor 3',
        dungeon: 'slime_caves_ii',
        floor: 3,
        requiredLevel: 30,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#2a2a2a',
        platformColor: '#4a4a4a', // Metal
        enemyTypes: [
            { type: 'metal_slime', weight: 1.0 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 10000
    },

    // Slime Caves II - Floor 4 (Levels 35-40)
    {
        id: 'slime_caves_ii_4',
        name: 'SC II - Floor 4',
        dungeon: 'slime_caves_ii',
        floor: 4,
        requiredLevel: 35,
        type: 'dungeon',
        procedural: true,
        backgroundColor: '#050510',
        platformColor: '#2a0a3a', // Void
        enemyTypes: [
            { type: 'void_slime', weight: 1.0 }
        ],
        enemyCount: { min: 6, max: 10 },
        xpRequired: 15000
    },

    // Slime Caves II - Boss (Level 40+)
    {
        id: 'slime_caves_ii_boss',
        name: 'SC II - Emperor',
        dungeon: 'slime_caves_ii',
        floor: 5,
        requiredLevel: 40,
        type: 'dungeon',
        isBoss: true,
        procedural: false,
        backgroundColor: '#100505',
        platformColor: '#FFD700',
        enemyTypes: [
            { type: 'slime_emperor', weight: 1.0 }
        ],
        enemyCount: { min: 1, max: 1 },
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 150, y: 450, width: 500, height: 20 },
            { x: 300, y: 350, width: 200, height: 20 }
        ],
        xpRequired: 20000,
        exitToHub: true
    },

    // Deep Mines - Time-gated dungeon (opens at 11:00 local time)
    {
        id: 'deep_mines_boss',
        name: 'The Phantom\'s Lair',
        dungeon: 'deep_mines',
        floor: 5, // Uses special Deep Mines floor decoration
        requiredLevel: 10,
        type: 'dungeon',
        isBoss: true,
        isTimeGated: true,
        openHour: 23, // Opens at 23:00 local time
        procedural: false,
        backgroundColor: '#0a0a15',
        platformColor: '#1a1a2e',
        enemyTypes: [
            { type: 'phantom_dragon', weight: 1.0 }
        ],
        enemyCount: { min: 1, max: 1 },
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 50, y: 450, width: 120, height: 20 },
            { x: 630, y: 450, width: 120, height: 20 },
            { x: 200, y: 380, width: 100, height: 20 },
            { x: 500, y: 380, width: 100, height: 20 },
            { x: 325, y: 300, width: 150, height: 20 },
            { x: 100, y: 220, width: 100, height: 20 },
            { x: 600, y: 220, width: 100, height: 20 }
        ],
        xpRequired: 8000,
        exitToHub: true
    }
];

const STAT_UPGRADES = {
    maxHp: {
        name: 'Max HP',
        baseCost: 10,
        costMultiplier: 1.5,
        increment: 20
    },
    damage: {
        name: 'Damage',
        baseCost: 15,
        costMultiplier: 1.6,
        increment: 3
    },
    defense: {
        name: 'Defense',
        baseCost: 12,
        costMultiplier: 1.5,
        increment: 2
    },
    speed: {
        name: 'Speed',
        baseCost: 20,
        costMultiplier: 1.8,
        increment: 0.15
    },
    critChance: {
        name: 'Crit Chance',
        baseCost: 25,
        costMultiplier: 2,
        increment: 0.02
    }
};

const GEAR_SLOTS = {
    weapon: {
        name: 'Weapon',
        levels: [
            { name: 'Wooden Sword', coins: 0, materials: 0, damage: 1 },
            { name: 'Copper Sword', coins: 20, materials: 5, damage: 4 },
            { name: 'Iron Sword', coins: 50, materials: 15, damage: 8 },
            { name: 'Diamond Sword', coins: 120, materials: 35, damage: 16 }
        ]
    },
    armor: {
        name: 'Armor',
        levels: [
            { name: 'No Armor', coins: 0, materials: 0, defense: 0, hp: 0 },
            { name: 'Leather Armor', coins: 15, materials: 5, defense: 2, hp: 15 },
            { name: 'Copper Armor', coins: 40, materials: 12, defense: 4, hp: 30 },
            { name: 'Iron Armor', coins: 80, materials: 25, defense: 7, hp: 45 },
            { name: 'Diamond Armor', coins: 150, materials: 50, defense: 10, hp: 50 }
        ]
    },
    trinket: {
        name: 'Trinket',
        levels: [
            { name: 'No Trinket', coins: 0, materials: 0, critChance: 0 },
            { name: 'Lucky Charm I', coins: 20, materials: 5, critChance: 0.05 },
            { name: 'Lucky Charm II', coins: 45, materials: 12, critChance: 0.10 },
            { name: 'Lucky Charm III', coins: 80, materials: 25, critChance: 0.15 },
            { name: 'Lucky Charm IV', coins: 140, materials: 45, critChance: 0.20 }
        ]
    },
    boots: {
        name: 'Boots',
        levels: [
            { name: 'Bare Feet', coins: 0, materials: 0, speed: 0, defense: 0 },
            { name: 'Leather Boots', coins: 18, materials: 4, speed: 0.12, defense: 1 },
            { name: 'Copper Boots', coins: 42, materials: 10, speed: 0.24, defense: 2 },
            { name: 'Iron Boots', coins: 75, materials: 20, speed: 0.36, defense: 3 },
            { name: 'Diamond Boots', coins: 150, materials: 45, speed: 0.48, defense: 4 }
        ]
    }
};

const POTIONS = {
    health_potion: {
        name: 'Health Potion',
        description: 'Restores 50 HP instantly',
        price: 25,
        color: '#DC143C',
        effect: { type: 'heal', value: 50 }
    },
    elixir_strength: {
        name: 'Elixir of Strength',
        description: '+5 Damage for 5 minutes',
        price: 40,
        color: '#FF4500',
        effect: { type: 'buff', stat: 'damage', value: 5, duration: 300000 }
    },
    elixir_defense: {
        name: 'Elixir of Defense',
        description: '+5 Defense for 5 minutes',
        price: 40,
        color: '#4169E1',
        effect: { type: 'buff', stat: 'defense', value: 5, duration: 300000 }
    },
    elixir_speed: {
        name: 'Elixir of Speed',
        description: '+1.5 Speed for 5 minutes',
        price: 35,
        color: '#32CD32',
        effect: { type: 'buff', stat: 'speed', value: 1.5, duration: 300000 }
    }
};

const QUESTS = [
    {
        id: 'kill_green_slimes_10',
        name: 'Slime Hunter I',
        description: 'Defeat 10 Green Slimes',
        target: { enemy: 'green_slime_weak', count: 10 },
        reward: { xp: 50, coins: 20 }
    },
    {
        id: 'kill_cave_slimes_10',
        name: 'Slime Hunter II',
        description: 'Defeat 10 Cave Slimes',
        target: { enemy: 'green_slime_strong', count: 10 },
        reward: { xp: 200, coins: 50 }
    },
    {
        id: 'kill_bats_5',
        name: 'Bat Exterminator',
        description: 'Defeat 5 Cave Bats',
        target: { enemy: 'cave_bat', count: 5 },
        reward: { xp: 150, coins: 40 }
    },
    {
        id: 'kill_fire_slimes_3',
        name: 'Fire Slime Slayer',
        description: 'Defeat 3 Fire Slimes',
        target: { enemy: 'red_slime', count: 3 },
        reward: { xp: 500, coins: 100 }
    },
    {
        id: 'kill_slime_king',
        name: 'King Slayer',
        description: 'Defeat the Slime King',
        target: { enemy: 'slime_king', count: 1 },
        reward: { xp: 1000, coins: 200 }
    },
    {
        id: 'kill_phantom_dragon',
        name: 'Dragon Slayer',
        description: 'Defeat the Phantom Dragon',
        target: { enemy: 'phantom_dragon', count: 1 },
        reward: { xp: 5000, coins: 1000 }
    }
];

const XP_FORMULA = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
