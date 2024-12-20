const Event = require('../models/event');
const rateLimit = require('express-rate-limit');

//check if user is guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }
    else {
        req.flash('error', 'You are already logged in!');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    }
    else {
        req.flash('error', 'You need to log in first!');
        return res.redirect('/users/login');
    }
};




//check if user is author of the story
exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }   

    Event.findById(id)
    .then(event=>{
        if(event){
            if(event.host_name == req.session.user.id){
                return next();
            }
            else {
                let err = new Error('Unauthorized to access the resource!');
                err.status = 401;
                return next(err);
            }
        }
        else
        {
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};









exports.loginLimiter = rateLimit({
    windowMs:60*1000,
    max:5,
    message:'Too many login requests, please try again later',
    handler:(req,res,next)=>{
        let err=new Error('Too many login requests, please try again later');
        err.status=429;
        return next(err);
    }
});



exports.signupLimiter = rateLimit({
    windowMs:60*1000,
    max:5,
    message:'Too many login requests, please try again later',
    handler:(req,res,next)=>{
        let err=new Error('Too many login requests, please try again later');
        err.status=429;
        return next(err);
    }
});