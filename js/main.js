document.addEventListener('DOMContentLoaded', () => {
    // Screen Elements
    const screenDashboard = document.getElementById('screen-dashboard');
    const screenGame = document.getElementById('screen-game');
    const victoryOverlay = document.getElementById('victory-overlay');
    const gameContainer = document.getElementById('playground');
    
    // Control Elements
    const btnSound = document.getElementById('btn-sound');
    const btnBack = document.getElementById('btn-back');
    const btnRestart = document.getElementById('btn-restart');
    const gameTitleElement = document.getElementById('game-title');
    const victoryTitle = document.getElementById('victory-title');
    const victoryMessage = document.getElementById('victory-message');
    const progressContainer = document.getElementById('game-progress');

    // State Variables
    let currentGameInstance = null;
    let currentGameType = ''; // 'shapes', 'colors', 'blocks'

    // Confetti initialization
    const confetti = new ConfettiCelebration('confetti-canvas');

    // Title mapping
    const gameTitles = {
        shapes: 'Shape Matcher! ⭐',
        colors: 'Color Sorter! 🍎',
        blocks: 'Stack-a-Block! 🧱'
    };

    // Card click event listeners
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.dataset.game;
            launchGame(gameType);
        });
    });

    // Back button listener
    btnBack.addEventListener('click', () => {
        goBackToDashboard();
    });

    // Sound toggle listener
    btnSound.addEventListener('click', () => {
        // Initialize if not already done
        gameAudio.init();
        const isMuted = gameAudio.toggleMute();
        btnSound.innerText = isMuted ? '🔇' : '🔊';
        btnSound.classList.toggle('muted', isMuted);
    });

    // Restart button listener
    btnRestart.addEventListener('click', () => {
        confetti.stop();
        victoryOverlay.classList.add('hidden');
        launchGame(currentGameType);
    });

    function launchGame(gameType) {
        // Initialize AudioContext on first user action
        gameAudio.init();

        currentGameType = gameType;
        gameTitleElement.innerText = gameTitles[gameType];
        
        // Clear progress indicator
        progressContainer.innerHTML = '';

        // Switch screen views
        screenDashboard.classList.add('hidden');
        screenGame.classList.remove('hidden');
        victoryOverlay.classList.add('hidden');
        confetti.stop();

        // Instantiate game logic
        if (gameType === 'shapes') {
            currentGameInstance = new ShapesGame(gameContainer, handleWin);
        } else if (gameType === 'colors') {
            currentGameInstance = new ColorsGame(gameContainer, handleWin);
        } else if (gameType === 'blocks') {
            currentGameInstance = new BlocksGame(gameContainer, handleWin);
        }

        if (currentGameInstance) {
            currentGameInstance.start();
            currentGameInstance.updateProgress();
        }
    }

    function goBackToDashboard() {
        screenGame.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        victoryOverlay.classList.add('hidden');
        confetti.stop();
        currentGameInstance = null;
        currentGameType = '';
    }

    function handleWin() {
        // Play victory synthesizer melody
        gameAudio.playVictory();
        
        // Explode confetti
        confetti.start();

        // Configure custom celebration messages
        const winTitles = ['Super Job! 🌟', 'Awesome! 🎉', 'Fantastic! ✨', 'Great Job! 🎈'];
        const winMessages = [
            'You are a superstar matcher!',
            'That was so much fun!',
            'You placed them all perfectly!',
            'Let\'s build another one!'
        ];

        victoryTitle.innerText = winTitles[Math.floor(Math.random() * winTitles.length)];
        victoryMessage.innerText = winMessages[Math.floor(Math.random() * winMessages.length)];

        // Show screen overlay
        victoryOverlay.classList.remove('hidden');
    }
});
