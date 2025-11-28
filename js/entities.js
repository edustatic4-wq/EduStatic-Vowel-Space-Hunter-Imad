// Game entities
import { DIFFICULTY } from './difficulty.js';
import { soundManager } from './sounds.js';
import { getRandomAlienType } from './alienTypes.js';
import { getBossForWave } from './bossAliens.js';

export class Vampire {
    constructor(x, y, wave, difficulty, images, player, isBoss = false) {
        this.x = x;
        this.y = y;
        this.images = images;
        this.player = player;
        this.isBoss = isBoss;
        
        // Get alien type based on difficulty (or boss type if boss)
        if (isBoss) {
            this.alienType = getBossForWave(wave, difficulty);
            this.bossPhaseIndex = 0;
            this.summonCooldown = 0;
            this.shockwaveCooldown = 0;
            this.projectileCooldown = 0;
        } else {
            this.alienType = getRandomAlienType(difficulty, wave);
        }
        
        this.radius = this.alienType.size / 2;
        this.size = this.alienType.size;
        
        // Assign a random short vowel
        const shortVowels = ['a', 'e', 'i', 'o', 'u'];
        this.vowel = shortVowels[Math.floor(Math.random() * shortVowels.length)];
        
        const diff = DIFFICULTY[difficulty];
        this.health = (diff.enemyHealth + Math.floor((wave - 1) * 5)) * this.alienType.health;
        this.maxHealth = this.health;
        this.speed = isBoss ? this.alienType.speed : (diff.enemySpeed + Math.min((wave - 1) * 0.03, 0.5)) * this.alienType.speed;
        this.damage = isBoss ? 20 : diff.enemyDamage;
        this.color = this.alienType.color;
        this.color2 = this.alienType.color2;
        this.antennaColor = this.alienType.antennaColor;
        this.lastAttack = 0;
        this.attackRate = 1000;
        this.scoreValue = isBoss ? this.alienType.scoreValue : Math.floor(10 * diff.scoreMultiplier * this.alienType.scoreMultiplier);
        
        // Behavior-specific properties
        this.behavior = this.alienType.behavior;
        this.zigzagTime = 0;
        this.zigzagDirection = 1;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitRadius = 150 + Math.random() * 100;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.isDashing = false;
        this.teleportCooldown = 0;
    }
    
    update(canvas, updateHUD, gameOver, canDamage = true, spawnMinion = null, createShockwave = null, createProjectile = null) {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Update boss phase based on health
        if (this.isBoss && this.alienType.phases) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            for (let i = this.alienType.phases.length - 1; i >= 0; i--) {
                if (healthPercent <= this.alienType.phases[i].healthPercent) {
                    this.bossPhaseIndex = i;
                    break;
                }
            }
            
            const currentPhase = this.alienType.phases[this.bossPhaseIndex];
            this.speed = currentPhase.speed;
            
            // Boss abilities
            this.summonCooldown--;
            this.shockwaveCooldown--;
            this.projectileCooldown--;
            
            // Summon minions
            if (currentPhase.summonRate && this.summonCooldown <= 0 && spawnMinion) {
                this.summonCooldown = currentPhase.summonRate;
                spawnMinion(this.x, this.y);
            }
            
            // Shockwave attack
            if (currentPhase.shockwaveRate && this.shockwaveCooldown <= 0 && createShockwave) {
                this.shockwaveCooldown = currentPhase.shockwaveRate;
                createShockwave(this.x, this.y);
            }
            
            // Projectile attack
            if (currentPhase.projectileRate && this.projectileCooldown <= 0 && createProjectile && dist < 400) {
                this.projectileCooldown = currentPhase.projectileRate;
                createProjectile(this.x, this.y, this.player.x, this.player.y);
            }
        }
        
