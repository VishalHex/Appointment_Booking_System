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

export async function listProviders(req, res) {
  try {
    const providers = await Provider.findAll({ include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] });
    const flattenedProviders = providers.map(p => ({
      id: p.id,
      service_name: p.service_name,
      service_description: p.description,
      name: p.user?.name || 'Service Provider',
      email: p.user?.email
    }));
    res.json(flattenedProviders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function providerCalendar(req, res) {
  try {
    const { providerId } = req.params;
    const appointments = await Appointment.findAll({
      where: { provider_id: providerId },
      order: [['appointment_time', 'ASC']]
    });
    const formattedAppointments = appointments.map(apt => {
      const d = apt.appointment_time;
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const hr = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      return {
        ...apt.toJSON(),
        appointment_time: `${yr}-${mo}-${da}T${hr}:${mi}:${sec}`
      };
    });
    res.json(formattedAppointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getProviderSlots(req, res) {
  try {
    const { providerId } = req.params;

    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const slots = [];
    const now = new Date();
    const maxDate = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

    for (let i = 1; i <= 120; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      if (date > maxDate) break;

      // Skip weekends (optional - remove if you want weekends available)
      // const dayOfWeek = date.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)

      for (let hour = 9; hour < 17; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        const yr = slot.getFullYear();
        const mo = String(slot.getMonth() + 1).padStart(2, '0');
        const da = String(slot.getDate()).padStart(2, '0');
        const hr = String(slot.getHours()).padStart(2, '0');
        const mi = String(slot.getMinutes()).padStart(2, '0');
        const sec = String(slot.getSeconds()).padStart(2, '0');
        slots.push(`${yr}-${mo}-${da}T${hr}:${mi}:${sec}`);
      }
    }

    res.json(slots);
  } catch (err) {
    console.error('Error fetching provider slots:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
