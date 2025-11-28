// achievements.js - Achievement tracking and badge system

export class AchievementManager {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.loadProgress();
        this.pendingNotifications = [];
    }

    initializeAchievements() {
        return {
            // Score Achievements
            'first_score': {
                id: 'first_score',
                name: 'First Points',
                description: 'Score your first 100 points',
                icon: '🎯',
                category: 'score',
                requirement: 100,
                reward: { type: 'none' },
                unlocked: false,
                unlockedAt: null
            },
            'score_master': {
                id: 'score_master',
                name: 'Score Master',
                description: 'Reach 5,000 points in a single game',
                icon: '⭐',
                category: 'score',
                requirement: 5000,
                reward: { type: 'damage', value: 1.1, description: '+10% damage' },
                unlocked: false,
                unlockedAt: null
            },
            'score_legend': {
                id: 'score_legend',
                name: 'Score Legend',
                description: 'Reach 10,000 points',
                icon: '💫',
                category: 'score',
                requirement: 10000,
                reward: { type: 'damage', value: 1.2, description: '+20% damage' },
                unlocked: false,
                unlockedAt: null
            },

            // Wave Achievements
            'wave_warrior': {
                id: 'wave_warrior',
                name: 'Wave Warrior',
                description: 'Complete wave 10',
                icon: '🌊',
                category: 'wave',
                requirement: 10,
                reward: { type: 'health', value: 10, description: '+10 max health' },
                unlocked: false,
                unlockedAt: null
            },
            'wave_master': {
                id: 'wave_master',
                name: 'Wave Master',
                description: 'Complete wave 20',
                icon: '🌀',
                category: 'wave',
                requirement: 20,
                reward: { type: 'health', value: 20, description: '+20 max health' },
                unlocked: false,
                unlockedAt: null
            },

            // Kill Achievements
            'alien_hunter': {
                id: 'alien_hunter',
                name: 'Alien Hunter',
                description: 'Defeat 100 aliens (cumulative)',
                icon: '🎖️',
                category: 'kills',
                requirement: 100,
                reward: { type: 'damage', value: 1.05, description: '+5% damage' },
                unlocked: false,
                unlockedAt: null
            },
            'alien_slayer': {
                id: 'alien_slayer',
                name: 'Alien Slayer',
                description: 'Defeat 500 aliens (cumulative)',
                icon: '🏅',
                category: 'kills',
                requirement: 500,
                reward: { type: 'speed', value: 1.1, description: '+10% move speed' },
                unlocked: false,
                unlockedAt: null
            },
            'alien_destroyer': {
                id: 'alien_destroyer',
                name: 'Alien Destroyer',
                description: 'Defeat 1,000 aliens (cumulative)',
                icon: '👑',
                category: 'kills',
                requirement: 1000,
                reward: { type: 'damage', value: 1.15, description: '+15% damage' },
                unlocked: false,
                unlockedAt: null
            },

            // Combo Achievements
            'combo_starter': {
                id: 'combo_starter',
                name: 'Combo Starter',
                description: 'Reach a 10x combo',
                icon: '🔥',
                category: 'combo',
                requirement: 10,
                reward: { type: 'none' },
                unlocked: false,
                unlockedAt: null
            },
            'combo_master': {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Reach a 25x combo',
                icon: '💥',
                category: 'combo',
                requirement: 25,
                reward: { type: 'fire_rate', value: 0.9, description: '+10% fire rate' },
                unlocked: false,
                unlockedAt: null
            },
            'combo_god': {
                id: 'combo_god',
                name: 'Combo God',
                description: 'Reach a 50x combo',
                icon: '⚡',
                category: 'combo',
                requirement: 50,
                reward: { type: 'fire_rate', value: 0.8, description: '+20% fire rate' },
                unlocked: false,
                unlockedAt: null
            },

            // Boss Achievements
            'boss_slayer': {
                id: 'boss_slayer',
                name: 'Boss Slayer',
                description: 'Defeat your first boss',
                icon: '👊',
                category: 'boss',
                requirement: 1,
                reward: { type: 'boss_damage', value: 1.1, description: '+10% boss damage' },
                unlocked: false,
                unlockedAt: null
            },
            'boss_hunter': {
                id: 'boss_hunter',
                name: 'Boss Hunter',
                description: 'Defeat 5 bosses (cumulative)',
                icon: '🗡️',
                category: 'boss',
                requirement: 5,
                reward: { type: 'health', value: 15, description: '+15 max health' },
                unlocked: false,
                unlockedAt: null
            },
            'boss_destroyer': {
                id: 'boss_destroyer',
                name: 'Boss Destroyer',
                description: 'Defeat 10 bosses (cumulative)',
                icon: '⚔️',
                category: 'boss',
                requirement: 10,
                reward: { type: 'boss_damage', value: 1.25, description: '+25% boss damage' },
                unlocked: false,
                unlockedAt: null
            },

            // Vowel Learning Achievements
            'vowel_learner': {
                id: 'vowel_learner',
                name: 'Vowel Learner',
                description: 'Complete 5 vowel learning screens',
                icon: '📚',
                category: 'learning',
                requirement: 5,
                reward: { type: 'score', value: 1.05, description: '+5% score bonus' },
                unlocked: false,
                unlockedAt: null
            },
            'vowel_scholar': {
                id: 'vowel_scholar',
                name: 'Vowel Scholar',
                description: 'Complete 20 vowel learning screens',
                icon: '🎓',
                category: 'learning',
                requirement: 20,
                reward: { type: 'score', value: 1.1, description: '+10% score bonus' },
                unlocked: false,
                unlockedAt: null
            },
            'pronunciation_expert': {
                id: 'pronunciation_expert',
                name: 'Pronunciation Expert',
                description: 'Click 50 words to hear pronunciation',
                icon: '🔊',
                category: 'learning',
                requirement: 50,
                reward: { type: 'score', value: 1.15, description: '+15% score bonus' },
                unlocked: false,
                unlockedAt: null
            },

            // Difficulty Achievements
            'survivor': {
                id: 'survivor',
                name: 'Survivor',
                description: 'Complete wave 5 on Normal or higher',
                icon: '🛡️',
                category: 'difficulty',
                requirement: { wave: 5, difficulty: 'normal' },
                reward: { type: 'none' },
                unlocked: false,
                unlockedAt: null
            },
            'champion': {
                id: 'champion',
                name: 'Champion',
                description: 'Complete wave 10 on Hard',
                icon: '🏆',
                category: 'difficulty',
                requirement: { wave: 10, difficulty: 'hard' },
                reward: { type: 'health', value: 25, description: '+25 max health' },
                unlocked: false,
                unlockedAt: null
            },
            'legendary': {
                id: 'legendary',
                name: 'Legendary',
                description: 'Complete wave 15 on Nightmare',
                icon: '💎',
                category: 'difficulty',
                requirement: { wave: 15, difficulty: 'nightmare' },
                reward: { type: 'all_stats', value: 1.2, description: '+20% all stats' },
                unlocked: false,
                unlockedAt: null
            },

            // Special Achievements
            'perfect_wave': {
                id: 'perfect_wave',
                name: 'Perfect Wave',
                description: 'Complete a wave without taking damage',
                icon: '✨',
                category: 'special',
                requirement: 'no_damage',
                reward: { type: 'health', value: 10, description: '+10 max health' },
                unlocked: false,
                unlockedAt: null
            },
            'sharpshooter': {
                id: 'sharpshooter',
                name: 'Sharpshooter',
                description: 'Achieve 90% accuracy in a wave',
                icon: '🎯',
                category: 'special',
                requirement: 'accuracy_90',
                reward: { type: 'damage', value: 1.15, description: '+15% damage' },
                unlocked: false,
                unlockedAt: null
            },
            'speed_demon': {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a wave in under 30 seconds',
                icon: '⚡',
                category: 'special',
                requirement: 'fast_wave',
                reward: { type: 'speed', value: 1.15, description: '+15% move speed' },
                unlocked: false,
                unlockedAt: null
            }
        };
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('vowelSpaceAchievements');
            if (saved) {
                const progress = JSON.parse(saved);
                // Merge saved progress with achievement definitions
                Object.keys(this.achievements).forEach(id => {
                    if (progress[id]) {
                        this.achievements[id].unlocked = progress[id].unlocked;
                        this.achievements[id].unlockedAt = progress[id].unlockedAt;
                    }
                });
            }

            // Load cumulative stats
            const stats = localStorage.getItem('vowelSpaceAchievementStats');
            this.stats = stats ? JSON.parse(stats) : {
                totalKills: 0,
                totalBossKills: 0,
                learningScreensCompleted: 0,
                wordsClicked: 0,
                gamesPlayed: 0
            };
        } catch (e) {
            console.error('Error loading achievements:', e);
            this.stats = {
                totalKills: 0,
                totalBossKills: 0,
                learningScreensCompleted: 0,
                wordsClicked: 0,
                gamesPlayed: 0
            };
        }
    }

    saveProgress() {
        try {
            const progress = {};
            Object.keys(this.achievements).forEach(id => {
                progress[id] = {
                    unlocked: this.achievements[id].unlocked,
                    unlockedAt: this.achievements[id].unlockedAt
                };
            });
            localStorage.setItem('vowelSpaceAchievements', JSON.stringify(progress));
            localStorage.setItem('vowelSpaceAchievementStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Error saving achievements:', e);
        }
    }

    checkAchievement(achievementId, value) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return false;

        let unlocked = false;

        // Check based on category
        switch (achievement.category) {
            case 'score':
            case 'wave':
            case 'combo':
                unlocked = value >= achievement.requirement;
                break;

            case 'kills':
                this.stats.totalKills = Math.max(this.stats.totalKills, value);
                unlocked = this.stats.totalKills >= achievement.requirement;
                break;

            case 'boss':
                unlocked = this.stats.totalBossKills >= achievement.requirement;
                break;

            case 'learning':
                if (achievementId === 'pronunciation_expert') {
                    unlocked = this.stats.wordsClicked >= achievement.requirement;
                } else {
                    unlocked = this.stats.learningScreensCompleted >= achievement.requirement;
                }
                break;

            case 'difficulty':
                const req = achievement.requirement;
                unlocked = value.wave >= req.wave && this.difficultyMeetsRequirement(value.difficulty, req.difficulty);
                break;

            case 'special':
                unlocked = value === true;
                break;
        }

        if (unlocked) {
            this.unlockAchievement(achievementId);
            return true;
        }

        return false;
    }

    difficultyMeetsRequirement(current, required) {
        const order = ['easy', 'normal', 'hard', 'nightmare'];
        return order.indexOf(current) >= order.indexOf(required);
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        this.pendingNotifications.push(achievement);
        this.saveProgress();
    }

    // Cumulative stat tracking
    addKills(count) {
        this.stats.totalKills += count;
        this.checkAchievement('alien_hunter', this.stats.totalKills);
        this.checkAchievement('alien_slayer', this.stats.totalKills);
        this.checkAchievement('alien_destroyer', this.stats.totalKills);
        this.saveProgress();
    }

    addBossKill() {
        this.stats.totalBossKills++;
        this.checkAchievement('boss_slayer', this.stats.totalBossKills);
        this.checkAchievement('boss_hunter', this.stats.totalBossKills);
        this.checkAchievement('boss_destroyer', this.stats.totalBossKills);
        this.saveProgress();
    }

    addLearningScreenCompleted() {
        this.stats.learningScreensCompleted++;
        this.checkAchievement('vowel_learner', this.stats.learningScreensCompleted);
        this.checkAchievement('vowel_scholar', this.stats.learningScreensCompleted);
        this.saveProgress();
    }

    addWordClicked() {
        this.stats.wordsClicked++;
        this.checkAchievement('pronunciation_expert', this.stats.wordsClicked);
        this.saveProgress();
    }

    // Get active rewards (for applying to player stats)
    getActiveRewards() {
        const rewards = {
            damageMultiplier: 1,
            healthBonus: 0,
            speedMultiplier: 1,
            fireRateMultiplier: 1,
            scoreMultiplier: 1,
            bossDamageMultiplier: 1
        };

        Object.values(this.achievements).forEach(achievement => {
            if (!achievement.unlocked || !achievement.reward) return;

            const reward = achievement.reward;
            switch (reward.type) {
                case 'damage':
                    rewards.damageMultiplier *= reward.value;
                    break;
                case 'boss_damage':
                    rewards.bossDamageMultiplier *= reward.value;
                    break;
                case 'health':
                    rewards.healthBonus += reward.value;
                    break;
                case 'speed':
                    rewards.speedMultiplier *= reward.value;
                    break;
                case 'fire_rate':
                    rewards.fireRateMultiplier *= reward.value;
                    break;
                case 'score':
                    rewards.scoreMultiplier *= reward.value;
                    break;
                case 'all_stats':
                    rewards.damageMultiplier *= reward.value;
                    rewards.speedMultiplier *= reward.value;
                    rewards.fireRateMultiplier *= reward.value;
                    break;
            }
        });

        return rewards;
    }

    // Get pending notifications and clear them
    getPendingNotifications() {
        const notifications = [...this.pendingNotifications];
        this.pendingNotifications = [];
        return notifications;
    }

    // Get achievements by category
    getAchievementsByCategory() {
        const categories = {
            score: [],
            wave: [],
            kills: [],
            combo: [],
            boss: [],
            learning: [],
            difficulty: [],
            special: []
        };

        Object.values(this.achievements).forEach(achievement => {
            categories[achievement.category].push(achievement);
        });

        return categories;
    }

    // Get unlock percentage
    getUnlockPercentage() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        return Math.round((unlocked / total) * 100);
    }

    // Reset all achievements (with confirmation)
    resetAll() {
        Object.values(this.achievements).forEach(achievement => {
            achievement.unlocked = false;
            achievement.unlockedAt = null;
        });
        this.stats = {
            totalKills: 0,
            totalBossKills: 0,
            learningScreensCompleted: 0,
            wordsClicked: 0,
            gamesPlayed: 0
        };
        this.saveProgress();
    }
}
