const express = require('express')
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden access" })
        }
        console.log('decoded', decoded)
        req.decoded = decoded;
        next();


    })



}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9w9dq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const equipmentCollection = client.db('gymequipment').collection('equipment')
        const addedItemCollection = client.db('gymequipment').collection('addedItem')

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });

        })

        app.get('/equipment', async (req, res) => {
            const query = {}
            const cursor = equipmentCollection.find(query)
            const equipments = await cursor.toArray();
            res.send(equipments)
        })

        app.get('/addedItem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;

            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email }
                const cursor = addedItemCollection.find(query)
                const addItem = await cursor.toArray();
                res.send(addItem)
            }
            else {
                res.status(403).send({ message: "forbidden access" })
            }
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