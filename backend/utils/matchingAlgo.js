/**
 * Calcule le score de matching (0 à 100)
 * 
 *  FILTRE DE DISPONIBILITÉ: Si la propriété n'est pas disponible, retourne null
 * Les propriétés avec status != 'disponible' sont exclues du matching
 */
exports.calculateMatchScore = (preferences, property) => {
  // --- 0. VÉRIFICATION PRÉALABLE: DISPONIBILITÉ (gating filter) ---
  // Les propriétés non disponibles sont exclues d'emblée
  if (!property.status || property.status !== 'disponible') {
    return null; // Propriété non disponible: exclure du matching
  }

  let score = 0;
  let details = {
    priceScore: 0,
    locationScore: 0,
    typeScore: 0,
    amenitiesScore: 0
  };

  // --- 1. LOCALISATION (35 points) --- AVEC GRADATION
  if (preferences.city && property.location) {
    const prefCityLower = preferences.city.toLowerCase();
    const propLocLower = property.location.toLowerCase();
    
    if (propLocLower === prefCityLower) {
      details.locationScore = 35; // Match exact
    } else if (propLocLower.includes(prefCityLower) || prefCityLower.includes(propLocLower)) {
      details.locationScore = 25; // Ville contient la préférence (ex: "Grand Paris" vs "Paris")
    } else {
      details.locationScore = 8; // Mauvaise ville mais pas zéro (flexibilité)
    }
  } else {
    details.locationScore = 20; // Neutre si préférence non renseignée
  }

  // --- 2. PRIX / BUDGET (30 points) --- AMÉLIORATION GRADUELLE
  if (preferences.maxPrice && preferences.maxPrice > 0) {
    if (property.price <= preferences.maxPrice) {
      details.priceScore = 30; // Dans le budget
    } else {
      // Calcul graduel: perte de 1% de points par 2% de dépassement
      const diffPercent = (property.price - preferences.maxPrice) / preferences.maxPrice;
      details.priceScore = Math.max(5, Math.round(30 - (diffPercent * 30)));
    }
  } else {
    details.priceScore = 15;
  }

  // --- 3. TYPE DE BIEN (20 points) --- PLUS FLEXIBLE
  if (preferences.propertyType && preferences.propertyType !== '' && property.type) {
    if (property.type === preferences.propertyType) {
      details.typeScore = 20; // Match exact
    } else {
      // Types proches: Studio et Appartement sont similaires
      const similarTypes = {
        'Appartement': ['Studio', 'Maison'],
        'Studio': ['Appartement'],
        'Maison': ['Villa', 'Appartement'],
        'Villa': ['Maison'],
        'Bureau': ['Appartement']
      };
      if (similarTypes[preferences.propertyType]?.includes(property.type)) {
        details.typeScore = 12; // Type similaire
      } else {
        details.typeScore = 5; // Type différent mais toujours des points
      }
    }
  } else {
    details.typeScore = 10; // Pas de préférence
  }

  // --- 4. ÉQUIPEMENTS / AMENITIES (15 points) ---
  if (preferences.wantedAmenities && preferences.wantedAmenities.length > 0) {
    const propertyAmenities = property.amenities || [];
    const matches = preferences.wantedAmenities.filter(item => 
      propertyAmenities.includes(item)
    );
    // Score proportionnel au nombre d'équipements trouvés
    details.amenitiesScore = Math.round((matches.length / preferences.wantedAmenities.length) * 15);
  } else {
    details.amenitiesScore = 8;
  }

  // CALCUL FINAL
  score = details.locationScore + details.priceScore + details.typeScore + details.amenitiesScore;

  // On s'assure que le score reste entre 0 et 100
  score = Math.min(100, Math.max(0, score));

  return { score, details };
};