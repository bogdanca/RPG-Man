// Slime Cave Background & Decorations System

class SlimeCave {
    constructor() {
        this.currentFloor = 1;
        this.dungeonType = 'slime_caves';
    }

    setDungeonType(type) {
        this.dungeonType = type;
    }

    setFloor(floor) {
        this.currentFloor = floor;
    }

    draw(ctx) {
        // Draw based on current floor
        // Draw based on current floor
        this.drawWalls(ctx);
        this.drawCeilingDetails(ctx);

        if (this.dungeonType === 'slime_caves_ii') {
            this.drawSlimeCavesIIDecor(ctx);
        } else {
            this.drawFloorSpecificDecor(ctx);
        }
    }

    drawWalls(ctx) {
        // Slime-covered cave walls with different colors per floor
        let floorColors;

        if (this.dungeonType === 'slime_caves_ii') {
            // ... (Already handled)
            floorColors = {
                1: { wall: '#2a2a0a', slime: '#8a8a2a' },  // Electric (Yellow/Dark)
                2: { wall: '#0a2a0a', slime: '#2aff2a' },  // Radioactive (Neon Green)
                3: { wall: '#2a2a2a', slime: '#c0c0c0' },  // Metal (Silver/Grey)
                4: { wall: '#050510', slime: '#4a0080' },  // Void (Deep Dark Blue/Purple)
                5: { wall: '#100505', slime: '#800000' }   // Boss (Dark Red/Black)
            };
        } else if (this.dungeonType === 'deep_mines') {
            floorColors = {
                5: { wall: '#0a0a15', slime: '#3a5a7a' } // Deep Mines specific
            };
        } else {
            // Slime Caves I
            floorColors = {
                1: { wall: '#2a3a2a', slime: '#4a8a4a' },  // Green
                2: { wall: '#2a2a3a', slime: '#4a6a9a' },  // Blue
                3: { wall: '#3a2a2a', slime: '#9a4a4a' },  // Red
                4: { wall: '#3a2a3a', slime: '#7a4a8a' },  // Purple
                5: { wall: '#0a1a0a', slime: '#1abc9c' }  // Boss Room - Dark Green/Teal
            };
        }

        const colors = floorColors[this.currentFloor] || floorColors[1];

        // Background
        ctx.fillStyle = colors.wall;
        ctx.fillRect(0, 0, 800, 600);

        // Left wall with slime drips
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 80, 600);

        // Slime coating on left wall
        ctx.fillStyle = colors.slime;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(60, i * 60);
            ctx.quadraticCurveTo(70, i * 60 + 20, 60, i * 60 + 40);
            ctx.quadraticCurveTo(50, i * 60 + 50, 60, i * 60 + 60);
            ctx.lineTo(80, i * 60 + 60);
            ctx.lineTo(80, i * 60);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Right wall
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(720, 0, 80, 600);

