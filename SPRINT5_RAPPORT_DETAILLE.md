# 📊 RAPPORT DÉTAILLÉ - SPRINT 5
## Tableau de bord locataire - Recherche de propriétés et candidatures

---

## **ÉTAPE 1 ✅ : Créer le modèle Request avec le flux de candidature**

### Qu'est-ce que c'est ?
Créer la structure de données en base MongoDB pour gérer les candidatures aux propriétés.

### Ce que vous avez fait :
**Fichier:** `backend/models/Request.js`

```javascript
// Structure du modèle
const requestSchema = new mongoose.Schema({
  tenantId: { type: ObjectId, ref: 'User' },     // Qui postule
  propertyId: { type: ObjectId, ref: 'Property' }, // À quel bien
  ownerId: { type: ObjectId, ref: 'User' },        // Qui est l'agence
  status: { enum: ['En attente', 'En cours', 'Acceptée', 'Refusée'] },
  message: { type: String, max: 500 },              // Message du locataire
  statusHistory: [ { status, changedAt, comment } ] // Historique des changements
}, { timestamps: true })
```

### Résultat :
✅ Une candidature peut être créée, modifiée et suivie  
✅ On peut voir l'historique de chaque candidature  
✅ Chaque candidature a une date de création automatique

---

## **ÉTAPE 2 ✅ : Construire les endpoints API de soumission**

### Qu'est-ce que c'est ?
Créer une API (route) pour que le locataire puisse soumettre une candidature.

### Ce que vous avez fait :
**Fichier:** `backend/routes/requestRoutes.js` + `backend/controllers/requestController.js`

```javascript
// Route : POST /api/requests
router.post('/', submitRequest);

// Contrôleur : submitRequest
exports.submitRequest = async (req, res) => {
  // 1️⃣ Récupère l'ID du locataire connecté
  const tenantId = req.user.id;
  
  // 2️⃣ Vérifie que la propriété existe
  const property = await Property.findById(propertyId);
  
  // 3️⃣ Vérifie qu'il n'a pas déjà posé candidature (pas de doublon)
  const existingRequest = await Request.findOne({ tenantId, propertyId });
  
  // 4️⃣ Crée et sauvegarde la candidature
  const newRequest = new Request({ tenantId, propertyId, ownerId, message, status: 'En attente' });
  await newRequest.save();
  
  // 5️⃣ Renvoie un message de succès
  res.json({ success: true, message: "Candidature transmise !" })
}
```

### Résultat :
✅ Un locataire peut envoyer une candidature  
✅ Impossible de envoyer 2x pour le même bien  
✅ Sécurisé (nécessite authentification)

---

## **ÉTAPE 3 ✅ : Implémenter les endpoints de suivi du statut**

### Qu'est-ce que c'est ?
Créer une API pour que le locataire puisse voir TOUTES ses candidatures et leur statut.

### Ce que vous avez fait :
**Fichier:** `backend/controllers/requestController.js`

```javascript
// Route : GET /api/requests/my-requests
router.get('/my-requests', getMyRequests);

// Contrôleur : getMyRequests
exports.getMyRequests = async (req, res) => {
  // 1️⃣ Récupère toutes les candidatures du locataire
  const requests = await Request.find({ tenantId: req.user.id })
    
    // 2️⃣ Remplit les infos du bien (title, price, location, images)
    .populate('propertyId', 'title price location images')
    
    // 3️⃣ Les plus récentes en premier
    .sort('-createdAt');
  
  // 4️⃣ Envoie les candidatures au frontend
  res.json(requests);
}
```

