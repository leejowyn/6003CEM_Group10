const express = require('express');
const authRouter = express.Router();
const userSchema = require('../models/userSchema')
const axios = require('axios')
const session = require('express-session');
const app = express();

authRouter.use(session({
    secret: '123abc', 
    resave: false,
    saveUninitialized: true
}));


authRouter.get('/',(req,res)=>{
    res.render('auth')
})

authRouter.post('/register', (req, res) => {
    console.log(req.body);
    var error = false;
    var errorDetails = "";

    if (req.body.password === req.body.cpassword) {

        //create author
        const token = "pat-na1-302e381a-bf1d-40dd-9617-d0fe505ab967";
        const headers = { 
        'Authorization':` Bearer ${token}`, 
        'Content-Type': 'application/json'
        };

        var config = {
        method: 'post',
        url: 'https://api.hubapi.com/blogs/v3/blog-authors',
        headers: headers,
        data : {"fullName": req.body.email}
        };

        //create author on api
        axios(config)
        .then(function (response) {
        console.log(response.data.id);
        const userData = new userSchema({
            email: req.body.email,
            password: req.body.password,
            author_id: response.data.id,
        })
        userData.save()
            .then(result => {
                console.log("Success: " + result);
                const successMessage = "Register successful";
                res.render('auth', { title: '', password: 'save', email: '', successMessage: successMessage });
            })
            .catch(error => {
                console.log("Error: " + error);
                // Handle the error appropriately
            });
        })
        .catch(function (error) {
        console.log(error);
        });

        
    } else {
        // Passwords don't match, display error message
        error = true;
        errorDetails = "Passwords do not match";
        res.render('auth', { error: error, errorDetails: errorDetails });
    }
})

authRouter.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    userSchema.findOne({ email: email, password: password })
        .then(user => {
            if (user) {
                // User credentials are correct
                req.session.userId = user._id.valueOf();// Save the user ID in the session
                console.log(req.session);
                res.render('homepage'); // Redirect to the homepage
            } else { 
                // User credentials are incorrect
                const error = true;
                const errorDetails = "Invalid email or password";
                res.render('auth', { error: error, errorDetails: errorDetails });
            }
        })
        .catch(error => {
            console.log("Error: " + error);
            // Handle the error appropriately
        });
});


module.exports = authRouter;