const apiKey = 'cb9551d38669bc60af2fa31501f0b414';  // Замените на ваш API ключ
const apiUrl = 'https://api.themoviedb.org/3';

// DOM элементы
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const autoSuggestResults = document.getElementById('auto-suggest-results');
const moviesContainer = document.getElementById('movies-container');
const movieDetailsModal = document.getElementById('movie-details-modal');
const closeModal = document.getElementById('close-modal');
const movieTitle = document.getElementById('movie-title');
const movieOverview = document.getElementById('movie-overview');
const movieRating = document.getElementById('movie-rating');
const movieRuntime = document.getElementById('movie-runtime');
const movieCast = document.getElementById('movie-cast');
const moviePoster = document.getElementById('movie-poster');
const addToWatchlistButton = document.getElementById('add-to-watchlist');
const sortBySelect = document.getElementById('sort-by');
const watchlistButton = document.getElementById('watchlist-button'); 

// Массив для хранения фильмов (будет использоваться для избранного)
let movies = [];

// Получение фильмов с API
async function fetchMovies(query, sortBy = 'popularity.desc') {
    const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}&sort_by=${sortBy}`);
    const data = await response.json();
    return data.results;
}

// Получение подробной информации о фильме
async function fetchMovieDetails(movieId) {
    const response = await fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}`);
    return await response.json();
}

// Получение актеров фильма
async function fetchMovieCast(movieId) {
    const response = await fetch(`${apiUrl}/movie/${movieId}/credits?api_key=${apiKey}`);
    return await response.json();
}

// Показать фильм в карточке
function showMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const moviePoster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    movieCard.innerHTML = `
        <img src="${moviePoster}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date}</p>
    `;
    
    movieCard.onclick = () => showMovieDetails(movie.id);
    moviesContainer.appendChild(movieCard);
}

// Показать список фильмов
function showMovies(moviesList) {
    moviesContainer.innerHTML = '';
    moviesList.forEach(movie => showMovieCard(movie));
}

// Показать подробности фильма в модальном окне
async function showMovieDetails(movieId) {
    const movieDetails = await fetchMovieDetails(movieId);
    const castDetails = await fetchMovieCast(movieId);

    movieTitle.innerText = movieDetails.title;
    movieOverview.innerText = movieDetails.overview;
    movieRuntime.innerText = `Длительность: ${movieDetails.runtime} минут`;
    moviePoster.src = movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

    movieCast.innerHTML = castDetails.cast.slice(0, 5).map(actor => `<li>${actor.name}</li>`).join('');

    movieRating.innerText = movieDetails.vote_average;

    addToWatchlistButton.style.display = 'block';  
    movieDetailsModal.style.display = 'flex';  
    movieDetailsModal.dataset.movieId = movieId; 
}

// Закрытие модального окна
closeModal.onclick = () => {
    movieDetailsModal.style.display = 'none';
};

// Функция для добавления в избранное
function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    // Проверяем, не добавлен ли фильм уже в избранное
    if (!watchlist.some(item => item.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));  
        alert('Фильм добавлен в избранное!');
    } else {
        alert('Этот фильм уже в избранном!');
    }
}

// Обработчик для кнопки "Добавить в избранное"
addToWatchlistButton.addEventListener('click', () => {
    const movieId = movieDetailsModal.dataset.movieId;  
    const movie = movies.find(m => m.id === parseInt(movieId));  
    addToWatchlist(movie);
});

// Функция для отображения избранных фильмов
function showWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (watchlist.length === 0) {
        alert("Ваше избранное пусто!");
        return;
    }

    moviesContainer.innerHTML = '';
    watchlist.forEach(movie => showMovieCard(movie));
}

// Кнопка для отображения избранных фильмов
watchlistButton.addEventListener('click', showWatchlist);

// Автодополнение
async function handleSearchInput() {
    const query = searchInput.value;
    if (query.length > 2) {
        const movies = await fetchMovies(query);
        autoSuggestResults.innerHTML = movies.map(movie => `<div onclick="selectAutoSuggest('${movie.title}')">${movie.title}</div>`).join('');
        autoSuggestResults.style.display = 'block';
    } else {
        autoSuggestResults.style.display = 'none';
    }
}

// Выбор автодополнения
function selectAutoSuggest(title) {
    searchInput.value = title;
    autoSuggestResults.style.display = 'none';
    searchMovies();
}

// Поиск фильмов
async function searchMovies() {
    const query = searchInput.value;
    const sortBy = sortBySelect.value;  
    movies = await fetchMovies(query, sortBy);  
    showMovies(movies);  
}

// Обработчики событий
searchInput.addEventListener('input', handleSearchInput);
searchButton.addEventListener('click', searchMovies);

// Обработчик события для изменения сортировки
sortBySelect.addEventListener('change', searchMovies);
