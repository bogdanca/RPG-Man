// Procedural Level Generator

class LevelGenerator {
    constructor() {
        this.width = GAME_CONFIG.width;
        this.height = GAME_CONFIG.height;
        this.groundY = 550;
    }
    
    generateDungeonLevel(floor, difficulty = 1) {
        let platforms = [];
        let enemySpawns = [];
        
        // Always include ground platform
        platforms.push({ 
            x: 0, 
            y: this.groundY, 
            width: this.width, 
            height: 50 
        });
        
        // Generate unique platform layouts based on floor
        switch(floor) {
            case 1:
                platforms = this.generateFloor1Platforms();
                break;
            case 2:
                platforms = this.generateFloor2Platforms();
                break;
            case 3:
                platforms = this.generateFloor3Platforms();
                break;
            case 4:
                platforms = this.generateFloor4Platforms();
                break;
            default:
                platforms = this.generateFloor1Platforms();
        }
        
        // Generate enemy spawn points
        enemySpawns = this.generateEnemySpawns(platforms, floor);
        
        return { platforms, enemySpawns };
    }
    
    generateFloor1Platforms() {
        // Floor 1: Simple Stepping Stones - Easy vertical climb up the middle
        let platforms = [
            { x: 0, y: this.groundY, width: this.width, height: 50 }
        ];
        
        // Center stepping stones going up
        platforms.push({ x: 300, y: 480, width: 200, height: 20 });
        platforms.push({ x: 200, y: 410, width: 180, height: 20 });
        platforms.push({ x: 420, y: 340, width: 180, height: 20 });
        platforms.push({ x: 250, y: 270, width: 160, height: 20 });
        platforms.push({ x: 390, y: 200, width: 160, height: 20 });
        
        // Side platforms for variety
        platforms.push({ x: 50, y: 450, width: 120, height: 20 });
        platforms.push({ x: 630, y: 430, width: 120, height: 20 });
        
        return platforms;
    }
    
    generateFloor2Platforms() {
        // Floor 2: Horizontal Layers - Platforms spread across horizontally
        let platforms = [
            { x: 0, y: this.groundY, width: this.width, height: 50 }
        ];
        
        // Layer 1 - Low platforms
        platforms.push({ x: 50, y: 470, width: 150, height: 20 });
        platforms.push({ x: 300, y: 480, width: 180, height: 20 });
        platforms.push({ x: 580, y: 470, width: 150, height: 20 });
        
        // Layer 2 - Mid platforms
        platforms.push({ x: 100, y: 380, width: 140, height: 20 });
        platforms.push({ x: 350, y: 370, width: 160, height: 20 });
        platforms.push({ x: 600, y: 380, width: 140, height: 20 });
        
        // Layer 3 - High platforms
        platforms.push({ x: 180, y: 270, width: 150, height: 20 });
        platforms.push({ x: 470, y: 260, width: 150, height: 20 });
        
        return platforms;
    }
    
    generateFloor3Platforms() {
        // Floor 3: Zigzag Pattern - Alternating left and right climb
        let platforms = [
            { x: 0, y: this.groundY, width: this.width, height: 50 }
        ];
        
        // Zigzag pattern
        platforms.push({ x: 50, y: 480, width: 160, height: 20 });    // Left
        platforms.push({ x: 590, y: 430, width: 160, height: 20 });   // Right
        platforms.push({ x: 80, y: 380, width: 150, height: 20 });    // Left
        platforms.push({ x: 570, y: 330, width: 150, height: 20 });   // Right
        platforms.push({ x: 100, y: 280, width: 140, height: 20 });   // Left
        platforms.push({ x: 560, y: 230, width: 140, height: 20 });   // Right
        
        // Center platforms for transition help
        platforms.push({ x: 320, y: 450, width: 160, height: 20 });
        platforms.push({ x: 340, y: 340, width: 140, height: 20 });
        platforms.push({ x: 330, y: 210, width: 140, height: 20 });
        
        return platforms;
    }
    
    generateFloor4Platforms() {
        // Floor 4: Complex Scattered - Challenging layout with gaps
        let platforms = [
            { x: 0, y: this.groundY, width: this.width, height: 50 }
        ];
        
        // Scattered pattern requiring precise jumps
        platforms.push({ x: 120, y: 490, width: 130, height: 20 });
        platforms.push({ x: 550, y: 480, width: 140, height: 20 });
        
        platforms.push({ x: 340, y: 420, width: 120, height: 20 });
        platforms.push({ x: 80, y: 390, width: 110, height: 20 });
        platforms.push({ x: 610, y: 380, width: 120, height: 20 });
        
        platforms.push({ x: 250, y: 320, width: 130, height: 20 });
        platforms.push({ x: 500, y: 300, width: 110, height: 20 });
        
        platforms.push({ x: 140, y: 250, width: 120, height: 20 });
        platforms.push({ x: 400, y: 230, width: 130, height: 20 });
        platforms.push({ x: 620, y: 210, width: 110, height: 20 });
        
        // Small platforms for extra challenge
        platforms.push({ x: 50, y: 180, width: 90, height: 20 });
        platforms.push({ x: 300, y: 150, width: 100, height: 20 });
        platforms.push({ x: 580, y: 140, width: 90, height: 20 });
        
        return platforms;
    }
    
