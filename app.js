const express = require('express');
const path = require('path');
const { MongoClient, ObjectID } = require('mongodb');

const app = express();

// Middleware configuration
app.use(express.json());
app.set('port', process.env.PORT || 3000);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

// Connecting to MongoDB
let db;
MongoClient.connect('mongodb+srv://sokolig:Wednesday@cluster0.n4bti.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }
  db = client.db('Classes');
  console.log('Connected to MongoDB');
});

// API routes
app.get('/api/collections/:collectionName', (req, res) => {
  req.collection.find({}).toArray((err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to serve frontend (index.html) for any unrecognized routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
