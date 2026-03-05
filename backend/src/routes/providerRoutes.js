import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
	registerProvider,
	listProviders,
	providerCalendar
} from '../controllers/providerController.js';

const router = express.Router();


// Register a provider (admin only)
router.post('/', requireAuth(['admin']), registerProvider);
// List all providers
router.get('/', listProviders);
// Get provider calendar
router.get('/:providerId/calendar', providerCalendar);

export default router;
