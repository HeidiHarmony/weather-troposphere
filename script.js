const baseURL = 'http://api.openweathermap.org/geo/1.0/';
const apiKey = '2d84c33cb1d0e6e3ab00bca6bf053ead';

document.getElementById('search-button').addEventListener('click', searchHandler);

// Handle user search input -----------------------------------------------------------

function searchHandler(event) {
    event.preventDefault(); // Prevent form submission

var city = document.getElementById('city-select').value;
var state = document.getElementById('state-select').value;
var zipCode = document.getElementById('zipcode-select').value;
var searchType = '';
    
// Search input validation

    if ((city && state) || zipCode) {

        // At least one of the criteria is met, allow search
        console.log('Search is allowed.');

    } else {

        // search criteria not met, display an error message
        console.error('Search criteria not met.')
        alert('Please enter a city and state or a zip code to search.');
        return;
    }

// Determine the search type based on the search criteria

        if (city && state && zipCode) {
            searchType = 'zip-search';

            console.log('Searching by', searchType, zipCode);

        } else if (city && state) {
            searchType = 'city-state-search';
            console.log('Searching by', searchType, 'city', city, 'state', state);
        } else {
            searchType = 'zip-search';
            console.log('Searching by', searchType, zipCode);
        }

        var coordinatesFullURL = constructAPIurl(searchType, city, state, zipCode);

        console.log('Coordinates API URL:', coordinatesFullURL);

 // Perform API call to get the longitude and latitude
        
        getCoordinates(coordinatesFullURL, city, state, zipCode);
}; /* End of searchHandler function */


// Function to construct the API URL based on the search criteria provided -----------------------------------------------------------

 function constructAPIurl(searchType, city, state, zipCode) {
    var endpoint, coordinatesFullURL;
    if (searchType === 'zip-search') {
        endpoint = 'zip?zip='
        coordinatesFullURL = baseURL + endpoint + zipCode + ',' + 'US' + '&appid=' + apiKey;
    } else {
        endpoint = 'direct?q=';
        coordinatesFullURL = baseURL + endpoint + city + ',' + state + ',' + 'US' + '&limit=1&appid=' + apiKey;
    }
    console.log('API URL: ' + coordinatesFullURL);
    return coordinatesFullURL; /* For use in the getCoordinates function */
}

// Function to make API call and get the coordinates of the location-----------------------------------------------------------

function getCoordinates(coordinatesFullURL) {
    try {
    fetch(coordinatesFullURL)
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

            console.log('Latitude:', lat);
            console.log('Longitude:', lon);

        // Call the function to create a location object
        createLocationObject(city, state, zipCode, lat, lon, displayName);

        })} /* End of try block */
        catch (error) {
            console.log('Couldn\'t return coordinates: ' + error);
        }

} /* End of getCoordinates function */


// Create a location class and then an object to store the search criteria for population and later retrieval-----------------------------------------------------------

function createLocationObject(city, state, zipCode, lat, lon, displayName) {
    class Location {
        constructor(city, state, zipCode, lat, lon, displayName) {
            this.city = city;
            this.state = state;
            this.zipcode = zipCode;
            this.lat = lat;
            this.lon = lon;
            this.name = displayName;
        }
    }
    
    // Create the location object from the data from the API call

    const locationObject = new Location(city, state, zipCode, lat, lon, displayName);
    console.log('locationObject', locationObject);
    // Retrieve the locationArray from local storage (if exists)
    let locationArray = JSON.parse(localStorage.getItem('locationArray')) || [];
    // Add the new locationObject to the array
    locationArray.push(locationObject);
    // Save the updated array back to local storage
    localStorage.setItem('locationArray', JSON.stringify(locationArray));

    // Update the search history displayed on the page
    updateSearchHistoryUI();

} /* End of createLocationObject function */

// Function to get the current weather data-----------------------------------------------------------

