// Common utility functions
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner active"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
}

function hideLoading(element) {
    const loadingSpinner = element.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.remove();
    }
}

function showError(element, message) {
    element.innerHTML = `<div class="error-message">${message}</div>`;
}

function showSuccess(element, message) {
    element.innerHTML = `<div class="success-message">${message}</div>`;
}

// Fetch data from API
async function fetchData(endpoint, params = {}) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Initialize dropdowns with data
async function initializeDropdowns() {
    try {
        const response = await fetch('/api/teams');
        const teams = await response.json();
        
        // Update all team dropdowns
        document.querySelectorAll('select[id$="Team"]').forEach(select => {
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                select.appendChild(option);
            });
        });
        
        // Update venue dropdown
        const venuesResponse = await fetch('/api/venues');
        const venues = await venuesResponse.json();
        
        document.querySelectorAll('select[id$="Venue"]').forEach(select => {
            venues.forEach(venue => {
                const option = document.createElement('option');
                option.value = venue;
                option.textContent = venue;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error initializing dropdowns:', error);
    }
}

// Update player dropdown based on selected team
async function updatePlayerDropdown(teamSelect, playerSelect) {
    try {
        const team = teamSelect.value;
        if (!team) return;
        
        const response = await fetch(`/api/players?team=${team}`);
        const players = await response.json();
        
        // Clear existing options
        playerSelect.innerHTML = '<option value="">Select Player...</option>';
        
        // Add new options
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error updating player dropdown:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    
    // Add event listeners for team selection changes
    document.querySelectorAll('select[id$="Team"]').forEach(teamSelect => {
        teamSelect.addEventListener('change', () => {
            const playerSelect = teamSelect.closest('.row').querySelector('select[id$="Name"]');
            if (playerSelect) {
                updatePlayerDropdown(teamSelect, playerSelect);
            }
        });
    });
}); 