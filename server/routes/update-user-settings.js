const express = require("express");
const { body } = require("express-validator");

const userSettingsController = require("../controllers/user-settings");
const router = express.Router();
const UserSchema = require("../models/user-schema");
const isAuth = require("../middlewear/is-auth");
// const loggedInAuth = require("../middlewear/loggedin-auth");

router.get(
  "/get-buyer-info/:userId",
  isAuth,
  userSettingsController.getBuyerInfo
);
router.get(
  "/get-seller-info/:userId",
  isAuth,
  userSettingsController.getSellerInfo
);

router.patch(
  "/update-username",
  isAuth,
  [
    body("username")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return UserSchema.findOne({ email: value }).then((foundUsername) => {
          if (foundUsername) {
            return Promise.reject("Username in use!");
          }
        });
      }),
  ],
  userSettingsController.updateUsername
);

router.patch(
  "/update-email",
  isAuth,
  [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return UserSchema.findOne({ username: req.body.email }).then(
          (foundEmail) => {
            if (foundEmail) {
              return Promise.reject("Email in use!");
            }
          }
        );
      }),
  ],
  userSettingsController.updateEmail
);

router.patch(
  "/update-password",
  isAuth,
  [body("password").trim().isLength({ min: 8 })],
  userSettingsController.updatePassword
);

router.delete(
  "/delete-account",
  isAuth,
  [body("password").trim().isLength({ min: 8 })],
  userSettingsController.deleteAccount
);

module.exports = router;
