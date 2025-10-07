// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    label: { type: String, default: '' },
    img: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 9999, min: 0 },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bannerSchema.index({ sortOrder: 1, createdAt: 1 });
bannerSchema.index({ active: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
