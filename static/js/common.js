// common.js
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
}

function hideLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

function showError(element, message) {
    element.innerHTML = `<div class="error-message text-danger">${message}</div>`;
}

function showSuccess(element, message) {
    element.innerHTML = `<div class="success-message text-success">${message}</div>`;
}

async function fetchData(endpoint, params = {}, method = 'POST') {
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
            body: method === 'POST' ? JSON.stringify(params) : null
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function initializeDropdowns() {
    try {
        const teamsRes = await fetchData('/get_team_venues', {}, 'GET');
        const teams = teamsRes.team_venues || {};
        const teamSelectors = document.querySelectorAll('select[id$="Team"], select[id$="team"], select[id$="selectedTeam"], select[id$="teamAnalysis"]');
        teamSelectors.forEach(select => {
            select.innerHTML = '<option value="" selected disabled>Choose a team...</option>';
            Object.keys(teams).sort().forEach(team => select.add(new Option(team, team)));
        });

        // Fetch and populate venues dynamically
        const venueSelectors = document.querySelectorAll('select[id$="Venue"], select[id$="venue"]');
        venueSelectors.forEach(select => {
            select.innerHTML = '<option value="" selected disabled>Loading venues...</option>';
            fetchData('/get_team_venues', {}, 'GET').then(data => {
                if (data.status === 'success') {
                    const allVenues = new Set();
                    Object.values(data.team_venues).forEach(venues => venues.forEach(v => allVenues.add(v)));
                    select.innerHTML = '<option value="" selected disabled>Choose a venue...</option>';
                    Array.from(allVenues).sort().forEach(venue => select.add(new Option(venue, venue)));
                } else {
                    select.innerHTML = '<option value="" selected disabled>Error loading venues</option>';
                }
            }).catch(error => {
                console.error('Error fetching venues:', error);
                select.innerHTML = '<option value="" selected disabled>Error loading venues</option>';
            });
        });
    } catch (error) {
        console.error('Error initializing dropdowns:', error);
        document.querySelectorAll('select[id$="Team"], select[id$="team"], select[id$="selectedTeam"], select[id$="teamAnalysis"], select[id$="Venue"], select[id$="venue"]').forEach(select => {
            select.innerHTML = '<option value="" selected disabled>Error loading options</option>';
        });
    }
}

async function updatePlayerDropdown(teamSelect, playerSelect) {
    const team = teamSelect.value;
    if (!team) {
        playerSelect.innerHTML = '<option value="" selected disabled>Select Team First...</option>';
        playerSelect.disabled = true;
        return;
    }
    playerSelect.innerHTML = '<option value="" selected disabled>Loading players...</option>';
    playerSelect.disabled = true;
    try {
        const data = await fetchData('/get_team_players', { team }, 'GET');
        if (data.status === 'success') {
            playerSelect.innerHTML = '<option value="" selected disabled>Select Player...</option>';
            data.players.sort().forEach(player => playerSelect.add(new Option(player, player)));
            playerSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error updating players:', error);
        playerSelect.innerHTML = '<option value="" selected disabled>Error loading players</option>';
    }
}