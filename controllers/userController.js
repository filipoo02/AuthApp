const server = require("../server");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const getAllUsers = catchAsync(async (req, res, next) => {
  const result = await server.getAllUsers();
  res.status(200).json({
    status: "success",
    data: {
      // number: result.length,
      users: result,
    },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  console.log("userController");
  const id = req.params.id;
  console.log(server.getUser);
  await server.getUser(id).then((result) => {
    if (!result[0])
      throw new AppError(`User with ${id} id does not exists`, 401);

    res.status(200).json({
      status: "success",
      data: {
        user: result,
      },
    });
  });
});

module.exports = { getUser, getAllUsers };
