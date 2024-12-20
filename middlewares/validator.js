const mongoose = require('mongoose');

const validateId = (req, res, next) => {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
        return next();
    } else {
        const error = new Error('Invalid id format!');
        error.status = 400;
        return next(error);
    }
};

module.exports = { validateId };