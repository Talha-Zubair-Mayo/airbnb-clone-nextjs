const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const OtpRecordsSchema = new Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    otp: {
        type: Number,
        unique: true,
    }

}, { timestamps: true });

OtpRecordsSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('otprecords', OtpRecordsSchema);
