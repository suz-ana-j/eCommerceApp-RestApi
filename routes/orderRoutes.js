const express = require('express');
const Order = require('../models/orderModel');  // Import the Order model
const authenticate = require('../middleware/authenticate');  // Authentication middleware
const router = express.Router();

// Route to fetch order history for the logged-in user
router.get('/order-history', authenticate, async (req, res) => {
  try {
    // Fetch the orders for the logged-in user by their userId
    const orders = await Order.find({ userId: req.user.id }).populate('items.productId');

    // Return the orders as a JSON response
    res.status(200).json(orders);
  } catch (error) {
    // If there's an error, return a 500 status with the error message
    res.status(500).json({ error: 'Could not fetch order history' });
  }
});

module.exports = router;
