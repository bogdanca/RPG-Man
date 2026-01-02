// Cave Dungeon Hub - Atmospheric Pixel Art

class CaveHub {
    constructor() {
        this.waterDroplets = [];
        this.spiders = [];
        this.moldPatches = [];
        this.initializeAnimations();
    }

    initializeAnimations() {
        // Create water droplets (reduced)
        for (let i = 0; i < 5; i++) {
            this.waterDroplets.push({
                x: 100 + i * 150,
                y: -Math.random() * 100,
                speed: 2 + Math.random(),
                delay: Math.random() * 5000
            });
        }

        // Create spiders (reduced)
        for (let i = 0; i < 3; i++) {
            this.spiders.push({
                x: 100 + i * 300,
                y: 50 + i * 50,
                swingOffset: Math.random() * Math.PI * 2,
                stringLength: 30 + i * 10,
                speed: 0.3
            });
        }

        // Create mold patches (static, reduced)
        for (let i = 0; i < 12; i++) {
            this.moldPatches.push({
                x: 50 + (i % 6) * 130,
                y: 150 + Math.floor(i / 6) * 200,
                size: 15 + Math.random() * 15,
                type: Math.floor(Math.random() * 3)
            });
        }
    }

    draw(ctx) {
        // Draw cave background elements first
        this.drawCaveWalls(ctx);
        this.drawStalactites(ctx);
        this.drawBrickStructures(ctx);
        this.drawMold(ctx);
        this.drawCracks(ctx);
        this.drawSpiritChurch(ctx);
        this.drawForge(ctx);
        this.drawCaveDecor(ctx);
        this.drawTorches(ctx);
        this.drawPortalShrines(ctx);

        // Draw minimal animated elements
        this.updateAndDrawWaterDroplets(ctx);
        this.drawFogEffect(ctx);
    }

