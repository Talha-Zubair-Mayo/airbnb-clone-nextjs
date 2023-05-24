const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    isFacebookLogin: {
      type: Boolean,
      default: false,
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    },
    isSocialLogin: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    socialId: {
      type: String,
      default: null,
    },
    favoriteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
      },
    ],
    listings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    reservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
      },
    ],
  },
  { timestamps: true }
);

// Plugin: mongoose-autopopulate
userSchema.plugin(require('mongoose-autopopulate'));

// Method: Generate hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

// Method: Check if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
