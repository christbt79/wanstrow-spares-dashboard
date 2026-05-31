// Enhanced Dashboard Data Structure
let dashboardData = {
    currentSeason: '2026-27',
    seasons: {
        '2026-27': {
            teamStats: { wins: 0, losses: 0, draws: 0, points: 0, gamesPlayed: 0, totalPins: 0, averageScore: 0 },
            players: {
                Christian: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Keith: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Helen: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Martin: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Paddy: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Steve: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Adrian: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Jason: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Linda: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
                Margaret: { games: 0, totalPins: 0, highScore: 0, scores: [], form: [] },
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


    await loadData();
    setupEventListeners();
    updateAllDisplays();
    updateSeasonSelector();
    switchTab('overview');
});

// Load data
async function loadData() {
    try {
        const currentSeason = dashboardData.currentSeason;
        const response = await fetch(`./data/${currentSeason}.json`);
        if (response.ok) {
            const seasonData = await response.json();
            if (!dashboardData.seasons[currentSeason]) {
                dashboardData.seasons[currentSeason] = seasonData;
            } else {
                dashboardData.seasons[currentSeason] = { ...dashboardData.seasons[currentSeason], ...seasonData };
            }
            console.log('Loaded season data from GitHub');
            return true;
        }
    } catch (error) {
        console.log('Loading from localStorage');
        const saved = localStorage.getItem('wanstrowDashboard');
        if (saved) {
            const parsed = JSON.parse(saved);
            dashboardData = { ...dashboardData, ...parsed };
        }
    }
    return false;
}

// Save data
function saveData() {
    localStorage.setItem('wanstrowDashboard', JSON.stringify(dashboardData));
    generateSharedDataFile();
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
            const response = await fetch(`./data/${selectedSeason}.json`);
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
    saveData();
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

    // Update opponent dropdown
    const opponentSelect = document.getElementById('opponent');
    if (opponentSelect) {
        opponentSelect.innerHTML = '<option value="">Select opponent...</option>' +
            Array.from(uniqueOpponents).sort().map(o => `<option value="${o}">${o}</option>`).join('');
    }

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
    updateFixturesList();
    updateSeasonDisplay();
    updateTeamManagementUI();
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
    
    // Next fixture
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

    // Build enriched player array
    let players = Object.keys(season.players).map(name => {
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
    });

    // Apply sort if one is active
    if (playerSortState.column) {
        players.sort((a, b) => {
            let aVal = a[playerSortState.column];
            let bVal = b[playerSortState.column];
            if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
            if (aVal < bVal) return playerSortState.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return playerSortState.direction === 'asc' ? 1 : -1;
            return 0;
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
        if (!col.sortable) return `<th>${col.label}</th>`;
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
        .map(name => ({ name, ...season.players[name] }));
    
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
    
    const resultsHtml = season.matches.slice().reverse().map(match => {
        const result = match.wanstrowMatchScore > match.opponentMatchScore ? 'win' : 
                      match.wanstrowMatchScore < match.opponentMatchScore ? 'loss' : 'draw';
        const letter = result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D';
        const date = new Date(match.date).toLocaleDateString('en-GB');
        
        return `
            <div class="result-item">
                <div class="result-info">
                    <div class="result-badge ${result}">${letter}</div>
                    <div class="result-details">
                        <div class="result-score">Wanstrow ${match.wanstrowMatchScore}-${match.opponentMatchScore} ${match.opponent} (Pins: ${match.wanstrowTotal}-${match.opponentTotal})</div>
                        <div class="result-date">${date} • ${match.venue}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    resultsList.innerHTML = resultsHtml;
}

// Update fixtures list - show ALL remaining fixtures (not just 8)
function updateFixturesList() {
    const season = getCurrentSeasonData();
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;
    
    if (season.fixtures.length === 0) {
        fixturesList.innerHTML = '<p class="no-matches">No fixtures loaded. Upload via Admin tab!</p>';
        return;
    }
    
    const today = new Date();
    const upcomingFixtures = season.fixtures.filter(fixture => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate >= today;
    }); // Show ALL remaining fixtures
    
    if (upcomingFixtures.length === 0) {
        fixturesList.innerHTML = '<p class="no-matches">Season complete!</p>';
        return;
    }
    
    const fixturesHtml = upcomingFixtures.map(fixture => {
        const venueClass = fixture.venue === 'Home' ? 'home' : 'away';
        const timeClass = fixture.time === 'Early' ? 'time-early' : 'time-late';
        return `
            <div class="fixture-item ${venueClass}">
                <div class="fixture-info">
                    <strong>${fixture.displayDate}</strong> vs ${fixture.opponent}
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

// Update next fixture
function updateNextFixture() {
    const season = getCurrentSeasonData();
    const today = new Date();
    const nextFixture = season.fixtures.find(fixture => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate >= today;
    });
    
    if (nextFixture) {
        season.nextFixture = {
            opponent: nextFixture.opponent,
            date: nextFixture.displayDate,
            venue: nextFixture.venue,
            time: nextFixture.time || 'TBD'
        };
    }
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
    const players = Object.keys(season.players);
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
