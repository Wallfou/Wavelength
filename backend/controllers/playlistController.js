import { extractMusicFeatures } from '../services/groqService.js';
import { searchTracks } from '../services/spotifyService.js';

/**
 * generates a playlist based on user text input by
 * extracting musical characteristics with groq and then searching spotify
 */
export async function generatePlaylist(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'please provide a valid text prompt',
      });
    }

    console.log('extracting features for:', prompt);
    const features = await extractMusicFeatures(prompt);
    console.log('extracted features:', features);

    let playlist = [];
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      try {
        playlist = await searchTracks(features);
      } catch (spotifyError) {
        console.warn('spotify api error:', spotifyError.message);
      }
    } else {
      console.log('spotify credentials not configured');
    }

    return res.json({
      success: true,
      features,
      playlist,
      message: playlist.length > 0 
        ? `generated ${playlist.length} tracks based on your description`
        : 'features extracted but spotify search failed',
    });
  } catch (error) {
    console.error('error generating playlist:', error);
    
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: 'failed to parse groq response',
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to generate playlist',
    });
  }
}

// helath checks for services
export async function healthCheck(req, res) {
  const status = {
    groq: !!process.env.GROQ_API_KEY,
    spotify: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
  };

  return res.json({
    status: 'ok',
    services: status,
    message: 'playlist service is running',
  });
}
