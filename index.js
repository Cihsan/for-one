const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors') //support diffrent port
require('dotenv').config()// for envirment variable
const port = process.env.PORT || 5000
const app = express()
const jwt = require('jsonwebtoken');
app.use(cors()) //
app.use(express.json()) //for parse

app.get('/', (req, res) => {
    res.send('Welcome To Goods Store Server')
})

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.VALID_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lnkho.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const goodsStore = client.db("goodsDB").collection("goods");
        const myItemStore = client.db("myItemDB").collection("myItems");



        //
        /* app.get('/pathName', async (req, res) => {
            const query = {}
            const cursor = collectionName.find(query)
            const result = await cursor.toArray()
            res.send(result)
        }) */
    
        //
        /* http://localhost:5000/my-items?email=email@mail.com */
        app.get('/my-items', async (req, res) => {
            const email = req.query.email;
                const query = { email: email };
                const result = await myItemStore.find(query).toArray()
                return res.send(result);
        });
        app.delete('/my-items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await myItemStore.deleteOne(query)
            const result1 = await goodsStore.deleteOne(query)
            res.send(result)
        })
        //Home
        app.get('/home', async (req, res) => {
            const query = {}
            const allProduct = goodsStore.find(query)
            const product = await allProduct.toArray()
            res.send(product)
        })

        app.get('/all-products', async (req, res) => {
            const query = {}
            const allProduct = goodsStore.find(query)
            const product = await allProduct.toArray()
            res.send(product)
        })

        app.delete('/all-products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await goodsStore.deleteOne(query)
            res.send(result)
        })

        app.post('/add-product', verifyJWT, async (req, res) => {
            const newPD = req.body
            const result = await goodsStore.insertOne(newPD);
            const result1 = await myItemStore.insertOne(newPD);
            res.send({ success: 'Added Product Successfully' })
            
        })

        //login
        app.post('/loginSM', async (req, res) => {
            const email = req.body
            const token = jwt.sign(email, process.env.VALID_TOKEN);
            console.log(token);
            res.send({ token })
        })

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.VALID_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ token });
        })

        //Update
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await goodsStore.findOne(query)
            res.send(result)
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const decreaseInfo = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    qt: decreaseInfo.quantity,
                }
            }
            const result = await goodsStore.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id
            const newQuantity = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    qt: newQuantity.qt,
                }
            }
            const result = await goodsStore.updateOne(filter, updateDoc, options)
            res.send(result)
        })
    }
    finally {
        //await client.close()
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Show Here ${port}`)
})


