const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  mobile:  { type: String, required: true },
  street:  { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  zip:     { type: String, required: true },
  country: { type: String, required: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email:               { type: String, required: true, unique: true },
  passwordHash:        { type: String, required: function() { return !this.isGoogleAccount; } },
  name:                { type: String, default: '' },
  avatar:              { type: String, default: '' },
  addresses:           { type: [addressSchema], default: [] },
  favorites:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  settings:            { type: Object, default: () => ({}) },
  role:                { type: String, enum: ['user', 'admin'], default: 'user' },
  isGoogleAccount:     { type: Boolean, default: false },
  resetPasswordToken:  { type: String },   // For password reset token
  resetPasswordExpires:{ type: Date }     // Token expiry datetime
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