function getWeatherData(lat, lon) {
    lat = locationObject.lat;
    lon = locationObject.lon;

    var currentWeatherAPIurl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly&appid=' + apiKey + '&units=imperial';

    fetch(currentWeatherAPIurl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);

            var displayName = data.name;
            var currentWeather = data.weather[0].description;
            var weatherIcon = data.weather[0].icon;
            var currentTemp = Math.round(data.main.temp);
            var currentHumidity = Math.round(data.main.humidity);
            var currentWindSpeed = Math.round(data.wind.speed);

            console.log('Location Name:', displayName);
            console.log('Current Conditions:', currentWeather);
            console.log ('Weather Icon:', weatherIcon);
            console.log('Current Temperature:', currentTemp);
            console.log('Current Humidity:', currentHumidity);
            console.log('Current Wind Speed:', currentWindSpeed);

            var weatherData = {
                displayName: displayName,
                currentWeather: currentWeather,
                weatherIcon: weatherIcon,
                currentTemp: currentTemp,
                currentHumidity: currentHumidity,
                currentWindSpeed: currentWindSpeed
            };

            var weatherDataArray = JSON.parse(localStorage.getItem('weatherDataArray')) || [];
            weatherDataArray.push(weatherData);
            localStorage.setItem('weatherDataArray', JSON.stringify(weatherDataArray));

            console.log('Saved Weather Data:', weatherDataArray);

            // Call the function to display the weather data
            displayWeatherData();
        })
        .catch(error => console.log('Rut ro! Current weather data could not be fetched: ' + error));
}

// Function to get the 5-day forecast data-----------------------------------------------------------

function getFiveDayForecast(locationObject) {
    var lat = locationObject.lat;
    var lon = locationObject.lon;
    var fivedayWeatherAPIurl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly&appid=' + apiKey + '&units=imperial';

    try {
        fetch(fivedayWeatherAPIurl)
            .then(function(response) {
                return response.json();
            })
            .then(function(dataFiveDay) {
                // Extract weather data from the data object
                console.log(dataFiveDay);

                var forecastArray = dataFiveDay.list;
                console.log(forecastArray);

                // Save the forecastArray to local storage
                localStorage.setItem('forecastArray', JSON.stringify(forecastArray));


                // Call the function to display the weather data
                displayForecastData(forecastArray);
            });
    } catch (error) {
        console.log('Rut ro! Error: ' + error);
    }
}

function displayWeatherData() {
    // Display the weather data on the page
    // Retrieve the weatherDataArray from local storage and parse it back into an array
    var weatherDataArray = JSON.parse(localStorage.getItem('weatherDataArray')) || [];

    // If there's at least one item in the array, display the data of the last item
    if (weatherDataArray.length > 0) {
        var weatherData = weatherDataArray[weatherDataArray.length - 1]; // Get the last item in the array

        document.getElementById("put-city").innerHTML = weatherData.displayName;
        var currentDate = new Date().toLocaleDateString();
        document.getElementById("put-date").innerHTML = currentDate;
        document.getElementById("put-conditions").innerHTML = weatherData.currentWeather + '<img src="http://openweathermap.org/img/w/' + weatherData.weatherIcon + '.png">';
        document.getElementById("put-temperature").innerHTML = weatherData.currentTemp;
        document.getElementById("put-humidity").innerHTML = weatherData.currentHumidity;
        document.getElementById("put-wind").innerHTML = weatherData.currentWindSpeed;
    }

    // If there are no items in the array, display a message
    else {
        document.getElementById("put-city").innerHTML = 'No data available';
        document.getElementById("put-date").innerHTML = '';
        document.getElementById("put-conditions").innerHTML = '';
        document.getElementById("put-temperature").innerHTML = '';
        document.getElementById("put-humidity").innerHTML = '';
        document.getElementById("put-wind").innerHTML = '';
    }

    // Call the function to get the 5-day forecast
    getFiveDayForecast();
}

// Display the 5-day forecast data on the page-----------------------------------------------------------

