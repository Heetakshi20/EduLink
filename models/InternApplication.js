// models/InternApplication.js
const mongoose = require('mongoose');

const internApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  branch: { type: String, required: true },
  division: { type: String, required: true },
  rollno: { type: String, required: true },
  internship: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InternApplication', internApplicationSchema, 'interns');
