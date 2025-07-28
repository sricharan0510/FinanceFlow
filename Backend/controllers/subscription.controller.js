import Subscription from '../models/subscription.model.js';

// Get all subscriptions for a user
export const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id }).sort({ billingDate: 1 });
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
};

// Get a single subscription
export const getSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.json(subscription);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch subscription' });
    }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
    try {
        const { name, amount, billingDate, frequency, status } = req.body;
        const subscription = new Subscription({
            user: req.user._id,
            name,
            amount,
            billingDate,
            frequency,
            status
        });
        await subscription.save();
        res.status(201).json(subscription);
    } catch (err) {
        res.status(400).json({ message: 'Failed to create subscription' });
    }
};

// Update a subscription
export const updateSubscription = async (req, res) => {
    try {
        const { name, amount, billingDate, frequency, status } = req.body;
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { name, amount, billingDate, frequency, status },
            { new: true }
        );
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.json(subscription);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update subscription' });
    }
};

// Delete a subscription
export const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.status(204).end();
    } catch (err) {
        res.status(400).json({ message: 'Failed to delete subscription' });
    }
};
