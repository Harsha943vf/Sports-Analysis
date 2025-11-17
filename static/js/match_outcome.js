// match_outcome.js
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
});

document.getElementById('playerPerformanceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const team1 = document.getElementById('playerTeam1').value;
    const team2 = document.getElementById('playerTeam2').value;
    const venue = document.getElementById('playerVenue').value;
    const playerName = document.getElementById('playerName').value;
    const resultsDiv = document.getElementById('playerPerformanceResults');
    showLoading(resultsDiv);
    try {
        const data = await fetchData('/predict_player', { team1, team2, venue, playerName });
        displayPlayerPerformance(data);
    } catch (error) {
        showError(resultsDiv, 'Error predicting player performance.');
        console.error(error);
    } finally {
        hideLoading(resultsDiv);
    }
});

document.getElementById('matchOutcomeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const team1 = document.getElementById('matchTeam1').value;
    const team2 = document.getElementById('matchTeam2').value;
    const venue = document.getElementById('matchVenue').value;
    const resultsDiv = document.getElementById('matchOutcomeResults');
    showLoading(resultsDiv);
    try {
        const data = await fetchData('/predict_match', { team1, team2, venue });
        displayMatchOutcome(data);
    } catch (error) {
        showError(resultsDiv, 'Error predicting match outcome.');
        console.error(error);
    } finally {
        hideLoading(resultsDiv);
    }
});

function displayPlayerPerformance(data) {
    const resultsDiv = document.getElementById('playerPerformanceResults');
    resultsDiv.innerHTML = '';
    if (data.status === 'success') {
        const prediction = data.prediction;
        resultsDiv.innerHTML = `
            <div class="col-md-4">
                <div class="card"><div class="card-body">
                    <h5>Expected Batting</h5>
                    <div class="player-stats">
                        <div class="stat-item"><div class="stat-label">Runs</div><div class="stat-value">${prediction.batting_stats.runs}</div></div>
                        <div class="stat-item"><div class="stat-label">Average</div><div class="stat-value">${prediction.batting_stats.average}</div></div>
                        <div class="stat-item"><div class="stat-label">Strike Rate</div><div class="stat-value">${prediction.batting_stats.strike_rate}</div></div>
                    </div>
                </div></div>
            </div>
            <div class="col-md-4">
                <div class="card"><div class="card-body">
                    <h5>Expected Bowling</h5>
                    <div class="player-stats">
                        <div class="stat-item"><div class="stat-label">Wickets</div><div class="stat-value">${prediction.bowling_stats.wickets}</div></div>
                        <div class="stat-item"><div class="stat-label">Economy</div><div class="stat-value">${prediction.bowling_stats.economy}</div></div>
                        <div class="stat-item"><div class="stat-label">Average</div><div class="stat-value">${prediction.bowling_stats.average}</div></div>
                    </div>
                </div></div>
            </div>
            <div class="col-md-4">
                <div class="card"><div class="card-body">
                    <h5>Role</h5>
                    <p>${prediction.role}</p>
                </div></div>
            </div>
        `;
    }
}

