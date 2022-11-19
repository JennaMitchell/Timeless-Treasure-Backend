const PlacedOrderSchema = require("../models/placed-order");
const ProductSchema = require("../models/product-schema");
const SellerPlacedOrderSchema = require("../models/seller-placed-order");
const io = require("../socket/socket");
exports.addOrderDataToSeller = async (req, res, next) => {
  const orderId = req.body.orderId;
  const itemIdsPlaced = req.body.itemIdsPlaced;
  const orderQuantityArray = req.body.orderQuantityArray;
  const userId = req.body.userId;

  try {
    const arrayOfSellerIds = [];
    const foundProductArray = [];
    // grabbed the data with the sellers
    for (let i = 0; i < itemIdsPlaced.length; i++) {
      const foundProduct = await ProductSchema.findOne({
        productId: itemIdsPlaced[i],
      });

      arrayOfSellerIds[i] = foundProduct.sellerId;
      foundProductArray[i] = foundProduct;
    }

    // Getting unique seller Ids
    const arrayOfUniqueSellers = [];
    const sellerOrderStatusArray = [];
    for (
      let indexOfSellers = 0;
      indexOfSellers < arrayOfSellerIds.length;
      indexOfSellers++
    ) {
      if (!arrayOfUniqueSellers.includes(arrayOfSellerIds[indexOfSellers])) {
        arrayOfUniqueSellers[arrayOfUniqueSellers.length] =
          arrayOfSellerIds[indexOfSellers];
        sellerOrderStatusArray[sellerOrderStatusArray.length] = "Ship";
      }
    }
    //

    // Creating Seller Order Object
    const orderObject = {};
    for (
      let indexOfUniqueSellers = 0;
      indexOfUniqueSellers < arrayOfUniqueSellers.length;
      indexOfUniqueSellers++
    ) {
      orderObject[arrayOfUniqueSellers[indexOfUniqueSellers]] = [];
    }

    // Filtering the incoming order data into the seller Object

    for (
      let correspondingDataIndex = 0;
      correspondingDataIndex < arrayOfSellerIds.length;
      correspondingDataIndex++
    ) {
      const sellerIdAtIndex = arrayOfSellerIds[correspondingDataIndex];
      for (
        let indexOfUniqueSeller = 0;
        indexOfUniqueSeller < arrayOfUniqueSellers.length;
        indexOfUniqueSeller++
      ) {
        const uniqueSeller = arrayOfUniqueSellers[indexOfUniqueSeller];
        if (uniqueSeller === sellerIdAtIndex) {
          const copyOfCurrentOrderObjectSeller = JSON.parse(
            JSON.stringify(
              orderObject[arrayOfUniqueSellers[indexOfUniqueSeller]]
            )
          );
          copyOfCurrentOrderObjectSeller[
            copyOfCurrentOrderObjectSeller.length
          ] = {
            productInfo: foundProductArray[correspondingDataIndex],
            quantity: +orderQuantityArray[correspondingDataIndex],
          };

          orderObject[arrayOfUniqueSellers[indexOfUniqueSeller]] =
            copyOfCurrentOrderObjectSeller;
        }
      }
    }

    // now that the orders item corresponds with the seller ids we create a order for the sellers to fill
    const today = new Date();
    const utc = today.toUTCString();
    const indexOfUtcComma = utc.indexOf(",");
    const utcSliced = utc.slice(indexOfUtcComma + 1).trim();
    for (
      let indexName = 0;
      indexName < arrayOfUniqueSellers.length;
      indexName++
    ) {
      const newSellerOrder = new SellerPlacedOrderSchema({
        itemsPlacedData: orderObject[arrayOfUniqueSellers[indexName]],
        status: "Ship",
        orderId: orderId,
        sellerId: arrayOfSellerIds[indexName],
        date: utcSliced,
      });
      await newSellerOrder.save();
    }

    // creating the order Schema

    const newPlacedOrderObject = new PlacedOrderSchema({
      itemsPlacedData: foundProductArray,
      quantityArray: orderQuantityArray,
      uniqueSellers: arrayOfUniqueSellers,
      sellerOrderStatusArray: sellerOrderStatusArray,
      overallStatus: "Ship",
      date: utcSliced,
      orderId: orderId,
      buyerId: userId,
    });
    await newPlacedOrderObject.save();

    // sending socket emit to update all current users carts

    io.getIo().emit("update-cart", {
      action: "update-cart",
      orderedData: foundProductArray,
    });

    // below updates products if they are for sale or not
    for (
      let indexOfComparison = 0;
      indexOfComparison < orderQuantityArray.length;
      indexOfComparison++
    ) {
      if (
        +orderQuantityArray[indexOfComparison] ===
        +foundProductArray[indexOfComparison].quantity
      ) {
        await ProductSchema.updateOne(
          { productId: foundProductArray[indexOfComparison].productId },
          {
            $set: {
              status: "Sold",
            },
          }
        );
      } else {
        await ProductSchema.updateOne(
          { productId: foundProductArray[indexOfComparison].productId },
          {
            $set: {
              quantity: `${
                +foundProductArray[indexOfComparison].quantity -
                +orderQuantityArray[indexOfComparison]
              }`,
            },
          }
        );
      }
    }

    return res.status(201).json({
      message: "Product Found!",
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
