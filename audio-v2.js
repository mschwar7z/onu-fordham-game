// At the very top of the file (line 1):
const AUDIO_BASE_URL = 'https://onu-fordham-audio.s3.us-east-2.amazonaws.com/audio/';

// Audio management for ONU Fordham Game - V2 (Promise-based)
class AudioManager {
    constructor() {
        // State
        this.isPaused = false;
        this.isStopped = false;
        this.isPlaying = false; // Track if a sequence is currently playing
        this.currentAudio = null;
        this.backgroundMusic = null;
        this.clickSound = null;
        
        // Timing configuration
        this.initialDelay = 1000; // 1 second delay before sequence starts
        
        // Oracle interaction state
        this.oracleSelectedLine = null;
        this.oracleRandomNumber = null;
        this.oracleUserGuess = null;
        this.oracleUserChoice = null;
        
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Volume settings (mobile has lower background music so character voices are clearer)
        this.bgMusicVolume = this.isMobile ? 0.008 : 0.1;
        this.duckedBgMusicVolume = this.isMobile ? 0.001 : 0.03;
        this.characterVolume = this.isMobile ? 1.0 : 0.8;
        this.announcerVolume = 1.0;
        
        // Default card order (play order)
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
        
        // Character ID to audio folder mapping
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
        
        // Audio file paths for each character type
        this.audioFiles = {
            'Shanzeh-Oracle': {
                prefix: AUDIO_BASE_URL + 'Shanzeh-Oracle/oracle_line_',
                lines: 13
            },
            'Julia-Doppelganger': {
                prefix: AUDIO_BASE_URL + 'Julia-Doppelganger/doppelganger_line_',
                lines: 11
            },
            'Andy-Werewolf': {
                prefix: AUDIO_BASE_URL + 'Andy-Werewolf/werewolf_line_',
                lines: 2
            },
            'Sofia-Minion': {
                prefix: AUDIO_BASE_URL + 'Sofia-Minion/minion_line_',
                lines: 2
            },
            'Angie-Seer': {
                prefix: AUDIO_BASE_URL + 'Angie-Seer/seer_line_',
                lines: 2
            },
            'Charlie-Robber': {
                prefix: AUDIO_BASE_URL + 'Charlie-Robber/robber_line_',
                lines: 2
            },
            'Sam-Troublemaker': {
                prefix: AUDIO_BASE_URL + 'Sam-Troublemaker/troublemaker_line_',
                lines: 2
            },
            'Ethan-Drunk': {
                prefix: AUDIO_BASE_URL + 'Ethan-Drunk/drunk_line_',
                lines: 2
            },
            'Luke-Insomniac': {
                prefix: AUDIO_BASE_URL + 'Luke-Insomniac/insomniac_line_',
                lines: 2
            },
            'Mia-Revealer': {
                prefix: AUDIO_BASE_URL + 'Mia-Revealer/revealer_line_',
                lines: 2
            },
            'Quinn-Mortician': {
                prefix: AUDIO_BASE_URL + 'Quinn-Mortician/mortician_line_',
                lines: 6
            }
        };
        
        // Announcer audio
        this.announcerFiles = {
            start: AUDIO_BASE_URL + 'Shah-Announcer/shah_line_1.mp3',
            end: AUDIO_BASE_URL + 'Shah-Announcer/shah_line_2.mp3'
        };
        
        // Initialize audio elements
        this.init();
    }
    
    init() {
        console.log('[AudioManager] Initializing... Mobile:', this.isMobile);
        this.loadBackgroundMusic();
        this.loadClickSound();
    }
    
    // Helper to get audio file path for a character line
    getAudioPath(characterType, lineNumber) {
        const config = this.audioFiles[characterType];
        if (!config) return null;
        return `${config.prefix}${lineNumber}.mp3`;
    }
    
    // ==================== Background Music ====================
    
