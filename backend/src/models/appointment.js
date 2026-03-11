// Add association to include client details in appointments
Appointment.belongsTo(User, { as: 'client', foreignKey: 'client_id' });