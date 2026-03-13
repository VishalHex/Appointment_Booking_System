import { Appointment, Provider, User } from '../models.js';
import { io } from '../server.js';

export async function bookAppointment(req, res) {
  try {
    const { provider_id, appointment_time } = req.body;
    const client_id = req.user.id;

    const apptDate = new Date(appointment_time);
    const userExists = await Appointment.findOne({
      where: { client_id, appointment_time: apptDate, status: 'booked' }
    });
    if (userExists) return res.status(409).json({ error: 'You already have an appointment at this time' });

    const providerExists = await Appointment.findOne({
      where: { provider_id, appointment_time: apptDate, status: 'booked' }
    });
    if (providerExists) return res.status(409).json({ error: 'Slot already booked' });

    const appointment = await Appointment.create({
      client_id,
      provider_id,
      appointment_time: apptDate,
      status: 'booked',
      reminder_sent: false
    });
    res.status(201).json({ appointment });

    const provider = await Provider.findByPk(provider_id, {
      attributes: ['id', 'service_name', 'description']
    });

    io.emit('newBooking', { appointment: { ...appointment.toJSON(), provider } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

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

    const provider = await Provider.findByPk(appointment.provider_id, {
      attributes: ['service_name']
    });
    const user = await User.findByPk(appointment.client_id, {
      attributes: ['name']
    });
    io.emit('appointmentCancelled', { appointment: { ...appointment.toJSON(), provider, user } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listAppointments(req, res) {
  try {
    let where = {};

    if (req.user.role === 'client') {
      where.client_id = req.user.id;
    } else if (req.user.role === 'provider') {
      where['$provider.user.id$'] = req.user.id; // Refactor to filter by provider.user_id
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Provider,
          attributes: ['id', 'service_name', 'description'],
          include: [{ model: User, as: 'user', attributes: ['name'] }],
          required: false
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email'],
          required: false
        }
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

export async function listAvailableSlots(req, res) {
  try {
    const { providerId } = req.params;
    const slots = [];
    const now = new Date();
    const maxDate = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000); // 4 months

    for (let d = 0; d <= 120; d++) {
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      if (currentDate > maxDate) break;

      // Skip weekends (optional - remove if you want weekends available)
      // const dayOfWeek = currentDate.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)

      for (let h = 9; h < 17; h++) {
        const slot = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), h, 0, 0, 0);
        const yr = slot.getFullYear();
        const mo = String(slot.getMonth() + 1).padStart(2, '0');
        const da = String(slot.getDate()).padStart(2, '0');
        const hr = String(slot.getHours()).padStart(2, '0');
        const mi = String(slot.getMinutes()).padStart(2, '0');
        const sec = String(slot.getSeconds()).padStart(2, '0');
        slots.push(`${yr}-${mo}-${da}T${hr}:${mi}:${sec}`);
      }
    }

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

    const available = slots.filter(s => !bookedTimes.includes(s));
    res.json(available);
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(400).json({ error: err.message });
  }
}

export async function getProviderAppointments(req, res) {
  const { provider_id } = req.params;

  if (!provider_id) {
    return res.status(400).json({ error: 'Provider ID is required' });
  }

  try {
    const appointments = await Appointment.findAll({
      where: { provider_id },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching provider appointments:', error);
    res.status(500).json({ error: 'Failed to fetch provider appointments' });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: 'Appointment status updated successfully', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
}
