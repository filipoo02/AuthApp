const dotenv = require("dotenv");
const sql = require("mssql");
const AppError = require("./utils/AppError");
const bcrypt = require("bcryptjs");
dotenv.config({ path: "./config.env" });

const dbconfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: process.env.DB_PORT * 1,
  options: {
    encrypt: false,
  },
};

const getAllUsers = async () => {
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool.request().query(`SELECT * FROM Users`);
    return result.recordset;
  } catch (error) {
    throw new Error(error.message);
  }
};

const catchAsyncQuery = (fn) => {
  return (id) => {
    fn(id).catch((error) => {
      throw error;
    });
  };
};

// const getUser = catchAsyncQuery(async (id) => {
//   const pool = await sql.connect(dbconfig);
//   const result = await pool
//     .request()
//     .query(`SELECT * FROM Users WHERE id = ${id}`);

//   return result.recordset;
// });
// console.log(getUser);
const getUser = async (id) => {
  console.log(id);
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool
      .request()
      .query(`SELECT * FROM Users WHERE id = ${id}`);

    return result.recordset;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getUserByEmail = async (email) => {
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool
      .request()
      .query(`SELECT * FROM Users WHERE email = ${email}`);

    return result.recordset;
  } catch (error) {
    throw new Error(error.message);
  }
};
const loginUser = async (data) => {
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool
      .request()
      .query(`SELECT * FROM Users WHERE login='${data.login}'`);

    const correctPassword = await bcrypt.compare(
      data.password,
      result.recordset[0].password
    );

    if (!result.recordset[0] || !correctPassword) {
      throw new AppError("Invalid login or password", 401);
    }

    return result.recordset;
  } catch (error) {
    throw error;
  }
};

const createUser = async (data) => {
  try {
    const password = await bcrypt.hash(data.password, 12);

    const role = data.role || "user";
    const pool = await sql.connect(dbconfig);
    const result = await pool.request()
      .query(`insert into [FITOFIT].[dbo].[Users](name,surname,role,login,password,email)values
    ('${data.name}','${data.surname}','${role}','${data.login}','${password}','${data.email}')
    SELECT TOP 1 [id]
      ,[name]
      ,[surname]
      ,[role]
      ,[login]
      ,[password]
  FROM [FITOFIT].[dbo].[Users] order by id desc`);

    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUser,
  loginUser,
  createUser,
  getAllUsers,
  getUserByEmail,
};
