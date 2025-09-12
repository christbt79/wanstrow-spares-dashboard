// Dashboard Data Storage
let dashboardData = {
    teamStats: {
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        gamesPlayed: 0,
        totalPins: 0,
        averageScore: 0
    },
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
    nextFixture: {
        opponent: 'Dangerous Damsels',
        date: '10/09/2025',
        venue: 'Home'
    },
    fixtures: [
        { date: "2025-09-02", displayDate: "02/09/2025", opponent: "Barrow Boys", venue: "Away" },
        { date: "2025-09-10", displayDate: "10/09/2025", opponent: "Dangerous Damsels", venue: "Home" },
        { date: "2025-09-17", displayDate: "17/09/2025", opponent: "King Pins", venue: "Away" },
        { date: "2025-09-25", displayDate: "25/09/2025", opponent: "Three Horseshoes", venue: "Home" },
        { date: "2025-10-01", displayDate: "01/10/2025", opponent: "Balls Deep", venue: "Away" },
        { date: "2025-10-08", displayDate: "08/10/2025", opponent: "The Tossers", venue: "Home" },
        { date: "2025-10-16", displayDate: "16/10/2025", opponent: "Double Ds", venue: "Away" },
        { date: "2025-10-20", displayDate: "20/10/2025", opponent: "Bridge Hill Mob", venue: "Home" },
        { date: "2025-10-30", displayDate: "30/10/2025", opponent: "Deep in Cider", venue: "Away" },
        { date: "2025-11-07", displayDate: "07/11/2025", opponent: "All 3 Holes", venue: "Home" },
        { date: "2025-11-14", displayDate: "14/11/2025", opponent: "Allsorts", venue: "Away" },
        { date: "2025-11-18", displayDate: "18/11/2025", opponent: "Lionhearts", venue: "Home" },
        { date: "2025-11-24", displayDate: "24/11/2025", opponent: "The Persuaders", venue: "Away" },
        { date: "2025-12-03", displayDate: "03/12/2025", opponent: "Horseshoe Belles", venue: "Away" },
        { date: "2025-12-12", displayDate: "12/12/2025", opponent: "Pin Pounders", venue: "Home" },
        { date: "2025-12-16", displayDate: "16/12/2025", opponent: "Ligs", venue: "Away" },
        { date: "2026-01-09", displayDate: "09/01/2026", opponent: "Daleks", venue: "Home" },
        { date: "2026-01-13", displayDate: "13/01/2026", opponent: "Barrow Boys", venue: "Home" },
        { date: "2026-01-22", displayDate: "22/01/2026", opponent: "Dangerous Damsels", venue: "Away" },
        { date: "2026-01-28", displayDate: "28/01/2026", opponent: "King Pins", venue: "Home" },
        { date: "2026-02-05", displayDate: "05/02/2026", opponent: "Three Horseshoes", venue: "Away" },
        { date: "2026-02-11", displayDate: "11/02/2026", opponent: "Balls Deep", venue: "Home" },
        { date: "2026-02-18", displayDate: "18/02/2026", opponent: "The Tossers", venue: "Away" },
        { date: "2026-02-26", displayDate: "26/02/2026", opponent: "Double Ds", venue: "Home" },
        { date: "2026-03-02", displayDate: "02/03/2026", opponent: "Bridge Hill Mob", venue: "Away" },
        { date: "2026-03-12", displayDate: "12/03/2026", opponent: "Deep in Cider", venue: "Home" },
        { date: "2026-03-20", displayDate: "20/03/2026", opponent: "All 3 Holes", venue: "Away" },
        { date: "2026-03-27", displayDate: "27/03/2026", opponent: "Allsorts", venue: "Home" },
        { date: "2026-03-31", displayDate: "31/03/2026", opponent: "Lionhearts", venue: "Away" },
        { date: "2026-04-06", displayDate: "06/04/2026", opponent: "The Persuaders", venue: "Home" },
        { date: "2026-04-15", displayDate: "15/04/2026", opponent: "Horseshoe Belles", venue: "Home" },
        { date: "2026-04-24", displayDate: "24/04/2026", opponent: "Pin Pounders", venue: "Away" },
        { date: "2026-04-28", displayDate: "28/04/2026", opponent: "Ligs", venue: "Home" },
        { date: "2026-05-08", displayDate: "08/05/2026", opponent: "Daleks", venue: "Away" }
    ]
};

// Admin settings
const ADMIN_PASSWORD = 'WanstrowSpares2025';
let isAdmin = false;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    const sharedDataLoaded = await loadData();
    setupEventListeners();
    updateDisplay();
    updateNextFixture();
    
    // If shared data was loaded, force a display update after a short delay
    if (sharedDataLoaded) {
        setTimeout(() => {
            updateDisplay();
        }, 100);
    }
});