    platformsOverlap(p1, p2, margin) {
        return !(p1.x + p1.width + margin < p2.x ||
                 p1.x > p2.x + p2.width + margin ||
                 p1.y + p1.height + margin < p2.y ||
                 p1.y > p2.y + p2.height + margin);
    }
    
    isReachable(targetPlatform, existingPlatforms, maxJumpHeight) {
        // Check if we can reach this platform from any existing platform
        for (let p of existingPlatforms) {
            // Horizontal distance
            let horizontalDist = Math.min(
                Math.abs(targetPlatform.x - (p.x + p.width)),
                Math.abs((targetPlatform.x + targetPlatform.width) - p.x)
            );
            
            // Vertical distance
            let verticalDist = p.y - targetPlatform.y;
            
            // Can we jump to it?
            if (horizontalDist < 250 && verticalDist < maxJumpHeight && verticalDist > -100) {
                return true;
            }
            
            // Can we fall to it?
            if (horizontalDist < 200 && verticalDist < 0 && verticalDist > -300) {
                return true;
            }
        }
        
        return false;
    }
    
    ensureReachability(platforms, maxJumpHeight) {
        // Find all platforms reachable from ground
        let reachable = [platforms[0]]; // Ground is always reachable
        let changed = true;
        
        while (changed) {
            changed = false;
            for (let i = 1; i < platforms.length; i++) {
                let p = platforms[i];
                if (reachable.includes(p)) continue;
                
                // Check if reachable from any already reachable platform
                for (let r of reachable) {
                    if (this.canReachPlatform(r, p, maxJumpHeight)) {
                        reachable.push(p);
                        changed = true;
                        break;
                    }
                }
            }
        }
        
        // Return only reachable platforms
        return reachable;
    }
    
    canReachPlatform(from, to, maxJumpHeight) {
        // Check if 'to' platform is reachable from 'from' platform
        
        // Horizontal overlap or close enough
        let horizontalDist = Math.max(
            to.x - (from.x + from.width),
            from.x - (to.x + to.width),
            0
        );
        
        // Vertical distance
        let verticalDist = from.y - to.y;
        
        // Can jump up to it
        if (horizontalDist < 250 && verticalDist > 0 && verticalDist < maxJumpHeight) {
            return true;
        }
        
        // Can fall down to it
        if (horizontalDist < 200 && verticalDist < 0) {
            return true;
        }
        
        return false;
    }
    
    generateEnemySpawns(platforms, floor) {
        let spawns = [];
        
        // Spawn enemies on platforms (excluding ground for some variety)
        let spawnablePlatforms = platforms.filter(p => p.y < this.groundY - 10);
        
        // Mix ground and platform spawns
        let groundSpawns = Math.floor(Math.random() * 3) + 2;
        let platformSpawns = Math.floor(Math.random() * 4) + 3;
        
        // Ground spawns
        for (let i = 0; i < groundSpawns; i++) {
            spawns.push({
                x: 100 + Math.random() * (this.width - 200),
                y: this.groundY - 100
            });
        }
        
        // Platform spawns
        if (spawnablePlatforms.length > 0) {
            for (let i = 0; i < platformSpawns; i++) {
                let platform = spawnablePlatforms[Math.floor(Math.random() * spawnablePlatforms.length)];
                spawns.push({
                    x: platform.x + 20 + Math.random() * (platform.width - 40),
                    y: platform.y - 100
                });
            }
        }
        
        // Add some flying enemy spawns (random positions in air)
        let flyingSpawns = Math.floor(Math.random() * 3);
        for (let i = 0; i < flyingSpawns; i++) {
            spawns.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 200 + Math.random() * 150
            });
        }
        
        return spawns;
    }
    
    generateHub() {
        // Cave hub with platforms reachable by single jump
        return {
            platforms: [
                // Main ground
                { x: 0, y: 550, width: 800, height: 50 },
                // Upper platforms for portals (single jump reachable)
                { x: 100, y: 420, width: 150, height: 20 },  // Left portal
                { x: 325, y: 380, width: 150, height: 20 },  // Center portal
                { x: 550, y: 420, width: 150, height: 20 }   // Right portal
            ],
            enemySpawns: []
        };
    }
    
    generateDoorPosition(platforms) {
        // Find a good platform for the door (preferably high up)
        let upperPlatforms = platforms.filter(p => p.y < 450 && p.width > 80);
        
        if (upperPlatforms.length > 0) {
            let platform = upperPlatforms[Math.floor(Math.random() * upperPlatforms.length)];
            return {
                x: platform.x + platform.width - 70,
                y: platform.y - 80
            };
        }
        
        // Fallback to ground
        return { x: 680, y: 470 };
    }
}
