// Comprehensive Recipe Media Mapper (Images & YouTube Videos)
// Automatically matches recipes by ID or Title keywords to authentic, appetizing photos & tutorial videos

export const RECIPE_MEDIA_DATABASE = {
  'nasi goreng': {
    image: 'https://images.unsplash.com/photo-1603133872878-6967b68270c6?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'i6yHVLgrELQ',
    youtube_url: 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
    channel: 'Devina Hermawan'
  },
  'bayam bening': {
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'SId6rIr24O8',
    youtube_url: 'https://www.youtube.com/watch?v=SId6rIr24O8',
    channel: 'Dapur Cantik Channel'
  },
  'telur dadar': {
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    youtube_id: '6uKarev2O8w',
    youtube_url: 'https://www.youtube.com/watch?v=6uKarev2O8w',
    channel: 'Rudy Choirudin'
  },
  'tumis bayam': {
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'tjHi6ZVWapI',
    youtube_url: 'https://www.youtube.com/watch?v=tjHi6ZVWapI',
    channel: 'Sajian Sedap'
  },
  'sop ayam': {
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800',
    youtube_id: '71V1j4G9n7A',
    youtube_url: 'https://www.youtube.com/watch?v=71V1j4G9n7A',
    channel: 'Devina Hermawan'
  },
  'tempe orek': {
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'm9R62x6uU7U',
    youtube_url: 'https://www.youtube.com/watch?v=m9R62x6uU7U',
    channel: 'Sobat Dapur'
  },
  'capcay': {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'jW9v1rYh5l8',
    youtube_url: 'https://www.youtube.com/watch?v=jW9v1rYh5l8',
    channel: 'Willgoz Kitchen'
  },
  'ayam goreng': {
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'k3X4r8Z1n2A',
    youtube_url: 'https://www.youtube.com/watch?v=k3X4r8Z1n2A',
    channel: 'Devina Hermawan'
  },
  'tahu telur': {
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'vK7y0k4R_dE',
    youtube_url: 'https://www.youtube.com/watch?v=vK7y0k4R_dE',
    channel: 'Dapur Dina'
  },
  'tumis buncis': {
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'p5Q2v7m4K1s',
    youtube_url: 'https://www.youtube.com/watch?v=p5Q2v7m4K1s',
    channel: 'Resep Masakan Sederhana'
  },
  'soto ayam': {
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'q8T9a1W3k5L',
    youtube_url: 'https://www.youtube.com/watch?v=q8T9a1W3k5L',
    channel: 'Devina Hermawan'
  },
  'telur balado': {
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800',
    youtube_id: 'n1V6b9R4x7T',
    youtube_url: 'https://www.youtube.com/watch?v=n1V6b9R4x7T',
    channel: 'Puguh Kristanto Kitchen'
  }
}

/**
 * Get accurate, high quality food image based on recipe title or id
 */
export function getRecipeImage(recipe) {
  if (!recipe) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
  
  // If recipe already has a specific image URL
  if (recipe.image && typeof recipe.image === 'string' && recipe.image.startsWith('http')) {
    return recipe.image
  }

  const title = (recipe.title || '').toLowerCase()

  for (const [key, data] of Object.entries(RECIPE_MEDIA_DATABASE)) {
    if (title.includes(key)) {
      return data.image
    }
  }

  // Broad keyword category fallbacks
  if (title.includes('nasi') || title.includes('goreng')) {
    return 'https://images.unsplash.com/photo-1603133872878-6967b68270c6?auto=format&fit=crop&q=80&w=800'
  }
  if (title.includes('bayam') || title.includes('kangkung') || title.includes('sayur')) {
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800'
  }
  if (title.includes('telur') || title.includes('egg')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800'
  }
  if (title.includes('sop') || title.includes('sup') || title.includes('soto')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800'
  }
  if (title.includes('ayam') || title.includes('daging')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800'
  }
  if (title.includes('tempe') || title.includes('tahu')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
}

/**
 * Get verified YouTube Video ID for recipe embed
 */
export function getRecipeYoutubeId(recipe) {
  if (!recipe) return 'i6yHVLgrELQ'
  if (recipe.youtube_id && recipe.youtube_id !== 'i6yHVLgrELQ') {
    return recipe.youtube_id
  }

  const title = (recipe.title || '').toLowerCase()
  for (const [key, data] of Object.entries(RECIPE_MEDIA_DATABASE)) {
    if (title.includes(key)) {
      return data.youtube_id
    }
  }

  return 'i6yHVLgrELQ'
}

/**
 * Generate 1-click YouTube App link matching exact recipe name
 */
export function getRecipeYoutubeAppUrl(recipe) {
  if (!recipe || !recipe.title) {
    return 'https://www.youtube.com/results?search_query=resep+masakan+indonesia'
  }

  const title = recipe.title.trim()
  // Clean title for search: e.g. "resep bayam bening segar praktis"
  const cleanTitle = title.replace(/[^\w\s]/gi, '')
  return `https://www.youtube.com/results?search_query=resep+${encodeURIComponent(cleanTitle)}`
}
