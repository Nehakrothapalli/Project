const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: { 
        type: String, 
        required: true, 
        enum: [
            'AI', 
            'JavaScript', 
            'Web Development', 
            'Cybersecurity', 
            'Data Science', 
            'Cloud Computing', 
            'Blockchain', 
            'DevOps'
        ] 
    },
    eventName: { type: String, required: true },
    host_name: {type: Schema.Types.ObjectId, ref: 'User'},
    startdatetime: { type: Date, required: true },
    enddatetime: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    eventImage: { type: String, default: '/uploads/default.jpeg' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
