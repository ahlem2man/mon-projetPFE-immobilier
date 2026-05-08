/**
 * Construit l'URL complète d'une image
 * @param {string} imagePath - Le chemin relatif depuis la base (ex: /uploads/properties/prop-xxx.jpg)
 * @returns {string} L'URL complète de l'image
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }

  // Si c'est déjà une URL complète, la retourner
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ Extraire le domaine de base (sans /api) - même logique que api.js
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const baseUrl = apiBase.endsWith('/api') ? apiBase.replace('/api', '') : apiBase;
  
  return `${baseUrl}${imagePath}`;
};

export default buildImageUrl;
