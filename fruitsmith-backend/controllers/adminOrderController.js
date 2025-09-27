// adminOrderController.js
const Order = require('../models/Order');

// Get all orders with optional filtering and pagination
exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'); // populate user's basic info

    const totalCount = await Order.countDocuments(filter);

    res.json({ orders, totalCount, page, pages: Math.ceil(totalCount / limit) });
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    console.error('Admin get order by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found.' });

    res.json(updatedOrder);
  } catch (err) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ error: 'Failed to update order.' });
  }
};
