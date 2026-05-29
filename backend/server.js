const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

let db;

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('fitness_tracker');
  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  console.log('Connected to MongoDB Atlas');
}

// --- Auth Middleware ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health check (no auth needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', connected: !!db });
});

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    };
    const result = await db.collection('users').insertOne(user);

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: result.insertedId.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth - exchange code for token and create/login user
app.post('/api/auth/google', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Use the redirect_uri from request, or fallback to env variable
    const redirectUri = redirect_uri || process.env.GOOGLE_REDIRECT_URI_WEB || GOOGLE_REDIRECT_URI;

    // Exchange authorization code for access token on the server
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Failed to exchange authorization code' });
    }

    // Verify the Google access token by fetching user info
    const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const googleUser = await googleRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'Could not get email from Google' });
    }

    // Check if user exists
    let user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user (no password since they use Google)
      const newUser = {
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        picture: picture || null,
        authProvider: 'google',
        createdAt: new Date(),
      };
      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- All data routes below require auth ---
app.use('/api/projects', authMiddleware);
app.use('/api/tasks', authMiddleware);
app.use('/api/progress-logs', authMiddleware);
app.use('/api/daily-entries', authMiddleware);
app.use('/api/health-data', authMiddleware);
app.use('/api/settings', authMiddleware);

// --- Projects (scoped by userId) ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.collection('projects').find({ userId: req.userId }).sort({ createdAt: -1 }).toArray();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = { ...req.body, userId: req.userId, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('projects').insertOne(project);
    res.json({ ...project, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    delete update.userId;
    await db.collection('projects').updateOne({ id: req.params.id, userId: req.userId }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await db.collection('projects').deleteOne({ id: req.params.id, userId: req.userId });
    await db.collection('tasks').deleteMany({ projectId: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Tasks (scoped by userId) ---
app.get('/api/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = { userId: req.userId };
    if (projectId) filter.projectId = projectId;
    const tasks = await db.collection('tasks').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = { ...req.body, userId: req.userId, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('tasks').insertOne(task);
    res.json({ ...task, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    delete update.userId;
    await db.collection('tasks').updateOne({ id: req.params.id, userId: req.userId }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.collection('tasks').deleteOne({ id: req.params.id, userId: req.userId });
    await db.collection('progress_logs').deleteMany({ taskId: req.params.id, userId: req.userId });
    await db.collection('daily_entries').deleteMany({ taskId: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Progress Logs (scoped by userId) ---
app.get('/api/progress-logs', async (req, res) => {
  try {
    const { taskId, startDate, endDate } = req.query;
    const filter = { userId: req.userId };
    if (taskId) filter.taskId = taskId;
    if (startDate && endDate) {
      filter.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const logs = await db.collection('progress_logs').find(filter).sort({ timestamp: -1 }).toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress-logs', async (req, res) => {
  try {
    const log = { ...req.body, userId: req.userId, timestamp: req.body.timestamp || new Date() };
    const result = await db.collection('progress_logs').insertOne(log);
    res.json({ ...log, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Daily Entries (scoped by userId) ---
app.get('/api/daily-entries', async (req, res) => {
  try {
    const { taskId, date, startDate, endDate } = req.query;
    const filter = { userId: req.userId };
    if (taskId) filter.taskId = taskId;
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    const entries = await db.collection('daily_entries').find(filter).sort({ date: -1 }).toArray();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-entries', async (req, res) => {
  try {
    const { taskId, date } = req.body;
    const existing = await db.collection('daily_entries').findOne({ taskId, date, userId: req.userId });
    if (existing) {
      const update = { ...req.body, updatedAt: new Date() };
      delete update._id;
      await db.collection('daily_entries').updateOne({ taskId, date, userId: req.userId }, { $set: update });
      res.json({ ...existing, ...update });
    } else {
      const entry = { ...req.body, userId: req.userId, createdAt: new Date() };
      const result = await db.collection('daily_entries').insertOne(entry);
      res.json({ ...entry, _id: result.insertedId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Data (scoped by userId) ---
app.get('/api/health-data', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.userId };
    if (date) filter.date = date;
    const data = await db.collection('health_data').find(filter).sort({ date: -1 }).limit(30).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/health-data', async (req, res) => {
  try {
    const { date } = req.body;
    const existing = await db.collection('health_data').findOne({ date, userId: req.userId });
    if (existing) {
      const update = { ...req.body, updatedAt: new Date() };
      delete update._id;
      await db.collection('health_data').updateOne({ date, userId: req.userId }, { $set: update });
      res.json({ ...existing, ...update });
    } else {
      const entry = { ...req.body, userId: req.userId, createdAt: new Date() };
      const result = await db.collection('health_data').insertOne(entry);
      res.json({ ...entry, _id: result.insertedId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Settings (scoped by userId) ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.collection('settings').findOne({ userId: req.userId });
    res.json(settings || { darkMode: false, notificationsEnabled: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    await db.collection('settings').updateOne(
      { userId: req.userId },
      { $set: { ...req.body, userId: req.userId, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
