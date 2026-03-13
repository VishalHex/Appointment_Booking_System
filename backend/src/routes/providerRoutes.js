import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
	registerProvider,
	listProviders,
	providerCalendar,
	getProviderSlots,
	listProviderUsers,
	updateProvider,
	deleteProvider
} from '../controllers/providerController.js';

const router = express.Router();


router.post('/', requireAuth(['admin']), registerProvider);
router.get('/', listProviders);
router.get('/users', requireAuth(['admin']), listProviderUsers);
router.get('/:providerId/slots', getProviderSlots);
router.get('/:providerId/calendar', providerCalendar);
router.patch('/:providerId', requireAuth(['admin']), updateProvider);
router.delete('/:providerId', requireAuth(['admin']), deleteProvider);

export default router;
