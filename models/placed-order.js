const mongoose = require("mongoose");

const PlacedOrderSchema = new mongoose.Schema({
  itemsPlacedData: { type: Array, required: true },
  quantityArray: { type: Array, required: true },
  uniqueSellers: { type: Array, require: true },
  overallStatus: { type: String, required: true },
  sellerOrderStatusArray: { type: Array, require: true },
  date: { type: String, require: true },
  orderId: { type: String, require: true },
  buyerId: { type: String, require: true },
});

module.exports = mongoose.model("PlacedOrderSchema", PlacedOrderSchema);
