// dailyChallenges.js - Daily challenges and special events system

export class DailyChallengeManager {
    constructor() {
        this.challenges = this.initializeChallenges();
        this.specialEvents = this.initializeSpecialEvents();
        this.loadProgress();
    }

    initializeChallenges() {
        // Pool of possible daily challenges
        return {
            'score_challenge': {
                id: 'score_challenge',
                name: 'Score Master',
                description: 'Reach {target} points in a single game',
                icon: '🎯',
                type: 'score',
                difficulties: [
                    { target: 3000, reward: 'Fast Hands: +15% fire rate for 24h' },
                    { target: 7500, reward: 'Power Shot: +20% damage for 24h' },
                    { target: 15000, reward: 'Speed Demon: +20% move speed for 24h' }
                ]
            },
            'wave_challenge': {
                id: 'wave_challenge',
                name: 'Wave Warrior',
                description: 'Reach wave {target}',
                icon: '🌊',
                type: 'wave',
                difficulties: [
                    { target: 8, reward: 'Shield Boost: +30 max health for 24h' },
                    { target: 15, reward: 'Endurance: +50 max health for 24h' },
                    { target: 25, reward: 'Titan: +75 max health for 24h' }
                ]
            },
            'combo_challenge': {
                id: 'combo_challenge',
                name: 'Combo King',
                description: 'Reach a {target}x combo',
                icon: '🔥',
                type: 'combo',
                difficulties: [
                    { target: 20, reward: 'Rapid Fire: +15% fire rate for 24h' },
                    { target: 40, reward: 'Quick Shot: +25% fire rate for 24h' },
                    { target: 75, reward: 'Blazing Speed: +40% fire rate for 24h' }
                ]
            },
            'kills_challenge': {
                id: 'kills_challenge',
                name: 'Alien Hunter',
                description: 'Defeat {target} aliens in one game',
                icon: '💀',
                type: 'kills',
                difficulties: [
                    { target: 50, reward: 'Sharp Shooter: +15% damage for 24h' },
                    { target: 100, reward: 'Marksman: +25% damage for 24h' },
                    { target: 200, reward: 'Destroyer: +40% damage for 24h' }
                ]
            },
            'boss_challenge': {
                id: 'boss_challenge',
                name: 'Boss Slayer',
                description: 'Defeat {target} bosses in one game',
                icon: '👑',
                type: 'boss',
                difficulties: [
                    { target: 2, reward: 'Boss Hunter: +30% boss damage for 24h' },
                    { target: 4, reward: 'Boss Destroyer: +50% boss damage for 24h' },
                    { target: 6, reward: 'Boss Annihilator: +75% boss damage for 24h' }
                ]
            },
            'learning_challenge': {
                id: 'learning_challenge',
                name: 'Vowel Scholar',
                description: 'Complete {target} vowel learning screens',
                icon: '📚',
                type: 'learning',
                difficulties: [
                    { target: 5, reward: 'Student: +10% score bonus for 24h' },
                    { target: 10, reward: 'Scholar: +20% score bonus for 24h' },
                    { target: 15, reward: 'Professor: +30% score bonus for 24h' }
                ]
            },
            'speed_challenge': {
                id: 'speed_challenge',
                name: 'Speed Runner',
                description: 'Complete {target} waves in under 5 minutes',
                icon: '⚡',
                type: 'speed',
                difficulties: [
                    { target: 5, reward: 'Quick Feet: +15% move speed for 24h' },
                    { target: 10, reward: 'Sprint: +25% move speed for 24h' },
                    { target: 15, reward: 'Lightning: +40% move speed for 24h' }
                ]
            },
            'survival_challenge': {
                id: 'survival_challenge',
                name: 'Survivor',
                description: 'Survive {target} waves without using dash',
                icon: '🛡️',
                type: 'survival',
                difficulties: [
                    { target: 5, reward: 'Tough: +25 max health for 24h' },
                    { target: 10, reward: 'Resilient: +40 max health for 24h' },
                    { target: 15, reward: 'Invincible: +60 max health for 24h' }
                ]
            },
            'perfect_challenge': {
                id: 'perfect_challenge',
                name: 'Perfectionist',
                description: 'Complete {target} waves without taking damage',
                icon: '✨',
                type: 'perfect',
                difficulties: [
                    { target: 3, reward: 'Focused: +20% damage for 24h' },
                    { target: 5, reward: 'Perfect: +30% damage for 24h' },
                    { target: 8, reward: 'Flawless: +50% damage for 24h' }
                ]
            }
        };
    }

