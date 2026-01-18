// config.js
// Centralized configuration for Vidtapz
// This file simulates environment variables for the user's static web application.

const CONFIG = {
    // API KEY
    YOUTUBE_API_KEY: 'AIzaSyCwGeMX-l_F6C4-5nHuZF2uOJHPFgRxmzg',
    
    // Feature Flags
    ENABLE_AUTONEXT: true,
    ENABLE_logs: false, // Set true for debugging

    // Global Theme Defaults
    DEFAULT_THEME: 'light',
    
    // URLs (if needed for base paths)
    BASE_URL: window.location.origin
};

// Freeze to prevent modification
Object.freeze(CONFIG);
window.CONFIG = CONFIG;
