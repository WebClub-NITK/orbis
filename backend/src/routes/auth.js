import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import { authenticateUser, checkJwt } from '../middleware/auth.js';


const router = express.Router();

router.post('/register', checkJwt, register);
router.post('/login', checkJwt, login);
router.post('/logout', logout);
router.get('/user', checkJwt, getCurrentUser);

export default router; 