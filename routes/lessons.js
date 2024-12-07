const express = require('express');
const { ObjectId } = require('mongodb');

// Function to setup routes for 'lessons'
function lessonsRoutes(client) {
    const router = express.Router();
    const collection = client.db("education").collection("lessons");

    // Middleware for logging requests
    function logRequest(req, res, next) {
        console.log(`Received request: ${req.method} ${req.url}`);
        next();
    }

    // Middleware for validating update data
    function validateUpdateData(req, res, next) {
        const updates = req.body;
        if (!Array.isArray(updates) || updates.some(update => !update.lessonId || !update.newSpace)) {
            return res.status(400).send("Invalid update data");
        }
        next();
    }

    // GET route to fetch lessons
    router.get('/all-lessons', logRequest, async (req, res) => {
        try {
            let query = {};
            let sort = {};
    
            if (req.query.search) {
                query.$or = [
                    { LessonName: { $regex: req.query.search, $options: 'i' } },
                    { LessonLocation: { $regex: req.query.search, $options: 'i' } }
                ];
            }
    
            if (req.query.sort) {
                let sortOrder = req.query.order === 'desc' ? -1 : 1;
                sort[req.query.sort] = sortOrder;
            }
    
            const lessons = await collection.find(query).sort(sort).toArray();
            res.json(lessons);
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    // PUT route to update existing lessons
    router.put('/update-lessons', [logRequest, validateUpdateData], async (req, res) => {
        try {
            const updates = req.body;
            const bulkUpdates = updates.map(update => ({
                updateOne: {
                    filter: { _id: new ObjectId(update.lessonId) },
                    update: { $set: { LessonSpace: update.newSpace } }
                }
            }));

            const result = await collection.bulkWrite(bulkUpdates);
            res.json({ message: 'Lessons updated', details: result });
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    return router;
}

module.exports = lessonsRoutes;