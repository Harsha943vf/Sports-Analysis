// player_stats.js
document.addEventListener('DOMContentLoaded', async function() {
    const teamPlayerForm = document.getElementById('teamPlayerForm');
    const venuePlayerForm = document.getElementById('venuePlayerForm');
    const bestPlayersForm = document.getElementById('bestPlayersForm');

    try {
        // Fetch teams for dropdowns
        const response = await fetch('/api/teams');
        const data = await response.json();
        if (data.status !== 'success' || !data.teams) {
            throw new Error('Failed to fetch teams');
        }
        const teams = data.teams;
        
        // Initialize best players form
        if (bestPlayersForm) {
            const teamSelect = document.getElementById('teamAnalysis');
            if (teamSelect) {
                // Clear existing options
                teamSelect.innerHTML = '<option value="" selected disabled>Choose a team...</option>';
                
                // Add team options
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team;
                    option.textContent = team;
                    teamSelect.appendChild(option);
                });
            }
            bestPlayersForm.addEventListener('submit', handleBestPlayersForm);
        }

        // Initialize other forms if they exist
        if (teamPlayerForm) {
            populateTeamSelect(teams);
            teamPlayerForm.addEventListener('submit', handleTeamPlayerForm);
        }

        if (venuePlayerForm) {
            const team1Select = document.getElementById('team1');
            const team2Select = document.getElementById('team2');
            const venueSelect = document.getElementById('venue');
            const selectedTeamSelect = document.getElementById('selectedTeam');

            if (team1Select && team2Select) {
                populateSelect(team1Select, teams, 'Choose first team...');
                populateSelect(team2Select, teams, 'Choose second team...');
            }

            // Event listeners for team selection
            team1Select.addEventListener('change', async () => {
                const team1 = team1Select.value;
                const team2 = team2Select.value;
                if (team1 && team2) {
                    try {
                        const response = await fetch(`/get_common_venues?team1=${team1}&team2=${team2}`);
                        const data = await response.json();
                        if (data.status === 'success') {
                            populateSelect(venueSelect, data.venues, 'Choose venue...');
                            venueSelect.disabled = false;
                        }
                    } catch (error) {
                        console.error('Error fetching venues:', error);
                    }
                }
            });

            team2Select.addEventListener('change', async () => {
                const team1 = team1Select.value;
                const team2 = team2Select.value;
                if (team1 && team2) {
                    try {
                        const response = await fetch(`/get_common_venues?team1=${team1}&team2=${team2}`);
                        const data = await response.json();
                        if (data.status === 'success') {
                            populateSelect(venueSelect, data.venues, 'Choose venue...');
                            venueSelect.disabled = false;
                        }
                    } catch (error) {
                        console.error('Error fetching venues:', error);
                    }
                }
            });

            // Update selected team options when teams are selected
            const updateSelectedTeamOptions = () => {
                const team1 = team1Select.value;
                const team2 = team2Select.value;
                if (team1 && team2) {
                    const teams = [team1, team2];
                    populateSelect(selectedTeamSelect, teams, 'Select team to predict...');
                    selectedTeamSelect.disabled = false;
                } else {
                    selectedTeamSelect.disabled = true;
                }
            };

            team1Select.addEventListener('change', updateSelectedTeamOptions);
            team2Select.addEventListener('change', updateSelectedTeamOptions);

            venuePlayerForm.addEventListener('submit', handleVenuePlayerForm);
        }
    } catch (error) {
        console.error('Error initializing forms:', error);
        // Show error message to user
        const forms = [teamPlayerForm, venuePlayerForm, bestPlayersForm];
        forms.forEach(form => {
            if (form) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger mt-3';
                errorDiv.textContent = 'Error loading teams. Please refresh the page.';
                form.parentNode.insertBefore(errorDiv, form.nextSibling);
            }
        });
    }
});

async function fetchTeams() {
    const response = await fetch('/api/teams');
    const data = await response.json();
    if (!data.teams) throw new Error('No teams data received');
    return data.teams;
}

