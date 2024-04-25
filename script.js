document.getElementById('search-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    var city = document.getElementById('city-select').value;
    var state = document.getElementById('state-select').value;
    var zipCode = document.getElementById('zipcode-select').value;

    var citystate = city + ', ' + state;
    var location = [citystate, zipCode];

    if ((city && state) || zipCode) {
        var searchType = '';
        // At least one of the criteria is met, allow search
        console.log('Search is allowed.');
        if (zipCode) {
            searchType = 'zip-search';
            console.log('Searching by', searchType, zipCode);
        } else {
            searchType = 'city-state-search';
            console.log('Searching by', searchType, 'city', city, 'state', state);
        }
        // Perform search or any other action here
        var APIurl = getAPIurl(searchType, city, state, zipCode);
        getCoordinates(APIurl);
    } else if (!city && state) {
        alert('City is required to search by state.');
    } else if (city && !state) {
        alert('State is required to search by city.');
    } else {
        alert('Please enter either city and state or zip code.');
    } 

        // Save the search criteria to local storage
        saveSearchCriteria(city, state, zipCode);
});

const baseURL = 'http://api.openweathermap.org/geo/1.0/';
const apiKey = '2d84c33cb1d0e6e3ab00bca6bf053ead';

function getAPIurl(searchType, city, state, zipCode) {
    var endpoint, APIurl;
    if (searchType === 'zip-search') {
        endpoint = 'zip?zip='
        APIurl = baseURL + endpoint + zipCode + ',' + 'US' + '&appid=' + apiKey;
    } else {
        endpoint = 'direct?q=';
        APIurl = baseURL + endpoint + city + ',' + state + ',' + 'US' + '&limit=1&appid=' + apiKey;
    }
    console.log('API URL: ' + APIurl);
    return APIurl;
}

function getCoordinates(APIurl) {
    fetch(APIurl)
        .then(response => response.json())
        .then(data => {
            var lat, lon;

            // Check if data is an array
            if (Array.isArray(data)) {
                // If it's an array, extract lat and lon from the first object
                lat = data[0].lat;
                lon = data[0].lon;
            } else {
                // If it's not an array, extract lat and lon directly from the object
                lat = data.lat;
                lon = data.lon;
            }

            // Now you can use lat and lon variables as needed
            console.log('Latitude:', lat);
            console.log('Longitude:', lon);

            // Call the next function to get weather data
            getWeatherData(lat, lon);
        })
        .catch(error => console.log('Error: ' + error));
}

function getWeatherData(lat, lon) {
    var weatherAPIurl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly&appid=' + apiKey + '&units=imperial';
    try {
        fetch(weatherAPIurl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // Extract weather data from the data object
                console.log(data);

                var location = data.name;
                var currentWeather = data.weather[0].description;
                var weatherIcon = data.weather[0].icon;
                var currentTemp = data.main.temp;
                currentTemp = Math.round(currentTemp);
                var currentHumidity = data.main.humidity;
                currentHumidity = Math.round(currentHumidity);
                var currentWindSpeed = data.wind.speed;
                currentWindSpeed = Math.round(currentWindSpeed);

                console.log('City:', location);
                console.log('Current Conditions:', currentWeather);
                console.log ('Weather Icon:', weatherIcon);
                console.log('Current Temperature:', currentTemp);
                console.log('Current Humidity:', currentHumidity);
                console.log('Current Wind Speed:', currentWindSpeed);

                var weatherData = {
                    city: location,
                    currentWeather: currentWeather,
                    weatherIcon: weatherIcon,
                    currentTemp: currentTemp,
                    currentHumidity: currentHumidity,
                    currentWindSpeed: currentWindSpeed
                };

                var myCityArray = JSON.parse(localStorage.getItem('cityArray')) || [];
                myCityArray.push(weatherData);
                localStorage.setItem('cityArray', JSON.stringify(myCityArray));

                console.log('Weather Data:', weatherData);

                // Call the function to display the weather data
                displayWeatherData();
            });
    } catch (error) {
        console.log('Error: ' + error);
    }
}

