const { validationResult } = require("express-validator");

const ProductSchema = require("../models/product-schema");
const io = require("../socket/socket");

exports.getLatestItemsFiltered = async (req, res, next) => {
  const tagFilter = req.params.filter;

  try {
    const result = await ProductSchema.find(
      { status: "For Sale", productTags: { $all: tagFilter } },
      { sellerId: 0 }
    )
      .sort({ date: -1 })
      .limit(8);

    return res.status(201).json({
      message: "Product Added!",
      foundProducts: result,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.getLatestItems = async (req, res, next) => {
  try {
    const result = await ProductSchema.find(
      { status: "For Sale" },
      { sellerId: 0 }
    )
      .sort({ date: -1 })
      .limit(8);

    return res.status(201).json({
      message: "Product Added!",
      foundProducts: result,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
exports.getHotestItemsFiltered = async (req, res, next) => {
  const tagFilter = req.params.filter;

  try {
    const result = await ProductSchema.find(
      { status: "For Sale", productTags: { $all: tagFilter } },
      { sellerId: 0 }
    ).limit(8);

    return res.status(201).json({
      message: "Product Added!",
      foundProducts: result,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.getHotestItems = async (req, res, next) => {
  try {
    const result = await ProductSchema.find(
      { status: "For Sale" },
      { sellerId: 0 }
    ).limit(8);

    return res.status(201).json({
      message: "Product Added!",
      foundProducts: result,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

//getHotestItems getHotestItemsFiltered

// io.getIo to use it
exports.getAllProduct = async (req, res, next) => {
  try {
    const result = await ProductSchema.find(
      { status: "For Sale" },
      { sellerId: 0 }
    );
    return res.status(201).json({
      message: "Product Added!",
      foundProducts: result,
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.createNewProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(401).send({
      error: errors.array(),
      message: `${errors["errors"][0].msg}`,
    });
  }
  const title = req.body.title;
  const price = +req.body.price;
  const priceType = req.body.priceType;
  const temptags = req.body.productTags;

  const jsonedTags = JSON.parse(temptags);

  const productTags = Object.values(jsonedTags);
  productTags[productTags.length] = req.body.productType;
  const sellerId = req.body.userId;
  const productId = req.body.productId;

  const imageKey = req.body.imageKey;
  const status = req.body.status;
  const quantity = req.body.quantity;
  const productType = req.body.productType;
  const date = req.body.date;
  const description = req.body.description;

  if (imageKey === "") {
    return res.status(401).json({
      message: `No image Added!`,
      error: [{ error: "No image added" }],
    });
  }

  try {
    const newProduct = new ProductSchema({
      title: title,
      price: price,
      priceType: priceType,
      imageKey: imageKey,
      sellerId: sellerId,
      productId: productId,
      status: status,
      quantity: quantity,
      productType: productType,
      date: date,
      productTags: productTags,
      description: description,
    });

    await newProduct.save();
    // once done we use websocket to update it
    io.getIo().emit("new-product", {
      action: "create-new-product",
      productCreated: newProduct,
    });
    // emit everyone broadcast only one

    return res.status(201).json({
      message: "Product Added!",
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(401).send({
      error: errors.array(),
      message: `${errors["errors"][0].msg}`,
    });
  }

  try {
    const productId = req.body.productId;
    const foundProduct = await ProductSchema.findOne({ productId: productId });
    const title = req.body.title;
    const price = +req.body.price;
    const priceType = req.body.priceType;
    const image = req.file;
    const sellerId = req.body.userId;
    const description = req.body.description;

    if (sellerId !== foundProduct.sellerId) {
      return res.status(401).json({
        message: `Not Authorized!`,
        error: [{ error: `Not Authorized!` }],
      });
    }

    if (image !== undefined) {
      foundProduct.imageUrl = image.path;
      await ProductSchema.updateOne(
        { productId: productId },
        {
          $set: {
            title: title,
            price: price,
            priceType: priceType,
            imageUrl: image.path,
            description: description,
          },
        }
      );
    } else {
      await ProductSchema.updateOne(
        { productId: productId },
        {
          $set: {
            title: title,
            price: price,
            priceType: priceType,
            description: description,
          },
        }
      );
      const productToUpdate = {
        productId: productId,
        title: title,
        price: price,
        priceType: priceType,
        description: description,
      };
      io.getIo().emit("update-product", {
        action: "update-product",
        productUpdated: productToUpdate,
      });
    }

    res.status(201).json({
      message: "Product Updated!",
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.deletePost = async (req, res, next) => {
  const sentProductId = req.body.productId;
  const sentUserId = req.body.userId;

  try {
    const foundProduct = await ProductSchema.findOne({
      productId: sentProductId,
    });
    if (!foundProduct) {
      res.status(401).json({
        message: `Product Not Found!`,
        error: [{ error: "Product Not Found!" }],
      });
      return;
    }

    if (foundProduct.sellerId !== sentUserId) {
      return res.status(401).json({
        message: `Not Authorized!`,
        error: [{ error: `Not Authorized!` }],
      });
    }

    await ProductSchema.deleteOne({ productId: sentProductId });
    return res.status(201).json({
      message: "Product Deleted!",
      status: 201,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};

exports.getFilteredData = async (req, res, next) => {
  const filterString = req.params.filter;

  try {
    if (!filterString) {
      res.status(401).json({
        message: `No filter string sent!`,
        error: [{ error: "No filter string sent!" }],
      });
      return;
    }
    const filterArray = filterString.split("-");

    // check for price Ranges
    const priceRangeArray = [];
    const priceRangeIndexArray = [];

    for (
      let indexOfFilterArray = 0;
      indexOfFilterArray < filterArray.length;
      indexOfFilterArray++
    ) {
      if (
        filterArray[indexOfFilterArray].trim()[0] === "$" ||
        filterArray[indexOfFilterArray].trim()[0] === "€"
      ) {
        priceRangeArray[priceRangeArray.length] = +filterArray[
          indexOfFilterArray
        ]
          .trim()
          .slice(1);
        priceRangeIndexArray[priceRangeIndexArray.length] = indexOfFilterArray;
      }
    }

    // removing the price range from the filter tags
    const finalFilterArray = [];
    for (
      let finalFilterArrayIndex = 0;
      finalFilterArrayIndex < filterArray.length;
      finalFilterArrayIndex++
    ) {
      if (!priceRangeIndexArray.includes(finalFilterArrayIndex)) {
        finalFilterArray[finalFilterArray.length] =
          filterArray[finalFilterArrayIndex];
      }
    }

    let foundProducts = [];
    if (priceRangeArray.length === 2) {
      // order the numbers into max pars
      let maxPrice = priceRangeArray[1];
      let minPrice = priceRangeArray[0];
      if (priceRangeArray[0] > priceRangeArray[1]) {
        maxPrice = priceRangeArray[1];
        minPrice = priceRangeArray[0];
      }

      if (finalFilterArray.length === 0) {
        foundProducts = await ProductSchema.find(
          {
            price: { $gte: minPrice, $lte: maxPrice },
            status: "For Sale",
          },
          { sellerId: 0 }
        );
      } else {
        foundProducts = await ProductSchema.find(
          {
            productTags: { $all: finalFilterArray },
            price: { $gte: minPrice, $lte: maxPrice },
            status: "For Sale",
          },
          { sellerId: 0 }
        );
      }
    } else if (priceRangeArray.length === 1) {
      if (finalFilterArray.length === 0) {
        foundProducts = await ProductSchema.find(
          {
            price: { $gte: maxPrice },
            status: "For Sale",
          },
          { sellerId: 0 }
        );
      } else {
        foundProducts = await ProductSchema.find(
          {
            productTags: { $all: finalFilterArray },
            price: { $gte: priceRangeArray[0] },
            status: "For Sale",
          },
          { sellerId: 0 }
        );
      }
    } else {
      foundProducts = await ProductSchema.find(
        {
          productTags: { $all: filterArray },
          status: "For Sale",
        },
        { sellerId: 0 }
      );
    }

    return res.status(201).json({
      message: "Data Retrieved!",
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

exports.getFilteredSearchData = async (req, res, next) => {
  const filterString = req.params.filter;

  try {
    if (!filterString) {
      res.status(401).json({
        message: `No filter string sent!`,
        error: [{ error: "No filter string sent!" }],
      });
      return;
    }

    const foundProducts = await ProductSchema.find(
      {
        title: { $regex: filterString, $options: "i" },
        status: "For Sale",
      },
      { sellerId: 0 }
    );

    return res.status(201).json({
      message: "Data Retrieved!",
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
