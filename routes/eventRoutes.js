const express = require('express');
const controller = require('../controllers/eventController');
const path = require('path');
const app = express();
const multer = require('multer');
const {isLoggedIn,isGuest, isHost} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');


const router = express.Router();


// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // Save files to the "uploads" directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Get the file extension
        cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Create a unique file name
    }
});

const upload = multer({ storage: storage });




router.get('/', controller.index);

router.get('/categories_events', controller.categories_events);


router.get('/createpage',isLoggedIn, controller.createpage);

router.post('/create',isLoggedIn, upload.single('image'), controller.create);

router.get('/:id',validateId ,controller.show);


router.get('/:id/edit',isLoggedIn,isHost ,validateId, controller.edit);


router.post('/:id/update',isLoggedIn, isHost, validateId, upload.single('image') ,controller.update);


router.post('/:id/delete',isLoggedIn,isHost , validateId, controller.delete);


// RSVP to an event
router.post('/:id/rsvp', isLoggedIn, validateId, controller.rsvp);




// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(404).render('error', { errorMessage: err.message || 'Event not found.',errStatus : err.status || 404});
};

// Use the error handling middleware
router.use(errorHandler);

module.exports = router;
