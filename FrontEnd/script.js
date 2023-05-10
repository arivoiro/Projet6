// Stocke tous les travaux récupérés de l'API
let allWorks = [];

// Attend que le contenu de la page soit chargé avant d'exécuter le code
document.addEventListener('DOMContentLoaded', async () => {
  removeExistingWorks();
  const works = await fetchWorks();
  await fetchCategories();
  displayWorks(works);
});

// Supprime les travaux existants du HTML
function removeExistingWorks() {
  const gallery = document.querySelector('.gallery');
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
}

// Récupère les travaux de l'API et les stocke dans la variable globale allWorks
async function fetchWorks() {
  const response = await fetch('http://localhost:5678/api/works');
  const works = await response.json();
  allWorks = works;
  return works;
}

// Affiche les travaux récupérés de l'API dans la galerie
function displayWorks(works) {
  const gallery = document.querySelector('.gallery');
  works.forEach(work => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = work.title;
    figure.appendChild(figcaption);

    gallery.appendChild(figure);
  });
}

// Récupère les catégories de l'API
async function fetchCategories() {
  const response = await fetch('http://localhost:5678/api/categories');
  const categories = await response.json();
  displayCategories(categories);
}

// Affiche les boutons de catégorie et ajoute un gestionnaire d'événements pour le filtrage
function displayCategories(categories) {
  const categoryMenu = document.querySelector('.category-menu');
  const allCategoriesButton = document.createElement('button');
  allCategoriesButton.textContent = 'Tous';
  allCategoriesButton.dataset.categoryId = 0;
  allCategoriesButton.classList.add('active');
  categoryMenu.appendChild(allCategoriesButton);

  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.dataset.categoryId = category.id;
    categoryMenu.appendChild(button);
  });

  // Gestionnaire d'événements pour détecter le clic sur un bouton de catégorie et filtrer les travaux
  categoryMenu.addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') {
      const categoryId = parseInt(event.target.dataset.categoryId);
      filterWorks(categoryId);

      // Supprime la classe "active" des autres boutons et ajoute-la au bouton sélectionné
      const buttons = categoryMenu.querySelectorAll('button');
      buttons.forEach(button => button.classList.remove('active'));
      event.target.classList.add('active');
    }
  });
}

// Filtre les travaux en fonction de l'ID de catégorie sélectionné
function filterWorks(categoryId) {
  const filteredWorks = categoryId === 0 ? allWorks : allWorks.filter(work => work.categoryId === categoryId);
  removeExistingWorks();
  displayWorks(filteredWorks);
}