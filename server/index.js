const express = require('express');
const cors = require('cors');

const restaurantsRouter = require('./routes/restaurants');
const menuItemsRouter = require('./routes/menuItems');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/menu-items', menuItemsRouter);
app.use('/api/orders', ordersRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Foodist API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
