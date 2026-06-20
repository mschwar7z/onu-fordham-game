// Settings management for ONU Fordham Game

// Detect mobile
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Default settings (higher defaults for mobile)
const defaultSettings = {
    characterVolume: isMobileDevice ? 100 : 80,
    bgMusicVolume: isMobileDevice ? 15 : 10
};

// Current settings
let gameSettings = { ...defaultSettings };

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameSettings = { ...defaultSettings, ...parsed };
        } catch (e) {
            console.warn('[Settings] Failed to parse saved settings:', e);
            gameSettings = { ...defaultSettings };
        }
    } else {
        gameSettings = { ...defaultSettings };
    }
    console.log('[Settings] Loaded settings:', gameSettings);
    return gameSettings;
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    console.log('[Settings] Saved settings:', gameSettings);
}

/**
 * Apply current settings to AudioManager
 */
function applySettings() {
    if (typeof audioManager !== 'undefined') {
        // Convert percentage (0-100) to decimal (0-1)
        const charVol = gameSettings.characterVolume / 100;
        const bgVol = gameSettings.bgMusicVolume / 100;
        
        audioManager.setCharacterVolume(charVol);
        audioManager.setBackgroundMusicVolume(bgVol);
        
        console.log('[Settings] Applied - Character:', charVol, 'Background:', bgVol);
    }
}

/**
 * Update character volume from slider
 */
function updateCharacterVolume(value) {
    gameSettings.characterVolume = parseInt(value);
    document.getElementById('characterVolumeValue').textContent = value + '%';
    saveSettings();
    applySettings();
}

/**
 * Update background music volume from slider
 */
function updateBgMusicVolume(value) {
    gameSettings.bgMusicVolume = parseInt(value);
    document.getElementById('bgMusicVolumeValue').textContent = value + '%';
    saveSettings();
    applySettings();
}

/**
 * Open settings modal
 */
function openSettings() {
    // Play click sound
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    const modal = document.getElementById('settingsModal');
    if (modal) {
        // Update sliders to current values
        const charSlider = document.getElementById('characterVolumeSlider');
        const bgSlider = document.getElementById('bgMusicVolumeSlider');
        const charValue = document.getElementById('characterVolumeValue');
        const bgValue = document.getElementById('bgMusicVolumeValue');
        
        if (charSlider) {
            charSlider.value = gameSettings.characterVolume;
            charValue.textContent = gameSettings.characterVolume + '%';
        }
        if (bgSlider) {
            bgSlider.value = gameSettings.bgMusicVolume;
            bgValue.textContent = gameSettings.bgMusicVolume + '%';
        }
        
        modal.style.display = 'flex';
    }
}

/**
 * Close settings modal
 */
function closeSettings() {
    // Play click sound
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
    
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('settingsModal');
    if (modal && event.target === modal) {
        closeSettings();
    }
});

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    // Apply settings after a short delay to ensure AudioManager is ready
    setTimeout(function() {
        applySettings();
    }, 100);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadSettings, saveSettings, applySettings, gameSettings };
}


