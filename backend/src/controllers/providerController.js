import { Provider, Appointment, User } from '../models.js';
import { Op } from 'sequelize';

export async function registerProvider(req, res) {
  try {
    const { user_id, service_name, description } = req.body;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    const user = await User.findByPk(user_id);
    if (!user || user.role !== 'provider') {
      return res.status(400).json({ error: 'User must exist and have provider role' });
    }
    const existingProvider = await Provider.findOne({ where: { user_id } });
    if (existingProvider) {
      return res.status(409).json({ error: 'Provider profile already exists for this user' });
    }
    const provider = await Provider.create({ user_id, service_name, description });
    res.status(201).json({ provider });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listProviders(req, res) {
  try {
    const providers = await Provider.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
        where: { role: 'provider' },
        required: true
      }],
      order: [['service_name', 'ASC']]
    });
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

export async function listProviderUsers(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    const users = await User.findAll({
      where: { role: 'provider' },
      attributes: ['id', 'name', 'email'],
      include: [{ model: Provider, attributes: ['id'], required: false }],
      order: [['name', 'ASC']]
    });

    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      hasProvider: Array.isArray(u.providers) && u.providers.length > 0
    }));
    res.json(mapped);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProvider(req, res) {
  try {
    const { providerId } = req.params;
    const { user_id, service_name, description } = req.body;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

    const provider = await Provider.findByPk(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user || user.role !== 'provider') {
        return res.status(400).json({ error: 'User must exist and have provider role' });
      }
      const conflict = await Provider.findOne({
        where: {
          user_id,
          id: { [Op.ne]: providerId }
        }
      });
      if (conflict) {
        return res.status(409).json({ error: 'Provider profile already exists for this user' });
      }
      provider.user_id = user_id;
    }

    if (service_name !== undefined) provider.service_name = service_name;
    if (description !== undefined) provider.description = description;
    await provider.save();

    res.json({ provider });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProvider(req, res) {
  try {
    const { providerId } = req.params;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

    const provider = await Provider.findByPk(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    await provider.destroy();
    res.json({ success: true });
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
        formattedTime: `${yr}-${mo}-${da} ${hr}:${mi}:${sec}`
      };
    });
    res.json({ calendar: formattedAppointments });
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
