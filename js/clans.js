// Clan/Guild System for Vowel Space Hunter
// Provides social, cooperative, and competitive clan features

export class ClanManager {
    constructor() {
        this.currentClan = null;
        this.clanInvites = [];
        this.clanRequests = [];
        this.loadClanData();
        this.setupUI();
        
        // Clan event types
        this.clanEvents = {
            CLAN_WARS: 'clan_wars',
            CLAN_RAID: 'clan_raid',
            CLAN_TOURNAMENT: 'clan_tournament',
            CLAN_LEARNING: 'clan_learning'
        };
        
        // Clan perks that unlock as clan levels up
        this.clanPerks = {
            1: { name: 'United We Learn', bonus: 'xp_boost', value: 5 },
            5: { name: 'Stronger Together', bonus: 'health_boost', value: 10 },
            10: { name: 'Team Efficiency', bonus: 'score_boost', value: 10 },
            15: { name: 'Collective Knowledge', bonus: 'learning_rewards', value: 20 },
            20: { name: 'Clan Elite', bonus: 'damage_boost', value: 15 },
            25: { name: 'Guild Masters', bonus: 'all_stats', value: 10 }
        };
    }
    
    loadClanData() {
        const savedClan = localStorage.getItem('playerClan');
        if (savedClan) {
            this.currentClan = JSON.parse(savedClan);
        }
        
        const savedInvites = localStorage.getItem('clanInvites');
        if (savedInvites) {
            this.clanInvites = JSON.parse(savedInvites);
        }
        
        // Load global clans list (simulated for single-player, would be server-side in multiplayer)
        const savedClans = localStorage.getItem('allClans');
        if (savedClans) {
            this.allClans = JSON.parse(savedClans);
        } else {
            // Create some starter clans for demo
            this.allClans = this.createStarterClans();
            this.saveAllClans();
        }
    }
    
    saveClanData() {
        if (this.currentClan) {
            localStorage.setItem('playerClan', JSON.stringify(this.currentClan));
        } else {
            localStorage.removeItem('playerClan');
        }
        localStorage.setItem('clanInvites', JSON.stringify(this.clanInvites));
    }
    
    saveAllClans() {
        localStorage.setItem('allClans', JSON.stringify(this.allClans));
    }
    
    createStarterClans() {
        return [
            {
                id: 'starter_1',
                name: 'Vowel Voyagers',
                tag: 'VVOY',
                description: 'We journey through space learning vowels together!',
                emblem: '🚀',
                level: 12,
                xp: 45000,
                members: this.generateDemoMembers(15, 'voyager'),
                maxMembers: 50,
                requirements: { minLevel: 5, minScore: 1000 },
                stats: {
                    totalScore: 1250000,
                    totalKills: 8500,
                    totalWaves: 450,
                    eventsWon: 8
                },
                perks: ['xp_boost', 'health_boost', 'score_boost'],
                publicJoin: true,
                createdDate: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
            },
            {
                id: 'starter_2',
                name: 'Cosmic Scholars',
                tag: 'CSCH',
                description: 'Learning is our superpower! Join us!',
                emblem: '📚',
                level: 18,
                xp: 82000,
                members: this.generateDemoMembers(28, 'scholar'),
                maxMembers: 50,
                requirements: { minLevel: 10, minScore: 5000 },
                stats: {
                    totalScore: 2400000,
                    totalKills: 15000,
                    totalWaves: 820,
                    eventsWon: 15
                },
                perks: ['xp_boost', 'health_boost', 'score_boost', 'learning_rewards'],
                publicJoin: false,
                createdDate: Date.now() - (60 * 24 * 60 * 60 * 1000) // 60 days ago
            },
            {
                id: 'starter_3',
                name: 'Alphabet Alliance',
                tag: 'ALPH',
                description: 'A-E-I-O-U... and sometimes Y!',
                emblem: '🎯',
                level: 8,
                xp: 28000,
                members: this.generateDemoMembers(8, 'ally'),
                maxMembers: 30,
                requirements: { minLevel: 1, minScore: 0 },
                stats: {
                    totalScore: 580000,
                    totalKills: 3200,
                    totalWaves: 180,
                    eventsWon: 3
                },
                perks: ['xp_boost', 'health_boost'],
                publicJoin: true,
                createdDate: Date.now() - (14 * 24 * 60 * 60 * 1000) // 14 days ago
            },
            {
                id: 'starter_4',
                name: 'Star Learners',
                tag: 'STAR',
                description: 'Reach for the stars while learning!',
                emblem: '⭐',
                level: 22,
                xp: 125000,
                members: this.generateDemoMembers(42, 'star'),
                maxMembers: 50,
                requirements: { minLevel: 15, minScore: 10000 },
                stats: {
                    totalScore: 3850000,
                    totalKills: 22000,
                    totalWaves: 1200,
                    eventsWon: 24
                },
                perks: ['xp_boost', 'health_boost', 'score_boost', 'learning_rewards', 'damage_boost'],
                publicJoin: false,
                createdDate: Date.now() - (90 * 24 * 60 * 60 * 1000) // 90 days ago
            },
            {
                id: 'starter_5',
                name: 'Galaxy Guardians',
                tag: 'GUAR',
                description: 'Elite clan for the best learners!',
                emblem: '🛡️',
                level: 25,
                xp: 180000,
                members: this.generateDemoMembers(50, 'guardian'),
                maxMembers: 50,
                requirements: { minLevel: 20, minScore: 25000 },
                stats: {
                    totalScore: 5200000,
                    totalKills: 32000,
                    totalWaves: 1800,
                    eventsWon: 35
                },
                perks: ['xp_boost', 'health_boost', 'score_boost', 'learning_rewards', 'damage_boost', 'all_stats'],
                publicJoin: false,
                createdDate: Date.now() - (120 * 24 * 60 * 60 * 1000) // 120 days ago
            }
        ];
    }
    
