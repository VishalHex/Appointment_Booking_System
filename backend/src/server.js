import express from 'express';
import cors from 'cors';
import winston from 'winston';
import dotenv from 'dotenv';
import router from './routes.js';
import { errorHandler, validateRegistration } from './middleware.js';

dotenv.config();
const app = express();
// Allow CORS for frontend origin
app.use(cors({
  origin: [
    // 'https://your-frontend-domain.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Logger setup
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
