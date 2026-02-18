const Property = require('../models/Property');

// @desc    Récupérer toutes les annonces
// @route   GET /api/properties
exports.getAllProperties = async (req, res) => {
  try {
    let query = { status: 'disponible' };

    // 1. Recherche par ville
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // 2. Filtrage par type
    if (req.query.type && req.query.type !== 'Tous') {
      query.type = req.query.type;
    }

    // 3. Fourchette de prix (Min et Max)
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // 4. Filtrage par Équipements (Amenities)
    if (req.query.amenities && req.query.amenities.trim() !== "") {
      const amenitiesArray = req.query.amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesArray };
    }

    // --- AJOUTS SPRINT 3 : TRI ET PAGINATION ---

    // 5. Tri (Sorting)
    let sortBy = '-createdAt';
    if (req.query.sort) {
      // .toString().trim() assure que la valeur est propre pour Mongoose
      sortBy = req.query.sort.toString().trim();
    }

    // 6. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const startIndex = (page - 1) * limit;
    const total = await Property.countDocuments(query);

    // DEBUG : Regarde ton terminal Node.js pour vérifier ces valeurs
    console.log("--- LOGS SERVEUR ---");
    console.log("Filtres actifs :", query);
    console.log("Tri appliqué (sortBy) :", sortBy);

    // Exécution de la requête
    const properties = await Property.find(query)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // 7. Réponse enrichie
    res.status(200).json({
      success: true,
      count: properties.length,
      totalProperties: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: properties
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Créer une annonce
exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer une annonce par ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'fullName email');
    if (!property) return res.status(404).json({ success: false, message: "Annonce non trouvée" });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};