// Enhanced Dashboard Data Structure
let dashboardData = {
    currentSeason: '2026-27',
    seasons: {
        '2026-27': {
            teamStats: { wins: 0, losses: 0, draws: 0, points: 0, gamesPlayed: 0, totalPins: 0, averageScore: 0 },
            players: {
                Adrian: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Ben: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Christian: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Edd: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Helen: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Jason: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Keith: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Linda: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Martin: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Paddy: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Steve: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Teresa: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Tom: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                XYZ: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [], isHandicap: true }
            },
            matches: [],
            fixtures: [],
            nextFixture: { opponent: 'TBD', date: 'TBD', venue: 'TBD', time: 'TBD' }
        }
    }
};

const ADMIN_PASSWORD = 'WanstrowSpares2025';
let isAdmin = false;

// Initialize
let playerSortState = { column: null, direction: 'desc' };

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
    updateAllDisplays();
    updateSeasonSelector();
    updateUnpushedBanner();
    switchTab('overview');
});

// GitHub repo details, used by the "Open on GitHub" link
const GITHUB_REPO = 'christbt79/wanstrow-spares-dashboard';
const GITHUB_BRANCH = 'main';

// True when this browser holds changes that aren't on GitHub yet
let hasUnpushedChanges = false;

// Read this browser's saved copy of one season (or null)
function getLocalSeason(seasonKey) {
    try {
        const saved = JSON.parse(localStorage.getItem('wanstrowDashboard') || 'null');
        return (saved && saved.seasons && saved.seasons[seasonKey]) || null;
    } catch (e) {
        return null;
    }
}

// Is the browser's copy newer than GitHub's?
// Uses the lastUpdated stamp when present; older data without a stamp
// falls back to comparing how many matches each copy has.
function isLocalNewer(local, remote) {
    if (!local) return false;
    if (!remote) return true;
    if (local.lastUpdated && remote.lastUpdated) return local.lastUpdated > remote.lastUpdated;
    if (local.lastUpdated && !remote.lastUpdated) return true;
    return (local.matches || []).length > (remote.matches || []).length;
}

// Load data
async function loadData() {
    const currentSeason = dashboardData.currentSeason;
    const local = getLocalSeason(currentSeason);
    let remote = null;

    try {
        const response = await fetch(`./data/${currentSeason}.json`, { cache: 'no-cache' });
        if (response.ok) remote = await response.json();
    } catch (error) {
        console.log('Could not reach GitHub data file');
    }

    let chosen;
    if (isLocalNewer(local, remote)) {
        chosen = local;
        hasUnpushedChanges = true;
        console.log('Using this browser\'s copy: it has changes not yet on GitHub');
    } else {
        chosen = remote || local;
    }

    if (chosen) {
        dashboardData.seasons[currentSeason] = { ...dashboardData.seasons[currentSeason], ...chosen };
    }
    return !!chosen;
}

// Save data — called only when something has actually changed
function saveData() {
    const season = getCurrentSeasonData();
    season.lastUpdated = new Date().toISOString();
    localStorage.setItem('wanstrowDashboard', JSON.stringify(dashboardData));
    hasUnpushedChanges = true;
    updateUnpushedBanner();
    generateSharedDataFile();
}

// Copy the current season's JSON to the clipboard, ready to paste into GitHub
async function copySeasonData() {
    const json = JSON.stringify(getCurrentSeasonData(), null, 2);
    let ok = false;
    try {
        await navigator.clipboard.writeText(json);
        ok = true;
    } catch (e) {
        // Fallback for browsers that block the clipboard API
        const ta = document.createElement('textarea');
        ta.value = json;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
    }

    const season = getCurrentSeasonData();
    const message = ok
        ? `Copied ${dashboardData.currentSeason.replace('-', '/')} data (${(season.matches || []).length} matches). Now open GitHub, select all, paste, and commit.`
        : 'Could not copy automatically. Please use the browser console method instead.';
    document.querySelectorAll('.publish-status').forEach(el => {
        el.textContent = message;
        el.classList.toggle('error', !ok);
    });
}

// Open the GitHub editor for the current season's data file
function openGitHubEditor() {
    const url = `https://github.com/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/data/${dashboardData.currentSeason}.json`;
    window.open(url, '_blank', 'noopener');
}

function updateUnpushedBanner() {
    const banner = document.getElementById('unpushed-banner');
    if (banner) banner.style.display = hasUnpushedChanges ? 'block' : 'none';
    document.querySelectorAll('.publish-season-label').forEach(el => {
        el.textContent = dashboardData.currentSeason.replace('-', '/');
    });
}

