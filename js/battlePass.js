// battlePass.js - Seasons and Battle Pass progression system

export class BattlePassManager {
    constructor() {
        this.seasons = this.initializeSeasons();
        this.rewards = this.initializeRewards();
        this.loadProgress();
    }

    initializeSeasons() {
        // Define seasons with themes and durations
        return [
            {
                id: 1,
                name: 'Cosmic Awakening',
                theme: 'space_explorer',
                icon: '🌌',
                color: '#6366f1',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-03-31'),
                description: 'Begin your journey through the cosmos',
                xpMultiplier: 1.0
            },
            {
                id: 2,
                name: 'Stellar Warriors',
                theme: 'warrior',
                icon: '⚔️',
                color: '#dc2626',
                startDate: new Date('2024-04-01'),
                endDate: new Date('2024-06-30'),
                description: 'Battle through the stars',
                xpMultiplier: 1.0
            },
            {
                id: 3,
                name: 'Galaxy Scholars',
                theme: 'scholar',
                icon: '📚',
                color: '#16a34a',
                startDate: new Date('2024-07-01'),
                endDate: new Date('2024-09-30'),
                description: 'Master the vowels of the universe',
                xpMultiplier: 1.0
            },
            {
                id: 4,
                name: 'Nebula Champions',
                theme: 'champion',
                icon: '👑',
                color: '#9333ea',
                startDate: new Date('2024-10-01'),
                endDate: new Date('2024-12-31'),
                description: 'Become a legend among the stars',
                xpMultiplier: 1.0
            }
        ];
    }

    initializeRewards() {
        // Define rewards for each tier (100 tiers total)
        const rewards = [];
        
        for (let tier = 1; tier <= 100; tier++) {
            const isFree = tier % 5 === 0 || tier === 1; // Free rewards every 5 tiers
            const isPremium = true; // Premium track has rewards every tier
            
            const reward = {
                tier: tier,
                free: null,
                premium: null
            };

            // Free track rewards
            if (isFree) {
                if (tier % 25 === 0) {
                    // Major milestone - cosmetic or title
                    reward.free = {
                        type: 'title',
                        value: this.getTitleForTier(tier),
                        icon: '🏆',
                        description: `Exclusive title: ${this.getTitleForTier(tier)}`
                    };
                } else if (tier % 10 === 0) {
                    // XP boost
                    reward.free = {
                        type: 'xp_boost',
                        value: 1.1,
                        duration: 3 * 24 * 60 * 60 * 1000, // 3 days
                        icon: '⚡',
                        description: '+10% XP boost for 3 days'
                    };
                } else {
                    // Small rewards
                    reward.free = {
                        type: 'score_boost',
                        value: 1.05,
                        duration: 24 * 60 * 60 * 1000, // 1 day
                        icon: '⭐',
                        description: '+5% score boost for 1 day'
                    };
                }
            }

            // Premium track rewards
            if (isPremium) {
                if (tier === 100) {
                    // Ultimate reward
                    reward.premium = {
                        type: 'ultimate',
                        value: { damage: 1.5, health: 100, speed: 1.3, fireRate: 0.7, score: 1.5 },
                        icon: '💎',
                        description: 'ULTIMATE COSMIC POWER: +50% damage, +100 health, +30% speed, +30% fire rate, +50% score'
                    };
                } else if (tier % 20 === 0) {
                    // Major premium rewards
                    reward.premium = {
                        type: 'permanent_boost',
                        value: { damage: 1.1, health: 20, speed: 1.05 },
                        icon: '🌟',
                        description: 'Permanent boost: +10% damage, +20 health, +5% speed'
                    };
                } else if (tier % 10 === 0) {
                    // Medium rewards
                    reward.premium = {
                        type: 'cosmetic',
                        value: this.getCosmeticForTier(tier),
                        icon: '✨',
                        description: `Exclusive cosmetic: ${this.getCosmeticForTier(tier)}`
                    };
                } else if (tier % 5 === 0) {
                    // Small premium rewards
                    reward.premium = {
                        type: 'temp_boost',
                        value: { damage: 1.15, health: 30 },
                        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
                        icon: '💪',
                        description: '7-day boost: +15% damage, +30 health'
                    };
                } else {
                    // Minor rewards
                    const rewards = [
                        { type: 'xp_boost', value: 1.05, duration: 24 * 60 * 60 * 1000, icon: '⚡', description: '+5% XP for 1 day' },
                        { type: 'score_boost', value: 1.1, duration: 24 * 60 * 60 * 1000, icon: '⭐', description: '+10% score for 1 day' },
                        { type: 'health_boost', value: 15, duration: 24 * 60 * 60 * 1000, icon: '❤️', description: '+15 health for 1 day' }
                    ];
                    reward.premium = rewards[tier % 3];
                }
            }

            rewards.push(reward);
        }

        return rewards;
    }

    getTitleForTier(tier) {
        const titles = {
            25: 'Stargazer',
            50: 'Cosmic Voyager',
            75: 'Galaxy Guardian',
            100: 'Universe Master'
        };
        return titles[tier] || 'Space Cadet';
    }

