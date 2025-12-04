import express from 'express';
import { generatePlaylist, healthCheck } from '../controllers/playlistController.js';

const router = express.Router();

// post to generates playlist from the text prompt
router.post('/generate-playlist', generatePlaylist);

// get the health check endpoint
router.get('/health', healthCheck);

export default router;

