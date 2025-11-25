// Music Control UI Handler

class MusicControl {
    constructor() {
        this.musicBtn = document.getElementById('music-toggle');
        this.musicPanel = document.getElementById('music-panel');
        this.volumeSlider = document.getElementById('music-volume');
        this.volumeDisplay = document.getElementById('volume-display');
        this.isPanelOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.musicBtn || !this.musicPanel || !this.volumeSlider) {
            console.error('Music control elements not found');
            return;
        }
        
        // Toggle panel visibility
        this.musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.setVolume(volume);
            this.volumeDisplay.textContent = e.target.value + '%';
        });
        
        // Click outside to close panel
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && !this.musicPanel.contains(e.target) && !this.musicBtn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        // Start music when game starts
        this.startMusicOnGameStart();
    }
    
    startMusicOnGameStart() {
        // Wait for title screen to be dismissed
        const titleScreen = document.getElementById('title-screen');
        if (titleScreen) {
            const startGame = () => {
                // Small delay to allow game to initialize
                setTimeout(() => {
                    if (window.musicManager) {
                        window.musicManager.playBackgroundMusic();
                        this.updateButtonState();
                    }
                }, 500);
            };
            
            // Listen for keydown or click on title screen
            const handleStart = () => {
                startGame();
                document.removeEventListener('keydown', handleStart);
                titleScreen.removeEventListener('click', handleStart);
            };
            
            document.addEventListener('keydown', handleStart);
            titleScreen.addEventListener('click', handleStart);
        }
    }
    
    togglePanel() {
        this.isPanelOpen = !this.isPanelOpen;
        if (this.isPanelOpen) {
            this.musicPanel.classList.remove('hidden');
        } else {
            this.musicPanel.classList.add('hidden');
        }
    }
    
    closePanel() {
        this.isPanelOpen = false;
        this.musicPanel.classList.add('hidden');
    }
    
    setVolume(volume) {
        if (window.musicManager) {
            window.musicManager.setVolume(volume);
        }
    }
    
    toggleMute() {
        if (window.musicManager) {
            const isMuted = window.musicManager.toggleMute();
            this.updateButtonState(isMuted);
        }
    }
    
    updateButtonState(isMuted = false) {
        if (isMuted) {
            this.musicBtn.classList.add('muted');
            this.musicBtn.querySelector('.music-icon').textContent = '🔇';
        } else {
            this.musicBtn.classList.remove('muted');
            this.musicBtn.querySelector('.music-icon').textContent = '🎵';
        }
    }
}

// Initialize music control when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.musicControl = new MusicControl();
});
