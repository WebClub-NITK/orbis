import express from 'express';
import { getProfile, updateProfile } from '../controllers/profiles.js';
import { authenticateUser, checkJwt } from '../middleware/auth.js';

const router = express.Router();



router.get('/profile', checkJwt, getProfile);
router.put('/profile', updateProfile);

export default router; 