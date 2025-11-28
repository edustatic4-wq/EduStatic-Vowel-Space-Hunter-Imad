// Clan UI Functions for Vowel Space Hunter

export function showClansModal(clanManager, initialTab = 'my-clan') {
    const modal = document.getElementById('clans-modal');
    modal.style.display = 'flex';
    
    // Update active tab
    document.querySelectorAll('.clan-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === initialTab) {
            btn.classList.add('active');
        }
    });
    
    showClanTab(clanManager, initialTab);
    updateClanInfoBadge(clanManager);
}

export function showClanTab(clanManager, tab) {
    const content = document.getElementById('clan-content');
    
    switch(tab) {
        case 'my-clan':
            showMyClanTab(clanManager, content);
            break;
        case 'browse':
            showBrowseClansTab(clanManager, content);
            break;
        case 'create':
            showCreateClanTab(clanManager, content);
            break;
        case 'leaderboard':
            showClanLeaderboardTab(clanManager, content);
            break;
        case 'wars':
            showClanWarsTab(clanManager, content);
            break;
    }
}

function showMyClanTab(clanManager, content) {
    if (!clanManager.currentClan) {
        content.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">🏠</div>
                <h3 style="font-size: 32px; color: #10b981; margin-bottom: 15px;">You're not in a clan yet!</h3>
                <p style="font-size: 18px; color: #aaa; margin-bottom: 30px;">
                    Join a clan to compete with friends, earn bonuses, and participate in clan events!
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button class="clan-tab-btn" data-tab="browse" style="background: linear-gradient(135deg, #10b981, #059669); padding: 15px 40px; font-size: 20px;">
                        Browse Clans
                    </button>
                    <button class="clan-tab-btn" data-tab="create" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 15px 40px; font-size: 20px;">
                        Create Clan
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const clan = clanManager.currentClan;
    const bonuses = clanManager.getClanBonuses();
    const activities = clanManager.getClanActivities();
    const memberLeaderboard = clanManager.getMemberLeaderboard();
    
    const xpRequired = getXPRequiredForNextLevel(clan.level, clan.xp);
    const xpProgress = ((clan.xp % xpRequired) / xpRequired) * 100;
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <!-- Clan Info Card -->
            <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 15px; padding: 25px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 64px; margin-bottom: 10px;">${clan.emblem}</div>
                    <h3 style="font-size: 32px; color: #10b981; margin-bottom: 5px;">${clan.name}</h3>
                    <div style="font-size: 18px; color: #FFD700; margin-bottom: 10px;">[${clan.tag}]</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 15px;">${clan.description}</div>
                    <div style="font-size: 24px; color: #4ade80; font-weight: bold;">Level ${clan.level}</div>
                </div>
                
                <!-- XP Progress Bar -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; color: #aaa;">
                        <span>Clan XP</span>
                        <span>${clan.xp} / ${clan.xp + xpRequired}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); width: ${xpProgress}%; transition: width 0.3s;"></div>
                    </div>
                </div>
                
                <!-- Clan Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; color: #FFD700; font-weight: bold;">${clan.members.length}/${clan.maxMembers}</div>
                        <div style="font-size: 14px; color: #aaa;">Members</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; color: #4ade80; font-weight: bold;">${clan.stats.eventsWon}</div>
                        <div style="font-size: 14px; color: #aaa;">Events Won</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; color: #ff6b9d; font-weight: bold;">${clan.stats.totalScore.toLocaleString()}</div>
                        <div style="font-size: 14px; color: #aaa;">Total Score</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; color: #a29bfe; font-weight: bold;">${clan.stats.totalWaves}</div>
                        <div style="font-size: 14px; color: #aaa;">Total Waves</div>
                    </div>
                </div>
                
                <!-- Leave Clan Button -->
                <button id="leave-clan-btn" class="btn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #dc2626, #991b1b); font-size: 16px;">
                    Leave Clan
                </button>
            </div>
            
            <!-- Clan Perks & Bonuses -->
            <div style="background: rgba(255, 215, 0, 0.1); border: 2px solid #FFD700; border-radius: 15px; padding: 25px;">
                <h3 style="font-size: 24px; color: #FFD700; margin-bottom: 15px; text-align: center;">🎁 Clan Perks</h3>
                <div style="margin-bottom: 20px; font-size: 16px; color: #aaa; text-align: center;">
                    Active bonuses from your clan:
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${bonuses.xp > 0 ? `
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>⭐ XP Boost</span>
                            <span style="color: #4ade80; font-weight: bold;">+${bonuses.xp}%</span>
                        </div>
                    ` : ''}
                    ${bonuses.health > 0 ? `
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>❤️ Health Boost</span>
                            <span style="color: #4ade80; font-weight: bold;">+${bonuses.health}%</span>
                        </div>
                    ` : ''}
                    ${bonuses.score > 0 ? `
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>🎯 Score Boost</span>
                            <span style="color: #4ade80; font-weight: bold;">+${bonuses.score}%</span>
                        </div>
                    ` : ''}
                    ${bonuses.learning > 0 ? `
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>📚 Learning Rewards</span>
                            <span style="color: #4ade80; font-weight: bold;">+${bonuses.learning}%</span>
                        </div>
                    ` : ''}
                    ${bonuses.damage > 0 ? `
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>⚔️ Damage Boost</span>
                            <span style="color: #4ade80; font-weight: bold;">+${bonuses.damage}%</span>
                        </div>
                    ` : ''}
                    ${bonuses.allStats > 0 ? `
                        <div style="background: rgba(255, 215, 0, 0.2); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span>✨ All Stats</span>
                            <span style="color: #FFD700; font-weight: bold;">+${bonuses.allStats}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Next Perk Preview -->
                ${getNextPerkPreview(clanManager, clan.level)}
            </div>
        </div>
        
        <!-- Members and Activities -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Member Leaderboard -->
            <div style="background: rgba(162, 155, 254, 0.1); border: 2px solid #a29bfe; border-radius: 15px; padding: 25px;">
                <h3 style="font-size: 22px; color: #a29bfe; margin-bottom: 15px; text-align: center;">👥 Top Contributors</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${memberLeaderboard.slice(0, 10).map((member, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; ${member.id === 'player' ? 'border: 2px solid #10b981;' : ''}">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px; font-weight: bold; color: ${index < 3 ? '#FFD700' : '#aaa'};">#${index + 1}</span>
                                <div>
                                    <div style="font-weight: bold; color: ${member.id === 'player' ? '#4ade80' : '#fff'};">${member.name}</div>
                                    <div style="font-size: 12px; color: #888;">${member.rank} • Lvl ${member.level}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: #4ade80;">${member.contribution.toLocaleString()}</div>
                                <div style="font-size: 12px; color: #888;">points</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Clan Activities -->
            <div style="background: rgba(255, 107, 157, 0.1); border: 2px solid #ff6b9d; border-radius: 15px; padding: 25px;">
                <h3 style="font-size: 22px; color: #ff6b9d; margin-bottom: 15px; text-align: center;">📰 Recent Activity</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${activities.length > 0 ? activities.map(activity => `
                        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.3); border-left: 3px solid ${activity.type === 'milestone' ? '#FFD700' : '#10b981'}; border-radius: 4px;">
                            <div style="font-size: 14px; color: #fff; margin-bottom: 3px;">${activity.text}</div>
                            <div style="font-size: 12px; color: #888;">${getTimeAgo(activity.time)}</div>
                        </div>
                    `).join('') : '<div style="text-align: center; color: #888; padding: 40px;">No recent activity</div>'}
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for leave clan button
    document.getElementById('leave-clan-btn').addEventListener('click', () => {
        const result = clanManager.leaveClan();
        if (result.success) {
            alert('You have left the clan.');
            showClanTab(clanManager, 'browse');
        } else {
            alert(result.error);
        }
    });
}

function showBrowseClansTab(clanManager, content) {
    const availableClans = clanManager.getAvailableClans(true);
    
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <input type="text" id="clan-search" placeholder="Search clans by name or tag..." 
                   style="width: 100%; padding: 15px; font-size: 16px; background: rgba(0,0,0,0.6); color: #fff; border: 2px solid #10b981; border-radius: 8px;">
        </div>
        
        <div id="clans-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${availableClans.map(clan => `
                <div class="clan-card" style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 15px; padding: 20px; cursor: pointer; transition: transform 0.3s;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">${clan.emblem}</div>
                        <h4 style="font-size: 24px; color: #10b981; margin-bottom: 5px;">${clan.name}</h4>
                        <div style="font-size: 14px; color: #FFD700; margin-bottom: 10px;">[${clan.tag}] • Level ${clan.level}</div>
                        <div style="font-size: 14px; color: #aaa; margin-bottom: 15px;">${clan.description}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; font-size: 13px;">
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="color: #4ade80; font-weight: bold;">${clan.members.length}/${clan.maxMembers}</div>
                            <div style="color: #aaa;">Members</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="color: #ff6b9d; font-weight: bold;">${Math.floor(clan.stats.totalScore / 1000)}k</div>
                            <div style="color: #aaa;">Score</div>
                        </div>
                    </div>
                    
                    ${clan.publicJoin ? 
                        `<button class="join-clan-btn btn" data-clan-id="${clan.id}" style="width: 100%; padding: 10px; font-size: 14px;">Join Clan</button>` :
                        `<div style="text-align: center; color: #888; font-size: 14px;">🔒 Private - Invite Only</div>`
                    }
                </div>
            `).join('')}
        </div>
        
        ${availableClans.length === 0 ? '<div style="text-align: center; color: #888; padding: 60px; font-size: 18px;">No clans available to join</div>' : ''}
    `;
    
    // Search functionality
    document.getElementById('clan-search').addEventListener('input', (e) => {
        const query = e.target.value;
        const results = query.length > 0 ? clanManager.searchClans(query) : clanManager.getAvailableClans(true);
        updateClansList(clanManager, results);
    });
    
    // Join clan buttons
    document.querySelectorAll('.join-clan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const clanId = btn.dataset.clanId;
            const result = clanManager.joinClan(clanId);
            if (result.success) {
                alert(`You have joined ${result.clan.name}!`);
                showClanTab(clanManager, 'my-clan');
            } else {
                alert(result.error);
            }
        });
    });
    
    // Hover effect
    document.querySelectorAll('.clan-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

function updateClansList(clanManager, clans) {
    const clansList = document.getElementById('clans-list');
    clansList.innerHTML = clans.map(clan => `
        <div class="clan-card" style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 15px; padding: 20px; cursor: pointer; transition: transform 0.3s;">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 48px; margin-bottom: 10px;">${clan.emblem}</div>
                <h4 style="font-size: 24px; color: #10b981; margin-bottom: 5px;">${clan.name}</h4>
                <div style="font-size: 14px; color: #FFD700; margin-bottom: 10px;">[${clan.tag}] • Level ${clan.level}</div>
                <div style="font-size: 14px; color: #aaa; margin-bottom: 15px;">${clan.description}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; font-size: 13px;">
                <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; text-align: center;">
                    <div style="color: #4ade80; font-weight: bold;">${clan.members.length}/${clan.maxMembers}</div>
                    <div style="color: #aaa;">Members</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; text-align: center;">
                    <div style="color: #ff6b9d; font-weight: bold;">${Math.floor(clan.stats.totalScore / 1000)}k</div>
                    <div style="color: #aaa;">Score</div>
                </div>
            </div>
            
            ${clan.publicJoin ? 
                `<button class="join-clan-btn btn" data-clan-id="${clan.id}" style="width: 100%; padding: 10px; font-size: 14px;">Join Clan</button>` :
                `<div style="text-align: center; color: #888; font-size: 14px;">🔒 Private - Invite Only</div>`
            }
        </div>
    `).join('');
    
    // Re-attach event listeners
    document.querySelectorAll('.join-clan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const clanId = btn.dataset.clanId;
            const result = clanManager.joinClan(clanId);
            if (result.success) {
                alert(`You have joined ${result.clan.name}!`);
                showClanTab(clanManager, 'my-clan');
            } else {
                alert(result.error);
            }
        });
    });
}

