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

document.addEventListener('DOMContentLoaded', () => {
  // Bouton d'ouverture de la modale
  const editButton = document.querySelector('#edit-button');
  editButton.addEventListener('click', openModal);

  // Bouton de fermeture de la modale
  const closeButton = document.querySelector('#close-button');
  closeButton.addEventListener('click', closeModal);

  // Cliquez en dehors de la modale pour la fermer
  window.onclick = (event) => {
    const modal = document.querySelector('#modal');
    if (event.target === modal) {
      closeModal();
    }
  }
});

// Fonction pour ouvrir la modale et afficher les images de la galerie
function openModal() {
  const modal = document.querySelector('#modal');
  const gallery = document.querySelector('#gallery');
  
  // Supprime les images existantes de la galerie
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }

// Ajoute les images à la galerie
allWorks.forEach((work, index) => {
  const container = document.createElement('div');
  container.style.position = 'relative'; // Ajouter le positionnement relatif au conteneur

  const img = document.createElement('img');
  img.src = work.imageUrl;
  img.alt = work.title;
  container.appendChild(img);

  const editText = document.createElement('p');
  editText.textContent = 'éditer';
  container.appendChild(editText);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-button'); // Ajoutez la classe delete-button
  deleteButton.dataset.workIndex = index; // Ajouter l'attribut data-work-index au bouton de suppression

  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fas', 'fa-trash-can');
  deleteButton.appendChild(deleteIcon);

  container.appendChild(deleteButton);
  
  gallery.appendChild(container);
});

  // Affiche la modale
  modal.classList.remove('hidden');
}

// Fonction pour fermer la modale
function closeModal() {
  const modal = document.querySelector('#modal');
  modal.classList.add('hidden');
}

// Gestionnaire d'événements pour le bouton de suppression
document.addEventListener('click', async (event) => {
  if (event.target.tagName === 'BUTTON' || event.target.classList.contains('fa-trash-can')) {
    let workIndex = event.target.dataset.workIndex;
    if (!workIndex && event.target.parentNode.tagName === 'BUTTON') {
      workIndex = event.target.parentNode.dataset.workIndex;
    }
    if (workIndex !== undefined) {
      await deleteWork(parseInt(workIndex));
      // Refresh the works
      removeExistingWorks();
      const works = await fetchWorks();
      displayWorks(works);
    } else {
      console.error('Impossible de trouver ou récupérer l\'ID du travail');
    }
  }
});

// Fonction pour supprimer un travail
async function deleteWork(workIndex) {
  try {
    const work = allWorks[workIndex];
    if (!work) {
      console.error('Impossible de trouver le travail');
      return;
    }

    const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      console.log('Travail supprimé');
    } else {
      console.error('Erreur lors de la suppression du travail', response);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du travail', error);
  }
}
