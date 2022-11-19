const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, required: true },
  productTags: { type: Array, required: true },
  imageUrl: { type: String, required: true },
  sellerId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("ProductSchema", ProductSchema);
