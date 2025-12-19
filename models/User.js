const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: 'student'
    },
    certificates: [String]  // ⬅ Add this field
});

module.exports = mongoose.model('User', userSchema);
