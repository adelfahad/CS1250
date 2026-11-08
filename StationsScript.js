// Elements in the UI
const routesList = document.getElementById('routes-list');
const favoritesList = document.getElementById('favorites-list');
const clearFavoritesButton = document.getElementById('clear-favorites');

// Array to store favorite stations
let favorites = [];

// Load favorite stations from local storage (if available)
if (localStorage.getItem('favorites')) {
    favorites = JSON.parse(localStorage.getItem('favorites'));
    updateFavoritesList();
}

// Add click event to the star icon
routesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('star')) {
        const stationItem = event.target.closest('li');
        const stationId = stationItem.getAttribute('data-id');
        const stationName = stationItem.querySelector('.station-name').textContent;

        // Check if the station is already in favorites
        const isFavorite = favorites.some(fav => fav.id === stationId);

        if (isFavorite) {
            // Remove the station from favorites
            favorites = favorites.filter(fav => fav.id !== stationId);
            event.target.classList.remove('favorite');
        } else {
            // Add the station to favorites
            favorites.push({ id: stationId, name: stationName });
            event.target.classList.add('favorite');
        }

        // Save changes to local storage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
    }
});

// Add click event to remove individual favorite stations
favoritesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-favorite')) {
        const stationId = event.target.getAttribute('data-id');

        // Remove the station from favorites
        favorites = favorites.filter(fav => fav.id !== stationId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
        resetStars();
    }
});

// Add click event to expand/collapse routes
routesList.addEventListener('click', (event) => {
    const routeHeader = event.target.closest('.route-header');
    if (routeHeader) {
        const routeItem = routeHeader.parentElement;
        const stationsList = routeItem.querySelector('.stations-list');
       // const arrow = routeHeader.querySelector('.arrow');

        // Toggle the expanded class
        stationsList.classList.toggle('expanded');
        // arrow.textContent = stationsList.classList.contains('expanded') ? '▲' : '▼';
    }
});

// Add click event to clear all favorite stations
clearFavoritesButton.addEventListener('click', () => {
    favorites = [];
    localStorage.removeItem('favorites');
    updateFavoritesList();
    resetStars();
});

// Update the favorite stations list
function updateFavoritesList() {
    favoritesList.innerHTML = ''; // Clear the list

    if (favorites.length === 0) {
        // If there are no favorite stations, display a message
        const noFavoritesMessage = document.createElement('li');
        noFavoritesMessage.textContent = 'No favorite stations';
        noFavoritesMessage.style.textAlign = 'center'; // Center the text
        noFavoritesMessage.style.color = '#fff'; // white color for the message
        favoritesList.appendChild(noFavoritesMessage);
    } else {
        // If there are favorite stations, display them with arrival times
        favorites.forEach(fav => {
            const li = document.createElement('li');
            li.classList.add('favorite-station');

            // Station name
            const stationName = document.createElement('span');
            stationName.textContent = fav.name;
            stationName.classList.add('favorite-station-name');
            li.appendChild(stationName);

            // Arrival times
            const stationItem = document.querySelector(`.stations-list li[data-id="${fav.id}"]`);
            if (stationItem) {
                const times = stationItem.querySelectorAll('.time');
                const timesContainer = document.createElement('div');
                timesContainer.classList.add('favorite-times');

                times.forEach(time => {
                    const timeElement = document.createElement('span');
                    timeElement.textContent = time.textContent;
                    timeElement.classList.add('favorite-time');
                    timesContainer.appendChild(timeElement);
                });

                li.appendChild(timesContainer);
            }

            // Remove button
            const removeButton = document.createElement('span');
            removeButton.textContent = '★';
            removeButton.classList.add('remove-favorite');
            removeButton.setAttribute('data-id', fav.id);
            li.appendChild(removeButton);

            favoritesList.appendChild(li);
        });
    }

    // Hide the button if there are no favorite stations
    clearFavoritesButton.style.display = favorites.length > 0 ? 'block' : 'none';
}

// Reset the star icons
function resetStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const stationId = star.closest('li').getAttribute('data-id');
        if (favorites.some(fav => fav.id === stationId)) {
            star.classList.add('favorite');
        } else {
            star.classList.remove('favorite');
        }
    });
}

// Function to update arrival times
function updateArrivalTimes() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Arrival times (every 5 minutes from 6 AM to 12 AM)
    const arrivalTimes = [];
    for (let i = 6 * 60; i <= 24 * 60; i += 5) {
        arrivalTimes.push(i);
    }

    // Display the next three arrival times
    document.querySelectorAll('.stations-list li').forEach(li => {
        const stationId = li.getAttribute('data-id');
        const nextThreeTimes = arrivalTimes
            .filter(time => time > currentMinutes)
            .slice(0, 3); // Next three arrival times

        const timeElements = li.querySelectorAll('.time');
        if (nextThreeTimes.length > 0) {
            nextThreeTimes.forEach((time, index) => {
                const hours = Math.floor(time / 60);
                const minutes = time % 60;
                timeElements[index].textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
            });
        } else {
            timeElements.forEach(timeElement => {
                timeElement.textContent = '--:--';
            });
        }
    });

    // Update favorite stations list with new times
    updateFavoritesList();
}

// Update arrival times every minute
setInterval(updateArrivalTimes, 60000);
updateArrivalTimes(); // Update times on initial load