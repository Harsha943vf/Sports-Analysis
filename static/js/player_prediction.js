// player_prediction.js

// Team data
const teams = [
    'Chennai Super Kings',
    'Mumbai Indians',
    'Royal Challengers Bangalore',
    'Kolkata Knight Riders',
    'Sunrisers Hyderabad',
    'Rajasthan Royals',
    'Punjab Kings',
    'Delhi Capitals',
    'Lucknow Super Giants',
    'Gujarat Titans'
];

const venues = [
    'M Chinnaswamy Stadium',
    'Eden Gardens',
    'Wankhede Stadium',
    'MA Chidambaram Stadium',
    'Arun Jaitley Stadium',
    'Punjab Cricket Association Stadium',
    'Rajiv Gandhi International Stadium',
    'Sawai Mansingh Stadium',
    'Narendra Modi Stadium',
    'BRSABV Ekana Cricket Stadium'
];

// Initialize all dropdowns when the document loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch teams
        const teamsResponse = await fetch('/api/teams');
        const teamsData = await teamsResponse.json();
        if (teamsData.status === 'success') {
            const teams = teamsData.teams;
            const team1Select = document.getElementById('matchTeam1');
            const team2Select = document.getElementById('matchTeam2');
            
            // Populate team dropdowns
            [team1Select, team2Select].forEach(select => {
                select.innerHTML = '<option value="" selected disabled>Choose a team...</option>';
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team;
                    option.textContent = team;
                    select.appendChild(option);
                });
            });

            // Add event listeners for team selection
            team1Select.addEventListener('change', () => {
                const selectedTeam = team1Select.value;
                updateTeam2Options(selectedTeam);
                updateRadioButtons();
                updateVenues();
            });

            team2Select.addEventListener('change', () => {
                const selectedTeam = team2Select.value;
                updateTeam1Options(selectedTeam);
                updateRadioButtons();
                updateVenues();
            });

            // Add event listeners for radio buttons
            const team1Radio = document.getElementById('team1Radio');
            const team2Radio = document.getElementById('team2Radio');
            
            team1Radio.addEventListener('change', () => {
                if (team1Radio.checked) {
                    updatePlayerOptions(team1Select.value);
                }
            });

            team2Radio.addEventListener('change', () => {
                if (team2Radio.checked) {
                    updatePlayerOptions(team2Select.value);
                }
            });

            // Add form submission handler
            const form = document.getElementById('playerPredictionForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const team1 = team1Select.value;
                const team2 = team2Select.value;
                const venue = document.getElementById('matchVenue').value;
                const playerSelect = document.getElementById('playerSelect');
                const player_name = playerSelect.value;

                if (!team1 || !team2 || !venue || !player_name) {
                    showError(document.getElementById('playerPredictionResults'), 'Please fill in all fields');
                    return;
                }

                try {
                    const response = await fetch('/predict_player_performance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            team1,
                            team2,
                            venue,
                            player_name
                        })
                    });

                    const data = await response.json();
                    displayPrediction(data);
                } catch (error) {
                    console.error('Error:', error);
                    showError(document.getElementById('playerPredictionResults'), 'Error getting prediction');
                }
            });
        }

        // Initialize selects and radio buttons
        const venueSelect = document.getElementById('matchVenue');
        const playerSelect = document.getElementById('playerSelect');
        venueSelect.innerHTML = '<option value="" selected disabled>Select both teams first...</option>';
        playerSelect.innerHTML = '<option value="" selected disabled>Select a team first...</option>';
        venueSelect.disabled = true;
        playerSelect.disabled = true;
    } catch (error) {
        console.error('Error initializing dropdowns:', error);
    }
});

