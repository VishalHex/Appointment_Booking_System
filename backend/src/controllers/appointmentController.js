// Appointment Controller
// Handles booking, viewing, and cancelling appointments
import { Appointment, Provider, User } from '../models.js';
import { Op } from 'sequelize';

// Book an appointment
export async function bookAppointment(req, res) {
  try {
    const { provider_id, appointment_time } = req.body;
    const client_id = req.user.id;
    // assume incoming time string (YYYY-MM-DDTHH:mm:ss) already represents IST
    // Node is running in IST (TZ env), so new Date() will interpret it as local
    const apptDate = new Date(appointment_time);
    // Check if slot is already booked by this user
    const userExists = await Appointment.findOne({
      where: { client_id, appointment_time: apptDate, status: 'booked' }
    });
    if (userExists) return res.status(409).json({ error: 'You already have an appointment at this time' });
    // Check if slot is already booked by any user for this provider
    const providerExists = await Appointment.findOne({
      where: { provider_id, appointment_time: apptDate, status: 'booked' }
    });
    if (providerExists) return res.status(409).json({ error: 'Slot already booked' });
    // Create appointment using configured timezone
    const appointment = await Appointment.create({
      client_id,
      provider_id,
      appointment_time: apptDate,
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
    if (req.user.role === 'provider') where.provider_id = req.user.id;

    const now = new Date();
    // Fetch all appointments for the user without filtering by status or time
    if (req.user.role === 'client') {
      where.client_id = req.user.id;
    } else if (req.user.role === 'provider') {
      where.provider_id = req.user.id;
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Provider, attributes: ['id', 'service_name', 'description'], required: false },
        { model: User, as: 'client', attributes: ['id', 'name', 'email'], required: false }
      ],
      order: [['appointment_time', 'ASC']],
    });

    const plainAppointments = appointments.map(apt => ({
      ...apt.toJSON(),
      provider: apt.provider ? apt.provider.toJSON() : null,
      client: apt.client ? apt.client.toJSON() : null
    }));

    res.json({ appointments: plainAppointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(400).json({ error: err.message });
  }
}

// List available slots for a provider
export async function listAvailableSlots(req, res) {
  try {
    const { providerId } = req.params;
    // Generate slots for 4 months (120 days)
    const slots = [];
    const now = new Date();
    const maxDate = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000); // 4 months

    for (let d = 0; d <= 120; d++) {
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      if (currentDate > maxDate) break;

      // Skip weekends (optional - remove if you want weekends available)
      // const dayOfWeek = currentDate.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)

      // Generate slots: 9am to 5pm, every hour
      for (let h = 9; h < 17; h++) {
        const slot = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), h, 0, 0, 0);
        // manual IST formatting (slot is already in IST due to TZ)
        const yr = slot.getFullYear();
        const mo = String(slot.getMonth() + 1).padStart(2, '0');
        const da = String(slot.getDate()).padStart(2, '0');
        const hr = String(slot.getHours()).padStart(2, '0');
        const mi = String(slot.getMinutes()).padStart(2, '0');
        const sec = String(slot.getSeconds()).padStart(2, '0');
        slots.push(`${yr}-${mo}-${da}T${hr}:${mi}:${sec}`);
      }
    }

    // Get booked slots
    const booked = await Appointment.findAll({
      where: { provider_id: providerId, status: 'booked' }
    });
    const bookedTimes = booked.map(a => {
      const d = a.appointment_time;
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const hr = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      return `${yr}-${mo}-${da}T${hr}:${mi}:${sec}`;
    });

    // Filter out booked slots
    const available = slots.filter(s => !bookedTimes.includes(s));
    res.json(available);
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(400).json({ error: err.message });
  }
}
