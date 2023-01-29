let express = require('express')
let bodyParser = require('body-parser')
let {cartItems, products} = require('./fake-data')
let {mongoClient} = require('mongodb')

let app = express()
app.use(bodyParser.json())

app.get('/api/products', async (req, res) => {
  const client = mongoClient('mongodb://0.0.0.0:27017',
    {useNewUrlParser: true, useUnifiedTopology: true}
  );
  const db = client.db('vue-db')
  const products = await db.collection('products')
    .find().toArray()

  res.status(200).json(products)
})

app.get('/api/users/:userId/cart', (req, res) => {
  res.status(200).json(cartItems)
})

app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params;
  let product = products.find((product) => {
    console.log(product.id)
    return product.id == productId
  })
  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404).json({error: "could not find product"})
  }
})

app.post('/api/users/:userId/cart', (req, res) => {
  let {productId} = req.body;
  let product = products.find(product => product.id == productId);
  if (product) {
    cartItems.push(product);
    res.status(200).json(cartItems)
  }
  else {
    res.status(404).json({error: "could not find product"})
  }
})

app.delete('/api/users/:userId/cart/:productId', (req, res) => {
  const {productId} = req.params;
  cartItems = cartItems.filter(item => item.id !== productId);
  res.status(200).json(cartItems);
})

app.listen(5000, () => {
  console.log('listenint on port 5000...')
})