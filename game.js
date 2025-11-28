// Vampire Hunter Game
import { DIFFICULTY } from './js/difficulty.js';
import { Vampire, Bullet, Particle, BloodSplatter, FloatingText, PowerUp, POWERUP_TYPES } from './js/entities.js';
import { tutorialSteps, nextTutorialStep, startTutorial } from './js/tutorial.js';
import { getRandomUpgrades, applyUpgrade } from './js/upgrades.js';
import { soundManager } from './js/sounds.js';
import { leaderboard } from './js/leaderboard.js';
import { vowelTracker } from './js/vowelWords.js';
import { getBossForWave, BossShockwave, BossProjectile } from './js/bossAliens.js';
import { AchievementManager } from './js/achievements.js';
import { DailyChallengeManager } from './js/dailyChallenges.js';
import { BattlePassManager } from './js/battlePass.js';

// Initialize achievement system
const achievementManager = new AchievementManager();

// Initialize daily challenge system
const dailyChallengeManager = new DailyChallengeManager();

// Initialize battle pass system
const battlePassManager = new BattlePassManager();
// Text-to-Speech for vowel pronunciation
function pronounceVowel(vowel) {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(vowel);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1.2; // Slightly higher pitch
    utterance.volume = 0.7;
    
    window.speechSynthesis.speak(utterance);
}

// Text-to-Speech for word pronunciation
function pronounceWord(word) {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.7; // Slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for children
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
}
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Better performance
// Enable image smoothing for HD visuals
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
// Parallax background system
const parallax = {
    offsetX: 0,
    offsetY: 0,
    scale: 1.5, // Larger scale for more dramatic effect with lightning
    speed: 0.2 // Slightly faster for dynamic movement
};

// Space decorations - planets and nebulas
const spaceDecorations = {
    planets: [
        { x: 0.15, y: 0.2, size: 80, color1: '#ff6b9d', color2: '#c44569' }, // Pink planet
        { x: 0.75, y: 0.7, size: 100, color1: '#a29bfe', color2: '#6c5ce7' }, // Purple planet
        { x: 0.85, y: 0.25, size: 60, color1: '#ffeaa7', color2: '#fdcb6e' }, // Yellow planet
        { x: 0.2, y: 0.8, size: 70, color1: '#74b9ff', color2: '#0984e3' }  // Blue planet
    ],
    nebulas: [
        { x: 0.5, y: 0.4, size: 200, color: 'rgba(255, 107, 157, 0.15)' }, // Pink nebula
        { x: 0.3, y: 0.6, size: 180, color: 'rgba(162, 155, 254, 0.15)' }, // Purple nebula
        { x: 0.7, y: 0.3, size: 150, color: 'rgba(116, 185, 255, 0.15)' }  // Blue nebula
    ]
};
// Load assets
const images = {
    vampire: new Image(),
    player: new Image(),
    heart: new Image()
};
images.vampire.src = 'https://play.rosebud.ai/assets/enemy.png?gdMQ';
images.player.src = 'https://play.rosebud.ai/assets/avatar.png?JLIu';
images.heart.src = 'https://play.rosebud.ai/assets/heart.png?cwx1';
let imagesLoaded = 0;
const totalImages = 3;
Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
    };
});
// Set canvas size with HD resolution
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set display size (css pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale all drawing operations by the dpr
    ctx.scale(dpr, dpr);
    
    // Re-enable image smoothing after resize
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    if (typeof player !== 'undefined' && player.x && player.y) {
        const marginX = player.width / 2 + 5;
        const marginY = player.height / 2 + 5;
        player.x = Math.max(marginX, Math.min(canvas.width - marginX, player.x));
        player.y = Math.max(marginY, Math.min(canvas.height - marginY, player.y));
    }
}
window.addEventListener('resize', resizeCanvas);
// Game state
const game = {
    state: 'start',
    wave: 1,
    kills: 0,
    score: 0,
    paused: false,
    difficulty: 'normal',
    tutorialStep: 0,
    waveInProgress: false,
    waitingForNextWave: false,
    expectedEnemies: 0,
    spawnedEnemies: 0,
    combo: 0,
    comboTimer: 0,
    comboDecayTime: 2000, // Time in ms before combo resets
    maxCombo: 0,
    waveStartHealth: 100, // Track health at wave start for perfect wave achievement
    waveStartTime: 0, // Track wave start time for speed achievement
    shotsFired: 0, // Track shots for accuracy achievement
    shotsHit: 0, // Track hits for accuracy achievement
    bossKills: 0, // Track boss kills for challenges
    learningScreensCompleted: 0, // Track learning screens for challenges
    speedWaves: 0, // Waves completed under 30 seconds
    survivalWaves: 0, // Waves completed without dash
    perfectWaves: 0, // Waves completed without damage
    usedDash: false, // Track if dash was used this wave
    gameStartTime: 0 // Track game start time
};

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 50,
    size: 100,
    width: 100,
    height: 135,
    health: 100,
    maxHealth: 100,
    speed: 5,
    angle: 0,
    isDashing: false,
    dashCooldown: 0,
    maxDashCooldown: 4000,
    dashDuration: 200,
    dashSpeed: 15,
    weapon: {
        ammo: 999,
        maxAmmo: 999,
        clipSize: 999,
        damage: 50,
        fireRate: 300, // ms between shots
        reloadTime: 0,
        lastShot: 0,
        isReloading: false,
        piercing: 0
    },
    upgrades: {},
    trail: [], // Store position history for trail effect
    trailMaxLength: 15
};
// Initial canvas resize now that player is defined
resizeCanvas();
// Input
const keys = {};
const mouse = {
    x: 0,
    y: 0,
    down: false
};

// Game objects
const bullets = [];
const enemies = [];
const particles = [];
const bloodSplatters = [];
const floatingTexts = [];
const powerUps = [];
const bossShockwaves = [];
const bossProjectiles = [];

// Active power-up effects
const activePowerUps = {
    SPEED: { active: false, endTime: 0 },
    SHIELD: { active: false, endTime: 0 },
    RAPID_FIRE: { active: false, endTime: 0 }
};

function showFloatingText(x, y, text, color) {
    floatingTexts.push(new FloatingText(x, y, text, color));
}

// Spawn enemies
function spawnWave() {
    // Prevent multiple wave spawns (only check waveInProgress)
    if (game.waveInProgress) {
        console.log('Wave spawn blocked - wave already in progress');
        return;
    }
    
    game.waveInProgress = true;
    game.waitingForNextWave = false;
    
    // Track wave start stats for achievements and challenges
    game.waveStartHealth = player.health;
    game.waveStartTime = Date.now();
    game.shotsFired = 0;
    game.shotsHit = 0;
    game.usedDash = false;
    
    // Check if this is a boss wave (may be modified by events)
    const eventMods = dailyChallengeManager.getEventModifiers();
    const isBossWave = game.wave % eventMods.bossEveryNWaves === 0 && game.state === 'playing';
    
    if (isBossWave) {
        // Boss wave - spawn only the boss
        const boss = getBossForWave(game.wave, game.difficulty);
        if (boss) {
            game.expectedEnemies = 1;
            game.spawnedEnemies = 0;
            
            showWaveInfo(boss.title);
            soundManager.play('waveComplete'); // Epic sound for boss
            
            setTimeout(() => {
                const x = canvas.width / 2;
                const y = -100; // Spawn from top center
                
                const bossEnemy = new Vampire(x, y, game.wave, game.difficulty, images, player, true);
                enemies.push(bossEnemy);
                game.spawnedEnemies++;
                
                showFloatingText(x, y + 150, '⚠️ BOSS BATTLE ⚠️', '#ffd700');
            }, 2000);
            
            return;
        }
    }
    
    const diff = DIFFICULTY[game.difficulty];
    const baseEnemies = game.state === 'tutorial' && game.tutorialStep < 5 ? 1 : diff.enemiesPerWave;
    // More balanced wave scaling: slower growth
    const numEnemies = baseEnemies + Math.floor((game.wave - 1) * 0.5);
    
    console.log(`Spawning wave ${game.wave} with ${numEnemies} enemies in ${game.difficulty} mode`);
    
    // Track how many enemies we're expecting to spawn
    game.expectedEnemies = numEnemies;
    game.spawnedEnemies = 0;
    
    for (let i = 0; i < numEnemies; i++) {
        setTimeout(() => {
            // Only spawn if game is still active and wave is in progress
            if ((game.state !== 'playing' && game.state !== 'tutorial') || !game.waveInProgress) {
                console.log('Spawn cancelled:', { state: game.state, waveInProgress: game.waveInProgress });
                return;
            }
            
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
                case 0: // top
                    x = Math.random() * canvas.width;
                    y = -50;
                    break;
                case 1: // right
                    x = canvas.width + 50;
                    y = Math.random() * canvas.height;
                    break;
                case 2: // bottom
                    x = Math.random() * canvas.width;
                    y = canvas.height + 50;
                    break;
                case 3: // left
                    x = -50;
                    y = Math.random() * canvas.height;
                    break;
            }
            
            const vampire = new Vampire(x, y, game.wave, game.difficulty, images, player);
            enemies.push(vampire);
            game.spawnedEnemies++;
            console.log(`Spawned vampire ${game.spawnedEnemies}/${game.expectedEnemies} at (${x}, ${y}), total enemies: ${enemies.length}`);
            
            // Show alien type name briefly when first encountered in a wave
            if (game.state === 'playing' && game.wave >= 3) {
                const typeName = vampire.alienType.name;
                // Only show if it's a special type (not basic)
                if (typeName !== 'Basic Chaser') {
                    showFloatingText(x, y, typeName, vampire.color);
                }
            }
        }, i * 400);
    }
    
    showWaveInfo(`Wave ${game.wave}`);
}

let waveInfoTimeout = null;

function showWaveInfo(text) {
    const waveInfo = document.getElementById('wave-info');
    
    // Clear any existing timeout to prevent stacking
    if (waveInfoTimeout) {
        clearTimeout(waveInfoTimeout);
    }
    
    waveInfo.textContent = text;
    waveInfo.style.opacity = '1';
    
    waveInfoTimeout = setTimeout(() => {
        waveInfo.style.opacity = '0';
        waveInfoTimeout = null;
    }, 2000);
}

