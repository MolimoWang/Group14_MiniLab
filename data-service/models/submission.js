const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    title:       { type: String, required: false, default: '' },  // 改为 false
    description: { type: String, required: false, default: '' },
    location:    { type: String, required: false, default: '' },
    date:        { type: String, required: false, default: '' },
    organiser:   { type: String, required: false, default: '' },
    status:      { type: String, enum: ['PENDING', 'APPROVED', 'INCOMPLETE', 'NEEDS REVISION'], default: 'PENDING' },
    category:    { type: String, enum: ['OPPORTUNITY', 'ACADEMIC', 'SOCIAL', 'GENERAL'], default: 'GENERAL' },
    priority:    { type: String, enum: ['HIGH', 'MEDIUM', 'NORMAL'], default: 'NORMAL' },
    note:        { type: String, default: '' },
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);