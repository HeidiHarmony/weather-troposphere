const baseURL = 'https://api.openweathermap.org/geo/1.0/';
const apiKey = '2d84c33cb1d0e6e3ab00bca6bf053ead';

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Call updateSearchHistoryUI when the page loads to display initial search history
updateSearchHistoryUI();
});

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
            zipCode = '';
        } else {
            searchType = 'zip-search';
            console.log('Searching by', searchType, zipCode);
            city = '';
            state = '';
        }

        var coordinatesFullURL = constructAPIurl(searchType, city, state, zipCode);

        console.log('Next stop is getCoordinates function.');


 // Perform API call to get the longitude and latitude
        
    getCoordinates(coordinatesFullURL, city, state, zipCode, searchType);
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

    return coordinatesFullURL; /*Return to searchHandler function */
}

// Function to make API call and get the coordinates of the location-----------------------------------------------------------

function getCoordinates(coordinatesFullURL, city, state, zipCode, searchType) {
    try {
    fetch(coordinatesFullURL)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
            console.log(data);
            var lat, lon, displayName;

            // Check if data is an array
                if (Array.isArray(data)) {
                    // If it's an array, extract lat and lon from the first object
                    lat = data[0].lat;
                    lon = data[0].lon;
                    displayName = data[0].name;
                } else {
                    // If it's not an array, extract lat and lon directly from the object
                    lat = data.lat;
                    lon = data.lon;
                    displayName = data.name;

                    console.log('Latitude:', lat);
                    console.log('Longitude:', lon);
                    console.log('Display Name:', displayName);
                }
 // Call the function to create a location object
 createLocationObject(city, state, zipCode, lat, lon, displayName, searchType);
            })
        } catch (error) {
            console.log('Rut ro! Coordinates could not be fetched: ' + error);
        };
          

} /* End of getCoordinates function */


// Create a location class and then an object to store the search criteria for population and later retrieval-----------------------------------------------------------

function createLocationObject(city, state, zipCode, lat, lon, displayName, searchType) {

    class Location {
        constructor(city, state, zipCode, lat, lon, displayName, searchType) {
            if (city === '') {
                this.city = '';
            } else {
                this.city = city;
            }
            if (state === '') {
                this.state = '';
            } else {
                this.state = state;
            }
            if (zipCode === '') {
                this.zipcode = '';
            } else {
                this.zipcode = zipCode;
            }
            this.lat = lat;
            this.lon = lon;
            this.displayName = displayName;
            this.searchType = searchType;
        }
    }
    
    // Create the location object from the data from the API call

    const locationObject = new Location(city, state, zipCode, lat, lon, displayName, searchType);
    console.log('locationObject', locationObject);
    // Retrieve the locationArray from local storage (if exists)
    let locationArray = JSON.parse(localStorage.getItem('locationArray')) || [];
    // Add the new locationObject to the array
    locationArray.push(locationObject);
    // Save the updated array back to local storage
    localStorage.setItem('locationArray', JSON.stringify(locationArray));

    console.log('locationArray', locationArray);

    getWeatherData(locationObject);

    // Update the search history displayed on the page
    updateSearchHistoryUI(locationObject, locationArray);

} /* End of createLocationObject function */

// Function to get the current weather data-----------------------------------------------------------