function showCreateClanTab(clanManager, content) {
    if (clanManager.currentClan) {
        content.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
                <h3 style="font-size: 28px; color: #ffd700; margin-bottom: 15px;">You're already in a clan!</h3>
                <p style="font-size: 18px; color: #aaa;">Leave your current clan to create a new one.</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 15px; padding: 40px;">
            <h3 style="font-size: 28px; color: #10b981; margin-bottom: 30px; text-align: center;">Create Your Clan</h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #aaa; font-size: 14px;">Clan Name (3-30 characters)</label>
                <input type="text" id="create-clan-name" maxlength="30" placeholder="Enter clan name..." 
                       style="width: 100%; padding: 12px; font-size: 16px; background: rgba(0,0,0,0.6); color: #fff; border: 2px solid #10b981; border-radius: 8px;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #aaa; font-size: 14px;">Clan Tag (2-5 characters)</label>
                <input type="text" id="create-clan-tag" maxlength="5" placeholder="TAG" 
                       style="width: 100%; padding: 12px; font-size: 16px; background: rgba(0,0,0,0.6); color: #fff; border: 2px solid #10b981; border-radius: 8px; text-transform: uppercase;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #aaa; font-size: 14px;">Description</label>
                <textarea id="create-clan-description" maxlength="150" placeholder="Describe your clan..." 
                          style="width: 100%; padding: 12px; font-size: 16px; background: rgba(0,0,0,0.6); color: #fff; border: 2px solid #10b981; border-radius: 8px; min-height: 80px; resize: vertical;"></textarea>
            </div>
            
            <div style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 12px; color: #aaa; font-size: 14px;">Clan Emblem</label>
                <div id="emblem-picker" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px;">
                    ${['🚀', '⭐', '🛡️', '⚔️', '🎯', '💎', '🔥', '⚡', '🌟', '👑', '🏆', '🎨', '🌈', '🦄', '🐉', '🌙'].map(emoji => `
                        <button class="emblem-btn" data-emblem="${emoji}" style="font-size: 32px; padding: 10px; background: rgba(0,0,0,0.3); border: 2px solid transparent; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="create-clan-public" checked style="width: 20px; height: 20px; cursor: pointer;">
                    <span style="color: #aaa; font-size: 16px;">Allow anyone to join (public clan)</span>
                </label>
            </div>
            
            <button id="create-clan-submit" class="btn" style="width: 100%; padding: 15px; font-size: 18px; background: linear-gradient(135deg, #10b981, #059669);">
                Create Clan
            </button>
        </div>
    `;
    
    let selectedEmblem = '🚀';
    
    // Emblem selection
    document.querySelectorAll('.emblem-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emblem-btn').forEach(b => {
                b.style.borderColor = 'transparent';
                b.style.background = 'rgba(0,0,0,0.3)';
            });
            btn.style.borderColor = '#10b981';
            btn.style.background = 'rgba(16, 185, 129, 0.3)';
            selectedEmblem = btn.dataset.emblem;
        });
    });
    
    // Set default emblem selection
    document.querySelector('.emblem-btn').click();
    
    // Create clan submission
    document.getElementById('create-clan-submit').addEventListener('click', () => {
        const name = document.getElementById('create-clan-name').value.trim();
        const tag = document.getElementById('create-clan-tag').value.trim().toUpperCase();
        const description = document.getElementById('create-clan-description').value.trim();
        const publicJoin = document.getElementById('create-clan-public').checked;
        
        const result = clanManager.createClan(name, tag, description, selectedEmblem, { publicJoin });
        
        if (result.success) {
            alert(`Clan "${name}" created successfully!`);
            showClanTab(clanManager, 'my-clan');
        } else {
            alert(result.error);
        }
    });
}

