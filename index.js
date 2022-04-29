const express = require('express')
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        app.get('/equipment', async (req, res) => {
            const query = {}
            const cursor = equipmentCollection.find(query)
            const equipments = await cursor.toArray();
            res.send(equipments)
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