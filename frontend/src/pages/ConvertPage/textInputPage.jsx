import React, { useState } from 'react'
import "./textInputPage.css";

const API_URL = 'http://127.0.0.1:3001';

const TextInputPage = () => {
  const [prompt, setPrompt] = useState('');
  const [features, setFeatures] = useState(null);
  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePlaylist = async () => {
    if (!prompt.trim()) {
      setError('Please enter a mood description');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeatures(null);

    try {
      const response = await fetch(`${API_URL}/api/generate-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate playlist');
      }

      setFeatures(data.features);
      setGeneratedSongs(data.playlist || []);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='text-input-page-container'>
      <div className='title-section-container'>
        <div className='text-input-title-text'>
          <h1>Text Input</h1>
        </div>
        <div className='text-input-title-subtext'>
          <p>Describe your mood in words and watch AI craft the perfect soundtrack for your moment.</p>
        </div>
      </div>
      <div className='text-input-interaction-container'>
        <div className='text-input-left-container'>
          <p className='text-input-left-container-title'>Input your prompt here:</p>
          <textarea 
            className='text-input-text-area' 
            placeholder='Describe your mood in words...'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className='error-message'>{error}</p>}
          <button 
            type="button" 
            className='text-input-generate-button'
            onClick={handleGeneratePlaylist}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Generate Playlist'}
          </button>
          
          {features && (
            <div className='features-container'>
              <h3>Extracted Musical Features</h3>
              <div className='features-grid'>
                <div className='feature-item'>
                  <span className='feature-label'>Mood</span>
                  <span className='feature-value'>{features.mood?.join(', ')}</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Genres</span>
                  <span className='feature-value'>{features.genres?.join(', ')}</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Energy</span>
                  <span className='feature-value'>{(features.energy * 100).toFixed(0)}%</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Valence</span>
                  <span className='feature-value'>{(features.valence * 100).toFixed(0)}%</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Tempo</span>
                  <span className='feature-value'>{features.tempo_range?.join('-')} BPM</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Acousticness</span>
                  <span className='feature-value'>{(features.acousticness * 100).toFixed(0)}%</span>
                </div>
                <div className='feature-item'>
                  <span className='feature-label'>Keywords</span>
                  <span className='feature-value'>{features.keywords?.join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className='text-input-right-container'>
          <div className='text-input-right-container-title'>Generated Playlist</div>
          <div className='text-input-right-container-generated-list'>
            {isLoading ? (
              <p className='empty-list-placeholder'>Analyzing your mood...</p>
            ) : generatedSongs.length === 0 ? (
              <p className='empty-list-placeholder'>
                {features 
                  ? 'No spotify integration yet'
                  : 'Your generated songs will appear here...'}
              </p>
            ) : (
              generatedSongs.map((song, index) => (
                <div key={index} className='song-item'>
                  <span className='song-title'>{song.title}</span>
                  <span className='song-artist'>{song.artist}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextInputPage
