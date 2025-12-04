import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playlistRoutes from './routes/playlistRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api', playlistRoutes);

// starting server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Groq API: ${process.env.GROQ_API_KEY ? 'configured' : 'missing'}`);
  console.log(`Spotify API: ${process.env.SPOTIFY_CLIENT_ID ? 'configured' : 'missing'}`);
});
