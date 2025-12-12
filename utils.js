// Utility Functions

// Safe localStorage wrapper for private browsing mode
const SafeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    },
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    },
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }
};

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
            SafeStorage.setItem('grindQuestSave', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save:', e);
            return false;
        }
    }

    static load() {
        try {
            const data = SafeStorage.getItem('grindQuestSave');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load:', e);
            return null;
        }
    }

    static clear() {
        SafeStorage.removeItem('grindQuestSave');
    }
}
