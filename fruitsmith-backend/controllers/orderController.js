const Order = require('../models/Order');
const Product = require('../models/Products');
const User = require('../models/User');

const { transporter } = require('../routes/auth');

const createOrderItemsSnapshot = async (cartItems) => {
  const productIds = cartItems.map(item => item._id);
  const products = await Product.find({ '_id': { $in: productIds } });

  const productMap = new Map();
  products.forEach(p => productMap.set(String(p._id), p));

  return cartItems.map(cartItem => {
    const product = productMap.get(String(cartItem._id));
    if (!product) {
      throw new Error(`Product with ID ${cartItem._id} not found.`);
    }
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: cartItem.qty,
      image: product.image,
    };
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { cart, shippingAddress, totalAmount, paymentId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty.' });
    if (!paymentId) return res.status(400).json({ error: 'Payment ID is required.' });

    const orderItems = await createOrderItemsSnapshot(cart);

    const newOrder = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: 'Processing',
      paymentInfo: { paymentId, method: 'razorpay' },
    });

    const savedOrder = await newOrder.save();

    const user = await User.findById(userId);
    if (user && user.email) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: `Order Confirmation - #${savedOrder._id}`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #2c6f3c; color: #fff;">
                <h1 style="margin: 0; font-size: 24px;">Fruit Elegance</h1>
                <p style="margin: 0; font-size: 16px;">Order Confirmation</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <h2 style="color: #4CAF50; font-size: 20px; margin-top: 0;">Thank you for your purchase!</h2>
                <p style="font-size: 16px; color: #555;">Hi ${user.name},</p>
                <p style="font-size: 16px; color: #555;">Your order has been placed successfully and is now being processed.</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; border-collapse: collapse;">
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Order ID:</td>
                    <td style="background-color: #f9f9f9; padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${savedOrder._id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Total Amount:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #2c6f3c; font-weight: bold;">₹${savedOrder.totalAmount}</td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 10px; font-weight: bold;">Order Status:</td>
                    <td style="background-color: #f9f9f9; padding: 10px; text-align: right;"><span style="background-color: #1a73e8; color: #fff; padding: 4px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">${savedOrder.status}</span></td>
                  </tr>
                </table>

                <h3 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h3>
                <ul style="list-style-type: none; padding: 0; margin: 0;">
                  ${savedOrder.items.map(item => `
                    <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                      <img src="${item.image || 'https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; margin-right: 15px; border-radius: 4px;">
                      <div style="flex-grow: 1;">
                        <p style="margin: 0; font-weight: bold; color: #333;">${item.name}</p>
                        <p style="margin: 0; font-size: 14px; color: #777;">Quantity: ${item.qty}</p>
                      </div>
                      <p style="margin: 0; font-weight: bold; color: #333;">₹${item.price}</p>
                    </li>
                  `).join('')}
                </ul>

                <h3 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Shipping Address</h3>
                <p style="margin: 0; color: #555; font-size: 16px;">
                  <strong>${savedOrder.shippingAddress.name}</strong><br>
                  ${savedOrder.shippingAddress.street}, ${savedOrder.shippingAddress.city}<br>
                  ${savedOrder.shippingAddress.state}, ${savedOrder.shippingAddress.zip}, ${savedOrder.shippingAddress.country}<br>
                  Mobile: ${savedOrder.shippingAddress.mobile}
                </p>

                <p style="margin-top: 30px; font-size: 14px; color: #999;">If you have any questions, please feel free to contact us.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-top: 1px solid #ddd;">
                <p style="margin: 0; font-size: 12px; color: #777;">© 2025 Fruit Elegance. All Rights Reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully');
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message || 'Failed to create order.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing' });

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing' });

    const order = await Order.findOne({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchTermRegex = new RegExp(search, 'i');
      const users = await User.find({
        $or: [
          { name: { $regex: searchTermRegex } },
          { email: { $regex: searchTermRegex } }
        ]
      }).select('_id');
      const userIds = users.map(user => user._id);
      filter.$or = [
        { _id: { $regex: searchTermRegex } },
        { userId: { $in: userIds } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endPlusOne = new Date(endDate);
        endPlusOne.setDate(endPlusOne.getDate() + 1);
        filter.createdAt.$lt = endPlusOne;
      }
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const count = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      pages: Math.ceil(count / limit),
      count,
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};