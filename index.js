const express = require('express')
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9w9dq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const equipmentCollection = client.db('gymequipment').collection('equipment')
        const addedItemCollection = client.db('gymequipment').collection('addedItem')

        app.get('/equipment', async (req, res) => {
            const query = {}
            const cursor = equipmentCollection.find(query)
            const equipments = await cursor.toArray();
            res.send(equipments)
        })

        app.get('/addedItem', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = addedItemCollection.find(query)
            const addItem = await cursor.toArray();
            res.send(addItem)
        })



        app.post('/equipment', async (req, res) => {

            const newEquipment = req.body
            const result = await equipmentCollection.insertOne(newEquipment)
            res.send(result)
        })


        app.post('/addedItem', async (req, res) => {

            const newItem = req.body;
            const result = await addedItemCollection.insertOne(newItem)
            res.send(result)
        })

        app.get('/equipment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const detail = await equipmentCollection.findOne(query)
            res.send(detail)
        })

        app.put('/equipment/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            }
            const result = await equipmentCollection.updateOne(filter, updatedDoc, options)
            res.send(result)


        })

        app.delete("/equipment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await equipmentCollection.deleteOne(query)
            res.send(result)
        })

        app.delete("/addedItem/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await addedItemCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally {

    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('running my node ')
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})