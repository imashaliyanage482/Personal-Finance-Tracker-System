import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, Transaction, Setting, mongoose } from './server/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection state cache
let isDbConnected = false;

// Connect to Database
connectDB().then(connected => {
  isDbConnected = connected;
});

// Watch connection state
mongoose.connection.on('connected', () => {
  isDbConnected = true;
});
mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
});
mongoose.connection.on('error', () => {
  isDbConnected = false;
});


// Helper database verification middleware
const checkDbConnection = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is offline. Please make sure MongoDB is running and your connection URI in .env is correct.' 
    });
  }
  next();
};

// --- ROUTES ---

// Database Status Endpoint
app.get('/api/db-status', (req, res) => {
  res.json({ connected: isDbConnected });
});

// 1. Transactions APIs
app.get('/api/transactions', checkDbConnection, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ rawDate: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', checkDbConnection, async (req, res) => {
  try {
    const newTx = new Transaction(req.body);
    const savedTx = await newTx.save();
    res.status(201).json(savedTx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', checkDbConnection, async (req, res) => {
  try {
    const updatedTx = await Transaction.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(updatedTx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', checkDbConnection, async (req, res) => {
  try {
    const deletedTx = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all data
app.post('/api/transactions/clear', checkDbConnection, async (req, res) => {
  try {
    await Transaction.deleteMany({});
    res.json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 2. Settings APIs
app.get('/api/settings', checkDbConnection, async (req, res) => {
  try {
    const usernameSetting = await Setting.findOne({ key: 'username' });
    const currencySetting = await Setting.findOne({ key: 'currency' });

    res.json({
      username: usernameSetting ? usernameSetting.value : 'Imasha Liyanage',
      currency: currencySetting ? currencySetting.value : 'Rs.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', checkDbConnection, async (req, res) => {
  const { username, currency } = req.body;
  try {
    if (username !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'username' }, 
        { value: username }, 
        { upsert: true, new: true }
      );
    }
    if (currency !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'currency' }, 
        { value: currency }, 
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production (optional stub)
// app.use(express.static(path.join(__dirname, 'dist')));

// Start Express App
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
