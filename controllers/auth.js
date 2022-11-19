const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = require("../models/user-schema");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(401).json({
      error: errors.array(),
      message: `${errors["errors"][0].msg}`,
    });
    return;
  }
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const isSeller = req.body.isSeller;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const currentDate = new Date();

    const newUser = new UserSchema({
      email: email,
      password: hashedPw,
      username: username,
      isSeller: isSeller,
      createdAt: currentDate,
    });

    const result = await newUser.save();

    res.status(201).json({
      message: "User created!",
      userId: result._id,
      status: 201,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  req.session.isLoggedIn = true;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(401).json({
      error: errors.array(),
      message: `${errors["errors"][0].msg}`,
    });
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    const user = await UserSchema.findOne({ email: email });

    loadedUser = user;

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      res.status(401).json({
        message: `Invalid Password!`,
        error: [{ error: "Invalid Password" }],
      });
      return;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JSW_PASS,
      { expiresIn: "1h" }
    );

    req.session.save();

    return res.status(200).json({
      token: token,
      userId: loadedUser._id.toString(),
      email: loadedUser.email,
      isSeller: loadedUser.isSeller,
      message: "Logged In",
      username: loadedUser.username,
      sessionId: req.session._id,
    });
  } catch (err) {
    return res.status(401).json({
      message: `Server Error!`,
      error: [{ error: "Server Error" }],
    });
  }
};