    initializeSpecialEvents() {
        return {
            'double_xp_weekend': {
                id: 'double_xp_weekend',
                name: '🎉 Double Score Weekend',
                description: 'All scores are doubled! Perfect time to climb the leaderboard!',
                icon: '🎉',
                type: 'score_multiplier',
                multiplier: 2.0,
                dayOfWeek: [6, 0], // Saturday and Sunday
                duration: 48 * 60 * 60 * 1000 // 48 hours
            },
            'boss_rush': {
                id: 'boss_rush',
                name: '👑 Boss Rush Hour',
                description: 'Every 3rd wave is a boss! Triple boss rewards!',
                icon: '👑',
                type: 'boss_frequency',
                bossEveryNWaves: 3,
                bossRewardMultiplier: 3.0,
                hour: 20, // 8 PM
                duration: 2 * 60 * 60 * 1000 // 2 hours
            },
            'speed_frenzy': {
                id: 'speed_frenzy',
                name: '⚡ Speed Frenzy',
                description: 'Everything moves 50% faster! Can you keep up?',
                icon: '⚡',
                type: 'speed_modifier',
                speedMultiplier: 1.5,
                hour: 12, // Noon
                duration: 1 * 60 * 60 * 1000 // 1 hour
            },
            'learning_bonus': {
                id: 'learning_bonus',
                name: '📚 Learning Hour',
                description: 'Triple rewards for vowel pronunciation practice!',
                icon: '📚',
                type: 'learning_bonus',
                learningMultiplier: 3.0,
                hour: 18, // 6 PM
                duration: 1 * 60 * 60 * 1000 // 1 hour
            },
            'combo_madness': {
                id: 'combo_madness',
                name: '🔥 Combo Madness',
                description: 'Combo decay time doubled! Build massive combos!',
                icon: '🔥',
                type: 'combo_bonus',
                comboDecayMultiplier: 2.0,
                hour: 21, // 9 PM
                duration: 1 * 60 * 60 * 1000 // 1 hour
            }
        };
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('vowelSpaceDailyChallenges');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentDaily = data.currentDaily;
                this.dailyProgress = data.dailyProgress || {};
                this.lastDailyReset = data.lastDailyReset || 0;
                this.completedChallenges = data.completedChallenges || [];
                this.activeBuffs = data.activeBuffs || [];
            } else {
                this.resetDaily();
            }

            // Check if we need to reset daily challenge
            this.checkDailyReset();
            