    getCosmeticForTier(tier) {
        const cosmetics = [
            'Stardust Trail',
            'Nebula Aura',
            'Comet Effect',
            'Galaxy Burst',
            'Supernova Glow',
            'Meteor Shower',
            'Aurora Effect',
            'Constellation Frame',
            'Cosmic Rings',
            'Stellar Crown'
        ];
        return cosmetics[(tier / 10 - 1) % cosmetics.length];
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('vowelSpaceBattlePass');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentSeasonId = data.currentSeasonId;
                this.currentTier = data.currentTier || 1;
                this.currentXP = data.currentXP || 0;
                this.unlockedTiers = data.unlockedTiers || [];
                this.hasPremium = data.hasPremium || false;
                this.activeBattlePassBoosts = data.activeBattlePassBoosts || [];
                this.permanentBoosts = data.permanentBoosts || [];
                this.unlockedTitles = data.unlockedTitles || [];
                this.selectedTitle = data.selectedTitle || null;
                this.seasonHistory = data.seasonHistory || [];
            } else {
                this.initializeNewSeason();
            }

            // Check if we need to start a new season
            const currentSeason = this.getCurrentSeason();
            if (!currentSeason || this.currentSeasonId !== currentSeason.id) {
                this.startNewSeason(currentSeason);
            }

