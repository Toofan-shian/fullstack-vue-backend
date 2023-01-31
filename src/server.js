let express = require('express')
let bodyParser = require('body-parser')
const {MongoClient} = require('mongodb')
const path = require('path')
const history = require('connect-history-api-fallback')

let app = express()
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, '../assets')))
app.use(express.static(path.resolve(__dirname, '../dist'), { maxAge: '1y', etag: false }))
app.use(history())


const mongoConnectionUrl = "mongodb+srv://toofan:test123456@cluster0.bpt6m7c.mongodb.net/?retryWrites=true&w=majority"

//all products
app.get('/api/products', async (req, res) => {
  const client = await MongoClient.connect(mongoConnectionUrl,
    {useNewUrlParser: true, useUnifiedTopology: true}
  );
  const db = client.db('full-stack-vue')
  const products = await db.collection('products')
    .find().toArray()

  res.status(200).json(products)
  client.close()
})

//cart items
app.get('/api/users/:userId/cart', async (req, res) => {
  const client = await MongoClient.connect(
    mongoConnectionUrl,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('full-stack-vue')
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
    mongoConnectionUrl,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('full-stack-vue')
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
    mongoConnectionUrl,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const db = client.db('full-stack-vue');
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
    mongoConnectionUrl,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  const users = await client.db('full-stack-vue')
  .collection('users')
  const allProducts = await client.db('full-stack-vue')
  .collection('products')
  .find()
  .toArray()
  await users.updateOne({id: userId}, {
    $pull: {cartItems: productId}
  })
  const currentUser = await client.db('full-stack-vue')
    .collection('users')
    .findOne({id: userId})
  const newCart = currentUser.cartItems
  const newProducts = newCart.map(id => {
    return allProducts.find(p => p.id == id)
  })
  res.status(202).json(newProducts)
  client.close()
})


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(5000, () => {
  console.log('listenint on port 5000...')
})