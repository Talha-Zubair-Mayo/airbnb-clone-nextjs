//this middleware will check if the admin  is logged in, if not he will be redirected to the login page :)
exports.setSingleFilePathToBody = (req, res, next) => {
  if (req.file) {
    req.body[req.file.fieldname] = req.file.filename;
  }
  next();
};

exports.setMultipleFilePathToBody = (req, res, next) => {
  if (req.files.length > 0) {
    const files = req.files.map(item => item.filename)
    req.body[req.files[0].fieldname] = files
  }
  next();
};



