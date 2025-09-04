<?php
// Start the session to maintain state
session_start();

// Handle the form submission from the Play button
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // You can add your game logic here
    // For example, initialize game state, redirect to game page, etc.
    
    // For now, we'll just show the game page
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ONU Fordham Game</title>
        <link rel="stylesheet" href="game-styles.css">
    </head>
    <body>
        <div class="background-container">
            <img src="static/images/backgrounds/background.png" alt="Background" class="background-image">
        </div>
        
        <!-- Hidden audio elements for background audio -->
        <audio id="mainAudio" loop>
            <source src="static/audio/background-music.mp3" type="audio/mpeg">
        </audio>
        
        <audio id="ambientAudio" loop>
            <source src="static/audio/ambient-sounds.mp3" type="audio/mpeg">
        </audio>
        
        <audio id="sfxAudio">
            <source src="static/audio/sound-effects.mp3" type="audio/mpeg">
        </audio>
        
        <div class="container">
            <!-- Logo Section -->
            <div class="logo-container">
                <img src="static/images/backgrounds/logo.png" alt="Logo" class="logo-image">
            </div>
            
            <div class="content">
                <h1>Game Started!</h1>
                <p>The game is now running. Audio is playing in the background.</p>
                
                <div class="game-info">
                    <h2>Game Status</h2>
                    <p>Background music and ambient sounds are playing automatically.</p>
                    <p>You can add more game content here.</p>
                </div>
                
                <div class="button-container">
                    <button class="pause-button" onclick="toggleAudio()">Pause</button>
                    <a href="index.html#skip-loading" class="back-button">Back</a>
                </div>
            </div>
        </div>
        
        <script>
        // Audio management for background audio
        let audioElements = [];
        let isAudioPaused = false;
        
        document.addEventListener('DOMContentLoaded', function() {
            // Get all audio elements
            audioElements = [
                document.getElementById('mainAudio'),
                document.getElementById('ambientAudio'),
                document.getElementById('sfxAudio')
            ];
            
            // Set volumes for different audio tracks
            const mainAudio = document.getElementById('mainAudio');
            const ambientAudio = document.getElementById('ambientAudio');
            const sfxAudio = document.getElementById('sfxAudio');
            
            if (mainAudio) {
                mainAudio.volume = 0.6; // Main background music at 60%
            }
            
            if (ambientAudio) {
                ambientAudio.volume = 0.4; // Ambient sounds at 40%
            }
            
            if (sfxAudio) {
                sfxAudio.volume = 0.8; // Sound effects at 80%
            }
            
            // Function to start all background audio
            function startBackgroundAudio() {
                audioElements.forEach(audio => {
                    if (audio && audio.readyState >= 2) { // HAVE_CURRENT_DATA
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                });
            }
            
            // Function to stop all audio
            function stopAllAudio() {
                audioElements.forEach(audio => {
                    if (audio) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                });
            }
            
            // Function to pause/resume all audio
            window.toggleAudio = function() {
                const pauseButton = document.querySelector('.pause-button');
                
                if (isAudioPaused) {
                    // Resume audio
                    audioElements.forEach(audio => {
                        if (audio) {
                            audio.play().catch(e => console.log('Audio play failed:', e));
                        }
                    });
                    pauseButton.textContent = 'Pause Audio';
                    isAudioPaused = false;
                } else {
                    // Pause audio
                    audioElements.forEach(audio => {
                        if (audio) {
                            audio.pause();
                        }
                    });
                    pauseButton.textContent = 'Resume Audio';
                    isAudioPaused = true;
                }
            };
            
            // Auto-start background audio when user interacts with the page
            let hasInteracted = false;
            
            function startAudioOnInteraction() {
                if (!hasInteracted) {
                    hasInteracted = true;
                    startBackgroundAudio();
                }
            }
            
            // Listen for user interactions to start audio
            document.addEventListener('click', startAudioOnInteraction);
            document.addEventListener('touchstart', startAudioOnInteraction);
            document.addEventListener('keydown', startAudioOnInteraction);
            
            // Start audio immediately if page loads with user already having interacted
            if (document.visibilityState === 'visible') {
                // Small delay to ensure audio is loaded
                setTimeout(() => {
                    startBackgroundAudio();
                }, 1000);
            }
            
            // Handle page visibility changes
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                    startBackgroundAudio();
                } else {
                    // Optionally pause audio when page is hidden
                    // stopAllAudio();
                }
            });
        });
        </script>
    </body>
    </html>
    <?php
} else {
    // If accessed directly without POST, redirect to home
    header('Location: index.html');
    exit();
}
?>