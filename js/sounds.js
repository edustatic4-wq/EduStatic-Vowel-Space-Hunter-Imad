

// Sound effects manager
class SoundManager {
    constructor() {
        this.sounds = {};
        // Check localStorage for saved mute preference
        const savedMute = localStorage.getItem('vampireHunterMuted');
        this.enabled = savedMute === null ? true : savedMute === 'false';
        this.volume = 0.3;
        this.musicVolume = 0.6; // Increased to 0.6 for more exciting, prominent music
        this.music = null;
    }
    
    load(key, url, volume = 1.0) {
        const audio = new Audio(url);
        audio.volume = this.volume * volume;
        this.sounds[key] = { audio, baseVolume: volume };
    }
    
    loadMusic(url) {
        this.music = new Audio(url);
        this.music.volume = this.musicVolume;
        this.music.loop = true;
    }
    
    play(key) {
        if (!this.enabled || !this.sounds[key]) return;
        
        const sound = this.sounds[key].audio.cloneNode();
        sound.volume = this.volume * this.sounds[key].baseVolume;
        sound.play().catch(() => {}); // Ignore autoplay errors
    }
    
    playMusic() {
        if (this.music && this.enabled) {
            this.music.play().catch(() => {});
        }
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setMusicSpeed(comboMultiplier) {
        if (this.music) {
            // Speed ranges from 1.0 (normal) to 1.3 (max at 10+ combo)
            // Gradually increase speed based on combo
            const baseSpeed = 1.0;
            const maxSpeed = 1.3;
            const speedIncrease = Math.min((comboMultiplier - 1) * 0.03, maxSpeed - baseSpeed);
            this.music.playbackRate = baseSpeed + speedIncrease;
        }
    }
    
    resetMusicSpeed() {
        if (this.music) {
            this.music.playbackRate = 1.0;
        }
    }
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        Object.entries(this.sounds).forEach(([key, sound]) => {
            sound.audio.volume = this.volume * sound.baseVolume;
        });
    }
    
    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        // Save preference to localStorage
        localStorage.setItem('vampireHunterMuted', this.enabled);
        return this.enabled;
    }
}

// Create and export sound manager
export const soundManager = new SoundManager();

// Load all sound effects
soundManager.load('shoot', 'https://play.rosebud.ai/assets/Retro Gun SingleShot 04.wav?ugur', 0.4);
soundManager.load('enemyHit', 'https://play.rosebud.ai/assets/Retro Impact 20.wav?T0Db', 0.6);
soundManager.load('enemyDeath', 'https://play.rosebud.ai/assets/Retro Impact Punch 07.wav?xIse', 0.7);
soundManager.load('playerHurt', 'https://play.rosebud.ai/assets/Retro Impact Punch Hurt 01.wav?cWbr', 0.8);
soundManager.load('dash', 'https://play.rosebud.ai/assets/Retro Event StereoUP 02.wav?dS9p', 0.5);
soundManager.load('waveComplete', 'https://play.rosebud.ai/assets/Retro PickUp Coin 07.wav?GedY', 0.8);
soundManager.load('scorePoint', 'https://play.rosebud.ai/assets/Retro PickUp Coin 04.wav?IgyZ', 0.5);
soundManager.load('upgrade', 'https://play.rosebud.ai/assets/Retro Event UI 13.wav?bexG', 0.7);
soundManager.load('gameOver', 'https://play.rosebud.ai/assets/Retro Event Echo 12.wav?SuNv', 0.8);
soundManager.load('uiClick', 'https://play.rosebud.ai/assets/Retro Event UI 01.wav?2t0w', 0.6);

// Load background music
soundManager.loadMusic('https://play.rosebud.ai/assets/1-08. No Mortals Allowed.mp3?1tip');