// Function to get the current weather data
function getWeatherData(locationObject) {
    const lat = locationObject.lat;
    const lon = locationObject.lon;

    const currentWeatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=imperial`;

    fetch(currentWeatherAPIurl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather API response:', data);

            const displayName = data.name;
            const currentWeather = data.weather[0].description;
            const weatherIcon = data.weather[0].icon;
            const currentTemp = Math.round(data.main.temp);
            const currentHumidity = Math.round(data.main.humidity);
            const currentWindSpeed = Math.round(data.wind.speed);

            const weatherData = {
                displayName,
                currentWeather,
                weatherIcon,
                currentTemp,
                currentHumidity,
                currentWindSpeed
            };

            console.log('Weather Data:', weatherData);

            // Save weather data to local storage
            const weatherDataArray = JSON.parse(localStorage.getItem('weatherDataArray')) || [];
            weatherDataArray.push(weatherData);
            localStorage.setItem('weatherDataArray', JSON.stringify(weatherDataArray));

            // Call the function to display the weather data
            displayWeatherData(weatherData, locationObject);
        })
        .catch(error => {
            console.error('Rut ro! Current weather data could not be fetched:', error);
         
        });
}


// Function to get the 5-day forecast data-----------------------------------------------------------

function getFiveDayForecast() {

    // Retrieve the location object from local storage
    var locationObject = JSON.parse(localStorage.getItem('locationArray')).slice(-1)[0] ;


    var lat = locationObject.lat;
    console.log('Latitude:', lat);

    var lon = locationObject.lon;
    console.log('Longitude:', lon);

    var fivedayWeatherAPIurl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=imperial';
    console.log('5-day forecast API URL:', fivedayWeatherAPIurl);

        fetch(fivedayWeatherAPIurl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP error ' + response.status);
                }
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
                displayForecastData();
            });
}

function displayWeatherData() {
    // Display the weather data on the page
    // Retrieve the weatherDataArray from local storage and parse it back into an array
    var weatherDataArray = JSON.parse(localStorage.getItem('weatherDataArray')) || [];

    // If there's at least one item in the array, display the data of the last item
    if (weatherDataArray.length > 0) {
        console.log('weatherDataArray has data');
        var weatherData = weatherDataArray[weatherDataArray.length - 1]; // Get the last item in the array
        console.log('weatherData:', weatherData);

        document.getElementById("put-city").innerHTML = weatherData.displayName;
        var currentDate = new Date().toLocaleDateString();
        document.getElementById("put-date").innerHTML = currentDate;
        document.getElementById("put-conditions").innerHTML = weatherData.currentWeather + '<img src="https://openweathermap.org/img/w/' + weatherData.weatherIcon + '.png">';
        document.getElementById("put-temperature").innerHTML = weatherData.currentTemp;
        document.getElementById("put-humidity").innerHTML = weatherData.currentHumidity;
        document.getElementById("put-wind").innerHTML = weatherData.currentWindSpeed;
    }


    // If there are no items in the array, display a message
/*     else {
        console.error('No weather data available.');
        alert('No weather data available.');
    } */

    // Call the function to get the 5-day forecast
    getFiveDayForecast();
}

// Display the 5-day forecast data on the page-----------------------------------------------------------

function displayForecastData() {
    const numberOfDays = 5;
    const numberOfReadingsPerDay = 8;
    const totalReadings = numberOfDays * numberOfReadingsPerDay;

    // Retrieve the forecastArray from local storage and parse it back into an array
    var forecastArray = JSON.parse(localStorage.getItem('forecastArray')) || [];
    var dayArray = [];

    // Loop through the forecastArray and display the data on the page
    for (var d = 1; d <= numberOfDays; d++) {
        var i = 3 + (d - 1) * numberOfReadingsPerDay;
        if (i < totalReadings) {
            var forecast = forecastArray[i];
            dayArray[d] = forecast;

            const forecastDate = new Date(forecast.dt_txt).toLocaleDateString();
            const forecastDay = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'long' });
            const forecastTemp = Math.round(forecast.main.temp);
            const forecastHumidity = Math.round(forecast.main.humidity);
            const forecastWeather = forecast.weather[0].description;
            const forecastIcon = forecast.weather[0].icon;
            const forecastWindSpeed = Math.round(forecast.wind.speed);

            // Get the forecast container for the current day
            var forecastContainer = document.getElementById('put-day' + d + '-conditions');

            // Check if the forecast container has any child nodes
            // If it does, clear the container
            while (forecastContainer.firstChild) {
                forecastContainer.removeChild(forecastContainer.firstChild);
            }

            // Create and append elements to the forecast container
            appendElement(forecastContainer, 'h3', forecastDay + ' ' + forecastDate);
            appendElement(forecastContainer, 'p', forecastWeather);
            appendElement(forecastContainer, 'img', null, 'https://openweathermap.org/img/w/' + forecastIcon + '.png');
            appendElement(forecastContainer, 'p', 'Temp: ' + forecastTemp + '°F');
            appendElement(forecastContainer, 'p', 'Humidity: ' + forecastHumidity + '%');
            appendElement(forecastContainer, 'p', 'Wind: ' + forecastWindSpeed + ' mph');
        }
    }
}

function appendElement(parent, tagName, textContent, src) {
    var element = document.createElement(tagName);
    if (textContent) element.textContent = textContent;
    if (src) element.src = src;
    parent.appendChild(element);
}

// Function to retrieve search history from local storage
function getSearchHistory() {

    const searchedJSON = localStorage.getItem('locationArray');

    // Parse the JSON string to convert it back to an array
    const locationArray = JSON.parse(searchedJSON) || [];

    return locationArray;
}

// Function to update the search history displayed on the page
function updateSearchHistoryUI() {

    const locationArray = getSearchHistory();
    const historyContainer = document.getElementById('put-search-history');

    // Clear prior search history displayed on the page
    historyContainer.innerHTML = '';

    // Loop through each searched location and create a button with delete icon for it
    locationArray.forEach((locationObject, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('search-item', 'inline');

        const retrieveButton = document.createElement('button');

        if (locationObject.typeSearch === 'zip-search' && locationObject.city && locationObject.state) { 
            retrieveButton.innerHTML = `${locationObject.displayName} \n 
            <span style="font-weight: 400;">${locationObject.city}, ${locationObject.state}\n
            ${locationObject.zipcode}</span>`;
        } else if (locationObject.searchType === 'city-state-search') {
            retrieveButton.innerHTML = `${locationObject.displayName} \n 
            <span style="font-weight: 400;">${locationObject.city}, ${locationObject.state}</span>`;
        } else {
            retrieveButton.innerHTML = `${locationObject.displayName} \n 
            <span style="font-weight: 400;">${locationObject.zipcode}</span>`;
        }

        retrieveButton.classList.add('search-button', 'button');
    
        // Attach event listener to the button to trigger API call
        retrieveButton.addEventListener('click', () => {
            getWeatherData(locationObject);
        });

        // Create a delete button for each search item
        const deleteButton = document.createElement('button');

        deleteButton.innerHTML = '&#x274C;'; // Unicode for 'X' character (delete icon)
        deleteButton.classList.add('delete-button', 'button', 'is-ghost', 'is-small', 'pl-1');

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
    clearAllButton.classList.add('clear-all-button', 'button', 'is-info', 'is-small', 'mt-3');
    clearAllButton.addEventListener('click', clearAllSearchHistory);
    historyContainer.appendChild(clearAllButton);
} /* End of updateSearchHistoryUI function */

// Function to remove a search item from the search history
function removeSearchItem(index) {
    let locationArray = getSearchHistory();
    locationArray.splice(index, 1); // Remove the item at the specified index
    localStorage.setItem('locationArray', JSON.stringify(locationArray)); // Update local storage
    updateSearchHistoryUI(); // Update the displayed search history
}

// Function to clear all search history
function clearAllSearchHistory() {
    localStorage.removeItem('locationArray'); // Remove the search history from local storage

    if (localStorage.getItem('locationArray') === null) {
        console.log('Search history cleared.');
    }
    updateSearchHistoryUI(); // Update the displayed search history
}