// Shooting
function shoot() {
    const now = Date.now();
    
    if (now - player.weapon.lastShot < player.weapon.fireRate) return;
    
    player.weapon.lastShot = now;
    game.shotsFired++; // Track shots for accuracy
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push(new Bullet(player.x, player.y, angle, game.difficulty, player.weapon.piercing));
    
    // Play shoot sound
    soundManager.play('shoot');
    
    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(
            player.x + Math.cos(angle) * 20,
            player.y + Math.sin(angle) * 20,
            '#ffaa00'
        ));
    }
    
    updateHUD();
}

function reload() {
    // No reloading needed with infinite ammo
    return;
}

// Update HUD
function updateHUD() {
    const healthPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = 
        `${Math.max(0, Math.floor(player.health))} / ${player.maxHealth}`;
    document.getElementById('wave').textContent = game.wave;
    document.getElementById('enemies').textContent = enemies.length;
    document.getElementById('kills').textContent = game.kills;
    document.getElementById('ammo').textContent = '∞';
    document.getElementById('score').textContent = game.score;
    
    // Update dash cooldown (inverted - full when ready, empty when on cooldown)
    const dashPercent = Math.max(0, Math.min(100, 100 - (player.dashCooldown / player.maxDashCooldown * 100)));
    document.getElementById('dash-fill').style.width = `${dashPercent}%`;
    
    // Update dash text
    const dashText = player.dashCooldown <= 0 ? 'DASH READY' : `COOLDOWN: ${Math.ceil(player.dashCooldown / 1000)}s`;
    document.querySelector('#dash-cooldown > div').textContent = dashText;
    
    // Update combo display
    const comboDisplay = document.getElementById('combo-display');
    const comboText = document.getElementById('combo-text');
    const comboFill = document.getElementById('combo-fill');
    
    if (game.combo >= 2) {
        comboDisplay.style.display = 'block';
        
        // Update text with color based on combo level
        let comboColor = '#ffff00'; // Yellow
        if (game.combo >= 10) {
            comboColor = '#ff00ff'; // Magenta
            comboText.textContent = `🔥 ${game.combo}x MEGA COMBO! 🔥`;
        } else if (game.combo >= 5) {
            comboColor = '#ff6600'; // Orange
            comboText.textContent = `${game.combo}x SUPER COMBO!`;
        } else {
            comboText.textContent = `${game.combo}x COMBO`;
        }
        comboText.style.color = comboColor;
        comboText.style.textShadow = `0 0 20px ${comboColor}, 2px 2px 4px rgba(0,0,0,0.9)`;
        
        // Update combo timer bar
        if (game.comboTimer > 0) {
            const timeSinceLastKill = Date.now() - game.comboTimer;
            const timeRemaining = Math.max(0, game.comboDecayTime - timeSinceLastKill);
            const comboPercent = (timeRemaining / game.comboDecayTime) * 100;
            comboFill.style.width = `${comboPercent}%`;
            
            // Change bar color as time runs out
            if (comboPercent < 30) {
                comboFill.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
            } else if (comboPercent < 60) {
                comboFill.style.background = 'linear-gradient(90deg, #ff9900, #ff6600)';
            } else {
                comboFill.style.background = 'linear-gradient(90deg, #ffd700, #ffaa00)';
            }
        }
    } else {
        comboDisplay.style.display = 'none';
    }
}

// Initialize global key tracking for WASD visual feedback
if (!window.wasdKeys) {
    window.wasdKeys = new Set();
}

// Dash function that can be called from keyboard or mobile
function performDash() {
    if ((game.state === 'playing' || game.state === 'tutorial') && 
        player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashCooldown = player.maxDashCooldown;
        game.usedDash = true; // Track for survival challenge
        
        // Play dash sound
        soundManager.play('dash');
        
        // Dash particles
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(player.x, player.y, '#4a90e2'));
        }
        
        setTimeout(() => {
            player.isDashing = false;
        }, player.dashDuration);
        
        return true;
    }
    return false;
}

// Make dash function globally accessible for mobile controls
window.performDash = performDash;

