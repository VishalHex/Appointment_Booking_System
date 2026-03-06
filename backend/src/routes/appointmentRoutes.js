import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
	bookAppointment,
	cancelAppointment,
	listAppointments,
	listAvailableSlots
} from '../controllers/appointmentController.js';

const router = express.Router();


// Book an appointment
router.post('/', requireAuth(['client']), bookAppointment);
// Cancel an appointment
router.post('/:id/cancel', requireAuth(['client']), cancelAppointment);
router.delete('/:id', requireAuth(['client']), cancelAppointment);
// List appointments for user/provider
router.get('/', requireAuth(['client', 'provider', 'admin']), listAppointments);
// List available slots for a provider
router.get('/provider/:providerId/slots', listAvailableSlots);

export default router;
