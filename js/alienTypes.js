// Different alien types with unique behaviors based on difficulty

export const ALIEN_TYPES = {
    // Easy - Basic Chaser (green, straightforward)
    BASIC: {
        name: 'Basic Chaser',
        color: '#2ed573',
        color2: '#26de81',
        antennaColor: '#ff6348',
        size: 60,
        health: 1.0,
        speed: 1.0,
        behavior: 'chase',
        scoreMultiplier: 1.0,
        shape: 'circle', // round alien
        description: 'Friendly alien that moves straight toward you'
    },
    
    // Easy/Normal - Zigzagger (blue, moves in zigzag)
    ZIGZAGGER: {
        name: 'Zigzagger',
        color: '#74b9ff',
        color2: '#0984e3',
        antennaColor: '#fdcb6e',
        size: 55,
        health: 0.8,
        speed: 1.2,
        behavior: 'zigzag',
        scoreMultiplier: 1.2,
        shape: 'triangle', // triangular alien
        description: 'Quick alien that moves in a zigzag pattern'
    },
    
    // Normal - Orbiter (purple, circles around player)
    ORBITER: {
        name: 'Orbiter',
        color: '#a29bfe',
        color2: '#6c5ce7',
        antennaColor: '#fd79a8',
        size: 50,
        health: 1.2,
        speed: 1.5,
        behavior: 'orbit',
        scoreMultiplier: 1.5,
        shape: 'square', // square alien
        description: 'Tricky alien that orbits around you'
    },
    
    // Normal/Hard - Dasher (orange, dashes forward periodically)
    DASHER: {
        name: 'Dasher',
        color: '#ff9ff3',
        color2: '#f368e0',
        antennaColor: '#feca57',
        size: 65,
        health: 1.5,
        speed: 0.8,
        behavior: 'dash',
        scoreMultiplier: 1.8,
        shape: 'diamond', // diamond/rhombus alien
        description: 'Bulky alien that charges at you suddenly'
    },
    
    // Hard - Teleporter (pink, teleports closer)
    TELEPORTER: {
        name: 'Teleporter',
        color: '#ff6b9d',
        color2: '#c44569',
        antennaColor: '#48dbfb',
        size: 55,
        health: 0.9,
        speed: 1.0,
        behavior: 'teleport',
        scoreMultiplier: 2.0,
        shape: 'hexagon', // hexagonal alien
        description: 'Mysterious alien that teleports closer to you'
    },
    
    // Hard - Tank (red, slow but very tanky)
    TANK: {
        name: 'Tank',
        color: '#ff4757',
        color2: '#c41e3a',
        antennaColor: '#ffa502',
        size: 80,
        health: 3.0,
        speed: 0.6,
        behavior: 'chase',
        scoreMultiplier: 2.5,
        shape: 'octagon', // octagonal tank alien
        description: 'Huge, tough alien that takes many hits'
    }
};

// Get random alien type based on difficulty and wave
export function getRandomAlienType(difficulty, wave) {
    const easyTypes = ['BASIC', 'BASIC', 'ZIGZAGGER'];
    const normalTypes = ['BASIC', 'ZIGZAGGER', 'ZIGZAGGER', 'ORBITER', 'DASHER'];
    const hardTypes = ['ZIGZAGGER', 'ORBITER', 'ORBITER', 'DASHER', 'DASHER', 'TELEPORTER', 'TANK'];
    
    let pool;
    
    if (difficulty === 'easy' || difficulty === 'tutorial') {
        pool = easyTypes;
        // Add zigzaggers more often after wave 5
        if (wave >= 5) {
            pool = [...pool, 'ZIGZAGGER', 'ZIGZAGGER'];
        }
    } else if (difficulty === 'normal') {
        pool = normalTypes;
        // Add more advanced types after wave 5
        if (wave >= 5) {
            pool = [...pool, 'ORBITER', 'DASHER'];
        }
        if (wave >= 10) {
            pool = [...pool, 'TELEPORTER'];
        }
    } else { // hard
        pool = hardTypes;
        // More variety in hard mode
        if (wave >= 5) {
            pool = [...pool, 'TELEPORTER', 'TELEPORTER', 'TANK'];
        }
        if (wave >= 10) {
            pool = [...pool, 'TANK', 'TANK'];
        }
    }
    
    const randomType = pool[Math.floor(Math.random() * pool.length)];
    return ALIEN_TYPES[randomType];
}