// Input handlers
window.addEventListener('keydown', (e) => {
    // Store both original and lowercase to handle all cases
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;
    
    // Track for WASD visual feedback
    window.wasdKeys.add(e.code);
    
    // Dash
    if (e.key === ' ' || e.code === 'Space') {
        if (performDash()) {
            e.preventDefault();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
    
    // Track for WASD visual feedback
    window.wasdKeys.delete(e.code);
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    const crosshair = document.getElementById('crosshair');
    crosshair.style.left = e.clientX + 'px';
    crosshair.style.top = e.clientY + 'px';
});

window.addEventListener('mousedown', () => {
    mouse.down = true;
});

window.addEventListener('mouseup', () => {
    mouse.down = false;
});

// Touch support for mobile shooting
canvas.addEventListener('touchstart', (e) => {
    // Only handle touches that aren't on the joystick or dash button
    const touch = e.touches[0];
    const joystickContainer = document.getElementById('joystick-container');
    const dashButton = document.getElementById('mobile-dash');
    
    if (joystickContainer && dashButton) {
        const joystickRect = joystickContainer.getBoundingClientRect();
        const dashRect = dashButton.getBoundingClientRect();
        
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // Check if touch is not on controls
        const isOnJoystick = touchX >= joystickRect.left && touchX <= joystickRect.right &&
                             touchY >= joystickRect.top && touchY <= joystickRect.bottom;
        const isOnDash = touchX >= dashRect.left && touchX <= dashRect.right &&
                        touchY >= dashRect.top && touchY <= dashRect.bottom;
        
        if (!isOnJoystick && !isOnDash) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
            mouse.down = true;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        mouse.down = false;
    }
});

// Update WASD highlighting
function updateWASDHighlighting() {
    const wasdKeys = document.querySelectorAll('.wasd-key[data-key]');
    
    wasdKeys.forEach(keyEl => {
        const keyCode = keyEl.getAttribute('data-key');
        let isPressed = false;
        
        if (window.wasdKeys) {
            switch(keyCode) {
                case 'KeyW':
                    isPressed = window.wasdKeys.has('KeyW') || window.wasdKeys.has('ArrowUp');
                    break;
                case 'KeyA':
                    isPressed = window.wasdKeys.has('KeyA') || window.wasdKeys.has('ArrowLeft');
                    break;
                case 'KeyS':
                    isPressed = window.wasdKeys.has('KeyS') || window.wasdKeys.has('ArrowDown');
                    break;
                case 'KeyD':
                    isPressed = window.wasdKeys.has('KeyD') || window.wasdKeys.has('ArrowRight');
                    break;
                case 'Space':
                    isPressed = window.wasdKeys.has('Space');
                    break;
                default:
                    isPressed = window.wasdKeys.has(keyCode);
            }
        }
        
        keyEl.classList.toggle('active', isPressed);
    });
}

// Game loop
function update() {
    if (game.state !== 'playing' && game.state !== 'tutorial') return;
    
    // Check for achievement notifications
    checkAndShowAchievementNotifications();
    
    // Update dash cooldown
    if (player.dashCooldown > 0) {
        player.dashCooldown = Math.max(0, player.dashCooldown - 16); // ~60fps
        updateHUD(); // Update dash display
    }
    
    // Combo decay system (modified by events)
    if (game.combo > 0 && game.comboTimer > 0) {
        const eventMods = dailyChallengeManager.getEventModifiers();
        const adjustedDecayTime = game.comboDecayTime * eventMods.comboDecayMultiplier;
        const timeSinceLastKill = Date.now() - game.comboTimer;
        if (timeSinceLastKill >= adjustedDecayTime) {
            // Combo broken
            if (game.combo >= 3) {
                showFloatingText(canvas.width / 2, canvas.height / 3, `Combo Ended: ${game.combo}x`, '#ff4444');
            }
            game.combo = 0;
            game.comboTimer = 0;
            
            // Reset music speed to normal
            soundManager.resetMusicSpeed();
            
            updateHUD();
        }
    }
    
    // Get mobile input state
    const mobileInput = window.mobileControls ? window.mobileControls.getInput() : { x: 0, y: 0, left: false, right: false };
    
    // Update player position (handle keyboard, arrow keys, and mobile joystick)
    let moveX = (keys['d'] || keys['D'] || keys['arrowright'] ? 1 : 0) - 
                (keys['a'] || keys['A'] || keys['arrowleft'] ? 1 : 0);
    let moveY = (keys['s'] || keys['S'] || keys['arrowdown'] ? 1 : 0) - 
                (keys['w'] || keys['W'] || keys['arrowup'] ? 1 : 0);
    
    // Add joystick input if it's stronger than threshold
    if (Math.abs(mobileInput.x) > 0.2 || Math.abs(mobileInput.y) > 0.2) {
        moveX = mobileInput.x;
        moveY = mobileInput.y;
    }
    
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        const currentSpeed = player.isDashing ? player.dashSpeed : player.speed;
        const moveAmount = currentSpeed / length;
        
        player.x += moveX * moveAmount;
        player.y += moveY * moveAmount;
        
        // Update parallax offset based on movement
        parallax.offsetX -= (moveX * moveAmount) * parallax.speed;
        parallax.offsetY -= (moveY * moveAmount) * parallax.speed;
        
        // Add to trail (store position for trail effect)
        player.trail.push({ 
            x: player.x, 
            y: player.y,
            time: Date.now()
        });
        
        // Limit trail length
        if (player.trail.length > player.trailMaxLength) {
            player.trail.shift();
        }
        
        // Dash trail
        if (player.isDashing) {
            particles.push(new Particle(player.x, player.y, '#4a90e2'));
        }
        
        // Keep player in bounds with proper margin (use height for vertical bounds)
        const marginX = player.width / 2 + 5;
        const marginY = player.height / 2 + 5;
        player.x = Math.max(marginX, Math.min(canvas.width - marginX, player.x));
        player.y = Math.max(marginY, Math.min(canvas.height - marginY, player.y));
    } else {
        // Gradually fade out trail when not moving
        if (player.trail.length > 0) {
            player.trail.shift();
        }
    }
    
    // Update player angle
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    
    // Shooting
    if (mouse.down) {
        shoot();
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].update(canvas)) {
            bullets.splice(i, 1);
        }
    }
    
    // Check bullet-enemy collisions BEFORE updating enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bullet.radius + enemy.radius) {
                // Hit! Apply boss damage multiplier if hitting a boss
                const rewards = achievementManager.getActiveRewards();
                const damage = enemy.isBoss ? bullet.damage * rewards.bossDamageMultiplier : bullet.damage;
                const killed = enemy.hit(damage);
                
                if (killed) {
                    // Enemy killed
                    soundManager.play('enemyDeath');
                    soundManager.play('scorePoint');
                    
                    // Pronounce the vowel when vampire is killed
                    pronounceVowel(enemy.vowel);
                    
                    // Track vowel for word examples
                    vowelTracker.addVowel(enemy.vowel);
                    
                    game.kills++;
                    game.shotsHit++; // Track hit for accuracy
                    
                    // Track kills for achievements
                    achievementManager.addKills(1);
                    
                    // Track boss kills for achievements and challenges
                    if (enemy.isBoss) {
                        achievementManager.addBossKill();
                        game.bossKills++;
                    }
                    
                    // Combo system
                    game.combo++;
                    game.comboTimer = Date.now();
                    if (game.combo > game.maxCombo) {
                        game.maxCombo = game.combo;
                    }
                    
                    // Check combo achievements
                    achievementManager.checkAchievement('combo_starter', game.combo);
                    achievementManager.checkAchievement('combo_master', game.combo);
                    achievementManager.checkAchievement('combo_god', game.combo);
                    
                    // Speed up music with combo
                    soundManager.setMusicSpeed(game.combo);
                    
                    // Calculate combo bonus (with all multipliers)
                    const rewards = achievementManager.getActiveRewards();
                    const challengeBuffs = dailyChallengeManager.getActiveBuffs();
                    const eventMods = dailyChallengeManager.getEventModifiers();
                    const battlePassBoosts = battlePassManager.getActiveBoosts();
                    const comboMultiplier = 1 + (game.combo - 1) * 0.1; // 10% bonus per combo
                    const totalScoreMult = rewards.scoreMultiplier * challengeBuffs.scoreMultiplier * eventMods.scoreMultiplier * battlePassBoosts.scoreMultiplier;
                    const comboScore = Math.floor(enemy.scoreValue * comboMultiplier * totalScoreMult);
                    game.score += comboScore;
                    
                    // Check score achievements
                    achievementManager.checkAchievement('first_score', game.score);
                    achievementManager.checkAchievement('score_master', game.score);
                    achievementManager.checkAchievement('score_legend', game.score);
                    
                    enemies.splice(j, 1);
                    
                    // Blood splatter
                    bloodSplatters.push(new BloodSplatter(enemy.x, enemy.y));
                    
                    // Particles - more particles for higher combos
                    const particleCount = Math.min(15 + game.combo * 2, 50);
                    for (let k = 0; k < particleCount; k++) {
                        particles.push(new Particle(enemy.x, enemy.y, '#8b0000'));
                    }
                    
                    // Combo text effect with dynamic color based on combo level
                    let comboColor = '#ffff00'; // Yellow
                    let comboText = `${enemy.vowel.toUpperCase()} +${comboScore}`;
                    
                    if (game.combo >= 10) {
                        comboColor = '#ff00ff'; // Magenta for 10+ combo
                        comboText = `🔥 ${game.combo}x COMBO! ${enemy.vowel.toUpperCase()} +${comboScore} 🔥`;
                    } else if (game.combo >= 5) {
                        comboColor = '#ff6600'; // Orange for 5+ combo
                        comboText = `${game.combo}x COMBO! ${enemy.vowel.toUpperCase()} +${comboScore}`;
                    } else if (game.combo >= 3) {
                        comboColor = '#00ffff'; // Cyan for 3+ combo
                        comboText = `${game.combo}x ${enemy.vowel.toUpperCase()} +${comboScore}`;
                    }
                    
                    showFloatingText(enemy.x, enemy.y, comboText, comboColor);
                    
                    // Chance to spawn power-up (increases with combo)
                    const powerUpChance = 0.15 + (game.combo * 0.02); // 2% increase per combo
                    if (Math.random() < powerUpChance) {
                        powerUps.push(new PowerUp(enemy.x, enemy.y));
                    }
                } else {
                    // Just hit, not killed
                    soundManager.play('enemyHit');
                }
                
                // Remove bullet unless it has piercing
                if (!bullet.piercing || bullet.piercing <= 0) {
                    bullets.splice(i, 1);
                    updateHUD();
                    break;
                } else {
                    bullet.piercing--;
                }
                
                updateHUD();
            }
        }
    }
    
    // Update enemies AFTER collision checks
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i]) {
            // Pass shield status to enemy
            const canDamage = !activePowerUps.SHIELD.active;
            
            // Boss ability callbacks
            const spawnMinion = (x, y) => {
                const angle = Math.random() * Math.PI * 2;
                const spawnDist = 100;
                const minionX = x + Math.cos(angle) * spawnDist;
                const minionY = y + Math.sin(angle) * spawnDist;
                const minion = new Vampire(minionX, minionY, 1, game.difficulty, images, player, false);
                minion.isMinion = true; // Mark as minion so it doesn't count for wave completion
                enemies.push(minion);
                showFloatingText(minionX, minionY, 'Minion!', '#ff6b9d');
                soundManager.play('enemyDeath');
            };
            
            const createShockwave = (x, y) => {
                bossShockwaves.push(new BossShockwave(x, y, 300));
                soundManager.play('dash');
            };
            
            const createProjectile = (x, y, targetX, targetY) => {
                bossProjectiles.push(new BossProjectile(x, y, targetX, targetY, enemies[i].color));
                soundManager.play('shoot');
            };
            
            enemies[i].update(canvas, updateHUD, gameOver, canDamage, spawnMinion, createShockwave, createProjectile);
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles.splice(i, 1);
        }
    }
    
    // Update blood splatters
    for (let i = bloodSplatters.length - 1; i >= 0; i--) {
        if (!bloodSplatters[i].update()) {
            bloodSplatters.splice(i, 1);
        }
    }
    
    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        if (!floatingTexts[i].update()) {
            floatingTexts.splice(i, 1);
        }
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (!powerUps[i].update()) {
            powerUps.splice(i, 1);
        } else if (powerUps[i].checkCollision(player)) {
            const result = powerUps[i].collect(player);
            soundManager.play('scorePoint');
            showFloatingText(powerUps[i].x, powerUps[i].y, result.message, '#ffd700');
            
            // Handle timed power-ups
            if (result.duration > 0) {
                const now = Date.now();
                activePowerUps[result.type].active = true;
                activePowerUps[result.type].endTime = now + result.duration;
                
                // Apply immediate effects
                if (result.type === 'SPEED') {
                    player.baseSpeed = player.speed;
                    player.speed = player.speed * 1.5;
                } else if (result.type === 'RAPID_FIRE') {
                    player.baseFireRate = player.weapon.fireRate;
                    player.weapon.fireRate = player.weapon.fireRate * 0.5;
                }
            } else if (result.type === 'STAR') {
                // Star gives bonus points
                game.score += 50;
            }
            
            powerUps.splice(i, 1);
            updateHUD();
        }
    }
    
    // Update boss shockwaves
    for (let i = bossShockwaves.length - 1; i >= 0; i--) {
        if (!bossShockwaves[i].update()) {
            bossShockwaves.splice(i, 1);
        } else if (bossShockwaves[i].checkCollision(player) && !activePowerUps.SHIELD.active) {
            player.health -= bossShockwaves[i].damage;
            soundManager.play('playerHurt');
            updateHUD();
            if (player.health <= 0) {
                gameOver();
            }
        }
    }
    
    // Update boss projectiles
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        if (!bossProjectiles[i].update()) {
            bossProjectiles.splice(i, 1);
        } else if (bossProjectiles[i].checkCollision(player) && !activePowerUps.SHIELD.active && !player.isDashing) {
            player.health -= bossProjectiles[i].damage;
            soundManager.play('playerHurt');
            bossProjectiles.splice(i, 1);
            updateHUD();
            if (player.health <= 0) {
                gameOver();
            }
        }
    }
    
    // Update active power-up timers
    const now = Date.now();
    
    if (activePowerUps.SPEED.active && now >= activePowerUps.SPEED.endTime) {
        activePowerUps.SPEED.active = false;
        if (player.baseSpeed) {
            player.speed = player.baseSpeed;
            delete player.baseSpeed;
        }
        showFloatingText(player.x, player.y - 50, 'Speed Normal', '#aaa');
    }
    
    if (activePowerUps.SHIELD.active && now >= activePowerUps.SHIELD.endTime) {
        activePowerUps.SHIELD.active = false;
        showFloatingText(player.x, player.y - 50, 'Shield Down', '#aaa');
    }
    
    if (activePowerUps.RAPID_FIRE.active && now >= activePowerUps.RAPID_FIRE.endTime) {
        activePowerUps.RAPID_FIRE.active = false;
        if (player.baseFireRate) {
            player.weapon.fireRate = player.baseFireRate;
            delete player.baseFireRate;
        }
        showFloatingText(player.x, player.y - 50, 'Fire Rate Normal', '#aaa');
    }
    
    // Check if wave is complete (only once per wave)
    // Make sure all enemies have been spawned before checking for wave completion
    // Don't count minions - only check if boss/regular enemies are defeated
    const allEnemiesSpawned = game.spawnedEnemies >= game.expectedEnemies;
    const nonMinionEnemies = enemies.filter(e => !e.isMinion);
    if (nonMinionEnemies.length === 0 && game.waveInProgress && !game.waitingForNextWave && 
        allEnemiesSpawned && (game.state === 'playing' || game.state === 'tutorial')) {
        
        // Immediately set flags to prevent re-triggering
        game.waveInProgress = false;
        game.waitingForNextWave = true;
        
        // Check wave achievements
        achievementManager.checkAchievement('wave_warrior', game.wave);
        achievementManager.checkAchievement('wave_master', game.wave);
        
        // Check difficulty-specific achievements
        if (game.state === 'playing') {
            achievementManager.checkAchievement('survivor', { wave: game.wave, difficulty: game.difficulty });
            achievementManager.checkAchievement('champion', { wave: game.wave, difficulty: game.difficulty });
            achievementManager.checkAchievement('legendary', { wave: game.wave, difficulty: game.difficulty });
        }
        
        // Check special achievements and track challenge stats
        const waveDuration = (Date.now() - game.waveStartTime) / 1000; // in seconds
        const accuracy = game.shotsFired > 0 ? (game.shotsHit / game.shotsFired) : 0;
        
        if (player.health === game.waveStartHealth && game.state === 'playing') {
            achievementManager.checkAchievement('perfect_wave', true);
            game.perfectWaves++;
        }
        if (accuracy >= 0.9 && game.shotsFired > 5) {
            achievementManager.checkAchievement('sharpshooter', true);
        }
        if (waveDuration < 30 && game.wave > 1) {
            achievementManager.checkAchievement('speed_demon', true);
            game.speedWaves++;
        }
        if (!game.usedDash && game.wave > 1) {
            game.survivalWaves++;
        }
        
        // Full heal between waves
        player.health = player.maxHealth;
        updateHUD();
        
        // Wave completion bonus
        soundManager.play('waveComplete');
        const bonus = 50 * DIFFICULTY[game.difficulty].scoreMultiplier;
        if (bonus > 0) {
            game.score += bonus;
            updateHUD();
            showFloatingText(canvas.width / 2, canvas.height / 2, `Wave Complete! +${bonus}`, '#4CAF50');
        } else {
            showFloatingText(canvas.width / 2, canvas.height / 2, `Wave Complete!`, '#4CAF50');
        }
        
        // Show vowel learning screen if vowels were encountered (skip tutorial mode)
        if (vowelTracker.hasVowels() && game.state === 'playing') {
            showVowelLearningScreen();
        }
        // Show upgrade screen every 3 waves
        else if (game.wave % 3 === 0 && game.state === 'playing') {
            showUpgradeScreen();
        } else {
            // Wait before starting next wave
            setTimeout(() => {
                // Double check game is still active
                if ((game.state === 'playing' || game.state === 'tutorial') && game.waitingForNextWave) {
                    game.wave++;
                    game.waitingForNextWave = false; // Clear the flag before spawning
                    updateHUD();
                    
                    if (game.state === 'tutorial') {
                        nextTutorialStep(game, player, updateHUD, spawnWave);
                    } else {
                        spawnWave();
                    }
                }
            }, 2000);
        }
    }
    
    // Update WASD visual feedback
    updateWASDHighlighting();
}