        // Update behavior-specific movement
        if (dist > this.player.radius + this.radius) {
            switch(this.behavior) {
                case 'chase':
                case 'queen':
                case 'titan':
                case 'scholar':
                case 'omega':
                    // Standard chase behavior (bosses use this too)
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                    break;
                    
                case 'zigzag':
                    // Zigzag movement
                    this.zigzagTime += 0.1;
                    const angle = Math.atan2(dy, dx);
                    const perpAngle = angle + Math.PI / 2;
                    
                    // Switch direction periodically
                    if (Math.floor(this.zigzagTime) % 2 === 0 && this.zigzagTime % 1 < 0.1) {
                        this.zigzagDirection *= -1;
                    }
                    
                    this.x += Math.cos(angle) * this.speed * 0.7 + Math.cos(perpAngle) * this.speed * 0.5 * this.zigzagDirection;
                    this.y += Math.sin(angle) * this.speed * 0.7 + Math.sin(perpAngle) * this.speed * 0.5 * this.zigzagDirection;
                    break;
                    
                case 'orbit':
                    // Orbit around player at distance
                    if (dist > this.orbitRadius) {
                        // Move closer if too far
                        this.x += (dx / dist) * this.speed;
                        this.y += (dy / dist) * this.speed;
                    } else {
                        // Orbit
                        this.orbitAngle += 0.03;
                        const targetX = this.player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
                        const targetY = this.player.y + Math.sin(this.orbitAngle) * this.orbitRadius;
                        
                        const tdx = targetX - this.x;
                        const tdy = targetY - this.y;
                        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
                        
                        if (tdist > 5) {
                            this.x += (tdx / tdist) * this.speed;
                            this.y += (tdy / tdist) * this.speed;
                        }
                    }
                    break;
                    
                case 'dash':
                    // Periodic dash behavior
                    this.dashCooldown--;
                    
                    if (this.isDashing) {
                        this.dashDuration--;
                        // Dash at high speed
                        this.x += (dx / dist) * this.speed * 4;
                        this.y += (dy / dist) * this.speed * 4;
                        
                        // Store previous position for trail
                        if (!this.dashTrail) this.dashTrail = [];
                        this.dashTrail.push({ x: this.x, y: this.y, life: 10 });
                        if (this.dashTrail.length > 5) this.dashTrail.shift();
                        
                        if (this.dashDuration <= 0) {
                            this.isDashing = false;
                            this.dashCooldown = 120; // 2 seconds cooldown
                        }
                    } else {
                        // Normal slow movement
                        this.x += (dx / dist) * this.speed;
                        this.y += (dy / dist) * this.speed;
                        
                        // Start dash if cooldown ready and close enough
                        if (this.dashCooldown <= 0 && dist < 400) {
                            this.isDashing = true;
                            this.dashDuration = 20; // Dash for ~0.3 seconds
                        }
                    }
                    break;
                    
                case 'teleport':
                    // Teleport closer periodically
                    this.teleportCooldown--;
                    
                    if (this.teleportCooldown <= 0 && dist > 200) {
                        // Store old position for particle effect
                        const oldX = this.x;
                        const oldY = this.y;
                        
                        // Teleport to random position closer to player
                        const teleportDist = dist * 0.5;
                        const randomAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI / 2;
                        this.x = this.player.x - Math.cos(randomAngle) * teleportDist;
                        this.y = this.player.y - Math.sin(randomAngle) * teleportDist;
                        this.teleportCooldown = 180; // 3 seconds cooldown
                        soundManager.play('uiClick'); // Teleport sound
                        
                        // Store teleport positions for particle effect
                        this.teleportFrom = { x: oldX, y: oldY, life: 30 };
                        this.teleportTo = { x: this.x, y: this.y, life: 30 };
                    } else {
                        // Normal movement
                        this.x += (dx / dist) * this.speed;
                        this.y += (dy / dist) * this.speed;
                    }
                    break;
            }
        } else if (!this.player.isDashing && canDamage) {
            // Attack player
            const now = Date.now();
            if (now - this.lastAttack > this.attackRate) {
                this.player.health -= this.damage;
                this.lastAttack = now;
                
                soundManager.play('playerHurt');
                
                canvas.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                setTimeout(() => canvas.style.transform = '', 50);
                
                updateHUD();
                
                if (this.player.health <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    drawAlienShape(ctx) {
        const shape = this.alienType.shape || 'circle';
        const r = this.radius;
        
        switch(shape) {
            case 'circle':
                // Round alien (default)
                ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
                break;
                
            case 'triangle':
                // Triangular alien
                ctx.moveTo(this.x, this.y - r);
                ctx.lineTo(this.x - r * 0.866, this.y + r * 0.5);
                ctx.lineTo(this.x + r * 0.866, this.y + r * 0.5);
                ctx.closePath();
                break;
                
            case 'square':
                // Square alien
                ctx.rect(this.x - r, this.y - r, r * 2, r * 2);
                break;
                
            case 'diamond':
                // Diamond/rhombus alien
                ctx.moveTo(this.x, this.y - r);
                ctx.lineTo(this.x + r, this.y);
                ctx.lineTo(this.x, this.y + r);
                ctx.lineTo(this.x - r, this.y);
                ctx.closePath();
                break;
                
            case 'hexagon':
                // Hexagonal alien
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const px = this.x + r * Math.cos(angle);
                    const py = this.y + r * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                break;
                
            case 'octagon':
                // Octagonal alien (tank)
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI / 4) * i;
                    const px = this.x + r * Math.cos(angle);
                    const py = this.y + r * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                break;
                
            case 'star':
                // Star shape for bosses
                const spikes = this.isBoss ? 8 : 5;
                const outerR = r;
                const innerR = r * 0.5;
                for (let i = 0; i < spikes * 2; i++) {
                    const angle = (Math.PI / spikes) * i - Math.PI / 2;
                    const currentR = i % 2 === 0 ? outerR : innerR;
                    const px = this.x + currentR * Math.cos(angle);
                    const py = this.y + currentR * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                break;
                
            default:
                // Default to circle
                ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        }
    }
    
    draw(ctx) {
        // Draw dash trail
        if (this.dashTrail && this.dashTrail.length > 0) {
            ctx.save();
            this.dashTrail = this.dashTrail.filter(trail => {
                trail.life--;
                if (trail.life > 0) {
                    const alpha = trail.life / 10;
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(trail.x, trail.y, this.radius * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    return true;
                }
                return false;
            });
            ctx.restore();
        }
        
        // Draw teleport particles
        if (this.teleportFrom && this.teleportFrom.life > 0) {
            ctx.save();
            this.teleportFrom.life--;
            const alpha = this.teleportFrom.life / 30;
            ctx.globalAlpha = alpha;
            
            // Expanding circle
            const radius = this.radius * (1.5 - alpha * 0.5);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.teleportFrom.x, this.teleportFrom.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        if (this.teleportTo && this.teleportTo.life > 0) {
            ctx.save();
            this.teleportTo.life--;
            const alpha = this.teleportTo.life / 30;
            ctx.globalAlpha = alpha;
            
            // Contracting circle
            const radius = this.radius * (0.5 + alpha);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.teleportTo.x, this.teleportTo.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        if (this.images.vampire.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            const dx = this.player.x - this.x;
            if (dx < 0) {
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(this.images.vampire, -this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        } else {
            // Fallback: Draw colorful alien
            ctx.save();
            
            // Special dash glow effect
            if (this.behavior === 'dash' && this.isDashing) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
            }
            
            // Special teleport glow effect
            if (this.behavior === 'teleport' && this.teleportCooldown > 170) {
                const glowIntensity = (180 - this.teleportCooldown) / 10;
                ctx.shadowBlur = 15 * glowIntensity;
                ctx.shadowColor = this.color;
            }
            
            // Alien body with type-specific colors and shapes
            const bodyGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            bodyGradient.addColorStop(0, this.color);
            bodyGradient.addColorStop(0.6, this.color);
            bodyGradient.addColorStop(1, this.color2);
            ctx.fillStyle = bodyGradient;
            
            // Draw different shapes based on alien type
            ctx.beginPath();
            this.drawAlienShape(ctx);
            ctx.fill();
            
            // Alien eyes (big and cute)
            const eyeY = this.y - this.radius * 0.2;
            
            // Left eye white
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.4, eyeY, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Right eye white
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.4, eyeY, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Left eye pupil
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.4, eyeY, this.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Right eye pupil
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.4, eyeY, this.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Antennae
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            // Left antenna
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius * 0.3, this.y - this.radius);
            ctx.lineTo(this.x - this.radius * 0.5, this.y - this.radius * 1.5);
            ctx.stroke();
            
            // Right antenna
            ctx.beginPath();
            ctx.moveTo(this.x + this.radius * 0.3, this.y - this.radius);
            ctx.lineTo(this.x + this.radius * 0.5, this.y - this.radius * 1.5);
            ctx.stroke();
            
            // Antenna balls
            ctx.fillStyle = this.antennaColor;
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.5, this.y - this.radius * 1.5, this.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.5, this.y - this.radius * 1.5, this.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            ctx.restore();
        }
        
        // Draw vowel label above vampire (or boss name)
        ctx.save();
        ctx.font = this.isBoss ? 'bold 24px Arial' : 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.isBoss) {
            // Boss health bar
            const barWidth = this.size * 1.5;
            const barHeight = 12;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size/2 - 60;
            
            // Background
            ctx.fillStyle = 'rgba(50, 0, 0, 0.9)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health fill with gradient
            const healthPercent = this.health / this.maxHealth;
            const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // Border
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Boss name
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(this.alienType.name.toUpperCase(), this.x, barY - 15);
            ctx.fillText(this.alienType.name.toUpperCase(), this.x, barY - 15);
        } else {
            // Regular vowel label
            const vowelY = this.y - this.size/2 - 35;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(this.x, vowelY, 22, 0, Math.PI * 2);
            ctx.fill();
            
            // Black border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, vowelY, 22, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw vowel letter
            ctx.fillStyle = '#c41e3a';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(this.vowel, this.x, vowelY);
            ctx.fillText(this.vowel, this.x, vowelY);
        }
        ctx.restore();
        
        if (this.health < this.maxHealth) {
            const barWidth = 50;
            const barHeight = 6;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size/2 - 15;
            
            ctx.fillStyle = 'rgba(50, 0, 0, 0.8)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#c41e3a';
            const healthWidth = (this.health / this.maxHealth) * barWidth;
            ctx.fillRect(barX, barY, healthWidth, barHeight);
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
    
    hit(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
}

export class Bullet {
    constructor(x, y, angle, difficulty, piercing = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 15;
        this.radius = 4;
        this.damage = DIFFICULTY[difficulty].playerDamage;
        this.lifetime = 100;
        this.trail = [];
        this.piercing = piercing;
    }
    
    update(canvas) {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 5) this.trail.shift();
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.lifetime--;
        
        return this.lifetime > 0 && 
               this.x > 0 && this.x < canvas.width &&
               this.y > 0 && this.y < canvas.height;
    }
    
    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.5;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.radius = Math.random() * 3 + 1;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class BloodSplatter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 15 + 10;
        this.alpha = 0.6;
        this.decay = 0.005;
    }
    
    update() {
        this.alpha -= this.decay;
        return this.alpha > 0;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.radius;
            const sx = this.x + Math.cos(angle) * dist;
            const sy = this.y + Math.sin(angle) * dist;
            const sr = Math.random() * 5 + 2;
            
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

export class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.alpha = 1;
        this.vy = -2;
    }
    
    update() {
        this.y += this.vy;
        this.alpha -= 0.02;
        return this.alpha > 0;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// Power-up types
const POWERUP_TYPES = {
    HEALTH: {
        name: 'Health',
        icon: '❤️',
        color: '#ff6b9d',
        glowColor: 'rgba(255, 107, 157, 0.6)',
        effect: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 30);
            return '+30 Health!';
        }
    },
    SPEED: {
        name: 'Speed Boost',
        icon: '⚡',
        color: '#ffd700',
        glowColor: 'rgba(255, 215, 0, 0.6)',
        duration: 10000,
        effect: (player) => {
            return 'Speed Boost!';
        }
    },
    SHIELD: {
        name: 'Shield',
        icon: '🛡️',
        color: '#4a90e2',
        glowColor: 'rgba(74, 144, 226, 0.6)',
        duration: 8000,
        effect: (player) => {
            return 'Shield Active!';
        }
    },
    RAPID_FIRE: {
        name: 'Rapid Fire',
        icon: '🔥',
        color: '#ff6348',
        glowColor: 'rgba(255, 99, 72, 0.6)',
        duration: 7000,
        effect: (player) => {
            return 'Rapid Fire!';
        }
    },
    STAR: {
        name: 'Star Power',
        icon: '⭐',
        color: '#ffeaa7',
        glowColor: 'rgba(255, 234, 167, 0.6)',
        effect: (player) => {
            return '+50 Points!';
        }
    }
};

export class PowerUp {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.type = type || this.getRandomType();
        this.lifetime = 300; // frames (5 seconds at 60fps)
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.bobOffset = 0;
        this.collected = false;
    }
    
    getRandomType() {
        const types = Object.keys(POWERUP_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }
    
    update() {
        this.lifetime--;
        this.pulsePhase += 0.1;
        this.bobOffset = Math.sin(this.pulsePhase) * 5;
        
        // Blink when about to expire
        if (this.lifetime < 60 && Math.floor(this.lifetime / 10) % 2 === 0) {
            return this.lifetime > 0;
        }
        
        return this.lifetime > 0 && !this.collected;
    }
    
    draw(ctx) {
        const config = POWERUP_TYPES[this.type];
        const currentRadius = this.radius + Math.sin(this.pulsePhase) * 3;
        const drawY = this.y + this.bobOffset;
        
        // Glow effect
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = config.glowColor;
        
        // Outer glow circle
        const glowGradient = ctx.createRadialGradient(this.x, drawY, 0, this.x, drawY, currentRadius + 10);
        glowGradient.addColorStop(0, config.glowColor);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, drawY, currentRadius + 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Main circle
        const gradient = ctx.createRadialGradient(
            this.x - currentRadius * 0.3,
            drawY - currentRadius * 0.3,
            0,
            this.x,
            drawY,
            currentRadius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, config.color);
        gradient.addColorStop(1, config.color + 'dd');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, drawY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, drawY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // Icon
        ctx.font = `${currentRadius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon, this.x, drawY);
    }
    
    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.radius + player.radius;
    }
    
    collect(player) {
        this.collected = true;
        const config = POWERUP_TYPES[this.type];
        return {
            message: config.effect(player),
            type: this.type,
            duration: config.duration || 0
        };
    }
}

export { POWERUP_TYPES };

