const upload = require("./uploadFilesMiddleware");

const multipleUpload = async (req, res, next) => {
  try {
    await upload(req, res);
    // if (req.files.length <= 0) {
    //   return res.status(400).json({
    //     success: false,
    //     result: null,
    //     message: 'No file Chosen.',
    //     jwtExpired: true,
    //   });
    // }
    next();
  } catch (error) {

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Too many files to upload.",
        jwtExpired: true,
      });
    }

  }
};

module.exports = multipleUpload