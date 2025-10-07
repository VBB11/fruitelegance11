const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true },
    image: { type: String, default: '' },
    bg: { type: String, default: 'bg-green-50' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 9999, min: 0 },
  },
  { timestamps: true }
);

// Optional: helper index if you want faster admin sorting
categorySchema.index({ sortOrder: 1, createdAt: 1 });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
