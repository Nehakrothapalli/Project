const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['YES', 'NO', 'MAYBE'],
        required: true,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Prevent duplicate RSVPs for the same user and event
rsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
