// models/Update.js
const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Update', updateSchema);
