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
        const appointmentCollection = database.collection("appointments");
        const userCollection = database.collection("users");

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




        // insert appointments api 
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentCollection.insertOne(appointment);
            res.send(result);
        })

        // get all appointments data api 
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };

            let result;
            if (email) {
                const cursor = appointmentCollection.find(query).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            else {
                const cursor = appointmentCollection.find({}).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            res.send(result);
        });

        //cancel appointments
        app.delete('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await appointmentCollection.deleteOne(query);
            res.send(result);
        });

        //update customer appointment status
        app.put('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const doc = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: doc };
            const options = { upsert: true };
            const result = await appointmentCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        //post users
        app.post('/users', async (req, res) => {
            const doc = req.body;
            const result = await userCollection.insertOne(doc);
            res.send(result);
        });
        //get users
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //update users
        app.put('/users', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const options = { upsert: true };
            const updateDoc = { $set: doc };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //update users as admin
        app.put('/users/admin', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
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