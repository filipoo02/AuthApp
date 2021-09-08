const { promisify } = require("util");
const server = require("../server");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const loginUser = catchAsync(async (req, res, next) => {
  const data = req.body;
  const result = await server.loginUser(data);

  const token = signToken(result[0].id);

  res.status(200).json({
    status: "success",
    data: {
      token,
      user: result,
    },
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const data = req.body;
  const result = await server.createUser(data);

  const token = signToken(result[0].id);

  res.status(201).json({
    status: "success",
    token,
    result,
  });
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  // powinno byc cookie!
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer")) {
    token = auth.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await server.getUser(decoded.id);

  if (!freshUser[0])
    return next(
      new AppError(
        "The user belonging to this token does not longer exist!",
        401
      )
    );

  if (freshUser[0].passwordChangeAt) {
    const changedAt = parseInt(
      (freshUser[0].passwordChangeAt.getTime() - 7200000) / 1000,
      10
    );

    if (decoded.iat < changedAt)
      return next(
        new AppError("User changed password! Please log in again.", 401)
      );
  }

  req.user = freshUser[0];
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    if (roles.includes(req.user.role)) {
      next();
    } else {
      next(new AppError("You have no access to this route!", 403));
    }
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  const user = await server.getUserByEmail(email);
  if (!user[0]) {
    return next(
      new AppError(`User with ${email} email address does not exists!`, 404)
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  crypto.createHash("sha256").update(resetToken).digest("hex");
});
module.exports = { loginUser, createUser, protect, restrictTo };
