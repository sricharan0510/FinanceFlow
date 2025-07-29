import mongoose from 'mongoose';

const goalSavingSchema = new mongoose.Schema({
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('GoalSaving', goalSavingSchema);
