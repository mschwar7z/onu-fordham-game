let timerInterval;
let timeLeft = 0;
let isRunning = false;
let selectedDigitIndex = 0; // Currently selected digit for keyboard navigation
let alarmSound = null;

// Digit values: [minutes tens, minutes ones, seconds tens, seconds ones]
let digits = [0, 5, 0, 0];
const maxValues = [5, 9, 5, 9]; // Max for each digit position

// Initialize alarm sound
function initAlarmSound() {
    alarmSound = new Audio('static/audio/background-music.mp3');
    alarmSound.loop = true; // Loop the alarm until stopped
    alarmSound.volume = 1.0;
}

function playAlarm() {
    if (alarmSound) {
        alarmSound.currentTime = 0;
        alarmSound.play().catch(err => {
            console.log('Could not play alarm:', err);
        });
    }
}

function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}

function adjustDigit(index, delta) {
    const max = maxValues[index];
    let newValue = digits[index] + delta;
    
    // Wrap around
    if (newValue < 0) newValue = max;
    if (newValue > max) newValue = 0;
    
    digits[index] = newValue;
    updateDigitDisplay(index);
}

function updateDigitDisplay(index) {
    const columns = document.querySelectorAll('.digit-column');
    const column = columns[index];
    if (column) {
        const valueEl = column.querySelector('.digit-value');
        if (valueEl) {
            // Add animation class
            valueEl.classList.add('digit-changing');
            valueEl.textContent = digits[index];
            
            // Remove animation class after animation completes
            setTimeout(() => {
                valueEl.classList.remove('digit-changing');
            }, 150);
        }
    }
}

function selectDigit(index) {
    if (isRunning) return;
    
    // Clamp index to valid range
    if (index < 0) index = 3;
    if (index > 3) index = 0;
    
    selectedDigitIndex = index;
    
    // Update visual selection
    const columns = document.querySelectorAll('.digit-column');
    columns.forEach((col, i) => {
        if (i === index) {
            col.classList.add('selected');
        } else {
            col.classList.remove('selected');
        }
    });
}

function getTimeInSeconds() {
    const minutes = digits[0] * 10 + digits[1];
    const seconds = digits[2] * 10 + digits[3];
    return minutes * 60 + seconds;
}

function startTimer() {
    if (isRunning) return;
    
    timeLeft = getTimeInSeconds();
    
    if (timeLeft === 0) {
        // Don't start if time is 00:00
        return;
    }
    
    isRunning = true;
    
    // Hide picker, show running display
    document.getElementById('timePicker').style.display = 'none';
    document.getElementById('timerDisplay').style.display = 'block';
    document.getElementById('startBtn').style.display = 'none';
    
    // Update header
    const timerHeader = document.querySelector('.timer-header');
    timerHeader.innerHTML = `
        <h1 class="timer-title">TIME</h1>
        <p class="timer-subtitle">REMAINING BEFORE VOTE</p>
    `;
    
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
    timerDisplay.classList.add('vote-pulse');
    
    // Play alarm sound
    playAlarm();
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
    stopAlarm();
    // Go back to the main page
    window.location.href = 'index.html';
}

function resetToSetup() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Show picker, hide running display
    document.getElementById('timePicker').style.display = 'flex';
    document.getElementById('timerDisplay').style.display = 'none';
    document.getElementById('timerDisplay').style.color = '';
    document.getElementById('timerDisplay').style.fontSize = '';
    document.getElementById('timerDisplay').classList.remove('vote-pulse');
    document.getElementById('startBtn').style.display = 'inline-block';
    
    // Reset header
    const timerHeader = document.querySelector('.timer-header');
    timerHeader.innerHTML = `
        <h1 class="timer-title">SET TIME</h1>
        <p class="timer-subtitle">SCROLL TO ADJUST</p>
    `;
}

// Initialize all event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize alarm sound
    initAlarmSound();
    
    const columns = document.querySelectorAll('.digit-column');
    
    // Select first digit by default
    selectDigit(0);
    
    columns.forEach((column, index) => {
        // Make columns focusable and clickable to select
        column.setAttribute('tabindex', '0');
        
        column.addEventListener('click', (e) => {
            // Don't select if clicking on arrows
            if (!e.target.classList.contains('digit-arrow')) {
                selectDigit(index);
            }
        });
        
        column.addEventListener('focus', () => {
            selectDigit(index);
        });
        
        // Mouse wheel scrolling
        column.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (isRunning) return;
            
            selectDigit(index);
            // Scroll up = increase, scroll down = decrease
            const delta = e.deltaY < 0 ? 1 : -1;
            adjustDigit(index, delta);
        }, { passive: false });
        
        // Touch support for mobile - improved scrolling
        let touchStartY = 0;
        let lastTouchY = 0;
        let accumulatedDelta = 0;
        const SWIPE_THRESHOLD = 25; // Pixels needed for one digit change
        
        column.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            lastTouchY = touchStartY;
            accumulatedDelta = 0;
            selectDigit(index);
            column.classList.add('touching');
        }, { passive: true });
        
        column.addEventListener('touchmove', (e) => {
            if (isRunning) return;
            e.preventDefault();
            
            const touchY = e.touches[0].clientY;
            const moveDelta = lastTouchY - touchY;
            accumulatedDelta += moveDelta;
            lastTouchY = touchY;
            
            // Check if we've accumulated enough movement for a digit change
            if (Math.abs(accumulatedDelta) >= SWIPE_THRESHOLD) {
                const delta = accumulatedDelta > 0 ? 1 : -1;
                adjustDigit(index, delta);
                accumulatedDelta = 0; // Reset for next digit
            }
        }, { passive: false });
        
        column.addEventListener('touchend', () => {
            column.classList.remove('touching');
            accumulatedDelta = 0;
        });
        
        column.addEventListener('touchcancel', () => {
            column.classList.remove('touching');
            accumulatedDelta = 0;
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isRunning) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                selectDigit(selectedDigitIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                selectDigit(selectedDigitIndex + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustDigit(selectedDigitIndex, 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustDigit(selectedDigitIndex, -1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                startTimer();
                break;
        }
    });
    
    // Set initial display values
    const digitValues = document.querySelectorAll('.digit-value');
    digitValues.forEach((el, i) => {
        if (i < digits.length) {
            el.textContent = digits[i];
        }
    });
});
