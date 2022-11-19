const mongoose = require("mongoose");

const SellerPlacedOrderSchema = new mongoose.Schema({
  itemsPlacedData: { type: Array, required: true },
  status: { type: String, required: true },
  orderId: { type: String, require: true },
  sellerId: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model(
  "SellerPlacedOrderSchema",
  SellerPlacedOrderSchema
);