// Generate shared data file
function generateSharedDataFile() {
    const season = getCurrentSeasonData();
    const jsonData = JSON.stringify(season, null, 2);
    console.log(`=== ${dashboardData.currentSeason}.json ===`);
    console.log(jsonData);
    console.log('=== END ===');
}

// Get current season data
function getCurrentSeasonData() {
    return dashboardData.seasons[dashboardData.currentSeason] || dashboardData.seasons['2026-27'];
}

// Setup event listeners
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Admin
    document.querySelector('.admin-login-btn').addEventListener('click', showAdminLogin);
    document.getElementById('login-btn').addEventListener('click', handleAdminLogin);
    document.getElementById('cancel-btn').addEventListener('click', hideAdminLogin);
    document.getElementById('admin-password').addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAdminLogin();
    });

    // Season management
    document.getElementById('season-select')?.addEventListener('change', handleSeasonChange);
    document.getElementById('new-season-btn')?.addEventListener('click', showNewSeasonModal);
    document.getElementById('confirm-new-season-btn')?.addEventListener('click', startNewSeason);
    document.getElementById('cancel-new-season-btn')?.addEventListener('click', hideNewSeasonModal);

    // Info tips: tap/click toggles (for mobile); desktop also opens on hover via CSS.
    // Delegated on document so it covers tips rendered later (e.g. the Player Stats table).
    document.addEventListener('click', function(e) {
        const tip = e.target.closest('.info-tip');
        document.querySelectorAll('.info-tip.open').forEach(t => {
            if (t !== tip) t.classList.remove('open');
        });
        if (tip) {
            e.stopPropagation();
            tip.classList.toggle('open');
        }
    });

    // Publish to GitHub buttons (in the banner and the Admin tab)
    document.querySelectorAll('.copy-season-btn').forEach(btn => btn.addEventListener('click', copySeasonData));
    document.querySelectorAll('.open-github-btn').forEach(btn => btn.addEventListener('click', openGitHubEditor));

    // Match detail modal
    document.getElementById('close-match-detail-btn')?.addEventListener('click', hideMatchDetail);
    document.getElementById('match-detail-modal')?.addEventListener('click', function(e) {
        if (e.target === this) hideMatchDetail();
    });

    // Fixture upload
    document.getElementById('upload-fixtures-btn')?.addEventListener('click', uploadFixtures);

    // Team management
    document.getElementById('add-player-btn')?.addEventListener('click', addPlayer);
    document.getElementById('remove-player-btn')?.addEventListener('click', removePlayer);

    // Match form
    const matchForm = document.getElementById('match-form');
    if (matchForm) {
        matchForm.addEventListener('submit', handleMatchSubmit);
    }

    const opponentSelect = document.getElementById('opponent');
    if (opponentSelect) {
        opponentSelect.addEventListener('change', function() {
            document.getElementById('opponent-match-label').textContent = this.value || 'Opponent';
            document.getElementById('opponent-total-label').textContent = this.value || 'Opponent';
        });
    }
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// Admin functions
function showAdminLogin() {
    document.getElementById('admin-modal').classList.add('show');
    document.getElementById('admin-password').focus();
}

function hideAdminLogin() {
    document.getElementById('admin-modal').classList.remove('show');
    document.getElementById('admin-password').value = '';
}

function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        hideAdminLogin();
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelector('.admin-login-btn').style.display = 'none';
        populatePlayerInputs();
        updateSeasonSelector();
        updateRemovePlayerOptions();
        alert('Admin access granted!');
    } else {
        alert('Incorrect password!');
    }
}

// Season management
function updateSeasonSelector() {
    const select = document.getElementById('season-select');
    if (!select) return;

    // Always include known seasons even if not yet fetched
    const knownSeasons = ['2025-26', '2026-27'];
    const allSeasons = [...new Set([...knownSeasons, ...Object.keys(dashboardData.seasons)])].sort().reverse();

    select.innerHTML = allSeasons.map(s =>
        `<option value="${s}" ${s === dashboardData.currentSeason ? 'selected' : ''}>${s.replace('-', '/')}</option>`
    ).join('');
}

async function handleSeasonChange(e) {
    const selectedSeason = e.target.value;

    // If we don't have this season's data yet, fetch it from GitHub
    if (!dashboardData.seasons[selectedSeason]) {
        try {
            const response = await fetch(`./data/${selectedSeason}.json`, { cache: 'no-cache' });
            if (response.ok) {
                dashboardData.seasons[selectedSeason] = await response.json();
                console.log(`Loaded ${selectedSeason} from GitHub`);
            } else {
                alert(`Could not load data for ${selectedSeason} — file not found.`);
                return;
            }
        } catch (err) {
            alert(`Error loading ${selectedSeason}: ${err.message}`);
            return;
        }
    }

    dashboardData.currentSeason = selectedSeason;
    updateAllDisplays();
    updateUnpushedBanner();
}

