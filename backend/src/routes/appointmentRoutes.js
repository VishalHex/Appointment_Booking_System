import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
	bookAppointment,
	cancelAppointment,
	listAppointments,
	listAvailableSlots,
	updateAppointmentStatus
} from '../controllers/appointmentController.js';

const router = express.Router();


router.post('/', requireAuth(['client']), bookAppointment);
router.post('/:id/cancel', requireAuth(['client', 'admin']), cancelAppointment);
router.get('/', requireAuth(['client', 'provider', 'admin']), listAppointments);
router.get('/provider/:providerId/slots', listAvailableSlots);
router.patch('/:id/status', requireAuth(['provider']), updateAppointmentStatus);

export default router;
