const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  qty:       { type: Number, required: true, min: 1 },
  image:     { type: [String] } // Corrected: changed to an array of strings
}, { _id: false });

const addressSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  mobile:  { type: String, required: true },
  street:  { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  zip:     { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:           { type: [orderItemSchema], required: true },
  totalAmount:     { type: Number, required: true },
  shippingAddress: { type: addressSchema, required: true },
  status:          { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentInfo:     { type: Object, required: false },
  orderDate:       { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);