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
    var weatherAPIurl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly&appid=' + apiKey;
    try {
        fetch(weatherAPIurl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // Extract weather data from the data object
                console.log(data);
                var currentWeather = data.weather[0].main;
                var currentTemp = data.weather[0].main.temp;
                var currentHumidity = data.current.humidity;
                var currentWindSpeed = data.current.wind_speed;

                // Now you can use the weather data as needed
               // console.log('Current Weather:', currentWeather);
                console.log('Current Temperature:', currentTemp);
                console.log('Current Humidity:', currentHumidity);
                console.log('Current Wind Speed:', currentWindSpeed);

                document.getElementById("put-city").innerHTML = city;
                var currentDate = new Date().toLocaleDateString();
                document.getElementById("put-date").innerHTML = currentDate;
                document.getElementById("put-conditions").innerHTML = currentWeather;

            });
    } catch (error) {
        console.log('Error: ' + error);
    }
}
