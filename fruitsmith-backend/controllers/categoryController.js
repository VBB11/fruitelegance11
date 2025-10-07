// controllers/categoryController.js
const Category = require('../models/Category');

// util: safe slugify
function slugify(input) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Ensure slug uniqueness (case-insensitive); append suffix if needed
async function ensureUniqueSlug(baseSlug, excludeId = null) {
  if (!baseSlug) return null;
  let candidate = baseSlug;
  let i = 2;
  // Build case-insensitive regex for exact match
  // e.g., ^tropical-fruits$
  // Use collation or regex; here regex for portability
  // Avoid catastrophic backtracking by escaping candidate
  const esc = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Try loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Category.findOne(
      excludeId
        ? { _id: { $ne: excludeId }, slug: { $regex: new RegExp(`^${esc}$`, 'i') } }
        : { slug: { $regex: new RegExp(`^${esc}$`, 'i') } }
    ).lean();
    if (!existing) return candidate;
    candidate = `${baseSlug}-${i++}`;
  }
}

// Public: only active, sorted
exports.getCategoriesPublic = async (req, res) => {
  try {
    const categories = await Category.find({ active: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('_id name slug image bg'); // limit to fields Home needs
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories (public):', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Admin: list (optionally filter by active)
exports.getCategoriesAdmin = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (typeof active !== 'undefined') {
      // accept "true"/"false"
      filter.active = String(active).toLowerCase() === 'true';
    }
    const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories (admin):', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Admin: create
exports.addCategory = async (req, res) => {
  try {
    const { name, slug, image, bg, active, sortOrder } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Name uniqueness (case-insensitive)
    const existingByName = await Category.findOne({
      name: { $regex: new RegExp(`^${String(name).trim()}$`, 'i') },
    }).lean();
    if (existingByName) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Slug handling
    let finalSlug = slug && String(slug).trim() ? slugify(slug) : slugify(name);
    if (finalSlug) {
      finalSlug = await ensureUniqueSlug(finalSlug);
    }

    const payload = {
      name: String(name).trim(),
      slug: finalSlug || undefined, // allow undefined until admin sets it
      image: image || '',
      bg: bg || 'bg-green-50',
      active: typeof active === 'boolean' ? active : true,
      sortOrder:
        typeof sortOrder === 'number'
          ? Math.max(0, sortOrder)
          : 9999,
    };

    const category = await Category.create(payload);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error adding category:', error);
    // Handle unique index error
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key: name or slug must be unique' });
    }
    res.status(500).json({ message: 'Server error adding category' });
  }
};

// Admin: update
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image, bg, active, sortOrder } = req.body;

    const update = {};
    if (typeof name !== 'undefined') {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Category name is required' });
      }
      // Check name uniqueness
      const dupByName = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${String(name).trim()}$`, 'i') },
      }).lean();
      if (dupByName) {
        return res.status(400).json({ message: 'Another category with this name already exists' });
      }
      update.name = String(name).trim();
      // If slug not provided but name changed and existing slug is empty, we can set from name later
    }

    // Slug: accept explicit value or auto-generate if missing and name provided where existing had no slug
    if (typeof slug !== 'undefined') {
      let desired = String(slug).trim();
      desired = desired ? slugify(desired) : '';
      if (desired) {
        update.slug = await ensureUniqueSlug(desired, id);
      } else {
        // Allow clearing slug if needed
        update.slug = undefined;
      }
    } else if (typeof name !== 'undefined') {
      // If slug not explicitly provided, do not overwrite existing slug automatically
      // Admin can set it via explicit input in UI
    }

    if (typeof image !== 'undefined') update.image = image || '';
    if (typeof bg !== 'undefined') update.bg = bg || 'bg-green-50';
    if (typeof active !== 'undefined') update.active = !!active;
    if (typeof sortOrder !== 'undefined') {
      const n = Number(sortOrder);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ message: 'sortOrder must be a non-negative number' });
      }
      update.sortOrder = n;
    }

    const category = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key: name or slug must be unique' });
    }
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Admin: delete (consider soft-delete if products reference it)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // If products reference categories, prefer soft delete:
    // const inUse = await Product.exists({ categoryId: id });
    // if (inUse) {
    //   await Category.findByIdAndUpdate(id, { active: false });
    //   return res.json({ message: 'Category deactivated' });
    // }

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
