const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_SERVICE_URL         = process.env.DATA_SERVICE_URL         || 'http://localhost:5002';
const SUBMISSION_EVENT_URL     = process.env.SUBMISSION_EVENT_URL     || 'http://localhost:5010';

// Receive form submission from Presentation Service
app.post('/submit', async (req, res) => {
    const { title, description, location, date, organiser } = req.body;

    // Always create a record, even with empty fields
    const submissionData = {
        title: title || '',
        description: description || '',
        location: location || '',
        date: date || '',
        organiser: organiser || ''
    };

    try {
        // Step 1: Create initial record in Data Service with PENDING status
        const record = await axios.post(`${DATA_SERVICE_URL}/submissions`, submissionData);
        const submissionId = record.data._id;

        // Step 2: Trigger Submission Event Function asynchronously (don't wait for response)
        axios.post(`${SUBMISSION_EVENT_URL}/trigger`, {
            submissionId,
            data: submissionData
        }).catch(err => console.error('[workflow-service] Event trigger failed:', err.message));

        // Step 3: Return submission ID immediately
        res.json({ submissionId });
    } catch (err) {
        console.error('[workflow-service] Error:', err.message);
        // Even if something fails, try to return a response
        res.status(500).json({ error: 'Workflow service error' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`[workflow-service] Running on port ${PORT}`));