function showUpgradeScreen() {
    const upgradeScreen = document.getElementById('upgrade-screen');
    const upgradeOptions = document.getElementById('upgrade-options');
    
    // Get random upgrades
    const upgrades = getRandomUpgrades(player.upgrades, 3);
    
    // Clear previous options
    upgradeOptions.innerHTML = '';
    
    // Create upgrade cards
    upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.name.split(' ')[0]}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-level">Level ${upgrade.currentLevel} → ${upgrade.currentLevel + 1}</div>
        `;
        card.onclick = () => selectUpgrade(upgrade.key);
        upgradeOptions.appendChild(card);
    });
    
    upgradeScreen.style.display = 'flex';
}

function selectUpgrade(upgradeKey) {
    soundManager.play('upgrade');
    applyUpgrade(player, player.upgrades, upgradeKey);
    updateHUD();
    
    document.getElementById('upgrade-screen').style.display = 'none';
    
    // Continue to next wave
    setTimeout(() => {
        if ((game.state === 'playing' || game.state === 'tutorial') && game.waitingForNextWave) {
            game.wave++;
            game.waitingForNextWave = false;
            updateHUD();
            spawnWave();
        }
    }, 500);
}

function showVowelLearningScreen() {
    const vowelScreen = document.getElementById('vowel-learning-screen');
    const vowelContent = document.getElementById('vowel-content');
    
    // Get word examples for vowels encountered
    const examples = vowelTracker.getWordExamples(3);
    
    // Clear previous content
    vowelContent.innerHTML = '';
    
    // Create cards for each vowel
    Object.keys(examples).forEach(vowel => {
        const vowelCard = document.createElement('div');
        vowelCard.className = 'vowel-card';
        
        const vowelHeader = document.createElement('div');
        vowelHeader.className = 'vowel-header';
        vowelHeader.innerHTML = `
            <div style="font-size: 48px; font-weight: bold; color: #ffd700; text-transform: uppercase;">
                ${vowel}
            </div>
        `;
        vowelCard.appendChild(vowelHeader);
        
        const wordsGrid = document.createElement('div');
        wordsGrid.className = 'vowel-words-grid';
        
        examples[vowel].forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'vowel-word-item';
            wordItem.innerHTML = `
                <div style="font-size: 36px; margin-bottom: 5px;">${item.image}</div>
                <div style="font-weight: bold; font-size: 18px;">${item.word}</div>
            `;
            
            // Make word clickable to hear pronunciation
            wordItem.onclick = () => {
                soundManager.play('uiClick');
                pronounceWord(item.word);
                // Track word click for achievement
                achievementManager.addWordClicked();
            };
            
            wordsGrid.appendChild(wordItem);
        });
        
        vowelCard.appendChild(wordsGrid);
        vowelContent.appendChild(vowelCard);
    });
    
    vowelScreen.style.display = 'flex';
}

function closeVowelLearning() {
    soundManager.play('uiClick');
    document.getElementById('vowel-learning-screen').style.display = 'none';
    
    // Track learning screen completion for achievements and challenges
    achievementManager.addLearningScreenCompleted();
    game.learningScreensCompleted++;
    
    // Reset vowel tracker for next wave
    vowelTracker.reset();
    
    // Check if it's upgrade time (every 3 waves)
    if (game.wave % 3 === 0 && game.state === 'playing') {
        showUpgradeScreen();
    } else {
        // Continue to next wave
        setTimeout(() => {
            if ((game.state === 'playing' || game.state === 'tutorial') && game.waitingForNextWave) {
                game.wave++;
                game.waitingForNextWave = false;
                updateHUD();
                spawnWave();
            }
        }, 500);
    }
}

function draw() {
    // Space adventure background - colorful and bright for children
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a0a3a');    // Deep purple
    gradient.addColorStop(0.3, '#2a1555'); // Purple
    gradient.addColorStop(0.6, '#0a2a4a'); // Dark blue
    gradient.addColorStop(1, '#0a1a3a');   // Navy blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw nebulas (glowing clouds)
    for (const nebula of spaceDecorations.nebulas) {
        const x = nebula.x * canvas.width;
        const y = nebula.y * canvas.height;
        
        // Create multiple layers for glowing effect
        for (let i = 0; i < 3; i++) {
            const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.size + i * 30);
            nebulaGradient.addColorStop(0, nebula.color);
            nebulaGradient.addColorStop(0.5, nebula.color.replace('0.15', '0.08'));
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Draw planets
    for (const planet of spaceDecorations.planets) {
        const x = planet.x * canvas.width;
        const y = planet.y * canvas.height;
        
        // Planet glow
        const glowGradient = ctx.createRadialGradient(x, y, planet.size * 0.8, x, y, planet.size * 1.3);
        glowGradient.addColorStop(0, planet.color1 + '40'); // Semi-transparent
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, planet.size * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet body with gradient
        const planetGradient = ctx.createRadialGradient(
            x - planet.size * 0.3, 
            y - planet.size * 0.3, 
            planet.size * 0.1,
            x, 
            y, 
            planet.size
        );
        planetGradient.addColorStop(0, planet.color1);
        planetGradient.addColorStop(0.7, planet.color2);
        planetGradient.addColorStop(1, planet.color2 + 'cc');
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(x, y, planet.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some surface details
        ctx.fillStyle = planet.color2 + '40';
        ctx.beginPath();
        ctx.arc(x + planet.size * 0.3, y + planet.size * 0.2, planet.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - planet.size * 0.2, y + planet.size * 0.4, planet.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add HD twinkling stars for space theme - more stars, better visuals
    const starCount = Math.floor(canvas.width * canvas.height / 5000); // Dynamic star count based on resolution
    for (let i = 0; i < starCount; i++) {
        const x = (i * 137.5083) % canvas.width;
        const y = (i * 219.3729) % canvas.height;
        const twinkle = Math.sin(Date.now() * 0.001 + i * 0.5) * 0.5 + 0.5;
        const size = (Math.sin(i * 0.1) * 0.3 + 0.7) * (twinkle * 0.5 + 0.5);
        
        // Main star
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.9})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow for larger stars
        if (size > 0.8) {
            ctx.fillStyle = `rgba(200, 220, 255, ${twinkle * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw blood splatters
    for (const splatter of bloodSplatters) {
        splatter.draw(ctx);
    }
    
    // Draw particles
    for (const particle of particles) {
        particle.draw(ctx);
    }
    
    // Draw bullets
    for (const bullet of bullets) {
        bullet.draw(ctx);
    }
    
    // Draw boss shockwaves (behind enemies)
    for (const shockwave of bossShockwaves) {
        shockwave.draw(ctx, enemies.find(e => e.isBoss)?.color || '#ff4757');
    }
    
    // Draw enemies
    for (const enemy of enemies) {
        enemy.draw(ctx);
    }
    
    // Draw boss projectiles (in front of enemies)
    for (const projectile of bossProjectiles) {
        projectile.draw(ctx);
    }
    
    // Draw floating texts
    for (const text of floatingTexts) {
        text.draw(ctx);
    }
    
    // Draw power-ups
    for (const powerUp of powerUps) {
        powerUp.draw(ctx);
    }
    
    // Draw player trail effect
    if (player.trail.length > 1) {
        ctx.save();
        
        // Draw trail from oldest to newest
        for (let i = 0; i < player.trail.length - 1; i++) {
            const trailPoint = player.trail[i];
            const alpha = (i + 1) / player.trail.length; // Fade from 0 to 1
            const size = alpha * player.width * 0.8; // Scale from small to large
            
            // Determine trail color based on state
            let trailColor = 'rgba(74, 144, 226, '; // Blue for normal
            
            if (player.isDashing) {
                trailColor = 'rgba(74, 144, 226, '; // Bright blue for dash
            } else if (activePowerUps.SPEED.active) {
                trailColor = 'rgba(255, 215, 0, '; // Gold for speed boost
            } else if (game.combo >= 5) {
                trailColor = 'rgba(255, 102, 0, '; // Orange for high combo
            } else if (game.combo >= 3) {
                trailColor = 'rgba(0, 255, 255, '; // Cyan for medium combo
            }
            
            // Draw glow effect
            ctx.globalAlpha = alpha * 0.15;
            const glowGradient = ctx.createRadialGradient(
                trailPoint.x, trailPoint.y, 0,
                trailPoint.x, trailPoint.y, size * 1.2
            );
            glowGradient.addColorStop(0, trailColor + '0.6)');
            glowGradient.addColorStop(1, trailColor + '0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(trailPoint.x, trailPoint.y, size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw main trail circle
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = trailColor + '0.4)';
            ctx.beginPath();
            ctx.arc(trailPoint.x, trailPoint.y, size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Add sparkle effect for high combos
            if (game.combo >= 5 && i % 2 === 0) {
                ctx.globalAlpha = alpha * 0.5;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(trailPoint.x, trailPoint.y, size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    
    // Draw player
    if (images.player.complete) {
        // Draw shield effect if active
        if (activePowerUps.SHIELD.active) {
            ctx.save();
            const shieldPulse = Math.sin(Date.now() * 0.005) * 5 + 60;
            const shieldGradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, shieldPulse);
            shieldGradient.addColorStop(0, 'rgba(74, 144, 226, 0.3)');
            shieldGradient.addColorStop(0.7, 'rgba(74, 144, 226, 0.2)');
            shieldGradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
            ctx.fillStyle = shieldGradient;
            ctx.beginPath();
            ctx.arc(player.x, player.y, shieldPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // Dash glow effect
        if (player.isDashing) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#4a90e2';
            ctx.globalAlpha = 0.7;
        }
        
        // Speed boost glow effect
        if (activePowerUps.SPEED.active) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffd700';
        }
        
        // Flip to face mouse
        const dx = mouse.x - player.x;
        if (dx < 0) {
            ctx.scale(-1, 1);
        }
        
        // Draw astronaut with proper aspect ratio (taller than wide) - HD rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(images.player, -player.width/2, -player.height/2, player.width, player.height);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Gun
        if (!player.isDashing) {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.rotate(player.angle);
            
            ctx.fillStyle = '#333';
            ctx.fillRect(15, -3, 25, 6);
            
            ctx.fillStyle = '#666';
            ctx.fillRect(10, -5, 10, 10);
            
            ctx.restore();
        }
    } else {
        // Fallback
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function initGame() {
    const diff = DIFFICULTY[game.difficulty];
    
    game.wave = 1;
    game.kills = 0;
    game.score = 0;
    game.waveInProgress = false;
    game.waitingForNextWave = false;
    game.expectedEnemies = 0;
    game.spawnedEnemies = 0;
    game.combo = 0;
    game.comboTimer = 0;
    game.maxCombo = 0;
    game.bossKills = 0;
    game.learningScreensCompleted = 0;
    game.speedWaves = 0;
    game.survivalWaves = 0;
    game.perfectWaves = 0;
    game.usedDash = false;
    game.gameStartTime = Date.now();
    
    // Reset vowel tracker
    vowelTracker.reset();
    
    // Reset parallax offset
    parallax.offsetX = 0;
    parallax.offsetY = 0;
    
    // Apply achievement bonuses, challenge buffs, battle pass boosts, and clan bonuses
    const rewards = achievementManager.getActiveRewards();
    const challengeBuffs = dailyChallengeManager.getActiveBuffs();
    const eventMods = dailyChallengeManager.getEventModifiers();
    const battlePassBoosts = battlePassManager.getActiveBoosts();
    
    // Combine all multipliers
    const totalHealthBonus = rewards.healthBonus + challengeBuffs.healthBonus + battlePassBoosts.healthBonus;
    const totalSpeedMult = rewards.speedMultiplier * challengeBuffs.speedMultiplier * eventMods.speedMultiplier * battlePassBoosts.speedMultiplier;
    const totalFireRateMult = rewards.fireRateMultiplier * challengeBuffs.fireRateMultiplier * battlePassBoosts.fireRateMultiplier;
    const totalDamageMult = rewards.damageMultiplier * challengeBuffs.damageMultiplier * battlePassBoosts.damageMultiplier;
    
    player.health = diff.playerHealth + totalHealthBonus;
    player.maxHealth = diff.playerHealth + totalHealthBonus;
    player.speed = diff.playerSpeed * totalSpeedMult;
    player.weapon.fireRate = diff.fireRate * totalFireRateMult;
    player.weapon.damage = 50 * totalDamageMult;
    player.weapon.piercing = 0;
    player.maxDashCooldown = diff.dashCooldown;
    player.dashCooldown = 0;
    player.isDashing = false;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.upgrades = {};
    player.trail = []; // Reset trail
    
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    bloodSplatters.length = 0;
    floatingTexts.length = 0;
    powerUps.length = 0;
    bossShockwaves.length = 0;
    bossProjectiles.length = 0;
    
    // Reset active power-ups
    activePowerUps.SPEED.active = false;
    activePowerUps.SHIELD.active = false;
    activePowerUps.RAPID_FIRE.active = false;
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('dash-cooldown').style.display = 'block';
    
    // Set difficulty badge
    const badges = {
        tutorial: '📚 TUTORIAL',
        easy: '😊 EASY MODE',
        normal: '⚔️ NORMAL MODE',
        hard: '💀 HARD MODE'
    };
    document.getElementById('difficulty-badge').textContent = badges[game.difficulty];
    
    updateHUD();
}

// Start game
function startGame(difficulty) {
    console.log('Starting game with difficulty:', difficulty);
    game.state = 'playing';
    game.difficulty = difficulty;
    
    // Hide start screen
    document.getElementById('start-screen').style.display = 'none';
    
    initGame();
    soundManager.playMusic();
    soundManager.resetMusicSpeed(); // Start with normal speed
    console.log('Game state after init:', { state: game.state, wave: game.wave, waveInProgress: game.waveInProgress });
    spawnWave();
}

function gameOver() {
    game.state = 'gameover';
    game.waveInProgress = false;
    game.waitingForNextWave = false;
    
    // Submit stats to daily challenge system and check for completions
    dailyChallengeManager.trackGameSession({
        score: game.score,
        wave: game.wave,
        maxCombo: game.maxCombo,
        kills: game.kills,
        bossKills: game.bossKills,
        learningScreens: game.learningScreensCompleted,
        speedWaves: game.speedWaves,
        survivalWaves: game.survivalWaves,
        perfectWaves: game.perfectWaves
    });
    
    // Check if any challenges were completed
    checkForChallengeCompletions();
    
    // Award battle pass XP (with clan XP boost)
    let xp = battlePassManager.calculateXPFromGame({
        score: game.score,
        wave: game.wave,
        kills: game.kills,
        bossKills: game.bossKills,
        maxCombo: game.maxCombo,
        learningScreens: game.learningScreensCompleted,
        perfectWaves: game.perfectWaves,
        speedWaves: game.speedWaves
    });
    
    const xpResult = battlePassManager.addXP(xp);
    
    // Show tier up notifications if any
    if (xpResult.tierUps.length > 0) {
        showBattlePassTierUps(xpResult.tierUps, xpResult.xpGained);
    }
    
    soundManager.stopMusic();
    soundManager.resetMusicSpeed(); // Reset speed when game ends
    soundManager.play('gameOver');
    
    // Clear all game objects
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    bossShockwaves.length = 0;
    bossProjectiles.length = 0;
    
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('crosshair').style.display = 'none';
    document.getElementById('dash-cooldown').style.display = 'none';
    document.getElementById('combo-display').style.display = 'none';
    document.getElementById('final-difficulty').textContent = game.difficulty.toUpperCase();
    document.getElementById('final-wave').textContent = game.wave;
    document.getElementById('final-kills').textContent = game.kills;
    document.getElementById('final-combo').textContent = game.maxCombo;
    document.getElementById('final-score').textContent = game.score;
    
    // Check if score made the leaderboard
    const madeLeaderboard = leaderboard.wouldMakeLeaderboard(game.score);
    
    if (madeLeaderboard) {
        // Show name input for leaderboard
        document.getElementById('score-input-section').style.display = 'block';
        document.getElementById('leaderboard-section').style.display = 'none';
    } else {
        // Just show leaderboard
        document.getElementById('score-input-section').style.display = 'none';
        document.getElementById('leaderboard-section').style.display = 'block';
        updateLeaderboardDisplay();
    }
}

function submitScore() {
    const nameInput = document.getElementById('player-name-input');
    const playerName = nameInput.value.trim() || 'Anonymous';
    
    // Add score to leaderboard
    const result = leaderboard.addScore(
        playerName,
        game.score,
        game.wave,
        game.kills,
        game.maxCombo,
        game.difficulty
    );
    
    soundManager.play('uiClick');
    
    // Hide input section and show leaderboard
    document.getElementById('score-input-section').style.display = 'none';
    document.getElementById('leaderboard-section').style.display = 'block';
    updateLeaderboardDisplay();
    
    // Clear input for next time
    nameInput.value = '';
}

function updateLeaderboardDisplay() {
    const tbody = document.getElementById('leaderboard-tbody');
    const scores = leaderboard.getScores();
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No scores yet. Be the first!</td></tr>';
        return;
    }
    
    tbody.innerHTML = scores.map((entry, index) => {
        const difficultyColors = {
            tutorial: '#4CAF50',
            easy: '#4CAF50',
            normal: '#FF9800',
            hard: '#9C27B0'
        };
        
        const difficultyEmojis = {
            tutorial: '📚',
            easy: '😊',
            normal: '⚔️',
            hard: '💀'
        };
        
        const rankEmojis = ['🥇', '🥈', '🥉'];
        const rankDisplay = index < 3 ? rankEmojis[index] : `#${index + 1}`;
        
        return `
            <tr>
                <td style="font-size: 20px;">${rankDisplay}</td>
                <td style="font-weight: bold; color: #ffd700;">${entry.name}</td>
                <td style="font-size: 18px; font-weight: bold; color: #4CAF50;">${entry.score}</td>
                <td>
                    <span style="color: ${difficultyColors[entry.difficulty]};">
                        ${difficultyEmojis[entry.difficulty]} ${entry.difficulty.toUpperCase()}
                    </span>
                    <div style="font-size: 12px; color: #888;">
                        Wave ${entry.wave} • ${entry.kills} Kills • ${entry.maxCombo}x Combo
                    </div>
                </td>
                <td style="font-size: 12px; color: #888;">${leaderboard.formatDate(entry.date)}</td>
            </tr>
        `;
    }).join('');
}

// Event listeners
document.getElementById('tutorial-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    startTutorial(game, initGame);
});
document.getElementById('easy-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    startGame('easy');
});
document.getElementById('normal-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    startGame('normal');
});
document.getElementById('hard-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    startGame('hard');
});
document.getElementById('play-again-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    
    // Store current difficulty
    const currentDifficulty = game.difficulty;
    
    // Hide game over screen
    document.getElementById('game-over').style.display = 'none';
    
    // Restart with same difficulty
    startGame(currentDifficulty);
});

document.getElementById('restart-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    soundManager.stopMusic();
    // Fully reset game state
    game.state = 'start';
    game.wave = 1;
    game.kills = 0;
    game.score = 0;
    game.waveInProgress = false;
    game.waitingForNextWave = false;
    game.tutorialStep = 0;
    game.expectedEnemies = 0;
    game.spawnedEnemies = 0;
    
    // Clear all arrays
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    bloodSplatters.length = 0;
    floatingTexts.length = 0;
    
    // Hide overlays
    document.getElementById('tutorial-overlay').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    
    // Update achievement badge
    updateAchievementBadge();
});

// Submit score button
document.getElementById('submit-score-btn').addEventListener('click', () => {
    submitScore();
});

// Allow Enter key to submit score
document.getElementById('player-name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitScore();
    }
});

