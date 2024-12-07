// Create Express.js instance
var express = require("express")
var path = require('path')  
const cors = require('cors')
const app = express()

const corsOptions = {
    origin: 'https://kogaweidner.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}

app.use(cors(corsOptions));

// Configuring Express.js
app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://kogaweidner.github.io'); // Allow only specific origin
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); // General request logging
    next();
});

// Connecting to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;
// Inside the connect code is the connection string of your server
MongoClient.connect('mongodb+srv://sokolig:Wednesday@cluster0.n4bti.mongodb.net/', (err, client) => {
    db = client.db('Classes')
})

// Display message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send("Select a collection, e.g., /collection/messages")
})

// Getting the collection name
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// Retrieve all objects from collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        console.log(`[${new Date().toISOString()}] POST to collection ${req.params.collectionName}:`, req.body); // Log POST data
        res.send(results)
    })
})

const ObjectID = require('mongodb').ObjectID;

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        (e, result) => {
            if (e) return next(e)
            console.log(`[${new Date().toISOString()}] PUT to collection ${req.params.collectionName}, ID: ${req.params.id}:`, req.body); // Log PUT data
            res.send({ msg: 'success' })
        }
    )
})

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e)
            console.log(`[${new Date().toISOString()}] DELETE from collection ${req.params.collectionName}, ID: ${req.params.id}`); // Log DELETE action
            res.send((result.result.n === 1) ?
                { msg: 'success' } : { msg: 'error' })
        }
    )
})

// Example logging for specific routes
app.post('/add-to-cart', (req, res) => {
    const { itemId, quantity } = req.body;
    console.log(`[${new Date().toISOString()}] ADD_TO_CART - Item: ${itemId}, Quantity: ${quantity}`);
    res.status(200).send('Item added to cart');
});

app.post('/submit-order', (req, res) => {
    const { orderId, userId } = req.body;
    console.log(`[${new Date().toISOString()}] SUBMIT_ORDER - OrderID: ${orderId}, UserID: ${userId}`);
    res.status(200).send('Order submitted');
});

var publicPath = path.resolve(__dirname, 'public');
var imagePath = path.resolve(__dirname, 'images');
app.use (express.static(imagePath));
app.use(express.static(publicPath));
app.use(function (request, response){
    response.writeHead(200,{
        'Content-Type': 'text/html'
    });
    response.end("Looks like you didn't find a static file.");
});
// Start server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Express.js server running at http://localhost:${port}`);
});
