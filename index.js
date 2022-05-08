const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
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
        const opinionCollection = client.db("suppliers").collection("opinion");
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

        //generating token
        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1d"
            })
            res.send({ token: token })
        })

        //accessing only current email users products
        app.get('/myproducts', async (req, res) => {
            const email = req.query.email;
            const token = req.query.token;
            const verifiedEmail = verifyToken(token)
            console.log(verifiedEmail)
            if (verifiedEmail === email) {
                const query = { email: email };
                const cursor = productsCollection.find(query)
                const result = await cursor.toArray()
                res.send({ message: "success", result })
            }
            else {
                res.status(401).send({ message: "no access" })
            }
        })

        //get clients reviews collection
        app.get("/opinions", async (req, res) => {
            const query = {};
            const cursor = opinionCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        // verify token 
        function verifyToken(token) {
            let email = "";
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return;
                }
                if (decoded) {
                    email = decoded.email;
                }
            })
            return email;
        }

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