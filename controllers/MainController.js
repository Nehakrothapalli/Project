
exports.index = (req, res) => {
    res.render('index');
};

// Show categories of events
exports.about = (req, res) => {
    res.render('about');
};

// Render form for creating a new event
exports.contact = (req, res) => {
    res.render('contact');
};
