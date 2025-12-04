import dotenv from 'dotenv';

dotenv.config();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let accessToken = null;
let tokenExpiry = null;

// valid spotify genres for search query normalization
const VALID_GENRES = new Set([
  'acoustic', 'ambient', 'chill', 'classical', 'country', 'dance', 'disco',
  'electronic', 'folk', 'funk', 'hip-hop', 'house', 'indie', 'indie-pop',
  'jazz', 'k-pop', 'latin', 'metal', 'pop', 'punk', 'r-n-b', 'reggae',
  'rock', 'soul', 'techno', 'trance'
]);

// maps AI output genres to simpler search terms for searching
const GENRE_MAPPINGS = {
  'lo-fi': 'chill',
  'lofi': 'chill',
  'bedroom-pop': 'indie-pop',
  'bedroom': 'indie',
  'trap': 'hip-hop',
  'rap': 'hip-hop',
  'r&b': 'r-n-b',
  'rnb': 'r-n-b',
  'edm': 'electronic',
  'synthwave': 'electronic',
  'chillwave': 'chill',
  'dream-pop': 'indie-pop',
  'shoegaze': 'indie',
  'post-punk': 'punk',
  'alt-rock': 'rock',
  'alternative': 'rock',
};

/**
 * normalizes genre string from AI output for better search results
 */
function normalizeGenre(genre) {
  const normalized = genre.toLowerCase().trim().replace(/\s+/g, '-');
  
  if (VALID_GENRES.has(normalized)) {
    return normalized;
  }
  
  if (GENRE_MAPPINGS[normalized]) {
    return GENRE_MAPPINGS[normalized];
  }
  
  // try partial match
  const parts = normalized.split('-');
  for (const p of parts) {
    if (VALID_GENRES.has(p)) {
      return p;
    }
  }
  
  return null;
}

/**
 * Gets spotify access token using client credential flow
 * @returns {Promise<string>} access token
 */
async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`Spotify token error (${response.status}):`, responseText);
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error_description || errorData.error || errorMessage;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(`Failed to get Spotify token: ${errorMessage}`);
  }

  const data = JSON.parse(responseText);
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return accessToken;
}

/**
 * searches spotify for tracks based on extracted musical features
 * @param {Object} features - extracted features from groq
 * @returns {Promise<Array>} array of track objects
 */
export async function searchTracks(features) {
  const token = await getAccessToken();
  const searchTerms = [];
  
  if (features.keywords && features.keywords.length > 0) {
    searchTerms.push(...features.keywords.slice(0, 3));
  }
  
  if (features.mood && features.mood.length > 0) {
    searchTerms.push(features.mood[0]);
  }
  
  if (features.genres && features.genres.length > 0) {
    const normalizedGenre = normalizeGenre(features.genres[0]);
    if (normalizedGenre) {
      searchTerms.push(normalizedGenre);
    }
  }
  
  const query = searchTerms.slice(0, 4).join(' ') || 'chill vibes';
  console.log('searching spotify with query:', query);
  
  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`Spotify search error (${response.status}):`, responseText);
    let errorMessage = 'Failed to search Spotify';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  
  const data = JSON.parse(responseText);
  console.log(`found ${data.tracks.items.length} tracks`);
  
  const tracks = data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[0]?.url,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
    duration: track.duration_ms,
  }));
  
  return tracks;
}
