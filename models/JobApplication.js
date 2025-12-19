const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: { 
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    cgpa: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    resumeFileName: {  // Stores the uploaded resume filename
        type: String
    },
    userEmail: {  // To track which logged-in user submitted the form (if needed)
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema, 'jobs');
