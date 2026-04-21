const axios = require('axios');

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'http://localhost:5002';

// AWS Lambda handler
exports.handler = async (event) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { submissionId, result } = body;

    console.log('[result-update-fn] Updating submission:', submissionId, '→', result.status);

    await axios.put(`${DATA_SERVICE_URL}/submissions/${submissionId}`, result);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Record updated', submissionId })
    };
};

// Local HTTP server (used in docker-compose / local dev)
if (require.main === module) {
    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/update', async (req, res) => {
        try {
            const result = await exports.handler({ body: req.body });
            res.status(result.statusCode).json(JSON.parse(result.body));
        } catch (err) {
            console.error('[result-update-fn] Error:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    const PORT = process.env.PORT || 5012;
    app.listen(PORT, () => console.log(`[result-update-fn] Running on port ${PORT}`));
}
