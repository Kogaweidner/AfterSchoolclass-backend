const express = require('express');
const { ObjectId } = require('mongodb');

// Function to setup routes for 'orders'
function ordersRoutes(client) {
    const router = express.Router();
    const collection = client.db("education").collection("orders");

    // Middleware for logging requests
    function logRequest(req, res, next) {
        console.log(`Received request: ${req.method} ${req.url}`);
        next();
    }

    
    // GET route to fetch all orders with optional filters
    router.get('/all-orders', logRequest, async (req, res) => {
        try {
            let query = {};
            if (req.query.status) {
                query.status = req.query.status;
            }
            if (req.query.title) {
                query.title = req.query.title;
            }

            const orders = await collection.find(query).toArray();
            res.json(orders);
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    // GET route to fetch a specific order by ID
    router.get('/get-order-by-id/:id', logRequest, async (req, res) => {
        try {
            const order = await collection.findOne({ _id: new ObjectId(req.params.id) });
            if (!order) return res.status(404).send('Order not found');
            res.json(order);
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    // POST route to create a new order
    router.post('/create-order', logRequest, async (req, res) => {
        try {
            const newOrder = req.body;
            const result = await collection.insertOne(newOrder);
            res.status(201).json(result);
        } catch (e) {
            console.error(e);
            res.status(500).send(e.message);
        }
    });

    // DELETE route to delete an order by ID
    router.delete('/delete-order/:id', logRequest, async (req, res) => {
        try {
            const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
            if (result.deletedCount === 0) return res.status(404).send('Order not found');
            res.status(204).send();
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    return router;
}

module.exports = ordersRoutes;