const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    location:    { type: String, required: true },
    date:        { type: String, required: true },
    organiser:   { type: String, required: true },
    status:      { type: String, enum: ['PENDING', 'APPROVED', 'INCOMPLETE', 'NEEDS REVISION'], default: 'PENDING' },
    category:    { type: String, enum: ['OPPORTUNITY', 'ACADEMIC', 'SOCIAL', 'GENERAL'], default: 'GENERAL' },
    priority:    { type: String, enum: ['HIGH', 'MEDIUM', 'NORMAL'], default: 'NORMAL' },
    note:        { type: String, default: '' },
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
