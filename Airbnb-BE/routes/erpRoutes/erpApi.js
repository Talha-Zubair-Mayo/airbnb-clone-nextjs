const express = require('express');
const router = express.Router();
const path = require('path');
const { setSingleFilePathToBody, setMultipleFilePathToBody } = require('@/middlewares/setFilePathToBody');
const { catchErrors } = require('@/handlers/errorHandlers');
var multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const multipleUpload = require('@/middlewares/upload'); 
const authCntrl = require('@/controllers/erpControllers/authJwtController ');

//_______________________________ Admin management_______________________________
var adminPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/user');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const adminPhotoUpload = multer({ storage: adminPhotoStorage });

var videoUploaderStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/uploads/user');
  },
  filename: (req, file, callback) => {
    const match = ["video/mp4", "video/webm", "video/3gpp"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname}is invalid. Only accept png/jpeg.`;
      // @ts-ignore
      return callback(message, null);
    }

    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  }
});
const propertyVideoUpload = multer({ storage: videoUploaderStorage });



// ---------------------------------Api for Societies----------------
router.route('/register').post([adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(authCntrl.register));

module.exports = router;
