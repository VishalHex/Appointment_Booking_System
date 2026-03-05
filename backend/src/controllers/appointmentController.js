// Appointment Controller
// Handles booking, viewing, and cancelling appointments
import { Appointment, Provider, User } from '../models.js';

// Book an appointment
export async function bookAppointment(req, res) {
  try {
    const { provider_id, appointment_time } = req.body;
    const client_id = req.user.id;
    // Check if slot is already booked
    const exists = await Appointment.findOne({
      where: { provider_id, appointment_time, status: 'booked' }
    });
    if (exists) return res.status(409).json({ error: 'Slot already booked' });
    // Create appointment
    const appointment = await Appointment.create({
      client_id,
      provider_id,
      appointment_time,
      status: 'booked',
      reminder_sent: false
    });
    res.status(201).json({ appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Cancel an appointment
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.client_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// List appointments for a user
export async function listAppointments(req, res) {
  try {
    let where = {};
    if (req.user.role === 'client') where.client_id = req.user.id;
    if (req.user.role === 'provider') where.provider_id = req.user.provider_id;
    const appointments = await Appointment.findAll({ where });
    res.json({ appointments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// List available slots for a provider
export async function listAvailableSlots(req, res) {
  try {
    const { providerId } = req.params;
    // For demo: return next 7 days, 9am-5pm, 1hr slots, minus booked
    const slots = [];
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      for (let h = 9; h < 17; h++) {
        const slot = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, 0, 0, 0);
        slots.push(slot.toISOString());
      }
    }
    const booked = await Appointment.findAll({
      where: { provider_id: providerId, status: 'booked' }
    });
    const bookedTimes = booked.map(a => a.appointment_time.toISOString());
    const available = slots.filter(s => !bookedTimes.includes(s));
    res.json(available);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
