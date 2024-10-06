// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Donation Schema
const donationSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    cause: String,
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    stars:Number,
});

// Contact Us Schema
const contactUsSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
});

// Donation Model
const Donation = mongoose.model('Donation', donationSchema);

// Feedback Model
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Contact Us Model
const ContactUs = mongoose.model('ContactUs', contactUsSchema);

// POST route for Donation form
app.post('/api/donation', async (req, res) => {
    try {
        const donation = new Donation(req.body);
        await donation.save();
        res.status(201).json({ message: 'Donation submitted successfully!' });
    } catch (error) {
        res.status(400).json({ message: 'Error processing donation', error });
    }
});

// POST route for Feedback form
app.post('/api/feedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(400).json({ message: 'Error processing feedback', error });
    }
});

// POST route for Contact Us form
// POST route for Contact Us form
app.post('/api/contactus', async (req, res) => {
    console.log('Received data:', req.body); // Log the received data
    try {
        const contactUs = new ContactUs(req.body);
        await contactUs.save();
        res.status(201).json({ message: 'Contact form submitted successfully!' });
    } catch (error) {
        console.error('Error processing contact form:', error); // Log the error if occurs
        res.status(400).json({ message: 'Error processing contact form', error });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
