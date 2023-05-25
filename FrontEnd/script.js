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
  const editButton = document.getElementById('edit-button');

  // Vérifie si l'utilisateur est connecté 
  const token = localStorage.getItem('token');
  if (token) {
    // Si l'utilisateur est connecté, affiche le bouton "modifier"
    editButton.style.display = 'block';
  } else {
    // Sinon, masque le bouton "modifier"
    editButton.style.display = 'none';
  }
});


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
    container.classList.add('gallery-item');


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
  // Vérifie si le bouton cliqué ou son parent est un bouton de suppression
  if ((event.target.tagName === 'BUTTON' && event.target.classList.contains('delete-button')) 
    || (event.target.parentNode.tagName === 'BUTTON' && event.target.parentNode.classList.contains('delete-button'))) {
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


document.addEventListener('DOMContentLoaded', () => {
  // Bouton d'ouverture du formulaire
  const addPhotoButton = document.querySelector('#add-photo-button');
  addPhotoButton.addEventListener('click', openModalForm);

  // Bouton de fermeture du formulaire
  const closeFormButton = document.querySelector('#close-form-button');
  closeFormButton.addEventListener('click', closeModalForm);

  //Bouton de retour vers la modale
  const backToModalButton = document.querySelector('#back-button');
  backToModalButton.addEventListener('click', returnToModal);

  // Cliquez en dehors du formulaire pour la fermer
  window.onclick = (event) => {
    const modalForm = document.querySelector('#modal-form');
    if (event.target === modalForm) {
      closeModalForm();
      resetForm();
    }
  }
});

// Fonction pour ouvrir le formulaire
async function openModalForm() {
  const modalForm = document.querySelector('#modal-form');
  const workCategorySelect = document.querySelector('#work-category');

  const response = await fetch('http://localhost:5678/api/categories');
  const categories = await response.json();

  while (workCategorySelect.firstChild) {
    workCategorySelect.removeChild(workCategorySelect.firstChild);
  }

  // Ajoutez une première option vide
  const emptyOption = document.createElement('option');
  emptyOption.value = "";
  emptyOption.textContent = "";
  workCategorySelect.appendChild(emptyOption);

  if(categories && Array.isArray(categories)) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      workCategorySelect.appendChild(option);
    });
  }

  // Affiche le formulaire
  modalForm.classList.remove('hidden');
  // Ferme la modale
  closeModal();
}

// Fonction pour fermer le formulaire
function closeModalForm() {
  const modalForm = document.querySelector('#modal-form');
  modalForm.classList.add('hidden');

  // Réinitialiser le formulaire
  resetForm();
}

function returnToModal() {
  closeModalForm();
  openModal();
  resetForm();
}


// Fonction pour réinitialiser le formulaire et l'affichage des éléments
function resetForm() {
  const uploadForm = document.getElementById('uploadForm');
  const image = document.getElementById("displayImage");
  const uploadContainer = document.querySelector('.upload-container');

  // Réinitialiser le formulaire
  uploadForm.reset();

  // Rétablir l'affichage des éléments
  image.style.display = "none";
  Array.from(uploadContainer.children).forEach(child => {
    // Ne modifie pas l'affichage de l'input file et de l'image
    if(child.id !== "displayImage" && child.id !== "imageUpload") {
      child.style.display = "block";
    }
  });
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Empêche la soumission du formulaire
});

document.getElementById('uploadButton').addEventListener('click', function(event) {
  event.preventDefault(); // Empêche le comportement par défaut
  document.getElementById('imageUpload').click();
});

document.getElementById("imageUpload").addEventListener("change", function(event){
  let file = event.target.files[0];
  let imageUrl = URL.createObjectURL(file);

  let image = document.getElementById("displayImage");
  image.src = imageUrl;
  image.style.display = "block"; // Rend l'image visible
  
  let uploadContainer = document.querySelector('.upload-container');
  
  Array.from(uploadContainer.children).forEach(child => {
    if(child.id !== "displayImage") {
      child.style.display = "none";
    }
  });
});

// Envoie le nouveau travail
document.getElementById('uploadForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Empêche la soumission du formulaire

  const titleInput = document.querySelector('#work-title');
  const categorySelect = document.querySelector('#work-category');
  const imageUpload = document.querySelector('#imageUpload');

  const title = titleInput.value;
  const category = categorySelect.value;
  const image = imageUpload.files[0];

  const formData = new FormData();
  formData.append('image', image);
  formData.append('title', title);
  formData.append('category', category);

  try {
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const work = await response.json();
    console.log('Work created', work);
    closeModalForm();
    removeExistingWorks();
    const works = await fetchWorks();
    displayWorks(works);
  } catch (error) {
    console.error('Erreur lors de la création du travail', error);
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('work-title');
  const categoryInput = document.getElementById('work-category');
  const imageInput = document.getElementById('imageUpload');
  const submitButton = document.getElementById('work-submit');

  titleInput.addEventListener('change', validateForm);
  categoryInput.addEventListener('change', validateForm);
  imageInput.addEventListener('change', validateForm);

  function validateForm() {
    // Vérifie si tous les champs sont remplis
    if (titleInput.value && categoryInput.value && imageInput.files.length > 0) {
      // Si oui, ajoute la classe 'logged' au bouton de soumission
      submitButton.classList.add('logged');
    } else {
      // Sinon, retire la classe 'logged'
      submitButton.classList.remove('logged');
    }
  }
});