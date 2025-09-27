const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, street, city, state, zip, country } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!name || !mobile || !street || !city || !state || !zip || !country) {
      return res.status(400).json({ error: 'All address fields are required.' });
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json(user.addresses.slice(-1)[0]);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Failed to add address.' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const updatedAddressData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const addressIndex = user.addresses.findIndex(addr => String(addr._id) === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found.' });
    }
    
    if (!updatedAddressData.name || !updatedAddressData.mobile || !updatedAddressData.street || !updatedAddressData.city || !updatedAddressData.state || !updatedAddressData.zip || !updatedAddressData.country) {
      return res.status(400).json({ error: 'All address fields are required.' });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updatedAddressData };
    await user.save();

    res.json(user.addresses[addressIndex]);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update address.' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await User.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );
    
    if (result.nModified === 0) {
      return res.status(404).json({ error: 'Address not found or not deleted.' });
    }

    res.json({ message: 'Address deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
};

exports.addFavourite = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ error: 'Product ID is required' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favourite' });
  }
};

exports.removeFavourite = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
};