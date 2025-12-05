/**
 * Utility Functions
 * Helper functions used throughout the application
 */

/**
 * Seeded random number generator using Mulberry32 algorithm
 * Ensures consistent random values across all players for daily mode
 * @param {number} seed - The seed value for random generation
 * @returns {Function} A function that returns random numbers between 0 and 1
 */
export function seededRandom(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Get today's date as a numeric seed for deterministic random generation
 * @returns {number} Numeric representation of today's date (YYYYMMDD)
 */
export function getTodaysSeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // Convert date string to number
    return dateStr.split('-').join('') | 0;
}

/**
 * Get formatted date string for display (DD/MM format)
 * @returns {string} Formatted date string
 */
export function getFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

/**
 * Delay execution for a specified duration
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely blur the currently focused element
 * Useful for preventing accidental button re-triggers
 */
export function blurActiveElement() {
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

/**
 * Check if a string is a single uppercase letter A-Z
 * @param {string} str - String to check
 * @returns {boolean} True if single uppercase letter
 */
export function isSingleLetter(str) {
    return /^[A-Z]$/.test(str);
}

/**
 * Trigger haptic feedback on supported devices
 * @param {number} duration - Duration in milliseconds
 */
export function triggerHaptic(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element to search within
 * @returns {NodeList} List of focusable elements
 */
export function getFocusableElements(container) {
    return container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
}

/**
 * Focus the first focusable element in a container
 * @param {HTMLElement} container - Container element
 * @param {number} delayMs - Optional delay before focusing
 */
export function focusFirstElement(container, delayMs = 0) {
    const focusElement = () => {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    };

    if (delayMs > 0) {
        setTimeout(focusElement, delayMs);
    } else {
        focusElement();
    }
}