// View leaderboard from start screen
document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('leaderboard-modal').style.display = 'flex';
    updateLeaderboardDisplay();
});

// Close leaderboard modal
document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('leaderboard-modal').style.display = 'none';
});

document.getElementById('leaderboard-back-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('leaderboard-modal').style.display = 'none';
});

// Clear leaderboard
document.getElementById('clear-leaderboard-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all leaderboard scores? This cannot be undone!')) {
        soundManager.play('uiClick');
        leaderboard.clearScores();
        updateLeaderboardDisplay();
    }
});

// Vowel learning screen continue button
document.getElementById('continue-vowel-btn').addEventListener('click', () => {
    closeVowelLearning();
});

// View alien codex from start screen
document.getElementById('view-codex-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    showAlienCodex();
});

// Close codex modal
document.getElementById('close-codex-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('codex-modal').style.display = 'none';
});

document.getElementById('codex-back-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('codex-modal').style.display = 'none';
});

// Achievements modal
document.getElementById('view-achievements-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    showAchievementsModal();
});

document.getElementById('close-achievements-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('achievements-modal').style.display = 'none';
});

document.getElementById('achievements-back-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('achievements-modal').style.display = 'none';
});

document.getElementById('reset-achievements-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset ALL achievements? This cannot be undone!')) {
        soundManager.play('uiClick');
        achievementManager.resetAll();
        showAchievementsModal(); // Refresh display
    }
});

