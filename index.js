const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle weares
app.use(cors());
app.use(express.json());


//mongodb connection tools
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y4qnm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        // db collections
        const database = client.db("rizasParlour");
        const serviceCollection = database.collection("services");
        const reviewCollection = database.collection("reviews");

        // insert data api 
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // get all data api 
        app.get('/services', async (req, res) => {
            const query = parseInt(req.query?.size);
            const cursor = serviceCollection.find({}).sort({ "_id": -1 });
            let result;
            if (query) {
                result = await cursor.limit(query).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        })

        // get single data api 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        // delete single data api 
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


        //post review
        app.post('/reviews', async (req, res) => {
            const doc = req.body;
            const result = await reviewCollection.insertOne(doc);
            res.send(result);
        });

        //get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({}).sort({ "_id": -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


//default api's
app.get('/', (req, res) => {
    res.send('Databse is live');
});

app.listen(port, () => {
    console.log('DB is running on port', port);
});