function showNewSeasonModal() {
    document.getElementById('new-season-modal').classList.add('show');
    const nextYear = parseInt(dashboardData.currentSeason.split('-')[0]) + 1;
    document.getElementById('new-season-name').value = `${nextYear}-${(nextYear + 1).toString().slice(-2)}`;
}

function hideNewSeasonModal() {
    document.getElementById('new-season-modal').classList.remove('show');
}

function startNewSeason() {
    const newSeasonName = document.getElementById('new-season-name').value.trim();
    if (!newSeasonName) {
        alert('Please enter a season name');
        return;
    }

    if (dashboardData.seasons[newSeasonName]) {
        alert('Season already exists!');
        return;
    }

    // Create new season with fresh stats but same players
    const currentSeason = getCurrentSeasonData();
    const newPlayers = {};
    
    Object.keys(currentSeason.players).forEach(name => {
        newPlayers[name] = {
            games: 0,
            totalPins: 0,
            highScore: 0,
            scores: [],
            form: [],
            isHandicap: currentSeason.players[name].isHandicap || false
        };
    });

    dashboardData.seasons[newSeasonName] = {
        teamStats: { wins: 0, losses: 0, draws: 0, points: 0, gamesPlayed: 0, totalPins: 0, averageScore: 0 },
        players: newPlayers,
        matches: [],
        fixtures: [],
        nextFixture: { opponent: 'TBD', date: 'TBD', venue: 'TBD' }
    };

    dashboardData.currentSeason = newSeasonName;
    hideNewSeasonModal();
    saveData();
    updateAllDisplays();
    alert(`New season ${newSeasonName} created! Don't forget to upload fixtures.`);
}

// Fixture upload
function uploadFixtures() {
    const csvInput = document.getElementById('csv-input').value.trim();
    if (!csvInput) {
        alert('Please paste CSV data');
        return;
    }

    const lines = csvInput.split('\n');
    const fixtures = [];
    const uniqueOpponents = new Set();

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            const [rawDate, opponent, venue, rawTime] = parts;

            // Accept DD/MM/YYYY or YYYY-MM-DD
            let isoDate;
            if (rawDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [d, m, y] = rawDate.split('/');
                isoDate = `${y}-${m}-${d}`;
            } else {
                isoDate = rawDate;
            }
            const dateObj = new Date(isoDate);
            const displayDate = dateObj.toLocaleDateString('en-GB');

            // Accept Early/Late or HH:MM (20:30+ = Late, before = Early)
            let timeLabel = 'Early';
            if (rawTime) {
                if (rawTime === 'Early' || rawTime === 'Late') {
                    timeLabel = rawTime;
                } else if (rawTime.match(/^\d{2}:\d{2}$/)) {
                    const [h, m] = rawTime.split(':').map(Number);
                    timeLabel = (h > 20 || (h === 20 && m >= 30)) ? 'Late' : 'Early';
                }
            }

            fixtures.push({
                date: isoDate,
                displayDate: displayDate,
                opponent: opponent,
                venue: venue,
                time: timeLabel
            });
            uniqueOpponents.add(opponent);
        }
    });

    if (fixtures.length === 0) {
        alert('No valid fixtures found. Use format: Date,Opponent,Venue,Time');
        return;
    }

    const season = getCurrentSeasonData();
    season.fixtures = fixtures;
    updateNextFixture();

    saveData();
    updateAllDisplays();
    alert(`${fixtures.length} fixtures loaded successfully!`);
    document.getElementById('csv-input').value = '';
}

// Team management
function addPlayer() {
    const nameInput = document.getElementById('new-player-name');
    const newPlayerName = nameInput.value.trim();
    
    if (!newPlayerName) {
        alert('Please enter a player name');
        return;
    }
    
    const season = getCurrentSeasonData();
    if (season.players[newPlayerName]) {
        alert('Player already exists');
        return;
    }
    
    season.players[newPlayerName] = {
        games: 0,
        totalPins: 0,
        highScore: 0,
        scores: [],
        form: []
    };
    
    nameInput.value = '';
    saveData();
    updateAllDisplays();
    populatePlayerInputs();
    updateRemovePlayerOptions();
    alert(`${newPlayerName} added to the team!`);
}

