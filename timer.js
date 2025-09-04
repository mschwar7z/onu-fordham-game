let timerInterval;
let timeLeft = 0;

function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    
    // Set initial time (5 minutes = 300 seconds)
    timeLeft = 300;
    updateTimerDisplay();
    
    // Start countdown
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showVoteMessage();
        }
    }, 1000);
}

function showVoteMessage() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerHeader = document.querySelector('.timer-header');
    
    // Update the header and display for vote message
    timerHeader.innerHTML = `
        <h1 class="timer-title">TIME IS UP</h1>
        <p class="timer-subtitle">EVERYONE, 3, 2, 1... VOTE!</p>
    `;
    
    timerDisplay.textContent = "VOTE NOW!";
    timerDisplay.style.color = '#ff6b6b';
    timerDisplay.style.fontSize = '4rem';
    timerDisplay.style.fontWeight = 'bold';
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
    // Go back to the main page
    window.location.href = 'index.html';
}

// Start the timer automatically when the page loads
document.addEventListener('DOMContentLoaded', function() {
    startTimer();
});
