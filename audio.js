// Audio management for ONU Fordham Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.characterAudio = null;
        this.clickSound = null;
        this.isPlaying = false;
        this.isAudioPaused = false;
        this.pauseDuration = 6000; // 6 seconds in milliseconds (editable)
        this.initialDelay = 1000; // 1 second delay before character audio starts (editable)
        this.audioSequence = null; // Track current audio sequence
        
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
        this.backgroundMusic.volume = 0.1; // Much quieter background music
    }
    
    loadClickSound() {
        this.clickSound = new Audio('static/audio/click.mp3');
        this.clickSound.volume = 0.7; // Click sound volume
    }
    
    // Play background music
    playBackgroundMusic() {
        if (this.backgroundMusic) {
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
        
        // Add configurable delay before starting character audio sequence
        setTimeout(() => {
            this.playAudioSequence(charactersWithAudio);
        }, this.initialDelay);
    }
    
    // Play audio sequence with configurable pauses between lines
    playAudioSequence(charactersWithAudio) {
        let currentIndex = 0;
        
        // Store the sequence for potential control
        this.audioSequence = {
            characters: charactersWithAudio,
            currentIndex: 0,
            isPlaying: true
        };
        
        const playNextAudio = () => {
            if (currentIndex >= charactersWithAudio.length || !this.audioSequence.isPlaying) {
                console.log('Audio sequence completed');
                this.audioSequence = null;
                return;
            }
            
            const character = charactersWithAudio[currentIndex];
            const characterType = this.characterAudioMap[character];
            const audioFile = this.getRandomAudioFile(characterType);
            
            if (audioFile) {
                this.playAudioFile(audioFile, characterType);
                
                // Set up next audio after current one finishes + pause
                this.characterAudio.addEventListener('ended', () => {
                    if (this.audioSequence && this.audioSequence.isPlaying) {
                        setTimeout(() => {
                            currentIndex++;
                            this.audioSequence.currentIndex = currentIndex;
                            playNextAudio();
                        }, this.pauseDuration); // Use configurable pause duration
                    }
                }, { once: true }); // Only listen once
            } else {
                // If no audio file, move to next character after pause
                if (this.audioSequence && this.audioSequence.isPlaying) {
                    setTimeout(() => {
                        currentIndex++;
                        this.audioSequence.currentIndex = currentIndex;
                        playNextAudio();
                    }, this.pauseDuration);
                }
            }
        };
        
        // Start the sequence
        playNextAudio();
    }
    
    // Set pause duration between audio lines (in milliseconds)
    setPauseDuration(durationMs) {
        this.pauseDuration = durationMs;
        console.log(`Pause duration set to ${durationMs}ms (${durationMs/1000}s)`);
    }
    
    // Set initial delay before character audio starts (in milliseconds)
    setInitialDelay(delayMs) {
        this.initialDelay = delayMs;
        console.log(`Initial delay set to ${delayMs}ms (${delayMs/1000}s)`);
    }
    
    // Stop current audio sequence
    stopAudioSequence() {
        if (this.audioSequence) {
            this.audioSequence.isPlaying = false;
            this.stopCharacterAudio();
            this.audioSequence = null;
            console.log('Audio sequence stopped');
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
    
    // Stop only character audio (keep background music running)
    stopCharacterAudio() {
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
        
        // Play background music immediately
        this.playBackgroundMusic();
        
        // Play character audio after a 1 second delay (handled in playCharacterAudio method)
        if (window.selectedCharacters && window.selectedCharacters.length > 0) {
            this.playCharacterAudio(window.selectedCharacters);
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
            // Resume character audio (background music keeps running)
            if (this.characterAudio) {
                this.characterAudio.play().catch(e => console.log('Character audio play failed:', e));
            }
            pauseButton.textContent = 'Pause';
            this.isAudioPaused = false;
        } else {
            // Pause only character audio (keep background music running)
            this.stopCharacterAudio();
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

// Make audio sequence control functions globally available
window.setPauseDuration = function(durationMs) {
    audioManager.setPauseDuration(durationMs);
};

window.stopAudioSequence = function() {
    audioManager.stopAudioSequence();
};

// Example usage functions for easy testing
window.setPauseTo3Seconds = function() {
    audioManager.setPauseDuration(3000);
};

window.setPauseTo6Seconds = function() {
    audioManager.setPauseDuration(6000);
};

window.setPauseTo10Seconds = function() {
    audioManager.setPauseDuration(10000);
};

// Make initial delay control functions globally available
window.setInitialDelay = function(delayMs) {
    audioManager.setInitialDelay(delayMs);
};

// Example usage functions for initial delay
window.setInitialDelayToHalfSecond = function() {
    audioManager.setInitialDelay(500);
};

window.setInitialDelayTo1Second = function() {
    audioManager.setInitialDelay(1000);
};

window.setInitialDelayTo2Seconds = function() {
    audioManager.setInitialDelay(2000);
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, audioManager };
}