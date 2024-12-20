//require modules
const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

//create app
const app = express();



//configure app
let port = 3000;
let host = 'localhost';
let url = 'mongodb+srv://Cluster49368:YWFJVXNia25T@cluster49368.2lhlc.mongodb.net/project_nbad?retryWrites=true&w=majority&appName=Cluster49368';
app.set('view engine', 'ejs');

//connect to MongoDB
mongoose.connect(url)
    .then(() => {
        //start server
        app.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`); 
        });
    })
    .catch(err => console.error(err));



//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(morgan('tiny'));


//connecting sessions
app.use(session({
    secret:'sjskjdhfhkjdjhfg87686sdfd',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:60*60*10000},
    store: new MongoStore({mongoUrl: 'mongodb+srv://Cluster49368:YWFJVXNia25T@cluster49368.2lhlc.mongodb.net/project_nbad?retryWrites=true&w=majority&appName=Cluster49368'})
}));

app.use(flash())
app.use((req,res,next)=> {
    // console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.Successmessages=req.flash('success');
    res.locals.Errormessages=req.flash('error');
    next();
})






// Middleware to handle static files (including images in uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes );


app.use((req, res, next) => {
    res.status(404).render('error', { errorMessage: 'Page not found', errStatus : 404 });
});