// Load data from localStorage AND from shared data file
async function loadData() {
    try {
        // First try to load from shared data file (GitHub Pages)
        const response = await fetch('./data/matches.json');
        if (response.ok) {
            const sharedData = await response.json();
            dashboardData = { ...dashboardData, ...sharedData };
            console.log('Loaded shared data successfully');
        }
    } catch (error) {
        console.log('No shared data found, loading from localStorage');
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('wanstrowSparesData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            dashboardData = { ...dashboardData, ...parsed };
        }
    }
}

// Save data to localStorage AND generate instructions for shared update
function saveData() {
    localStorage.setItem('wanstrowSparesData', JSON.stringify(dashboardData));
    
    // Generate the JSON that needs to be committed to GitHub
    generateSharedDataFile();
}

// Generate shared data file content for GitHub
function generateSharedDataFile() {
    const dataToShare = JSON.stringify(dashboardData, null, 2);
    
    console.log('=== SHARED DATA UPDATE REQUIRED ===');
    console.log('Copy the following JSON content and save it as data/matches.json in your GitHub repository:');
    console.log('');
    console.log(dataToShare);
    console.log('');
    console.log('=== END OF DATA ===');
    
    // Also show alert to user
    if (isAdmin) {
        setTimeout(() => {
            alert('Match saved! To share with others:\n\n1. Create a "data" folder in your GitHub repo\n2. Create "matches.json" file in that folder\n3. Copy the JSON from browser console\n4. Commit and push to GitHub\n\nCheck browser console (F12) for the exact JSON to copy.');
        }, 500);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Admin login
    document.querySelector('.admin-login-btn').addEventListener('click', showAdminLogin);
    document.getElementById('login-btn').addEventListener('click', handleAdminLogin);
    document.getElementById('cancel-btn').addEventListener('click', hideAdminLogin);
    
    // Match form
    const matchForm = document.getElementById('match-form');
    if (matchForm) {
        matchForm.addEventListener('submit', handleMatchSubmit);
    }
    
    // Opponent selection updates labels
    const opponentSelect = document.getElementById('opponent');
    if (opponentSelect) {
        opponentSelect.addEventListener('change', function() {
            const opponentLabel = document.getElementById('opponent-match-label');
            const totalLabel = document.getElementById('opponent-total-label');
            if (opponentLabel) opponentLabel.textContent = this.value || 'Opponent';
            if (totalLabel) totalLabel.textContent = this.value || 'Opponent';
        });
    }

    // Team management
    const addPlayerBtn = document.getElementById('add-player-btn');
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', addPlayer);
    }

    const removePlayerBtn = document.getElementById('remove-player-btn');
    if (removePlayerBtn) {
        removePlayerBtn.addEventListener('click', removePlayer);
    }

    // Admin password on Enter key
    const adminPasswordInput = document.getElementById('admin-password');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAdminLogin();
            }
        });
    }
}

// Tab switching
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
}

// Admin login functions
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
        updateAdminUI();
        updateTeamManagementUI();
        alert('Admin access granted!');
    } else {
        alert('Incorrect password!');
    }
}

function updateAdminUI() {
    if (isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelector('.admin-login-btn').style.display = 'none';
        
        // Populate player inputs in match form
        populatePlayerInputs();
    }
}

// Team management functions
function updateTeamManagementUI() {
    updateSquadDisplay();
    updateRemovePlayerOptions();
}

function addPlayer() {
    const nameInput = document.getElementById('new-player-name');
    const newPlayerName = nameInput.value.trim();
    
    if (!newPlayerName) {
        alert('Please enter a player name');
        return;
    }
    
    if (dashboardData.players[newPlayerName]) {
        alert('Player already exists');
        return;
    }
    
    // Add new player
    dashboardData.players[newPlayerName] = {
        games: 0,
        totalPins: 0,
        highScore: 0,
        scores: [],
        form: []
    };
    
    nameInput.value = '';
    saveData();
    updateDisplay();
    updateTeamManagementUI();
    populatePlayerInputs();
    
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
        alert('Cannot remove XYZ - this is needed for handicap situations');
        return;
    }
    
    if (confirm(`Are you sure you want to remove ${playerToRemove} from the team?`)) {
        delete dashboardData.players[playerToRemove];
        saveData();
        updateDisplay();
        updateTeamManagementUI();
        populatePlayerInputs();
        alert(`${playerToRemove} removed from the team.`);
    }
}

function updateSquadDisplay() {
    const squadDisplay = document.getElementById('squad-display');
    const squadCount = document.getElementById('squad-count');
    
    if (!squadDisplay || !squadCount) return;
    
    const players = Object.keys(dashboardData.players);
    squadCount.textContent = players.length;
    
    squadDisplay.innerHTML = players.map(playerName => {
        const player = dashboardData.players[playerName];
        const isHandicap = player.isHandicap || playerName === 'XYZ';
        
        return `
            <div class="squad-member ${isHandicap ? 'handicap' : 'regular'}">
                ${playerName}
                ${isHandicap ? '<div style="font-size: 0.75rem;">(Handicap)</div>' : ''}
            </div>
        `;
    }).join('');
}

