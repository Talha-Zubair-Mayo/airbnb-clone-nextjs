const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.variables.env' });
const { stubFalse } = require('lodash');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
const otpModel = mongoose.model('otprecords');
const SendMail = require('@/middlewares/SendEmail');
const MeetingSchedule = require('@/views/EmailTemplates/MeetingSchedule');
const initScheduledJobs = require('@/middlewares/croneJobs');
const otpGenerator = require('@/utils/otpGenerator');
const confirmAccount = require('@/views/EmailTemplates/confirmAccount');
const forgotPassword = require('@/views/EmailTemplates/forgotPassword');
initScheduledJobs;
const authCntrl = {
  register: async (req, res) => {
    try {
      const { email, password, phone, confirmPassword } = req.body;
      // validate
      if (!email || !password || !phone || !confirmPassword) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Password and confirm password do not match.',
        });
      }
      const cRole = await Role.findOne({ roleType: 'CEO' });
      const user = await User.findOne({ email: email, removed: false });
      if (user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Account already exists. Please login.',
        });
      }
      const userWithPhone = await User.findOne({ phone: phone, removed: false });
      if (userWithPhone) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Phone Number Already Exists.',
        });
      }
      const newUser = new User();
      const passwordHash = newUser.generateHash(password);
      await new User({
        email,
        phone,
        password: passwordHash,
        role: cRole._id,
      }).save();
      const emailOtp = await new otpModel({
        email: email,
        otp: otpGenerator(),
      }).save();
      await SendMail(email, confirmAccount(emailOtp.otp), 'Confirm Account');
      const phoneOtp = await new otpModel({
        phone: phone,
        otp: otpGenerator(),
      }).save();
      console.log(phoneOtp);
      res.json({
        success: true,
        result: null,
        message: 'Successfully registered user',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  login: async (req, res) => {
    try {
      const { userEmailPhone, password } = req.body; // validate
      if (!userEmailPhone || !password)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      const user = await User.findOne({
        $or: [
          {
            email: userEmailPhone,
          },
          {
            phone: userEmailPhone,
          },
        ],
      });
      // const user = await User.findOne({ email: email, removed: false });
      if (!user)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'No account with this email has been registered.',
        });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Invalid credentials.',
        });

      const result = await User.findOneAndUpdate(
        { _id: user._id },
        { isLoggedIn: true },
        {
          new: true,
        }
      ).exec();
      const token = jwt.sign(
        {
          id: result._id,
          role: result.role.roleType,
          isLoggedIn: result.isLoggedIn,
        },
        process.env.JWT_SECRET,
        { expiresIn: '72h' }
      );
      res.cookie('token', token, {
        maxAge: req.body.rememberMe ? 72 * 60 * 60 * 1000 : 60 * 60 * 1000,
        domain: 'http://localhost:3000',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.json({
        success: true,
        result: {
          token,
          user: {
            _id: result._id,
            name: result.name,
            email: result.email,
            emailVerified: result.emailVerified,
            image: result.image,
            isPhoneVerified: result.isPhoneVerified,
            isEmailVerified: result.isEmailVerified,
            socialId: result.socialId,
            favoriteIds: result.favoriteIds,
            accounts: result.accounts,
            listings: result.listings,
            reservations: result.reservations,
          },
        },
        message: 'Successfully login user',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  updateUser: async (req, res) => {
    try {
      const body = { ...req.body };
      body.updatedBy = req.user._id.toString();
      const result = await User.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
        new: true,
        runValidators: true,
      }).exec();

      if (!result) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No document found with this id: ' + req.params.id,
        });
      } else {
        const userObj = {
          _id: result._id,
          name: result.name,
          email: result.email,
          emailVerified: result.emailVerified,
          image: result.image,
          isPhoneVerified: result.isPhoneVerified,
          isEmailVerified: result.isEmailVerified,
          socialId: result.socialId,
          favoriteIds: result.favoriteIds,
          accounts: result.accounts,
          listings: result.listings,
          reservations: result.reservations,
        };

        res.json({
          success: true,
          result: {
            user: userObj,
          },
          message: 'Successfully updated profile',
        });
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          error: err,
        });
      } else {
        // Server Error
        return res.status(500).json({
          success: false,
          result: null,
          message: 'Oops, there is an error',
          error: err,
        });
      }
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, password, confirmPassword } = req.body;

      // Validate input fields
      if (!currentPassword || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Password and Confirm Password do not match.',
        });
      }

      const user = await User.findOneAndUpdate(
        { _id: req.user.id, removed: false },
        { password: User.generateHash(password) },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Account not found.',
        });
      }

      res.json({
        success: true,
        result: null,
        message: 'Password successfully changed.',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  // forgotPassword
  forgotPassword: async (req, res) => {
    try {
      const { value, resetType } = req.body;

      let user;
      let otpField;
      let otpType;
      let otpValue;

      if (resetType === 'email') {
        user = await User.findOne({ email: value, removed: false });
        otpField = 'email';
        otpType = 'reset';
        otpValue = user.email;
      } else if (resetType === 'phone') {
        user = await User.findOne({ phone: value, removed: false });
        otpField = 'phone';
        otpType = 'reset';
        otpValue = user.phone;
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: `No account found with this ${resetType}.`,
        });
      }

      const otp = otpGenerator();
      const otpData = await otpModel.findOneAndUpdate(
        { [otpField]: otpValue },
        { [otpField]: otpValue, otp },
        { upsert: true, new: true }
      );

      const token = jwt.sign({ id: user._id, otp }, process.env.JWT_SECRET, { expiresIn: '1h' });

      if (resetType === 'email') {
        await SendMail(
          user.email,
          forgotPassword(otp, user.firstName, token),
          `${otp} is your StateBook account recovery code`
        );
      }

      res.json({
        success: true,
        result: null,
        message: `Reset ${resetType} sent successfully.`,
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  // verifyCode
  verifyCode: async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      }

      const otpData = await otpModel.findOne({ otp: code });

      if (!otpData) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Invalid OTP.',
        });
      }

      let user;
      if (otpData.email) {
        user = await User.findOne({ email: otpData.email, removed: false });
      } else if (otpData.phone) {
        user = await User.findOne({ phone: otpData.phone, removed: false });
      }

      const token = jwt.sign({ id: user._id, otp: code }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        success: true,
        result: token,
        message: 'OTP verified.',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  // verifyEmail
  verifyEmail: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      }

      const user = await User.findOne({ email, isEmailVerified: false, removed: false });

      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Account not found.',
        });
      }

      const emailOtp = await otpModel.findOne({ email, otp: code });

      if (emailOtp) {
        const result = await User.findOneAndUpdate(
          { email },
          { isEmailVerified: true, isActive: true },
          { new: true }
        );

        await otpModel.remove({ email });

        res.json({
          success: true,
          result: null,
          message: 'Email verified successfully.',
        });
      } else {
        res.json({
          success: true,
          result: null,
          message: 'Email verification failed.',
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  // verifyPhone
  verifyPhone: async (req, res) => {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      }

      const user = await User.findOne({ phone, isPhoneVerified: false, removed: false });

      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Account not found.',
        });
      }

      const phoneOtp = await otpModel.findOne({ phone, otp: code });

      if (phoneOtp) {
        const result = await User.findOneAndUpdate(
          { phone },
          { isPhoneVerified: true, isActive: true },
          { new: true }
        );

        await otpModel.remove({ phone });

        res.json({
          success: true,
          result: null,
          message: 'Phone verified successfully.',
        });
      } else {
        res.json({
          success: true,
          result: null,
          message: 'Phone verification failed.',
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

 
};

module.exports = authCntrl;