function displayWeatherData(){
    // Display the weather data on the page
    // Retrieve the cityArray from local storage and parse it back into an array
    var myCityArray = JSON.parse(localStorage.getItem('cityArray')) || [];

    // If there's at least one item in the array, display the data of the last item
    if (myCityArray.length > 0) {
        var weatherData = myCityArray[myCityArray.length - 1]; // Get the last item in the array

        document.getElementById("put-city").innerHTML = weatherData.city;
        var currentDate = new Date().toLocaleDateString();
        document.getElementById("put-date").innerHTML = currentDate;
        document.getElementById("put-conditions").innerHTML = weatherData.currentWeather + '<img src="http://openweathermap.org/img/w/' + weatherData.weatherIcon + '.png">';
        document.getElementById("put-temperature").innerHTML = weatherData.currentTemp;
        document.getElementById("put-humidity").innerHTML = weatherData.currentHumidity;
        document.getElementById("put-wind").innerHTML = weatherData.currentWindSpeed;
    }
}


// Save search criteria to localStorage

// Function to save search criteria to local storage
function saveSearchCriteria(city, state, zipcode) {
    // Retrieve existing search history from local storage
    let searched = JSON.parse(localStorage.getItem('searched')) || [];

    // Create an object to hold the search criteria
    const searchCriteria = {
        city: city,
        state: state,
        zipcode: zipcode
    };

    // Add the search criteria to the search history
    searched.push(searchCriteria);

    // Save the updated search history to local storage
    localStorage.setItem('searched', JSON.stringify(searched));

    // Update the search history displayed on the page
    updateSearchHistoryUI();
}

// Function to retrieve search history from local storage
function getSearchHistory() {
    // Retrieve the search history array from local storage
    const searchedJSON = localStorage.getItem('searched');

    // Parse the JSON string to convert it back to an array
    const searched = JSON.parse(searchedJSON) || [];

    // Return the search history array
    return searched;
}

// Function to update the search history displayed on the page
function updateSearchHistoryUI() {
    const searched = getSearchHistory();
    const historyContainer = document.getElementById('put-search-history');

    // Clear existing search history displayed on the page
    historyContainer.innerHTML = '';

    // Loop through each search term and create a button with delete icon for it
    searched.forEach((searchCriteria, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('search-item');

        const button = document.createElement('button');
        button.textContent = `${searchCriteria.city}, ${searchCriteria.state}, ${searchCriteria.zipcode}`;
        button.classList.add('search-button', 'button');

// Attach event listener to the button to trigger API call
button.addEventListener('click', () => {
    // Get the new search criteria
    var newCity = document.getElementById('city-select').value;
    var newState = document.getElementById('state-select').value;
    var newZipCode = document.getElementById('zipcode-select').value;

    // Perform API call with the new search criteria
    var APIurl = getAPIurl(searchType, newCity, newState, newZipCode);
    getCoordinates(APIurl);

    console.log('API call triggered with search criteria:', newCity, newState, newZipCode);
});
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#x274C;'; // Unicode for 'X' character (delete icon)
        deleteButton.classList.add('delete-button');

        // Attach event listener to the delete button to remove the search item
        deleteButton.addEventListener('click', () => {
            removeSearchItem(index);
        });

        listItem.appendChild(button);
        listItem.appendChild(deleteButton);

        // Append the button to the history container
        historyContainer.appendChild(listItem);
    });

    // Create and append the "Clear All" button
    const clearAllButton = document.createElement('button');
    clearAllButton.textContent = 'Clear All';
    clearAllButton.classList.add('clear-all-button', 'button', 'is-dark', 'is-outlined', 'mt-3');
    clearAllButton.addEventListener('click', clearAllSearchHistory);
    historyContainer.appendChild(clearAllButton);
}

// Function to remove a search item from the search history
function removeSearchItem(index) {
    let searched = getSearchHistory();
    searched.splice(index, 1); // Remove the item at the specified index
    localStorage.setItem('searched', JSON.stringify(searched)); // Update local storage
    updateSearchHistoryUI(); // Update the displayed search history
}

// Function to clear all search history
function clearAllSearchHistory() {
    localStorage.removeItem('searched'); // Remove the search history from local storage
    updateSearchHistoryUI(); // Update the displayed search history
}

// Call updateSearchHistoryUI when the page loads to display initial search history
updateSearchHistoryUI();







