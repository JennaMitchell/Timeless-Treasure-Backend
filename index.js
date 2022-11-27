const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./vars.env" });
// const multer = require("multer");
const authRoute = require("./routes/auth");
const updateUserSettingsRoute = require("./routes/update-user-settings");
const productRoute = require("./routes/products");
const orderRoute = require("./routes/order");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
// const helmet = require("helmet");
// const compression = require("compression");

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//     // folder where we want to keep the files is images folder
//   },
//   filename: (req, file, cb) => {
//     const date = new Date();
//     cb(null, date.toISOString() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype == "image/png" ||
//     file.mimetype === "imgage/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use(cors());
// app.use(helmet());
// app.use(compression());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {})
  .catch((err) => {
    res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Not Connected" }],
    });
  });

app.use(bodyParser.json());
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
//   (req, res, next) => {
//     next();
//   }
// );
// image is the inputName of the incoming file
// app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use("/auth", authRoute);

app.use("/user", updateUserSettingsRoute);
app.use("/product", productRoute);
app.use("/order", orderRoute);

const server = app.listen(process.env.PORT, () => {});
const io = require("./socket/socket").init(server);

io.on("connection", (socket) => {});
