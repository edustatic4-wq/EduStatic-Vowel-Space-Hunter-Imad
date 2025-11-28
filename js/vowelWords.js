// Vowel word examples for educational reinforcement

export const VOWEL_WORDS = {
    'a': [
        { word: 'Apple', image: '🍎' },
        { word: 'Ant', image: '🐜' },
        { word: 'Astronaut', image: '👨‍🚀' },
        { word: 'Alligator', image: '🐊' },
        { word: 'Airplane', image: '✈️' },
        { word: 'Anchor', image: '⚓' }
    ],
    'e': [
        { word: 'Elephant', image: '🐘' },
        { word: 'Egg', image: '🥚' },
        { word: 'Engine', image: '🚂' },
        { word: 'Eskimo', image: '🧊' },
        { word: 'Eagle', image: '🦅' },
        { word: 'Envelope', image: '✉️' }
    ],
    'i': [
        { word: 'Igloo', image: '🏔️' },
        { word: 'Insect', image: '🐛' },
        { word: 'Ice cream', image: '🍦' },
        { word: 'Island', image: '🏝️' },
        { word: 'Iguana', image: '🦎' },
        { word: 'Ink', image: '🖊️' }
    ],
    'o': [
        { word: 'Octopus', image: '🐙' },
        { word: 'Orange', image: '🍊' },
        { word: 'Owl', image: '🦉' },
        { word: 'Ocean', image: '🌊' },
        { word: 'Olive', image: '🫒' },
        { word: 'Otter', image: '🦦' }
    ],
    'u': [
        { word: 'Umbrella', image: '☂️' },
        { word: 'Unicorn', image: '🦄' },
        { word: 'UFO', image: '🛸' },
        { word: 'Ukulele', image: '🎸' },
        { word: 'Urchin', image: '🦔' },
        { word: 'Universe', image: '🌌' }
    ]
};

// Track which vowels were encountered in the current wave
export class VowelTracker {
    constructor() {
        this.vowelsThisWave = new Set();
    }
    
    // Record that a vowel was encountered
    addVowel(vowel) {
        this.vowelsThisWave.add(vowel.toLowerCase());
    }
    
    // Get all vowels from this wave
    getVowels() {
        return Array.from(this.vowelsThisWave);
    }
    
    // Get random words for the vowels encountered
    getWordExamples(count = 3) {
        const vowels = this.getVowels();
        const examples = {};
        
        vowels.forEach(vowel => {
            if (VOWEL_WORDS[vowel]) {
                // Shuffle and take 'count' words
                const words = [...VOWEL_WORDS[vowel]];
                const shuffled = words.sort(() => Math.random() - 0.5);
                examples[vowel] = shuffled.slice(0, count);
            }
        });
        
        return examples;
    }
    
    // Check if any vowels were encountered
    hasVowels() {
        return this.vowelsThisWave.size > 0;
    }
    
    // Reset for next wave
    reset() {
        this.vowelsThisWave.clear();
    }
}

// Singleton instance
export const vowelTracker = new VowelTracker();
