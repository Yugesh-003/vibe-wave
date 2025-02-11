require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Middleware
app.use(express.json()); // Allow JSON request body
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'public', 'index.html'));
});

// API to register new users (signup)
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  res.send('User registered successfully!');
});

// API to login users
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Incorrect password');

  res.send('Login successful!');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
