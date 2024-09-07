const { MongoClient } = require('mongodb');

// Connection URI
const uri = process.env.MONGO_URI;

let db;

async function connectToDb() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect(); // Ensures the connection is established before proceeding
        db = client.db(process.env.DB_NAME);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if the connection fails
    }
}

// Return the database instance
function getDb() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
}

module.exports = {
    connectToDb,
    getDb
};