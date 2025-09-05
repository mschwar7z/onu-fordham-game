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
        
        // Oracle interaction properties
        this.oracleSelectedLine = null;
        this.oracleRandomNumber = null;
        this.oracleUserGuess = null;
        this.oracleUserChoice = null;
        
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
            'Angie-Seer': [
                'static/audio/Angie-Seer/seer_line_1.mp3',
                'static/audio/Angie-Seer/seer_line_2.mp3'
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
        this.announcerAudio.volume = 1.0; // Maximum volume for announcer
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
    
    // Handle Oracle line 2 number guessing game
    async handleOracleLine2() {
        return new Promise((resolve) => {
            // Generate random number 1-10
            const randomNumber = Math.floor(Math.random() * 10) + 1;
            this.oracleRandomNumber = randomNumber;
            
            // Show input dialog
            this.showOracleNumberInput(randomNumber, resolve);
        });
    }
    
    // Handle Oracle Yes/No interactions for lines 5, 8, and 10
    async handleOracleYesNo(lineNumber) {
        return new Promise((resolve) => {
            this.oracleUserChoice = null; // Reset choice
            this.showOracleYesNoInput(lineNumber, resolve);
        });
    }
    
    // Show Oracle number input dialog
    showOracleNumberInput(randomNumber, callback) {
        // Create modal overlay
        const overlay = document.createElement('div');
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
        
        // Create modal content
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
        
        // Focus on input
        const input = document.getElementById('oracleGuess');
        input.focus();
        
        // Set timeout to auto-hide modal after 8 seconds
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                this.oracleUserGuess = -1; // Set as wrong guess
                document.body.removeChild(overlay);
                callback();
            }
        }, 8000);
        
        // Handle submit
        document.getElementById('oracleSubmit').onclick = () => {
            const guess = parseInt(input.value);
            if (guess >= 1 && guess <= 10) {
                this.oracleUserGuess = guess;
                document.body.removeChild(overlay);
                callback();
            } else {
                alert('Please enter a number between 1 and 10');
            }
        };
        
        // Handle skip (treat as wrong)
        document.getElementById('oracleSkip').onclick = () => {
            this.oracleUserGuess = -1; // Invalid guess
            document.body.removeChild(overlay);
            callback();
        };
        
        // Handle Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('oracleSubmit').click();
            }
        });
    }
    
    // Show Oracle Yes/No input dialog
    showOracleYesNoInput(lineNumber, callback) {
        // Create modal overlay
        const overlay = document.createElement('div');
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
        
        // Create modal content
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
        
        // Set timeout to auto-hide modal after 8 seconds
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                this.oracleUserChoice = 'no'; // Set as no response
                document.body.removeChild(overlay);
                callback();
            }
        }, 8000);
        
        // Handle Yes button
        document.getElementById('oracleYes').onclick = () => {
            this.oracleUserChoice = 'yes';
            document.body.removeChild(overlay);
            callback();
        };
        
        // Handle No button
        document.getElementById('oracleNo').onclick = () => {
            this.oracleUserChoice = 'no';
            document.body.removeChild(overlay);
            callback();
        };
    }
    
    // Get Oracle follow-up line based on guess result
    getOracleFollowUpLine() {
        if (this.oracleSelectedLine === 2) {
            // Check if user guessed correctly
            const isCorrect = this.oracleUserGuess === this.oracleRandomNumber;
            return isCorrect ? 4 : 3; // Line 4 if correct, Line 3 if wrong
        }
        return null; // No follow-up for other lines yet
    }
    
    // Get Oracle follow-up line based on Yes/No choice
    getOracleYesNoFollowUpLine() {
        if (this.oracleSelectedLine === 5) {
            // Line 5: Yes leads to line 8, No leads to line 7
            return this.oracleUserChoice === 'yes' ? 8 : 7;
        } else if (this.oracleSelectedLine === 8) {
            // Line 8: Yes leads to line 9, No leads to line 14
            return this.oracleUserChoice === 'yes' ? 9 : 14;
        } else if (this.oracleSelectedLine === 10) {
            // Line 10: Yes leads to line 12, No leads to line 11
            return this.oracleUserChoice === 'yes' ? 12 : 11;
        }
        return null;
    }
    
    // Check if Oracle needs line 13 at the end (always true for Oracle)
    needsOracleLine13() {
        return this.oracleSelectedLine === 2 || this.oracleSelectedLine === 5 || this.oracleSelectedLine === 8 || this.oracleSelectedLine === 10;
    }
    
    // Get Doppelganger conditional lines based on other characters
    getDoppelgangerConditionalLines(selectedCharacters) {
        const conditionalLines = [];
        
        // Check for Insomniac
        if (selectedCharacters.includes('insomniac-card')) {
            conditionalLines.push({
                type: 'doppelganger_conditional',
                audioFile: 'static/audio/Julia-Doppelganger/doppelganger_line_5.mp3',
                pauseAfter: 12000, // 12 second pause
                followUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
            });
        }
        
        // Check for Revealer
        if (selectedCharacters.includes('revealer-card')) {
            conditionalLines.push({
                type: 'doppelganger_conditional',
                audioFile: 'static/audio/Julia-Doppelganger/doppelganger_line_6.mp3',
                pauseAfter: 12000, // 12 second pause
                followUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
            });
        }
        
        // Check for Mortician
        if (selectedCharacters.includes('mortician-card')) {
            // Random line from 8, 9, 10, or 11 (same logic as Mortician)
            const randomLine = Math.floor(Math.random() * 4) + 8; // Random number 8, 9, 10, or 11
            conditionalLines.push({
                type: 'doppelganger_conditional',
                audioFile: `static/audio/Julia-Doppelganger/doppelganger_line_${randomLine}.mp3`,
                pauseAfter: 0, // No pause for Mortician logic
                followUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
            });
        }
        
        return conditionalLines;
    }

    // Get specific line sequence for characters with multiple lines
    getCharacterLineSequence(characterType) {
        if (characterType === 'Shanzeh-Oracle') {
            // Oracle: line 1 always, then one random line from 2,5,8,10 with specific probabilities
            const random = Math.random(); // 0 to 1
            let selectedLine;
            
            if (random < 0.05) {
                selectedLine = 2; // 5% probability
            } else if (random < 0.25) {
                selectedLine = 5; // 20% probability (0.05 + 0.20)
            } else if (random < 0.45) {
                selectedLine = 8; // 20% probability (0.25 + 0.20)
            } else {
                selectedLine = 10; // 55% probability (0.45 + 0.55)
            }
            
            // Store the selected line for Oracle interaction logic
            this.oracleSelectedLine = selectedLine;
            
            // For now, only return line 1 and the selected line
            // The interaction logic will handle adding follow-up lines
            return [
                'static/audio/Shanzeh-Oracle/oracle_line_1.mp3',
                `static/audio/Shanzeh-Oracle/oracle_line_${selectedLine}.mp3`
            ];
        } else if (characterType === 'Julia-Doppelganger') {
            // Doppelganger: line 1, 12s pause, then lines 2, 3, 4
            // Additional lines are conditional based on other characters
            const baseSequence = [
                'static/audio/Julia-Doppelganger/doppelganger_line_1.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_2.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_3.mp3',
                'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
            ];
            
            // Store the base sequence for conditional logic
            this.doppelgangerBaseSequence = baseSequence;
            return baseSequence;
        } else if (characterType === 'Quinn-Mortician') {
            // Mortician: line 1 always, then one random line from 2-5 (25% each), then line 6 always
            const randomLine = Math.floor(Math.random() * 4) + 2; // Random number 2, 3, 4, or 5
            return [
                'static/audio/Quinn-Mortician/mortician_line_1.mp3',
                `static/audio/Quinn-Mortician/mortician_line_${randomLine}.mp3`,
                'static/audio/Quinn-Mortician/mortician_line_6.mp3'
            ];
        } else {
            // For characters with 2 lines, play line 1, pause 6 seconds, then line 2
            return [
                'static/audio/' + characterType.replace('-', '-') + '/' + characterType.split('-')[1].toLowerCase() + '_line_1.mp3',
                'static/audio/' + characterType.replace('-', '-') + '/' + characterType.split('-')[1].toLowerCase() + '_line_2.mp3'
            ];
        }
    }
    
    // Play character audio based on selected characters
    playCharacterAudio(selectedCharacters) {
        if (!selectedCharacters || selectedCharacters.length === 0) {
            console.log('No characters selected for audio');
            return;
        }
        
        // Find characters with available audio and deduplicate by character type
        const charactersWithAudio = selectedCharacters.filter(charId => {
            const characterType = this.characterAudioMap[charId];
            return characterType && this.audioFiles[characterType];
        });
        
        // Deduplicate characters by character type (e.g., both werewolf cards map to same audio)
        const uniqueCharacterTypes = new Set();
        const deduplicatedCharacters = charactersWithAudio.filter(charId => {
            const characterType = this.characterAudioMap[charId];
            if (uniqueCharacterTypes.has(characterType)) {
                return false; // Skip duplicate character type
            }
            uniqueCharacterTypes.add(characterType);
            return true;
        });
        
        if (deduplicatedCharacters.length === 0) {
            console.log('No characters with audio selected');
            return;
        }
        
        // Create complete audio sequence with announcer at beginning and end
        const completeSequence = this.createAudioSequence(deduplicatedCharacters);
        
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
        
        // Add character audio in default card order (always use default order)
        const playOrder = this.getCardOrder(charactersWithAudio);
        playOrder.forEach(charId => {
            const characterType = this.characterAudioMap[charId];
            if (characterType && this.audioFiles[characterType]) {
                // Get the line sequence for this character
                const lineSequence = this.getCharacterLineSequence(characterType);
                
                // Add each line as a separate sequence item
                lineSequence.forEach((audioFile, index) => {
                    sequence.push({
                        type: 'character',
                        characterId: charId,
                        characterType: characterType,
                        characterName: characterType,
                        audioFile: audioFile,
                        lineIndex: index + 1,
                        totalLines: lineSequence.length
                    });
                });
                
                // Add Doppelganger conditional lines after specific characters
                if (charId === 'insomniac-card' && charactersWithAudio.includes('doppelganger-card')) {
                    // Add Doppelganger line 5 after Insomniac
                    sequence.push({
                        type: 'doppelganger_conditional',
                        characterId: 'doppelganger-card',
                        characterType: 'Julia-Doppelganger',
                        characterName: 'Julia-Doppelganger',
                        audioFile: 'static/audio/Julia-Doppelganger/doppelganger_line_5.mp3',
                        pauseAfter: 12000, // 12 second pause
                        followUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
                    });
                }
                
                if (charId === 'revealer-card' && charactersWithAudio.includes('doppelganger-card')) {
                    // Add Doppelganger line 6 after Revealer
                    sequence.push({
                        type: 'doppelganger_conditional',
                        characterId: 'doppelganger-card',
                        characterType: 'Julia-Doppelganger',
                        characterName: 'Julia-Doppelganger',
                        audioFile: 'static/audio/Julia-Doppelganger/doppelganger_line_6.mp3',
                        pauseAfter: 12000, // 12 second pause
                        followUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
                    });
                }
                
                if (charId === 'mortician-card' && charactersWithAudio.includes('doppelganger-card')) {
                    // Add Doppelganger line 7 + random line after Mortician
                    const randomLine = Math.floor(Math.random() * 4) + 8; // Random number 8, 9, 10, or 11
                    sequence.push({
                        type: 'doppelganger_conditional',
                        characterId: 'doppelganger-card',
                        characterType: 'Julia-Doppelganger',
                        characterName: 'Julia-Doppelganger',
                        audioFile: 'static/audio/Julia-Doppelganger/doppelganger_line_7.mp3',
                        pauseAfter: 0, // No pause
                        followUp: `static/audio/Julia-Doppelganger/doppelganger_line_${randomLine}.mp3`,
                        finalFollowUp: 'static/audio/Julia-Doppelganger/doppelganger_line_4.mp3'
                    });
                }
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
                        // Check if next item is a character (announcer to character transition)
                        const nextItem = sequence[currentIndex + 1];
                        let characterSwitchPause = 0;
                        
                        if (nextItem && nextItem.type === 'character') {
                            characterSwitchPause = 2000; // 2 second pause from announcer to character
                        }
                        
                        setTimeout(() => {
                            currentIndex++;
                            this.audioSequence.currentIndex = currentIndex;
                            playNextAudio();
                        }, this.pauseDuration + characterSwitchPause);
                    }
                }, { once: true });
                
            } else if (currentItem.type === 'doppelganger_conditional') {
                // Play Doppelganger conditional audio
                this.playAudioFile(currentItem.audioFile, currentItem.characterType);
                
                // Set up follow-up logic with pause
                this.characterAudio.addEventListener('ended', () => {
                    if (this.audioSequence && this.audioSequence.isPlaying) {
                        // Add pause if specified
                        const pauseDuration = currentItem.pauseAfter || 0;
                        
                        setTimeout(() => {
                            // Play follow-up line
                            if (currentItem.followUp) {
                                this.playAudioFile(currentItem.followUp, currentItem.characterType);
                                
                                // Check if there's a final follow-up (for Mortician case)
                                if (currentItem.finalFollowUp) {
                                    // Mortician case: followUp → finalFollowUp
                                    this.characterAudio.addEventListener('ended', () => {
                                        if (this.audioSequence && this.audioSequence.isPlaying) {
                                            this.playAudioFile(currentItem.finalFollowUp, currentItem.characterType);
                                            
                                            // Wait for final follow-up to finish, then continue
                                            this.characterAudio.addEventListener('ended', () => {
                                                if (this.audioSequence && this.audioSequence.isPlaying) {
                                                    // Check if next item is a different character
                                                    const nextItem = sequence[currentIndex + 1];
                                                    let characterSwitchPause = 0;
                                                    
                                                    if (nextItem && nextItem.type === 'character' && nextItem.characterType !== currentItem.characterType) {
                                                        characterSwitchPause = 2000; // 2 second pause between different characters
                                                    }
                                                    
                                                    setTimeout(() => {
                                                        currentIndex++;
                                                        this.audioSequence.currentIndex = currentIndex;
                                                        playNextAudio();
                                                    }, characterSwitchPause);
                                                }
                                            }, { once: true });
                                        }
                                    }, { once: true });
                                } else {
                                    // Regular case: followUp only
                                    this.characterAudio.addEventListener('ended', () => {
                                        if (this.audioSequence && this.audioSequence.isPlaying) {
                                            // Check if next item is a different character
                                            const nextItem = sequence[currentIndex + 1];
                                            let characterSwitchPause = 0;
                                            
                                            if (nextItem && nextItem.type === 'character' && nextItem.characterType !== currentItem.characterType) {
                                                characterSwitchPause = 2000; // 2 second pause between different characters
                                            }
                                            
                                            setTimeout(() => {
                                                currentIndex++;
                                                this.audioSequence.currentIndex = currentIndex;
                                                playNextAudio();
                                            }, characterSwitchPause);
                                        }
                                    }, { once: true });
                                }
                            } else {
                                // No follow-up, continue normally
                                // Check if next item is a different character
                                const nextItem = sequence[currentIndex + 1];
                                let characterSwitchPause = 0;
                                
                                if (nextItem && nextItem.type === 'character' && nextItem.characterType !== currentItem.characterType) {
                                    characterSwitchPause = 2000; // 2 second pause between different characters
                                }
                                
                                setTimeout(() => {
                                    currentIndex++;
                                    this.audioSequence.currentIndex = currentIndex;
                                    playNextAudio();
                                }, characterSwitchPause);
                            }
                        }, pauseDuration);
                    }
                }, { once: true });
                return; // Skip normal pause logic for Doppelganger conditional lines
                
            } else if (currentItem.type === 'character') {
                // Play character audio using the specific audio file
                if (currentItem.audioFile) {
                    this.playAudioFile(currentItem.audioFile, currentItem.characterType);
                    
                    // Special handling for Oracle line 2 (number guessing)
                    if (currentItem.characterType === 'Shanzeh-Oracle' && this.oracleSelectedLine === 2 && currentItem.lineIndex === 2) {
                        // Set up Oracle line 2 interaction after audio finishes
                        this.characterAudio.addEventListener('ended', async () => {
                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                // Handle Oracle line 2 interaction
                                await this.handleOracleLine2();
                                
                                // Get follow-up line and play it
                                const followUpLine = this.getOracleFollowUpLine();
                                if (followUpLine) {
                                    const followUpAudio = `static/audio/Shanzeh-Oracle/oracle_line_${followUpLine}.mp3`;
                                    this.playAudioFile(followUpAudio, currentItem.characterType);
                                    
                                    // Check if we need line 13 at the end
                                    if (this.needsOracleLine13()) {
                                        // Wait for follow-up line to finish, then play line 13
                                        this.characterAudio.addEventListener('ended', () => {
                                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                                const line13Audio = 'static/audio/Shanzeh-Oracle/oracle_line_13.mp3';
                                                this.playAudioFile(line13Audio, currentItem.characterType);
                                                
                                                // Wait for line 13 to finish, then continue
                                                this.characterAudio.addEventListener('ended', () => {
                                                    if (this.audioSequence && this.audioSequence.isPlaying) {
                                                        currentIndex++;
                                                        this.audioSequence.currentIndex = currentIndex;
                                                        playNextAudio();
                                                    }
                                                }, { once: true });
                                            }
                                        }, { once: true });
                                    } else {
                                        // No line 13 needed, continue normally
                                        this.characterAudio.addEventListener('ended', () => {
                                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                                currentIndex++;
                                                this.audioSequence.currentIndex = currentIndex;
                                                playNextAudio();
                                            }
                                        }, { once: true });
                                    }
                                } else {
                                    // No follow-up, continue to next item
                                    currentIndex++;
                                    this.audioSequence.currentIndex = currentIndex;
                                    playNextAudio();
                                }
                            }
                        }, { once: true });
                        return; // Skip normal pause logic for Oracle line 2
                    }
                    
                    // Special handling for Oracle lines 5, 8, 10 (Yes/No questions)
                    if (currentItem.characterType === 'Shanzeh-Oracle' && 
                        (this.oracleSelectedLine === 5 || this.oracleSelectedLine === 8 || this.oracleSelectedLine === 10) && 
                        currentItem.lineIndex === 2) {
                        // Set up Oracle Yes/No interaction after audio finishes
                        this.characterAudio.addEventListener('ended', async () => {
                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                // Handle Oracle Yes/No interaction
                                await this.handleOracleYesNo(this.oracleSelectedLine);
                                
                                // Get follow-up line and play it
                                const followUpLine = this.getOracleYesNoFollowUpLine();
                                if (followUpLine) {
                                    const followUpAudio = `static/audio/Shanzeh-Oracle/oracle_line_${followUpLine}.mp3`;
                                    this.playAudioFile(followUpAudio, currentItem.characterType);
                                    
                                    // Check if we need line 13 at the end
                                    if (this.needsOracleLine13()) {
                                        // Wait for follow-up line to finish, then play line 13
                                        this.characterAudio.addEventListener('ended', () => {
                                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                                const line13Audio = 'static/audio/Shanzeh-Oracle/oracle_line_13.mp3';
                                                this.playAudioFile(line13Audio, currentItem.characterType);
                                                
                                                // Wait for line 13 to finish, then continue
                                                this.characterAudio.addEventListener('ended', () => {
                                                    if (this.audioSequence && this.audioSequence.isPlaying) {
                                                        currentIndex++;
                                                        this.audioSequence.currentIndex = currentIndex;
                                                        playNextAudio();
                                                    }
                                                }, { once: true });
                                            }
                                        }, { once: true });
                                    } else {
                                        // No line 13 needed, continue normally
                                        this.characterAudio.addEventListener('ended', () => {
                                            if (this.audioSequence && this.audioSequence.isPlaying) {
                                                currentIndex++;
                                                this.audioSequence.currentIndex = currentIndex;
                                                playNextAudio();
                                            }
                                        }, { once: true });
                                    }
                                } else {
                                    // No follow-up, continue to next item
                                    currentIndex++;
                                    this.audioSequence.currentIndex = currentIndex;
                                    playNextAudio();
                                }
                            }
                        }, { once: true });
                        return; // Skip normal pause logic for Oracle Yes/No lines
                    }
                    
                    // Determine pause duration based on character type
                    let pauseDuration = this.pauseDuration; // Default pause
                    
                    // For Doppelganger, add 12-second pause after line 1
                    if (currentItem.characterType === 'Julia-Doppelganger' && currentItem.lineIndex === 1) {
                        pauseDuration = 12000; // 12 seconds between line 1 and line 2
                    }
                    // For characters with 2 lines, add 6-second pause between lines
                    else if (currentItem.totalLines === 2 && currentItem.lineIndex === 1) {
                        // Oracle has no pause between lines, other 2-line characters have 6-second pause
                        if (currentItem.characterType !== 'Shanzeh-Oracle') {
                            pauseDuration = 6000; // 6 seconds between line 1 and line 2
                        }
                    }
                    // For Mortician (3 lines), add 1-second pause after line 1, 6-second pause after random line
                    else if (currentItem.characterType === 'Quinn-Mortician' && currentItem.lineIndex < currentItem.totalLines) {
                        if (currentItem.lineIndex === 1) {
                            pauseDuration = 1000; // 1 second between line 1 and random line
                        } else if (currentItem.lineIndex === 2) {
                            pauseDuration = 6000; // 6 seconds between random line and line 6
                        }
                    }
                    
                    // Set up next audio after current one finishes + pause
                    this.characterAudio.addEventListener('ended', () => {
                        if (this.audioSequence && this.audioSequence.isPlaying) {
                            // Check if next item is a different character
                            const nextItem = sequence[currentIndex + 1];
                            let characterSwitchPause = 0;
                            
                            if (nextItem && nextItem.type === 'character' && nextItem.characterType !== currentItem.characterType) {
                                characterSwitchPause = 2000; // 2 second pause between different characters
                            }
                            
                            setTimeout(() => {
                                currentIndex++;
                                this.audioSequence.currentIndex = currentIndex;
                                playNextAudio();
                            }, pauseDuration + characterSwitchPause);
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
        this.announcerAudio.volume = 1.0; // Maximum volume for announcer
        
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
        
        // Set volume based on character type
        if (characterType === 'Shanzeh-Oracle' || characterType === 'Julia-Doppelganger') {
            this.characterAudio.volume = 1.0; // Maximum volume for Oracle and Doppelganger
        } else {
            this.characterAudio.volume = 0.8; // Standard volume for other characters
        }
        
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