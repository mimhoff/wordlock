/**
 * Storage Module
 * Handles localStorage operations with error handling and fallbacks
 */

/**
 * Safely save data to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} True if save successful, false otherwise
 */
export function saveToStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`Failed to save to localStorage (${key}):`, error);

        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded. Consider clearing old data.');
        }

        return false;
    }
}

/**
 * Safely load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parse fails
 * @returns {*} Parsed value or default value
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);

        if (item === null) {
            return defaultValue;
        }

        return JSON.parse(item);
    } catch (error) {
        console.error(`Failed to load from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key to remove
 * @returns {boolean} True if removal successful
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove from localStorage (${key}):`, error);
        return false;
    }
}

/**
 * Check if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.warn('localStorage is not available:', error);
        return false;
    }
}

/**
 * Get the size of localStorage in bytes
 * @returns {number} Size in bytes
 */
export function getStorageSize() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    } catch (error) {
        console.error('Failed to calculate storage size:', error);
        return 0;
    }
}

/**
 * Clear all game-related data from storage
 * @param {Array<string>} keys - Keys to clear
 * @returns {boolean} True if all clears successful
 */
export function clearGameData(keys) {
    let allSuccessful = true;

    keys.forEach(key => {
        if (!removeFromStorage(key)) {
            allSuccessful = false;
        }
    });

    return allSuccessful;
}
