const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const lessonsRoutes = require('./routes/lessons');
const ordersRoutes = require('./routes/orders');
const logger = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// Use the PORT environment variable if it's set, otherwise default to 3000
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.json());


const functionalLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'functional.log'), { flags: 'a' });


logger.token('message', function (req, res) { return req.message });

// Register the logger middleware
function logFunction(req, res, next) {
    const originalSend = res.send;
    res.send = function (data) {
        if (req.message) {
            const logEntry = `${new Date().toISOString()} ${req.method} ${req.originalUrl} Message: ${req.message}\n`;
            functionalLogStream.write(logEntry);
        }
        originalSend.apply(res, arguments);
    }
    next();
}

app.use((req, res, next) => {
    functionalLogStream.write(`Received a ${req.method} request at ${req.url}\n`);
    next();
});

app.use('/static', express.static(path.join(__dirname, 'images')));


// MongoDB connection
const mongoUri = 'mongodb+srv://mf883:0X5coeqrw5mFjRYS@mdx.nfeuxor.mongodb.net/?retryWrites=true&w=majority'; // MongoDB URI
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDb() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error(e);
    }
}

connectDb();

// Routes
app.use('/lessons', lessonsRoutes(client));
app.use('/orders', ordersRoutes(client));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(logger('combined', { stream: accessLogStream }));


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});