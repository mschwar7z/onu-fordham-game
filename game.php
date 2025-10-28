<?php
// Start the session to maintain state
session_start();

// Handle the form submission from the Play button
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get selected characters from the form (if any)
    $selectedCharacters = isset($_POST['selectedCharacters']) ? $_POST['selectedCharacters'] : [];
    
    // Store selected characters in session for use in the game
    $_SESSION['selectedCharacters'] = $selectedCharacters;
    
    // For now, we'll just show the game page
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ONU Fordham Game</title>
        <link rel="stylesheet" href="game-styles.css">
        <script src="audio.js"></script>
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
                <div class="game-info">
                    <h2>Selected Characters</h2>
                    <div id="selectedCharactersList">
                        <!-- Selected characters will be displayed here -->
                    </div>
                </div>
                
                
                <div class="button-container">
                    <button class="pause-button" onclick="toggleAudio()">Pause</button>
                    <a href="index.html#skip-loading" class="back-button">Back</a>
                </div>
            </div>
        </div>
        
        <!-- Pass selected characters from PHP to JavaScript -->
        <script>
        // Get selected characters from PHP and make them globally available
        window.selectedCharacters = <?php echo json_encode($selectedCharacters); ?>;
        
        // Save selected characters to localStorage for persistence
        if (window.selectedCharacters && window.selectedCharacters.length > 0) {
            localStorage.setItem('selectedCharacters', JSON.stringify(window.selectedCharacters));
        }
        </script>
        
        <script>
        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the game with selected characters
            if (typeof audioManager !== 'undefined') {
                audioManager.initializeGame();
            }
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