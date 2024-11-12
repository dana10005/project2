// API Key для Spoonacular
const apiKey = '76e642c959d443bfa6dfdbaa8b2019b4'; // Замените на свой API ключ
const searchBar = document.getElementById('search-bar');
const recipesContainer = document.getElementById('recipes-container');
const recipeModal = document.getElementById('recipe-modal');
const closeBtn = document.querySelector('.close-btn');
const addToFavoritesBtn = document.getElementById('add-to-favorites');
let currentRecipe = null;

// Функция для очистки HTML-тегов из текста
function cleanHtmlText(text) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Получаем рецепты по запросу
async function fetchRecipes(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.results);
}

// Отображаем рецепты в виде карточек
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Preparation time: 30 mins</p>
        `;
        card.addEventListener('click', () => showRecipeDetails(recipe.id));
        recipesContainer.appendChild(card);
    });
}

// Показываем подробности рецепта в модальном окне
async function showRecipeDetails(recipeId) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    const recipe = await response.json();
    currentRecipe = recipe;

    // Заполняем модальное окно данными рецепта
    document.getElementById('recipe-title').innerText = recipe.title;
    document.getElementById('recipe-img').src = recipe.image;
    
    // Очистка HTML-тегов из описания и отображение его
    document.getElementById('recipe-description').innerText = cleanHtmlText(recipe.summary);

    // Отображение ингредиентов
    const ingredientsList = document.getElementById('recipe-ingredients');
    ingredientsList.innerHTML = '';
    recipe.extendedIngredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.innerText = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
        ingredientsList.appendChild(li);
    });

    // Отображение шагов приготовления
    const stepsList = document.getElementById('recipe-steps');
    stepsList.innerHTML = '';
    if (recipe.analyzedInstructions.length > 0) {
        recipe.analyzedInstructions[0].steps.forEach(step => {
            const li = document.createElement('li');
            li.innerText = step.step;
            stepsList.appendChild(li);
        });
    }

    // Показываем модальное окно
    recipeModal.style.display = 'block';
}

// Добавить рецепт в избранное
function addToFavorites() {
    if (!currentRecipe) return;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(currentRecipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(); // Показываем уведомление после добавления
}

// Закрыть модальное окно
closeBtn.addEventListener('click', () => {
    recipeModal.style.display = 'none';
});

// Логика для поиска рецептов
searchBar.addEventListener('input', (event) => {
    const query = event.target.value;
    if (query) {
        fetchRecipes(query);
    } else {
        recipesContainer.innerHTML = '';
    }
});

// Добавить рецепт в избранное
addToFavoritesBtn.addEventListener('click', () => {
    addToFavorites();
});

// Функция для отображения уведомления
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Уведомление исчезает через 3 секунды
}

// Загружаем данные, если в localStorage есть избранные рецепты
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(recipe => {
        displayFavorites(recipe);
    });
}

// Функция для отображения избранных рецептов (если нужно вывести их на отдельной странице)
function displayFavorites(recipe) {
    // Можно добавить вывод избранных рецептов в другой контейнер или список
    console.log('Избранный рецепт:', recipe.title);
}

// Инициализация, если нужно отобразить избранные рецепты при загрузке страницы
loadFavorites();
