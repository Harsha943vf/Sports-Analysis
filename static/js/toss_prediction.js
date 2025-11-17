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

// Venue data
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

// Team colors for visualization
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

// Initialize dropdowns when the document loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    setupEventListeners();
});

function initializeDropdowns() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const venueSelect = document.getElementById('venue');

    // Populate team dropdowns
    teams.forEach(team => {
        const option1 = document.createElement('option');
        option1.value = team;
        option1.textContent = team;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = team;
        option2.textContent = team;
        team2Select.appendChild(option2);
    });

    // Populate venue dropdown
    venues.forEach(venue => {
        const option = document.createElement('option');
        option.value = venue;
        option.textContent = venue;
        venueSelect.appendChild(option);
    });

    // Add change event listeners to prevent selecting same team
    team1Select.addEventListener('change', () => {
        const selectedTeam1 = team1Select.value;
        Array.from(team2Select.options).forEach(option => {
            option.disabled = option.value === selectedTeam1;
        });
    });

    team2Select.addEventListener('change', () => {
        const selectedTeam2 = team2Select.value;
        Array.from(team1Select.options).forEach(option => {
            option.disabled = option.value === selectedTeam2;
        });
    });
}

function setupEventListeners() {
    const form = document.getElementById('tossPredictionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const team1 = document.getElementById('team1').value;
            const team2 = document.getElementById('team2').value;
            const venue = document.getElementById('venue').value;

            if (!team1 || !team2 || !venue) {
                showError('Please fill in all fields');
                return;
            }

            showLoading();
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
                displayPredictions(data);
            } catch (error) {
                showError('Error predicting match outcome');
                console.error('Error:', error);
            }
        });
    }
}

function displayPredictions(data) {
    if (data.status === 'success') {
        // Display Win Probability
        const winProbDiv = document.getElementById('winProbability');
        winProbDiv.innerHTML = `
            <div class="probability-bar">
                <div class="team1-prob" style="width: ${data.team1_win_probability}%">
                    ${data.team1}: ${data.team1_win_probability}%
                </div>
                <div class="team2-prob" style="width: ${100 - data.team1_win_probability}%">
                    ${data.team2}: ${100 - data.team1_win_probability}%
                </div>
            </div>
        `;

        // Display Score Range
        const scoreRangeDiv = document.getElementById('scoreRange');
        scoreRangeDiv.innerHTML = `
            <div class="score-ranges">
                <div class="team-score">
                    <strong>${data.team1}:</strong> ${data.team1_score_range}
                </div>
                <div class="team-score">
                    <strong>${data.team2}:</strong> ${data.team2_score_range}
                </div>
            </div>
        `;

        // Display Key Players
        const keyPlayersDiv = document.getElementById('keyPlayers');
        keyPlayersDiv.innerHTML = `
            <div class="key-players">
                <div class="team-players">
                    <strong>${data.team1}</strong>
                    <ul>
                        ${data.team1_key_batsmen.map(player => `<li>${player}</li>`).join('')}
                        ${data.team1_key_bowlers.map(player => `<li>${player}</li>`).join('')}
                    </ul>
                </div>
                <div class="team-players">
                    <strong>${data.team2}</strong>
                    <ul>
                        ${data.team2_key_batsmen.map(player => `<li>${player}</li>`).join('')}
                        ${data.team2_key_bowlers.map(player => `<li>${player}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Add CSS for the predictions
        const style = document.createElement('style');
        style.textContent = `
            .probability-bar {
                display: flex;
                height: 40px;
                border-radius: 20px;
                overflow: hidden;
                margin: 10px 0;
            }
            .team1-prob, .team2-prob {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 10px;
                color: white;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .team1-prob {
                background: #007bff;
            }
            .team2-prob {
                background: #dc3545;
            }
            .score-ranges {
                padding: 10px;
            }
            .team-score {
                margin: 10px 0;
            }
            .key-players {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .team-players {
                margin-bottom: 10px;
            }
            .team-players ul {
                list-style: none;
                padding-left: 0;
                margin-top: 5px;
            }
            .team-players li {
                padding: 2px 0;
            }
        `;
        document.head.appendChild(style);
    } else {
        showError(data.message || 'Error predicting match outcome');
    }
}

function showLoading() {
    ['winProbability', 'scoreRange', 'keyPlayers'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
    });
}

function showError(message) {
    ['winProbability', 'scoreRange', 'keyPlayers'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
        }
    });
} 