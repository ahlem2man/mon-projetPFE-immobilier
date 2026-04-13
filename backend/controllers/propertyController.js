const Property = require('../models/Property');

// ==========================================
// 1. RECHERCHE ET CONSULTATION (PUBLIC)
// ==========================================

// @desc    Récupérer toutes les annonces avec filtres avancés
exports.getAllProperties = async (req, res) => {
  try {
    let query = {};

    // Recherche par ville
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Filtrage par type
    if (req.query.type && req.query.type !== 'Tous') {
      query.type = req.query.type;
    }

    // Fourchette de prix
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Équipements
    if (req.query.amenities && req.query.amenities.trim() !== "") {
      const amenitiesArray = req.query.amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesArray };
    }

    // Surface et Pièces
    if (req.query.minSurface || req.query.maxSurface) {
      query.surface = {};
      if (req.query.minSurface) query.surface.$gte = Number(req.query.minSurface);
      if (req.query.maxSurface) query.surface.$lte = Number(req.query.maxSurface);
    }
    if (req.query.rooms) {
      query.rooms = { $gte: Number(req.query.rooms) };
    }

    // Pagination et Tri
    let sortBy = req.query.sort ? req.query.sort.toString().trim() : '-createdAt';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const startIndex = (page - 1) * limit;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

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

// @desc    Récupérer une annonce par ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'fullName email');
    if (!property) return res.status(404).json({ success: false, message: "Annonce non trouvée" });
    
    // Logique Analytics : On incrémente les vues à chaque consultation unique
    property.views = (property.views || 0) + 1;
    await property.save();

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GESTION AGENCE (SPRINT 8)
// ==========================================

// @desc    Créer une propriété (Lien automatique avec l'agence)
exports.createProperty = async (req, res) => {
  try {
    // Si tu utilises Multer, req.files contient les chemins des images
    const imagePaths = req.files ? req.files.map(f => `/uploads/properties/${f.filename}`) : req.body.images;

    // Parse amenities si c'est une string
    let amenities = req.body.amenities;
    if (typeof amenities === 'string') {
      amenities = amenities ? amenities.split(',').map(a => a.trim()) : [];
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      type: req.body.type,
      location: req.body.location,
      address: req.body.address,
      surface: req.body.surface,
      rooms: req.body.rooms,
      amenities: amenities,
      images: imagePaths,
      owner: req.user.id // ID récupéré depuis le middleware 'protect'
    });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error('Erreur createProperty:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer uniquement les annonces de l'agence connectée
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Modifier le statut (disponible, loué, inactive, en attente)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ success: false, message: "Non autorisé" });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Dupliquer une annonce (Gain de temps agence)
exports.duplicateProperty = async (req, res) => {
  try {
    const original = await Property.findOne({ _id: req.params.id, owner: req.user.id });
    if (!original) return res.status(404).json({ message: "Original non trouvé" });

    const cloneData = original.toObject();
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    delete cloneData.favorites;
    
    cloneData.title = `${cloneData.title} (Copie)`;
    cloneData.status = 'disponible';
    cloneData.views = 0;

    const clone = await Property.create(cloneData);
    res.status(201).json({ success: true, data: clone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Modifier une propriété (Édition complète)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user.id });
    if (!property) return res.status(404).json({ success: false, message: "Non autorisé" });

    const allowedFields = ['title', 'description', 'price', 'location', 'address', 'type', 'surface', 'rooms', 'amenities', 'status'];
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        property[key] = req.body[key];
      }
    });

    // Gestion des nouvelles images (optionnel)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/properties/${f.filename}`);
      property.images = newImages;
    }

    await property.save();
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer une annonce
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!property) return res.status(404).json({ success: false, message: "Action interdite" });
    res.status(200).json({ success: true, message: "Supprimé" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. FAVORIS (LOCATAIRE)
// ==========================================

exports.toggleFavorite = async (req, res) => {
  try {
    const Tenant = require('../models/Tenant');
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Annonce non trouvée" });

    const isFavorite = property.favorites.includes(req.user.id);

    if (isFavorite) {
      property.favorites = property.favorites.filter(id => id.toString() !== req.user.id);
      await Tenant.findOneAndUpdate({ userId: req.user.id }, { $pull: { favoriteProperties: req.params.id } });
    } else {
      property.favorites.push(req.user.id);
      await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $addToSet: { favoriteProperties: req.params.id } },
        { upsert: true, new: true }
      );
    }

    await property.save();
    res.status(200).json({ success: true, isFavorite: !isFavorite, count: property.favorites.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFavoriteProperties = async (req, res) => {
  try {
    const favorites = await Property.find({ favorites: req.user.id });
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. ACTIONS GROUPÉES (SPRINT 8)
// ==========================================

// @desc    Supprimer plusieurs annonces en masse
exports.bulkDeleteProperties = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Fournir un array d'IDs non-vide"
      });
    }

    // Vérifier ownership de CHAQUE propriété
    const properties = await Property.find({ _id: { $in: ids } });
    const unauthorizedIds = properties
      .filter(p => p.owner.toString() !== req.user.id)
      .map(p => p._id);

    if (unauthorizedIds.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Non autorisé pour ${unauthorizedIds.length} propriété(s)`,
        unauthorizedIds
      });
    }

    // Supprime tout en une requête
    const result = await Property.deleteMany({
      _id: { $in: ids },
      owner: req.user.id
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} annonce(s) supprimée(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. ANALYTICS (SPRINT 8)
// ==========================================

// @desc    Récupérer les analytics d'une propriété (vues, favoris, candidatures)
exports.getPropertyAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const Request = require('../models/Request');

    // Récupère propriété
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Propriété non trouvée" });
    }

    // Ownership check
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Non autorisé" });
    }

    // Compte candidatures
    const applicationsCount = await Request.countDocuments({
      propertyId: id
    });

    // Compile stats
    const analytics = {
      propertyId: property._id,
      title: property.title,
      type: property.type,
      price: property.price,
      stats: {
        views: property.views || 0,
        favorites: property.favorites?.length || 0,
        applications: applicationsCount,
        totalEngagement: (property.views || 0) + (property.favorites?.length || 0) + applicationsCount
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};