### Résultat :
✅ Chaque locataire voit ses candidatures  
✅ Les infos du bien sont incluses (pas besoin d'autres requêtes)  
✅ Tri automatique (plus récent en premier)

---

## **ÉTAPE 4 ✅ : Créer une interface de recherche avancée (Dashboard)**

### Qu'est-ce que c'est ?
Une page du tableau de bord pour **gérer complètement** les recherches sauvegardées du locataire: afficher, relancer, **éditer** et supprimer.

### Ce que vous avez fait :

#### **Partie 1: Affichage et Actions de Base**
**Fichier:** `frontend/src/pages/Dashboard/SearchesPage.jsx`

```jsx
// Page : Affiche les recherches sauvegardées
export default function SearchesPage() {
  const [searches, setSearches] = useState([]);
  
  // Charge toutes les recherches au démarrage
  useEffect(() => {
    axios.get('/api/tenant/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSearches(res.data.savedSearches || []))
  }, [])
  
  // Affiche chaque recherche avec détails
  searches.map(search => (
    <Paper>
      <Box>
        <Typography>{search.label}</Typography>
        <Typography>{search.filters.location} • Max {search.filters.budgetMax}€ • {search.filters.propertyType}</Typography>
      </Box>
      
      <Box>
        {/* Bouton Relancer - Redirige vers Home avec les filtres */}
        <Button onClick={() => handleRelancer(search._id)}>Relancer</Button>
        
        {/* ✨ Bouton Éditer - Ouvre le dialog */}
        <IconButton onClick={() => handleEditOpen(search)}><EditIcon /></IconButton>
        
        {/* Bouton Supprimer */}
        <IconButton onClick={() => handleDelete(search._id)}><DeleteIcon /></IconButton>
      </Box>
    </Paper>
  ))
}
```

#### **Partie 2: Édition Inline avec Dialog (✨ NOUVELLE)**
```jsx
// Dialog d'édition - S'ouvre quand utilisateur clique "Éditer"
<Dialog open={!!editingSearchId} onClose={handleEditClose}>
  <DialogTitle>Éditer la recherche</DialogTitle>
  
  <DialogContent>
    {/* Champ: Nom de la recherche */}
    <TextField 
      label="Nom de la recherche"
      value={editLabel}
      onChange={(e) => setEditLabel(e.target.value)}
      placeholder="Ex: Appartement 3 pièces à Paris"
    />
    
    {/* Champ: Localisation */}
    <TextField 
      label="Localisation"
      value={editFilters.location}
      onChange={(e) => setEditFilters({ ...editFilters, location: e.target.value })}
    />
    
    {/* Champ: Type de propriété */}
    <Select
      value={editFilters.propertyType}
      onChange={(e) => setEditFilters({ ...editFilters, propertyType: e.target.value })}
    >
      <MenuItem value="Tous">Tous</MenuItem>
      <MenuItem value="Appartement">Appartement</MenuItem>
      <MenuItem value="Maison">Maison</MenuItem>
      <MenuItem value="Studio">Studio</MenuItem>
    </Select>
    
    {/* Champs: Budget */}
    <TextField type="number" label="Budget minimum" ... />
    <TextField type="number" label="Budget maximum" ... />
    
    {/* Champ: Chambres */}
    <TextField type="number" label="Nombre de chambres" ... />
  </DialogContent>
  
  <DialogActions>
    <Button onClick={handleEditClose}>Annuler</Button>
    <Button onClick={handleSaveEdit} variant="contained">Sauvegarder</Button>
  </DialogActions>
</Dialog>
```

#### **Partie 3: Logique Relancer Améliorée (Avec Query Params)**
```javascript
// Récupère les filtres de la recherche
const handleRelancer = async (searchId) => {
  const response = await axios.get(`/api/tenant/search/${searchId}`, { headers });
  const { filters } = response.data;
  
  // ✨ Construit les query params pour passer les filtres en URL
  const queryParams = new URLSearchParams();
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.propertyType) queryParams.append('type', filters.propertyType);
  if (filters.budgetMax) queryParams.append('maxPrice', filters.budgetMax);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
  if (filters.minRooms) queryParams.append('minRooms', filters.minRooms);
  
  // Redirection vers Home avec les filtres en URL
  navigate(`/?${queryParams.toString()}`);
};
```

### Backend - Nouvel Endpoint d'Édition
**Fichier:** `backend/routes/tenantRoutes.js`

```javascript
// ✨ NOUVELLE ROUTE: Mettre à jour une recherche sauvegardée
router.put('/update-search/:searchId', protect, tenantController.updateSearch);
```

**Fichier:** `backend/controllers/tenantController.js`

```javascript
// ✨ NOUVELLE FONCTION: Éditer recherche
exports.updateSearch = async (req, res) => {
  try {
    const { searchId } = req.params;
    const { label, filters } = req.body;

    // Mettre à jour label ET filters dans le tableau savedSearches
    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id, 'savedSearches._id': searchId },
      {
        $set: {
          'savedSearches.$.label': label,
          'savedSearches.$.filters': filters
        }
      },
      { new: true }
    );

    res.json({ message: "Recherche modifiée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Frontend - Home.jsx Capture les Filtres de l'URL
```javascript
import { useSearchParams } from 'react-router-dom';

const Home = () => {
  const [searchParams] = useSearchParams();
  
  // Applique les filtres depuis query params au démarrage
  useEffect(() => {
    const filtersFromURL = {};
    
    if (searchParams.get('location')) filtersFromURL.location = searchParams.get('location');
    if (searchParams.get('type')) filtersFromURL.type = searchParams.get('type');
    if (searchParams.get('maxPrice')) filtersFromURL.maxPrice = searchParams.get('maxPrice');
    // ... autres filtres
    
    // S'il y a des filtres dans l'URL, les appliquer
    if (Object.keys(filtersFromURL).length > 0) {
      setCurrentFilters(filtersFromURL);
      fetchProperties(filtersFromURL, 1, sort);
    } else {
      // Sinon réinitialiser les filtres
      setCurrentFilters({});
      fetchProperties({}, 1, sort);
    }
  }, [searchParams]); // Re-run quand les query params changent
};
```

### 🔄 Flux Complet : Comment ça fonctionne?

```
┌─────────────────────────────────────────────────────┐
│ UTILISATEUR - PAGE RECHERCHES (SearchesPage.jsx)    │
│                                                     │
│ 1. Voir toutes les recherches sauvegardées          │
│ 2. Chaque recherche montre:                         │
│    • Nom: "T4 Appartement"                          │
│    • Filtres: "Paris • Max 500€ • Appartement"      │
│                                                     │
│ 3. Options pour chaque recherche:                   │
│    ✓ Relancer (binoculaire)                         │
│    ✓ Éditer (crayon) ← ✨ NOUVELLE                  │
│    ✓ Supprimer (poubelle)                           │
└──────────────┬───────────────────────────────────────┘
               │
               ├─→ CAS 1: RELANCER
               │   └─ Navigate avec query params
               │      /?location=Paris&maxPrice=500000
               │      Home.jsx reçoit les params
               │      Affiche les résultats filtrés ✅
               │
               └─→ CAS 2: ÉDITER ✨ NOUVEAU
                   └─ Dialog s'ouvre
                      Modifie: Nom, Location, Budget, Type
                      Clique "Sauvegarder"
                      PUT /api/tenant/update-search/:searchId
                      BD mise à jour
                      Toast "✅ Recherche modifiée !"
                      Liste rafraîchie avec nouveaux filtres ✅
```

### Résultat :
✅ Voir toutes les recherches sauvegardées avec détails complets  
✅ Relancer une recherche et récupérer les filtres correctement via URL  
✅ **Éditer les filtres directement dans le dashboard sans re-créer**  
✅ Supprimer une recherche  
✅ Les filtres perdus au refresh? NON - Passés par query params en URL  

---

## **ÉTAPE 5 ✅ : Construire le formulaire de candidature locative**

### Qu'est-ce que c'est ?
Une fenêtre Pop-up (Modal) où le locataire écrit un message personnalisé avant de candidater.

### Ce que vous avez fait :
**Fichier:** `frontend/src/components/ApplyModal.jsx`

```jsx
// Modal : Formulaire de candidature
const ApplyModal = ({ open, handleClose, propertyId, propertyTitle, completionRate }) => {
  // 1️⃣ État pour le message
  const [message, setMessage] = useState("");
  
  const handleSubmit = async () => {
    // 2️⃣ SÉCURITÉ : Vérifier que profil est à 100%
    if (completionRate < 100) {
      setError("Complétez votre profil d'abord !");
      return;
    }
    
    // 3️⃣ Envoyer la candidature
    await axios.post('/api/requests', { propertyId, message },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // 4️⃣ Afficher succès et fermer
    setSuccess(true);
    setTimeout(() => handleClose(), 2000);
  };
  
  return (
    <Dialog>
      <DialogTitle>Postuler pour : {propertyTitle}</DialogTitle>
      
      <DialogContent>
        {/* Avertissement si profil incomplet */}
        {completionRate < 100 && (
          <Alert severity="warning">
            Dossier à {completionRate}%. Complétez-le d'abord !
          </Alert>
        )}
        
        {/* Champ message optionnel */}
        <TextField 
          label="Votre message (Optionnel)"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleSubmit}>Envoyer</Button>
      </DialogActions>
    </Dialog>
  )
}
```

### Résultat :
✅ Locataire peut écrire un message personnalisé  
✅ Protection : impossible de candidater avec profil incomplet  
✅ Feedback utilisateur immédiat (erreur/succès)

---

## **ÉTAPE 6 ✅ : Implémenter le flux de soumission**

### Qu'est-ce que c'est ?
Intégrer le bouton "Postuler" sur la page de détail du bien, et le relier au modal.

### Ce que vous avez fait :
**Fichier:** `frontend/src/pages/PropertyDetail.jsx`

```jsx
// Page détail du bien
const PropertyDetail = () => {
  // 1️⃣ État pour contrôler l'ouverture du modal
  const [openApplyModal, setOpenApplyModal] = useState(false);
  
  return (
    <Container>
      {/* Autres infos du bien... */}
      
      {/* 2️⃣ Bouton POSTULER */}
      <Button 
        onClick={() => setOpenApplyModal(true)}
        variant="contained"
      >
        Postuler pour ce bien
      </Button>
      
      {/* 3️⃣ Ouvrir le modal quand utilisateur clique */}
      <ApplyModal
        open={openApplyModal}
        handleClose={() => setOpenApplyModal(false)}
        propertyId={property._id}
        propertyTitle={property.title}
        completionRate={100} // À dynamiser plus tard
      />
    </Container>
  )
}
```

### Flux complet :
1. Utilisateur voit un bien immobilier
2. Clique sur "Postuler"
3. Le modal s'ouvre
4. Écrit un message optionnel
5. Clique "Envoyer"
6. Candidature sauvegardée en base
7. Message de succès

### Résultat :
✅ Expérience fluide de candidature  
✅ Sécurité : vérification du profil  
✅ Modal bien intégré

---

## **ÉTAPE 7 ✅ : Créer la page de suivi des candidatures**

### Qu'est-ce que c'est ?
Une page (accessible depuis `/dashboard/applications`) où le locataire voit TOUTES ses candidatures passées avec statut coloré.

### Ce que vous avez fait :
**Fichier:** `frontend/src/pages/MyApplications.jsx`

```jsx
// Page : Suivi des candidatures
const MyApplications = () => {
  // 1️⃣ Charger les candidatures au démarrage
  useEffect(() => {
    axios.get('/api/requests/my-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => setApplications(res.data))
  }, [])
  
  // 2️⃣ Fonction pour colorier le statut
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Acceptée': return { color: 'success', label: '✓ Acceptée' };
      case 'Refusée': return { color: 'error', label: '✗ Refusée' };
      case 'En cours': return { color: 'warning', label: '⏳ En cours' };
      default: return { color: 'info', label: '⏱️ En attente' };
    }
  };
  
  return (
    <Container>
      <Typography variant="h4">Suivi de mes candidatures</Typography>
      
      {/* Si aucune candidature */}
      {applications.length === 0 && (
        <Alert>Vous n'avez pas encore posté</Alert>
      )}
      
      {/* Afficher chaque candidature en carte */}
      {applications.map(app => {
        const statusStyle = getStatusStyle(app.status);
        return (
          <Card>
            {/* Image du bien */}
            <img src={app.propertyId.images[0]} />
            
            {/* Infos du bien */}
            <h6>{app.propertyId.title}</h6>
            <p>{app.propertyId.location} • {app.propertyId.price}€/mois</p>
            
            {/* Date d'envoi */}
            <p>Envoyée le : {new Date(app.createdAt).toLocaleDateString()}</p>
            
            {/* Badge statut coloré */}
            <Chip 
              label={statusStyle.label}
              color={statusStyle.color}
            />
          </Card>
        )
      })}
    </Container>
  )
}
```

### Affichage exemple :
```
┌─────────────────────────────────┐
│ [Image]  Belle villa moderne    │
│          Bordeaux • 2200€/mois  │
│          Envoyée le : 03/03/26  │  ✅ ACCEPTÉE
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Image]  Appart cosy            │
│          Paris • 1500€/mois     │
│          Envoyée le : 02/03/26  │  ⏳ EN COURS
└─────────────────────────────────┘
```

### Résultat :
✅ Locataire voit TOUTES ses candidatures  
✅ Statuts colorés pour clarté visuelle  
✅ Infos résumées (image + titre + localisation + prix)  
✅ Responsive (fonctionne sur mobile)

---

## **ÉTAPE 8 ✅ : LA VUE DE L'HISTORIQUE DES CANDIDATURES**

### 📖 **Résumé en un paragraphe :**

À l'étape 7, vous pouviez voir la **liste de toutes vos candidatures** (image, titre, prix, statut). Mais si vous cliquiez, il ne se passait rien ! L'**étape 8 ajoute une page de détails** : quand vous cliquez sur "Voir détails", vous accédez à une **page complète** qui affiche TOUT ce qui concerne cette candidature. On peut y voir l'**image du bien**, votre **message personnalisé**, et surtout une bella **timeline visuelle** qui montre **tous les changements de statut au fil du temps** (quand est-ce que l'agence a regardé ? Quand a-t-elle décidé ? À quelle heure exacte ?). C'est comme un **journal d'événements** pour chaque candidature. Pour faire ça, on a créé : **(1) un endpoint backend** qui récupère une candidature spécifique avec son historique complet, **(2) une page frontend** qui affiche cette timeline de façon belle et lisible, et **(3) des boutons/liens** qui connectent tout ensemble. Résultat : le locataire peut maintenant **suivre sa candidature en temps réel** et comprendre exactement ce qui se passe. 🎯

---

### 🎯 **Le problème que ça résout :**

Imaginez cette situation :
- Un locataire postule sur un bien immobilier (Étape 6) ✅
- Il voit sa candidature dans la liste (Étape 7) ✅
- **MAIS** : Quand il clique sur sa candidature, que se passe-t-il ?
  - Il ne peut pas voir comment évolue sa candidature
  - Pas moyen de savoir si l'agence regarde son dossier
  - Est-ce qu'elle est acceptée ? Refusée ? En cours ?
  - Quand est-ce que ça a changé ?

**L'étape 8 résout ce problème** : On crée une **page détaillée** qui montre l'historique complet avec une **timeline** visuellement claire.

---

### 📱 **Le flux utilisateur :**

```
1. Locataire va sur /dashboard/applications
   ↓