function populateSelect(select, options, defaultText) {
    select.innerHTML = `<option value="" selected disabled>${defaultText}</option>`;
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function populateTeamSelect(teams) {
    const teamSelect = document.getElementById('teamSelect');
    if (teamSelect) {
        populateSelect(teamSelect, teams, 'Choose a team...');
    }
}

function handleTeamChange(e) {
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    const selectedTeam = document.getElementById('selectedTeam');
    
    // Reset and populate the selectedTeam dropdown
    selectedTeam.innerHTML = '<option value="" selected disabled>Select Team to Predict...</option>';
    if (team1) selectedTeam.add(new Option(team1, team1));
    if (team2) selectedTeam.add(new Option(team2, team2));
}

async function handleTeamPlayerForm(e) {
    e.preventDefault();
    const team = document.getElementById('teamSelect').value;
    const resultsDiv = document.getElementById('playerStatsResults');
    showLoading(resultsDiv);
    try {
        const response = await fetch('/team_player_stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ team })
        });
        const data = await response.json();
        if (data.status === 'success') {
            displayPlayerStats(data);
        } else {
            showError(resultsDiv, data.message || 'Error fetching player stats.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(resultsDiv, 'Error fetching player stats.');
    } finally {
        hideLoading(resultsDiv);
    }
}

async function handleVenuePlayerForm(e) {
    e.preventDefault();
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    const venue = document.getElementById('venue').value;
    const selectedTeam = document.getElementById('selectedTeam').value;
    const resultsDiv = document.getElementById('venuePlayerResults');
    
    if (!team1 || !team2 || !venue || !selectedTeam) {
        showError(resultsDiv, 'Please select all required fields.');
        return;
    }

    showLoading(resultsDiv);
    try {
        const response = await fetch('/venue_best_player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                team1,
                team2,
                venue,
                selectedTeam
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            displayVenueBestPlayer(data);
        } else {
            showError(resultsDiv, data.message || 'Error predicting best player.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(resultsDiv, 'Error predicting best player.');
    } finally {
        hideLoading(resultsDiv);
    }
}

async function handleBestPlayersForm(e) {
    e.preventDefault();
    const team = document.getElementById('teamAnalysis').value;
    const resultsDiv = document.getElementById('bestPlayersResults');
    
    if (!team) {
        showError(resultsDiv, 'Please select a team.');
        return;
    }

    showLoading(resultsDiv);
    try {
        const response = await fetch('/team-best-players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ team })
        });
        const data = await response.json();
        if (data.status === 'success') {
            displayBestPlayers(data);
        } else {
            showError(resultsDiv, data.message || 'Error analyzing best players.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(resultsDiv, 'Error analyzing best players.');
    } finally {
        hideLoading(resultsDiv);
    }
}

function displayPlayerStats(data) {
    const resultsDiv = document.getElementById('playerStatsResults');
    resultsDiv.innerHTML = '';
    
    if (data.status === 'success') {
        const team = document.getElementById('teamSelect').value;
        const colors = teamColors[team] || { primary: '#000000', secondary: '#FFFFFF' };
        
        // Add team-specific styles
        const teamStyles = document.createElement('style');
        teamStyles.textContent = `
            .team-${team.toLowerCase().replace(/\s+/g, '-')} {
                background-color: ${colors.primary} !important;
                border: none !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            .team-${team.toLowerCase().replace(/\s+/g, '-')} .player-name {
                color: ${colors.secondary} !important;
                font-weight: 800 !important;
                font-size: 1.4em !important;
            }
            .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-item {
                background-color: ${colors.secondary}22 !important;
                border-radius: 8px !important;
                padding: 12px !important;
            }
            .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-label {
                color: ${colors.secondary} !important;
                font-weight: 600 !important;
                font-size: 0.9em !important;
            }
            .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-value {
                color: ${colors.secondary} !important;
                font-weight: 700 !important;
                font-size: 1.2em !important;
            }
        `;
        document.head.appendChild(teamStyles);

        data.players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card team-${team.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="card-body">
                        <h4 class="player-name mb-3">${player.player_name}</h4>
                        <div class="player-stats">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">Matches</div>
                                    <div class="stat-value">${player.matches || 0}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Runs</div>
                                    <div class="stat-value">${player.runs || 0}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Average</div>
                                    <div class="stat-value">${player.average?.toFixed(2) || '0.00'}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Strike Rate</div>
                                    <div class="stat-value">${player.strike_rate?.toFixed(2) || '0.00'}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Wickets</div>
                                    <div class="stat-value">${player.wickets || 0}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Economy</div>
                                    <div class="stat-value">${player.economy?.toFixed(2) || '0.00'}</div>
                                </div>
                                ${player.highest_score > 0 ? `
                                <div class="stat-item">
                                    <div class="stat-label">Highest Score</div>
                                    <div class="stat-value">${player.highest_score}</div>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    }
}

function displayVenueBestPlayer(data) {
    const resultsDiv = document.getElementById('venuePlayerResults');
    if (data.status === 'success' && data.bestPlayer) {
        resultsDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title mb-4">Best Player Prediction</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="player-info mb-4">
                                <h5 class="text-primary">${data.bestPlayer}</h5>
                                <div class="prediction-stats">
                                    <div class="stat-item">
                                        <div class="stat-label">Predicted Score</div>
                                        <div class="stat-value">${data.predictedScore} runs</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Confidence</div>
                                        <div class="stat-value">${data.confidence}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h5 class="mb-3">Venue Performance</h5>
                            <div class="venue-stats">
                                <div class="stat-item">
                                    <div class="stat-label">Matches at Venue</div>
                                    <div class="stat-value">${data.venueStats.matches} matches</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Total Runs</div>
                                    <div class="stat-value">${data.venueStats.runs}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Average</div>
                                    <div class="stat-value">${data.venueStats.average.toFixed(2)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Strike Rate</div>
                                    <div class="stat-value">${data.venueStats.strikeRate.toFixed(2)}</div>
                                </div>
                                ${data.venueStats.wickets ? `
                                <div class="stat-item">
                                    <div class="stat-label">Wickets</div>
                                    <div class="stat-value">${data.venueStats.wickets}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Economy</div>
                                    <div class="stat-value">${data.venueStats.economy.toFixed(2)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Bowling Average</div>
                                    <div class="stat-value">${data.venueStats.bowling_average.toFixed(2)}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        showError(resultsDiv, data.message || 'No data available for the selected combination.');
    }
}

// Team color configurations
const teamColors = {
    'Chennai Super Kings': {
        primary: '#FFE600',
        secondary: '#1B48B0'
    },
    'Mumbai Indians': {
        primary: '#004BA0',
        secondary: '#FFD700'
    },
    'Royal Challengers Bangalore': {
        primary: '#D8112B',
        secondary: '#FFFFFF'
    },
    'Kolkata Knight Riders': {
        primary: '#3F2B7F',
        secondary: '#FFD700'
    },
    'Sunrisers Hyderabad': {
        primary: '#FF822A',
        secondary: '#000000'
    },
    'Rajasthan Royals': {
        primary: '#E91E63',
        secondary: '#254AA5'
    },
    'Punjab Kings': {
        primary: '#ED1B24',
        secondary: '#FFFFFF'
    },
    'Delhi Capitals': {
        primary: '#004C93',
        secondary: '#EF1B23'
    },
    'Lucknow Super Giants': {
        primary: '#A7D5F6',
        secondary: '#002147'
    },
    'Gujarat Titans': {
        primary: '#1B2133',
        secondary: '#FFB81C'
    }
};

function getTeamStyle(teamName) {
    const colors = teamColors[teamName] || { primary: '#000000', secondary: '#FFFFFF' };
    return {
        background: colors.primary,
        color: colors.secondary
    };
}

// Add CSS to head
const style = document.createElement('style');
style.textContent = `
    .player-card {
        transition: all 0.3s ease;
        margin-bottom: 1rem;
        border: none !important;
        overflow: hidden;
    }
    .player-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
    }
    .player-name {
        font-weight: 800 !important;
        font-size: 1.4em !important;
        margin-bottom: 0.5rem;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
        margin-top: 1rem;
    }
    .stat-item {
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        transition: all 0.2s ease;
    }
    .stat-item:hover {
        transform: scale(1.05);
    }
    .stat-label {
        font-size: 0.9em;
        font-weight: 600 !important;
        margin-bottom: 0.4rem;
        opacity: 0.9;
    }
    .stat-value {
        font-size: 1.2em !important;
        font-weight: 700 !important;
    }
    .section-heading {
        color: #0081E9;
        font-weight: 700;
        margin-bottom: 2rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: center;
    }
    .badge {
        padding: 0.5rem 1rem !important;
        font-size: 1em !important;
        font-weight: 600 !important;
        border-radius: 6px;
    }
`;
document.head.appendChild(style);

function displayBestPlayers(data) {
    const resultsDiv = document.getElementById('bestPlayersResults');
    resultsDiv.innerHTML = '';
    
    const team = document.getElementById('teamAnalysis').value;
    const colors = teamColors[team] || { primary: '#000000', secondary: '#FFFFFF' };

    // Add team-specific styles
    const teamStyles = document.createElement('style');
    teamStyles.textContent = `
        .team-${team.toLowerCase().replace(/\s+/g, '-')} {
            background-color: ${colors.primary} !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .team-${team.toLowerCase().replace(/\s+/g, '-')} .player-name {
            color: ${colors.secondary} !important;
            font-weight: 800 !important;
            font-size: 1.4em !important;
        }
        .team-${team.toLowerCase().replace(/\s+/g, '-')} .badge {
            background-color: ${colors.secondary} !important;
            color: ${colors.primary} !important;
            padding: 8px 16px !important;
            font-weight: 600 !important;
            border-radius: 6px !important;
        }
        .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-item {
            background-color: ${colors.secondary}22 !important;
            border-radius: 8px !important;
            padding: 12px !important;
        }
        .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-label {
            color: ${colors.secondary} !important;
            font-weight: 600 !important;
            font-size: 0.9em !important;
        }
        .team-${team.toLowerCase().replace(/\s+/g, '-')} .stat-value {
            color: ${colors.secondary} !important;
            font-weight: 700 !important;
            font-size: 1.2em !important;
        }
        .section-heading {
            color: ${colors.primary} !important;
            font-weight: 700 !important;
            text-align: center !important;
            margin-bottom: 2rem !important;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(teamStyles);

    if (data.status === 'success' && (data.bestBatsmen?.length > 0 || data.bestBowlers?.length > 0)) {
        // Create container for batsmen
        if (data.bestBatsmen?.length > 0) {
            const batsmenSection = document.createElement('div');
            batsmenSection.className = 'col-12 mb-4';
            batsmenSection.innerHTML = '<h3 class="section-heading">Top Batsmen</h3>';
            
            const batsmenRow = document.createElement('div');
            batsmenRow.className = 'row g-4';
            
            data.bestBatsmen.forEach((batsman, index) => {
                const batsmanCol = document.createElement('div');
                batsmanCol.className = 'col-md-4';
                batsmanCol.innerHTML = `
                    <div class="card player-card team-${team.toLowerCase().replace(/\s+/g, '-')} h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="player-name">${batsman.player_name}</h5>
                                <span class="badge">#${index + 1}</span>
                            </div>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">Matches</div>
                                    <div class="stat-value">${batsman.matches}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Total Runs</div>
                                    <div class="stat-value">${batsman.runs}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Average</div>
                                    <div class="stat-value">${batsman.average}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Strike Rate</div>
                                    <div class="stat-value">${batsman.strike_rate}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Performance Score</div>
                                    <div class="stat-value">${batsman.performance_score}</div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                batsmenRow.appendChild(batsmanCol);
            });
            
            batsmenSection.appendChild(batsmenRow);
            resultsDiv.appendChild(batsmenSection);
        }

        // Create container for bowlers
        if (data.bestBowlers?.length > 0) {
            const bowlersSection = document.createElement('div');
            bowlersSection.className = 'col-12';
            bowlersSection.innerHTML = '<h3 class="section-heading">Top Bowlers</h3>';
            
            const bowlersRow = document.createElement('div');
            bowlersRow.className = 'row g-4';
            
            data.bestBowlers.forEach((bowler, index) => {
                const bowlerCol = document.createElement('div');
                bowlerCol.className = 'col-md-4';
                bowlerCol.innerHTML = `
                    <div class="card player-card team-${team.toLowerCase().replace(/\s+/g, '-')} h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="player-name">${bowler.player_name}</h5>
                                <span class="badge">#${index + 1}</span>
                            </div>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">Matches</div>
                                    <div class="stat-value">${bowler.matches}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Wickets</div>
                                    <div class="stat-value">${bowler.wickets}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Economy</div>
                                    <div class="stat-value">${bowler.economy}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Overs</div>
                                    <div class="stat-value">${Math.floor(bowler.balls_delivered / 6)}.${bowler.balls_delivered % 6}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Performance Score</div>
                                    <div class="stat-value">${bowler.performance_score}</div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                bowlersRow.appendChild(bowlerCol);
            });
            
            bowlersSection.appendChild(bowlersRow);
            resultsDiv.appendChild(bowlersSection);
        }
    } else {
        showError(resultsDiv, 'No player data available');
    }
}

// Helper functions
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Predicting performance...</div>
        </div>
    `;
    
    // Add loading styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .loading-container {
            text-align: center;
            padding: 40px;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 20px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .loading-text {
            font-size: 1.2em;
            color: #666;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleElement);
}

function hideLoading(element) {
    // Loading will be replaced by content
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-message">${message}</div>
        </div>
    `;
    
    // Add error styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .error-container {
            text-align: center;
            padding: 30px;
            background: #fff5f5;
            border: 2px solid #feb2b2;
            border-radius: 12px;
            margin: 20px auto;
            max-width: 600px;
        }
        .error-icon {
            font-size: 2em;
            margin-bottom: 15px;
        }
        .error-message {
            color: #c53030;
            font-size: 1.1em;
        }
    `;
    document.head.appendChild(styleElement);
}

async function predictPlayerPerformance(playerName, team1, team2, venue) {
    const resultsDiv = document.getElementById('prediction-results');
    if (!resultsDiv) return;

    showLoading(resultsDiv);

    try {
        const response = await fetch('/predict_player_performance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player_name: playerName,
                team1: team1,
                team2: team2,
                venue: venue
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get prediction');
        }

        const data = await response.json();
        
        // Get team colors
        const team1Colors = teamColors[team1] || { primary: '#1a365d', secondary: '#ffffff' };
        const team2Colors = teamColors[team2] || { primary: '#1a365d', secondary: '#ffffff' };

        // Create HTML for predictions
        const html = `
            <div class="prediction-container" style="padding: 20px; margin: 20px 0; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h3 style="text-align: center; margin-bottom: 25px; color: #2d3748;">Performance Prediction</h3>
                
                <div class="batting-predictions" style="background: ${team1Colors.primary}; color: ${team1Colors.secondary}; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px;">Batting Prediction</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <p><strong>Predicted Runs:</strong> ${data.batting.predicted_runs}</p>
                            <p><strong>Overall Average:</strong> ${data.batting.overall_average}</p>
                            <p><strong>Venue Average:</strong> ${data.batting.venue_average}</p>
                        </div>
                        <div>
                            <p><strong>Strike Rate:</strong> ${data.batting.strike_rate}</p>
                            <p><strong>Success Probability:</strong> ${data.batting.success_probability}%</p>
                        </div>
                    </div>
                </div>

                <div class="bowling-predictions" style="background: ${team2Colors.primary}; color: ${team2Colors.secondary}; padding: 20px; border-radius: 10px;">
                    <h4 style="margin-bottom: 15px;">Bowling Prediction</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <p><strong>Predicted Wickets:</strong> ${data.bowling.predicted_wickets}</p>
                            <p><strong>Economy Rate:</strong> ${data.bowling.economy_rate}</p>
                        </div>
                        <div>
                            <p><strong>Best Figures:</strong> ${data.bowling.best_figures}</p>
                            <p><strong>Success Probability:</strong> ${data.bowling.success_probability}%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resultsDiv.innerHTML = html;

    } catch (error) {
        showError(resultsDiv, 'Error getting prediction. Please try again.');
        console.error('Prediction error:', error);
    }
}

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', () => {
    const predictionForm = document.getElementById('player-prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const playerName = document.getElementById('player-name').value;
            const team1 = document.getElementById('team1').value;
            const team2 = document.getElementById('team2').value;
            const venue = document.getElementById('venue').value;

            if (!playerName || !team1 || !team2 || !venue) {
                showError(document.getElementById('prediction-results'), 'Please fill in all fields');
                return;
            }

            await predictPlayerPerformance(playerName, team1, team2, venue);
        });
    }
});