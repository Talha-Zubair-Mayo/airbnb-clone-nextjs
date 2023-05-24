const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.variables.env' });
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
const SocialLoginCntrl = {
    register: async (req, res) => {
        try {
            const { firstName, lastName, socialId, isGoogleLogin, isFacebookLogin, email, userType, photo } = req.body;
            console.log(firstName, lastName, socialId, email, userType, photo)
            // validate 
            if (!firstName || !lastName || !socialId || !email || !userType || !photo) {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'Not all fields have been entered.',
                });
            }
            const cRole = await Role.findOne({ roleType: userType });
            const user = await User.findOne({ socialId: socialId, removed: false, isGoogleLogin: isGoogleLogin ? true : false, isFacebookLogin: isFacebookLogin ? true : false });
            if (user) {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'account already exist please Login.',
                });
            }
            const newUser = new User();
            const passwordHash = newUser.generateHash(socialId);
            const result = await new User({
                firstName, lastName, email, socialId, password: passwordHash, role: cRole._id, photo: photo, isGoogleLogin, isFacebookLogin, isLoggedIn: true, isSocialLogin: true
            }).save();
            console.log(result)
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
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: result.email,
                        createdAt: result.createdAt,
                        isLoggedIn: result.isLoggedIn,
                        photo: result.photo,
                        phone: result.phone,
                        compny: result.company,
                        address: result.address,
                        about: result.about,
                        isGoogleLogin: result.isGoogleLogin,
                        isFacebookLogin: result.isFacebookLogin,
                        isSocialLogin: result.isSocialLogin
                    }
                },
                message: 'Successfully register user',
            });
        } catch (err) {
            res.status(500).json({ success: false, result: null, message: err.message, error: err });
        }
    }
    ,
    login: async (req, res) => {
        try {
            const { socialId } = req.body;
            // validate
            if (!socialId) {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'Not all fields have been entered.',
                });
            }

            const user = await User.findOne({ socialId: socialId, removed: false });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'No account  has been registered.',
                });
            }


            const isMatch = await bcrypt.compare(socialId, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'Invalid credentials.',
                });
            }
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
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: result.email,
                        createdAt: result.createdAt,
                        isLoggedIn: result.isLoggedIn,
                        photo: result.photo,
                        phone: result.phone,
                        compny: result.company,
                        address: result.address,
                        about: result.about,
                        isGoogleLogin: result.isGoogleLogin,
                        isFacebookLogin: result.isFacebookLogin,
                        isSocialLogin: result.isSocialLogin
                    }
                },
                message: 'Successfully login user',
            });
        } catch (err) {
            res.status(500).json({ success: false, result: null, message: err.message, error: err });
        }
    },
    updateUser: async (req, res) => {
        try {
            const body = { ...req.body }
            body.updatedBy = req.user._id.toString();
            const result = await User.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
                new: true,
                runValidators: true,
            }).exec();
            if (!result) {
                return res.status(404).json({
                    success: false,
                    result: null,
                    message: 'No document found by this id: ' + req.params.id,
                });
            } else {
                res.json({
                    success: true,
                    result: {
                        user: {
                            _id: result._id,
                            firstName: result.firstName,
                            lastName: result.lastName,
                            email: result.email,
                            createdAt: result.createdAt,
                            isLoggedIn: result.isLoggedIn,
                            photo: result.photo,
                            phone: result.phone,
                            compny: result.company,
                            address: result.address,
                            about: result.about,
                            isGoogleLogin: result.isGoogleLogin,
                            isFacebookLogin: result.isFacebookLogin,
                            isSocialLogin: result.isSocialLogin
                        }
                    },
                    message: 'Successfully updated profile',
                });
            }
        } catch (err) {
            if (err.name == 'ValidationError') {
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
                    message: 'Oops there is an Error',
                    error: err,
                });
            }
        }
    },
}

module.exports = SocialLoginCntrl