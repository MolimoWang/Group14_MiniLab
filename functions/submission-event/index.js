const axios = require('axios');

const PROCESSING_URL = process.env.PROCESSING_URL || 'http://localhost:5011';

// AWS Lambda handler
exports.handler = async (event) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { submissionId, data } = body;

    console.log('[submission-event] Triggering processing for:', submissionId);

    await axios.post(`${PROCESSING_URL}/process`, { submissionId, data });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Processing triggered', submissionId })
    };
};

// Local HTTP server (used in docker-compose / local dev)
if (require.main === module) {
    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/trigger', async (req, res) => {
        try {
            const result = await exports.handler({ body: req.body });
            res.status(result.statusCode).json(JSON.parse(result.body));
        } catch (err) {
            console.error('[submission-event] Error:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    const PORT = process.env.PORT || 5010;
    app.listen(PORT, () => console.log(`[submission-event-fn] Running on port ${PORT}`));
}
