import Order from '../db/order.js';
import { Router } from 'express';

const router = Router();
const TEMP_ORDER_CODE = {
  id:'',
  time:'',
};

// Create or update order
router.post('/order', async (req, res) => {

  if(req.body.bookingCode!==TEMP_ORDER_CODE.id){
    return res.status(400).json({ error: 'Invalid or expired booking code' });
  }

  const { customerName, customerPhone, uid, items, total } = req.body;

  if (
    !customerName ||
    !customerPhone ||
    !uid ||
    !Array.isArray(items) ||
    items.length === 0 ||
    typeof total !== 'number'
  ) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid required fields' });
  }

  try {
    const newOrder = await Order.createOrder(
      uid,
      customerName,
      customerPhone,
      items,
      total
    );

    // return a sanitized response
    return res.status(201).json({
      uid: newOrder.uid,
      customerName: newOrder.customerName,
      total: newOrder.total,
      orderCount: newOrder.orderCount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders (requires secret key)
router.get('/orders', async (req, res) => {
  const seckey = req.headers['x-secret-key'] || req.query.seckey;
  if (seckey !== process.env.SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const orders = await Order.getAllOrders();
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top orders (leaderboard style)
router.get('/top-orders', async (req, res) => {
  try {
    const topOrders = await Order.topPerformers(5);
    return res.status(200).json(topOrders);
  } catch (error) {
    console.error('Error fetching top orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/temp-order-code', (req, res) => {

  const seckey = req.headers['x-secret-key'] || req.query.seckey;
  if (seckey !== process.env.SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (TEMP_ORDER_CODE.id && (new Date() - new Date(TEMP_ORDER_CODE.time)) < 60 * 1000) {
    return res.status(200).json(TEMP_ORDER_CODE);
  }
  const tempCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  TEMP_ORDER_CODE.id = tempCode;
  TEMP_ORDER_CODE.time = new Date().toISOString();
  res.status(200).json(TEMP_ORDER_CODE);
});

export default router;
