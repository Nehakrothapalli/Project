const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn, loginLimiter, signupLimiter} = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();








//GET requests for the user

router.get('/new',isGuest ,controller.new);

//GET login page

router.get('/login', isGuest ,controller.login_page);

//POST request for the login page

// router.post('/login', isGuest ,controller.login_check);

//GET request for the profile page
router.get('/profile', isLoggedIn, controller.profile);

router.get('/logout',  isLoggedIn ,controller.logout);

//POST requests for the user

// router.post('/new/createnew', isGuest ,controller.signup_create)




router.post('/login', loginLimiter, isGuest, controller.login_check);
router.post('/new/createnew', signupLimiter, isGuest, controller.signup_create);
module.exports = router;

