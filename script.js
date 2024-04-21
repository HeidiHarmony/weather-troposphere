document.getElementById('search-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    var city = document.getElementById('city-select').value;
    var state = document.getElementById('state-select').value;
    var zipCode = document.getElementById('zipcode-select').value;

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
        APIurl = baseURL + endpoint + city + ',' + state + ',' + 'US' + '&limit=5&appid=' + apiKey;
    }
    console.log('API URL: ' + APIurl);
    return APIurl;
}

function getCoordinates(APIurl) {
    try {
        fetch(APIurl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // Extract lat and lon values from the data object
                var lat = data.lat;
                var lon = data.lon;
                
                // Now you can use lat and lon variables as needed
                console.log('Latitude:', lat);
                console.log('Longitude:', lon);

                // Call the next function to get weather data
                getWeatherData(lat, lon);
            });
    } catch (error) {
        console.log('Error: ' + error);
    }
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

                var city = data.name;
                var currentWeather = data.weather[0].description;
                var weatherIcon = data.weather[0].icon;
                var currentTemp = data.main.temp;
                currentTemp = Math.round(currentTemp);
                var currentHumidity = data.main.humidity;
                currentHumidity = Math.round(currentHumidity);
                var currentWindSpeed = data.wind.speed;
                currentWindSpeed = Math.round(currentWindSpeed);

                console.log('City:', city);
                console.log('Current Conditions:', currentWeather);
                console.log ('Weather Icon:', weatherIcon);
                console.log('Current Temperature:', currentTemp);
                console.log('Current Humidity:', currentHumidity);
                console.log('Current Wind Speed:', currentWindSpeed);

                var weatherData = {
                    city: city,
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