    drawCaveWalls(ctx) {
        // Simple cave walls

        // Background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 800, 600);

        // Left wall (simplified)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 100, 600);

        // Right wall (simplified)
        ctx.fillRect(700, 0, 100, 600);

        // Ceiling shadow
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 800, 80);
    }

    drawCaveBrick(ctx, x, y) {
        // Weathered stone brick (use position for consistent variation)
        let seed = (x * 7 + y * 13) % 20;
        let shade = 40 + seed;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 5})`;
        ctx.fillRect(x, y, 28, 18);

        // Mortar lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 28, 18);

        // Damage/cracks on some bricks (deterministic based on position)
        if ((x + y) % 10 > 7) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 5);
            ctx.lineTo(x + 15, y + 10);
            ctx.stroke();
        }

        // Moss on some bricks (deterministic based on position)
        if ((x * 3 + y * 5) % 10 > 8) {
            ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
            ctx.fillRect(x + 2, y + 2, 10, 6);
        }
    }

    drawStalactites(ctx) {
        // Hanging stalactites from ceiling
        let positions = [80, 180, 250, 350, 470, 550, 680, 750];

        for (let x of positions) {
            let height = 30 + Math.random() * 50;
            let width = 12 + Math.random() * 8;

            // Stalactite body
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + width / 2, height);
            ctx.lineTo(x - width / 2, height);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + width / 4, height / 2);
            ctx.lineTo(x - width / 4, height / 2);
            ctx.closePath();
            ctx.fill();

            // Water droplet at tip
            if (Math.random() > 0.5) {
                ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
                ctx.beginPath();
                ctx.arc(x, height, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawStalagmites(ctx) {
        // Ground stalagmites
        let positions = [50, 150, 280, 380, 500, 620, 720];

        for (let x of positions) {
            let height = 25 + Math.random() * 40;
            let width = 15 + Math.random() * 10;

            // Stalagmite body
            ctx.fillStyle = '#2a2a2a';
            ctx.beginPath();
            ctx.moveTo(x, 550);
            ctx.lineTo(x, 550 - height);
            ctx.lineTo(x + width / 2, 550);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, 550);
            ctx.lineTo(x, 550 - height);
            ctx.lineTo(x - width / 2, 550);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.moveTo(x, 550);
            ctx.lineTo(x, 550 - height + 5);
            ctx.lineTo(x + width / 4, 550);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawBrickStructures(ctx) {
        // Ancient brick pillars supporting the cave

        // Left pillar
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 3; col++) {
                let x = 100 + col * 24 + (row % 2) * 12;
                let y = 420 + row * 20;
                this.drawAncientBrick(ctx, x, y);
            }
        }

        // Right pillar
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 3; col++) {
                let x = 650 + col * 24 + (row % 2) * 12;
                let y = 420 + row * 20;
                this.drawAncientBrick(ctx, x, y);
            }
        }


    }

    drawAncientBrick(ctx, x, y) {
        // Weathered ancient brick
        ctx.fillStyle = '#4a3c2a';
        ctx.fillRect(x, y, 22, 18);

        // Border
        ctx.strokeStyle = '#2a2520';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 22, 18);

        // Moss/mold (deterministic based on position)
        if ((x * 5 + y * 7) % 10 > 6) {
            ctx.fillStyle = 'rgba(50, 100, 50, 0.4)';
            ctx.fillRect(x + 2, y + 2, 8, 6);
        }

        // Cracks (deterministic based on position)
        if ((x + y * 3) % 10 > 7) {
            ctx.strokeStyle = '#1a1510';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 5, y);
            ctx.lineTo(x + 5, y + 18);
            ctx.stroke();
        }
    }

    drawMold(ctx) {
        // Draw all mold patches (static, no animation)
        for (let mold of this.moldPatches) {
            let alpha = 0.2; // Fixed alpha, no pulsing

            if (mold.type === 0) {
                // Green mold
                ctx.fillStyle = `rgba(34, 100, 34, ${alpha})`;
            } else if (mold.type === 1) {
                // Brown mold
                ctx.fillStyle = `rgba(80, 60, 30, ${alpha})`;
            } else {
                // Grayish mold
                ctx.fillStyle = `rgba(80, 80, 80, ${alpha})`;
            }

            // Simple mold shape
            ctx.beginPath();
            ctx.arc(mold.x, mold.y, mold.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawVines(ctx) {
        // Hanging vines from ceiling
        let vinePositions = [120, 240, 360, 480, 600, 720];

        for (let x of vinePositions) {
            let length = 50 + Math.random() * 100;
            let sway = Math.sin(Date.now() / 1000 + x / 100) * 10;

            // Vine strand
            ctx.strokeStyle = 'rgba(34, 139, 34, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.quadraticCurveTo(x + sway / 2, length / 2, x + sway, length);
            ctx.stroke();

            // Leaves on vine
            for (let i = 0; i < 3; i++) {
                let leafY = (length / 3) * i + 10;
                let leafX = x + (sway * i / 3);
                ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
                ctx.fillRect(leafX - 4, leafY, 8, 6);
            }
        }
    }

    drawCracks(ctx) {
        // Large cracks in walls and ceiling
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Ceiling crack
        ctx.beginPath();
        ctx.moveTo(200, 30);
        ctx.lineTo(220, 50);
        ctx.lineTo(240, 45);
        ctx.lineTo(260, 60);
        ctx.stroke();

        // Wall crack
        ctx.beginPath();
        ctx.moveTo(90, 200);
        ctx.lineTo(85, 250);
        ctx.lineTo(88, 300);
        ctx.lineTo(82, 350);
        ctx.stroke();

        // Floor crack
        ctx.beginPath();
        ctx.moveTo(300, 545);
        ctx.lineTo(350, 548);
        ctx.lineTo(400, 545);
        ctx.lineTo(450, 547);
        ctx.stroke();
    }

    drawForge(ctx) {
        // Blacksmith forge area (left side, away from portals)
        let forgeX = 50;
        let forgeY = 480;

        // Stone forge base
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(forgeX, forgeY, 80, 70);

        // Forge bricks
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                let x = forgeX + col * 26 + (row % 2) * 13;
                let y = forgeY + row * 18;
                ctx.strokeRect(x, y, 25, 17);
            }
        }

        // Forge opening (fire pit)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(forgeX + 15, forgeY + 35, 50, 30);

        // Fire inside forge
        let fireGlow = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = fireGlow;

        // Fire base
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(forgeX + 20, forgeY + 50, 40, 15);

        // Fire middle
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(forgeX + 25, forgeY + 45, 30, 15);

        // Fire top
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(forgeX + 30, forgeY + 40, 20, 12);

        ctx.restore();

        // Forge glow on surrounding area
        ctx.save();
        ctx.globalAlpha = 0.15 * fireGlow;
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(forgeX - 10, forgeY + 30, 100, 40);
        ctx.restore();

        // Anvil next to forge
        let anvilX = forgeX + 95;
        let anvilY = forgeY + 45;

        // Anvil base
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(anvilX, anvilY + 15, 30, 10);

        // Anvil body
        ctx.fillStyle = '#3c3c3c';
        ctx.fillRect(anvilX + 5, anvilY, 20, 15);

        // Anvil horn
        ctx.fillRect(anvilX + 20, anvilY - 5, 8, 8);

        // Anvil highlight
        ctx.fillStyle = '#5c5c5c';
        ctx.fillRect(anvilX + 7, anvilY + 2, 10, 3);

        // Tools on wall
        let toolX = forgeX - 15;
        let toolY = forgeY + 10;

        // Hammer
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(toolX, toolY, 3, 25);
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(toolX - 4, toolY - 3, 11, 8);

        // Tongs
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toolX + 10, toolY);
        ctx.lineTo(toolX + 10, toolY + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toolX + 13, toolY);
        ctx.lineTo(toolX + 13, toolY + 20);
        ctx.stroke();

        // Coals/embers on ground
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
            ctx.fillRect(forgeX + 10 + i * 15, forgeY + 68, 8, 4);
        }
    }

    drawRocks(ctx) {
        // Scattered rocks and rubble on ground
        let rocks = [
            { x: 230, y: 540, size: 12 },
            { x: 450, y: 538, size: 15 },
            { x: 520, y: 542, size: 10 },
            { x: 340, y: 541, size: 14 },
            { x: 680, y: 539, size: 11 }
        ];

        for (let rock of rocks) {
            // Rock body
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.ellipse(rock.x - rock.size / 3, rock.y - rock.size / 3, rock.size / 2, rock.size * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTorches(ctx) {
        // Torches on platforms (positioned to sit on platform tops)
        let torchPositions = [
            { x: 110, y: 400 },   // Left platform - left side
            { x: 240, y: 400 },   // Left platform - right side
            { x: 335, y: 360 },   // Center platform - left side
            { x: 465, y: 360 },   // Center platform - right side
            { x: 560, y: 400 },   // Right platform - left side
            { x: 690, y: 400 }    // Right platform - right side
        ];

        for (let pos of torchPositions) {
            // Torch holder
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(pos.x - 3, pos.y, 6, 20);
            ctx.fillRect(pos.x - 6, pos.y + 20, 12, 4);

            // Simple flame
            ctx.fillStyle = '#ff8c42';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y - 8, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Inner flame
            ctx.fillStyle = '#ffdc3b';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y - 8, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPortalShrines(ctx) {
        // Three simple portal shrines at platform positions
        // Centered on platforms: platform.x + (platform.width / 2) - 25 (half of arch width)
        // Positioned so pillars sit on platforms (platform y - pillar height)
        let shrines = [
            { x: 150, y: 350, name: 'Deep Mines' },     // Left portal (platform: x:100, w:150, center:175)
            { x: 375, y: 310, name: 'Slime Caves' },    // Center portal (platform: x:325, w:150, center:400)
            { x: 600, y: 350, name: 'Crystal Depths' }  // Right portal (platform: x:550, w:150, center:625)
        ];

        for (let shrine of shrines) {
            // Shrine pillars
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(shrine.x - 25, shrine.y, 12, 70);
            ctx.fillRect(shrine.x + 63, shrine.y, 12, 70);

            // Pillar caps
            ctx.fillStyle = '#5a4a3a';
            ctx.fillRect(shrine.x - 28, shrine.y, 18, 8);
            ctx.fillRect(shrine.x + 60, shrine.y, 18, 8);

            // Decorative Stone Arch (rounded top)
            ctx.save();

            // Arch background
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(shrine.x - 25, shrine.y - 5, 100, 20);

            // Rounded arch top
            ctx.beginPath();
            ctx.arc(shrine.x + 25, shrine.y, 50, Math.PI, 0, false);
            ctx.fillStyle = '#4a3a2a';
            ctx.fill();

            // Inner arch shadow
            ctx.beginPath();
            ctx.arc(shrine.x + 25, shrine.y, 45, Math.PI, 0, false);
            ctx.fillStyle = '#2a2a2a';
            ctx.fill();

            // Arch details/bricks
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(shrine.x + 25, shrine.y, 50 - i * 8, Math.PI + 0.2, -0.2, false);
                ctx.stroke();
            }

            // Stone texture lines
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                let angle = Math.PI + (i * Math.PI / 5);
                let x1 = shrine.x + 25 + Math.cos(angle) * 42;
                let y1 = shrine.y + Math.sin(angle) * 42;
                let x2 = shrine.x + 25 + Math.cos(angle) * 50;
                let y2 = shrine.y + Math.sin(angle) * 50;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            ctx.restore();

            // Simple runes (no flashing) - repositioned slightly down
            ctx.fillStyle = '#6ac5c5';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('◊ ▲ ◊', shrine.x + 25, shrine.y + 4);
        }
    }

    drawWaterPuddles(ctx) {
        // Water puddles on ground
        let puddles = [
            { x: 200, y: 545, width: 60, height: 15 },
            { x: 400, y: 543, width: 80, height: 18 },
            { x: 550, y: 546, width: 50, height: 12 }
        ];

        for (let puddle of puddles) {
            // Puddle body
            ctx.fillStyle = 'rgba(70, 130, 180, 0.3)';
            ctx.beginPath();
            ctx.ellipse(puddle.x + puddle.width / 2, puddle.y + puddle.height / 2,
                puddle.width / 2, puddle.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ripple effect
            let ripple = (Date.now() / 1000 + puddle.x) % 2;
            ctx.strokeStyle = `rgba(100, 150, 200, ${1 - ripple / 2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(puddle.x + puddle.width / 2, puddle.y + puddle.height / 2,
                (puddle.width / 2) * ripple, (puddle.height / 2) * ripple, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(puddle.x + 5, puddle.y + 2, puddle.width / 4, 3);
        }
    }

    updateAndDrawWaterDroplets(ctx) {
        let currentTime = Date.now();

        for (let droplet of this.waterDroplets) {
            // Update position
            if (currentTime > droplet.delay) {
                droplet.y += droplet.speed;

                // Reset when hits ground
                if (droplet.y > 545) {
                    droplet.y = -10;
                    droplet.delay = currentTime + Math.random() * 4000;
                }

                // Draw simple droplet
                ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
                ctx.fillRect(droplet.x, droplet.y, 2, 4);
            }
        }
    }

    updateAndDrawSpiders(ctx) {
        for (let spider of this.spiders) {
            // Update swing
            spider.swingOffset += spider.speed * 0.01;
            let swingX = Math.sin(spider.swingOffset) * 15;
            let currentY = spider.y + spider.stringLength + Math.sin(spider.swingOffset * 2) * 10;

            // Draw spider web string
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spider.x, spider.y);
            ctx.lineTo(spider.x + swingX, currentY);
            ctx.stroke();

            // Draw spider body
            ctx.fillStyle = '#2c2c2c';
            ctx.beginPath();
            ctx.arc(spider.x + swingX, currentY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Spider legs
            ctx.strokeStyle = '#1c1c1c';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                let angle = (i / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(spider.x + swingX, currentY);
                ctx.lineTo(spider.x + swingX + Math.cos(angle) * 6, currentY + Math.sin(angle) * 6);
                ctx.stroke();
            }

            // Spider eyes (red glow)
            ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.fillRect(spider.x + swingX - 2, currentY - 1, 1, 1);
            ctx.fillRect(spider.x + swingX + 1, currentY - 1, 1, 1);
        }
    }

    drawStalactites(ctx) {
        // Stalactites hanging from ceiling
        let stalactites = [
            { x: 150, length: 30 },
            { x: 250, length: 45 },
            { x: 450, length: 35 },
            { x: 520, length: 50 },
            { x: 680, length: 40 }
        ];

        for (let stal of stalactites) {
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.moveTo(stal.x - 8, 80);
            ctx.lineTo(stal.x, 80 + stal.length);
            ctx.lineTo(stal.x + 8, 80);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(stal.x - 6, 82);
            ctx.lineTo(stal.x - 2, 80 + stal.length * 0.6);
            ctx.lineTo(stal.x - 4, 82);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawSpiritChurch(ctx) {
        // Church structure around Spirit Healer (x: 640, y: 518 on ground y: 550)
        const churchX = 600;
        const churchY = 480;

        // Stone foundation
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(churchX - 20, 550, 140, 50);

        // Church walls
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(churchX, churchY, 100, 70);

        // Darker inner doorway
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(churchX + 35, churchY + 30, 30, 40);

        // Stone pillars
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(churchX - 5, churchY, 10, 70);
        ctx.fillRect(churchX + 95, churchY, 10, 70);

        // Pillar caps
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(churchX - 8, churchY, 16, 8);
        ctx.fillRect(churchX + 92, churchY, 16, 8);

        // Gothic arch above door
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(churchX + 50, churchY + 30, 20, Math.PI, 0, false);
        ctx.stroke();

        // Cross on top
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(churchX + 47, churchY - 25, 6, 25);
        ctx.fillRect(churchX + 40, churchY - 18, 20, 6);

        // Glow from inside
        ctx.fillStyle = 'rgba(150, 200, 255, 0.2)';
        ctx.fillRect(churchX + 37, churchY + 32, 26, 36);

        // Stained glass effect
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.fillRect(churchX + 10, churchY + 10, 15, 25);
        ctx.fillRect(churchX + 75, churchY + 10, 15, 25);

        // Stone texture
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.strokeRect(churchX, churchY + i * 17, 100, 17);
        }

        // Small steps leading to door
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(churchX + 30, 548, 40, 2);
        ctx.fillRect(churchX + 33, 546, 34, 2);
    }

    drawCaveDecor(ctx) {
        // Stalagmites on ground
        let stalagmites = [
            { x: 200, y: 550, height: 35, width: 12 },
            { x: 280, y: 550, height: 45, width: 14 },
            { x: 500, y: 550, height: 30, width: 10 },
            { x: 760, y: 550, height: 40, width: 13 }
        ];

        for (let stag of stalagmites) {
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.moveTo(stag.x - stag.width / 2, stag.y);
            ctx.lineTo(stag.x, stag.y - stag.height);
            ctx.lineTo(stag.x + stag.width / 2, stag.y);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(stag.x - stag.width / 4, stag.y);
            ctx.lineTo(stag.x, stag.y - stag.height * 0.7);
            ctx.lineTo(stag.x, stag.y);
            ctx.closePath();
            ctx.fill();
        }

        // Rocks and bones scattered on ground
        let groundItems = [
            { x: 50, y: 545, type: 'rock' },
            { x: 130, y: 543, type: 'bone' },
            { x: 220, y: 547, type: 'rock' },
            { x: 310, y: 544, type: 'skull' },
            { x: 440, y: 546, type: 'rock' },
            { x: 530, y: 543, type: 'bone' },
            { x: 720, y: 545, type: 'rock' },
            { x: 780, y: 544, type: 'bone' }
        ];

        for (let item of groundItems) {
            if (item.type === 'rock') {
                // Simple rock
                ctx.fillStyle = '#4a4a4a';
                ctx.beginPath();
                ctx.ellipse(item.x, item.y, 8, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#5a5a5a';
                ctx.beginPath();
                ctx.ellipse(item.x - 2, item.y - 1, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (item.type === 'bone') {
                // Bone
                ctx.fillStyle = '#e8e8d8';
                ctx.fillRect(item.x - 8, item.y, 16, 3);
                ctx.fillRect(item.x - 10, item.y - 1, 4, 5);
                ctx.fillRect(item.x + 6, item.y - 1, 4, 5);
            } else if (item.type === 'skull') {
                // Small skull
                ctx.fillStyle = '#d8d8c8';
                ctx.beginPath();
                ctx.ellipse(item.x, item.y, 6, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Eye sockets
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(item.x - 3, item.y - 1, 2, 2);
                ctx.fillRect(item.x + 1, item.y - 1, 2, 2);
            }
        }

        // Glowing mushrooms near Spirit Church
        let mushrooms = [
            { x: 590, y: 548 },
            { x: 600, y: 547 },
            { x: 715, y: 548 },
            { x: 725, y: 547 }
        ];

        for (let mush of mushrooms) {
            // Mushroom stem
            ctx.fillStyle = '#c8b8a8';
            ctx.fillRect(mush.x - 2, mush.y - 6, 4, 6);

            // Mushroom cap
            ctx.fillStyle = '#8a4a8a';
            ctx.beginPath();
            ctx.arc(mush.x, mush.y - 6, 5, 0, Math.PI, true);
            ctx.fill();

            // Glow
            ctx.fillStyle = 'rgba(200, 100, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(mush.x, mush.y - 6, 7, 0, Math.PI * 2);
            ctx.fill();

            // Spots
            ctx.fillStyle = '#a86aa8';
            ctx.fillRect(mush.x - 3, mush.y - 8, 2, 2);
            ctx.fillRect(mush.x + 1, mush.y - 9, 2, 2);
        }

        // Crates near Blacksmith (x: 160)
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(120, 530, 20, 20);
        ctx.fillRect(142, 535, 18, 15);

        // Crate details
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(120, 530, 20, 20);
        ctx.strokeRect(142, 535, 18, 15);
        ctx.beginPath();
        ctx.moveTo(130, 530);
        ctx.lineTo(130, 550);
        ctx.moveTo(120, 540);
        ctx.lineTo(140, 540);
        ctx.stroke();

        // Barrel
        ctx.fillStyle = '#6a5a4a';
        ctx.beginPath();
        ctx.ellipse(195, 545, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(185, 545, 20, 5);
        ctx.strokeStyle = '#4a3a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(188, 545);
        ctx.lineTo(188, 550);
        ctx.moveTo(195, 545);
        ctx.lineTo(195, 550);
        ctx.moveTo(202, 545);
        ctx.lineTo(202, 550);
        ctx.stroke();
    }

    drawFogEffect(ctx) {
        // Atmospheric fog at ground level
        ctx.save();
        let fogGradient = ctx.createLinearGradient(0, 500, 0, 600);
        fogGradient.addColorStop(0, 'rgba(150, 150, 150, 0)');
        fogGradient.addColorStop(1, 'rgba(100, 100, 100, 0.15)');
        ctx.fillStyle = fogGradient;
        ctx.fillRect(0, 500, 800, 100);
        ctx.restore();
    }
}

// Global instance
let caveHubInstance = null;

function getCaveHubInstance() {
    if (!caveHubInstance) {
        caveHubInstance = new CaveHub();
    }
    return caveHubInstance;
}
