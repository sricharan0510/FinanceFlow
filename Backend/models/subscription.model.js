import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    billingDate: { type: Date, required: true },
    frequency: { type: String, enum: ['monthly', 'yearly', 'weekly', 'custom'], default: 'monthly' },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
