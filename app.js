const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const app = express();
const viewRouter = require("./routes/viewRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");

dotenv.config({ path: "./config.env" });
app.use(express.json());

// views
app.use("/", viewRouter);

// api
app.use("/api/v1/users", userRouter);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`[LISTEN] on port ${port}`);
});
