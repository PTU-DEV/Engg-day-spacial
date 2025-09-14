import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import orderRoutes from './routes/order.route.js'; // cleaner import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

app.use(express.json());
app.use(express.static('public'));

// API routes
app.use('/api', orderRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
