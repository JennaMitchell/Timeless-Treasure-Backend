// const { validationResult } = require("express-validator");

const ProductSchema = require("../models/product-schema");
const SellerPlacedOrderSchema = require("../models/seller-placed-order");
const PlacedOrderSchema = require("../models/placed-order");
const SellerPlacedOrder = require("../models/seller-placed-order");
exports.getAllSellerDataItemsForSale = async (req, res, next) => {
  const sellerId = req.params.sellerId;

  try {
    const foundProducts = await ProductSchema.find({
      sellerId: sellerId,
      status: "For Sale",
    });

    return res.status(201).json({
      message: "Product Found!",
      foundProducts: foundProducts,
      userId: sellerId,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
exports.getAllPendingOrderSellerData = async (req, res, next) => {
  const sellerId = req.params.sellerId;

  try {
    const foundOrders = await SellerPlacedOrderSchema.find({
      sellerId: sellerId,
      status: "Ship",
    });

    return res.status(201).json({
      message: "Orders Found!",
      foundProducts: foundOrders,
      userId: sellerId,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
exports.shipItem = async (req, res, next) => {
  const sellerId = req.body.sellerId;
  const orderId = req.body.orderNumber;

  try {
    const foundPlacedOrders = await PlacedOrderSchema.findOne({
      orderId: orderId,
    });

    const uniqueSellersArray = JSON.parse(
      JSON.stringify(foundPlacedOrders.uniqueSellers)
    );

    let overAllStatus = foundPlacedOrders.overAllStatus;
    const sellerOrderStatusArray = foundPlacedOrders.sellerOrderStatusArray;
    let indexOfUniqueSeller = 0;

    for (
      let indexToFind = 0;
      indexToFind < uniqueSellersArray.length;
      indexToFind++
    ) {
      if (uniqueSellersArray[indexToFind] === sellerId) {
        indexOfUniqueSeller = indexToFind;
      }
    }

    sellerOrderStatusArray[indexOfUniqueSeller] = "Shipped";
    let orderFullfilled = false;
    for (
      let indexOfStatus = 0;
      indexOfStatus < uniqueSellersArray.length;
      indexOfStatus++
    ) {
      if (sellerOrderStatusArray[indexOfStatus] !== "Shipped") {
        break;
      }
      if (indexOfStatus === uniqueSellersArray.length - 1) {
        orderFullfilled = true;
      }
    }

    if (orderFullfilled) {
      overAllStatus = "Fulfilled";
    }
    await PlacedOrderSchema.updateOne(
      { orderId: orderId },
      {
        $set: {
          overAllStatus: overAllStatus,
          sellerOrderStatusArray: sellerOrderStatusArray,
        },
      }
    );

    await SellerPlacedOrderSchema.updateOne(
      { orderId: orderId, sellerId: sellerId },
      {
        $set: {
          status: "Fulfilled",
        },
      }
    );

    return res.status(201).json({
      message: "Order Shipped!",
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
exports.getFullfilledSellerOrders = async (req, res, next) => {
  const sellerId = req.params.sellerId;
  try {
    const foundProducts = await SellerPlacedOrder.find({
      sellerId: sellerId,
      status: "Fulfilled",
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
