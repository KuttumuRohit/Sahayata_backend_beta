// server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Sahayata';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
});

// Donation Schema and Model
const donationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    amount: {
        type: Number,
        required: [true, 'Donation amount is required'],
        min: [0, 'Donation amount must be positive'],
    },
    cause: {
        type: String,
        required: [true, 'Cause is required'],
        enum: ['Old Age Home', 'Orphanage', 'Medical Emergency', 'Education', 'Environmental'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Donation = mongoose.model('Donation', donationSchema);

// POST Route: Submit a Donation
app.post('/api/donate', async (req, res) => {
    const { name, email, amount, cause } = req.body;

    // Validate Request Body
    if (!name || !email || !amount || !cause) {
        return res.status(400).json({ message: 'All fields (name, email, amount, cause) are required.' });
    }

    try {
        // Create a new Donation document
        const newDonation = new Donation({
            name,
            email,
            amount,
            cause,
        });

        // Save to MongoDB
        const savedDonation = await newDonation.save();

        res.status(201).json({
            message: 'Donation submitted successfully!',
            donation: savedDonation,
        });
    } catch (error) {
        console.error('Error saving donation:', error);
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server Error: Unable to process donation.' });
    }
});

// GET Route: Get Total Donations
app.get('/api/donations/total', async (req, res) => {
    try {
        const total = await Donation.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        res.status(200).json({
            totalDonated: total[0]?.totalAmount || 0,
        });
    } catch (error) {
        console.error('Error fetching total donations:', error);
        res.status(500).json({ message: 'Server Error: Unable to fetch total donations.' });
    }
});
app.get('/api/donations/last-5', async (req, res) => {
    try {
        // Find the last 5 donations, sorted by date in descending order
        const lastDonations = await Donation.find().sort({ date: -1 }).limit(5);

        res.status(200).json({
            lastDonations,
        });
    } catch (error) {
        console.error('Error fetching last donations:', error);
        res.status(500).json({ message: 'Server Error: Unable to fetch last donations.' });
    }
});

// GET Route: Get Donations by Cause
app.get('/api/donations/by-cause', async (req, res) => {
    try {
        const donationsByCause = await Donation.aggregate([
            {
                $group: {
                    _id: '$cause',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    cause: '$_id',
                    totalAmount: 1,
                    count: 1,
                },
            },
            {
                $sort: { totalAmount: -1 },
            },
        ]);

        res.status(200).json({
            donationsByCause,
        });
    } catch (error) {
        console.error('Error fetching donations by cause:', error);
        res.status(500).json({ message: 'Server Error: Unable to fetch donations by cause.' });
    }
});

// Optional: GET Route to Fetch All Donations (for admin purposes)
app.get('/api/donations', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ date: -1 });
        res.status(200).json({ donations });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Server Error: Unable to fetch donations.' });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send('Donation API is running.');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