function removePlayer() {
    const select = document.getElementById('remove-player-select');
    const playerToRemove = select.value;
    
    if (!playerToRemove) {
        alert('Please select a player to remove');
        return;
    }
    
    if (playerToRemove === 'XYZ') {
        alert('Cannot remove XYZ - needed for handicap situations');
        return;
    }
    
    if (confirm(`Remove ${playerToRemove} from the team?`)) {
        const season = getCurrentSeasonData();
        delete season.players[playerToRemove];
        saveData();
        updateAllDisplays();
        populatePlayerInputs();
        updateRemovePlayerOptions();
        alert(`${playerToRemove} removed.`);
    }
}

function updateRemovePlayerOptions() {
    const select = document.getElementById('remove-player-select');
    if (!select) return;

    const season = getCurrentSeasonData();
    const players = season.players
        ? Object.keys(season.players).filter(name => name !== 'XYZ')
        : [];

    if (players.length === 0) {
        select.innerHTML = '<option value="">No players in this season</option>';
    } else {
        select.innerHTML = '<option value="">Select player...</option>' +
            players.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

function populatePlayerInputs() {
    const playersGrid = document.getElementById('players-grid');
    if (!playersGrid) return;
    
    const season = getCurrentSeasonData();
    const players = Object.keys(season.players);
    playersGrid.innerHTML = players.map(playerName => {
        const isHandicap = playerName === 'XYZ';
        return `
            <div class="player-input ${isHandicap ? 'handicap' : ''}">
                <label>${playerName}${isHandicap ? ' (Handicap)' : ''}</label>
                <input type="number" name="${playerName}" placeholder="0" min="0">
            </div>
        `;
    }).join('');
}

// Match form submission
function handleMatchSubmit(e) {
    e.preventDefault();
    
    const matchData = {
        date: document.getElementById('match-date').value,
        opponent: document.getElementById('opponent').value,
        venue: document.getElementById('venue').value,
        wanstrowMatchScore: parseFloat(document.getElementById('wanstrow-match-score').value),
        opponentMatchScore: parseFloat(document.getElementById('opponent-match-score').value),
        wanstrowTotal: parseInt(document.getElementById('wanstrow-total').value),
        opponentTotal: parseInt(document.getElementById('opponent-total').value),
        playerScores: {}
    };

    const playerInputs = document.querySelectorAll('.player-input input');
    let playersWhoPlayed = 0;
    
    playerInputs.forEach(input => {
        const playerName = input.name;
        const score = input.value ? parseInt(input.value) : 0;
        matchData.playerScores[playerName] = score;
        
        if (input.value && parseInt(input.value) > 0) {
            playersWhoPlayed++;
        }
    });

    if (playersWhoPlayed !== 6) {
        alert('Please enter scores for exactly 6 players');
        return;
    }

    processMatch(matchData);
    document.getElementById('match-form').reset();
    alert('Match saved successfully!');
    updateAllDisplays();
}

// Process match
function processMatch(matchData) {
    const season = getCurrentSeasonData();
    season.matches.push(matchData);
    
    const isWin = matchData.wanstrowMatchScore > matchData.opponentMatchScore;
    const isLoss = matchData.wanstrowMatchScore < matchData.opponentMatchScore;
    const isDraw = matchData.wanstrowMatchScore === matchData.opponentMatchScore;
    
    if (isWin) season.teamStats.wins++;
    if (isLoss) season.teamStats.losses++;
    if (isDraw) season.teamStats.draws++;
    
    season.teamStats.gamesPlayed++;
    
    // Calculate points with decimal support
    let totalPoints = 0;
    season.matches.forEach(match => {
        totalPoints += parseFloat(match.wanstrowMatchScore);
    });
    season.teamStats.points = Math.round(totalPoints * 10) / 10;
    
    season.teamStats.totalPins += matchData.wanstrowTotal;
    season.teamStats.averageScore = Math.round((season.teamStats.totalPins / season.teamStats.gamesPlayed) * 10) / 10;
    
    // Update player stats
    Object.keys(matchData.playerScores).forEach(playerName => {
        const score = matchData.playerScores[playerName];
        const player = season.players[playerName];
        
        if (score > 0 && player) {
            player.games++;
            player.totalPins += score;
            player.scores.push(score);
            
            if (score > player.highScore) {
                player.highScore = score;
            }
            
            // Update form - compare last game to previous games
            if (player.scores.length >= 2) {
                const lastScore = player.scores[player.scores.length - 1];
                const previousAvg = player.scores.slice(0, -1).reduce((a, b) => a + b, 0) / (player.scores.length - 1);
                player.form = lastScore > previousAvg ? 'up' : lastScore < previousAvg ? 'down' : 'same';
            } else {
                player.form = 'same';
            }
        }
    });
    
    updateNextFixture();
    saveData();
}

// Update all displays
function updateAllDisplays() {
    updateOverviewTab();
    updatePlayersTab();
    updateHeadToHeadTab();
    updateResultsTab();
    updateHighScorer();
    updateMostImproved();
    updateFixturesList();
    updateSeasonDisplay();
    updateTeamManagementUI();
    updateOpponentOptions();
}

// Rebuild the Add Match opponent dropdown from the saved fixtures
function updateOpponentOptions() {
    const opponentSelect = document.getElementById('opponent');
    if (!opponentSelect) return;

    const season = getCurrentSeasonData();
    const fixtures = season.fixtures || [];
    const opponents = Array.from(new Set(fixtures.map(f => f.opponent).filter(Boolean))).sort();

    const previous = opponentSelect.value;

    if (opponents.length === 0) {
        opponentSelect.innerHTML = '<option value="">No fixtures loaded yet</option>';
        return;
    }

    opponentSelect.innerHTML = '<option value="">Select opponent...</option>' +
        opponents.map(o => `<option value="${o}">${o}</option>`).join('');

    // Keep the current selection if it's still a valid opponent
    if (previous && opponents.includes(previous)) {
        opponentSelect.value = previous;
    }
}

// Update overview
function updateOverviewTab() {
    const season = getCurrentSeasonData();
    document.getElementById('wins-count').textContent = season.teamStats.wins;
    document.getElementById('losses-count').textContent = season.teamStats.losses;
    document.getElementById('draws-count').textContent = season.teamStats.draws;
    
    const points = season.teamStats.points;
    document.getElementById('points-count').textContent = points % 1 === 0 ? points.toString() : points.toFixed(1);
    
    document.getElementById('average-score').textContent = season.teamStats.averageScore || 'TBD';
    
    // Next fixture — worked out fresh from fixtures and results on every load
    updateNextFixture();
    document.getElementById('next-opponent').textContent = season.nextFixture.opponent;
    document.getElementById('next-date').textContent = season.nextFixture.date;
    document.getElementById('next-venue').textContent = season.nextFixture.venue;
    document.getElementById('next-time').textContent = season.nextFixture.time;
    
    // Recent form
    updateRecentForm();
}

// Update high scorer
function updateHighScorer() {
    const season = getCurrentSeasonData();
    const players = Object.keys(season.players);
    let highestPlayer = { name: 'No games yet', totalPins: 0 };
    
    players.forEach(playerName => {
        const player = season.players[playerName];
        if (player.totalPins > highestPlayer.totalPins) {
            highestPlayer = { name: playerName, totalPins: player.totalPins };
        }
    });
    
    document.getElementById('high-scorer').textContent = 
        highestPlayer.totalPins === 0 ? 'No games yet' : `${highestPlayer.name} (${highestPlayer.totalPins})`;
}

// Most Improved: last-3-games average minus the average of all earlier games.
// Needs at least 4 games (3 recent + at least 1 earlier). XYZ is excluded.
function updateMostImproved() {
    const el = document.getElementById('most-improved');
    if (!el) return;

    const season = getCurrentSeasonData();
    const players = season.players || {};
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    let best = null;

    Object.keys(players).sort().forEach(name => {
        if (name === 'XYZ') return;
        const scores = players[name].scores || [];
        if (scores.length < 4) return;

        const delta = avg(scores.slice(-3)) - avg(scores.slice(0, -3));
        if (!best || delta > best.delta) best = { name, delta };
    });

    if (!best) {
        el.textContent = 'Not enough games yet';
    } else if (best.delta <= 0) {
        el.textContent = 'No improvers yet';
    } else {
        el.textContent = `${best.name} (+${best.delta.toFixed(1)})`;
    }
}

// Update recent form
function updateRecentForm() {
    const season = getCurrentSeasonData();
    const formDisplay = document.getElementById('form-display');
    if (!formDisplay) return;
    
    if (season.matches.length === 0) {
        formDisplay.innerHTML = '<p class="no-matches">Season starts soon!</p>';
        return;
    }
    
    const recentMatches = season.matches.slice(-5).reverse();
    const formHtml = recentMatches.map(match => {
        const result = match.wanstrowMatchScore > match.opponentMatchScore ? 'win' : 
                      match.wanstrowMatchScore < match.opponentMatchScore ? 'loss' : 'draw';
        const letter = result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D';
        return `<div class="form-result ${result}">${letter}</div>`;
    }).join('');
    
    formDisplay.innerHTML = formHtml;
}

// Update players tab
function updatePlayersTab() {
    const season = getCurrentSeasonData();
    const container = document.getElementById('players-table-container');
    if (!container) return;

    // Build enriched player array — guard against archive seasons with no players object
    let players = season.players ? Object.keys(season.players).map(name => {
        const player = season.players[name];
        const average = player.games > 0 ? Math.round((player.totalPins / player.games) * 10) / 10 : 0;
        return {
            name,
            games: player.games,
            totalPins: player.totalPins,
            average,
            highScore: player.highScore || 0,
            formArrow: getFormArrow(player.form),
            isHandicap: player.isHandicap || name === 'XYZ'
        };
    }) : [];

    // Apply sort — default is alphabetical with XYZ pinned to bottom
    if (playerSortState.column) {
        players.sort((a, b) => {
            if (a.name === 'XYZ') return 1;
            if (b.name === 'XYZ') return -1;
            let aVal = a[playerSortState.column];
            let bVal = b[playerSortState.column];
            if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
            if (aVal < bVal) return playerSortState.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return playerSortState.direction === 'asc' ? 1 : -1;
            return 0;
        });
    } else {
        players.sort((a, b) => {
            if (a.name === 'XYZ') return 1;
            if (b.name === 'XYZ') return -1;
            return a.name.localeCompare(b.name);
        });
    }

    const cols = [
        { key: 'name',      label: 'Player',     sortable: true  },
        { key: 'games',     label: 'Games',      sortable: true  },
        { key: 'totalPins', label: 'Total Pins', sortable: true  },
        { key: 'average',   label: 'Average',    sortable: true  },
        { key: 'highScore', label: 'High Score', sortable: true  },
        { key: 'form',      label: 'Form',       sortable: false }
    ];

    const headersHtml = cols.map(col => {
        if (!col.sortable) {
            if (col.key === 'form') {
                return `<th>${col.label} <button type="button" class="info-tip" aria-label="What does Form mean?"
                    data-tip="Compares a player's latest game with their average from all their previous games. ↗ above their average, ↘ below it, → level.">i</button></th>`;
            }
            return `<th>${col.label}</th>`;
        }
        const isActive = playerSortState.column === col.key;
        const indicator = isActive
            ? (playerSortState.direction === 'desc' ? ' ↓' : ' ↑')
            : ' <span class="sort-hint">⇅</span>';
        return `<th class="sortable-col${isActive ? ' sort-active' : ''}" onclick="sortPlayerTable('${col.key}')">${col.label}${indicator}</th>`;
    }).join('');

    const rowsHtml = players.map(p => `
        <tr>
            <td>${p.name}${p.isHandicap ? ' <span style="color:#ef4444;font-size:0.75rem;">(H)</span>' : ''}</td>
            <td>${p.games}</td>
            <td>${p.totalPins}</td>
            <td>${p.average || 'TBD'}</td>
            <td>${p.highScore || '-'}</td>
            <td>${p.formArrow}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table class="stats-table">
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;

    updatePlayerFormCharts();
}

function sortPlayerTable(column) {
    if (playerSortState.column === column) {
        if (playerSortState.direction === 'desc') {
            playerSortState.direction = 'asc';
        } else {
            playerSortState = { column: null, direction: 'desc' }; // third click resets
        }
    } else {
        playerSortState = { column, direction: 'desc' };
    }
    updatePlayersTab();
}

// Update player form charts
function updatePlayerFormCharts() {
    const season = getCurrentSeasonData();
    const chartsContainer = document.getElementById('player-form-charts');
    if (!chartsContainer) return;
    
    const players = Object.keys(season.players)
        .filter(name => season.players[name].scores.length >= 3)
        .map(name => ({ name, ...season.players[name] }))
        .sort((a, b) => {
            const avgA = a.games > 0 ? a.totalPins / a.games : 0;
            const avgB = b.games > 0 ? b.totalPins / b.games : 0;
            if (avgB !== avgA) return avgB - avgA;
            return a.name.localeCompare(b.name);
        });
    
    if (players.length === 0) {
        chartsContainer.innerHTML = '<p class="no-matches">Need at least 3 games for form trends!</p>';
        return;
    }
    
    const html = players.map(player => {
        const recentScores = player.scores.slice(-8);
        const maxScore = Math.max(...recentScores);
        
        const bars = recentScores.map(score => {
            const height = (score / maxScore) * 100;
            return `<div class="form-bar" style="height: ${height}%" data-score="${score}"></div>`;
        }).join('');
        
        const avg = Math.round((player.totalPins / player.games) * 10) / 10;
        
        return `
            <div style="margin-bottom: 2rem;">
                <h4>${player.name} - Avg: ${avg}</h4>
                <div class="form-chart">${bars}</div>
            </div>
        `;
    }).join('');
    
    chartsContainer.innerHTML = html;
}

function getFormArrow(form) {
    if (!form || form === 'same') return '→';
    return form === 'up' ? '↗' : '↘';
}

// Update head-to-head tab
function updateHeadToHeadTab() {
    const season = getCurrentSeasonData();
    const h2hGrid = document.getElementById('h2h-grid');
    if (!h2hGrid) return;
    
    if (season.matches.length === 0) {
        h2hGrid.innerHTML = '<p class="no-matches">No matches played yet!</p>';
        return;
    }
    
    // Calculate head-to-head records
    const h2hRecords = {};
    
    season.matches.forEach(match => {
        if (!h2hRecords[match.opponent]) {
            h2hRecords[match.opponent] = { wins: 0, losses: 0, draws: 0, totalFor: 0, totalAgainst: 0 };
        }
        
        const record = h2hRecords[match.opponent];
        
        if (match.wanstrowMatchScore > match.opponentMatchScore) {
            record.wins++;
        } else if (match.wanstrowMatchScore < match.opponentMatchScore) {
            record.losses++;
        } else {
            record.draws++;
        }
        
        record.totalFor += match.wanstrowMatchScore;
        record.totalAgainst += match.opponentMatchScore;
    });
    
    const html = Object.keys(h2hRecords).sort().map(opponent => {
        const record = h2hRecords[opponent];
        const total = record.wins + record.losses + record.draws;
        
        return `
            <div class="h2h-card">
                <div class="h2h-opponent">${opponent}</div>
                <div class="h2h-record">
                    <div class="h2h-stat h2h-wins">
                        <strong>${record.wins}</strong><br>Wins
                    </div>
                    <div class="h2h-stat h2h-draws">
                        <strong>${record.draws}</strong><br>Draws
                    </div>
                    <div class="h2h-stat h2h-losses">
                        <strong>${record.losses}</strong><br>Losses
                    </div>
                </div>
                <div style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem;">
                    Total: ${record.totalFor} - ${record.totalAgainst} over ${total} games
                </div>
            </div>
        `;
    }).join('');
    
    h2hGrid.innerHTML = html;
}

// Update results tab
function updateResultsTab() {
    const season = getCurrentSeasonData();
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    
    if (season.matches.length === 0) {
        resultsList.innerHTML = '<p class="no-matches">No matches played yet!</p>';
        return;
    }
    
    const resultsHtml = season.matches.slice().reverse().map((match, reverseIndex) => {
        const realIndex = season.matches.length - 1 - reverseIndex;
        const result = match.wanstrowMatchScore > match.opponentMatchScore ? 'win' : 
                      match.wanstrowMatchScore < match.opponentMatchScore ? 'loss' : 'draw';
        const letter = result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D';
        const date = new Date(match.date).toLocaleDateString('en-GB');
        
        return `
            <div class="result-item clickable" onclick="showMatchDetail(${realIndex})" role="button" tabindex="0">
                <div class="result-info">
                    <div class="result-badge ${result}">${letter}</div>
                    <div class="result-details">
                        <div class="result-score">Wanstrow ${match.wanstrowMatchScore}-${match.opponentMatchScore} ${match.opponent} (Pins: ${match.wanstrowTotal}-${match.opponentTotal})</div>
                        <div class="result-date">${date} • ${match.venue}</div>
                    </div>
                    <div class="result-chevron">›</div>
                </div>
            </div>
        `;
    }).join('');
    
    resultsList.innerHTML = resultsHtml;
}

// Show the player scores for a single match
function showMatchDetail(matchIndex) {
    const season = getCurrentSeasonData();
    const match = season.matches[matchIndex];
    if (!match) return;

    const modal = document.getElementById('match-detail-modal');
    const title = document.getElementById('match-detail-title');
    const body = document.getElementById('match-detail-body');
    if (!modal || !title || !body) return;

    const date = new Date(match.date).toLocaleDateString('en-GB');
    title.textContent = `Wanstrow ${match.wanstrowMatchScore}-${match.opponentMatchScore} ${match.opponent}`;

    const scores = match.playerScores || {};
    // Only players who actually played (score above zero), highest first
    const played = Object.keys(scores)
        .filter(name => scores[name] > 0)
        .sort((a, b) => scores[b] - scores[a]);

    const rowsHtml = played.length === 0
        ? '<p class="no-matches">No player scores recorded for this match.</p>'
        : played.map(name => `
            <div class="match-detail-row${name === 'XYZ' ? ' handicap' : ''}">
                <span class="match-detail-name">${name}${name === 'XYZ' ? ' (Handicap)' : ''}</span>
                <span class="match-detail-score">${scores[name]}</span>
            </div>
        `).join('');

    body.innerHTML = `
        <p class="match-detail-meta">${date} • ${match.venue} • Pins ${match.wanstrowTotal}-${match.opponentTotal}</p>
        <div class="match-detail-scores">${rowsHtml}</div>
    `;

    modal.classList.add('show');
}

function hideMatchDetail() {
    const modal = document.getElementById('match-detail-modal');
    if (modal) modal.classList.remove('show');
}

// Update fixtures list - show ALL remaining fixtures (not just 8)
function updateFixturesList() {
    const season = getCurrentSeasonData();
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;
    
    if (!season.fixtures || season.fixtures.length === 0) {
        fixturesList.innerHTML = '<p class="no-matches">No fixtures loaded. Upload via Admin tab!</p>';
        return;
    }

    // Every fixture without a result, whatever its date — so postponed games stay listed
    const upcomingFixtures = getUnplayedFixtures(season);

    if (upcomingFixtures.length === 0) {
        fixturesList.innerHTML = '<p class="no-matches">Season complete!</p>';
        return;
    }

    const todayKey = localDateKey(new Date());
    const fixturesHtml = upcomingFixtures.map(fixture => {
        const venueClass = fixture.venue === 'Home' ? 'home' : 'away';
        const timeClass = fixture.time === 'Early' ? 'time-early' : 'time-late';
        const overdue = fixture.date < todayKey
            ? '<span class="fixture-overdue">Awaiting result</span>' : '';
        return `
            <div class="fixture-item ${venueClass}">
                <div class="fixture-info">
                    <strong>${fixture.displayDate}</strong> vs ${fixture.opponent}${overdue}
                </div>
                <div class="fixture-meta">
                    <div class="fixture-venue ${venueClass.toLowerCase()}">${fixture.venue}</div>
                    <div class="fixture-time ${timeClass}">${fixture.time}</div>
                </div>
            </div>
        `;
    }).join('');
    
    fixturesList.innerHTML = fixturesHtml;
}

// "YYYY-MM-DD" for a date in the viewer's local time, to compare with fixture.date
function localDateKey(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// A fixture counts as played once a result exists for the same opponent at the
// same venue, whatever date the result was entered with. Fixtures and results are
// paired in date order, one result per fixture. A second pass pairs any leftover
// results by opponent only, in case the venue in the fixture list differs.
function getUnplayedFixtures(season) {
    const norm = s => String(s || '').trim().toLowerCase();
    const fixtures = (season.fixtures || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const matches = (season.matches || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const usedMatch = new Array(matches.length).fill(false);
    const played = new Array(fixtures.length).fill(false);

    // Pass 1: opponent + venue
    fixtures.forEach((f, i) => {
        const m = matches.findIndex((match, j) =>
            !usedMatch[j] && norm(match.opponent) === norm(f.opponent) && norm(match.venue) === norm(f.venue));
        if (m !== -1) { usedMatch[m] = true; played[i] = true; }
    });

    // Pass 2: opponent only, for any results still unpaired
    fixtures.forEach((f, i) => {
        if (played[i]) return;
        const m = matches.findIndex((match, j) => !usedMatch[j] && norm(match.opponent) === norm(f.opponent));
        if (m !== -1) { usedMatch[m] = true; played[i] = true; }
    });

    return fixtures.filter((f, i) => !played[i]);
}

// Next fixture = the earliest fixture without a result
function updateNextFixture() {
    const season = getCurrentSeasonData();
    const next = getUnplayedFixtures(season)[0];

    season.nextFixture = next
        ? { opponent: next.opponent, date: next.displayDate, venue: next.venue, time: next.time || 'TBD' }
        : { opponent: 'TBD', date: 'TBD', venue: 'TBD', time: 'TBD' };
}

// Update season display
function updateSeasonDisplay() {
    document.getElementById('current-season').textContent = dashboardData.currentSeason.replace('-', '/');
}

// Team management UI updates
function updateTeamManagementUI() {
    updateSquadDisplay();
    updateRemovePlayerOptions();
}

function updateSquadDisplay() {
    const squadDisplay = document.getElementById('squad-display');
    const squadCount = document.getElementById('squad-count');
    
    if (!squadDisplay || !squadCount) return;
    
    const season = getCurrentSeasonData();
    const players = Object.keys(season.players).sort((a, b) => {
        if (a === 'XYZ') return 1;
        if (b === 'XYZ') return -1;
        return a.localeCompare(b);
    });
    squadCount.textContent = players.length;
    
    squadDisplay.innerHTML = players.map(playerName => {
        const player = season.players[playerName];
        const isHandicap = player.isHandicap || playerName === 'XYZ';
        
        return `
            <div class="squad-member ${isHandicap ? 'handicap' : 'regular'}">
                ${playerName}
                ${isHandicap ? '<div style="font-size: 0.75rem;">(Handicap)</div>' : ''}
            </div>
        `;
    }).join('');
}
