const Event = require('../models/event'); // Import the Mongoose model
const RSVP = require('../models/rsvp'); // Import the RSVP model
const User = require('../models/user'); // Import the Mongoose model
const path = require('path');
const { body, validationResult } = require('express-validator');


// Show all events
exports.index = (req, res, next) => {
    Event.find()
        .then(events => res.render('./event/events', { events }))
        .catch(err => next(err));
};

// Show categories of events
exports.categories_events = (req, res, next) => {
    Event.find()
        .then(events => res.render('./event/categories', { events }))
        .catch(err => next(err));
};

// Render form for creating a new event
exports.createpage = (req, res) => {
    let id = req.session.user.id;
    User.findById(id)
        .then(user => {
            res.render('./event/new', { user });
        })
        .catch(err => next(err));
};






// Create a new event
// exports.create = (req, res, next) => {
//     const userId = req.session.user;
//     const eventData = {
//         ...req.body,
//         host_name: userId.id, 
//         eventImage: req.file ? '/uploads/' + req.file.filename : '/uploads/default.jpeg'
//     };
//     const event = new Event(eventData);

//     event.save()
//         .then(() => res.redirect('/events'))
//         .catch(err => next(new Error('Failed to create event: ' + err.message)));
// };

exports.create = [
    // Validation middleware
    body('eventName').trim().notEmpty().withMessage('Event name cannot be empty.').escape(),
    body('category').trim().notEmpty().withMessage('Category cannot be empty.').escape(),
    body('description').trim().notEmpty().withMessage('Description cannot be empty.').escape(),
    body('startdatetime').isISO8601().withMessage('Invalid start date and time.').toDate(),
    body('enddatetime')
    .isISO8601().withMessage('Invalid end date and time.')
    .toDate()
    .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startdatetime)) {
            throw new Error('End date and time must be after the start date and time.');
        }
        return true;
        }),

    // Controller logic
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('./event/new', { 
                user: req.session.user, 
                errors: errors.array(), 
                eventData: req.body 
            });
        }

        const userId = req.session.user;
        const eventData = {
            ...req.body,
            host_name: userId.id,
            eventImage: req.file ? '/uploads/' + req.file.filename : '/uploads/default.jpeg'
        };

        const event = new Event(eventData);
        event.save()
            .then(() => res.redirect('/events'))
            .catch(err => next(new Error('Failed to create event: ' + err.message)));
    }
];







// Show details of a specific event by ID
exports.show = async (req, res, next) => {
    try {
        const { id } = req.params;

    
        // Find the event and populate host details
        const event = await Event.findById(id).populate('host_name', 'firstName lastName');
        if (!event) {
            const err = new Error('Event not found.');
            err.status = 404;
            throw err;
        }

        // Get RSVP count (count only those with status 'YES')
        const rsvpCount = await RSVP.countDocuments({ eventId: id, status: 'YES' });

        // Render the event details page
        res.render('./event/event', { event, rsvpCount });
    } catch (err) {
        // Pass errors to the error-handling middleware
        next(err);
    }
};


// Render form for editing an event by ID
exports.edit = (req, res, next) => {
    
    const id = req.params.id;

    Event.findById(id)
    .populate('host_name', 'firstName lastName')
        .then(event => {
            if (event) {
                console.log(event.startdatetime)
                const offset = event.startdatetime.getTimezoneOffset() * 60000; // Convert offset to milliseconds

                event.startdatetimeFormatted = new Date(event.startdatetime.getTime() - offset).toISOString().slice(0, 16);
                event.enddatetimeFormatted = new Date(event.enddatetime.getTime() - offset).toISOString().slice(0, 16);
            
                res.render('./event/event_edit', { event });
            } else {
                const err = new Error('Event not found');
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

// Update an event by ID
// exports.update = (req, res, next) => {
//     const userId = req.session.user;
//     const id = req.params.id;
//     const updatedData = {
//         ...req.body,
//         host_name: userId.id, 
//         eventImage: req.file ? '/uploads/' + req.file.filename : undefined
//     };

//     Event.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
//         .then(event => {
//             if (event) {
//                 res.redirect('/events/' + id);
//             } else {
//                 const err = new Error('Event not found');
//                 err.status = 404;
//                 next(err);
//             }
//         })
//         .catch(err => next(err));
// };




exports.update = [
    // Validation middleware
    body('eventName').trim().notEmpty().withMessage('EventName can not be empty').escape(),
    body('category').trim().notEmpty().withMessage('Category cannot be empty.').escape(),
    body('description').trim().notEmpty().withMessage('Description cannot be empty.').escape(),
    body('startdatetime').isISO8601().withMessage('Invalid start date and time.').toDate(),
    body('enddatetime')
        .isISO8601().withMessage('Invalid end date and time.')
        .toDate()
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startdatetime)) {
                throw new Error('End date and time must be after the start date and time.');
            }
            return true;
        }),

    // Controller logic
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            const id = req.params.id;

            if (!errors.isEmpty()) {
                // Add flash messages for validation errors
                errors.array().forEach(error => {
                    req.flash('error', error.msg);
                });

                return res.redirect('/events/' + id + '/edit');
            }

            const userId = req.session.user;
            const updatedData = {
                ...req.body,
                host_name: userId.id,
                eventImage: req.file ? '/uploads/' + req.file.filename : undefined
            };

            const event = await Event.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

            if (event) {
                req.flash('success', 'Event updated successfully.');
                res.redirect('/events/' + id);
            } else {
                req.flash('error', 'Event not found.');
                res.redirect('/events/' + id + '/edit');
            }
        } catch (err) {
            next(err);
        }
    }
];




// Delete an event by ID
exports.delete = (req, res, next) => {
    const eventId = req.params.id;

    Event.findByIdAndDelete(eventId)
        .then(deletedEvent => {
            if (!deletedEvent) {
                const err = new Error('Event not found.');
                err.status = 404;
                throw err;
            }
            // Delete all associated RSVPs
            return RSVP.deleteMany({ event: eventId });
        })
        .then(() => {
            req.flash('success', 'Event and associated RSVPs deleted successfully.');
            res.redirect('/users/profile');
        })
        .catch(err => next(err));
};


// RSVP to an event
// exports.rsvp = async (req, res, next) => {
//     try {
//         const eventId = req.params.id;
//         const userId = req.session.user.id; // Assume user is logged in and their ID is stored in session

//         // Check if the user has already RSVPed
//         const existingRSVP = await RSVP.findOne({ eventId, userId });
//         if (existingRSVP) {
//             return res.status(400).send('You have already RSVPed to this event.');
//         }

//         // Create an RSVP
//         await RSVP.create({ eventId, userId });

//         res.redirect(`/events/${eventId}`);
//     } catch (err) {
//         next(err);
//     }
// };




exports.rsvp = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.session.user.id;
        const { status } = req.body; // Expecting status in the POST body

        // Validate the status value
        if (!['YES', 'NO', 'MAYBE'].includes(status)) {
            const error = new Error('Invalid RSVP status.');
            error.status = 400;
            throw error;
        }

        // Prevent users from RSVPing to their own events
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.status = 404;
            throw error;
        }
        if (event.host_name.toString() === userId) {
            const error = new Error('You cannot RSVP to your own event.');
            error.status = 403;
            throw error;
        }

        // Check if RSVP exists and update if found
        let rsvp = await RSVP.findOne({ eventId, userId });
        if (rsvp) {
            rsvp.status = status;
        } else {
            rsvp = new RSVP({ eventId, userId, status });
        }
        await rsvp.save();

        res.redirect(`/events/${eventId}`);
    } catch (err) {
        next(err);
    }
};