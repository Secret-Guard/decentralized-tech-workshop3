const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

let products = [
  { id: 1, name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1', stock: 10 },
  { id: 2, name: 'Product 2', description: 'Description 2', price: 200, category: 'Category 2', stock: 20 },
  { id: 3, name: 'Product 3', description: 'Description 3', price: 150, category: 'Category 1', stock: 5 },
];

app.get('/', (req, res) => res.send('Welcome to the API!'));

app.get('/products', (req, res) => {
  const { category, inStock } = req.query;
  let filteredProducts = products;

  if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
  if (inStock) filteredProducts = filteredProducts.filter(p => p.stock > 0);

  res.json(filteredProducts);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

app.post('/products', (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const newProduct = { id: products.length + 1, name, description, price, category, stock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });

  Object.assign(product, req.body);
  res.json(product);
});

app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products.splice(index, 1);
  res.json({ message: 'Product deleted' });
});

let orders = [];
app.post('/orders', (req, res) => {
  const { products, totalPrice } = req.body;
  const newOrder = { id: orders.length + 1, products, totalPrice, status: 'Pending' };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/orders', (req, res) => res.json(orders));

app.get('/orders/:userId', (req, res) => {
  const userOrders = orders.filter(order => order.userId == req.params.userId);
  if (!userOrders.length) return res.status(404).json({ message: 'No orders found' });
  res.json(userOrders);
});

let carts = {};
app.post('/cart/:userId', (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.userId;

  if (!carts[userId]) carts[userId] = [];
  const existing = carts[userId].find(item => item.productId === productId);

  existing ? (existing.quantity += quantity) : carts[userId].push({ productId, quantity });

  res.json(carts[userId]);
});

app.get('/cart/:userId', (req, res) => res.json(carts[req.params.userId] || []));

app.delete('/cart/:userId/item/:productId', (req, res) => {
  const userId = req.params.userId;
  if (!carts[userId]) return res.status(404).json({ message: 'Cart not found' });

  carts[userId] = carts[userId].filter(item => item.productId !== parseInt(req.params.productId));
  res.json(carts[userId]);
});

app.get('/server', (req, res) => res.json({ code: 200, server: `localhost:${PORT}` }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
