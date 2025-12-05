/**
 * AdMob Module
 * Handles banner ad display for WordLock
 */

// Use global Capacitor plugins if available
const getAdMob = () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
        return window.Capacitor.Plugins.AdMob;
    }
    return null;
};

// AdMob constants
const BannerAdSize = {
    BANNER: 'BANNER',
    LARGE_BANNER: 'LARGE_BANNER',
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    FULL_BANNER: 'FULL_BANNER',
    LEADERBOARD: 'LEADERBOARD'
};

const BannerAdPosition = {
    TOP_CENTER: 'TOP_CENTER',
    BOTTOM_CENTER: 'BOTTOM_CENTER'
};

export class AdManager {
    constructor() {
        this.isInitialized = false;
        this.bannerShown = false;

        // Real AdMob ad unit IDs
        this.adUnitIds = {
            banner: 'ca-app-pub-5632873189325776/5646957190',
        };
    }

    /**
     * Initialize AdMob
     */
    async initialize() {
        const AdMob = getAdMob();
        if (!AdMob) {
            console.log('AdMob plugin not available');
            return false;
        }

        try {
            await AdMob.initialize({
                requestTrackingAuthorization: false,
                initializeForTesting: false, // Using real ad units
            });

            this.isInitialized = true;
            console.log('AdMob initialized successfully');
            return true;
        } catch (error) {
            console.error('AdMob initialization failed:', error);
            return false;
        }
    }

    /**
     * Show banner ad at bottom of screen
     */
    async showBanner() {
        const AdMob = getAdMob();
        if (!AdMob) {
            console.log('AdMob plugin not available');
            return false;
        }

        if (!this.isInitialized) {
            const success = await this.initialize();
            if (!success) return false;
        }

        try {
            await AdMob.showBanner({
                adId: this.adUnitIds.banner,
                adSize: BannerAdSize.BANNER, // Standard 320x50
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
            });

            this.bannerShown = true;
            console.log('Banner ad shown');
            return true;
        } catch (error) {
            console.error('Failed to show banner:', error);
            return false;
        }
    }

    /**
     * Hide banner ad (doesn't remove it, just hides)
     */
    async hideBanner() {
        const AdMob = getAdMob();
        if (!AdMob) return false;

        try {
            await AdMob.hideBanner();
            this.bannerShown = false;
            console.log('Banner ad hidden');
            return true;
        } catch (error) {
            console.error('Failed to hide banner:', error);
            return false;
        }
    }

    /**
     * Remove banner ad completely
     */
    async removeBanner() {
        const AdMob = getAdMob();
        if (!AdMob) return false;

        try {
            await AdMob.removeBanner();
            this.bannerShown = false;
            console.log('Banner ad removed');
            return true;
        } catch (error) {
            console.error('Failed to remove banner:', error);
            return false;
        }
    }

    /**
     * Resume banner (after pause)
     */
    async resumeBanner() {
        const AdMob = getAdMob();
        if (!AdMob) return false;

        try {
            await AdMob.resumeBanner();
            console.log('Banner ad resumed');
            return true;
        } catch (error) {
            console.error('Failed to resume banner:', error);
            return false;
        }
    }
}

// Export singleton instance
export const adManager = new AdManager();