    loadBackgroundMusic() {
        this.backgroundMusic = new Audio(AUDIO_BASE_URL + 'background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.bgMusicVolume;
        
        if (this.isMobile) {
            this.backgroundMusic.preload = 'auto';
        }
        
        console.log('[AudioManager] Background music loaded, volume:', this.bgMusicVolume);
    }
    
    playBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(e => {
                console.warn('[AudioManager] Background music play failed:', e);
            });
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    duckBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.duckedBgMusicVolume;
        }
    }
    
    restoreBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.bgMusicVolume;
        }
    }
    
    // ==================== Click Sound ====================
    
    loadClickSound() {
        this.clickSound = new Audio(AUDIO_BASE_URL + 'click.mp3');
        this.clickSound.volume = 0.7;
    }
    
    playClickSound() {
        if (this.clickSound) {
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(e => {
                console.warn('[AudioManager] Click sound play failed:', e);
            });
        }
    }
    
    // ==================== Promise-Based Playback ====================
    
    /**
     * Play an audio file and return a Promise that resolves when it ends
     * @param {string} file - Path to the audio file
     * @param {number} volume - Volume level (0-1)
     * @returns {Promise<void>}
     */
    playAudio(file, volume = 0.8) {
        return new Promise((resolve) => {
            // Check if stopped before starting
            if (this.isStopped) {
                console.log('[playAudio] Sequence stopped, skipping:', file);
                resolve();
                return;
            }
            
            // Clean up previous audio completely
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.src = '';
                this.currentAudio = null;
            }
            
            let hasResolved = false;
            const safeResolve = () => {
                if (hasResolved) return;
                hasResolved = true;
                resolve();
            };
            
            // Create new audio element
            this.currentAudio = new Audio(file);
            this.currentAudio.volume = volume;
            
            // Mobile-specific settings
            if (this.isMobile) {
                this.currentAudio.volume = 1.0; // Max volume on mobile
                this.currentAudio.preload = 'auto';
                this.currentAudio.setAttribute('playsinline', '');
                this.currentAudio.setAttribute('webkit-playsinline', '');
                this.duckBackgroundMusic();
            }
            
            // Cleanup function
            const cleanup = () => {
                if (this.currentAudio) {
                    this.currentAudio.removeEventListener('ended', onEnded);
                    this.currentAudio.removeEventListener('error', onError);
                }
                if (this.isMobile) {
                    this.restoreBackgroundMusic();
                }
            };
            
            // Set up ended listener
            const onEnded = () => {
                console.log('[playAudio] Ended:', file);
                cleanup();
                safeResolve();
            };
            
            // Set up error listener
            const onError = (e) => {
                console.error('[playAudio] Error playing:', file, e);
                cleanup();
                safeResolve(); // Resolve anyway to continue sequence
            };
            
            this.currentAudio.addEventListener('ended', onEnded, { once: true });
            this.currentAudio.addEventListener('error', onError, { once: true });
            
            // Play the audio
            console.log('[playAudio] Playing:', file, 'at volume:', this.currentAudio.volume);
            this.currentAudio.play().catch(e => {
                console.error('[playAudio] Play failed:', file, e);
                cleanup();
                safeResolve(); // Resolve anyway to continue sequence
            });
        });
    }
    
    /**
     * Wait for a specified duration, respecting pause state
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    wait(ms) {
        return new Promise((resolve) => {
            if (this.isStopped || ms <= 0) {
                resolve();
                return;
            }
            
            console.log('[wait] Waiting', ms, 'ms');
            
            const startTime = Date.now();
            let remainingTime = ms;
            let timeoutId = null;
            
            const checkAndWait = () => {
                if (this.isStopped) {
                    resolve();
                    return;
                }
                
                if (this.isPaused) {
                    // Check again in 100ms
                    timeoutId = setTimeout(checkAndWait, 100);
                } else {
                    // Continue waiting
                    if (remainingTime > 0) {
                        const waitTime = Math.min(remainingTime, 100);
                        timeoutId = setTimeout(() => {
                            remainingTime -= waitTime;
                            if (remainingTime <= 0) {
                                resolve();
                            } else {
                                checkAndWait();
                            }
                        }, waitTime);
                    } else {
                        resolve();
                    }
                }
            };
            
            checkAndWait();
        });
    }
    
    /**
     * Pause the current audio and sequence
     */
    pause() {
        console.log('[AudioManager] Pausing');
        this.isPaused = true;
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
        }
    }
    
    /**
     * Resume the current audio and sequence
     */
    resume() {
        console.log('[AudioManager] Resuming');
        this.isPaused = false;
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play().catch(e => {
                console.warn('[AudioManager] Resume play failed:', e);
            });
        }
    }
    
    /**
     * Toggle pause/resume state
     * @returns {boolean} New pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
        return this.isPaused;
    }
    
    /**
     * Stop the current sequence completely
     */
    stopSequence() {
        console.log('[AudioManager] Stopping sequence');
        this.isStopped = true;
        this.isPaused = false;
        this.isPlaying = false;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }
        
        if (this.isMobile) {
            this.restoreBackgroundMusic();
        }
    }
    
    /**
     * Reset stop state to allow new sequences
     */
    resetState() {
        this.isStopped = false;
        this.isPaused = false;
        this.isPlaying = false;
    }
    
    /**
     * Stop all audio (background music, current audio, etc.)
     */
    stopAllAudio() {
        this.stopSequence();
        this.stopBackgroundMusic();
    }
    
    // ==================== Oracle Interactive Dialogs ====================
    
    /**
     * Show Oracle number guessing dialog
     * @returns {Promise<number>} The follow-up line number (3 for wrong, 4 for correct)
     */
    showOracleNumberGuess() {
        return new Promise((resolve) => {
            // Generate random number 1-10
            this.oracleRandomNumber = Math.floor(Math.random() * 10) + 1;
            
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.id = 'oracle-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #1a1a1a;
                border: 2px solid #ff6b35;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                color: white;
                font-family: 'Josefin Sans', sans-serif;
                max-width: 400px;
                width: 90%;
            `;
            
            modal.innerHTML = `
                <h2 style="color: #ff6b35; margin-bottom: 20px;">Oracle's Challenge</h2>
                <p style="margin-bottom: 20px;">The Oracle has selected a number between 1 and 10. Can you guess it?</p>
                <input type="number" id="oracleGuess" min="1" max="10" 
                       style="width: 60px; padding: 10px; font-size: 18px; text-align: center; 
                              border: 2px solid #ff6b35; border-radius: 5px; background: #2a2a2a; color: white;"
                       placeholder="1-10">
                <br><br>
                <button id="oracleSubmit" style="background: linear-gradient(45deg, #ff6b35, #f7931e);
                        color: white; border: none; padding: 12px 24px; border-radius: 5px; 
                        font-size: 16px; cursor: pointer; margin-right: 10px;">
                    Submit Guess
                </button>
                <button id="oracleSkip" style="background: #666; color: white; border: none; 
                        padding: 12px 24px; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    Skip (Wrong)
                </button>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            const input = document.getElementById('oracleGuess');
            input.focus();
            
            let resolved = false;
            const cleanup = (lineNumber) => {
                if (resolved) return;
                resolved = true;
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(lineNumber);
            };
            
            // Auto-timeout after 8 seconds
            const timeoutId = setTimeout(() => {
                // Random choice on timeout (10% correct, 90% wrong)
                cleanup(Math.random() < 0.1 ? 4 : 3);
            }, 8000);
            
            document.getElementById('oracleSubmit').onclick = () => {
                clearTimeout(timeoutId);
                const guess = parseInt(input.value);
                if (guess >= 1 && guess <= 10) {
                    const isCorrect = guess === this.oracleRandomNumber;
                    cleanup(isCorrect ? 4 : 3);
                } else {
                    alert('Please enter a number between 1 and 10');
                }
            };
            
            document.getElementById('oracleSkip').onclick = () => {
                clearTimeout(timeoutId);
                cleanup(3); // Wrong
            };
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('oracleSubmit').click();
                }
            });
        });
    }
    
    /**
     * Show Oracle Yes/No dialog
     * @param {number} questionLine - The question line number (5, 8, or 10)
     * @returns {Promise<number>} The follow-up line number based on answer
     */
    showOracleYesNo(questionLine) {
        return new Promise((resolve) => {
            // Define follow-up lines for each question
            const followUps = {
                5: { yes: 6, no: 7 },
                8: { yes: 9, no: 14 },
                10: { yes: 12, no: 11 }
            };
            
            const overlay = document.createElement('div');
            overlay.id = 'oracle-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #1a1a1a;
                border: 2px solid #ff6b35;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                color: white;
                font-family: 'Josefin Sans', sans-serif;
                max-width: 400px;
                width: 90%;
            `;
            
            modal.innerHTML = `
                <h2 style="color: #ff6b35; margin-bottom: 20px;">Oracle's Question</h2>
                <p style="margin-bottom: 30px;">The Oracle has asked a question. What is your answer?</p>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="oracleYes" style="background: linear-gradient(45deg, #4CAF50, #45a049);
                            color: white; border: none; padding: 15px 30px; border-radius: 5px; 
                            font-size: 18px; cursor: pointer; min-width: 100px;">
                        YES
                    </button>
                    <button id="oracleNo" style="background: linear-gradient(45deg, #f44336, #da190b);
                            color: white; border: none; padding: 15px 30px; border-radius: 5px; 
                            font-size: 18px; cursor: pointer; min-width: 100px;">
                        NO
                    </button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            let resolved = false;
            const cleanup = (lineNumber) => {
                if (resolved) return;
                resolved = true;
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(lineNumber);
            };
            
            // Auto-timeout after 8 seconds (random choice)
            const timeoutId = setTimeout(() => {
                const fu = followUps[questionLine];
                cleanup(Math.random() < 0.5 ? fu.yes : fu.no);
            }, 8000);
            
            document.getElementById('oracleYes').onclick = () => {
                clearTimeout(timeoutId);
                cleanup(followUps[questionLine].yes);
            };
            
            document.getElementById('oracleNo').onclick = () => {
                clearTimeout(timeoutId);
                cleanup(followUps[questionLine].no);
            };
        });
    }
    
    /**
     * Play Oracle's full sequence with interactive elements
     * @returns {Promise<Array>} Array of audio items to play
     */
    async playOracleSequence() {
        const items = [];
        const characterType = 'Shanzeh-Oracle';
        
        // Line 1 always plays first
        items.push({ file: this.getAudioPath(characterType, 1), pauseAfter: 0 });
        
        // Select random line with probabilities: 5% for 2, 20% for 5, 20% for 8, 55% for 10
        const random = Math.random();
        let selectedLine;
        if (random < 0.05) {
            selectedLine = 2;
        } else if (random < 0.25) {
            selectedLine = 5;
        } else if (random < 0.45) {
            selectedLine = 8;
        } else {
            selectedLine = 10;
        }
        
        this.oracleSelectedLine = selectedLine;
        
        // Add the selected question line
        items.push({ 
            file: this.getAudioPath(characterType, selectedLine), 
            pauseAfter: 0,
            isInteractive: true,
            interactionType: selectedLine === 2 ? 'number' : 'yesno',
            questionLine: selectedLine
        });
        
        return items;
    }
    
    /**
     * Handle Oracle interaction and get follow-up lines
     * @param {object} item - The interactive item
     * @returns {Promise<Array>} Follow-up audio items
     */
    async handleOracleInteraction(item) {
        const characterType = 'Shanzeh-Oracle';
        const followUpItems = [];
        
        let followUpLine;
        if (item.interactionType === 'number') {
            followUpLine = await this.showOracleNumberGuess();
        } else {
            followUpLine = await this.showOracleYesNo(item.questionLine);
        }
        
        // Add the follow-up line
        followUpItems.push({ file: this.getAudioPath(characterType, followUpLine), pauseAfter: 0 });
        
        // Line 13 always plays at the end
        followUpItems.push({ file: this.getAudioPath(characterType, 13), pauseAfter: 0 });
        
        return followUpItems;
    }
    
    // ==================== Sequence Builder ====================
    
    /**
     * Get the line sequence for a specific character type
     * Returns array of { file, pauseAfter } objects
     * @param {string} characterType - e.g., 'Andy-Werewolf'
     * @returns {Array<{file: string, pauseAfter: number}>}
     */
    getCharacterLines(characterType) {
        const lines = [];
        
        switch (characterType) {
            case 'Shanzeh-Oracle':
                // Oracle has interactive elements - handled specially
                // Select random line with probabilities: 5% for 2, 20% for 5, 20% for 8, 55% for 10
                const random = Math.random();
                let selectedLine;
                if (random < 0.05) {
                    selectedLine = 2;
                } else if (random < 0.25) {
                    selectedLine = 5;
                } else if (random < 0.45) {
                    selectedLine = 8;
                } else {
                    selectedLine = 10;
                }
                this.oracleSelectedLine = selectedLine;
                
                // Line 1 always
                lines.push({ file: this.getAudioPath(characterType, 1), pauseAfter: 0 });
                
                // Selected question line (interactive)
                lines.push({ 
                    file: this.getAudioPath(characterType, selectedLine), 
                    pauseAfter: 0,
                    isInteractive: true,
                    interactionType: selectedLine === 2 ? 'number' : 'yesno',
                    questionLine: selectedLine
                });
                break;
                
            case 'Julia-Doppelganger':
                // Doppelganger: line 1 → 12s pause → lines 2, 3, 4
                // Conditional lines are added in buildSequence based on other characters
                lines.push({ file: this.getAudioPath(characterType, 1), pauseAfter: 12000 });
                lines.push({ file: this.getAudioPath(characterType, 2), pauseAfter: 0 });
                lines.push({ file: this.getAudioPath(characterType, 3), pauseAfter: 0 });
                lines.push({ file: this.getAudioPath(characterType, 4), pauseAfter: 0 });
                break;
                
            case 'Quinn-Mortician':
                // Mortician: line 1 → 1s pause → random line 2-5 → 6s pause → line 6
                const morticianRandomLine = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, or 5
                lines.push({ file: this.getAudioPath(characterType, 1), pauseAfter: 1000 });
                lines.push({ file: this.getAudioPath(characterType, morticianRandomLine), pauseAfter: 6000 });
                lines.push({ file: this.getAudioPath(characterType, 6), pauseAfter: 0 });
                break;
                
            default:
                // Standard 2-line characters: line 1 → 6s pause → line 2
                lines.push({ file: this.getAudioPath(characterType, 1), pauseAfter: 6000 });
                lines.push({ file: this.getAudioPath(characterType, 2), pauseAfter: 0 });
                break;
        }
        
        return lines;
    }
    
    /**
     * Get Doppelganger conditional lines based on other selected characters
     * @param {Array<string>} selectedCharacters - All selected character IDs
     * @returns {Array<{afterCharacter: string, lines: Array}>}
     */
    getDoppelgangerConditionals(selectedCharacters) {
        const conditionals = [];
        
        // After Insomniac: line 5 → 12s pause → line 4
        if (selectedCharacters.includes('insomniac-card')) {
            conditionals.push({
                afterCharacter: 'insomniac-card',
                lines: [
                    { file: this.getAudioPath('Julia-Doppelganger', 5), pauseAfter: 12000 },
                    { file: this.getAudioPath('Julia-Doppelganger', 4), pauseAfter: 0 }
                ]
            });
        }
        
        // After Revealer: line 6 → 12s pause → line 4
        if (selectedCharacters.includes('revealer-card')) {
            conditionals.push({
                afterCharacter: 'revealer-card',
                lines: [
                    { file: this.getAudioPath('Julia-Doppelganger', 6), pauseAfter: 12000 },
                    { file: this.getAudioPath('Julia-Doppelganger', 4), pauseAfter: 0 }
                ]
            });
        }
        
        // After Mortician: line 7 → random line 8-11 → line 4
        if (selectedCharacters.includes('mortician-card')) {
            const randomLine = Math.floor(Math.random() * 4) + 8; // 8, 9, 10, or 11
            conditionals.push({
                afterCharacter: 'mortician-card',
                lines: [
                    { file: this.getAudioPath('Julia-Doppelganger', 7), pauseAfter: 0 },
                    { file: this.getAudioPath('Julia-Doppelganger', randomLine), pauseAfter: 0 },
                    { file: this.getAudioPath('Julia-Doppelganger', 4), pauseAfter: 0 }
                ]
            });
        }
        
        return conditionals;
    }
    
    /**
     * Build the complete audio sequence for selected characters
     * @param {Array<string>} selectedCharacters - Array of character card IDs
     * @returns {Array<{type: string, file: string, pauseAfter: number, characterType?: string}>}
     */
    buildSequence(selectedCharacters) {
        const sequence = [];
        
        // Filter to only characters with audio and deduplicate by character type
        const seenTypes = new Set();
        const charactersWithAudio = [];
        
        // Sort by default card order
        const orderedCharacters = this.defaultCardOrder.filter(cardId => 
            selectedCharacters.includes(cardId)
        );
        
        for (const cardId of orderedCharacters) {
            const characterType = this.characterAudioMap[cardId];
            if (characterType && this.audioFiles[characterType] && !seenTypes.has(characterType)) {
                seenTypes.add(characterType);
                charactersWithAudio.push({ cardId, characterType });
            }
        }
        
        if (charactersWithAudio.length === 0) {
            console.warn('[buildSequence] No characters with audio selected');
            return sequence;
        }
        
        // Get Doppelganger conditionals if Doppelganger is selected
        const hasDoppelganger = selectedCharacters.includes('doppelganger-card');
        const doppelgangerConditionals = hasDoppelganger ? 
            this.getDoppelgangerConditionals(selectedCharacters) : [];
        
        // Create a map for quick lookup of conditionals by character
        const conditionalMap = {};
        for (const cond of doppelgangerConditionals) {
            conditionalMap[cond.afterCharacter] = cond.lines;
        }
        
        // Add announcer start
        sequence.push({
            type: 'announcer',
            file: this.announcerFiles.start,
            pauseAfter: 2000 // 2s pause after announcer
        });
        
        // Add each character's lines
        for (let i = 0; i < charactersWithAudio.length; i++) {
            const { cardId, characterType } = charactersWithAudio[i];
            const characterLines = this.getCharacterLines(characterType);
            
            // Add each line for this character
            for (let j = 0; j < characterLines.length; j++) {
                const line = characterLines[j];
                const isLastLineOfCharacter = j === characterLines.length - 1;
                const isLastCharacter = i === charactersWithAudio.length - 1;
                
                // Determine pause after this line
                let pauseAfter = line.pauseAfter;
                
                // If this is the last line of a character (not the last character),
                // add 2s pause before next character
                if (isLastLineOfCharacter && !isLastCharacter) {
                    pauseAfter = Math.max(pauseAfter, 2000);
                }
                
                const sequenceItem = {
                    type: 'character',
                    file: line.file,
                    pauseAfter: pauseAfter,
                    characterType: characterType,
                    cardId: cardId
                };
                
                // Copy interactive properties if present
                if (line.isInteractive) {
                    sequenceItem.isInteractive = true;
                    sequenceItem.interactionType = line.interactionType;
                    sequenceItem.questionLine = line.questionLine;
                }
                
                sequence.push(sequenceItem);
            }
            
            // Add Doppelganger conditional lines after this character (if applicable)
            if (hasDoppelganger && conditionalMap[cardId]) {
                const conditionalLines = conditionalMap[cardId];
                for (let k = 0; k < conditionalLines.length; k++) {
                    const condLine = conditionalLines[k];
                    const isLastConditional = k === conditionalLines.length - 1;
                    
                    sequence.push({
                        type: 'doppelganger_conditional',
                        file: condLine.file,
                        pauseAfter: isLastConditional ? 2000 : condLine.pauseAfter,
                        characterType: 'Julia-Doppelganger',
                        cardId: 'doppelganger-card'
                    });
                }
            }
        }
        
        // Add announcer end
        sequence.push({
            type: 'announcer',
            file: this.announcerFiles.end,
            pauseAfter: 0
        });
        
        console.log('[buildSequence] Built sequence with', sequence.length, 'items');
        return sequence;
    }
    
    // ==================== Sequence Player ====================
    
    /**
     * Play a sequence of audio items
     * @param {Array<{type: string, file: string, pauseAfter: number}>} sequence
     * @returns {Promise<void>}
     */
    async playSequence(sequence) {
        console.log('[playSequence] Starting sequence with', sequence.length, 'items');
        
        for (let i = 0; i < sequence.length; i++) {
            // Check if stopped
            if (this.isStopped) {
                console.log('[playSequence] Sequence stopped at item', i);
                break;
            }
            
            // Wait while paused
            while (this.isPaused && !this.isStopped) {
                await this.wait(100);
            }
            
            if (this.isStopped) break;
            
            const item = sequence[i];
            const volume = item.type === 'announcer' ? this.announcerVolume : this.characterVolume;
            
            console.log(`[playSequence] Playing item ${i + 1}/${sequence.length}:`, item.type, item.file);
            
            // Play the audio
            await this.playAudio(item.file, volume);
            
            // Check if stopped after playing
            if (this.isStopped) break;
            
            // Handle interactive Oracle elements
            if (item.isInteractive && item.characterType === 'Shanzeh-Oracle') {
                console.log('[playSequence] Handling Oracle interaction for line', item.questionLine);
                
                // Show appropriate dialog and get follow-up line
                let followUpLine;
                if (item.interactionType === 'number') {
                    followUpLine = await this.showOracleNumberGuess();
                } else {
                    followUpLine = await this.showOracleYesNo(item.questionLine);
                }
                
                if (this.isStopped) break;
                
                // Play the follow-up line
                const followUpFile = this.getAudioPath('Shanzeh-Oracle', followUpLine);
                console.log('[playSequence] Playing Oracle follow-up line', followUpLine);
                await this.playAudio(followUpFile, volume);
                
                if (this.isStopped) break;
                
                // Play line 13 (closing line)
                const closingFile = this.getAudioPath('Shanzeh-Oracle', 13);
                console.log('[playSequence] Playing Oracle closing line 13');
                await this.playAudio(closingFile, volume);
                
                if (this.isStopped) break;
            }
            
            // Wait for pause duration
            if (item.pauseAfter > 0) {
                await this.wait(item.pauseAfter);
            }
        }
        
        console.log('[playSequence] Sequence complete');
    }
    
    /**
     * Start playing audio for selected characters
     * This is the main entry point for game audio
     * @param {Array<string>} selectedCharacters - Array of character card IDs
     */
    async startGame(selectedCharacters) {
        // Prevent duplicate starts
        if (this.isPlaying) {
            console.warn('[startGame] Already playing, ignoring duplicate call');
            return;
        }
        
        console.log('[startGame] Starting with characters:', selectedCharacters);
        
        // Reset state
        this.resetState();
        this.isPlaying = true;
        
        // Start background music
        this.playBackgroundMusic();
        
        // Wait for initial delay
        await this.wait(this.initialDelay);
        
        if (this.isStopped) {
            this.isPlaying = false;
            return;
        }
        
        // Build and play sequence
        const sequence = this.buildSequence(selectedCharacters);
        await this.playSequence(sequence);
        
        this.isPlaying = false;
        console.log('[startGame] Game audio complete');
    }
}

