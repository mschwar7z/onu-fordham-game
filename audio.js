// Audio management for ONU Fordham Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.characterAudio = null;
        this.announcerAudio = null;
        this.clickSound = null;
        this.isPlaying = false;
        this.isAudioPaused = false;
        this.pauseDuration = 0; // No pause between audio lines
        this.initialDelay = 1000; // 1 second delay before character audio starts (editable)
        this.audioSequence = null; // Track current audio sequence
        this.audioPlayOrder = null; // Custom audio play order
        
        // Default card order as they appear in the HTML
        this.defaultCardOrder = [
            'oracle-card',
            'doppelganger-card', 
            'werewolf1-card',
            'werewolf2-card',
            'minion-card',
            'seer-card',
            'robber-card',
            'troublemaker-card',
            'drunk-card',
            'insomniac-card',
            'revealer-card',
            'mortician-card'
        ];
        
        // Character ID to audio file mapping
        this.characterAudioMap = {
            'oracle-card': 'Shanzeh-Oracle', 
            'doppelganger-card': 'Julia-Doppelganger', 
            'werewolf1-card': 'Andy-Werewolf',
            'werewolf2-card': 'Andy-Werewolf',
            'minion-card': 'Sofia-Minion',
            'seer-card': 'Angie-Seer',
            'robber-card': 'Charlie-Robber',
            'troublemaker-card': 'Sam-Troublemaker',
            'drunk-card': 'Ethan-Drunk',
            'insomniac-card': 'Luke-Insomniac',
            'revealer-card': 'Mia-Revealer',
            'mortician-card': 'Quinn-Mortician'
        };

        this.announcerAudioMap = {
            'Shah-Announcer': 'static/audio/Shah-Announcer/shah_line_1.mp3',
        };

        // Available audio files for each character type
        this.audioFiles = {
            'Shanzeh-Oracle': [
                'static/audio/Shanzeh-Oracle/oracle_line_1.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_2.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_3.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_4.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_5.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_6.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_7.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_8.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_9.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_10.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_11.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_12.mp3',
                'static/audio/Shanzeh-Oracle/oracle_line_13.mp3'
            ],
            'Julia-Doppelganger': [
                'static/audio/Julia-Doppelganger/doppelganger_line_1.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_2.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_3.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_5.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_6.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_7.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_8.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_9.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_10.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_11.mp3'
            ],
            'Andy-Werewolf': [
                'static/audio/Andy-Werewolf/werewolf_line_1.mp3',
                'static/audio/Andy-Werewolf/werewolf_line_2.mp3'
            ],
            'Sofia-Minion': [
                'static/audio/Sofia-Minion/minion_line_1.mp3',
                'static/audio/Sofia-Minion/minion_line_2.mp3'
            ],
            'Charlie-Robber': [
                'static/audio/Charlie-Robber/robber_line_1.mp3',
                'static/audio/Charlie-Robber/robber_line_2.mp3'
            ],
            'Sam-Troublemaker': [
                'static/audio/Sam-Troublemaker/troublemaker_line_1.mp3',
                'static/audio/Sam-Troublemaker/troublemaker_line_2.mp3'
            ],
            'Ethan-Drunk': [
                'static/audio/Ethan-Drunk/drunk_line_1.mp3',
                'static/audio/Ethan-Drunk/drunk_line_2.mp3'
            ],
            'Luke-Insomniac': [
                'static/audio/Luke-Insomniac/insomniac_line_1.mp3',
                'static/audio/Luke-Insomniac/insomniac_line_2.mp3'
            ],
            'Mia-Revealer': [
                'static/audio/Mia-Revealer/revealer_line_1.mp3',
                'static/audio/Mia-Revealer/revealer_line_2.mp3'
            ],
            'Quinn-Mortician': [
                'static/audio/Quinn-Mortician/mortician_line_1.mp3',
                'static/audio/Quinn-Mortician/mortician_line_2.mp3',
                'static/audio/Quinn-Mortician/mortician_line_3.mp3',
                'static/audio/Quinn-Mortician/mortician_line_4.mp3',
                'static/audio/Quinn-Mortician/mortician_line_5.mp3',
                'static/audio/Quinn-Mortician/mortician_line_6.mp3'
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
        
        // Load background music, announcer, and click sound
        this.loadBackgroundMusic();
        this.loadAnnouncerAudio();
        this.loadClickSound();
    }
    
    loadBackgroundMusic() {
        this.backgroundMusic = new Audio('static/audio/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.1; // Much quieter background music
    }
    
    loadAnnouncerAudio() {
        this.announcerAudio = new Audio('static/audio/Shah-Announcer/shah_line_1.mp3');
        this.announcerAudio.volume = 0.9; // Announcer volume (louder than other audio)
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
    
    // Play announcer audio
    playAnnouncerAudio() {
        if (this.announcerAudio) {
            // Reset to beginning in case it's already playing
            this.announcerAudio.currentTime = 0;
            this.announcerAudio.play().catch(e => {
                console.log('Announcer audio play failed:', e);
            });
        }
    }
    
    // Stop announcer audio
    stopAnnouncerAudio() {
        if (this.announcerAudio) {
            this.announcerAudio.pause();
            this.announcerAudio.currentTime = 0;
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
        
        // Create complete audio sequence with announcer at beginning and end
        const completeSequence = this.createAudioSequence(charactersWithAudio);
        
        // Add configurable delay before starting character audio sequence
        setTimeout(() => {
            this.playCompleteAudioSequence(completeSequence);
        }, this.initialDelay);
    }
    
    // Create complete audio sequence with announcer lines
    createAudioSequence(charactersWithAudio) {
        const sequence = [];
        
        // Add announcer at the beginning
        sequence.push({
            type: 'announcer',
            audioFile: 'static/audio/Shah-Announcer/shah_line_1.mp3',
            characterName: 'Shah-Announcer'
        });
        
        // Add character audio in specified order (use card order by default)
        const playOrder = this.audioPlayOrder || this.getCardOrder(charactersWithAudio);
        playOrder.forEach(charId => {
            const characterType = this.characterAudioMap[charId];
            if (characterType && this.audioFiles[characterType]) {
                sequence.push({
                    type: 'character',
                    characterId: charId,
                    characterType: characterType,
                    characterName: characterType
                });
            }
        });
        
        // Add announcer at the end
        sequence.push({
            type: 'announcer',
            audioFile: 'static/audio/Shah-Announcer/shah_line_2.mp3',
            characterName: 'Shah-Announcer'
        });
        
        return sequence;
    }
    
    // Play complete audio sequence (announcer + characters + announcer)
    playCompleteAudioSequence(sequence) {
        let currentIndex = 0;
        
        // Store the sequence for potential control
        this.audioSequence = {
            sequence: sequence,
            currentIndex: 0,
            isPlaying: true
        };
        
        const playNextAudio = () => {
            if (currentIndex >= sequence.length || !this.audioSequence.isPlaying) {
                console.log('Complete audio sequence completed');
                this.audioSequence = null;
                return;
            }
            
            const currentItem = sequence[currentIndex];
            
            if (currentItem.type === 'announcer') {
                // Play announcer audio
                this.playAnnouncerAudioFile(currentItem.audioFile, currentItem.characterName);
                
                // Set up next audio after current one finishes + pause
                this.announcerAudio.addEventListener('ended', () => {
                    if (this.audioSequence && this.audioSequence.isPlaying) {
                        setTimeout(() => {
                            currentIndex++;
                            this.audioSequence.currentIndex = currentIndex;
                            playNextAudio();
                        }, this.pauseDuration);
                    }
                }, { once: true });
                
            } else if (currentItem.type === 'character') {
                // Play character audio
                const audioFile = this.getRandomAudioFile(currentItem.characterType);
                
                if (audioFile) {
                    this.playAudioFile(audioFile, currentItem.characterType);
                    
                    // Set up next audio after current one finishes + pause
                    this.characterAudio.addEventListener('ended', () => {
                        if (this.audioSequence && this.audioSequence.isPlaying) {
                            setTimeout(() => {
                                currentIndex++;
                                this.audioSequence.currentIndex = currentIndex;
                                playNextAudio();
                            }, this.pauseDuration);
                        }
                    }, { once: true });
                } else {
                    // If no audio file, move to next item after pause
                    if (this.audioSequence && this.audioSequence.isPlaying) {
                        setTimeout(() => {
                            currentIndex++;
                            this.audioSequence.currentIndex = currentIndex;
                            playNextAudio();
                        }, this.pauseDuration);
                    }
                }
            }
        };
        
        // Start the sequence
        playNextAudio();
    }
    
    // Play announcer audio file
    playAnnouncerAudioFile(audioFile, characterName) {
        if (this.announcerAudio) {
            this.announcerAudio.pause();
        }
        
        this.announcerAudio = new Audio(audioFile);
        this.announcerAudio.volume = 0.9;
        
        this.announcerAudio.play().then(() => {
            console.log(`Playing ${characterName} audio: ${audioFile}`);
        }).catch(e => {
            console.log('Announcer audio play failed:', e);
        });
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
        this.stopAnnouncerAudio();
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
        // The announcer will be included in the character audio sequence
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
    
    // Set custom audio play order
    setAudioPlayOrder(orderArray) {
        this.audioPlayOrder = orderArray;
        console.log('Audio play order set to:', orderArray);
    }
    
    // Clear custom audio play order (use default order)
    clearAudioPlayOrder() {
        this.audioPlayOrder = null;
        console.log('Audio play order cleared - using card order');
    }
    
    // Get current audio play order
    getAudioPlayOrder() {
        return this.audioPlayOrder || 'Using card order';
    }
    
    // Get card order for selected characters (maintains visual order from HTML)
    getCardOrder(selectedCharacters) {
        return this.defaultCardOrder.filter(cardId => selectedCharacters.includes(cardId));
    }
    
    // Set order to follow card layout order
    setCardOrder(selectedCharacters) {
        const cardOrder = this.getCardOrder(selectedCharacters);
        this.setAudioPlayOrder(cardOrder);
        console.log('Audio play order set to card layout order:', cardOrder);
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

// Make announcer control functions globally available
window.playAnnouncerAudio = function() {
    audioManager.playAnnouncerAudio();
};

window.stopAnnouncerAudio = function() {
    audioManager.stopAnnouncerAudio();
};

// Make audio play order control functions globally available
window.setAudioPlayOrder = function(orderArray) {
    audioManager.setAudioPlayOrder(orderArray);
};

window.clearAudioPlayOrder = function() {
    audioManager.clearAudioPlayOrder();
};

window.getAudioPlayOrder = function() {
    return audioManager.getAudioPlayOrder();
};

// Preset audio play order functions for easy use
window.setCardOrder = function(selectedCharacters) {
    if (!selectedCharacters) {
        console.log('Please provide selectedCharacters array');
        return;
    }
    audioManager.setCardOrder(selectedCharacters);
};

window.setSelectionOrder = function() {
    audioManager.clearAudioPlayOrder();
    console.log('Using selection order (order characters were clicked)');
};

window.setAlphabeticalOrder = function(selectedCharacters) {
    if (!selectedCharacters) {
        console.log('Please provide selectedCharacters array');
        return;
    }
    
    const charactersWithAudio = selectedCharacters.filter(charId => {
        const characterType = audioManager.characterAudioMap[charId];
        return characterType && audioManager.audioFiles[characterType];
    });
    
    // Sort by character name alphabetically
    const sortedOrder = charactersWithAudio.sort((a, b) => {
        const nameA = audioManager.characterAudioMap[a];
        const nameB = audioManager.characterAudioMap[b];
        return nameA.localeCompare(nameB);
    });
    
    audioManager.setAudioPlayOrder(sortedOrder);
    console.log('Audio play order set to alphabetical:', sortedOrder);
};

window.setCustomOrder = function(orderArray) {
    audioManager.setAudioPlayOrder(orderArray);
    console.log('Custom audio play order set:', orderArray);
};

// Helper function to get available character cards from selected characters
window.getAvailableCharacters = function(selectedCharacters) {
    if (!selectedCharacters) {
        console.log('Please provide selectedCharacters array');
        return [];
    }
    
    return selectedCharacters.filter(charId => {
        const characterType = audioManager.characterAudioMap[charId];
        return characterType && audioManager.audioFiles[characterType];
    });
};

// Helper function to preview the complete audio sequence
window.previewAudioSequence = function(selectedCharacters) {
    if (!selectedCharacters) {
        console.log('Please provide selectedCharacters array');
        return;
    }
    
    const charactersWithAudio = selectedCharacters.filter(charId => {
        const characterType = audioManager.characterAudioMap[charId];
        return characterType && audioManager.audioFiles[characterType];
    });
    
    const sequence = audioManager.createAudioSequence(charactersWithAudio);
    console.log('Complete audio sequence preview:');
    sequence.forEach((item, index) => {
        if (item.type === 'announcer') {
            console.log(`${index + 1}. ${item.characterName} (Announcer) - ${item.audioFile}`);
        } else {
            console.log(`${index + 1}. ${item.characterName} (Character) - Random line from ${item.characterType}`);
        }
    });
    return sequence;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, audioManager };
}