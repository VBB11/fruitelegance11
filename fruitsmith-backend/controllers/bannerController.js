// controllers/bannerController.js
const Banner = require('../models/Banner');
const Category = require('../models/Category');

// Public: only active, schedule-valid, sorted, lean
exports.getBannersPublic = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      active: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }, { startAt: { $exists: false } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }, { endAt: { $exists: false } }] },
      ],
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('_id img title label link categoryId startAt endAt')
      .lean();

    // Optional: include categorySlug if categoryId present
    const categoryIds = [...new Set(banners.map(b => String(b.categoryId || '')))].filter(Boolean);
    let slugById = {};
    if (categoryIds.length) {
      const cats = await Category.find({ _id: { $in: categoryIds } }).select('_id slug').lean();
      slugById = Object.fromEntries(cats.map(c => [String(c._id), c.slug || '']));
    }

    const result = banners.map(b => ({
      _id: b._id,
      img: b.img,
      title: b.title || '',
      label: b.label || '',
      link: b.link || (b.categoryId && slugById[String(b.categoryId)] ? `/category/${slugById[String(b.categoryId)]}` : ''),
      startAt: b.startAt || null,
      endAt: b.endAt || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching banners (public):', error);
    res.status(500).json({ message: 'Server error fetching banners' });
  }
};

// Admin: list all banners
exports.getBannersAdmin = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (typeof active !== 'undefined') {
      filter.active = String(active).toLowerCase() === 'true';
    }
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners (admin):', error);
    res.status(500).json({ message: 'Server error fetching banners' });
  }
};

// Admin: create
exports.addBanner = async (req, res) => {
  try {
    const { title, label, img, link, categoryId, active, sortOrder, startAt, endAt } = req.body;
    if (!img || !String(img).trim()) {
      return res.status(400).json({ message: 'Image URL (img) is required' });
    }

    // Optional: validate dates
    let start = startAt ? new Date(startAt) : null;
    let end = endAt ? new Date(endAt) : null;
    if (start && isNaN(start.getTime())) start = null;
    if (end && isNaN(end.getTime())) end = null;
    if (start && end && start > end) {
      return res.status(400).json({ message: 'startAt must be before endAt' });
    }

    const payload = {
      title: title || '',
      label: label || '',
      img: String(img).trim(),
      link: link || '',
      categoryId: categoryId || null,
      active: typeof active === 'boolean' ? active : true,
      sortOrder: typeof sortOrder === 'number' ? Math.max(0, sortOrder) : 9999,
      startAt: start,
      endAt: end,
    };

    const banner = await Banner.create(payload);
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error adding banner:', error);
    res.status(500).json({ message: 'Server error adding banner' });
  }
};

// Admin: update
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, label, img, link, categoryId, active, sortOrder, startAt, endAt } = req.body;

    const update = {};
    if (typeof title !== 'undefined') update.title = title || '';
    if (typeof label !== 'undefined') update.label = label || '';
    if (typeof img !== 'undefined') {
      if (!String(img).trim()) {
        return res.status(400).json({ message: 'img cannot be empty' });
      }
      update.img = String(img).trim();
    }
    if (typeof link !== 'undefined') update.link = link || '';
    if (typeof categoryId !== 'undefined') update.categoryId = categoryId || null;
    if (typeof active !== 'undefined') update.active = !!active;
    if (typeof sortOrder !== 'undefined') {
      const n = Number(sortOrder);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ message: 'sortOrder must be a non-negative number' });
      }
      update.sortOrder = n;
    }
    if (typeof startAt !== 'undefined') {
      let start = startAt ? new Date(startAt) : null;
      if (start && isNaN(start.getTime())) start = null;
      update.startAt = start;
    }
    if (typeof endAt !== 'undefined') {
      let end = endAt ? new Date(endAt) : null;
      if (end && isNaN(end.getTime())) end = null;
      update.endAt = end;
    }
    if (update.startAt && update.endAt && update.startAt > update.endAt) {
      return res.status(400).json({ message: 'startAt must be before endAt' });
    }

    const banner = await Banner.findByIdAndUpdate(id, update, { new: true });
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server error updating banner' });
  }
};

// Admin: delete
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error deleting banner' });
  }
};
