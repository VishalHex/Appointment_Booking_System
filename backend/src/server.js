import express from 'express';
import cors from 'cors';
import winston from 'winston';
import dotenv from 'dotenv';
import router from './routes.js';
import { errorHandler, validateRegistration } from './middleware.js';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();
process.env.TZ = 'Asia/Kolkata';
const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: [
    // 'https://your-frontend-domain.com',
    frontendUrl
  ],
  credentials: true
}));
app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

app.set('logger', logger);

app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.send('Appointment Booking System Backend');
});

app.use('/api', router);
app.use(errorHandler);

import sequelize from './models.js';
async function startServer() {
  if (sequelize) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
    } catch (dbErr) {
      logger.error('Unable to connect to the database:', dbErr);
      process.exit(1);
    }
  } else {
    logger.warn('Running with local JSON data instead of a database.');
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH'],
  },
});

export { io };

server.listen(process.env.PORT || 3001, () => {
  logger.info(`Server is running on port ${process.env.PORT || 3001}`);
});
