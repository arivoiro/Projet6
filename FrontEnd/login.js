// Attends que le contenu de la page soit chargé avant d'exécuter le code
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');

  // Ajoute un écouteur d'événements pour détecter la soumission du formulaire
  loginForm.addEventListener('submit', async event => {
    // Empêche l'envoi par défaut du formulaire pour gérer manuellement la requête
    event.preventDefault();

    // Récupère les valeurs entrées dans les champs e-mail et mot de passe
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Envoie une requête POST à l'API avec les données de connexion en JSON
    const response = await fetch('http://localhost:5678/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    // Vérifie le statut de la réponse pour gérer les erreurs
    if (response.status === 401) {
      // Affiche une alerte si l'accès est non autorisé (mauvais mot de passe)
      alert("Erreur : Accès non autorisé. Veuillez vérifier vos informations de connexion.");
    } else if (response.status === 404) {
      // Affiche une alerte si l'utilisateur n'est pas trouvé (mauvais e-mail)
      alert("Erreur : Utilisateur non trouvé. Veuillez vérifier vos informations de connexion.");
    } else if (response.status === 200) {
      // Si la connexion est réussie, stocke le token dans le local storage
      localStorage.setItem('token', data.token);
      // Redirige l'utilisateur vers la page d'accueil
      window.location.href = 'index.html';
    } else {
      // Gère d'autres erreurs éventuelles en affichant une alerte
      alert("Une erreur inattendue s'est produite. Veuillez réessayer.");
    }
  });
});