function displayForecastData(forecastArray) {

    const numberOfDays = 5;

    // Retrieve the forecastArray from local storage and parse it back into an array
    var forecastArray = JSON.parse(localStorage.getItem('forecastArray')) || [];

    // Loop through the forecastArray and display the data on the page
    for (var i = 0; i < numberOfDays; i++) {
        var forecast = forecastArray[i];
        var forecastDate = forecast.dt_txt;
        var forecastTemp = forecast.main.temp;
        var forecastHumidity = forecast.main.humidity;
        var forecastWeather = forecast.weather[0].description;
        var forecastIcon = forecast.weather[0].icon;

        // Create a div element for each forecast item
        var forecastItem = document.createElement('div');
        forecastItem.classList.add('column', 'is-one-fifth');

        // Create a paragraph element to display the date
        var forecastDateElement = document.createElement('p');
        forecastDateElement.textContent = forecastDate;
        forecastItem.appendChild(forecastDateElement);

        // Create an image element to display the weather icon
        var forecastIconElement = document.createElement('img');
        forecastIconElement.src = 'http://openweathermap.org/img/w/' + forecastIcon + '.png';
        forecastItem.appendChild(forecastIconElement);

        // Create a paragraph element to display the temperature
        var forecastTempElement = document.createElement('p');
        forecastTempElement.textContent = 'Temp: ' + forecastTemp;
        forecastItem.appendChild(forecastTempElement);

        // Create a paragraph element to display the humidity
        var forecastHumidityElement = document.createElement('p');
        forecastHumidityElement.textContent = 'Humidity: ' + forecastHumidity;
        forecastItem.appendChild(forecastHumidityElement);

        // Create a paragraph element to display the weather description
        var forecastWeatherElement = document.createElement('p');
        forecastWeatherElement.textContent = forecastWeather;
        forecastItem.appendChild(forecastWeatherElement);

        // Append the forecast item to the forecast container
        document.getElementById('put-forecast').appendChild(forecastItem);
    }
}



// Function to retrieve search history from local storage
function getSearchHistory() {

    const searchedJSON = localStorage.getItem('locationArray');

    // Parse the JSON string to convert it back to an array
    const searched = JSON.parse(searchedJSON) || [];

    return searched;
}

// Function to update the search history displayed on the page
function updateSearchHistoryUI() {
    const searched = getSearchHistory();
    const historyContainer = document.getElementById('put-search-history');

    // Clear prior search history displayed on the page
    historyContainer.innerHTML = '';

    // Loop through each searched location and create a button with delete icon for it
    searched.forEach((locationObject, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('search-item', 'inline');

        const retrieveButton = document.createElement('button');

        if (searched === 'zip-search' && locationObject.city && locationObject.state) { 
            retrieveButton.textContent = `${locationObject.displayName} \n 
            ${locationObject.city}, ${locationObject.state},\n
            ${searchCriteria.zipcode}`;
        } else if (searchType === 'city-state-search') {
            retrieveButton.textContent = `${locationObject.displayName} \n 
            ${locationObject.city}, ${locationObject.state}`;
        } else {
            retrieveButton.textContent = `${locationObject.displayName} \n 
            ${searchCriteria.zipcode}`;
        }

        retrieveButton.classList.add('search-button', 'button');
    
        // Attach event listener to the button to trigger API call
        retrieveButton.addEventListener('click', () => {
            getWeatherData(locationObject.lat, locationObject.lon);
        });

        // Create a delete button for each search item
        const deleteButton = document.createElement('button');

        deleteButton.innerHTML = '&#x274C;'; // Unicode for 'X' character (delete icon)
        deleteButton.classList.add('delete-button', 'button', 'is-danger', 'is-outlined');

        // Attach event listener to the delete button to remove the search item
        deleteButton.addEventListener('click', () => {
            removeSearchItem(index);
        });

        listItem.appendChild(retrieveButton);
        listItem.appendChild(deleteButton);

        // Append the button to the history container
        historyContainer.appendChild(listItem);
    }); /* End of forEach loop */

    // Create and append the "Clear All" button
    const clearAllButton = document.createElement('button');
    clearAllButton.textContent = 'Clear All';
    clearAllButton.classList.add('clear-all-button', 'button', 'is-dark', 'is-outlined', 'mt-3');
    clearAllButton.addEventListener('click', clearAllSearchHistory);
    historyContainer.appendChild(clearAllButton);
} /* End of updateSearchHistoryUI function */

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