function showClanLeaderboardTab(clanManager, content) {
    const leaderboard = clanManager.getClanLeaderboard('totalScore');
    
    content.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="sort-btn" data-sort="totalScore" style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: 2px solid #10b981; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Total Score
            </button>
            <button class="sort-btn" data-sort="level" style="padding: 10px 20px; background: rgba(50,50,50,0.6); color: #fff; border: 2px solid #555; border-radius: 8px; cursor: pointer;">
                Level
            </button>
            <button class="sort-btn" data-sort="members" style="padding: 10px 20px; background: rgba(50,50,50,0.6); color: #fff; border: 2px solid #555; border-radius: 8px; cursor: pointer;">
                Members
            </button>
        </div>
        
        <div style="background: rgba(0,0,0,0.6); border: 2px solid #10b981; border-radius: 15px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; color: #fff;">
                <thead>
                    <tr style="border-bottom: 2px solid #10b981;">
                        <th style="padding: 15px; text-align: left;">Rank</th>
                        <th style="padding: 15px; text-align: left;">Clan</th>
                        <th style="padding: 15px; text-align: left;">Level</th>
                        <th style="padding: 15px; text-align: left;">Members</th>
                        <th style="padding: 15px; text-align: left;">Total Score</th>
                        <th style="padding: 15px; text-align: left;">Events Won</th>
                    </tr>
                </thead>
                <tbody id="clan-leaderboard-tbody">
                    ${leaderboard.map((clan, index) => `
                        <tr style="border-bottom: 1px solid rgba(16, 185, 129, 0.3); ${clanManager.currentClan && clan.id === clanManager.currentClan.id ? 'background: rgba(16, 185, 129, 0.2);' : ''}">
                            <td style="padding: 15px; font-size: 20px; font-weight: bold; color: ${index < 3 ? '#FFD700' : '#fff'};">#${index + 1}</td>
                            <td style="padding: 15px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 32px;">${clan.emblem}</span>
                                    <div>
                                        <div style="font-weight: bold; font-size: 18px;">${clan.name}</div>
                                        <div style="font-size: 14px; color: #FFD700;">[${clan.tag}]</div>
                                    </div>
                                </div>
                            </td>
                            <td style="padding: 15px; color: #4ade80; font-weight: bold;">${clan.level}</td>
                            <td style="padding: 15px;">${clan.members.length}/${clan.maxMembers}</td>
                            <td style="padding: 15px; color: #ff6b9d; font-weight: bold;">${clan.stats.totalScore.toLocaleString()}</td>
                            <td style="padding: 15px; color: #a29bfe;">${clan.stats.eventsWon}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Sort button functionality
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortBy = btn.dataset.sort;
            const newLeaderboard = clanManager.getClanLeaderboard(sortBy);
            
            // Update button styles
            document.querySelectorAll('.sort-btn').forEach(b => {
                b.style.background = 'rgba(50,50,50,0.6)';
                b.style.borderColor = '#555';
            });
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            btn.style.borderColor = '#10b981';
            
            // Update table
            updateClanLeaderboardTable(clanManager, newLeaderboard);
        });
    });
}

function updateClanLeaderboardTable(clanManager, leaderboard) {
    const tbody = document.getElementById('clan-leaderboard-tbody');
    tbody.innerHTML = leaderboard.map((clan, index) => `
        <tr style="border-bottom: 1px solid rgba(16, 185, 129, 0.3); ${clanManager.currentClan && clan.id === clanManager.currentClan.id ? 'background: rgba(16, 185, 129, 0.2);' : ''}">
            <td style="padding: 15px; font-size: 20px; font-weight: bold; color: ${index < 3 ? '#FFD700' : '#fff'};">#${index + 1}</td>
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 32px;">${clan.emblem}</span>
                    <div>
                        <div style="font-weight: bold; font-size: 18px;">${clan.name}</div>
                        <div style="font-size: 14px; color: #FFD700;">[${clan.tag}]</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px; color: #4ade80; font-weight: bold;">${clan.level}</td>
            <td style="padding: 15px;">${clan.members.length}/${clan.maxMembers}</td>
            <td style="padding: 15px; color: #ff6b9d; font-weight: bold;">${clan.stats.totalScore.toLocaleString()}</td>
            <td style="padding: 15px; color: #a29bfe;">${clan.stats.eventsWon}</td>
        </tr>
    `).join('');
}

function showClanWarsTab(clanManager, content) {
    const warsInfo = clanManager.getClanWarsInfo();
    const raidInfo = clanManager.getClanRaidInfo();
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <!-- Clan Wars -->
            <div style="background: linear-gradient(135deg, rgba(196, 30, 58, 0.2), rgba(139, 0, 0, 0.2)); border: 2px solid #c41e3a; border-radius: 15px; padding: 25px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚔️</div>
                    <h3 style="font-size: 28px; color: #c41e3a; margin-bottom: 10px;">CLAN WARS</h3>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 15px;">Weekly competitive event</div>
                    <div style="font-size: 18px; color: #4ade80; font-weight: bold;">
                        ${formatTimeRemaining(warsInfo.timeRemaining)} remaining
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 20px; color: #FFD700; margin-bottom: 10px; text-align: center;">🏆 Top Clans</h4>
                    ${warsInfo.topClans.slice(0, 5).map((clan, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.4); border-radius: 8px; ${clanManager.currentClan && clan.id === clanManager.currentClan.id ? 'border: 2px solid #10b981;' : ''}">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px; font-weight: bold; color: ${index < 3 ? '#FFD700' : '#fff'};">#${index + 1}</span>
                                <span style="font-size: 24px;">${clan.emblem}</span>
                                <div>
                                    <div style="font-weight: bold;">${clan.name}</div>
                                    <div style="font-size: 12px; color: #888;">Lvl ${clan.level}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: #4ade80;">${clan.weeklyScore.toLocaleString()}</div>
                                <div style="font-size: 12px; color: #888;">weekly pts</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${warsInfo.playerClanRank ? `
                    <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                        <div style="font-size: 16px; color: #4ade80; font-weight: bold;">Your Clan Rank: #${warsInfo.playerClanRank}</div>
                    </div>
                ` : `
                    <div style="background: rgba(100, 100, 100, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: #888;">Join a clan to participate!</div>
                    </div>
                `}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(196, 30, 58, 0.3);">
                    <h4 style="font-size: 18px; color: #FFD700; margin-bottom: 10px; text-align: center;">Rewards</h4>
                    ${Object.entries(warsInfo.rewards).map(([rank, reward]) => `
                        <div style="padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 14px;">
                            <span style="color: #FFD700; font-weight: bold;">${rank === '4-10' ? 'Ranks 4-10' : `Rank ${rank}`}:</span> ${reward}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Clan Raid -->
            <div style="background: linear-gradient(135deg, rgba(162, 155, 254, 0.2), rgba(108, 92, 231, 0.2)); border: 2px solid #a29bfe; border-radius: 15px; padding: 25px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🐉</div>
                    <h3 style="font-size: 28px; color: #a29bfe; margin-bottom: 10px;">CLAN RAID</h3>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 15px;">Cooperative PvE challenge</div>
                    <div style="font-size: 18px; color: #4ade80; font-weight: bold;">
                        ${formatTimeRemaining(raidInfo.timeRemaining)} remaining
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 24px; color: #ff6b9d; margin-bottom: 10px; text-align: center;">${raidInfo.raid.name}</h4>
                    <div style="text-align: center; font-size: 16px; color: #aaa; margin-bottom: 15px;">
                        Health: ${raidInfo.raid.health.toLocaleString()}
                    </div>
                    
                    ${clanManager.currentClan ? `
                        <!-- Clan Progress Bar -->
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; color: #aaa;">
                                <span>Clan Damage</span>
                                <span>${raidInfo.clanDamage.toLocaleString()} (${raidInfo.progress.toFixed(1)}%)</span>
                            </div>
                            <div style="width: 100%; height: 16px; background: rgba(0,0,0,0.5); border-radius: 8px; overflow: hidden;">
                                <div style="height: 100%; background: linear-gradient(90deg, #a29bfe, #6c5ce7); width: ${raidInfo.progress}%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                            <div style="font-size: 16px; color: #4ade80; margin-bottom: 5px;">Keep playing to contribute!</div>
                            <div style="font-size: 14px; color: #888;">Each kill adds 100 damage</div>
                        </div>
                    ` : `
                        <div style="background: rgba(100, 100, 100, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 14px; color: #888;">Join a clan to participate!</div>
                        </div>
                    `}
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(162, 155, 254, 0.3);">
                    <h4 style="font-size: 18px; color: #FFD700; margin-bottom: 10px; text-align: center;">Raid Rewards</h4>
                    <div style="padding: 12px; background: rgba(255, 215, 0, 0.2); border-radius: 8px; text-align: center; border: 2px solid #FFD700;">
                        <div style="font-size: 16px; color: #FFD700; font-weight: bold;">${raidInfo.raid.reward}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Info Box -->
        <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 15px; padding: 25px; text-align: center;">
            <h4 style="font-size: 22px; color: #10b981; margin-bottom: 15px;">How Clan Events Work</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 16px; color: #aaa; text-align: left;">
                <div>
                    <div style="font-weight: bold; color: #c41e3a; margin-bottom: 8px;">⚔️ Clan Wars:</div>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li>Weekly competition between clans</li>
                        <li>Play games to earn weekly points</li>
                        <li>Top clans win exclusive rewards</li>
                        <li>Resets every Monday</li>
                    </ul>
                </div>
                <div>
                    <div style="font-weight: bold; color: #a29bfe; margin-bottom: 8px;">🐉 Clan Raid:</div>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li>Cooperative boss challenge</li>
                        <li>All clan members contribute damage</li>
                        <li>Defeat boss for clan rewards</li>
                        <li>New raid every week</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getXPRequiredForNextLevel(currentLevel, currentXP) {
    let level = 1;
    let xpRequired = 5000;
    let totalXpRequired = 0;
    
    while (level < currentLevel) {
        totalXpRequired += xpRequired;
        level++;
        
        if (level % 5 === 0) {
            xpRequired *= 1.5;
        }
    }
    
    return xpRequired;
}

function getNextPerkPreview(clanManager, currentLevel) {
    let nextPerkLevel = null;
    for (let level in clanManager.clanPerks) {
        if (parseInt(level) > currentLevel) {
            nextPerkLevel = parseInt(level);
            break;
        }
    }
    
    if (!nextPerkLevel) {
        return '<div style="text-align: center; padding: 20px; color: #888;">All perks unlocked!</div>';
    }
    
    const nextPerk = clanManager.clanPerks[nextPerkLevel];
    const levelsAway = nextPerkLevel - currentLevel;
    
    return `
        <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border: 2px solid #FFD700;">
            <div style="text-align: center; color: #FFD700; font-weight: bold; margin-bottom: 8px;">🔒 Next Perk (Level ${nextPerkLevel})</div>
            <div style="text-align: center; font-size: 18px; color: #4ade80; font-weight: bold; margin-bottom: 5px;">${nextPerk.name}</div>
            <div style="text-align: center; font-size: 14px; color: #888;">${levelsAway} level${levelsAway > 1 ? 's' : ''} away</div>
        </div>
    `;
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function formatTimeRemaining(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))}m`;
    return `${Math.floor(ms / (60 * 1000))}m`;
}

export function updateClanInfoBadge(clanManager) {
    const badge = document.getElementById('clan-info-badge');
    if (!badge) return;
    
    if (clanManager.currentClan) {
        const clan = clanManager.currentClan;
        badge.innerHTML = `${clan.emblem} ${clan.name} [${clan.tag}] - Level ${clan.level}`;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

export function showClanContribution(result) {
    const notification = document.getElementById('clan-contribution-notification');
    document.getElementById('clan-contrib-amount').textContent = `+${result.contribution.toLocaleString()} Contribution Points`;
    document.getElementById('clan-contrib-xp').textContent = `+${result.xpGained.toLocaleString()} Clan XP`;
    
    if (result.leveledUp) {
        document.getElementById('clan-contrib-level').textContent = `🎉 Clan leveled up to ${result.newLevel}!`;
    } else {
        document.getElementById('clan-contrib-level').textContent = '';
    }
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}