function displayMatchOutcome(data) {
    const resultsDiv = document.getElementById('matchOutcomeResults');
    resultsDiv.innerHTML = '';
    if (data.status === 'success') {
        const prediction = data.prediction;
        const team1 = document.getElementById('matchTeam1').value;
        const team2 = document.getElementById('matchTeam2').value;
        const winRatioChart = document.createElement('canvas');
        winRatioChart.id = 'winRatioChart';
        document.getElementById('winRatioChart')?.replaceWith(winRatioChart);
        new Chart(winRatioChart, {
            type: 'doughnut', data: {
                labels: [team1, team2],
                datasets: [{ data: [prediction.win_probability[team1] * 100, prediction.win_probability[team2] * 100], backgroundColor: ['#3498db', '#e74c3c'] }]
            }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
        document.getElementById('scoreRange').innerHTML = `
            <p><strong>${team1}:</strong> ${prediction.expected_score_range[team1]}</p>
            <p><strong>${team2}:</strong> ${prediction.expected_score_range[team2]}</p>
        `;
        document.getElementById('keyPlayers').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>${team1}</h6>
                    <ul>${prediction.key_players[team1].map(p => `<li>${p}</li>`).join('')}</ul>
                </div>
                <div class="col-md-6">
                    <h6>${team2}</h6>
                    <ul>${prediction.key_players[team2].map(p => `<li>${p}</li>`).join('')}</ul>
                </div>
            </div>
        `;
    }
}

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
                    <div class="probability-bar" style="background: linear-gradient(to right, ${team1Colors.primary} ${data.team1_win_probability}%, ${team2Colors.primary} ${data.team1_win_probability}%);">
                        <div class="team1-prob">${data.team1}: ${data.team1_win_probability}%</div>
                        <div class="team2-prob">${data.team2}: ${(100 - data.team1_win_probability)}%</div>
                    </div>
                </div>

                <div class="section toss-prediction mb-4">
                    <h3 class="section-title">Toss Prediction</h3>
                    <div class="toss-coin" style="position: relative; width: 100px; height: 100px; margin: 0 auto;">
                        <div class="coin-inner" style="
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            background: ${data.toss_winner === data.team1 ? team1Colors.primary : team2Colors.primary};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                            border: 3px solid #fff;
                            color: ${data.toss_winner === data.team1 ? team1Colors.secondary : team2Colors.secondary};
                            font-weight: bold;
                            font-size: 24px;
                            text-transform: uppercase;">
                            ${data.toss_winner.split(' ').map(word => word[0]).join('')}
                        </div>
                    </div>
                    <p class="text-center mt-2" style="color: ${data.toss_winner === data.team1 ? team1Colors.primary : team2Colors.primary};">
                        ${data.toss_winner} to win toss
                    </p>
                </div>

                <div class="section expected-scores">
                    <h3 class="section-title">Expected Score Range</h3>
                    <div class="score-card" style="background: ${team1Colors.primary}; color: ${team1Colors.secondary};">
                        <div class="team-name">${data.team1}:</div>
                        <div class="score-range">${data.team1_score_range}</div>
                    </div>
                    <div class="score-card" style="background: ${team2Colors.primary}; color: ${team2Colors.secondary};">
                        <div class="team-name">${data.team2}:</div>
                        <div class="score-range">${data.team2_score_range}</div>
                    </div>
                </div>

                <div class="section key-players mt-4">
                    <h3 class="section-title">Key Players</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="team-players" style="background: ${team1Colors.primary}; color: ${team1Colors.secondary};">
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
                            <div class="team-players" style="background: ${team2Colors.primary}; color: ${team2Colors.secondary};">
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

        // Add CSS for the new toss coin animation
        const style = document.createElement('style');
        style.textContent = `
            .toss-coin {
                animation: coinFlip 1s ease-out forwards;
            }
            .coin-inner {
                transition: all 0.3s ease;
            }
            .coin-inner:hover {
                transform: scale(1.1);
                cursor: pointer;
            }
            @keyframes coinFlip {
                0% { transform: rotateY(0deg) scale(0.5); opacity: 0; }
                50% { transform: rotateY(720deg) scale(1.2); }
                100% { transform: rotateY(1440deg) scale(1); opacity: 1; }
            }
            .probability-bar {
                height: 40px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                color: white;
                font-weight: bold;
                margin: 10px 0;
                transition: all 0.3s ease;
            }
            .section-title {
                text-align: center;
                margin-bottom: 20px;
                color: #2d3748;
                font-weight: bold;
            }
            .score-card {
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .team-players {
                padding: 20px;
                border-radius: 10px;
                margin: 10px 0;
            }
            .player-category {
                margin: 15px 0;
            }
            .player {
                padding: 5px 0;
            }
        `;
        document.head.appendChild(style);
    } else {
        showError(resultsDiv, data.message || 'Error predicting match outcome');
    }
}

// Add team colors configuration
const teamColors = {
    'Chennai Super Kings': { primary: '#FFFF00', secondary: '#0000FF' },
    'Mumbai Indians': { primary: '#004BA0', secondary: '#D1AB3E' },
    'Royal Challengers Bangalore': { primary: '#EC1C24', secondary: '#000000' },
    'Kolkata Knight Riders': { primary: '#3A225D', secondary: '#B3A123' },
    'Delhi Capitals': { primary: '#282968', secondary: '#D71920' },
    'Punjab Kings': { primary: '#ED1B24', secondary: '#FFFFFF' },
    'Rajasthan Royals': { primary: '#254AA5', secondary: '#FF1B75' },
    'Sunrisers Hyderabad': { primary: '#FF822A', secondary: '#000000' },
    'Gujarat Titans': { primary: '#1B2133', secondary: '#BAB395' },
    'Lucknow Super Giants': { primary: '#A7D5F6', secondary: '#FF6B00' }
};

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', () => {
    const matchPredictionForm = document.getElementById('matchPredictionForm');
    if (matchPredictionForm) {
        matchPredictionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const team1 = document.getElementById('team1').value;
            const team2 = document.getElementById('team2').value;
            const venue = document.getElementById('venue').value;
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
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Network response was not ok');
                }

                const data = await response.json();
                displayMatchPrediction(data);
            } catch (error) {
                showError(resultsDiv, error.message || 'Error predicting match outcome');
                console.error('Error:', error);
            } finally {
                hideLoading(resultsDiv);
            }
        });
    }
});

// Add utility functions if they don't exist
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading">Loading prediction...</div>';
    }
}

function hideLoading(element) {
    if (element) {
        const loadingDiv = element.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

function showError(element, message) {
    if (element) {
        element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}