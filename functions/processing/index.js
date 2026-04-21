const axios = require('axios');

const RESULT_UPDATE_URL = process.env.RESULT_UPDATE_URL || 'http://localhost:5012';

// Apply all project rules and compute the result
function computeResult(data) {
    const { title, description, location, date, organiser } = data;

    // Rule 1: All fields must be present (this works with empty strings too)
    if (!title || !description || !location || !date || !organiser) {
        return {
            status: 'INCOMPLETE',
            category: 'GENERAL',
            priority: 'NORMAL',
            note: 'Submission is incomplete. One or more required fields are missing.'
        };
    }

    // Rule 2: Date must be YYYY-MM-DD and a real date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return {
            status: 'NEEDS REVISION',
            category: 'GENERAL',
            priority: 'NORMAL',
            note: 'Date format is invalid. Please use YYYY-MM-DD.'
        };
    }

    //check if is a real date
    const [year, month, day] = date.split('-').map(Number);
    const realDate = new Date(year, month - 1, day);
    const isValidDate =
        realDate.getFullYear() === year &&
        realDate.getMonth() === month - 1 &&
        realDate.getDate() === day &&
        year >= 1900 && year <= 2100;

    if (!isValidDate) {
        return {
            status: 'NEEDS REVISION',
            category: 'GENERAL',
            priority: 'NORMAL',
            note: 'Date is invalid. Please enter a real date (e.g., 2025-12-25).'
        };
    }

    // Rule 3: Description must be at least 40 characters
    if (description.length < 40) {
        return {
            status: 'NEEDS REVISION',
            category: 'GENERAL',
            priority: 'NORMAL',
            note: 'Description is too short. Please provide at least 40 characters.'
        };
    }

    // Rule 4 & 5: Category and priority based on keywords in title OR description
    const text = `${title} ${description}`.toLowerCase();
    let category, priority;

    if (/career|internship|recruitment/.test(text)) {
        category = 'OPPORTUNITY';
        priority = 'HIGH';
    } else if (/workshop|seminar|lecture/.test(text)) {
        category = 'ACADEMIC';
        priority = 'MEDIUM';
    } else if (/club|society|social/.test(text)) {
        category = 'SOCIAL';
        priority = 'NORMAL';
    } else {
        category = 'GENERAL';
        priority = 'NORMAL';
    }

    return {
        status: 'APPROVED',
        category,
        priority,
        note: `Event approved. Categorised as ${category} with ${priority} priority.`
    };
}

// AWS Lambda handler
exports.handler = async (event) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { submissionId, data } = body;

    console.log('[processing-fn] Processing submission:', submissionId);

    const result = computeResult(data);

    await axios.post(`${RESULT_UPDATE_URL}/update`, { submissionId, result });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Processing complete', submissionId, result })
    };
};

// Local HTTP server (used in docker-compose / local dev)
if (require.main === module) {
    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/process', async (req, res) => {
        try {
            const result = await exports.handler({ body: req.body });
            res.status(result.statusCode).json(JSON.parse(result.body));
        } catch (err) {
            console.error('[processing-fn] Error:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    const PORT = process.env.PORT || 5011;
    app.listen(PORT, () => console.log(`[processing-fn] Running on port ${PORT}`));
}
