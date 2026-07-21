import mongoose from 'mongoose';

// Define Transaction Schema
const TransactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Completed' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Define Settings Schema
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
const Setting = mongoose.model('Setting', SettingSchema);

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_tracker';
  try {
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

export {
  connectDB,
  Transaction,
  Setting,
  mongoose
};