            // Clean up expired buffs
            this.cleanupExpiredBuffs();
        } catch (e) {
            console.error('Error loading daily challenges:', e);
            this.resetDaily();
        }
    }

    saveProgress() {
        try {
            const data = {
                currentDaily: this.currentDaily,
                dailyProgress: this.dailyProgress,
                lastDailyReset: this.lastDailyReset,
                completedChallenges: this.completedChallenges,
                activeBuffs: this.activeBuffs
            };
            localStorage.setItem('vowelSpaceDailyChallenges', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving daily challenges:', e);
        }
    }

    checkDailyReset() {
        const now = Date.now();
        const lastReset = this.lastDailyReset || 0;
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Reset if it's been more than a day
        if (now - lastReset >= oneDayMs) {
            this.resetDaily();
        }
    }

    resetDaily() {
        // Select random challenge types for each difficulty
        const challengeKeys = Object.keys(this.challenges);
        const easyChallenge = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];
        const mediumChallenge = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];
        const hardChallenge = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];

        this.currentDaily = {
            easy: { ...this.challenges[easyChallenge], difficulty: 0 },
            medium: { ...this.challenges[mediumChallenge], difficulty: 1 },
            hard: { ...this.challenges[hardChallenge], difficulty: 2 }
        };

        this.dailyProgress = {
            easy: { completed: false, progress: 0 },
            medium: { completed: false, progress: 0 },
            hard: { completed: false, progress: 0 }
        };

        this.lastDailyReset = Date.now();
        this.saveProgress();
    }

    updateProgress(type, value) {
        if (!this.currentDaily) return;

        Object.keys(this.currentDaily).forEach(tier => {
            const challenge = this.currentDaily[tier];
            const progress = this.dailyProgress[tier];

            if (progress.completed) return;

            if (challenge.type === type) {
                const target = challenge.difficulties[challenge.difficulty].target;
                progress.progress = Math.max(progress.progress, value);

                if (progress.progress >= target) {
                    this.completeChallenge(tier);
                }
            }
        });

        this.saveProgress();
    }

    completeChallenge(tier) {
        const challenge = this.currentDaily[tier];
        const progress = this.dailyProgress[tier];

        if (progress.completed) return;

        progress.completed = true;
        progress.justCompleted = true; // Flag for notification
        this.completedChallenges.push({
            challengeId: challenge.id,
            tier: tier,
            completedAt: Date.now()
        });

        // Add buff
        const reward = challenge.difficulties[challenge.difficulty].reward;
        this.addBuff(challenge.id, tier, reward);

        this.saveProgress();
        return { challenge, tier, reward };
    }

    addBuff(challengeId, tier, rewardText) {
        const buff = {
            id: `${challengeId}_${tier}_${Date.now()}`,
            challengeId,
            tier,
            rewardText,
            activatedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        this.activeBuffs.push(buff);
        this.saveProgress();
    }

    cleanupExpiredBuffs() {
        const now = Date.now();
        this.activeBuffs = this.activeBuffs.filter(buff => buff.expiresAt > now);
        this.saveProgress();
    }

    getActiveBuffs() {
        this.cleanupExpiredBuffs();
        
        const buffs = {
            damageMultiplier: 1,
            bossDamageMultiplier: 1,
            healthBonus: 0,
            speedMultiplier: 1,
            fireRateMultiplier: 1,
            scoreMultiplier: 1
        };

        this.activeBuffs.forEach(buff => {
            const reward = buff.rewardText.toLowerCase();
            
            // Parse reward text to apply buffs
            if (reward.includes('damage') && reward.includes('boss')) {
                const match = reward.match(/(\d+)%/);
                if (match) buffs.bossDamageMultiplier *= (1 + parseInt(match[1]) / 100);
            } else if (reward.includes('damage')) {
                const match = reward.match(/(\d+)%/);
                if (match) buffs.damageMultiplier *= (1 + parseInt(match[1]) / 100);
            }
            
            if (reward.includes('health')) {
                const match = reward.match(/(\d+)/);
                if (match) buffs.healthBonus += parseInt(match[1]);
            }
            
            if (reward.includes('speed') && reward.includes('move')) {
                const match = reward.match(/(\d+)%/);
                if (match) buffs.speedMultiplier *= (1 + parseInt(match[1]) / 100);
            }
            
            if (reward.includes('fire rate')) {
                const match = reward.match(/(\d+)%/);
                if (match) buffs.fireRateMultiplier *= (1 - parseInt(match[1]) / 100);
            }
            
            if (reward.includes('score')) {
                const match = reward.match(/(\d+)%/);
                if (match) buffs.scoreMultiplier *= (1 + parseInt(match[1]) / 100);
            }
        });

        return buffs;
    }

    // Check active special events
    getActiveEvents() {
        const now = new Date();
        const activeEvents = [];

        Object.values(this.specialEvents).forEach(event => {
            if (this.isEventActive(event, now)) {
                activeEvents.push(event);
            }
        });

        return activeEvents;
    }

    isEventActive(event, now = new Date()) {
        // Weekend events (Saturday, Sunday)
        if (event.dayOfWeek) {
            const currentDay = now.getDay();
            return event.dayOfWeek.includes(currentDay);
        }

        // Hourly events
        if (event.hour !== undefined) {
            const currentHour = now.getHours();
            const eventStartTime = new Date(now);
            eventStartTime.setHours(event.hour, 0, 0, 0);
            const eventEndTime = eventStartTime.getTime() + event.duration;
            
            return now.getTime() >= eventStartTime.getTime() && now.getTime() <= eventEndTime;
        }

        return false;
    }

    getEventModifiers() {
        const activeEvents = this.getActiveEvents();
        const modifiers = {
            scoreMultiplier: 1,
            bossEveryNWaves: 5, // Default boss frequency
            bossRewardMultiplier: 1,
            speedMultiplier: 1,
            learningMultiplier: 1,
            comboDecayMultiplier: 1
        };

        activeEvents.forEach(event => {
            switch (event.type) {
                case 'score_multiplier':
                    modifiers.scoreMultiplier *= event.multiplier;
                    break;
                case 'boss_frequency':
                    modifiers.bossEveryNWaves = event.bossEveryNWaves;
                    modifiers.bossRewardMultiplier *= event.bossRewardMultiplier;
                    break;
                case 'speed_modifier':
                    modifiers.speedMultiplier *= event.speedMultiplier;
                    break;
                case 'learning_bonus':
                    modifiers.learningMultiplier *= event.learningMultiplier;
                    break;
                case 'combo_bonus':
                    modifiers.comboDecayMultiplier *= event.comboDecayMultiplier;
                    break;
            }
        });

        return modifiers;
    }

    getCurrentChallenges() {
        return {
            challenges: this.currentDaily,
            progress: this.dailyProgress,
            timeUntilReset: this.getTimeUntilReset()
        };
    }

    getTimeUntilReset() {
        const now = Date.now();
        const nextReset = this.lastDailyReset + (24 * 60 * 60 * 1000);
        return Math.max(0, nextReset - now);
    }

    formatTimeRemaining(ms) {
        const hours = Math.floor(ms / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}h ${minutes}m`;
    }

    // Track game session for challenge progress
    trackGameSession(stats) {
        // Update all relevant challenge types
        this.updateProgress('score', stats.score);
        this.updateProgress('wave', stats.wave);
        this.updateProgress('combo', stats.maxCombo);
        this.updateProgress('kills', stats.kills);
        this.updateProgress('boss', stats.bossKills || 0);
        this.updateProgress('learning', stats.learningScreens || 0);
        
        // Speed and survival challenges need special tracking during gameplay
        if (stats.speedWaves) this.updateProgress('speed', stats.speedWaves);
        if (stats.survivalWaves) this.updateProgress('survival', stats.survivalWaves);
        if (stats.perfectWaves) this.updateProgress('perfect', stats.perfectWaves);
    }
}