        // Slime coating on right wall
        ctx.fillStyle = colors.slime;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(740, i * 60);
            ctx.quadraticCurveTo(730, i * 60 + 20, 740, i * 60 + 40);
            ctx.quadraticCurveTo(750, i * 60 + 50, 740, i * 60 + 60);
            ctx.lineTo(720, i * 60 + 60);
            ctx.lineTo(720, i * 60);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Ceiling shadow
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 800, 60);
    }

    drawFloorSpecificDecor(ctx) {
        switch (this.currentFloor) {
            case 1:
                this.drawFloor1Decor(ctx);
                break;
            case 2:
                this.drawFloor2Decor(ctx);
                break;
            case 3:
                this.drawFloor3Decor(ctx);
                break;
            case 4:
                this.drawFloor4Decor(ctx);
                break;
            case 5:
                if (this.dungeonType === 'deep_mines') {
                    this.drawDeepMinesDecor(ctx);
                } else {
                    // Slime Caves I Boss - Reuse Floor 1 but enhanced
                    this.drawFloor1Decor(ctx);
                    // Add some crown/gold details?
                }
                break;
        }
    }

    drawFloor1Decor(ctx) {
        // Floor 1: Green Slime Cave - Fresh, lots of slime pools

        // Large slime puddles on ground
        const puddles = [
            { x: 150, y: 548, width: 80, height: 8 },
            { x: 400, y: 545, width: 120, height: 12 },
            { x: 650, y: 547, width: 90, height: 10 }
        ];

        for (let puddle of puddles) {
            // Puddle base
            ctx.fillStyle = '#3a7a3a';
            ctx.beginPath();
            ctx.ellipse(puddle.x + puddle.width / 2, puddle.y + puddle.height / 2,
                puddle.width / 2, puddle.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Shine effect
            ctx.fillStyle = '#5a9a5a';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.ellipse(puddle.x + puddle.width / 3, puddle.y + puddle.height / 3,
                puddle.width / 4, puddle.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Hanging slime stalactites
        const stalactites = [
            { x: 200, length: 40, thickness: 10 },
            { x: 350, length: 55, thickness: 12 },
            { x: 500, length: 35, thickness: 8 },
            { x: 650, length: 45, thickness: 11 }
        ];

        for (let stal of stalactites) {
            ctx.fillStyle = '#4a8a4a';
            ctx.beginPath();
            ctx.moveTo(stal.x - stal.thickness / 2, 60);
            ctx.lineTo(stal.x, 60 + stal.length);
            ctx.lineTo(stal.x + stal.thickness / 2, 60);
            ctx.closePath();
            ctx.fill();

            // Drip at end
            ctx.fillStyle = '#5a9a5a';
            ctx.beginPath();
            ctx.arc(stal.x, 60 + stal.length, stal.thickness / 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Slime patches on walls
        this.drawSlimePatches(ctx, '#4a8a4a', 8);

        // Small rocks
        this.drawRocks(ctx, '#5a5a4a', 6);

        // Glowing green mushrooms
        const mushrooms = [
            { x: 120, y: 548 },
            { x: 280, y: 546 },
            { x: 560, y: 547 },
            { x: 720, y: 545 }
        ];

        for (let mush of mushrooms) {
            // Stem
            ctx.fillStyle = '#c8d8c8';
            ctx.fillRect(mush.x - 2, mush.y - 8, 4, 8);

            // Cap
            ctx.fillStyle = '#4a8a4a';
            ctx.beginPath();
            ctx.arc(mush.x, mush.y - 8, 6, 0, Math.PI, true);
            ctx.fill();

            // Glow
            ctx.fillStyle = 'rgba(74, 138, 74, 0.3)';
            ctx.beginPath();
            ctx.arc(mush.x, mush.y - 8, 10, 0, Math.PI * 2);
            ctx.fill();

            // Spots
            ctx.fillStyle = '#5a9a5a';
            ctx.fillRect(mush.x - 4, mush.y - 10, 2, 2);
            ctx.fillRect(mush.x + 2, mush.y - 11, 2, 2);
        }
    }

    drawFloor2Decor(ctx) {
        // Floor 2: Blue Slime Cave - Wet, crystalline formations

        // Ice-blue slime pools (larger and more reflective)
        const pools = [
            { x: 100, y: 545, width: 100, height: 12 },
            { x: 350, y: 543, width: 140, height: 15 },
            { x: 600, y: 546, width: 110, height: 13 }
        ];

        for (let pool of pools) {
            // Pool base
            ctx.fillStyle = '#3a6a8a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 2, pool.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Reflection
            ctx.fillStyle = '#6a9aba';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 3,
                pool.width / 3, pool.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Crystal formations
        const crystals = [
            { x: 180, y: 550, height: 30, color: '#5a8aaa' },
            { x: 420, y: 548, height: 40, color: '#6a9aba' },
            { x: 550, y: 549, height: 35, color: '#5a8aaa' },
            { x: 700, y: 547, height: 38, color: '#6a9aba' }
        ];

        for (let crystal of crystals) {
            // Crystal body
            ctx.fillStyle = crystal.color;
            ctx.beginPath();
            ctx.moveTo(crystal.x - 6, crystal.y);
            ctx.lineTo(crystal.x, crystal.y - crystal.height);
            ctx.lineTo(crystal.x + 6, crystal.y);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#aacaea';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(crystal.x - 3, crystal.y);
            ctx.lineTo(crystal.x, crystal.y - crystal.height);
            ctx.lineTo(crystal.x, crystal.y);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            // Glow
            ctx.fillStyle = 'rgba(106, 154, 186, 0.3)';
            ctx.beginPath();
            ctx.arc(crystal.x, crystal.y - crystal.height / 2, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Blue slime drips
        this.drawSlimePatches(ctx, '#4a6a9a', 10);

        // Icicle-like formations
        const icicles = [
            { x: 250, length: 35 },
            { x: 450, length: 50 },
            { x: 600, length: 40 }
        ];

        for (let ice of icicles) {
            ctx.fillStyle = '#7aaacc';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(ice.x - 5, 60);
            ctx.lineTo(ice.x, 60 + ice.length);
            ctx.lineTo(ice.x + 5, 60);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        this.drawRocks(ctx, '#4a5a6a', 7);
    }

    drawFloor3Decor(ctx) {
        // Floor 3: Red Slime Cave - Volcanic, dangerous

        // Lava-like red slime pools (glowing)
        const lavaPools = [
            { x: 130, y: 546, width: 90, height: 10 },
            { x: 380, y: 544, width: 130, height: 14 },
            { x: 620, y: 545, width: 100, height: 12 }
        ];

        for (let pool of lavaPools) {
            // Outer glow
            ctx.fillStyle = 'rgba(200, 50, 50, 0.4)';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 2 + 10, pool.height / 2 + 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pool base
            ctx.fillStyle = '#8a3a3a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 2, pool.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Hot center
            ctx.fillStyle = '#aa5a5a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 3, pool.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Volcanic rock formations
        const volcanicRocks = [
            { x: 160, y: 540, size: 25 },
            { x: 340, y: 535, size: 35 },
            { x: 480, y: 538, size: 30 },
            { x: 660, y: 542, size: 28 }
        ];

        for (let rock of volcanicRocks) {
            // Dark volcanic rock
            ctx.fillStyle = '#3a2a2a';
            ctx.beginPath();
            ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Lava cracks
            ctx.strokeStyle = '#aa5a5a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rock.x - rock.size / 2, rock.y);
            ctx.lineTo(rock.x + rock.size / 2, rock.y);
            ctx.stroke();

            // Glow from cracks
            ctx.strokeStyle = 'rgba(200, 90, 90, 0.5)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // Red slime drips
        this.drawSlimePatches(ctx, '#9a4a4a', 12);

        // Static smoke/heat distortion areas
        const smokeAreas = [
            { x: 200, y: 300, size: 20 },
            { x: 400, y: 250, size: 25 },
            { x: 600, y: 320, size: 18 },
            { x: 300, y: 400, size: 22 },
            { x: 500, y: 380, size: 20 }
        ];

        for (let smoke of smokeAreas) {
            ctx.fillStyle = 'rgba(80, 40, 40, 0.15)';
            ctx.beginPath();
            ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner darker area
            ctx.fillStyle = 'rgba(100, 50, 50, 0.1)';
            ctx.beginPath();
            ctx.arc(smoke.x, smoke.y, smoke.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFloor4Decor(ctx) {
        // Floor 4: Purple Slime Cave - Mystical, corrupted

        // Corrupted purple slime pools
        const corruptedPools = [
            { x: 140, y: 545, width: 110, height: 13 },
            { x: 370, y: 542, width: 150, height: 16 },
            { x: 610, y: 544, width: 120, height: 14 }
        ];

        for (let pool of corruptedPools) {
            // Outer dark aura
            ctx.fillStyle = 'rgba(80, 40, 100, 0.4)';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 2 + 15, pool.height / 2 + 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pool base
            ctx.fillStyle = '#5a3a6a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 2, pool.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mystical center
            ctx.fillStyle = '#7a5a8a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.width / 2, pool.y + pool.height / 2,
                pool.width / 3, pool.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dark crystals
        const darkCrystals = [
            { x: 170, y: 548, height: 45, angle: -0.2 },
            { x: 410, y: 546, height: 55, angle: 0.1 },
            { x: 540, y: 547, height: 40, angle: -0.15 },
            { x: 690, y: 545, height: 50, angle: 0.12 }
        ];

        for (let crystal of darkCrystals) {
            ctx.save();
            ctx.translate(crystal.x, crystal.y);
            ctx.rotate(crystal.angle);

            // Dark crystal body
            ctx.fillStyle = '#4a3a5a';
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, -crystal.height);
            ctx.lineTo(8, 0);
            ctx.closePath();
            ctx.fill();

            // Purple highlight
            ctx.fillStyle = '#7a5a9a';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(-4, 0);
            ctx.lineTo(0, -crystal.height);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            // Mystical glow
            ctx.fillStyle = 'rgba(122, 90, 154, 0.4)';
            ctx.beginPath();
            ctx.arc(0, -crystal.height / 2, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Purple slime everywhere
        this.drawSlimePatches(ctx, '#7a4a8a', 15);

        // Static void marks (dark corrupted spots)
        const voidMarks = [
            { x: 250, y: 280, size: 12 },
            { x: 450, y: 320, size: 10 },
            { x: 600, y: 290, size: 11 },
            { x: 350, y: 420, size: 9 }
        ];

        for (let mark of voidMarks) {
            // Outer dark circle
            ctx.fillStyle = 'rgba(60, 30, 80, 0.4)';
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, mark.size * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Main mark
            ctx.fillStyle = 'rgba(80, 40, 100, 0.6)';
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, mark.size, 0, Math.PI * 2);
            ctx.fill();

            // Center dark spot
            ctx.fillStyle = 'rgba(40, 20, 60, 0.8)';
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, mark.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Corrupted vines
        this.drawCorruptedVines(ctx);

        this.drawRocks(ctx, '#3a2a4a', 8);
    }

    drawSlimePatches(ctx, color, count) {
        // Static slime patches on walls and ceiling
        const positions = [
            { x: 120, y: 200, w: 20, h: 12, angle: 0.2 },
            { x: 280, y: 150, w: 18, h: 14, angle: 0.8 },
            { x: 450, y: 180, w: 22, h: 11, angle: 1.5 },
            { x: 600, y: 220, w: 19, h: 13, angle: 0.5 },
            { x: 150, y: 350, w: 21, h: 12, angle: 2.1 },
            { x: 380, y: 320, w: 17, h: 15, angle: 1.2 },
            { x: 550, y: 380, w: 23, h: 10, angle: 0.9 },
            { x: 680, y: 340, w: 20, h: 14, angle: 1.7 },
            { x: 220, y: 450, w: 18, h: 13, angle: 0.3 },
            { x: 420, y: 480, w: 24, h: 11, angle: 2.5 },
            { x: 620, y: 460, w: 19, h: 12, angle: 1.1 },
            { x: 300, y: 250, w: 21, h: 13, angle: 0.7 },
            { x: 500, y: 280, w: 20, h: 14, angle: 1.9 },
            { x: 180, y: 400, w: 22, h: 12, angle: 0.4 },
            { x: 650, y: 200, w: 18, h: 15, angle: 1.3 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            let pos = positions[i];
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y, pos.w, pos.h, pos.angle, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    drawRocks(ctx, color, count) {
        const rockPositions = [
            { x: 100, y: 545, size: 10 },
            { x: 250, y: 548, size: 12 },
            { x: 400, y: 546, size: 11 },
            { x: 530, y: 547, size: 13 },
            { x: 680, y: 544, size: 9 },
            { x: 320, y: 549, size: 10 },
            { x: 580, y: 545, size: 11 },
            { x: 720, y: 548, size: 12 }
        ];

        for (let i = 0; i < Math.min(count, rockPositions.length); i++) {
            let rock = rockPositions[i];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.ellipse(rock.x - rock.size / 3, rock.y - rock.size / 3, rock.size / 3, rock.size / 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCorruptedVines(ctx) {
        const vines = [
            { x: 90, startY: 100, segments: 6 },
            { x: 710, startY: 120, segments: 7 }
        ];

        for (let vine of vines) {
            ctx.strokeStyle = '#4a2a5a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(vine.x, vine.startY);

            for (let i = 1; i <= vine.segments; i++) {
                let x = vine.x + Math.sin(i) * 10;
                let y = vine.startY + i * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Leaves/thorns
            ctx.fillStyle = '#5a3a6a';
            for (let i = 1; i < vine.segments; i++) {
                let x = vine.x + Math.sin(i) * 10;
                let y = vine.startY + i * 40;
                ctx.beginPath();
                ctx.moveTo(x - 6, y);
                ctx.lineTo(x, y - 10);
                ctx.lineTo(x + 6, y);
                ctx.fill();
            }
        }
    }

    drawCeilingDetails(ctx) {
        // Static ceiling texture and details
        const floorColors = {
            1: { dark: '#1a2a1a', medium: '#2a3a2a', light: '#3a4a3a' },  // Green
            2: { dark: '#1a1a2a', medium: '#2a2a3a', light: '#3a3a4a' },  // Blue
            3: { dark: '#2a1a1a', medium: '#3a2a2a', light: '#4a2a2a' },  // Red
            4: { dark: '#2a1a2a', medium: '#3a2a3a', light: '#4a2a4a' }   // Purple
        };

        const colors = floorColors[this.currentFloor] || floorColors[1];

        // Ceiling depth gradient
        ctx.fillStyle = colors.dark;
        ctx.fillRect(0, 0, 800, 40);

        ctx.fillStyle = colors.medium;
        ctx.fillRect(0, 40, 800, 20);

        // Static cracks in ceiling
        const cracks = [
            { x: 150, y: 25, length: 30, angle: 0.3 },
            { x: 350, y: 35, length: 40, angle: -0.2 },
            { x: 550, y: 30, length: 35, angle: 0.1 },
            { x: 680, y: 20, length: 25, angle: -0.4 }
        ];

        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        for (let crack of cracks) {
            ctx.beginPath();
            ctx.moveTo(crack.x, crack.y);
            ctx.lineTo(crack.x + Math.cos(crack.angle) * crack.length,
                crack.y + Math.sin(crack.angle) * crack.length);
            ctx.stroke();
        }

        // Static mineral deposits on ceiling
        const deposits = [
            { x: 200, y: 50, size: 8 },
            { x: 420, y: 45, size: 10 },
            { x: 600, y: 52, size: 7 },
            { x: 300, y: 48, size: 9 }
        ];

        for (let dep of deposits) {
            ctx.fillStyle = colors.light;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.ellipse(dep.x, dep.y, dep.size, dep.size * 0.6, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    drawDeepMinesDecor(ctx) {
        // Deep Mines: Ghostly, ethereal atmosphere with skeletal remains

        // Ghostly fog at bottom
        const time = Date.now() * 0.001;
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 5; i++) {
            const fogX = (time * 20 + i * 200) % 1000 - 100;
            const fogY = 480 + Math.sin(time + i) * 20;

            const fogGradient = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, 150);
            fogGradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)');
            fogGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
            ctx.fillStyle = fogGradient;
            ctx.fillRect(fogX - 150, fogY - 100, 300, 200);
        }
        ctx.globalAlpha = 1;

        // Floating ghostly orbs
        for (let i = 0; i < 8; i++) {
            const orbX = 100 + (i * 90) + Math.sin(time * 0.5 + i * 2) * 30;
            const orbY = 150 + Math.sin(time * 0.7 + i) * 100;
            const orbAlpha = 0.2 + Math.sin(time * 2 + i) * 0.1;

            ctx.globalAlpha = orbAlpha;
            const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 20);
            orbGradient.addColorStop(0, 'rgba(135, 206, 235, 0.8)');
            orbGradient.addColorStop(0.5, 'rgba(100, 150, 200, 0.3)');
            orbGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
            ctx.fillStyle = orbGradient;
            ctx.beginPath();
            ctx.arc(orbX, orbY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Skeletal remains scattered around
        const bones = [
            { x: 120, y: 530 },
            { x: 350, y: 535 },
            { x: 550, y: 528 },
            { x: 680, y: 532 }
        ];

        ctx.strokeStyle = 'rgba(200, 200, 220, 0.6)';
        ctx.lineWidth = 2;
        for (let bone of bones) {
            // Skull
            ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
            ctx.beginPath();
            ctx.ellipse(bone.x, bone.y, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye sockets
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(bone.x - 3, bone.y - 1, 2, 0, Math.PI * 2);
            ctx.arc(bone.x + 3, bone.y - 1, 2, 0, Math.PI * 2);
            ctx.fill();

            // Scattered bones
            ctx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
            ctx.beginPath();
            ctx.moveTo(bone.x + 15, bone.y + 5);
            ctx.lineTo(bone.x + 35, bone.y + 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bone.x - 10, bone.y + 8);
            ctx.lineTo(bone.x - 25, bone.y + 3);
            ctx.stroke();
        }

        // Ethereal chains hanging from ceiling
        ctx.strokeStyle = 'rgba(100, 120, 150, 0.4)';
        ctx.lineWidth = 3;
        const chains = [150, 350, 500, 650];
        for (let chainX of chains) {
            const swayOffset = Math.sin(time * 0.8 + chainX * 0.01) * 10;
            ctx.beginPath();
            ctx.moveTo(chainX, 60);
            for (let y = 60; y < 180; y += 15) {
                const xOffset = Math.sin(y * 0.1 + time) * 5 + swayOffset * (y / 180);
                ctx.lineTo(chainX + xOffset, y);
            }
            ctx.stroke();
        }

        // Glowing runes on walls
        const runes = ['◊', '△', '○', '☆', '◇'];
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';

        // Left wall runes
        for (let i = 0; i < 4; i++) {
            const runeAlpha = 0.3 + Math.sin(time * 2 + i) * 0.2;
            ctx.fillStyle = `rgba(135, 206, 235, ${runeAlpha})`;
            ctx.fillText(runes[i % runes.length], 40, 150 + i * 100);
        }

        // Right wall runes
        for (let i = 0; i < 4; i++) {
            const runeAlpha = 0.3 + Math.sin(time * 2 + i + 2) * 0.2;
            ctx.fillStyle = `rgba(135, 206, 235, ${runeAlpha})`;
            ctx.fillText(runes[(i + 2) % runes.length], 760, 150 + i * 100);
        }

        // Dark vignette effect
        const vignetteGradient = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 20, 0.3)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 20, 0.6)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, 800, 600);
    }

    drawSlimeCavesIIDecor(ctx) {
        switch (this.currentFloor) {
            case 1:
                this.drawElectricDecor(ctx);
                break;
            case 2:
                this.drawRadioactiveDecor(ctx);
                break;
            case 3:
                this.drawMetalDecor(ctx);
                break;
            case 4:
                this.drawVoidDecor(ctx);
                break;
            case 5: // Boss
                this.drawEmperorDecor(ctx);
                break;
        }
    }

    drawElectricDecor(ctx) {
        // Floor 1: Electric Slime - Sparks, yellow slime
        const sparks = [
            { x: 150, y: 550 }, { x: 300, y: 200 }, { x: 500, y: 400 }, { x: 700, y: 150 }
        ];

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;

        // Random sparks
        if (Math.random() > 0.8) {
            for (let spark of sparks) {
                if (Math.random() > 0.5) continue;
                ctx.beginPath();
                ctx.moveTo(spark.x, spark.y);
                ctx.lineTo(spark.x + (Math.random() * 20 - 10), spark.y + (Math.random() * 20 - 10));
                ctx.stroke();
            }
        }

        // Yellow slime pools
        const pools = [
            { x: 120, y: 548, w: 70 },
            { x: 400, y: 545, w: 100 },
            { x: 680, y: 547, w: 60 }
        ];

        for (let pool of pools) {
            ctx.fillStyle = '#8a8a2a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.w / 2, pool.y, pool.w / 2, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Electric pulsing core
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.w / 2, pool.y, pool.w / 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        this.drawSlimePatches(ctx, '#8a8a2a', 8);
        this.drawRocks(ctx, '#4a4a3a', 6);
    }

    drawRadioactiveDecor(ctx) {
        // Floor 2: Radioactive - Glowing green, barrels maybe?

        // Glowing Green Gas
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = 'rgba(50, 255, 50, 0.1)';
            let x = (i * 160 + time * 20) % 800;
            let y = 400 + Math.sin(time + i) * 50;
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // Toxic pools
        const pools = [
            { x: 200, y: 548, w: 90 },
            { x: 500, y: 545, w: 120 }
        ];

        for (let pool of pools) {
            ctx.fillStyle = '#1a5a1a';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.w / 2, pool.y, pool.w / 2, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bubbles
            if (Math.random() > 0.9) {
                ctx.fillStyle = '#5aff5a';
                ctx.beginPath();
                ctx.arc(pool.x + Math.random() * pool.w, pool.y - Math.random() * 10, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.drawSlimePatches(ctx, '#2aff2a', 10);
        this.drawRocks(ctx, '#2a3a2a', 8);
    }

    drawMetalDecor(ctx) {
        // Floor 3: Metal Slime - Silver/Grey, metallic structures

        // Metallic spikes
        const spikes = [100, 250, 400, 550, 700];
        for (let x of spikes) {
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath();
            ctx.moveTo(x, 550);
            ctx.lineTo(x + 10, 500);
            ctx.lineTo(x + 20, 550);
            ctx.fill();

            // Shine
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(x + 5, 510, 2, 30);
            ctx.globalAlpha = 1;
        }

        // Silver pools
        const pools = [
            { x: 180, y: 548, w: 60 },
            { x: 620, y: 545, w: 80 }
        ];

        for (let pool of pools) {
            ctx.fillStyle = '#a0a0a0';
            ctx.beginPath();
            ctx.ellipse(pool.x + pool.w / 2, pool.y, pool.w / 2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawSlimePatches(ctx, '#c0c0c0', 6);
    }

    drawVoidDecor(ctx) {
        // Floor 4: Ethereal/Void - Dark, starry

        // Background Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) {
            if (Math.random() > 0.05) continue;
            ctx.fillRect(Math.random() * 800, Math.random() * 500, 2, 2);
        }

        // Void Portals/Rifts
        const rifts = [{ x: 200, y: 300 }, { x: 600, y: 200 }];
        for (let rift of rifts) {
            ctx.fillStyle = 'rgba(74, 0, 128, 0.4)';
            ctx.beginPath();
            ctx.arc(rift.x, rift.y, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(rift.x, rift.y, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawSlimePatches(ctx, '#4a0080', 12);
    }

    drawEmperorDecor(ctx) {
        // Boss Room: Majestic/Technological?
        // Let's go with "Grand Slime Hall" - Gold and Purple

        ctx.fillStyle = '#FFD700'; // Gold pillars
        ctx.fillRect(100, 100, 40, 450);
        ctx.fillRect(660, 100, 40, 450);

        // Carpet
        ctx.fillStyle = '#4a0080';
        ctx.fillRect(140, 545, 520, 10);
    }
}

// Global instance
let slimeCaveInstance = null;

function getSlimeCaveInstance() {
    if (!slimeCaveInstance) {
        slimeCaveInstance = new SlimeCave();
    }
    return slimeCaveInstance;
}
