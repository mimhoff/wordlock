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
        this.moonIcon = document.querySelector('.moon-icon');
        this.sunIcon = document.querySelector('.sun-icon');
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
    }

    /**
     * Setup theme toggle event listener
     */
    setupEventListeners() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
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

        // Update theme toggle button icon
        if (theme === THEMES.LIGHT) {
            this.moonIcon.style.display = 'block';
            this.sunIcon.style.display = 'none';
        } else {
            this.moonIcon.style.display = 'none';
            this.sunIcon.style.display = 'block';
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        this.applyTheme(newTheme);
    }

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }
}
