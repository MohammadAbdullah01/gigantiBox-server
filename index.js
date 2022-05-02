const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwa1d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("giganticBox").collection("products");

        //get all products
        app.get("/products", async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
        })

        //get one product by id
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        //handle product quantity lessing
        app.put("/product/:id", async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body.quantity;
            console.log(newQuantity)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: newQuantity
                }
            }
            const result = await productsCollection.updateOne(filter, updateDoc, options)
            res.send({ message: "successful" })
        })

        //add quantity
        app.put("/product/addquantity/:id", async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body.quantity;
            console.log(id)
            console.log(newQuantity)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: newQuantity
                }
            }
            const result = await productsCollection.updateOne(filter, updateDoc, options)
            res.send({ message: "successful" })
        })

        //delete one item
        app.delete('/product/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //add a product 
        app.post('/products/add', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            console.log(product)
            res.send({ message: "successful", result: result })
        })
    }




    finally {
        //   await client.close();
    }
}







//end
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})