    generateDemoMembers(count, prefix) {
        const ranks = ['Leader', 'Officer', 'Veteran', 'Member', 'Recruit'];
        const members = [];
        
        for (let i = 0; i < count; i++) {
            const rank = i === 0 ? 'Leader' : 
                         i < 3 ? 'Officer' : 
                         i < 8 ? 'Veteran' : 
                         i < count - 5 ? 'Member' : 'Recruit';
            
            members.push({
                id: `${prefix}_${i}`,
                name: `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}${i + 1}`,
                rank: rank,
                level: Math.floor(Math.random() * 50) + 10,
                contribution: Math.floor(Math.random() * 50000) + 1000,
                lastActive: Date.now() - (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
                joinDate: Date.now() - (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
            });
        }
        
        // Sort by contribution (leader should have highest)
        members.sort((a, b) => b.contribution - a.contribution);
        members[0].rank = 'Leader';
        
        return members;
    }
    
    setupUI() {
        // Will be called to setup clan UI buttons and modals
    }
    
    // Create a new clan
    createClan(name, tag, description, emblem, requirements = {}) {
        if (this.currentClan) {
            return { success: false, error: 'You are already in a clan!' };
        }
        
        // Validate inputs
        if (!name || name.length < 3 || name.length > 30) {
            return { success: false, error: 'Clan name must be 3-30 characters' };
        }
        
        if (!tag || tag.length < 2 || tag.length > 5) {
            return { success: false, error: 'Clan tag must be 2-5 characters' };
        }
        
        // Check if clan name/tag already exists
        if (this.allClans.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, error: 'Clan name already taken' };
        }
        
        if (this.allClans.some(c => c.tag.toLowerCase() === tag.toLowerCase())) {
            return { success: false, error: 'Clan tag already taken' };
        }
        
        const newClan = {
            id: `clan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            tag: tag.toUpperCase(),
            description: description || 'A new clan ready to conquer the cosmos!',
            emblem: emblem || '🚀',
            level: 1,
            xp: 0,
            members: [{
                id: 'player',
                name: 'You',
                rank: 'Leader',
                level: 1,
                contribution: 0,
                lastActive: Date.now(),
                joinDate: Date.now()
            }],
            maxMembers: 30,
            requirements: {
                minLevel: requirements.minLevel || 0,
                minScore: requirements.minScore || 0
            },
            stats: {
                totalScore: 0,
                totalKills: 0,
                totalWaves: 0,
                eventsWon: 0
            },
            perks: ['xp_boost'],
            publicJoin: requirements.publicJoin !== undefined ? requirements.publicJoin : true,
            createdDate: Date.now()
        };
        
        this.currentClan = newClan;
        this.allClans.push(newClan);
        this.saveClanData();
        this.saveAllClans();
        
        return { success: true, clan: newClan };
    }
    
    // Join a clan (public or via invite)
    joinClan(clanId, inviteCode = null) {
        if (this.currentClan) {
            return { success: false, error: 'Leave your current clan first!' };
        }
        
        const clan = this.allClans.find(c => c.id === clanId);
        if (!clan) {
            return { success: false, error: 'Clan not found' };
        }
        
        // Check if clan is full
        if (clan.members.length >= clan.maxMembers) {
            return { success: false, error: 'Clan is full!' };
        }
        
        // Check requirements (if not using invite)
        if (!inviteCode) {
            // Would check player level/score here
            // For now, simplified
        }
        
        // Add player to clan
        clan.members.push({
            id: 'player',
            name: 'You',
            rank: 'Recruit',
            level: 1,
            contribution: 0,
            lastActive: Date.now(),
            joinDate: Date.now()
        });
        
        this.currentClan = clan;
        this.saveClanData();
        this.saveAllClans();
        
        return { success: true, clan: clan };
    }
    
    // Leave current clan
    leaveClan() {
        if (!this.currentClan) {
            return { success: false, error: 'You are not in a clan' };
        }
        
        const playerMember = this.currentClan.members.find(m => m.id === 'player');
        if (playerMember && playerMember.rank === 'Leader' && this.currentClan.members.length > 1) {
            return { success: false, error: 'Transfer leadership before leaving!' };
        }
        
        // Remove player from clan
        const clanIndex = this.allClans.findIndex(c => c.id === this.currentClan.id);
        if (clanIndex !== -1) {
            this.allClans[clanIndex].members = this.allClans[clanIndex].members.filter(m => m.id !== 'player');
            
            // Delete clan if empty
            if (this.allClans[clanIndex].members.length === 0) {
                this.allClans.splice(clanIndex, 1);
            }
        }
        
        this.currentClan = null;
        this.saveClanData();
        this.saveAllClans();
        
        return { success: true };
    }
    
    // Contribute to clan (called after each game)
    contributeScore(score, kills, waves, learningRewards) {
        if (!this.currentClan) return;
        
        const contribution = Math.floor(score / 10) + (kills * 5) + (waves * 20) + (learningRewards * 50);
        
        // Update player contribution
        const playerMember = this.currentClan.members.find(m => m.id === 'player');
        if (playerMember) {
            playerMember.contribution += contribution;
            playerMember.lastActive = Date.now();
        }
        
        // Update clan stats
        this.currentClan.stats.totalScore += score;
        this.currentClan.stats.totalKills += kills;
        this.currentClan.stats.totalWaves += waves;
        
        // Add clan XP
        const xpGained = contribution;
        this.currentClan.xp += xpGained;
        
        // Check for level up
        const oldLevel = this.currentClan.level;
        this.currentClan.level = this.calculateClanLevel(this.currentClan.xp);
        
        // Unlock new perks
        if (this.currentClan.level > oldLevel) {
            this.unlockClanPerks(oldLevel, this.currentClan.level);
        }
        
        // Update in global clans list
        const clanIndex = this.allClans.findIndex(c => c.id === this.currentClan.id);
        if (clanIndex !== -1) {
            this.allClans[clanIndex] = this.currentClan;
        }
        
        this.saveClanData();
        this.saveAllClans();
        
        return {
            contribution,
            xpGained,
            leveledUp: this.currentClan.level > oldLevel,
            newLevel: this.currentClan.level
        };
    }
    
    calculateClanLevel(xp) {
        // XP required doubles every 5 levels
        let level = 1;
        let xpRequired = 5000;
        let totalXpRequired = 0;
        
        while (xp >= totalXpRequired + xpRequired && level < 50) {
            totalXpRequired += xpRequired;
            level++;
            
            if (level % 5 === 0) {
                xpRequired *= 1.5;
            }
        }
        
        return level;
    }
    
    unlockClanPerks(oldLevel, newLevel) {
        for (let level = oldLevel + 1; level <= newLevel; level++) {
            if (this.clanPerks[level]) {
                const perk = this.clanPerks[level];
                if (!this.currentClan.perks.includes(perk.bonus)) {
                    this.currentClan.perks.push(perk.bonus);
                }
            }
        }
    }
    
    // Get stat bonuses from clan
    getClanBonuses() {
        if (!this.currentClan) {
            return {
                xp: 0,
                health: 0,
                score: 0,
                learning: 0,
                damage: 0,
                allStats: 0
            };
        }
        
        const bonuses = {
            xp: 0,
            health: 0,
            score: 0,
            learning: 0,
            damage: 0,
            allStats: 0
        };
        
        // Calculate bonuses based on unlocked perks
        for (let level in this.clanPerks) {
            if (this.currentClan.level >= parseInt(level)) {
                const perk = this.clanPerks[level];
                
                switch (perk.bonus) {
                    case 'xp_boost':
                        bonuses.xp += perk.value;
                        break;
                    case 'health_boost':
                        bonuses.health += perk.value;
                        break;
                    case 'score_boost':
                        bonuses.score += perk.value;
                        break;
                    case 'learning_rewards':
                        bonuses.learning += perk.value;
                        break;
                    case 'damage_boost':
                        bonuses.damage += perk.value;
                        break;
                    case 'all_stats':
                        bonuses.allStats += perk.value;
                        break;
                }
            }
        }
        
        return bonuses;
    }
    
    // Get clan leaderboard
    getClanLeaderboard(sortBy = 'totalScore') {
        return [...this.allClans]
            .sort((a, b) => {
                if (sortBy === 'level') return b.level - a.level;
                if (sortBy === 'members') return b.members.length - a.members.length;
                return b.stats[sortBy] - a.stats[sortBy];
            })
            .slice(0, 50);
    }
    
    // Get member leaderboard for current clan
    getMemberLeaderboard() {
        if (!this.currentClan) return [];
        
        return [...this.currentClan.members]
            .sort((a, b) => b.contribution - a.contribution);
    }
    
    // Clan chat/activities (simplified for single-player)
    getClanActivities() {
        if (!this.currentClan) return [];
        
        // Generate some simulated activities
        const activities = [];
        const now = Date.now();
        
        // Recent member activities
        this.currentClan.members.slice(0, 5).forEach((member, i) => {
            activities.push({
                type: 'contribution',
                member: member.name,
                text: `${member.name} contributed ${Math.floor(Math.random() * 5000) + 500} points!`,
                time: now - (i * 15 * 60 * 1000) // 15 mins apart
            });
        });
        
        // Clan milestones
        if (this.currentClan.stats.totalScore > 0) {
            const milestones = [100000, 500000, 1000000, 2500000, 5000000];
            milestones.forEach(milestone => {
                if (this.currentClan.stats.totalScore >= milestone) {
                    activities.push({
                        type: 'milestone',
                        text: `🎉 Clan reached ${milestone.toLocaleString()} total score!`,
                        time: now - (Math.random() * 7 * 24 * 60 * 60 * 1000)
                    });
                }
            });
        }
        
        // Sort by time
        activities.sort((a, b) => b.time - a.time);
        
        return activities.slice(0, 20);
    }
    
    // Get available clans to join
    getAvailableClans(filterPublic = true) {
        return this.allClans
            .filter(clan => {
                if (this.currentClan && clan.id === this.currentClan.id) return false;
                if (filterPublic && !clan.publicJoin) return false;
                if (clan.members.length >= clan.maxMembers) return false;
                return true;
            })
            .sort((a, b) => b.level - a.level);
    }
    
    // Search clans
    searchClans(query) {
        const lowerQuery = query.toLowerCase();
        return this.allClans.filter(clan => 
            clan.name.toLowerCase().includes(lowerQuery) ||
            clan.tag.toLowerCase().includes(lowerQuery) ||
            clan.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    // Get clan wars info (weekly competitive event)
    getClanWarsInfo() {
        // Simulated clan wars - weekly event where clans compete
        const now = Date.now();
        const weekStart = now - (now % (7 * 24 * 60 * 60 * 1000));
        const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);
        
        // Sort clans by this week's activity
        const topClans = this.allClans
            .map(clan => ({
                ...clan,
                weeklyScore: Math.floor(Math.random() * 500000) + clan.level * 10000 // Simulated
            }))
            .sort((a, b) => b.weeklyScore - a.weeklyScore)
            .slice(0, 10);
        
        const playerClanRank = topClans.findIndex(c => this.currentClan && c.id === this.currentClan.id) + 1;
        
        return {
            active: true,
            weekStart,
            weekEnd,
            timeRemaining: weekEnd - now,
            topClans,
            playerClanRank: playerClanRank || null,
            rewards: {
                1: '🏆 Elite Trophy + 50% XP Boost',
                2: '🥈 Silver Trophy + 35% XP Boost',
                3: '🥉 Bronze Trophy + 20% XP Boost',
                '4-10': '🎖️ Participation Badge + 10% XP Boost'
            }
        };
    }
    
    // Clan raid - cooperative PvE event
    getClanRaidInfo() {
        // Weekly clan raid - all members contribute to defeating a massive boss
        const raids = [
            { name: 'Mega Vowel Beast', health: 1000000, reward: '10000 Clan XP + Exclusive Title' },
            { name: 'Dark Matter Monster', health: 2500000, reward: '25000 Clan XP + Epic Emblem' },
            { name: 'Cosmic Tyrant', health: 5000000, reward: '50000 Clan XP + Legendary Avatar' }
        ];
        
        const currentRaid = raids[0]; // Would rotate weekly
        const clanDamage = this.currentClan ? Math.floor(this.currentClan.stats.totalKills * 100) : 0;
        
        return {
            active: true,
            raid: currentRaid,
            clanDamage,
            progress: Math.min(100, (clanDamage / currentRaid.health) * 100),
            timeRemaining: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
    }
}
