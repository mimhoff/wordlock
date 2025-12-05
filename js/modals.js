/**
 * Modals Module
 * Handles modal dialogs (How to Play, Statistics)
 */

import { STORAGE_KEYS, TIMING } from './constants.js';
import { loadFromStorage, saveToStorage } from './storage.js';
import { focusFirstElement } from './utils.js';
import { AnimationManager } from './animations.js';

/**
 * Modal Manager Class
 * Manages modal dialogs and their interactions
 */
export class ModalManager {
    constructor() {
        this.howToPlayModal = document.getElementById('how-to-play-modal');
        this.statsModal = document.getElementById('stats-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.setupEventListeners();
    }

    /**
     * Setup all modal event listeners
     */
    setupEventListeners() {
        // How to Play modal
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        const closeBtn = this.howToPlayModal.querySelector('.close');

        howToPlayBtn.addEventListener('click', () => {
            this.openHowToPlay();
        });

        closeBtn.addEventListener('click', () => {
            this.closeHowToPlay();
        });

        // Stats modal
        const statsBtn = document.getElementById('stats-btn');
        const statsCloseBtn = this.statsModal.querySelector('.stats-close');

        statsBtn.addEventListener('click', () => {
            this.openStats();
        });

        statsCloseBtn.addEventListener('click', () => {
            this.closeStats();
        });

        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsCloseBtn = this.settingsModal.querySelector('.settings-close');

        settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });

        settingsCloseBtn.addEventListener('click', () => {
            this.closeSettings();
        });

        // Click outside to close
        window.addEventListener('click', (event) => {
            if (event.target === this.howToPlayModal) {
                this.closeHowToPlay();
            } else if (event.target === this.statsModal) {
                this.closeStats();
            } else if (event.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    /**
     * Open How to Play modal with fade animation
     */
    openHowToPlay() {
        this.howToPlayModal.classList.add('open');
        AnimationManager.fadeIn(this.howToPlayModal);
        focusFirstElement(
            this.howToPlayModal.querySelector('.modal-content'),
            TIMING.FOCUS_DELAY
        );
    }

    /**
     * Close How to Play modal with fade animation
     */
    async closeHowToPlay() {
        await AnimationManager.fadeOut(this.howToPlayModal);
        this.howToPlayModal.classList.remove('open');
        document.getElementById('how-to-play-btn').focus();
    }

    /**
     * Open Stats modal with fade animation
     */
    openStats() {
        this.statsModal.classList.add('open');
        AnimationManager.fadeIn(this.statsModal);
        focusFirstElement(
            this.statsModal.querySelector('.modal-content'),
            TIMING.FOCUS_DELAY
        );
    }

    /**
     * Close Stats modal with fade animation
     */
    async closeStats() {
        await AnimationManager.fadeOut(this.statsModal);
        this.statsModal.classList.remove('open');
        document.getElementById('stats-btn').focus();
    }

    /**
     * Open Settings modal with fade animation
     */
    openSettings() {
        this.settingsModal.classList.add('open');
        AnimationManager.fadeIn(this.settingsModal);
        focusFirstElement(
            this.settingsModal.querySelector('.modal-content'),
            TIMING.FOCUS_DELAY
        );
    }

    /**
     * Close Settings modal with fade animation
     */
    async closeSettings() {
        await AnimationManager.fadeOut(this.settingsModal);
        this.settingsModal.classList.remove('open');
        document.getElementById('settings-btn').focus();
    }

    /**
     * Check if any modal is currently open
     * @returns {boolean} True if a modal is open
     */
    isModalOpen() {
        return this.howToPlayModal.classList.contains('open') ||
               this.statsModal.classList.contains('open') ||
               this.settingsModal.classList.contains('open');
    }

    /**
     * Check if this is the user's first visit and show tutorial
     */
    checkFirstTimeUser() {
        const hasVisited = loadFromStorage(STORAGE_KEYS.HAS_VISITED);

        if (!hasVisited) {
            // Mark as visited
            saveToStorage(STORAGE_KEYS.HAS_VISITED, true);

            // Show How to Play modal after a short delay
            setTimeout(() => {
                this.openHowToPlay();
            }, TIMING.FIRST_TIME_MODAL_DELAY);
        }
    }
}