function updateRemovePlayerOptions() {
    const select = document.getElementById('remove-player-select');
    if (!select) return;
    
    const players = Object.keys(dashboardData.players).filter(name => name !== 'XYZ');
    select.innerHTML = '<option value="">Select player to remove...</option>' +
        players.map(player => `<option value="${player}">${player}</option>`).join('');
}

function populatePlayerInputs() {
    const playersGrid = document.getElementById('players-grid');
    if (!playersGrid) return;
    
    const players = Object.keys(dashboardData.players);
    playersGrid.innerHTML = players.map(playerName => {
        const isHandicap = playerName === 'XYZ';
        return `
            <div class="player-input ${isHandicap ? 'handicap' : ''}">
                <label>${playerName}${isHandicap ? ' (Handicap Player)' : ''}</label>
                <input type="number" name="${playerName}" placeholder="0" min="0">
            </div>
        `;
    }).join('');
}

// Match form submission
function handleMatchSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const matchData = {
        date: document.getElementById('match-date').value,
        opponent: document.getElementById('opponent').value,
        venue: document.getElementById('venue').value,
        wanstrowMatchScore: parseInt(document.getElementById('wanstrow-match-score').value),
        opponentMatchScore: parseInt(document.getElementById('opponent-match-score').value),
        wanstrowTotal: parseInt(document.getElementById('wanstrow-total').value),
        opponentTotal: parseInt(document.getElementById('opponent-total').value),
        playerScores: {}
    };

    // Get player scores
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

    // Validate exactly 6 players played
    if (playersWhoPlayed !== 6) {
        alert('Please enter scores for exactly 6 players who played. Leave others blank or as 0.');
        return;
    }

    // Process match
    processMatch(matchData);
    
    // Reset form
    document.getElementById('match-form').reset();
    alert('Match result saved successfully!');
    
    // Update display
    updateDisplay();
}

// Process match data and update statistics
function processMatch(matchData) {
    // Add to matches array
    dashboardData.matches.push(matchData);
    
    // Update team stats using CORRECT skittles scoring
    const isWin = matchData.wanstrowMatchScore > matchData.opponentMatchScore;
    const isLoss = matchData.wanstrowMatchScore < matchData.opponentMatchScore;
    const isDraw = matchData.wanstrowMatchScore === matchData.opponentMatchScore;
    
    if (isWin) dashboardData.teamStats.wins++;
    if (isLoss) dashboardData.teamStats.losses++;
    if (isDraw) dashboardData.teamStats.draws++;
    
    dashboardData.teamStats.gamesPlayed++;
    
    // FIXED: Use correct skittles scoring - points = legs won (including decimals)
    // Calculate total points from all matches using parseFloat to handle decimals
    let totalPoints = 0;
    dashboardData.matches.forEach(match => {
        totalPoints += parseFloat(match.wanstrowMatchScore); // Ensure decimal handling
    });
    dashboardData.teamStats.points = Math.round(totalPoints * 10) / 10; // Round to 1 decimal place
    
    dashboardData.teamStats.totalPins += matchData.wanstrowTotal;
    dashboardData.teamStats.averageScore = Math.round((dashboardData.teamStats.totalPins / dashboardData.teamStats.gamesPlayed) * 10) / 10;
    
    // Update player stats
    Object.keys(matchData.playerScores).forEach(playerName => {
        const score = matchData.playerScores[playerName];
        const player = dashboardData.players[playerName];
        
        if (score > 0 && player) { // Only count if they played and player exists
            player.games++;
            player.totalPins += score;
            player.scores.push(score);
            
            if (score > player.highScore) {
                player.highScore = score;
            }
            
            // Update form (simple trend based on recent performance)
            if (player.scores.length > 1) {
                const recentAvg = player.scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, player.scores.length);
                const overallAvg = player.totalPins / player.games;
                player.form = recentAvg > overallAvg ? 'up' : recentAvg < overallAvg ? 'down' : 'same';
            }
        }
    });
    
    // Update next fixture
    updateNextFixture();
    
    // Save data
    saveData();
}

// Update all display elements
function updateDisplay() {
    updateOverviewTab();
    updatePlayersTab();
    updateResultsTab();
    updateHighScorer();
    updateFixturesList();
}

