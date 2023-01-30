let express = require('express')
let bodyParser = require('body-parser')
let {MongoClient} = require('mongodb')

let app = express()
app.use(bodyParser.json())


//all products
app.get('/api/products', async (req, res) => {
  const client = await MongoClient.connect('mongodb://0.0.0.0:27017',
    {useNewUrlParser: true, useUnifiedTopology: true}
  );
  const db = client.db('vue-db')
  const products = await db.collection('products')
    .find().toArray()

  res.status(200).json(products).
  client.close()
})

//cart items
app.get('/api/users/:userId/cart', async (req, res) => {
  const client = await MongoClient.connect(
    'mongodb://0.0.0.0:27017',
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('vue-db')
  const userId = req.params.userId
  const user = await db.collection('users')
    .findOne({id: `${userId}`})

  if (!user) {
    client.close()
    return res.status(404).json({error: "user not found"})
  }

  let productsIds = user.cartItems
  const products = await db.collection('products')
    .find()
    .toArray()
  const userProducts = productsIds.map(id => {
    return products.find(p => p.id == id)
  })

  res.status(200).json(userProducts)
  client.close()
})


//product details
app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const client = await MongoClient.connect(
    'mongodb://0.0.0.0:27017',
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('vue-db')
  const products = await db.collection('products');
  const product = await products.findOne({id: `${productId}`})

  if (!product) {
    client.close;
    return res.status(404).json({error: 'product not found'})
  }
  res.status(200).json(product)
  client.close()
})

//add to cart
app.post('/api/users/:userId/cart', async (req, res) => {
  let {productId} = req.body;
  let {userId} = req.params;

  const client = await MongoClient.connect(
    'mongodb://0.0.0.0:27017',
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('vue-db');
  await db.collection("users").updateOne({id: userId}, {
    $addToSet: {cartItems: productId}
  })

  const user = await db.collection('users')
    .findOne({id: userId})

  let cartItems = user.cartItems

  const products = await db.collection("products").find().toArray()
  const cartProducts = cartItems.map(id => {
    return products.find(p => p.id == id)
  })

  res.status(201).json(cartProducts)
  client.close()
})


//remove from cart
app.delete('/api/users/:userId/cart/:productId', async (req, res) => {
  const {productId, userId} = req.params;
  const client = await MongoClient.connect(
    "mongodb://0.0.0.0:27017",
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const users = await client.db('vue-db')
  .collection('users')
  const allProducts = await client.db('vue-db')
  .collection('products')
  .find()
  .toArray()
  await users.updateOne({id: userId}, {
    $pull: {cartItems: productId}
  })
  const currentUser = await client.db('vue-db')
    .collection('users')
    .findOne({id: userId})
  const newCart = currentUser.cartItems
  const newProducts = newCart.map(id => {
    return allProducts.find(p => p.id == id)
  })
  res.status(202).json(newProducts)
  client.close()
})

app.listen(5000, () => {
  console.log('listenint on port 5000...')
})