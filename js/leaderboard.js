// Leaderboard System using localStorage

const LEADERBOARD_KEY = 'vowelSpaceHunter_leaderboard';
const MAX_ENTRIES = 10;

export class LeaderboardManager {
    constructor() {
        this.scores = this.loadScores();
    }
    
    // Load scores from localStorage
    loadScores() {
        try {
            const data = localStorage.getItem(LEADERBOARD_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading leaderboard:', e);
        }
        return [];
    }
    
    // Save scores to localStorage
    saveScores() {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(this.scores));
        } catch (e) {
            console.error('Error saving leaderboard:', e);
        }
    }
    
    // Add a new score
    addScore(playerName, score, wave, kills, maxCombo, difficulty) {
        const entry = {
            name: playerName || 'Anonymous',
            score: score,
            wave: wave,
            kills: kills,
            maxCombo: maxCombo,
            difficulty: difficulty,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.scores.push(entry);
        
        // Sort by score (highest first)
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top entries
        if (this.scores.length > MAX_ENTRIES) {
            this.scores = this.scores.slice(0, MAX_ENTRIES);
        }
        
        this.saveScores();
        
        // Check if this score made it to the leaderboard
        const rank = this.scores.findIndex(s => s.timestamp === entry.timestamp);
        return {
            rank: rank + 1,
            madeLeaderboard: rank < MAX_ENTRIES
        };
    }
    
    // Check if a score would make the leaderboard
    wouldMakeLeaderboard(score) {
        if (this.scores.length < MAX_ENTRIES) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
    
    // Get all scores
    getScores() {
        return this.scores;
    }
    
    // Get top score
    getTopScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }
    
    // Get scores by difficulty
    getScoresByDifficulty(difficulty) {
        return this.scores.filter(s => s.difficulty === difficulty);
    }
    
    // Clear all scores
    clearScores() {
        this.scores = [];
        this.saveScores();
    }
    
    // Format date for display
    formatDate(isoDate) {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }
}

// Create singleton instance
export const leaderboard = new LeaderboardManager();
