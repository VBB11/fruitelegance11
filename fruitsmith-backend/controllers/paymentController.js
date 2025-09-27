const Razorpay = require('razorpay');
const Product = require('../models/Products');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }
    
    const productIds = cart.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const totalAmount = products.reduce((sum, p) => {
      const cartItem = cart.find(item => item._id === String(p._id));
      return sum + (p.price * (cartItem?.qty || 1));
    }, 0);

    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID, amount: totalAmount });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ error: 'Order creation failed' });
  }
};