// Daily challenges modal
document.getElementById('view-challenges-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    showChallengesModal();
});

document.getElementById('close-challenges-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('challenges-modal').style.display = 'none';
});

document.getElementById('challenges-back-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('challenges-modal').style.display = 'none';
});

// Battle pass modal
document.getElementById('view-battlepass-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    showBattlePassModal();
});

document.getElementById('close-battlepass-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('battlepass-modal').style.display = 'none';
});

document.getElementById('battlepass-back-btn').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('battlepass-modal').style.display = 'none';
});

document.getElementById('unlock-premium-btn').addEventListener('click', () => {
    if (confirm('Unlock Premium Battle Pass? This will grant you access to all premium rewards for this season!')) {
        soundManager.play('upgrade');
        const newRewards = battlePassManager.unlockPremium();
        showBattlePassModal(); // Refresh display
        if (newRewards.length > 0) {
            alert(`Premium unlocked! Claimed ${newRewards.length} rewards instantly!`);
        }
    }
});

function showAlienCodex() {
    const codexModal = document.getElementById('codex-modal');
    const codexContent = document.getElementById('codex-content');
    
    // Import alien types and bosses
    Promise.all([
        import('./js/alienTypes.js'),
        import('./js/bossAliens.js')
    ]).then(([alienModule, bossModule]) => {
        const { ALIEN_TYPES } = alienModule;
        const { BOSS_TYPES } = bossModule;
        
        codexContent.innerHTML = '';
        
        // Add boss section header
        const bossHeader = document.createElement('div');
        bossHeader.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            color: #ffd700;
            font-size: 28px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            text-shadow: 0 0 15px #ffd700;
        `;
        bossHeader.textContent = '👑 BOSS ALIENS 👑';
        codexContent.appendChild(bossHeader);
        
        // Add bosses first
        Object.entries(BOSS_TYPES).forEach(([key, alien]) => {
            const entry = document.createElement('div');
            entry.style.cssText = `
                background: linear-gradient(135deg, ${alien.color}33, ${alien.color2}33);
                border: 3px solid #ffd700;
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s;
                box-shadow: 0 0 20px ${alien.color}66;
            `;
            entry.onmouseenter = () => entry.style.transform = 'translateY(-5px) scale(1.02)';
            entry.onmouseleave = () => entry.style.transform = 'translateY(0) scale(1)';
            
            // Draw alien preview
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            const ctx = canvas.getContext('2d');
            
            // Draw simplified boss alien (larger)
            const centerX = 60;
            const centerY = 60;
            const radius = alien.size / 2.2;
            
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = alien.color;
            
            // Body
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, alien.color);
            gradient.addColorStop(1, alien.color2);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.4, centerY - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.4, centerY - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.4, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.4, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Crown for bosses
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius * 1.3);
            ctx.lineTo(centerX - radius * 0.3, centerY - radius * 0.9);
            ctx.lineTo(centerX - radius * 0.5, centerY - radius * 1.2);
            ctx.lineTo(centerX - radius * 0.2, centerY - radius * 0.9);
            ctx.lineTo(centerX, centerY - radius * 1.5);
            ctx.lineTo(centerX + radius * 0.2, centerY - radius * 0.9);
            ctx.lineTo(centerX + radius * 0.5, centerY - radius * 1.2);
            ctx.lineTo(centerX + radius * 0.3, centerY - radius * 0.9);
            ctx.closePath();
            ctx.fill();
            
            entry.innerHTML = `
                <h3 style="color: #ffd700; margin-bottom: 10px; font-size: 24px; text-shadow: 0 0 10px #ffd700;">${alien.name}</h3>
                <div style="margin: 15px 0;">${canvas.outerHTML}</div>
                <p style="color: #ccc; font-size: 14px; line-height: 1.4; margin-bottom: 10px;">${alien.description}</p>
                <div style="display: flex; justify-content: space-around; margin-top: 15px; font-size: 12px;">
                    <div style="color: #ff6b6b;">💪 ${Math.round(alien.health * 100)}%</div>
                    <div style="color: #4ecdc4;">⚡ ${Math.round(alien.speed * 100)}%</div>
                    <div style="color: #ffd700;">⭐ ${alien.scoreValue}</div>
                </div>
                <div style="margin-top: 10px; padding: 8px; background: rgba(255,215,0,0.2); border-radius: 8px; font-size: 13px; color: #ffd700;">
                    <strong>Boss Ability:</strong> ${alien.behavior.charAt(0).toUpperCase() + alien.behavior.slice(1)}
                </div>
            `;
            
            codexContent.appendChild(entry);
        });
        
        // Add regular aliens section header
        const alienHeader = document.createElement('div');
        alienHeader.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            color: #a29bfe;
            font-size: 28px;
            font-weight: bold;
            margin: 30px 0 10px 0;
            text-shadow: 0 0 15px #a29bfe;
        `;
        alienHeader.textContent = '👽 REGULAR ALIENS 👽';
        codexContent.appendChild(alienHeader);
        
        Object.entries(ALIEN_TYPES).forEach(([key, alien]) => {
            const entry = document.createElement('div');
            entry.style.cssText = `
                background: linear-gradient(135deg, ${alien.color}33, ${alien.color2}33);
                border: 2px solid ${alien.color};
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s;
            `;
            entry.onmouseenter = () => entry.style.transform = 'translateY(-5px)';
            entry.onmouseleave = () => entry.style.transform = 'translateY(0)';
            
            // Draw alien preview
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Draw simplified alien
            const centerX = 50;
            const centerY = 50;
            const radius = alien.size / 2.5;
            
            // Body
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, alien.color);
            gradient.addColorStop(1, alien.color2);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.4, centerY - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.4, centerY - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.4, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.4, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Antennae
            ctx.strokeStyle = alien.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX - radius * 0.3, centerY - radius);
            ctx.lineTo(centerX - radius * 0.5, centerY - radius * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + radius * 0.3, centerY - radius);
            ctx.lineTo(centerX + radius * 0.5, centerY - radius * 1.5);
            ctx.stroke();
            
            ctx.fillStyle = alien.antennaColor;
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.5, centerY - radius * 1.5, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.5, centerY - radius * 1.5, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            entry.innerHTML = `
                <h3 style="color: ${alien.color}; margin-bottom: 10px; font-size: 22px;">${alien.name}</h3>
                <div style="margin: 15px 0;">${canvas.outerHTML}</div>
                <p style="color: #ccc; font-size: 14px; line-height: 1.4; margin-bottom: 10px;">${alien.description}</p>
                <div style="display: flex; justify-content: space-around; margin-top: 15px; font-size: 12px;">
                    <div style="color: #ff6b6b;">💪 ${Math.round(alien.health * 100)}%</div>
                    <div style="color: #4ecdc4;">⚡ ${Math.round(alien.speed * 100)}%</div>
                    <div style="color: #ffd700;">⭐ ${Math.round(alien.scoreMultiplier * 100)}%</div>
                </div>
                <div style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 13px; color: #a29bfe;">
                    <strong>Behavior:</strong> ${alien.behavior.charAt(0).toUpperCase() + alien.behavior.slice(1)}
                </div>
            `;
            
            codexContent.appendChild(entry);
        });
    });
    
    codexModal.style.display = 'flex';
}

function showAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    const content = document.getElementById('achievements-content');
    const progress = document.getElementById('achievement-progress');
    
    // Show unlock percentage
    const percentage = achievementManager.getUnlockPercentage();
    progress.innerHTML = `✨ ${percentage}% Complete ✨`;
    
    // Get achievements by category
    const categories = achievementManager.getAchievementsByCategory();
    
    const categoryNames = {
        score: '🎯 Score Achievements',
        wave: '🌊 Wave Achievements',
        kills: '💀 Kill Achievements',
        combo: '🔥 Combo Achievements',
        boss: '👊 Boss Achievements',
        learning: '📚 Learning Achievements',
        difficulty: '🏆 Difficulty Achievements',
        special: '✨ Special Achievements'
    };
    
    content.innerHTML = '';
    
    // Create achievement cards for each category
    Object.entries(categories).forEach(([category, achievements]) => {
        if (achievements.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.style.cssText = 'margin-bottom: 30px;';
        
        const categoryHeader = document.createElement('h3');
        categoryHeader.style.cssText = `
            color: #FFD700;
            font-size: 24px;
            margin-bottom: 15px;
            text-shadow: 0 0 10px #FFD700;
            text-align: center;
        `;
        categoryHeader.textContent = categoryNames[category];
        categoryDiv.appendChild(categoryHeader);
        
        const achievementGrid = document.createElement('div');
        achievementGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
        `;
        
        achievements.forEach(achievement => {
            const card = document.createElement('div');
            const unlocked = achievement.unlocked;
            
            card.style.cssText = `
                background: ${unlocked ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2))' : 'rgba(50,50,50,0.5)'};
                border: 2px solid ${unlocked ? '#FFD700' : '#555'};
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                transition: transform 0.3s;
                opacity: ${unlocked ? '1' : '0.6'};
                filter: ${unlocked ? 'none' : 'grayscale(50%)'};
            `;
            
            if (unlocked) {
                card.onmouseenter = () => card.style.transform = 'translateY(-3px) scale(1.02)';
                card.onmouseleave = () => card.style.transform = 'translateY(0) scale(1)';
            }
            
            let rewardText = '';
            if (achievement.reward && achievement.reward.type !== 'none') {
                rewardText = `<div style="color: #4CAF50; font-size: 13px; margin-top: 8px; font-weight: bold;">
                    🎁 ${achievement.reward.description}
                </div>`;
            }
            
            let dateText = '';
            if (unlocked && achievement.unlockedAt) {
                const date = new Date(achievement.unlockedAt);
                dateText = `<div style="color: #888; font-size: 11px; margin-top: 5px;">
                    Unlocked: ${date.toLocaleDateString()}
                </div>`;
            }
            
            card.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">${achievement.icon}</div>
                <div style="font-size: 18px; font-weight: bold; color: ${unlocked ? '#FFD700' : '#999'}; margin-bottom: 5px;">
                    ${achievement.name}
                </div>
                <div style="color: #ccc; font-size: 14px; margin-bottom: 10px;">
                    ${achievement.description}
                </div>
                ${rewardText}
                ${dateText}
                ${unlocked ? '<div style="color: #4CAF50; font-size: 14px; margin-top: 8px; font-weight: bold;">✓ UNLOCKED</div>' : '<div style="color: #888; font-size: 14px; margin-top: 8px;">🔒 Locked</div>'}
            `;
            
            achievementGrid.appendChild(card);
        });
        
        categoryDiv.appendChild(achievementGrid);
        content.appendChild(categoryDiv);
    });
    
    modal.style.display = 'flex';
}

function showChallengesModal() {
    const modal = document.getElementById('challenges-modal');
    const content = document.getElementById('challenges-content');
    const eventsDiv = document.getElementById('active-events');
    const buffsDiv = document.getElementById('active-buffs');
    const timerDiv = document.getElementById('challenge-reset-timer');
    
    // Show active events
    const activeEvents = dailyChallengeManager.getActiveEvents();
    if (activeEvents.length > 0) {
        eventsDiv.innerHTML = '<h3 style="color: #4ECDC4; text-align: center; font-size: 24px; margin-bottom: 15px;">🎉 ACTIVE EVENTS 🎉</h3>';
        const eventGrid = document.createElement('div');
        eventGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;';
        
        activeEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.style.cssText = `
                background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(46, 139, 143, 0.3));
                border: 2px solid #4ECDC4;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                animation: pulse 2s infinite;
            `;
            eventCard.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">${event.icon}</div>
                <div style="font-size: 20px; font-weight: bold; color: #4ECDC4; margin-bottom: 10px;">${event.name}</div>
                <div style="color: #ccc; font-size: 14px;">${event.description}</div>
            `;
            eventGrid.appendChild(eventCard);
        });
        
        eventsDiv.appendChild(eventGrid);
        eventsDiv.style.display = 'block';
    } else {
        eventsDiv.style.display = 'none';
    }
    
    // Show active buffs
    const activeBuffs = dailyChallengeManager.activeBuffs;
    if (activeBuffs.length > 0) {
        buffsDiv.innerHTML = '<h3 style="color: #FFD700; text-align: center; font-size: 20px; margin-bottom: 15px;">💪 Active Buffs</h3>';
        const buffGrid = document.createElement('div');
        buffGrid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 20px;';
        
        activeBuffs.forEach(buff => {
            const timeLeft = buff.expiresAt - Date.now();
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            const buffBadge = document.createElement('div');
            buffBadge.style.cssText = `
                background: rgba(255, 215, 0, 0.2);
                border: 2px solid #FFD700;
                border-radius: 8px;
                padding: 10px 15px;
                font-size: 14px;
                color: #FFD700;
            `;
            buffBadge.textContent = `${buff.rewardText} (${hoursLeft}h ${minutesLeft}m)`;
            buffGrid.appendChild(buffBadge);
        });
        
        buffsDiv.appendChild(buffGrid);
        buffsDiv.style.display = 'block';
    } else {
        buffsDiv.style.display = 'none';
    }
    
    // Show daily challenges
    const { challenges, progress, timeUntilReset } = dailyChallengeManager.getCurrentChallenges();
    timerDiv.textContent = `⏰ New challenges in: ${dailyChallengeManager.formatTimeRemaining(timeUntilReset)}`;
    
    content.innerHTML = '';
    
    const tierNames = {
        easy: { name: '😊 Easy Challenge', color: '#4CAF50' },
        medium: { name: '⚔️ Medium Challenge', color: '#FF9800' },
        hard: { name: '💀 Hard Challenge', color: '#9C27B0' }
    };
    
    Object.keys(challenges).forEach(tier => {
        const challenge = challenges[tier];
        const prog = progress[tier];
        const target = challenge.difficulties[challenge.difficulty].target;
        const progressPercent = Math.min(100, (prog.progress / target) * 100);
        
        const challengeCard = document.createElement('div');
        challengeCard.style.cssText = `
            background: ${prog.completed ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(46, 125, 50, 0.3))' : 'rgba(50,50,50,0.5)'};
            border: 3px solid ${prog.completed ? '#4CAF50' : tierNames[tier].color};
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        `;
        
        challengeCard.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: ${progressPercent}%; height: 5px; background: ${tierNames[tier].color}; transition: width 0.3s;"></div>
            <h3 style="color: ${tierNames[tier].color}; font-size: 24px; margin-bottom: 10px;">${tierNames[tier].name}</h3>
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                <div style="font-size: 60px;">${challenge.icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 22px; font-weight: bold; color: #fff; margin-bottom: 5px;">${challenge.name}</div>
                    <div style="color: #ccc; font-size: 16px; margin-bottom: 10px;">${challenge.description.replace('{target}', target)}</div>
                    <div style="background: rgba(0,0,0,0.3); border-radius: 10px; height: 20px; overflow: hidden; margin-bottom: 5px;">
                        <div style="background: linear-gradient(90deg, ${tierNames[tier].color}, ${tierNames[tier].color}aa); 
                                    height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="color: #aaa; font-size: 14px;">Progress: ${prog.progress} / ${target} (${Math.floor(progressPercent)}%)</div>
                </div>
            </div>
            <div style="background: rgba(255, 215, 0, 0.2); border: 2px solid #FFD700; border-radius: 10px; padding: 12px; text-align: center;">
                <div style="color: #FFD700; font-weight: bold; font-size: 16px;">🎁 Reward: ${challenge.difficulties[challenge.difficulty].reward}</div>
            </div>
            ${prog.completed ? '<div style="position: absolute; top: 15px; right: 15px; background: #4CAF50; color: #fff; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">✓ COMPLETED</div>' : ''}
        `;
        
        content.appendChild(challengeCard);
    });
    
    modal.style.display = 'flex';
}