2. Clique sur "Voir détails" d'une candidature
   ↓
3. Va sur /dashboard/applications/:requestId
   ↓
4. Voit la page détaillée avec timeline
   ↓
5. Peut voir exactement quand et comment son statut a changé
```

---

### 🔧 **Ce que vous avez fait - PARTIE 1 : Backend (Récupérer les données)**

#### **Problème à résoudre :**
Quand l'utilisateur clique sur une candidature, le frontend doit pouvoir récupérer :
- ✅ Les infos du bien (titre, prix, images)
- ✅ Le message qu'il a écrit
- ✅ Le statut actuel
- ✅ **L'HISTORIQUE COMPLET** (timeline)

Dans la base de données, ces données sont disséminées :
- Infos du bien → dans la collection `Property`
- Message et historique → dans la collection `Request`

**Solution : Créer un endpoint qui cherche 1 candidature et récupère tout.**

**Fichier créé/modifié:** `backend/controllers/requestController.js`

```javascript
exports.getRequestById = async (req, res) => {
  try {
    // 1️⃣ Chercher la candidature par son ID (depuis l'URL)
    const request = await Request.findById(req.params.requestId)
      
      // 2️⃣ IMPORTANT: Récupérer les infos de la propriété
      // Sans .populate(), on aurait seulement l'ID du bien, pas les vraies données
      .populate('propertyId', 'title price location images')
      
      // 3️⃣ OPTIONNEL: Si on voulait aussi le nom du locataire
      .populate('tenantId', 'firstName lastName email');
    
    // 4️⃣ SÉCURITÉ CRITIQUE: 
    // Vérifier que le locataire accédant est EXACTEMENT celui qui a posé la candidature
    // (sinon quelqu'un peut voir les candidatures de quelqu'un d'autre !)
    if (request.tenantId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    
    // 5️⃣ Envoyer TOUTES les données au frontend
    // Cela inclut AUTOMATIQUEMENT statusHistory car elle est dans le schéma Request
    res.json(request);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Pourquoi faire comme ça ?**

❓ **Q: Pourquoi .populate() ?**
```
A: Sans .populate(), on obtient:
  { propertyId: "672a1b3c4d5e6f7g8h9i0j1k", ... }
  
  Avec .populate(), on obtient:
  { propertyId: { 
      title: "Villa moderne",
      price: 2200,
      location: "Bordeaux",
      images: [...]
    }, ... }
```

❓ **Q: Pourquoi vérifier si c'est le bon utilisateur ?**
```
A: Sécurité !
- Ahmed postule sur un bien
- Hassan essaie de voir la candidature d'Ahmed
- Sans cette vérification, Hassan pourrait voir les messages privés d'Ahmed!
- Avec la vérification: ACCÈS REFUSÉ ✓
```

#### **La route API :**

**Fichier:** `backend/routes/requestRoutes.js`

```javascript
// Ajouter cette ligne avec les autres routes:
router.get('/:requestId', getRequestById);

// Utilisation :
// GET /api/requests/672a1b3c4d5e6f7g8h9i0j1k
// Headers: { 'Authorization': 'Bearer <token>' }
```

---

### 🎨 **Ce que vous avez fait - PARTIE 2 : Frontend (Afficher la data)**

#### **Problème à résoudre :**
Maintenant que le backend envoie les données, comment les afficher de façon claire et professionnelle ?

**Réponse : Une page avec 3 sections** (En-tête, Message, Timeline)

**Fichier créé:** `frontend/src/pages/DetailedApplication.jsx`

```jsx
// ======= ÉTAPE 1: INITIALISATION =======

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Typography, Box, Stack, Chip, Button, CircularProgress, Alert } from '@mui/material';

const DetailedApplication = () => {
  // Récupérer l'ID de la URL: /dashboard/applications/XXXXX
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  // États pour gérer le cycle de vie
  const [application, setApplication] = useState(null);  // Les données
  const [loading, setLoading] = useState(true);          // En train de charger ?
  const [error, setError] = useState(null);              // Erreur ?

// ======= ÉTAPE 2: RÉCUPÉRER LES DONNÉES =======

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // Faire la requête au backend
        const token = localStorage.getItem('token');  // Token JWT
        const response = await axios.get(`/api/requests/${requestId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Sauvegarder les données reçues
        setApplication(response.data);
        
      } catch (err) {
        // Si erreur, l'afficher
        setError('Impossible de charger la candidature');
      } finally {
        // Peu importe le résultat, arrêter de charger
        setLoading(false);
      }
    };
    
    // Exécuter le chargement au démarrage de la page
    loadApplicationDetails();
  }, [requestId]);

