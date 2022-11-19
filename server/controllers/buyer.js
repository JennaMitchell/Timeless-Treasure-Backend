const PlacedOrderSchema = require("../models/placed-order");

exports.getPendingBuyerOrders = async (req, res, next) => {
  const buyerId = req.params.buyerId;

  try {
    const foundProducts = await PlacedOrderSchema.find({
      buyerId: buyerId,
      overallStatus: "Ship",
    });

    return res.status(201).json({
      message: "Product Found!",
      foundProducts: foundProducts,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
exports.getFullfilledBuyerOrders = async (req, res, next) => {
  const buyerId = req.params.buyerId;
  try {
    const foundProducts = await PlacedOrderSchema.find({
      buyerId: buyerId,
      overallStatus: "Fulfilled",
    });

    return res.status(201).json({
      message: "Product Found!",
      foundProducts: foundProducts,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