function showBattlePassModal() {
    const modal = document.getElementById('battlepass-modal');
    const header = document.getElementById('season-header');
    const progressDiv = document.getElementById('bp-progress');
    const rewardsDiv = document.getElementById('bp-rewards');
    const premiumBtn = document.getElementById('unlock-premium-btn');
    
    const progress = battlePassManager.getProgress();
    const season = progress.season;
    
    // Season Header
    header.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">${season.icon}</div>
        <h2 style="color: ${season.color}; font-size: 42px; margin-bottom: 10px; text-shadow: 0 0 20px ${season.color};">
            SEASON ${season.id}: ${season.name.toUpperCase()}
        </h2>
        <div style="color: #aaa; font-size: 18px; margin-bottom: 10px;">${season.description}</div>
        <div style="color: #888; font-size: 16px;">⏰ Season ends in: ${battlePassManager.formatTimeRemaining(battlePassManager.getSeasonEndTime())}</div>
    `;
    
    // Progress Bar
    const progressPercent = Math.min(100, progress.progress);
    progressDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 32px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">
                TIER ${progress.tier} ${progress.hasPremium ? '<span style="font-size: 24px; color: #fbbf24;">✨ PREMIUM</span>' : '<span style="font-size: 18px; color: #888;">(Free Track)</span>'}
            </div>
            ${progress.selectedTitle ? `<div style="font-size: 18px; color: #a78bfa; margin-bottom: 10px;">🏆 "${progress.selectedTitle}"</div>` : ''}
            <div style="background: rgba(0,0,0,0.5); border-radius: 15px; height: 30px; overflow: hidden; position: relative; border: 2px solid ${season.color};">
                <div style="background: linear-gradient(90deg, ${season.color}, #8b5cf6); height: 100%; width: ${progressPercent}%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 14px;">
                    ${progressPercent > 10 ? `${Math.floor(progressPercent)}%` : ''}
                </div>
            </div>
            <div style="color: #aaa; margin-top: 8px; font-size: 16px;">${progress.xp} / ${progress.xpNeeded} XP to Tier ${progress.nextTier}</div>
        </div>
    `;
    
    // Rewards Grid
    rewardsDiv.innerHTML = '<h3 style="color: #6366f1; text-align: center; margin-bottom: 20px; font-size: 28px;">BATTLE PASS REWARDS</h3>';
    
    const rewardsGrid = document.createElement('div');
    rewardsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;';
    
    // Show rewards in chunks (10 at a time, centered on current tier)
    const startTier = Math.max(1, progress.tier - 5);
    const endTier = Math.min(100, progress.tier + 15);
    
    for (let tier = startTier; tier <= endTier; tier++) {
        const reward = battlePassManager.getRewardForTier(tier);
        const isUnlocked = progress.unlockedTiers.includes(tier);
        const isCurrent = tier === progress.tier;
        
        const rewardCard = document.createElement('div');
        rewardCard.style.cssText = `
            background: ${isCurrent ? `linear-gradient(135deg, ${season.color}44, ${season.color}22)` : 'rgba(30,30,30,0.8)'};
            border: 2px solid ${isCurrent ? season.color : (isUnlocked ? '#4ade80' : '#555')};
            border-radius: 10px;
            padding: 10px;
            text-align: center;
            opacity: ${isUnlocked ? '1' : '0.6'};
            position: relative;
            transition: transform 0.2s;
            ${isCurrent ? 'box-shadow: 0 0 20px ' + season.color + '88;' : ''}
        `;
        
        if (isUnlocked && !isCurrent) {
            rewardCard.onmouseenter = () => rewardCard.style.transform = 'scale(1.05)';
            rewardCard.onmouseleave = () => rewardCard.style.transform = 'scale(1)';
        }
        
        let freeRewardHTML = '';
        if (reward.free) {
            freeRewardHTML = `
                <div style="background: rgba(76, 175, 80, 0.2); border: 1px solid #4CAF50; border-radius: 8px; padding: 8px; margin-bottom: 5px;">
                    <div style="font-size: 24px; margin-bottom: 3px;">${reward.free.icon}</div>
                    <div style="font-size: 10px; color: #4CAF50; font-weight: bold;">FREE</div>
                    ${isUnlocked ? '<div style="font-size: 16px; color: #4ade80;">✓</div>' : '<div style="font-size: 16px; color: #888;">🔒</div>'}
                </div>
            `;
        } else {
            freeRewardHTML = '<div style="height: 80px; display: flex; align-items: center; justify-content: center; color: #555;">---</div>';
        }
        
        let premiumRewardHTML = '';
        if (reward.premium) {
            const canClaim = isUnlocked && progress.hasPremium;
            premiumRewardHTML = `
                <div style="background: rgba(251, 191, 36, 0.2); border: 1px solid #fbbf24; border-radius: 8px; padding: 8px;">
                    <div style="font-size: 24px; margin-bottom: 3px;">${reward.premium.icon}</div>
                    <div style="font-size: 10px; color: #fbbf24; font-weight: bold;">PREMIUM</div>
                    ${canClaim ? '<div style="font-size: 16px; color: #fbbf24;">✓</div>' : '<div style="font-size: 16px; color: #888;">🔒</div>'}
                </div>
            `;
        }
        
        rewardCard.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: ${isCurrent ? season.color : '#fff'}; margin-bottom: 8px;">
                TIER ${tier}
            </div>
            ${freeRewardHTML}
            ${premiumRewardHTML}
        `;
        
        // Add click to show reward details
        if (isUnlocked) {
            rewardCard.style.cursor = 'pointer';
            rewardCard.onclick = () => {
                let details = `TIER ${tier} REWARDS:\n\n`;
                if (reward.free) details += `FREE: ${reward.free.description}\n`;
                if (reward.premium && progress.hasPremium) details += `PREMIUM: ${reward.premium.description}`;
                alert(details);
            };
        }
        
        rewardsGrid.appendChild(rewardCard);
    }
    
    rewardsDiv.appendChild(rewardsGrid);
    
    // Show unlock premium button if not premium
    premiumBtn.style.display = progress.hasPremium ? 'none' : 'block';
    
    modal.style.display = 'flex';
}

// Battle pass tier up notifications
function showBattlePassTierUps(tierUps, xpGained) {
    // Show summary notification
    const notification = document.getElementById('tierup-notification');
    const tierText = tierUps.length > 1 ? `${tierUps.length} TIERS` : `TIER ${tierUps[tierUps.length - 1]}`;
    
    document.getElementById('tierup-number').textContent = tierText;
    document.getElementById('tierup-xp').textContent = `+${xpGained} XP Earned`;
    
    // List rewards gained
    let rewardsText = 'New rewards unlocked!';
    document.getElementById('tierup-rewards').textContent = rewardsText;
    
    notification.style.display = 'block';
    soundManager.play('waveComplete');
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Check for challenge completions and show notifications
let challengeNotificationQueue = [];
let isShowingChallengeNotification = false;

function checkForChallengeCompletions() {
    const { challenges, progress } = dailyChallengeManager.getCurrentChallenges();
    
    Object.keys(challenges).forEach(tier => {
        const prog = progress[tier];
        if (prog.completed && prog.justCompleted) {
            challengeNotificationQueue.push({
                name: challenges[tier].name,
                tier: tier.toUpperCase(),
                reward: challenges[tier].difficulties[challenges[tier].difficulty].reward
            });
            prog.justCompleted = false; // Mark as shown
        }
    });
    
    if (challengeNotificationQueue.length > 0 && !isShowingChallengeNotification) {
        showNextChallengeNotification();
    }
}

function showNextChallengeNotification() {
    if (challengeNotificationQueue.length === 0) {
        isShowingChallengeNotification = false;
        return;
    }
    
    isShowingChallengeNotification = true;
    const challenge = challengeNotificationQueue.shift();
    
    const notification = document.getElementById('challenge-notification');
    document.getElementById('challenge-name').textContent = challenge.name;
    document.getElementById('challenge-tier').textContent = challenge.tier + ' Challenge';
    document.getElementById('challenge-reward').textContent = '🎁 ' + challenge.reward;
    
    // Show notification
    notification.style.display = 'block';
    soundManager.play('upgrade'); // Play sound for challenge
    
    // Hide after 4 seconds and show next
    setTimeout(() => {
        notification.style.display = 'none';
        setTimeout(() => {
            showNextChallengeNotification();
        }, 500);
    }, 4000);
}

// Update achievement and event badges on start screen
function updateAchievementBadge() {
    const badge = document.getElementById('achievement-badge');
    const eventBadge = document.getElementById('event-badge');
    
    if (badge) {
        const percentage = achievementManager.getUnlockPercentage();
        const totalAchievements = Object.keys(achievementManager.achievements).length;
        const unlockedCount = Object.values(achievementManager.achievements).filter(a => a.unlocked).length;
        
        badge.innerHTML = `🏅 Achievements: ${unlockedCount}/${totalAchievements} (${percentage}%)`;
    }
    
    if (eventBadge) {
        const activeEvents = dailyChallengeManager.getActiveEvents();
        const activeBuffs = dailyChallengeManager.activeBuffs;
        
        if (activeEvents.length > 0) {
            const eventNames = activeEvents.map(e => e.icon).join(' ');
            eventBadge.innerHTML = `${eventNames} <span style="animation: pulse 2s infinite;">SPECIAL EVENT ACTIVE!</span>`;
            eventBadge.style.display = 'block';
        } else if (activeBuffs.length > 0) {
            eventBadge.innerHTML = `💪 ${activeBuffs.length} Active Buff${activeBuffs.length > 1 ? 's' : ''}`;
            eventBadge.style.display = 'block';
        } else {
            eventBadge.style.display = 'none';
        }
    }
    
    // Show indicator if there are incomplete challenges
    const challengeIndicator = document.getElementById('challenge-badge-indicator');
    if (challengeIndicator) {
        const { progress } = dailyChallengeManager.getCurrentChallenges();
        const hasIncomplete = Object.values(progress).some(p => !p.completed);
        challengeIndicator.style.display = hasIncomplete ? 'block' : 'none';
    }
    
    // Update battle pass tier badge
    const bpTierBadge = document.getElementById('battlepass-tier-badge');
    const seasonBadge = document.getElementById('season-badge');
    if (bpTierBadge) {
        const bpProgress = battlePassManager.getProgress();
        bpTierBadge.textContent = bpProgress.tier;
        
        if (seasonBadge) {
            const season = bpProgress.season;
            seasonBadge.innerHTML = `${season.icon} Season ${season.id}: ${season.name} - Tier ${bpProgress.tier}/100`;
        }
    }
}

// Achievement notification system
let notificationQueue = [];
let isShowingNotification = false;

function checkAndShowAchievementNotifications() {
    const notifications = achievementManager.getPendingNotifications();
    if (notifications.length > 0) {
        notificationQueue.push(...notifications);
        if (!isShowingNotification) {
            showNextNotification();
        }
    }
}

function showNextNotification() {
    if (notificationQueue.length === 0) {
        isShowingNotification = false;
        return;
    }
    
    isShowingNotification = true;
    const achievement = notificationQueue.shift();
    
    const notification = document.getElementById('achievement-notification');
    document.getElementById('achievement-icon').textContent = achievement.icon;
    document.getElementById('achievement-name').textContent = achievement.name;
    document.getElementById('achievement-description').textContent = achievement.description;
    
    let rewardText = '';
    if (achievement.reward && achievement.reward.type !== 'none') {
        rewardText = `Reward: ${achievement.reward.description}`;
    }
    document.getElementById('achievement-reward').textContent = rewardText;
    
    // Show notification
    notification.style.display = 'block';
    soundManager.play('upgrade'); // Play nice sound for achievement
    
    // Hide after 4 seconds and show next
    setTimeout(() => {
        notification.style.display = 'none';
        setTimeout(() => {
            showNextNotification();
        }, 500); // Small delay between notifications
    }, 4000);
}

document.getElementById('tutorial-next').addEventListener('click', () => {
    soundManager.play('uiClick');
    document.getElementById('tutorial-overlay').style.display = 'none';
    
    if (game.state === 'tutorial' && !game.waveInProgress && !game.waitingForNextWave) {
        spawnWave();
    }
});

// Mute button
document.getElementById('mute-btn').addEventListener('click', () => {
    // Play click sound before toggling (so it plays if we're unmuting)
    if (!soundManager.enabled) {
        // Temporarily enable to play the unmute click
        const tempAudio = new Audio('https://play.rosebud.ai/assets/Retro Event UI 01.wav?2t0w');
        tempAudio.volume = 0.3 * 0.6;
        tempAudio.play().catch(() => {});
    } else {
        soundManager.play('uiClick');
    }
    
    const isEnabled = soundManager.toggle();
    const muteBtn = document.getElementById('mute-btn');
    
    if (isEnabled) {
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
        muteBtn.title = 'Mute Sound';
        
        // Resume music if game is playing
        if (game.state === 'playing' || game.state === 'tutorial') {
            soundManager.playMusic();
        }
    } else {
        muteBtn.textContent = '🔇';
        muteBtn.classList.add('muted');
        muteBtn.title = 'Unmute Sound';
    }
});
// Initialize mute button state
function initMuteButton() {
    const muteBtn = document.getElementById('mute-btn');
    if (!soundManager.enabled) {
        muteBtn.textContent = '🔇';
        muteBtn.classList.add('muted');
        muteBtn.title = 'Unmute Sound';
    } else {
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
        muteBtn.title = 'Mute Sound';
    }
}

// Wait for images to load before starting game loop
function checkImagesLoaded() {
    if (imagesLoaded >= totalImages) {
        gameLoop();
        
        // Initialize mute button
        initMuteButton();
        
        // Show start screen on first load
        document.getElementById('start-screen').style.display = 'flex';
        
        // Update achievement badge
        updateAchievementBadge();
    } else {
        setTimeout(checkImagesLoaded, 100);
    }
}

checkImagesLoaded();
