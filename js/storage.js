/**
 * Storage Module
 * Handles storage operations with Capacitor Preferences on native platforms
 * and localStorage on web, with error handling and fallbacks
 */

// Get Preferences plugin if available
const getPreferences = () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
        return window.Capacitor.Plugins.Preferences;
    }
    return null;
};

// Check if we're on a native platform
const isNativePlatform = () => {
    return window.Capacitor && window.Capacitor.getPlatform() !== 'web';
};

/**
 * Safely save data to storage (Preferences on native, localStorage on web)
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {Promise<boolean>} True if save successful, false otherwise
 */
export async function saveToStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);

        // Use Capacitor Preferences on native platforms
        if (isNativePlatform()) {
            const Preferences = getPreferences();
            if (Preferences) {
                await Preferences.set({ key, value: serialized });
                console.log(`✓ Saved to Preferences: ${key}`);
                return true;
            }
        }

        // Fall back to localStorage on web or if Preferences unavailable
        localStorage.setItem(key, serialized);
        console.log(`✓ Saved to localStorage: ${key}`, value);
        return true;
    } catch (error) {
        console.error(`✗ Failed to save to storage (${key}):`, error);

        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded. Consider clearing old data.');
        }

        return false;
    }
}

/**
 * Safely load data from storage (Preferences on native, localStorage on web)
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parse fails
 * @returns {Promise<*>} Parsed value or default value
 */
export async function loadFromStorage(key, defaultValue = null) {
    try {
        let item;

        // Use Capacitor Preferences on native platforms
        if (isNativePlatform()) {
            const Preferences = getPreferences();
            if (Preferences) {
                const result = await Preferences.get({ key });
                item = result.value;
                console.log(`✓ Loaded from Preferences: ${key}`, item ? 'found' : 'not found');
            }
        } else {
            // Use localStorage on web
            item = localStorage.getItem(key);
            console.log(`✓ Loaded from localStorage: ${key}`, item ? 'found' : 'not found');
        }

        if (item === null || item === undefined) {
            console.log(`Using default value for ${key}`);
            return defaultValue;
        }

        const parsed = JSON.parse(item);
        console.log(`Parsed ${key}:`, parsed);
        return parsed;
    } catch (error) {
        console.error(`✗ Failed to load from storage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Safely remove item from storage (Preferences on native, localStorage on web)
 * @param {string} key - Storage key to remove
 * @returns {Promise<boolean>} True if removal successful
 */
export async function removeFromStorage(key) {
    try {
        // Use Capacitor Preferences on native platforms
        if (isNativePlatform()) {
            const Preferences = getPreferences();
            if (Preferences) {
                await Preferences.remove({ key });
                return true;
            }
        }

        // Fall back to localStorage
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove from storage (${key}):`, error);
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
 * @returns {Promise<boolean>} True if all clears successful
 */
export async function clearGameData(keys) {
    let allSuccessful = true;

    for (const key of keys) {
        const success = await removeFromStorage(key);
        if (!success) {
            allSuccessful = false;
        }
    }

    return allSuccessful;
}
