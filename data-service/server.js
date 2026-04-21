const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Submission = require('./models/submission');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusbuzz';

// Connection retry logic
const connectWithRetry = async (retries = 5, interval = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(MONGO_URI);
            console.log('[data-service] MongoDB connected successfully');
            return;
        } catch (err) {
            console.log(`[data-service] Connection attempt ${i + 1}/${retries} failed: ${err.message}`);
            if (i < retries - 1) {
                console.log(`[data-service] Retrying in ${interval}ms...`);
                await new Promise(resolve => setTimeout(resolve, interval));
            } else {
                console.error('[data-service] All connection attempts failed. Exiting...');
                process.exit(1);
            }
        }
    }
};

connectWithRetry();

// Create a new submission record (allow empty fields)
app.post('/submissions', async (req, res) => {
    try {
        const submission = new Submission({
            title: req.body.title || '',
            description: req.body.description || '',
            location: req.body.location || '',
            date: req.body.date || '',
            organiser: req.body.organiser || '',
            status: 'PENDING'
        });
        const saved = await submission.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('[data-service] Create error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get a submission by ID
app.get('/submissions/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Not found' });
        res.json(submission);
    } catch (err) {
        console.error('[data-service] Get error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update a submission (used by Result Update Function)
app.put('/submissions/:id', async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: false }  // runValidators: false to allow any status
        );
        if (!submission) return res.status(404).json({ error: 'Not found' });
        res.json(submission);
    } catch (err) {
        console.error('[data-service] Update error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`[data-service] Running on port ${PORT}`));