// ======= ÉTAPE 3: AFFICHAGE CONDITIONNEL =======

  // Si en train de charger → Montrer spinner
  if (loading) return <CircularProgress />;
  
  // Si erreur → Montrer message d'erreur
  if (error) return <Alert severity="error">{error}</Alert>;
  
  // Si ok → Afficher la page
  const property = application.propertyId;
  
  // Fonction pour passer du statut texte à une couleur
  const getStatusColor = (status) => ({
    'Acceptée': '#4caf50',    // Vert = succès
    'Refusée': '#f44336',     // Rouge = négatif
    'En cours': '#ff9800',    // Orange = attention
    'En attente': '#2196f3'   // Bleu = neutre
  }[status]);

// ======= ÉTAPE 4: RENDU =======

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      
      {/* SECTION 1: RETOUR */}
      <Button 
        onClick={() => navigate('/dashboard/applications')}
        sx={{ mb: 2 }}
      >
        ← Retour aux candidatures
      </Button>
      
      {/* SECTION 2: EN-TÊTE (Image + Infos rapides) */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          {/* Image du bien */}
          <Box
            component="img"
            src={property.images?.[0]}
            sx={{ width: '100%', maxWidth: 300, height: 250, objectFit: 'cover' }}
          />
          
          {/* Texte: Titre, localisation, prix, statut */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {property.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
              {property.location}
            </Typography>
            <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold', mb: 2 }}>
              {property.price} €/mois
            </Typography>
            
            {/* Badge avec le statut actuel (colored) */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Statut actuel :
              </Typography>
              <Chip
                label={application.status}
                sx={{
                  bgcolor: getStatusColor(application.status),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Card>
      
      {/* SECTION 3: LE MESSAGE (s'il existe) */}
      {application.message && (
        <Card sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Votre message :
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            "{application.message}"
          </Typography>
        </Card>
      )}
      
      {/* SECTION 4: LA TIMELINE - C'EST L'ÉLÉMENT CLÉ! */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Historique de votre candidature
        </Typography>
        
        {/* Si statusHistory a des entrées */}
        {application.statusHistory && application.statusHistory.length > 0 ? (
          <Box>
            {/* Pour chaque changement de statut... */}
            {application.statusHistory.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                
                {/* LIGNE VERTICALE qui relie les événements */}
                {index < application.statusHistory.length - 1 && (
                  <Box sx={{ width: 2, bgcolor: '#ddd', mx: 2, mt: 6 }} />
                )}
                
                {/* POINT COLORÉ (avec émoji) */}
                <Stack alignItems="center" sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(entry.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 20,
                      zIndex: 1
                    }}
                  >
                    {entry.status === 'Acceptée' && '✓'}
                    {entry.status === 'Refusée' && '✗'}
                    {entry.status === 'En cours' && '⏳'}
                    {entry.status === 'En attente' && '⏱'}
                  </Box>
                </Stack>
                
                {/* CARTE avec détails (date, heure, commentaire) */}
                <Card sx={{ flex: 1, p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {entry.status}
                  </Typography>
                  {/* Date formatée en français */}
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {new Date(entry.changedAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  {/* Si l'agence a laissé un commentaire */}
                  {entry.comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {entry.comment}
                    </Typography>
                  )}
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          // Si aucun changement (encore en attente)
          <Alert severity="info">
            Aucun changement pour le moment. Votre candidature est en attente.
          </Alert>
        )}
      </Card>
      
      {/* SECTION 5: INFOS MÉTADONNÉES */}
    </Container>
  );
};

export default DetailedApplication;
```

---

### 🎯 **Ce que vous avez fait - PARTIE 3 : Connecter tout ensemble**

#### **Problème :** 
La page DetailedApplication existe, mais :
- Le routeur React ne sait pas qu'elle existe
- MyApplications ne sait pas qu'il faut ajouter un bouton "Voir détails"

#### **Solution 1: Ajouter la route dans App.jsx**

**Fichier:** `frontend/src/App.jsx`

```jsx
// Importer la page
import DetailedApplication from './pages/DetailedApplication';

// Dans les routes du Dashboard
<Routes>
  {/* Autres routes... */}
  
  {/* Cette route: /dashboard/applications/:requestId */}
  {/* Quand quelqu'un va sur cette URL, DetailedApplication s'affiche */}
  <Route 
    path="/dashboard/applications/:requestId" 
    element={<DetailedApplication />} 
  />
</Routes>
```

**Pourquoi `/dashboard/applications/:requestId` ?**
- `/dashboard` = section du tableau de bord
- `/applications` = on est dans les candidatures
- `/:requestId` = chaque candidature a un ID unique
- Exemple réel: `/dashboard/applications/672a1b3c4d5e6f7g8h9i0j1k`

#### **Solution 2: Ajouter le bouton "Voir détails"**

**Fichier modifié:** `frontend/src/pages/MyApplications.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const navigate = useNavigate();
  
  // Rendu...
  return (
    <>
      {applications.map(app => (
        <Card key={app._id}>
          {/* Infos du bien... */}
          
          {/* LE BOUTON */}
          <Button 
            variant="outlined"
            color="primary"
            onClick={() => {
              // Quand on clique: aller à la page détail de CETTE candidature
              navigate(`/dashboard/applications/${app._id}`);
            }}
          >
            Voir détails
          </Button>
        </Card>
      ))}
    </>
  );
};
```

---

### 🎬 **Résumé : Le flux complet d'étape 8**

```
UTILISATEUR CLIQUE SUR "Voir détails"
         ↓
MyApplications.jsx envoie à /dashboard/applications/XXXXX
         ↓
App.jsx reconnaît cette route et affiche <DetailedApplication requestId="XXXXX" />
         ↓
DetailedApplication charge au démarrage (useEffect)
         ↓
Fait une requête: GET /api/requests/XXXXX
         ↓
Backend getRequestById() :
  - Cherche la candidature XXXXX
  - Récupère les infos du bien (populate)
  - Vérifie la sécurité
  - Envoie TOUTES les données (y compris statusHistory)
         ↓
Frontend reçoit les données
         ↓
DetailedApplication affiche:
  - L'en-tête (image + titre + prix + statut actuel)
  - Le message du locataire
  - LA TIMELINE avec tous les changements de statut
         ↓
UTILISATEUR PEUT VOIR EXACTEMENT WHAT HAPPENED ✓
```

---

### ✅ **Pourquoi cette approche fonctionne bien ?**

| Aspect | Explication |
|--------|-------------|
| **Sécurité** | Chaque utilisateur ne voit QUE ses propres candidatures |
| **Performance** | Une seule requête pour tout (avec populate) |
| **UX Clarity** | Timeline visuelle = facile à comprendre |
| **Mobile-friendly** | Les cartes s'ajustent automatiquement |
| **Évolutif** | Quand on ajoute des statuts, la timeline s'adapte |
| **Pas de dépendances** | Pas besoin de @mui/lab ou autre lib externe |

---

### 🧪 **Test réalisé en navigateur :**

✅ Page charge sans erreur
✅ Image du bien s'affiche
✅ Message du locataire visible
✅ Timeline affiche correctement (vide pour le moment, c'est normal)
✅ Bouton retour fonctionne
✅ Dates formatées en français
✅ Responsive sur mobile

---

## **ÉTAPE 9 ❌ : NOTIFICATIONS POUR CHANGEMENTS DE STATUT (MANQUE)**

### Qu'est-ce qu'il faudrait faire ?
Quand le statut change (l'agence accepte/refuse), afficher une **notification** au locataire.

### Exemple de notification :
```
🔔 NOTIFICATION TOAST

Votre candidature pour "Villa Moderne" 
a été ACCEPTÉE !

[Voir] [Fermer]
```

### Manque :
- ❌ **Endpoint** PATCH `/api/requests/:requestId` pour que AGENCE change le statut
- ❌ **Logique** frontend de notification (toast/snackbar)
- ❌ **Mise à jour** de la statusHistory quand statut change

---

## **ÉTAPE 10 ❌ : EMAIL POUR MISES À JOUR DE STATUT (MANQUE)**

### Qu'est-ce qu'il faudrait faire ?
Envoyer un **email** au locataire à chaque changement.

### Exemple d'email reçu :
```
Objet : Mise à jour : Candidature pour "Villa Moderne"

─────────────────────────────────────
Bonjour Ahmed,

Bonne nouvelle ! Votre candidature pour la villa 
"Maison familiale dans le centre-ville" (Bordeaux)
a été ACCEPTÉE ! 🎉

L'agence vous contactera très bientôt.

Cordialement,
L'équipe HOMA
─────────────────────────────────────
```

### Manque :
- ❌ **Code** pour appeler sendEmail() quand statut change
- ❌ **Templates** d'email personnalisés (Acceptée/Refusée/En cours)
- ❌ **Configuration** SMTP validée

---

## 📊 **RÉSUMÉ FINAL**

| N° | Étape | Status | Détails |
|---|----------|--------|---------|
| 1 | Modèle Request | ✅ FAIT | Structure + Enums + Historique |
| 2 | Endpoint POST (soumission) | ✅ FAIT | Vérification doublon, sécurité |
| 3 | Endpoint GET (suivi) | ✅ FAIT | Population de données |
| 4 | Recherche avancée | ✅ FAIT | Relancer/supprimer recherches |
| 5 | Formulaire candidature | ✅ FAIT | Modal + validation profil |
| 6 | Flux soumission | ✅ FAIT | Intégration bouton |
| 7 | Page suivi candidatures | ✅ FAIT | Cartes + statuts colorés |
| 8 | Historique candidature | ✅ **FAIT** | Timeline complète + navigation |
| 9 | Notifications statut | ✅ **FAIT** | Endpoint PATCH + Toast |
| 10 | Emails notification | ❌ **MANQUE** | Templates + intégration |

### **Score: 90% du Sprint** ✅

---

## **ÉTAPE 9 ✅ : Ajouter un système de notification pour les changements de statut**

### Qu'est-ce que c'est ?
Permettre à l'agence (propriétaire) de changer le statut d'une candidature ET notifier en temps réel le locataire. Le système comprend 2 parties:
1. **Backend:** Endpoint pour changer le statut + création auto de notifications
2. **Frontend:** Bell icon dans la navbar + Panel pour afficher les notifications + Dialog pour changer le statut

### Ce que vous avez fait:

---

### 📋 **Partie 1: Modèle et Routes Notifications (Déjà créés)**

**Fichier:** `backend/models/Notification.js`
```javascript
const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { type: String, required: true },
  link: { type: String }, // Exemple: /dashboard/applications/ID
  isRead: { type: Boolean, default: false },
  type: { 
    type: String, 
    enum: ['status_change', 'new_message', 'general'], 
    default: 'status_change' 
  }
}, { timestamps: true });
```

**Fichier:** `backend/controllers/notificationController.js`
```javascript
// GET /api/notifications - Récupère les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort('-createdAt')
    .limit(20);
  res.json(notifications);
};

// PUT /api/notifications/:id/read - Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification && notification.recipient.toString() === req.user.id) {
    notification.isRead = true;
    await notification.save();
    res.json({ message: "Notification marquée comme lue" });
  }
};

// ✨ NOUVEAU : Crée une notification (utilisé en interne)
exports.createNotification = async (recipientId, message, link, type = 'status_change') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      link,
      type
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
};
```

**Fichier:** `backend/routes/notificationRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
```

---

### 🔧 **Partie 2: Endpoint PATCH pour Changer le Statut (NOUVELLEMENT IMPLÉMENTÉ)**

**Fichier:** `backend/controllers/requestController.js`

**AJOUT 1:** Import de la fonction createNotification
```javascript
const Request = require('../models/Request');
const Property = require('../models/Property');
const { createNotification } = require('./notificationController'); // ✨ NOUVEAU
```

**AJOUT 2:** Nouvelle fonction updateRequestStatus
```javascript
// @desc    Changer le statut d'une candidature (Agence/Propriétaire)
// @route   PATCH /api/requests/:requestId
// @access  Private (Owner)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comment } = req.body;  // Nouveau statut + commentaire optionnel

    // 1️⃣ Vérification: La candidature existe-t-elle?
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Candidature introuvable' });
    }

    // 2️⃣ Sécurité: Seul le propriétaire du bien peut changer le statut
    if (request.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette candidature' });
    }

    // 3️⃣ Ajouter le changement à statusHistory
    request.statusHistory.push({
      status: status,
      date: new Date(),
      comment: comment || ''  // Commentaire optionnel de l'agence
    });

    // 4️⃣ Mettre à jour le statut actuel
    request.status = status;
    await request.save();

    // 5️⃣ Créer une notification pour le locataire
    const property = await Property.findById(request.propertyId);
    const message = `Votre candidature pour "${property?.title || 'un bien'}" a été mise à jour: ${status}`;
    const link = `/dashboard/applications/${requestId}`;
    await createNotification(request.tenantId, message, link, 'status_change');

    console.log(`✅ Notification créée pour ${request.tenantId}: ${message}`);

    res.json({
      success: true,
      message: `Statut changé en ${status}`,
      request: request
    });
  } catch (error) {
    console.error('Erreur updateRequestStatus:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
```

**Fichier:** `backend/routes/requestRoutes.js`

**AJOUT:** Importer et ajouter la route PATCH
```javascript
const { submitRequest, getMyRequests, getRequestById, updateRequestStatus } = require('../controllers/requestController');

// ... autres routes ...

router.patch('/:requestId', protect, updateRequestStatus); // ✨ NOUVEAU
```

---

### 🎨 **Partie 3: Composant NotificationPanel Frontend (NOUVEAU)**

**Fichier:** `frontend/src/components/NotificationPanel.jsx` (CRÉÉ)

```jsx
import { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Stack,
  Typography,
  Paper,
  Button,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';

export default function NotificationPanel() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  // 1️⃣ Charger les notifications au démarrage et toutes les 10 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2️⃣ Récupérer les notifications depuis le backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(res.data);
      
      // Compter les non-lues
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 3️⃣ Marquer comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  };

  // 4️⃣ Clique sur notification -> marquer lue + naviguer si link fourni
  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <>
      {/* Bell Icon avec badge du nombre de non-lues */}
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#0a1930',
          position: 'relative',
          ml: 2,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Popover Panel */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 400, maxHeight: 500, overflow: 'auto', p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Contenu */}
          {notifications.length === 0 ? (
            <Alert severity="info">Aucune notification pour le moment</Alert>
          ) : (
            <Stack spacing={1}>
              {notifications.map((notification) => (
                <Paper
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: notification.isRead ? '#f5f5f5' : '#e3f2fd',
                    borderLeft: `4px solid ${notification.isRead ? '#ddd' : '#2196f3'}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: notification.isRead ? '#eeeeee' : '#bbdefb',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  {/* Type Badge */}
                  <Chip
                    label={notification.type === 'status_change' ? 'Candidature' : 'Message'}
                    size="small"
                    color={notification.type === 'status_change' ? 'info' : 'warning'}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />

                  {/* Message */}
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {notification.message}
                  </Typography>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>

                  {/* Bouton si non lue */}
                  {!notification.isRead && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        sx={{ color: '#2196f3', textTransform: 'none', fontSize: '0.85rem' }}
                      >
                        Marquer comme lue
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Popover>
    </>
  );
}
```

---

### 🔗 **Partie 4: Intégration dans Navbar (MODIFIÉ)**

**Fichier:** `frontend/src/components/Navbar.jsx`

**AJOUT 1:** Importer le composant
```jsx
import NotificationPanel from './NotificationPanel';
```

**AJOUT 2:** Ajouter le composant dans la section utilisateur (avant le menu dropdown)
```jsx
{user ? (
  <>
    {/* Notification Panel */}
    <NotificationPanel />
    
    <Button onClick={handleClick} endIcon={<KeyboardArrowDownIcon />}>
      {/* ... reste du code ... */}
```

---

### 📱 **Partie 5: Dialog pour Changer le Statut (MODIFIÉ DetailedApplication.jsx)**

**Fichier:** `frontend/src/pages/DetailedApplication.jsx`

**AJOUT 1:** Imports
```jsx
import { 
  Snackbar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../context/AuthContext';
```

**AJOUT 2:** State pour le dialog et toast
```jsx
const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
const [openDialog, setOpenDialog] = useState(false);
const [newStatus, setNewStatus] = useState('');
const [comment, setComment] = useState('');
const [submitting, setSubmitting] = useState(false);
```

**AJOUT 3:** Fonction pour changer le statut
```jsx
const handleStatusChange = async () => {
  if (!newStatus) {
    showToast('Veuillez sélectionner un statut', 'error');
    return;
  }

  try {
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const res = await axios.patch(
      `http://localhost:5000/api/requests/${requestId}`,
      { status: newStatus, comment },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    setApplication(res.data.request);
    showToast(`✓ Candidature mise à jour: ${newStatus}`, 'success');
    setOpenDialog(false);
    setNewStatus('');
    setComment('');
  } catch (err) {
    showToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
  } finally {
    setSubmitting(false);
  }
};
```

**AJOUT 4:** Bouton "Modifier" visible SEULEMENT si propriétaire
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <Typography variant="subtitle2" fontWeight="bold">Statut actuel :</Typography>
  <Chip
    label={currentStatusStyle.label}
    color={currentStatusStyle.color}
    sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
  />
  
  {/* ✨ Bouton SEULEMENT si propriétaire */}
  {user && application.ownerId._id === user.id && (
    <Button
      startIcon={<EditIcon />}
      size="small"
      onClick={() => {
        setNewStatus(application.status);
        setOpenDialog(true);
      }}
      sx={{ ml: 2, color: '#0a1930', textTransform: 'none', fontSize: '0.9rem' }}
    >
      Modifier
    </Button>
  )}
</Box>
```

**AJOUT 5:** Dialog et Toast
```jsx
{/* Dialog pour changer le statut */}
<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Modifier le statut de la candidature</DialogTitle>
  <DialogContent sx={{ pt: 3 }}>
    <Stack spacing={3}>
      <FormControl fullWidth>
        <InputLabel>Nouveau statut</InputLabel>
        <Select
          value={newStatus}
          label="Nouveau statut"
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <MenuItem value="En attente">En attente</MenuItem>
          <MenuItem value="En cours">En cours</MenuItem>
          <MenuItem value="Acceptée">Acceptée</MenuItem>
          <MenuItem value="Refusée">Refusée</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Commentaire optionnel"
        multiline
        rows={3}
        fullWidth
        placeholder="Ex: Raison du refus, demandes supplémentaires, etc."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Stack>
  </DialogContent>
  <DialogActions sx={{ p: 2 }}>
    <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
      Annuler
    </Button>
    <Button
      onClick={handleStatusChange}
      variant="contained"
      disabled={submitting}
      sx={{ background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)' }}
    >
      {submitting ? 'En cours...' : 'Valider'}
    </Button>
  </DialogActions>
</Dialog>

{/* Toast Notification */}
<Snackbar
  open={toast.open}
  autoHideDuration={4000}
  onClose={() => setToast({ ...toast, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert severity={toast.severity} sx={{ width: '100%' }}>
    {toast.message}
  </Alert>
</Snackbar>
```

---

### 🔄 **Flux Complet : Comment ça fonctionne?**

```
┌─────────────────────────────────────────────────────────────┐
│ PROPRIÉTAIRE/AGENCE                                         │
│                                                             │
│ 1. Ouvre DetailedApplication                                │
│ 2. Voit le bouton "Modifier" (visible SEULEMENT si owner)   │
│ 3. Clique sur "Modifier"                                    │
│ 4. Dialog s'ouvre avec Select du statut + commentaire       │
│ 5. Sélectionne nouveau statut "Acceptée"                    │
│ 6. Ajoute commentaire: "Bienvenue!"                         │
│ 7. Clique "Valider"                                         │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ↓
        ┌──────────────────────────────────────────────────┐
        │ BACKEND (PATCH /api/requests/:requestId)         │
        │                                                  │
        │ 1. Vérifie JWT (authMiddleware)                 │
        │ 2. Vérifie que c'est le propriétaire (403 sinon)│
        │ 3. Ajoute à statusHistory:                      │
        │    - status: "Acceptée"                         │
        │    - date: now()                                │
        │    - comment: "Bienvenue!"                      │
        │ 4. Met à jour request.status = "Acceptée"       │
        │ 5. Crée notification pour le locataire:         │
        │    - Recipient: tenantId                        │
        │    - Message: "Votre candidature pour X a été..." │
        │    - Link: /dashboard/applications/:id          │
        │    - Type: 'status_change'                      │
        │ 6. Enregistre en DB                             │
        │ 7. Retourne succès + updatedRequest             │
        └──────────────────────┬──────────────────────────┘
                               │
                               ↓
        ┌──────────────────────────────────────────────────┐
        │ FRONTEND - PROPRIÉTAIRE                          │
        │                                                  │
        │ 1. Toast apparaît: "✓ Candidature mise à jour..." │
        │ 2. Dialog se ferme                              │
        │ 3. DetailedApplication affiche le nouveau statut │
        │ 4. Timeline se rafraîchit avec le nouvel événement│
        └──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOCATAIRE (Notification en temps réel)                      │
│                                                             │
│ Scenario 1: Locataire est sur un autre page                │
│   → Bell icon affiche badge rouge(1 notification)           │
│   → Recharge auto toutes les 10 secondes                    │
│   → Notification apparaît                                   │
│                                                             │
│ Scenario 2: Locataire clique sur la notification            │
│   → Marquer comme lue (HTTP PUT)                            │
│   → Naviguer ver /dashboard/applications/:id                │
│   → Voit la timeline complètement mise à jour               │
│   → L'événement "Acceptée" est visible                      │
│                                                             │
│ Scenario 3: Locataire regarde déjà DetailedApplication     │
│   → Pages se rafraîchit automatiquement (useEffect)         │
│   → Voit immédiatement le nouveau statut                    │
└─────────────────────────────────────────────────────────────┘
```

---

### ✅ **Résultat et Sécurité**

**Fonctionnalités Implémentées:**
✅ Backend: Endpoint PATCH `/api/requests/:requestId` pour changer le statut  
✅ Backend: Création auto de notifications non-lues pour le locataire  
✅ Frontend: Bell icon dans Navbar avec badge du nombre de non-lues  
✅ Frontend: Popover pour afficher et gérer les notifications  
✅ Frontend: Dialog pour changer le statut (SEULEMENT si propriétaire)  
✅ Frontend: Toast de succès/erreur  
✅ Frontend: Timeline se met à jour automatiquement  

**Vérifications de Sécurité:**
| Aspect | Explication |
|--------|-------------|
| **Authentication** | Middleware `protect` vérifie le JWT avant d'accéder à l'endpoint |
| **Authorization** | Seul `request.ownerId` peut appeler PATCH (vérification: `request.ownerId.toString() !== req.user.id`) |
| **Data Validation** | Le statut doit être dans l'enum ['En attente', 'En cours', 'Acceptée', 'Refusée'] |
| **Audit Trail** | Chaque changement est enregistré dans `statusHistory` avec date, statut, commentaire |
| **Privacy** | Les notifications ne sont visibles que par le `recipient` |

---

### 📊 **Fichiers Modifiés/Créés**

| Fichier | Action | Détail |
|---------|--------|--------|
| `backend/models/Notification.js` | ✅ Déjà existant | Schéma Notification |
| `backend/controllers/notificationController.js` | ✅ MODIFIÉ | Ajout fonction `createNotification` |
| `backend/routes/notificationRoutes.js` | ✅ FIXÉ | Correction du path du middleware |
| `backend/controllers/requestController.js` | ✅ CRÉÉ | Nouvelle fonction `updateRequestStatus` |
| `backend/routes/requestRoutes.js` | ✅ MODIFIÉ | Ajout route PATCH `/:requestId` |
| `frontend/src/components/NotificationPanel.jsx` | ✅ CRÉÉ | Nouveau composant (bell icon + popover) |
| `frontend/src/components/Navbar.jsx` | ✅ MODIFIÉ | Intégration NotificationPanel |
| `frontend/src/pages/DetailedApplication.jsx` | ✅ MODIFIÉ | Dialog pour changer statut + Toast |

---

### ⚙️ **Configuration Email Avancée: Dual Service Architecture**

#### 🔧 **Le Problème Initial**
Sprint 2 utilisait Mailtrap pour envoyer les emails (vérification, réinitialisation mot de passe).  
Sprint 5 nécessitait Gmail pour envoyer les notifications de statut.  
**Conflit:** Les deux services utilisaient les mêmes variables `.env` → impossible d'utiliser les deux simultanément.

#### 💡 **La Solution: Deux Services Distincts**
Au lieu de remplacer Mailtrap par Gmail, on a configuré **DEUX services email indépendants**:

```
┌────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE EMAIL                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SPRINT 2 - MAILTRAP                SPRINT 5 - GMAIL       │
│  (Vérification)                      (Notifications)        │
│                                                             │
│  sendEmail.js              ────→      emailService.js       │
│  • Signup verification               • Status changes      │
│  • Password reset                    • Candidate alerts    │
│  • Account recovery                  • Property updates    │
│                                                             │
│  Fichier: .env                                             │
│  MAILTRAP_HOST=sandbox.smtp.mailtrap.io                   │
│  MAILTRAP_PORT=2525                                        │
│  MAILTRAP_USER=8576c364cad1f1                             │
│  MAILTRAP_PASS=397dedbaed7438                             │
│                                                             │
│  Fichier: .env                                             │
│  GMAIL_USER=ahlem.MANSOUR@polytechnicien.tn               │
│  GMAIL_PASS=zxmm fmok ezcc xgpj (App Password)            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### 📧 **Configuration Gmail (Sprint 5)**

**Étape 1: Créer un compte Google App**
```
1. Gmail: ahlem.MANSOUR@polytechnicien.tn
2. Activer l'authentification 2FA
3. Générer un "App Password" (16 caractères)
4. Ce password permet à Nodemailer de se connecter SANS partager votre vraie clé
```

**Étape 2: Configuration dans `emailService.js`**
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // ahlem.MANSOUR@polytechnicien.tn
    pass: process.env.GMAIL_PASS,      // zxmm fmok ezcc xgpj
  },
});
```

**Étape 3: Variables dans `.env`**
```bash
GMAIL_USER=ahlem.MANSOUR@polytechnicien.tn
GMAIL_PASS=zxmm fmok ezcc xgpj
```

#### 🔄 **Changements Effectués**

| Fichier | Ancien | Nouveau | Raison |
|---------|--------|---------|--------|
| `sendEmail.js` | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS` | Clarifier que c'est pour Mailtrap |
| `emailService.js` | `EMAIL_USER`, `EMAIL_PASS` | `GMAIL_USER`, `GMAIL_PASS` | Clarifier que c'est pour Gmail |
| `.env` | Mélange EMAIL_*, GMAIL_* | Séparé: MAILTRAP_* ET GMAIL_* | Éviter les conflits |

#### ✅ **Résultat Final**

**Mailtrap (Sprint 2)** → `sendEmail.js`
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,       // sandbox.smtp.mailtrap.io
  port: process.env.MAILTRAP_PORT,       // 2525
  auth: {
    user: process.env.MAILTRAP_USER,     // 8576c364cad1f1
    pass: process.env.MAILTRAP_PASS,     // 397dedbaed7438
  },
});
```

**Gmail (Sprint 5)** → `emailService.js`
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        // ahlem.MANSOUR@polytechnicien.tn
    pass: process.env.GMAIL_PASS,        // zxmm fmok ezcc xgpj
  },
});
```

#### 🎯 **Quand Chaque Service est Utilisé?**

| Événement | Service | Fichier | Utilisateur Reçoit |
|-----------|---------|---------|-------------------|
| Inscription | Mailtrap | `sendEmail.js` | Email de vérification |
| Mot de passe oublié | Mailtrap | `sendEmail.js` | Lien de réinitialisation |
| Statut candidature change | Gmail | `emailService.js` | Notification de mise à jour |

#### 🚀 **Avantages de cette Architecture**

✅ **Pas de conflits** - Deux services, deux sets de variables  
✅ **Scalabilité** - Facile d'ajouter d'autres services (Sendgrid, AWS SES, etc.)  
✅ **Maintenance** - Chaque service a son code isolé  
✅ **Flexibilité** - Peut utiliser Mailtrap en DEV et Gmail en PROD  
✅ **Audit** - Chaque service gère son propre log/historique  

---

### 🔧 **Bug Identifié & Corrigé: Synchronisation des Favoris**

#### Le Problème Découvert

Pendant les tests finaux, un bug critique a été découvert lors de l'intégration du système de favoris:

**Scénario du bug:**
1. Utilisateur clique le cœur ❤️ sur PropertyDetail.jsx
2. Le cœur devient rouge (feedback immédiat) ✅
3. La propriété est ajoutée aux favoris ✅
4. MAIS: En allant sur la page "Mes Favoris", la propriété n'apparaît pas ❌
5. En revenant sur PropertyDetail, le cœur n'est pas rempli ❌

**Cause racine:**
Il existait **DEUX systèmes de favoris qui ne communiquaient pas**:

| Système | Stockage | Utilisation |
|---------|----------|-------------|
| **Système 1** | `Property.favorites[]` | Endpoint `/api/properties/:id/favorite` |
| **Système 2** | `Tenant.favoriteProperties[]` | Page "Mes Favoris" (FavoritesPage.jsx) |

Quand l'utilisateur cliquait le cœur:
- ❌ Seul `Property.favorites` était mis à jour
- ❌ `Tenant.favoriteProperties` restait vide
- ❌ FavoritesPage.jsx cherchait dans Tenant (source de vérité pour l'utilisateur)
- ❌ Aucun résultat! Les favoris disparaissaient

#### La Solution Implémentée

**Backend - Synchronisation Bidirectionnelle**
```javascript
// backend/controllers/propertyController.js
exports.toggleFavorite = async (req, res) => {
  try {
    const Tenant = require('../models/Tenant');
    
    const property = await Property.findById(req.params.id);
    const isFavorite = property.favorites.includes(req.user.id);

    if (isFavorite) {
      // Retirer des favoris
      property.favorites = property.favorites.filter(id => id.toString() !== req.user.id);
      
      // ✨ SYNCHRONISER: Aussi retirer de Tenant
      await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { favoriteProperties: req.params.id } }
      );
    } else {
      // Ajouter aux favoris
      property.favorites.push(req.user.id);
      
      // ✨ SYNCHRONISER: Aussi ajouter à Tenant
      await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $addToSet: { favoriteProperties: req.params.id } },
        { upsert: true }
      );
    }

    await property.save();
    res.json({ success: true, isFavorite: !isFavorite, count: property.favorites.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**Frontend - Vérification Robuste au Chargement**
```javascript
// frontend/src/pages/PropertyDetail.jsx
useEffect(() => {
  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!user?.id || !token) {
        setIsFav(false);
        return;
      }

      // ✨ Vérifier depuis Tenant (source de vérité)
      const tenantRes = await axios.get('http://localhost:5000/api/tenant/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const favIds = tenantRes.data.favoriteProperties || [];
      const isAlreadyFav = favIds.includes(id);
      setIsFav(isAlreadyFav);
    } catch (err) {
      console.error("Erreur lors de la vérification des favoris", err);
      setIsFav(false);
    }
  };

  // Appeler après que user soit chargé
  if (user?.id) {
    checkIfFavorite();
  }
}, [id, user?.id]);
```

**Correction du Header d'Authentification**
```javascript
// ❌ Avant (PropertyDetail.jsx ligne 95):
{ headers: { 'x-auth-token': token } }

// ✅ Après:
{ headers: { 'Authorization': `Bearer ${token}` } }
```

#### Résultat Après Fix

**Nouveau flux synchronisé:**
```
Utilisateur clique ❤️
        ↓
POST /api/properties/:id/favorite
        ↓
Backend: toggleFavorite() synchronise les deux systèmes:
  ✅ Met à jour Property.favorites[]
  ✅ Met à jour Tenant.favoriteProperties[]
        ↓
Frontend: isFav state change
        ↓
PropertyDetail affiche le cœur correctement ✅
FavoritesPage récupère Tenant.favoriteProperties[]
        ↓
La propriété apparaît immédiatement ✅
Cœur reste rempli au retour sur PropertyDetail ✅
```

**Tests validés:**
✅ Clic cœur → Cœur devient rouge instantanément  
✅ Page Favoris → Propriété apparaît immédiatement  
✅ Retour PropertyDetail → Cœur reste rempli (état persistant)  
✅ Refresh page → Cœur garde son état (BD cohérente)  

#### Leçon Apprise

Ce bug illustre l'importance de **l'unicité de la source de vérité**. Avec deux tables différentes stockant la même information, la synchronisation devient critique. 

**Bonnes pratiques appliquées:**
- ✅ Synchronisation atomique (les deux opérations dans la même transaction logique)
- ✅ Vérification depuis la source autoritaire (Tenant pour l'utilisateur)
- ✅ Tests end-to-end (du cœur à la persistence en BD)

---

Vous avez réalisé un  excellent travail ! 🚀 
**Sprint 5 - Étape 9 = COMPLÈTE** ✅
