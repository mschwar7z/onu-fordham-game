// Audio management for ONU Fordham Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.characterAudio = null;
        this.clickSound = null;
        this.isPlaying = false;
        this.isAudioPaused = false;
        
        // Character ID to audio file mapping
        this.characterAudioMap = {
            'oracle-card': null, // No specific audio file yet
            'doppelganger-card': null, // No specific audio file yet
            'werewolf1-card': 'werewolf',
            'werewolf2-card': 'werewolf',
            'minion-card': null, // No specific audio file yet
            'seer-card': null, // No specific audio file yet
            'robber-card': null, // No specific audio file yet
            'troublemaker-card': null, // No specific audio file yet
            'drunk-card': 'drunk',
            'insomniac-card': null, // No specific audio file yet
            'revealer-card': null, // No specific audio file yet
            'mortician-card': null, // No specific audio file yet
            'villager1-card': null, // No specific audio file yet
            'villager2-card': null, // No specific audio file yet
            'villager3-card': null, // No specific audio file yet
            'hunter-card': null, // No specific audio file yet
            'tanner-card': null // No specific audio file yet
        };
        
        // Available audio files for each character type
        this.audioFiles = {
            'werewolf': [
                'static/audio/werewolf/werewolf_line_1.mp3',
                'static/audio/werewolf/werewolf_line_2.mp3'
            ],
            'drunk': [
                'static/audio/drunk/drunk_line_1.mp3',
                'static/audio/drunk/drunk_line_2.mp3'
            ]
        };
        
        this.init();
    }
    
    init() {
        // Initialize audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
        
        // Load background music and click sound
        this.loadBackgroundMusic();
        this.loadClickSound();
    }
    
    loadBackgroundMusic() {
        this.backgroundMusic = new Audio('static/audio/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3; // Lower volume for background
    }
    
    loadClickSound() {
        this.clickSound = new Audio('static/audio/click.mp3');
        this.clickSound.volume = 0.7; // Click sound volume
    }
    
    // Play background music
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isPlaying) {
            this.backgroundMusic.play().catch(e => {
                console.log('Background music play failed:', e);
            });
            this.isPlaying = true;
        }
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isPlaying = false;
        }
    }
    
    // Play click sound
    playClickSound() {
        if (this.clickSound) {
            // Reset to beginning in case it's already playing
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(e => {
                console.log('Click sound play failed:', e);
            });
        }
    }
    
    // Get random audio file for a character type
    getRandomAudioFile(characterType) {
        if (this.audioFiles[characterType]) {
            const files = this.audioFiles[characterType];
            const randomIndex = Math.floor(Math.random() * files.length);
            return files[randomIndex];
        }
        return null;
    }
    
    // Play character audio based on selected characters
    playCharacterAudio(selectedCharacters) {
        if (!selectedCharacters || selectedCharacters.length === 0) {
            console.log('No characters selected for audio');
            return;
        }
        
        // Find characters with available audio
        const charactersWithAudio = selectedCharacters.filter(charId => {
            const characterType = this.characterAudioMap[charId];
            return characterType && this.audioFiles[characterType];
        });
        
        if (charactersWithAudio.length === 0) {
            console.log('No characters with audio selected');
            return;
        }
        
        // Play audio for the first character with available audio
        const firstCharacter = charactersWithAudio[0];
        const characterType = this.characterAudioMap[firstCharacter];
        const audioFile = this.getRandomAudioFile(characterType);
        
        if (audioFile) {
            this.playAudioFile(audioFile, characterType);
        }
    }
    
    // Play a specific audio file
    playAudioFile(audioFile, characterType) {
        if (this.characterAudio) {
            this.characterAudio.pause();
        }
        
        this.characterAudio = new Audio(audioFile);
        this.characterAudio.volume = 0.8;
        
        this.characterAudio.play().then(() => {
            console.log(`Playing ${characterType} audio: ${audioFile}`);
        }).catch(e => {
            console.log('Character audio play failed:', e);
        });
    }
    
    // Stop all audio
    stopAllAudio() {
        this.stopBackgroundMusic();
        if (this.characterAudio) {
            this.characterAudio.pause();
            this.characterAudio = null;
        }
    }
    
    // Handle play button click with audio
    handlePlayButtonClick(selectedCharacters) {
        console.log('Play button clicked with characters:', selectedCharacters);
        
        // Play background music
        this.playBackgroundMusic();
        
        // Play character-specific audio
        this.playCharacterAudio(selectedCharacters);
    }
    
    // Initialize game with selected characters
    initializeGame() {
        // Display selected characters
        this.displaySelectedCharacters();
        
        // Play background music
        this.playBackgroundMusic();
        
        // Play character audio after a short delay
        if (window.selectedCharacters && window.selectedCharacters.length > 0) {
            setTimeout(() => {
                this.playCharacterAudio(window.selectedCharacters);
            }, 1000);
        }
    }
    
    // Display selected characters on the game page
    displaySelectedCharacters() {
        const container = document.getElementById('selectedCharactersList');
        if (!container) return;
        
        if (window.selectedCharacters && window.selectedCharacters.length > 0) {
            const characterList = window.selectedCharacters.map(char => {
                // Convert character ID to display name
                const displayName = char.replace('-card', '').replace(/([A-Z])/g, ' $1').trim();
                return `<div class="character-item">${displayName}</div>`;
            }).join('');
            container.innerHTML = characterList;
        } else {
            container.innerHTML = '<p>No characters selected</p>';
        }
    }
    
    // Toggle audio pause/resume
    toggleAudio() {
        const pauseButton = document.querySelector('.pause-button');
        
        if (this.isAudioPaused) {
            // Resume audio
            this.playBackgroundMusic();
            if (this.characterAudio) {
                this.characterAudio.play().catch(e => console.log('Character audio play failed:', e));
            }
            pauseButton.textContent = 'Pause';
            this.isAudioPaused = false;
        } else {
            // Pause audio
            this.stopAllAudio();
            pauseButton.textContent = 'Resume';
            this.isAudioPaused = true;
        }
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Function to be called when play button is clicked
function playGameWithAudio() {
    // Get selected characters from the global selectedCharacters array
    if (typeof selectedCharacters !== 'undefined' && selectedCharacters.length > 0) {
        audioManager.handlePlayButtonClick(selectedCharacters);
    } else {
        console.log('No characters selected');
    }
}

// Make toggleAudio globally available
window.toggleAudio = function() {
    audioManager.toggleAudio();
};

// Make playClickSound globally available
window.playClickSound = function() {
    audioManager.playClickSound();
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, audioManager };
}