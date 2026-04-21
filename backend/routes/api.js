const express = require('express');
const router = express.Router();
const Submission = require('../models/submission');

// @route   POST api/submit
// @desc    Create a submission
router.post('/submit', async (req, res) => {
    const { title, description, location, date, organiser } = req.body;

    // 1. Missing Fields Check
    if (!title || !description || !location || !date || !organiser) {
        return res.status(400).json({ status: 'INCOMPLETE', message: 'All fields are required.' });
    }

    // 2. Date Format Check (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).json({ status: 'NEEDS REVISION', message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // 3. Length Check
    if (description.length < 40) {
        return res.status(400).json({ status: 'NEEDS REVISION', message: 'Description must be at least 40 characters long.' });
    }

    // 4. Category & Priority Assignment
    let category = 'GENERAL';
    let priority = 'NORMAL';
    const lowerCaseDesc = description.toLowerCase();

    if (['career', 'internship', 'recruitment'].some(keyword => lowerCaseDesc.includes(keyword))) {
        category = 'OPPORTUNITY';
        priority = 'HIGH';
    } else if (['workshop', 'seminar', 'lecture'].some(keyword => lowerCaseDesc.includes(keyword))) {
        category = 'ACADEMIC';
        priority = 'MEDIUM';
    } else if (['club', 'society', 'social'].some(keyword => lowerCaseDesc.includes(keyword))) {
        category = 'SOCIAL';
        priority = 'NORMAL';
    }

    const newSubmission = new Submission({
        title,
        description,
        location,
        date,
        organiser,
        status: 'APPROVED',
        category,
        priority
    });

    try {
        const savedSubmission = await newSubmission.save();
        res.json(savedSubmission);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