            // Clean up expired boosts
            this.cleanupExpiredBoosts();
        } catch (e) {
            console.error('Error loading battle pass:', e);
            this.initializeNewSeason();
        }
    }

    initializeNewSeason() {
        const currentSeason = this.getCurrentSeason();
        this.currentSeasonId = currentSeason ? currentSeason.id : 1;
        this.currentTier = 1;
        this.currentXP = 0;
        this.unlockedTiers = [];
        this.hasPremium = false;
        this.activeBattlePassBoosts = [];
        this.permanentBoosts = [];
        this.unlockedTitles = [];
        this.selectedTitle = null;
        this.seasonHistory = [];
    }

    saveProgress() {
        try {
            const data = {
                currentSeasonId: this.currentSeasonId,
                currentTier: this.currentTier,
                currentXP: this.currentXP,
                unlockedTiers: this.unlockedTiers,
                hasPremium: this.hasPremium,
                activeBattlePassBoosts: this.activeBattlePassBoosts,
                permanentBoosts: this.permanentBoosts,
                unlockedTitles: this.unlockedTitles,
                selectedTitle: this.selectedTitle,
                seasonHistory: this.seasonHistory
            };
            localStorage.setItem('vowelSpaceBattlePass', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving battle pass:', e);
        }
    }

    getCurrentSeason() {
        const now = new Date();
        return this.seasons.find(season => 
            now >= season.startDate && now <= season.endDate
        ) || this.seasons[0]; // Default to first season if none active
    }

    startNewSeason(season) {
        // Save previous season history
        if (this.currentSeasonId) {
            this.seasonHistory.push({
                seasonId: this.currentSeasonId,
                tier: this.currentTier,
                completedAt: Date.now()
            });
        }

        // Reset for new season (keep permanent boosts)
        this.currentSeasonId = season.id;
        this.currentTier = 1;
        this.currentXP = 0;
        this.unlockedTiers = [];
        this.activeBattlePassBoosts = [];
        // Keep: permanentBoosts, unlockedTitles, selectedTitle, hasPremium

        this.saveProgress();
    }

    getXPForTier(tier) {
        // XP required increases with tier
        const baseXP = 1000;
        return Math.floor(baseXP * (1 + (tier - 1) * 0.1));
    }

    addXP(amount) {
        const season = this.getCurrentSeason();
        const multiplier = season.xpMultiplier;
        
        // Apply XP boosts
        let totalMultiplier = multiplier;
        this.activeBattlePassBoosts.forEach(boost => {
            if (boost.type === 'xp_boost') {
                totalMultiplier *= boost.value;
            }
        });

        const xpGained = Math.floor(amount * totalMultiplier);
        this.currentXP += xpGained;

        // Check for tier ups
        const tierUps = [];
        while (this.currentTier < 100) {
            const xpNeeded = this.getXPForTier(this.currentTier);
            if (this.currentXP >= xpNeeded) {
                this.currentXP -= xpNeeded;
                this.currentTier++;
                this.unlockedTiers.push(this.currentTier);
                
                // Auto-claim free rewards
                const reward = this.rewards[this.currentTier - 1];
                if (reward.free) {
                    this.claimReward(this.currentTier, 'free');
                }
                
                tierUps.push(this.currentTier);
            } else {
                break;
            }
        }

        this.saveProgress();
        return { xpGained, tierUps };
    }

    calculateXPFromGame(stats) {
        // Calculate XP based on game performance
        let xp = 0;
        
        // Base XP
        xp += stats.score * 0.5; // 0.5 XP per point
        xp += stats.wave * 50; // 50 XP per wave
        xp += stats.kills * 10; // 10 XP per kill
        xp += stats.bossKills * 100; // 100 XP per boss
        xp += stats.maxCombo * 5; // 5 XP per combo level
        xp += stats.learningScreens * 30; // 30 XP per learning screen
        
        // Bonus XP for achievements
        if (stats.perfectWaves > 0) xp += stats.perfectWaves * 50;
        if (stats.speedWaves > 0) xp += stats.speedWaves * 40;
        
        return Math.floor(xp);
    }

    claimReward(tier, track) {
        const reward = this.rewards[tier - 1];
        if (!reward) return null;

        const rewardData = track === 'premium' ? reward.premium : reward.free;
        if (!rewardData) return null;

        // Can only claim premium if player has premium
        if (track === 'premium' && !this.hasPremium) return null;

        // Apply reward
        switch (rewardData.type) {
            case 'permanent_boost':
            case 'ultimate':
                this.permanentBoosts.push({
                    ...rewardData,
                    tier: tier,
                    unlockedAt: Date.now()
                });
                break;

            case 'temp_boost':
            case 'xp_boost':
            case 'score_boost':
            case 'health_boost':
                this.activeBattlePassBoosts.push({
                    ...rewardData,
                    tier: tier,
                    activatedAt: Date.now(),
                    expiresAt: Date.now() + rewardData.duration
                });
                break;

            case 'title':
                if (!this.unlockedTitles.includes(rewardData.value)) {
                    this.unlockedTitles.push(rewardData.value);
                }
                break;

            case 'cosmetic':
                // Cosmetics would be handled by a cosmetics system
                break;
        }

        this.saveProgress();
        return rewardData;
    }

    cleanupExpiredBoosts() {
        const now = Date.now();
        this.activeBattlePassBoosts = this.activeBattlePassBoosts.filter(
            boost => !boost.expiresAt || boost.expiresAt > now
        );
        this.saveProgress();
    }

    getActiveBoosts() {
        this.cleanupExpiredBoosts();
        
        const boosts = {
            damageMultiplier: 1,
            healthBonus: 0,
            speedMultiplier: 1,
            fireRateMultiplier: 1,
            scoreMultiplier: 1,
            xpMultiplier: 1
        };

        // Apply permanent boosts
        this.permanentBoosts.forEach(boost => {
            if (boost.value.damage) boosts.damageMultiplier *= boost.value.damage;
            if (boost.value.health) boosts.healthBonus += boost.value.health;
            if (boost.value.speed) boosts.speedMultiplier *= boost.value.speed;
            if (boost.value.fireRate) boosts.fireRateMultiplier *= boost.value.fireRate;
            if (boost.value.score) boosts.scoreMultiplier *= boost.value.score;
        });

        // Apply temporary boosts
        this.activeBattlePassBoosts.forEach(boost => {
            if (boost.type === 'temp_boost') {
                if (boost.value.damage) boosts.damageMultiplier *= boost.value.damage;
                if (boost.value.health) boosts.healthBonus += boost.value.health;
                if (boost.value.speed) boosts.speedMultiplier *= boost.value.speed;
            } else if (boost.type === 'xp_boost') {
                boosts.xpMultiplier *= boost.value;
            } else if (boost.type === 'score_boost') {
                boosts.scoreMultiplier *= boost.value;
            } else if (boost.type === 'health_boost') {
                boosts.healthBonus += boost.value;
            }
        });

        return boosts;
    }

    unlockPremium() {
        this.hasPremium = true;
        
        // Auto-claim all premium rewards for unlocked tiers
        const newRewards = [];
        for (let tier of this.unlockedTiers) {
            const reward = this.claimReward(tier, 'premium');
            if (reward) newRewards.push({ tier, reward });
        }
        
        this.saveProgress();
        return newRewards;
    }

    getProgress() {
        const season = this.getCurrentSeason();
        const xpNeeded = this.getXPForTier(this.currentTier);
        const nextTier = this.currentTier < 100 ? this.currentTier + 1 : 100;
        
        return {
            season: season,
            tier: this.currentTier,
            xp: this.currentXP,
            xpNeeded: xpNeeded,
            progress: (this.currentXP / xpNeeded) * 100,
            nextTier: nextTier,
            hasPremium: this.hasPremium,
            unlockedTiers: this.unlockedTiers,
            activeBoosts: this.activeBattlePassBoosts,
            permanentBoosts: this.permanentBoosts,
            selectedTitle: this.selectedTitle,
            unlockedTitles: this.unlockedTitles
        };
    }

    getRewardForTier(tier) {
        return this.rewards[tier - 1];
    }

    selectTitle(title) {
        if (this.unlockedTitles.includes(title)) {
            this.selectedTitle = title;
            this.saveProgress();
            return true;
        }
        return false;
    }

    getSeasonEndTime() {
        const season = this.getCurrentSeason();
        return season.endDate.getTime() - Date.now();
    }

    formatTimeRemaining(ms) {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return `${days}d ${hours}h`;
    }
}
