const getHome = async (req, res, next) => {
  try {
    res.status(200).render("base");
  } catch (error) {
    res.status(400).render("error", {
      message: error.message,
    });
  }
};

const secretPage = async (req, res, next) => {
  try {
    res.status(200).json({
      secret: "secret page",
    });
    // try {
    //   res.status(200).render("secret");
  } catch (error) {
    res.status(400).render("error", {
      message: error.message,
    });
  }
};

module.exports = { getHome, secretPage };
