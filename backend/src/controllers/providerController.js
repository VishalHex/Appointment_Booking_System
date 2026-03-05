// Provider Controller
// Handles provider registration, listing, and calendar
import { Provider, Appointment, User } from '../models.js';

// Register a provider (admin only)
export async function registerProvider(req, res) {
  try {
    const { user_id, service_name, description } = req.body;
    // Only admin can register providers
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    const provider = await Provider.create({ user_id, service_name, description });
    res.status(201).json({ provider });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// List all providers
export async function listProviders(req, res) {
  try {
    const providers = await Provider.findAll({ include: [{ model: User, attributes: ['name', 'email'] }] });
    res.json({ providers });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get provider calendar (appointments)
export async function providerCalendar(req, res) {
  try {
    const { providerId } = req.params;
    const appointments = await Appointment.findAll({
      where: { provider_id: providerId },
      order: [['appointment_time', 'ASC']]
    });
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
