import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const USE_LOCAL_DB = process.env.USE_LOCAL_DB === 'true';
const localDataPath = path.resolve(process.cwd(), 'localdata');

let sequelize;
if (!USE_LOCAL_DB) {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'appointment_db',
    process.env.DB_USER || 'user',
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
    }
  );
}

export const User = !USE_LOCAL_DB ? sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true, underscored: true }) : null;

export const Provider = !USE_LOCAL_DB ? sequelize.define('provider', {
  service_name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { timestamps: true, underscored: true }) : null;

export const Appointment = !USE_LOCAL_DB ? sequelize.define('appointment', {
  appointment_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  reminder_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true, underscored: true }) : null;

// Local data helpers
function readLocalData(file) {
  try {
    const data = fs.readFileSync(path.join(localDataPath, file), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
function writeLocalData(file, data) {
  fs.writeFileSync(path.join(localDataPath, file), JSON.stringify(data, null, 2));
}

export const LocalDB = {
  getUsers: () => readLocalData('users.json'),
  saveUsers: (users) => writeLocalData('users.json', users),
  getProviders: () => readLocalData('providers.json'),
  saveProviders: (providers) => writeLocalData('providers.json', providers),
  getAppointments: () => readLocalData('appointments.json'),
  saveAppointments: (appointments) => writeLocalData('appointments.json', appointments),
};

export default !USE_LOCAL_DB ? sequelize : null;
