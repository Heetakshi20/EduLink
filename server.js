const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Models
const User = require('./models/User');
const JobApplication = require('./models/JobApplication');
const InternApplication = require('./models/InternApplication');
const Update = require('./models/Update');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/loginDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For JSON APIs like /api/updates
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Certificate Upload
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.session.username + '-' + unique + '-' + file.originalname);
  }
});
const uploadCertificate = multer({ storage: certificateStorage });

app.post('/upload-certificate', uploadCertificate.single('certificate'), async (req, res) => {
  if (!req.session.username) return res.status(401).send('Unauthorized');

  const user = await User.findOne({ name: req.session.username });
  if (!user) return res.status(404).send('User not found');

  user.certificates.push(req.file.filename);
  await user.save();
  res.status(200).json({ message: 'Upload successful', filename: req.file.filename });
});

app.delete('/delete-certificate/:filename', async (req, res) => {
  if (!req.session.username) return res.status(401).send('Unauthorized');

  const filename = req.params.filename;
  const user = await User.findOne({ name: req.session.username });
  if (!user) return res.status(404).send('User not found');

  user.certificates = user.certificates.filter(cert => cert !== filename);
  await user.save();

  const filePath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filePath, err => {
    if (err) return res.status(500).send('Failed to delete file');
    res.status(200).send('Certificate deleted successfully');
  });
});

app.get('/api/user-certificates', async (req, res) => {
  if (!req.session.username) return res.status(401).send('Unauthorized');
  const user = await User.findOne({ name: req.session.username });
  if (!user) return res.status(404).send('User not found');
  res.json({ certificates: user.certificates });
});

// Resume Upload for Job Applications
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.session.username + '-' + unique + '-' + file.originalname);
  }
});
const uploadResume = multer({ storage: resumeStorage });

app.post('/apply-job', uploadResume.single('resume'), async (req, res) => {
  if (!req.session.username) return res.status(401).send('Unauthorized');

  try {
    const { fullName, email, phone, cgpa, company, position, experience } = req.body;

    const newApplication = new JobApplication({
      fullName,
      email,
      phone,
      cgpa,
      company,
      position,
      experience,
      resume: req.file.filename,
      submittedBy: req.session.username
    });

    await newApplication.save();
    res.status(200).send('Application submitted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to submit job application');
  }
});

app.get('/api/job-applications', async (req, res) => {
  try {
    const applications = await JobApplication.find();
    res.json(applications);
  } catch (err) {
    res.status(500).send('Error fetching job applications');
  }
});

// Internship Application
app.post('/apply-internship', async (req, res) => {
  try {
    const { name, email, branch, division, rollno, internship } = req.body;

    const newIntern = new InternApplication({ name, email, branch, division, rollno, internship });
    await newIntern.save();
    res.send("Internship application submitted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to submit internship application');
  }
});

app.get('/api/intern-applications', async (req, res) => {
  try {
    const data = await InternApplication.find();
    res.json(data);
  } catch (err) {
    res.status(500).send('Failed to fetch intern data');
  }
});

// UPDATES (Announcements)
app.post('/api/updates', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'No content provided' });

    const update = new Update({ content });
    await update.save();
    res.status(200).json({ message: 'Update added', update });
  } catch (error) {
    console.error('Error saving update:', error);
    res.status(500).send('Error saving update');
  }
});

app.get('/api/updates', async (req, res) => {
  try {
    const updates = await Update.find().sort({ timestamp: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).send('Error fetching updates');
  }
});



app.get('/api/updates', async (req, res) => {
  try {
    const updates = await Update.find().sort({ timestamp: -1 }); // latest first
    res.json(updates);
  } catch (error) {
    res.status(500).send('Error fetching updates');
  }
});



//contact







// Signup
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role || 'student'
  });

  await newUser.save();
  res.redirect(role === 'admin' ? '/alogin.html' : '/login.html');
});

// Login
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('Incorrect password');

  if (user.role !== role) return res.redirect('/index.html');

  req.session.username = user.name;
  req.session.role = user.role;

  res.redirect(role === 'admin' ? '/admin.html' : '/dashboard.html');
});

// Protected dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.username) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, '/public/dashboard.html'));
});

// API to get username
app.get('/api/username', (req, res) => {
  res.json({ name: req.session.username || 'Guest' });
});

// Get all student users
app.get('/api/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (err) {
    res.status(500).send('Error fetching students');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
