// Utility Functions

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

class SaveManager {
    static save(data) {
        try {
            localStorage.setItem('grindQuestSave', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save:', e);
            return false;
        }
    }

    static load() {
        try {
            const data = localStorage.getItem('grindQuestSave');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load:', e);
            return null;
        }
    }

    static clear() {
        localStorage.removeItem('grindQuestSave');
    }
}
