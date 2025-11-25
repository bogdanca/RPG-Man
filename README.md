# RPG Man - Indie Platformer RPG

A lightweight, indie platformer RPG built with vanilla JavaScript and HTML5 Canvas.

## 🎮 How to Play

1. Open `index.html` in any modern web browser
2. Use keyboard controls to play
3. Your progress is automatically saved to localStorage

## ⌨️ Controls

### Keyboard
- **WASD / Arrow Keys** - Move left/right
- **SPACE / W / Up Arrow** - Jump (press twice for double jump)
- **C** - Inventory Panel (view/manage equipment & items)
- **U** - Upgrade Stats Panel (spend coins to boost stats)
- **B** - Blacksmith Panel (craft new gear with materials)
- **Q** - Quests Panel (track and complete quests)
- **ESC** - Close current panel
- **1-4** - Switch between zones (if level requirement met)

### Mouse
- **Left Click** - Attack
- **Right Click (Hold)** - Block (reduces damage by 50%)
- **Click Panel Icons** - Open/close panels (bottom right corner)
- **Click Outside Panel** - Close current panel
- **X Button** - Close panel
- **Drag & Drop** - Move items in inventory, equip items from bag to equipment slots

## 🎯 Gameplay Loop

1. **Explore Zones** - Navigate platforming areas with enemies
2. **Fight Enemies** - Defeat slimes, bats, knights, and bosses (left-click to attack)
3. **Defend Yourself** - Right-click to block incoming damage (50% reduction)
4. **Collect Resources** - Gain XP, coins, and materials from enemies
5. **Open Panels** - Click icons in bottom right or use hotkeys (C/U/B/Q)
6. **View Inventory** - Check equipped gear and bag with 20 item slots (C)
7. **Craft Gear** - Use materials and coins to craft new equipment (B)
8. **Manage Items** - Drag and drop items from bag to equipment slots
9. **Upgrade Stats** - View current stats and spend coins on permanent boosts (U)
10. **Complete Quests** - Track and complete kill quests for bonus rewards (Q)
11. **Level Up** - Gain levels to unlock new zones and become stronger
12. **Repeat & Grind** - Farm enemies to gather resources for upgrades

## 📊 RPG Systems

### Stats
- **Max HP** - Your health pool
- **Damage** - Attack power
- **Defense** - Damage reduction
- **Speed** - Movement speed
- **Critical Chance** - Chance to deal double damage

### Gear Slots
- **Weapon** - Increases damage
- **Armor** - Increases defense and HP
- **Trinket** - Increases critical chance
- **Boots** - Increases movement speed

### Leveling
- XP required increases exponentially (x1.5 per level)
- Each level grants small stat bonuses
- Unlock new zones at specific levels

## 🗺️ Zones

1. **Training Grounds** (Level 1+) - Basic slime enemies
2. **Dark Forest** (Level 3+) - Slimes and flying bats
3. **Ancient Ruins** (Level 5+) - Adds tough knights
4. **Boss Arena** (Level 8+) - Face the Dark Knight boss

## 🎨 Features

✅ **Simple Platformer Physics** - Jump, double jump, arcade-style movement  
✅ **Mouse Controls** - Left click to attack, right click to block  
✅ **Block Mechanic** - Reduce incoming damage by 50% while blocking  
✅ **RPG-Style Panel System** - Beautiful panels with wooden borders and gold accents  
✅ **Diablo-Style Inventory** - 20-slot bag grid with drag-and-drop functionality  
✅ **Equipment System** - 4 equipment slots (Weapon, Armor, Trinket, Boots)  
✅ **Crafting to Inventory** - Crafted items appear in bag with animation, then equip via drag-drop  
✅ **Separate Panels** - Inventory, Upgrade, Blacksmith, Quests each in their own panel  
✅ **Smart Panel Management** - Only one panel open at a time, click outside to close  
✅ **Compact Icons** - Small bottom-right panel buttons with hover effects  
✅ **Keyboard Shortcuts** - C/U/B/Q hotkeys for instant panel access  
✅ **Current Stats Display** - View all stats in Upgrade panel alongside upgrades  
✅ **Multiple Enemy Types** - Each with unique AI behavior  
✅ **RPG Progression** - Stats, gear, levels, quests  
✅ **Grind-Focused** - Repetitive gameplay loop designed for grinding  
✅ **Auto-Save** - Progress saved every 10 seconds to localStorage  
✅ **Material Drops** - Low drop chance system for crafting  
✅ **Quest System** - Kill quests with XP and coin rewards  
✅ **Visual Feedback** - Damage numbers, notifications, particle effects, shield visual, crafting animations  

## 🔧 Technical Details

- **Pure Vanilla JavaScript** - No frameworks or libraries required
- **HTML5 Canvas Rendering** - 60 FPS target
- **LocalStorage Persistence** - Save data stored in browser
- **Minimal Assets** - Simple geometric shapes (32x32 pixels)
- **Lightweight** - ~500 lines of code per module
- **Browser Compatible** - Works in all modern browsers

## 🚀 Extending the Game

The code is modular and easy to extend:

- **data.js** - Add new enemies, zones, gear, quests, stats
- **enemy.js** - Create new enemy behaviors
- **player.js** - Add new player abilities
- **game.js** - Add new game mechanics
- **ui.js** - Customize UI elements

## 📝 Save Data

Your save includes:
- Player level, XP, coins, materials
- Current HP
- Stat upgrades
- Gear levels
- Quest progress
- Current zone

To reset: Open browser console and run `localStorage.clear()` then refresh.

## 🎯 Game Balance

- Enemies respawn after 5 seconds
- Material drop rates: Slime (8%), Bat (10%), Knight (15%), Boss (50%)
- Death penalty: Lose 10% of coins, respawn at safe location
- Stat upgrade costs increase exponentially
- Gear requires both coins and materials

---

**Enjoy the grind!** 🎮⚔️
