/**
 * Theme Module
 * Handles light/dark theme management
 */

import { STORAGE_KEYS, THEMES } from './constants.js';
import { loadFromStorage, saveToStorage } from './storage.js';

/**
 * Theme Manager Class
 * Manages theme switching and persistence
 */
export class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
    }

    /**
     * Setup theme toggle event listeners
     */
    setupEventListeners() {
        // Add click handler to each theme option
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);
            });
        });
    }

    /**
     * Load theme from storage
     * @returns {string} Theme name (dark or light)
     */
    loadTheme() {
        return loadFromStorage(STORAGE_KEYS.THEME, THEMES.DARK);
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme name (dark or light)
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        saveToStorage(STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);

        // Update active state on theme options
        this.themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }
}
