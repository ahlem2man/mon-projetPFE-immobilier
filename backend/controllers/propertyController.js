const Property = require('../models/Property');


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

    // 5. Filtrage par Surface
    if (req.query.minSurface || req.query.maxSurface) {
      query.surface = {};
      if (req.query.minSurface) query.surface.$gte = Number(req.query.minSurface);
      if (req.query.maxSurface) query.surface.$lte = Number(req.query.maxSurface);
    }

    // 6. Filtrage par nombre de pièces
    if (req.query.rooms) {
      query.rooms = { $gte: Number(req.query.rooms) };
    }

   

    // 7. Tri (Sorting)
    let sortBy = '-createdAt';
    if (req.query.sort) {
      sortBy = req.query.sort.toString().trim();
    }

    // 8. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const startIndex = (page - 1) * limit;
    const total = await Property.countDocuments(query);

   
    console.log("--- LOGS SERVEUR ---");
    console.log("Filtres actifs :", query);
    console.log("Tri appliqué (sortBy) :", sortBy);

    
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



exports.toggleFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Annonce non trouvée" });

    
    const isFavorite = property.favorites.includes(req.user.id);

    if (isFavorite) {
      
      property.favorites = property.favorites.filter(id => id.toString() !== req.user.id);
    } else {
      
      property.favorites.push(req.user.id);
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