// Global instance
const audioManager = new AudioManager();

// ==================== Global Functions ====================
// These provide backward compatibility with existing game.html

// Click sound
window.playClickSound = function() {
    audioManager.playClickSound();
};

// Toggle audio pause/resume
window.toggleAudio = function() {
    const isPaused = audioManager.togglePause();
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }
    return isPaused;
};

// Start game with selected characters
window.playGameWithAudio = function() {
    if (typeof selectedCharacters !== 'undefined' && selectedCharacters.length > 0) {
        audioManager.startGame(selectedCharacters);
    } else if (typeof window.selectedCharacters !== 'undefined' && window.selectedCharacters.length > 0) {
        audioManager.startGame(window.selectedCharacters);
    } else {
        console.log('[playGameWithAudio] No characters selected');
    }
};

// Stop all audio
window.stopAllAudio = function() {
    audioManager.stopAllAudio();
};

// Stop just the sequence (keep background music)
window.stopAudioSequence = function() {
    audioManager.stopSequence();
};

// Play background music
window.playBackgroundMusic = function() {
    audioManager.playBackgroundMusic();
};

// Stop background music
window.stopBackgroundMusic = function() {
    audioManager.stopBackgroundMusic();
};

// Preview the audio sequence (for debugging)
window.previewAudioSequence = function(characters) {
    const chars = characters || window.selectedCharacters || [];
    const sequence = audioManager.buildSequence(chars);
    console.log('[Preview] Audio sequence:');
    sequence.forEach((item, i) => {
        console.log(`  ${i + 1}. [${item.type}] ${item.file} (pause: ${item.pauseAfter}ms)`);
    });
    return sequence;
};

// Initialize game (called from game.html)
window.initializeGameAudio = function() {
    // Start background music
    audioManager.playBackgroundMusic();
    
    // Start character audio if characters are selected
    if (typeof window.selectedCharacters !== 'undefined' && window.selectedCharacters.length > 0) {
        audioManager.startGame(window.selectedCharacters);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, audioManager };
}

