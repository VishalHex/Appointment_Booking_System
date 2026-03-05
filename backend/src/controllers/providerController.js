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
    const flattenedProviders = providers.map(p => ({
      id: p.id,
      service_name: p.service_name,
      service_description: p.description,
      name: p.User?.name || 'Service Provider',
      email: p.User?.email
    }));
    res.json(flattenedProviders);
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

// Get available slots for a provider
export async function getProviderSlots(req, res) {
  try {
    const { providerId } = req.params;
    // For simplicity, generate some dummy slots for the next 7 days
    const slots = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      // Add slots from 9 AM to 5 PM, every hour
      for (let hour = 9; hour < 17; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        slots.push(slot.toISOString());
      }
    }
    res.json(slots);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