function updateTeam1Options(selectedTeam2) {
    const team1Select = document.getElementById('matchTeam1');
    Array.from(team1Select.options).forEach(option => {
        if (option.value === selectedTeam2) {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });
    updateRadioButtons();
}

function updateTeam2Options(selectedTeam1) {
    const team2Select = document.getElementById('matchTeam2');
    Array.from(team2Select.options).forEach(option => {
        if (option.value === selectedTeam1) {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });
    updateRadioButtons();
}

function updateRadioButtons() {
    const team1Select = document.getElementById('matchTeam1');
    const team2Select = document.getElementById('matchTeam2');
    const team1Radio = document.getElementById('team1Radio');
    const team2Radio = document.getElementById('team2Radio');
    const team1Label = document.getElementById('team1Label');
    const team2Label = document.getElementById('team2Label');
    const playerSelect = document.getElementById('playerSelect');

    if (team1Select.value && team2Select.value) {
        // Enable radio buttons and update labels
        team1Radio.disabled = false;
        team2Radio.disabled = false;
        team1Label.textContent = team1Select.value;
        team2Label.textContent = team2Select.value;
    } else {
        // Disable radio buttons and reset labels
        team1Radio.disabled = true;
        team2Radio.disabled = true;
        team1Label.textContent = 'Team 1';
        team2Label.textContent = 'Team 2';
        team1Radio.checked = false;
        team2Radio.checked = false;
        playerSelect.disabled = true;
        playerSelect.innerHTML = '<option value="" selected disabled>Select a team first...</option>';
    }
}

async function updatePlayerOptions(selectedTeam) {
    const playerSelect = document.getElementById('playerSelect');
    
    if (selectedTeam) {
        try {
            showLoading(playerSelect);
            const response = await fetch(`/get_team_players?team=${selectedTeam}`);
            const data = await response.json();

            if (data.status === 'success') {
                playerSelect.innerHTML = '<option value="" selected disabled>Choose a player...</option>';
                
                data.players.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player;
                    option.textContent = player;
                    playerSelect.appendChild(option);
                });

                playerSelect.disabled = false;
            } else {
                playerSelect.innerHTML = '<option value="" selected disabled>Error loading players</option>';
                playerSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching players:', error);
            playerSelect.innerHTML = '<option value="" selected disabled>Error loading players</option>';
            playerSelect.disabled = true;
        }
    } else {
        playerSelect.innerHTML = '<option value="" selected disabled>Select a team first...</option>';
        playerSelect.disabled = true;
    }
}

// Function to update venues based on selected teams
async function updateVenues() {
    const team1 = document.getElementById('matchTeam1').value;
    const team2 = document.getElementById('matchTeam2').value;
    const venueSelect = document.getElementById('matchVenue');

    if (team1 && team2) {
        try {
            const response = await fetch(`/get_common_venues?team1=${team1}&team2=${team2}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                venueSelect.innerHTML = '<option value="" selected disabled>Choose a venue...</option>';
                data.venues.forEach(venue => {
                    const option = document.createElement('option');
                    option.value = venue;
                    option.textContent = venue;
                    venueSelect.appendChild(option);
                });
                venueSelect.disabled = false;
            } else {
                venueSelect.innerHTML = '<option value="" selected disabled>No common venues found</option>';
                venueSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
            venueSelect.innerHTML = '<option value="" selected disabled>Error loading venues</option>';
            venueSelect.disabled = true;
        }
    } else {
        venueSelect.innerHTML = '<option value="" selected disabled>Select both teams first...</option>';
        venueSelect.disabled = true;
    }
}

// Define team colors with gradients
const teamColors = {
    'Chennai Super Kings': { 
        primary: '#FFC107', 
        secondary: '#19388A',
        gradient: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)'
    },
    'Mumbai Indians': { 
        primary: '#004BA0', 
        secondary: '#FFD700',
        gradient: 'linear-gradient(135deg, #004BA0 0%, #003A7D 100%)'
    },
    'Royal Challengers Bangalore': { 
        primary: '#D8112B', 
        secondary: '#000000',
        gradient: 'linear-gradient(135deg, #D8112B 0%, #B30F24 100%)'
    },
    'Kolkata Knight Riders': { 
        primary: '#3F2B7F', 
        secondary: '#FFD700',
        gradient: 'linear-gradient(135deg, #3F2B7F 0%, #2F1F5F 100%)'
    },
    'Sunrisers Hyderabad': { 
        primary: '#FF5733', 
        secondary: '#000000',
        gradient: 'linear-gradient(135deg, #FF5733 0%, #FF4100 100%)'
    },
    'Rajasthan Royals': { 
        primary: '#E91E63', 
        secondary: '#19388A',
        gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)'
    },
    'Punjab Kings': { 
        primary: '#E61935', 
        secondary: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #E61935 0%, #C4152D 100%)'
    },
    'Delhi Capitals': { 
        primary: '#004B8D', 
        secondary: '#D81B2B',
        gradient: 'linear-gradient(135deg, #004B8D 0%, #003A6E 100%)'
    },
    'Lucknow Super Giants': { 
        primary: '#003087', 
        secondary: '#FF0000',
        gradient: 'linear-gradient(135deg, #003087 0%, #002569 100%)'
    },
    'Gujarat Titans': { 
        primary: '#1A2F4F', 
        secondary: '#FFD700',
        gradient: 'linear-gradient(135deg, #1A2F4F 0%, #12223B 100%)'
    }
};

function displayPrediction(data) {
    const resultsDiv = document.getElementById('playerPredictionResults');
    if (data.status === 'success') {
        const prediction = data.prediction;
        const playerTeamColors = teamColors[prediction.player_team] || { 
            primary: '#2c3e50', 
            secondary: '#ffffff',
            gradient: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)'
        };
        
        resultsDiv.innerHTML = `
            <div class="prediction-container" style="background: ${playerTeamColors.gradient};">
                <div class="player-header">
                    <h3 style="color: ${playerTeamColors.secondary};">${prediction.player_name}</h3>
                </div>
                
                <div class="stats-container">
                    ${prediction.batting_stats ? `
                        <div class="prediction-section">
                            <h4 style="color: ${playerTeamColors.secondary};">BATTING PREDICTION</h4>
                            <div class="stat-grid">
                                <div class="stat-box" style="background: rgba(255, 255, 255, 0.1);">
                                    <span class="stat-label" style="color: ${playerTeamColors.secondary};">Predicted Runs</span>
                                    <span class="stat-value" style="color: ${playerTeamColors.secondary};">${prediction.predicted_runs}</span>
                                </div>
                                <div class="stat-box" style="background: rgba(255, 255, 255, 0.1);">
                                    <span class="stat-label" style="color: ${playerTeamColors.secondary};">Strike Rate</span>
                                    <span class="stat-value" style="color: ${playerTeamColors.secondary};">${prediction.batting_stats.strike_rate}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${prediction.bowling_stats ? `
                        <div class="prediction-section">
                            <h4 style="color: ${playerTeamColors.secondary};">BOWLING PREDICTION</h4>
                            <div class="stat-grid">
                                <div class="stat-box" style="background: rgba(255, 255, 255, 0.1);">
                                    <span class="stat-label" style="color: ${playerTeamColors.secondary};">Predicted Wickets</span>
                                    <span class="stat-value" style="color: ${playerTeamColors.secondary};">${prediction.predicted_wickets}</span>
                                </div>
                                <div class="stat-box" style="background: rgba(255, 255, 255, 0.1);">
                                    <span class="stat-label" style="color: ${playerTeamColors.secondary};">Economy Rate</span>
                                    <span class="stat-value" style="color: ${playerTeamColors.secondary};">${prediction.bowling_stats.overall_economy}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="success-probability" style="color: ${playerTeamColors.secondary}; background: rgba(255, 255, 255, 0.1);">
                        Success Probability: ${prediction.success_probability}%
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .prediction-container {
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }
            .player-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .player-header h3 {
                margin: 0;
                font-size: 32px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .prediction-section {
                margin-bottom: 30px;
            }
            .prediction-section h4 {
                margin-bottom: 20px;
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 1px;
            }
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .stat-box {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .stat-label {
                font-size: 14px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
            }
            .success-probability {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                padding: 15px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    } else {
        showError(resultsDiv, data.message || 'Error getting prediction');
    }
}

// Utility functions
function showLoading(element) {
    if (element.tagName === 'SELECT') {
        element.innerHTML = '<option value="" selected disabled>Loading...</option>';
        element.disabled = true;
    } else {
        element.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
}

function showError(element, message) {
    element.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .player-card { 
        max-width: 600px; 
        margin: 0 auto; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
    }
    .stats-section { 
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%);
        padding: 20px; 
        border-radius: 8px;
        margin-bottom: 15px;
    }
    .stat-item { 
        display: flex; 
        justify-content: space-between; 
        padding: 8px 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .stat-item:last-child {
        border-bottom: none;
    }
    .label { 
        color: #adb5bd;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .value { 
        font-weight: bold; 
        font-size: 1.1em;
        background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    select.form-select {
        background-color: rgba(255,255,255,0.9);
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 8px;
        padding: 10px;
        font-size: 1em;
        transition: all 0.3s ease;
    }
    select.form-select:focus {
        background-color: #ffffff;
        box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
        border-color: #86b7fe;
    }
    .btn-predict {
        background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
        border: none;
        padding: 12px 24px;
        font-weight: 600;
        letter-spacing: 1px;
        transition: all 0.3s ease;
    }
    .btn-predict:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
    }
`;
document.head.appendChild(style);