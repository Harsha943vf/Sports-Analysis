// team_prediction.js
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
                // Update team2 options
                Array.from(team2Select.options).forEach(option => {
                    if (option.value === selectedTeam) {
                        option.disabled = true;
                    } else {
                        option.disabled = false;
                    }
                });
                updateVenues();
            });

            team2Select.addEventListener('change', () => {
                const selectedTeam = team2Select.value;
                // Update team1 options
                Array.from(team1Select.options).forEach(option => {
                    if (option.value === selectedTeam) {
                        option.disabled = true;
                    } else {
                        option.disabled = false;
                    }
                });
                updateVenues();
            });
        }

        // Initialize venue select
        const venueSelect = document.getElementById('matchVenue');
        venueSelect.innerHTML = '<option value="" selected disabled>Select both teams first...</option>';
        venueSelect.disabled = true;
    } catch (error) {
        console.error('Error initializing dropdowns:', error);
    }
});

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

// Utility functions
function showLoading(element) {
    element.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
}

function showError(element, message) {
    element.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('matchPredictionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const team1 = document.getElementById('matchTeam1').value;
            const team2 = document.getElementById('matchTeam2').value;
            const venue = document.getElementById('matchVenue').value;
            const resultsDiv = document.getElementById('matchPredictionResults');

            if (!team1 || !team2 || !venue) {
                showError(resultsDiv, 'Please fill in all fields');
                return;
            }

            showLoading(resultsDiv);
            try {
                const response = await fetch('/predict_match', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ team1, team2, venue })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                displayMatchPrediction(data);
            } catch (error) {
                showError(resultsDiv, 'Error predicting match outcome');
                console.error('Error:', error);
            }
        });
    }
});

const teamColors = {
    'Chennai Super Kings': { primary: '#FFFF3C', secondary: '#0081E9' },
    'Delhi Capitals': { primary: '#0081E9', secondary: '#FFFFFF' },
    'Gujarat Titans': { primary: '#1B2133', secondary: '#FFFFFF' },
    'Kolkata Knight Riders': { primary: '#3A225D', secondary: '#B3A123' },
    'Lucknow Super Giants': { primary: '#A7D5F9', secondary: '#102F69' },
    'Mumbai Indians': { primary: '#004BA0', secondary: '#FFFFFF' },
    'Punjab Kings': { primary: '#ED1B24', secondary: '#FFFFFF' },
    'Rajasthan Royals': { primary: '#FF1B75', secondary: '#FFFFFF' },
    'Royal Challengers Bangalore': { primary: '#EC1C24', secondary: '#000000' },
    'Sunrisers Hyderabad': { primary: '#F7A721', secondary: '#000000' }
};

function displayMatchPrediction(data) {
    const resultsDiv = document.getElementById('matchPredictionResults');
    if (!resultsDiv) return;

    if (data.status === 'success') {
        const team1Colors = teamColors[data.team1] || { primary: '#1a365d', secondary: '#ffffff' };
        const team2Colors = teamColors[data.team2] || { primary: '#1a365d', secondary: '#ffffff' };
        
        resultsDiv.innerHTML = `
            <div class="prediction-sections">
                <div class="section win-probability mb-4">
                    <h3 class="section-title">Win Probability</h3>
                    <div class="probability-bar">
                        <div class="team1-prob" style="color: ${team1Colors.secondary}; background: ${team1Colors.primary}; width: ${data.team1_win_probability}%">
                            ${data.team1}: ${data.team1_win_probability}%
                        </div>
                        <div class="team2-prob" style="color: ${team2Colors.secondary}; background: ${team2Colors.primary}; width: ${100 - data.team1_win_probability}%">
                            ${data.team2}: ${(100 - data.team1_win_probability)}%
                        </div>
                    </div>
                </div>

                <div class="section toss-prediction mb-4">
                    <h3 class="section-title">Toss Prediction</h3>
                    <div class="toss-container">
                        <div class="toss-coin" style="background: ${data.toss_winner === data.team1 ? team1Colors.primary : team2Colors.primary}; color: ${data.toss_winner === data.team1 ? team1Colors.secondary : team2Colors.secondary}">
                            <div class="coin-face">
                                <div class="team-name">${data.toss_winner}</div>
                                <div class="toss-text">Likely to win the toss</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section expected-scores mb-4">
                    <h3 class="section-title">Expected Score Range</h3>
                    <div class="team-scores">
                        <div class="score-card" style="background: ${team1Colors.primary}; color: ${team1Colors.secondary}">
                            <strong>${data.team1}:</strong> ${data.team1_score_range}
                        </div>
                        <div class="score-card" style="background: ${team2Colors.primary}; color: ${team2Colors.secondary}">
                            <strong>${data.team2}:</strong> ${data.team2_score_range}
                        </div>
                    </div>
                </div>

                <div class="section key-players">
                    <h3 class="section-title">Key Players</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="team-players" style="background: ${team1Colors.primary}; color: ${team1Colors.secondary}">
                                <h4>${data.team1}</h4>
                                <div class="player-category">
                                    <h5>BATSMEN</h5>
                                    ${data.team1_key_batsmen.map(player => `<div class="player">${player}</div>`).join('')}
                                </div>
                                <div class="player-category">
                                    <h5>BOWLERS</h5>
                                    ${data.team1_key_bowlers.map(player => `<div class="player">${player}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="team-players" style="background: ${team2Colors.primary}; color: ${team2Colors.secondary}">
                                <h4>${data.team2}</h4>
                                <div class="player-category">
                                    <h5>BATSMEN</h5>
                                    ${data.team2_key_batsmen.map(player => `<div class="player">${player}</div>`).join('')}
                                </div>
                                <div class="player-category">
                                    <h5>BOWLERS</h5>
                                    ${data.team2_key_bowlers.map(player => `<div class="player">${player}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS for the sections
        const style = document.createElement('style');
        style.textContent = `
            .prediction-sections {
                padding: 20px;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 10px;
            }
            .section-title {
                text-align: center;
                margin-bottom: 20px;
                color: #2d3748;
                font-weight: bold;
            }
            .probability-bar {
                display: flex;
                height: 40px;
                border-radius: 20px;
                overflow: hidden;
            }
            .team1-prob, .team2-prob {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 15px;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .toss-container {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .toss-coin {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                position: relative;
                animation: flip 2s ease-in-out;
            }
            .coin-face {
                text-align: center;
                padding: 20px;
            }
            .team-name {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .toss-text {
                font-size: 0.9em;
                opacity: 0.9;
            }
            @keyframes flip {
                0% { transform: rotateY(0deg); }
                50% { transform: rotateY(180deg); }
                100% { transform: rotateY(0deg); }
            }
            .team-scores {
                display: grid;
                gap: 15px;
            }
            .score-card {
                padding: 15px;
                border-radius: 10px;
                text-align: center;
            }
            .team-players {
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 15px;
            }
            .player-category {
                margin: 15px 0;
            }
            .player-category h5 {
                margin-bottom: 10px;
                font-size: 0.9em;
                opacity: 0.9;
            }
            .player {
                padding: 5px 0;
                font-size: 0.95em;
            }
        `;
        document.head.appendChild(style);
    } else {
        showError(resultsDiv, data.message || 'Error predicting match outcome');
    }
}