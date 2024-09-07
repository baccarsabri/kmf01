const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

exports.insert = async (req, res) => {
    const { table_name, insert_data } = req.body;

    if (!table_name || !insert_data || typeof insert_data !== 'object') {
        return res.status(400).json({ error: 'Invalid table_name or insert_data' });
    }

    let client;
    try {
        client = new MongoClient(uri, {});
        await client.connect();
        const db = client.db();

        insert_data.active_record = 1;

        const result = await db.collection(table_name).insertOne(insert_data);

        return res.status(201).json({ message: 'Data inserted successfully', insertedId: result.insertedId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    const { table_name, id } = req.body;

    if (!table_name || !id) {
        return res.status(400).json({ error: 'Invalid table_name or id' });
    }

    let client;
    try {
        client = new MongoClient(uri, {});
        await client.connect();
        const db = client.db();


        const result = await db.collection(table_name).updateOne(
            { _id: new ObjectId(id) },
            { $set: { active_record: 0 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        return res.status(200).json({ message: 'Record soft deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    const { table_name, id, update_data } = req.body;

    if (!table_name || !id || !update_data || typeof update_data !== 'object') {
        return res.status(400).json({ error: 'Invalid table_name, id, or update_data' });
    }

    let client;
    try {
        client = new MongoClient(uri, {});
        await client.connect();
        const db = client.db();


        const result = await db.collection(table_name).updateOne(
            { _id: new ObjectId(id), active_record: 1 },
            { $set: update_data }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Active record not found' });
        }

        return res.status(200).json({ message: 'Record updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.select = async (req, res) => {
    const { table_name, select_type, selected_fields } = req.body;

    if (!table_name || !select_type) {
        return res.status(400).json({ error: 'Invalid table_name or select_type' });
    }

    let client;
    try {
        client = new MongoClient(uri, {});
        await client.connect();
        const db = client.db();

        let query = { active_record: 1 };
        let result;

        if (select_type === 'select_all') {
            // Select all active records
            result = await db.collection(table_name).find(query).toArray();
        } else if (select_type === 'select_selected_fields' && selected_fields) {

            const projection = {};
            selected_fields.forEach(field => projection[field] = 1);
            result = await db.collection(table_name).find(query).project(projection).toArray();
        } else if (select_type === 'select_count') {
            // Return the count of active records
            result = await db.collection(table_name).countDocuments(query);
        } else {
            return res.status(400).json({ error: 'Invalid select_type or missing selected_fields' });
        }

        return res.status(200).json({ data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};
