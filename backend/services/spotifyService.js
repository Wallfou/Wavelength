import dotenv from 'dotenv';

dotenv.config();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let accessToken = null;
let tokenExpiry = null;

/**
 * Gets spotify access token using client credential flow
 * @returns {Promise<string>} access token
 */
async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('spotify cred not configuered ');
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

  if (!response.ok) {
    throw new Error('failed to get spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 600) * 1000;
  return accessToken;
}

/**
 * Seraches for spotify tracks based on extracted musical features if recommendation fails
 * @param {Object} features - from groq
 * @returns {Promise<Array>} array of music tracks
 */
export async function searchTracks(features) {
  const token = await getAccessToken();
  const searchTerms = [];
  
  if (features.genres && features.genres.length > 0) {
    searchTerms.push(`genre:${features.genres[0]}`);
  }
  if (features.keywords && features.keywords.length > 0) {
    searchTerms.push(...features.keywords.slice(0, 2));
  }
  const query = searchTerms.join(' ') || features.mood?.[0] || 'music';
  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'failed to search Spotify');
  }
  const data = await response.json();
  
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

/**
 * Gets track recs based on extracted audio features
 * @param {Object} features - from Groq
 * @returns {Promise<Array>} array of music track recs
 */
export async function getRecommendations(features) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    limit: 20,
    target_energy: features.energy || 0.5,
    target_valence: features.valence || 0.5,
    target_acousticness: features.acousticness || 0.5,
    target_instrumentalness: features.instrumentalness || 0.5,
  });

  if (features.tempo_range && features.tempo_range.length === 2) {
    params.append('min_tempo', features.tempo_range[0]);
    params.append('max_tempo', features.tempo_range[1]);
  }
  if (features.genres && features.genres.length > 0) {
    const genreSeeds = features.genres.slice(0, 3).join(',');
    params.append('seed_genres', genreSeeds);
  } else {
    params.append('seed_genres', 'pop');
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE}/recommendations?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.warn('recommendation from spotify failed, searching spotify w keywords:', errorData.error?.message);
    return searchTracks(features);
  }

  const data = await response.json();
  const tracks = data.tracks.map(track => ({
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
