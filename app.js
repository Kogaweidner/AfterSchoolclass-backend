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

// Root path message
app.get('/', (req, res) => {
  res.send("Select a collection, e.g., /collection/messages");
});

// Middleware to get the collection
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  next();
});

// Retrieve all objects from collection
app.get('/collection/:collectionName', (req, res, next) => {
  req.collection.find({}).toArray((err, results) => {
    if (err) return next(err);
    res.send(results);
  });
});

// Insert a new object into the collection
app.post('/collection/:collectionName', (req, res, next) => {
  req.collection.insertOne(req.body, (err, result) => {
    if (err) return next(err);
    res.send(result);
  });
});

// Retrieve a single object by ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
    if (err) return next(err);
    res.send(result);
  });
});

// Update an object by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.updateOne(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    (err, result) => {
      if (err) return next(err);
      res.send({ msg: 'success' });
    }
  );
});

// Delete an object by ID
app.delete('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.deleteOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
    if (err) return next(err);
    res.send((result.deletedCount === 1) ? { msg: 'success' } : { msg: 'error' });
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to serve frontend (index.html) for any unrecognized routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
