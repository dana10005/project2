const apiKey = 'dad33d8eb8cc82b771da621e1bcaeaaa';  // Замените на ваш API ключ
const unitButton = document.getElementById('unit-toggle');
let unit = 'metric';  // По умолчанию используется Цельсий

// Функция для получения данных о погоде
async function fetchWeather(city) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === '404') {
            throw new Error('City not found');
        }

        displayCurrentWeather(weatherData);
        fetchForecast(city);
    } catch (error) {
        document.getElementById('error-message').style.display = 'block';
    }
}

// Функция для отображения текущей погоды
function displayCurrentWeather(data) {
    const city = data.name;
    const description = data.weather[0].description;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;

    document.getElementById('city-name').innerText = city;
    document.getElementById('weather-condition').innerText = description;
    document.getElementById('temp-value').innerText = temperature;
    document.getElementById('humidity-value').innerText = humidity;
    document.getElementById('wind-speed-value').innerText = windSpeed;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${iconCode}.png`;
}

// Функция для получения прогноза на 5 дней
async function fetchForecast(city) {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    forecastData.list.slice(0, 5).forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        const date = new Date(day.dt * 1000);
        const tempMin = day.main.temp_min;
        const tempMax = day.main.temp_max;
        const description = day.weather[0].description;
        const iconCode = day.weather[0].icon;

        dayElement.innerHTML = `
            <h4>${date.toLocaleDateString()}</h4>
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
            <p>${tempMin}° / ${tempMax}°</p>
            <p>${description}</p>
        `;
        forecastContainer.appendChild(dayElement);
    });
}

// Функция для включения геолокации
async function getGeolocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const geolocationResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
            const geolocationData = await geolocationResponse.json();

            displayCurrentWeather(geolocationData);
            fetchForecastFromCoords(lat, lon);
        });
    } else {
        alert('Геолокация не поддерживается этим браузером.');
    }
}

// Функция для прогноза на 5 дней по геолокации
async function fetchForecastFromCoords(lat, lon) {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);
}

// Добавление автозаполнения
document.getElementById('search-input').addEventListener('input', async (e) => {
    const searchTerm = e.target.value;
    if (searchTerm.length >= 3) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${searchTerm}&type=like&units=${unit}&appid=${apiKey}`);
        const data = await response.json();
        const results = data.list;

        const suggestContainer = document.getElementById('autocomplete-results');
        suggestContainer.innerHTML = '';

        results.forEach(city => {
            const div = document.createElement('div');
            div.textContent = city.name;
            div.addEventListener('click', () => {
                fetchWeather(city.name);
                suggestContainer.innerHTML = '';
                document.getElementById('search-input').value = '';
            });
            suggestContainer.appendChild(div);
        });

        suggestContainer.style.display = results.length ? 'block' : 'none';
    }
});

// Переключение единиц измерения температуры
unitButton.addEventListener('click', () => {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    unitButton.innerText = unit === 'metric' ? '°C' : '°F';
    const city = document.getElementById('city-name').innerText;
    if (city) {
        fetchWeather(city);
    }
});

// Получение погоды для текущего местоположения
document.getElementById('geolocation-button').addEventListener('click', getGeolocationWeather);

