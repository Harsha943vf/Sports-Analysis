// rankings.js
// Team color configurations
const teamColors = {
    'Chennai Super Kings': {
        primary: '#FDB913',
        secondary: '#0081E9',
        gradient: 'linear-gradient(135deg, #FDB913 0%, #F0A500 100%)'
    },
    'Mumbai Indians': {
        primary: '#004BA0',
        secondary: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #004BA0 0%, #003070 100%)'
    },
    'Royal Challengers Bangalore': {
        primary: '#EC1C24',
        secondary: '#000000',
        gradient: 'linear-gradient(135deg, #EC1C24 0%, #8B0000 100%)'
    },
    'Kolkata Knight Riders': {
        primary: '#3A225D',
        secondary: '#FDB913',
        gradient: 'linear-gradient(135deg, #3A225D 0%, #27133F 100%)'
    },
    'Sunrisers Hyderabad': {
        primary: '#ff822a',
        secondary: '#000000',
        gradient: 'linear-gradient(135deg, #ff822a 0%, #ff5003 100%)'
    },
    'Rajasthan Royals': {
        primary: '#254AA5',
        secondary: '#FF1B75',
        gradient: 'linear-gradient(135deg, #254AA5 0%, #1A3578 100%)'
    },
    'Punjab Kings': {
        primary: '#ED1B24',
        secondary: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #ED1B24 0%, #BC0000 100%)'
    },
    'Delhi Capitals': {
        primary: '#0078BC',
        secondary: '#EF1B23',
        gradient: 'linear-gradient(135deg, #0078BC 0%, #004C8C 100%)'
    },
    'Lucknow Super Giants': {
        primary: '#A7D5EF',
        secondary: '#274686',
        gradient: 'linear-gradient(135deg, #A7D5EF 0%, #7BB8E0 100%)'
    },
    'Gujarat Titans': {
        primary: '#1B2133',
        secondary: '#3D8DCC',
        gradient: 'linear-gradient(135deg, #1B2133 0%, #0F1421 100%)'
    }
};

function getTeamRowStyle(teamName) {
    const colors = teamColors[teamName] || { 
        primary: '#333333', 
        secondary: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #333333 0%, #222222 100%)'
    };
    return `
        background: ${colors.gradient};
        color: ${colors.secondary};
        transition: all 0.3s ease;
    `;
}

// Add CSS to head
const style = document.createElement('style');
style.textContent = `
    .rankings-container {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .rankings-table {
        border-collapse: separate;
        border-spacing: 0 8px;
        width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
    }
    .rankings-table tr {
        transition: all 0.3s ease;
        margin-bottom: 8px;
        border-radius: 10px;
        overflow: hidden;
    }
    .rankings-table tr:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    }
    .rankings-table td {
        padding: 15px !important;
        vertical-align: middle;
        border: none;
    }
    .rankings-table td:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }
    .rankings-table td:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }
    .player-name {
        font-weight: 600;
        font-size: 1.1em;
        letter-spacing: 0.5px;
    }
    .team-name {
        font-weight: 500;
        letter-spacing: 0.3px;
        opacity: 0.9;
    }
    .stat-value {
        font-weight: 600;
        text-align: center;
    }
    .table thead th {
        background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
        color: white;
        padding: 15px !important;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        border: none;
    }
    .table thead th:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }
    .table thead th:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }
    .rankings-title {
        color: #2c3e50;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    // Check which rankings page we're on
    const battingRankingsBody = document.getElementById('battingRankingsBody');
    const bowlingRankingsBody = document.getElementById('bowlingRankingsBody');
    const allrounderRankingsBody = document.getElementById('allrounderRankingsBody');

    if (battingRankingsBody) {
        fetchBattingRankings();
    } else if (bowlingRankingsBody) {
        fetchBowlingRankings();
    } else if (allrounderRankingsBody) {
        fetchAllrounderRankings();
    }
});

function fetchBattingRankings() {
    fetch('/api/rankings/batting')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('battingRankingsBody');
                tbody.innerHTML = '';
                data.rankings.forEach((player, index) => {
                    const rowStyle = getTeamRowStyle(player.team);
                    tbody.innerHTML += `
                        <tr style="${rowStyle}">
                            <td class="stat-value">${index + 1}</td>
                            <td class="player-name">${player.player_name}</td>
                            <td class="team-name">${player.team}</td>
                            <td class="stat-value">${player.matches}</td>
                            <td class="stat-value">${player.runs}</td>
                            <td class="stat-value">${player.average.toFixed(2)}</td>
                            <td class="stat-value">${player.strike_rate.toFixed(2)}</td>
                            <td class="stat-value">${player.highest_score}</td>
                        </tr>
                    `;
                });
            } else {
                showError('Error loading batting rankings');
            }
        })
        .catch(error => showError('Error loading batting rankings'));
}

function fetchBowlingRankings() {
    fetch('/api/rankings/bowling')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('bowlingRankingsBody');
                tbody.innerHTML = '';
                data.rankings.forEach((player, index) => {
                    const rowStyle = getTeamRowStyle(player.team);
                    tbody.innerHTML += `
                        <tr style="${rowStyle}">
                            <td class="stat-value">${index + 1}</td>
                            <td class="player-name">${player.player_name}</td>
                            <td class="team-name">${player.team}</td>
                            <td class="stat-value">${player.matches}</td>
                            <td class="stat-value">${player.wickets}</td>
                            <td class="stat-value">${player.economy.toFixed(2)}</td>
                            <td class="stat-value">${player.balls_delivered}</td>
                            <td class="stat-value">${player.runs_conceded}</td>
                        </tr>
                    `;
                });
            } else {
                showError('Error loading bowling rankings');
            }
        })
        .catch(error => showError('Error loading bowling rankings'));
}

function fetchAllrounderRankings() {
    fetch('/api/rankings/allrounders')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('allrounderRankingsBody');
                tbody.innerHTML = '';
                data.rankings.forEach((player, index) => {
                    const rowStyle = getTeamRowStyle(player.team);
                    tbody.innerHTML += `
                        <tr style="${rowStyle}">
                            <td class="stat-value">${player.rank}</td>
                            <td class="player-name">${player.player}</td>
                            <td class="team-name">${player.team}</td>
                            <td class="stat-value">${player.matches}</td>
                            <td class="stat-value">${player.runs}</td>
                            <td class="stat-value">${player.batting_avg}</td>
                            <td class="stat-value">${player.wickets}</td>
                            <td class="stat-value">${player.economy}</td>
                            <td class="stat-value">${player.performance_index}</td>
                        </tr>
                    `;
                });
            } else {
                showError('Error loading all-rounder rankings');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error loading all-rounder rankings');
        });
}

function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.role = 'alert';
        alertDiv.textContent = message;
        container.insertBefore(alertDiv, container.firstChild);
    }
}