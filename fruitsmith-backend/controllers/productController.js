// productController.js
const Product = require('../models/products');

// Get all products (public) with an optional category filter
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter = { 'categoryId.name': category };
    }

    const products = await Product.find(filter).populate('categoryId', 'name');
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get all products for admin with search and category filters
exports.getProductsAdmin = async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    // Search by product name (case-insensitive)
    if (search) {
      const searchTermRegex = new RegExp(search, 'i');
      filter.name = { $regex: searchTermRegex };
    }

    // Filter by category
    if (category) {
      // Assuming your frontend sends the category name, e.g., 'Everyday Fruits'
      // This requires the 'categoryId' to be populated first to search on its name
      filter['categoryId.name'] = category;
    }

    // Use a Mongoose query to find and populate based on the filter
    const products = await Product.find(filter).populate('categoryId');
    res.json({ products }); // Return an object for consistency with other admin lists
  } catch (err) {
    console.error('Admin get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, categoryId, price, description, image } = req.body;

    if (!name || !categoryId || !price) {
      return res.status(400).json({ error: 'Name, categoryId, and price are required.' });
    }

    const newProduct = new Product({
      name: name.trim(),
      categoryId,
      price,
      description: description?.trim() || '',
      image: image?.trim() || '',
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const updateData = req.body;

    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.image) updateData.image = updateData.image.trim();

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};