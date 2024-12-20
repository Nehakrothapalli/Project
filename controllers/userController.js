const User = require('../models/user');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');
const { body, validationResult } = require('express-validator');

exports.new = (req, res) => {
    if (req.session.user) {
        return res.redirect('/users/profile');
    }
    res.render('./user/new');
};

exports.signup_create = [
    // Validation and sanitization
    body('firstName').trim().escape().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').trim().escape().notEmpty().withMessage('Last name cannot be empty'),
    body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/users/new');
        }

        let user = new User(req.body);

        user.save()
            .then(() => {
                req.flash('success', 'Sign up successful! Please log in.');
                res.redirect('/users/login');
            })
            .catch(err => {
                if (err.name === 'ValidationError') {
                    req.flash('error', err.message);
                } else if (err.code === 11000) {
                    req.flash('error', 'This email is already in use. Please use another.');
                } else {
                    req.flash('error', 'An error occurred. Please try again.');
                }
                res.redirect('/users/new');
            });
    }
];

exports.login_page = (req, res) => {
    if (req.session.user) {
        return res.redirect('/users/profile');
    }
    res.render('./user/login');
};

exports.login_check = [
    // Validation and sanitization
    body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').trim().notEmpty().withMessage('Password cannot be empty'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/users/login');
        }

        const { email, password } = req.body;

        User.findOne({ email })
            .then(user => {
                if (user) {
                    user.comparePassword(password)
                        .then(result => {
                            if (result) {
                                req.session.user = {
                                    id: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName
                                };
                                req.flash('success', `Welcome back, ${user.firstName}!`);
                                res.redirect('/users/profile');
                            } else {
                                req.flash('error', 'Incorrect password. Please try again.');
                                res.redirect('/users/login');
                            }
                        });
                } else {
                    req.flash('error', 'No account found with this email.');
                    res.redirect('/users/login');
                }
            })
            .catch(err => next(err));
    }
];

// exports.profile = (req, res, next) => {
//     if (!req.session.user) {
//         req.flash('error', 'You must be logged in to view your profile.');
//         return res.redirect('/users/login');
//     }

//     const userId = req.session.user.id;

//     Promise.all([
//         User.findById(userId),
//         Event.find({ host_name: userId }), // Events created by the user
//         RSVP.find({ userId }).populate('eventId') // Events the user RSVPed to
//     ])
//         .then(([user, events, rsvps]) => {
//             res.render('./user/profile', { user, events, rsvps });
//         })
//         .catch(err => next(err));
// };




exports.profile = async (req, res, next) => {
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to view your profile.');
            return res.redirect('/users/login');
        }

        const userId = req.session.user.id;

        // Fetch user, events created by the user, and RSVPs
        const [user, events, rsvps] = await Promise.all([
            User.findById(userId),
            Event.find({ host_name: userId }), // Events created by the user
            RSVP.find({ userId }).populate('eventId') // Events the user RSVPed to
        ]);

        if (!user) {
            const error = new Error('User not found.');
            error.status = 404;
            return next(error);
        }

        // Filter out invalid RSVPs with null eventId
        const validRSVPs = rsvps.filter(rsvp => rsvp.eventId !== null);

        // Render the profile page
        res.render('./user/profile', { user, events, rsvps: validRSVPs });
    } catch (err) {
        // Handle errors
        next(err);
    }
};






exports.logout = (req, res,next)=>{
    req.session.destroy(err=>{
        if(err){
            return next(err)
        }
        else{
            res.redirect('/users/login')
        }
    })
    };
    