const AppError = require("../utils/AppError");

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
    // res.status(err.statusCode).render("errorPage", {
    //   message: err.message,
    //   statusCode: err.statusCode,
    //   stack: err.stack,
    // });
  }
};
const sendErrorProd = (err, req, res) => {
  console.log(err.message);
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status || 500,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
    // res.status(err.statusCode).render("error", {
    //   message: err.message,
    //   statusCode: err.statusCode,
    // });
  }
};

const handleDuplicateFieldDB = (error) => {
  const message = error.originalError.message.match(/(?<=\()(.*?)(?=\))/);

  return new AppError(`'${message[0]}' already exists`, 404);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Log in again!", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || "500";
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "dev") {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.number === 2627) error = handleDuplicateFieldDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