// Update overview tab
function updateOverviewTab() {
    document.getElementById('wins-count').textContent = dashboardData.teamStats.wins;
    document.getElementById('losses-count').textContent = dashboardData.teamStats.losses;
    document.getElementById('draws-count').textContent = dashboardData.teamStats.draws;
    
    // Format points to show decimals if needed
    const points = dashboardData.teamStats.points;
    document.getElementById('points-count').textContent = points % 1 === 0 ? points.toString() : points.toFixed(1);
    
    document.getElementById('average-score').textContent = dashboardData.teamStats.averageScore || 'TBD';
    
    // Next fixture
    document.getElementById('next-opponent').textContent = dashboardData.nextFixture.opponent;
    document.getElementById('next-date').textContent = dashboardData.nextFixture.date;
    document.getElementById('next-venue').textContent = dashboardData.nextFixture.venue;
    
    // Recent form
    updateRecentForm();
}

// Update high scorer in header
function updateHighScorer() {
    const highScorerElement = document.getElementById('high-scorer');
    if (!highScorerElement) return;
    
    const players = Object.keys(dashboardData.players);
    let highestPlayer = { name: 'No games yet', totalPins: 0 };
    
    players.forEach(playerName => {
        const player = dashboardData.players[playerName];
        if (player.totalPins > highestPlayer.totalPins) {
            highestPlayer = { name: playerName, totalPins: player.totalPins };
        }
    });
    
    if (highestPlayer.totalPins === 0) {
        highScorerElement.textContent = 'No games yet';
    } else {
        highScorerElement.textContent = `${highestPlayer.name} (${highestPlayer.totalPins})`;
    }
}

// Update recent form display
function updateRecentForm() {
    const formDisplay = document.getElementById('form-display');
    if (!formDisplay) return;
    
    if (dashboardData.matches.length === 0) {
        formDisplay.innerHTML = '<p class="no-matches">Season starts soon - form will show here after matches!</p>';
        return;
    }
    
    const recentMatches = dashboardData.matches.slice(-5).reverse();
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
    const playersTable = document.getElementById('players-table');
    if (!playersTable) return;
    
    const playerNames = Object.keys(dashboardData.players);
    
    const playersHtml = playerNames.map(name => {
        const player = dashboardData.players[name];
        const average = player.games > 0 ? Math.round((player.totalPins / player.games) * 10) / 10 : 0;
        const formArrow = getFormArrow(player.form);
        const isHandicap = player.isHandicap || name === 'XYZ';
        
        return `
            <tr>
                <td>${name}${isHandicap ? ' <span style="color: #ef4444; font-size: 0.75rem;">(Handicap)</span>' : ''}</td>
                <td>${player.games}</td>
                <td>${player.totalPins}</td>
                <td>${average || 'TBD'}</td>
                <td>${player.highScore || '-'}</td>
                <td>${formArrow}</td>
            </tr>
        `;
    }).join('');
    
    playersTable.innerHTML = playersHtml;
}

// Get form arrow based on recent performance
function getFormArrow(form) {
    if (!form || form === 'same') return '→';
    return form === 'up' ? '↗' : '↘';
}

// Update results tab
function updateResultsTab() {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    
    if (dashboardData.matches.length === 0) {
        resultsList.innerHTML = '<p class="no-matches">No matches played yet - results will appear here!</p>';
        return;
    }
    
    const resultsHtml = dashboardData.matches.slice().reverse().map(match => {
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
                        <div class="result-date">${date}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    resultsList.innerHTML = resultsHtml;
}

// Update fixtures list
function updateFixturesList() {
    const fixturesList = document.getElementById('fixtures-list');
    if (!fixturesList) return;
    
    const today = new Date();
    const upcomingFixtures = dashboardData.fixtures.filter(fixture => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate >= today;
    }).slice(0, 8);
    
    if (upcomingFixtures.length === 0) {
        fixturesList.innerHTML = '<p class="no-matches">Season complete!</p>';
        return;
    }
    
    const fixturesHtml = upcomingFixtures.map(fixture => {
        const venueClass = fixture.venue === 'Home' ? 'home' : 'away';
        return `
            <div class="fixture-item ${venueClass}">
                <div>
                    <strong>${fixture.displayDate}</strong> vs ${fixture.opponent}
                </div>
                <div class="fixture-venue ${venueClass.toLowerCase()}">${fixture.venue}</div>
            </div>
        `;
    }).join('');
    
    fixturesList.innerHTML = fixturesHtml;
}

// Update next fixture based on current date
function updateNextFixture() {
    const today = new Date();
    const nextFixture = dashboardData.fixtures.find(fixture => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate >= today;
    });
    
    if (nextFixture) {
        dashboardData.nextFixture = {
            opponent: nextFixture.opponent,
            date: nextFixture.displayDate,
            venue: nextFixture.venue
        };
    }
}

// Initialize display on page load
function initializeDisplay() {
    updateDisplay();
    updateTeamManagementUI();
    if (isAdmin) {
        populatePlayerInputs();
    }
}
