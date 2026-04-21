const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Submission = require('./models/submission');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusbuzz';
mongoose.connect(MONGO_URI)
    .then(() => console.log('[data-service] MongoDB connected'))
    .catch(err => console.error('[data-service] MongoDB error:', err));

// Create a new submission record
app.post('/submissions', async (req, res) => {
    try {
        const submission = new Submission(req.body);
        const saved = await submission.save();
        res.status(201).json(saved);
    } catch (err) {
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
        res.status(500).json({ error: err.message });
    }
});

// Update a submission (used by Result Update Function)
app.put('/submissions/:id', async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!submission) return res.status(404).json({ error: 'Not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`[data-service] Running on port ${PORT}`));
