import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Extracts musical characteristics from a text prompt using groq api
 * @param {string} prompt - user's text input (textInputPage.jsx)
 * @returns {Object} musical features object
 */
export async function extractMusicFeatures(prompt) {
  const chatCompleted = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a music analysis expert. When given a mood or description, you extract musical characteristics that can be used to find matching songs on Spotify. 

Always respond with ONLY valid JSON in the exact format specified. Do not include any other text, explanation, or markdown formatting.

The features you extract should map to Spotify's audio features:
- energy: 0.0 to 1.0 (intensity and activity)
- valence: 0.0 to 1.0 (musical positiveness/happiness)
- tempo_range: [min_bpm, max_bpm]
- acousticness: 0.0 to 1.0 (acoustic vs electronic)
- instrumentalness: 0.0 to 1.0 (vocals vs instrumental)`,
      },
      {
        role: 'user',
        content: `Analyze this mood/description and extract musical characteristics:

"${prompt}"

Return JSON in this exact format:
{
  "mood": ["mood1", "mood2", "mood3"],
  "energy": 0.0,
  "valence": 0.0,
  "tempo_range": [60, 120],
  "genres": ["genre1", "genre2", "genre3", "genre4"],
  "acousticness": 0.0,
  "instrumentalness": 0.0,
  "vocal_style": "description of vocal style or instrumental",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 512,
  });

  const responseText = chatCompleted.choices[0]?.message?.content;
  const features = JSON.parse(responseText);
  return features;
}

