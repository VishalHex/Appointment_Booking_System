import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
	registerProvider,
	listProviders,
	providerCalendar,
	getProviderSlots
} from '../controllers/providerController.js';

const router = express.Router();


router.post('/', requireAuth(['admin']), registerProvider);
router.get('/', listProviders);
router.get('/:providerId/slots', getProviderSlots);
router.get('/:providerId/calendar', providerCalendar);

export default router;
