const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: String, // Storing as string to enforce YYYY-MM-DD format from frontend
        required: true
    },
    organiser: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['APPROVED', 'INCOMPLETE', 'NEEDS REVISION']
    },
    category: {
        type: String,
        required: true,
        enum: ['OPPORTUNITY', 'ACADEMIC', 'SOCIAL', 'GENERAL']
    },
    priority: {
        type: String,
        required: true,
        enum: ['HIGH', 'MEDIUM', 'NORMAL']
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('submission', SubmissionSchema);
