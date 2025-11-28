// Boss alien types that appear every 5 waves

export const BOSS_TYPES = {
    // First boss - Wave 5
    VOWEL_QUEEN: {
        name: 'Vowel Queen',
        title: '👑 THE VOWEL QUEEN 👑',
        color: '#ff6b9d',
        color2: '#c44569',
        antennaColor: '#ffd700',
        size: 120,
        health: 5.0,
        speed: 0.7,
        behavior: 'queen',
        scoreValue: 500,
        shape: 'star',
        description: 'Majestic ruler who summons vowel minions',
        phases: [
            { healthPercent: 100, speed: 0.7, summonRate: 300 },
            { healthPercent: 50, speed: 0.9, summonRate: 200 }
        ]
    },
    
    // Second boss - Wave 10
    ALPHABET_TITAN: {
        name: 'Alphabet Titan',
        title: '⚡ THE ALPHABET TITAN ⚡',
        color: '#a29bfe',
        color2: '#6c5ce7',
        antennaColor: '#fd79a8',
        size: 150,
        health: 8.0,
        speed: 0.5,
        behavior: 'titan',
        scoreValue: 1000,
        shape: 'star',
        description: 'Massive titan with devastating shockwave attacks',
        phases: [
            { healthPercent: 100, speed: 0.5, shockwaveRate: 240 },
            { healthPercent: 66, speed: 0.6, shockwaveRate: 180 },
            { healthPercent: 33, speed: 0.8, shockwaveRate: 120 }
        ]
    },
    
    // Third boss - Wave 15
    COSMIC_SCHOLAR: {
        name: 'Cosmic Scholar',
        title: '🌟 THE COSMIC SCHOLAR 🌟',
        color: '#ffd700',
        color2: '#ffa500',
        antennaColor: '#48dbfb',
        size: 130,
        health: 12.0,
        speed: 0.8,
        behavior: 'scholar',
        scoreValue: 1500,
        shape: 'star',
        description: 'Wise scholar who teleports and fires projectiles',
        phases: [
            { healthPercent: 100, speed: 0.8, teleportRate: 180, projectileRate: 120 },
            { healthPercent: 60, speed: 1.0, teleportRate: 120, projectileRate: 90 },
            { healthPercent: 30, speed: 1.2, teleportRate: 90, projectileRate: 60 }
        ]
    },
    
    // Fourth boss - Wave 20+
    OMEGA_VOWEL: {
        name: 'Omega Vowel',
        title: '💀 OMEGA VOWEL 💀',
        color: '#ff4757',
        color2: '#c41e3a',
        antennaColor: '#ff6348',
        size: 160,
        health: 15.0,
        speed: 0.9,
        behavior: 'omega',
        scoreValue: 2500,
        shape: 'star',
        description: 'Ultimate boss with all abilities combined',
        phases: [
            { healthPercent: 100, speed: 0.9, summonRate: 240, shockwaveRate: 180 },
            { healthPercent: 66, speed: 1.0, summonRate: 180, shockwaveRate: 120, teleportRate: 150 },
            { healthPercent: 33, speed: 1.2, summonRate: 120, shockwaveRate: 90, teleportRate: 90, projectileRate: 60 }
        ]
    }
};

// Get boss for wave number
export function getBossForWave(wave, difficulty) {
    if (wave % 5 !== 0) return null;
    
    const bossWave = wave;
    
    if (bossWave === 5) {
        return BOSS_TYPES.VOWEL_QUEEN;
    } else if (bossWave === 10) {
        return BOSS_TYPES.ALPHABET_TITAN;
    } else if (bossWave === 15) {
        return BOSS_TYPES.COSMIC_SCHOLAR;
    } else {
        // Wave 20+ always spawn Omega Vowel
        return BOSS_TYPES.OMEGA_VOWEL;
    }
}

// Boss shockwave attack
export class BossShockwave {
    constructor(x, y, maxRadius) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.speed = 5;
        this.damage = 15;
        this.hit = false;
    }
    
    update() {
        this.radius += this.speed;
        return this.radius < this.maxRadius;
    }
    
    draw(ctx, color) {
        ctx.save();
        const alpha = 1 - (this.radius / this.maxRadius);
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
    
    checkCollision(player) {
        if (this.hit) return false;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Check if player is near the edge of the shockwave
        const isHit = Math.abs(dist - this.radius) < 20 && this.radius > 50;
        if (isHit) {
            this.hit = true;
        }
        return isHit;
    }
}

// Boss projectile
export class BossProjectile {
    constructor(x, y, targetX, targetY, color) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = 4;
        this.damage = 10;
        this.color = color;
        
        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        
        this.lifetime = 200;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '88');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    checkCollision(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.radius + player.radius;
    }
}
