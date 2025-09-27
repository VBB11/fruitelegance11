const Category = require('../models/Category');

// Get all categories (public)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Add a new category (admin)
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name: name.trim() });
    await category.save();

    res.status(201).json({ message: 'Category added', category });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error adding category' });
  }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const duplicateCategory = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (duplicateCategory) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
