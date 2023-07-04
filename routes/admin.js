const express = require('express');
const adminRouter = express.Router();
const adminSchema = require('../models/adminSchema')
const axios = require('axios')
const session = require('express-session');
const app = express();

app.use(session({
    secret: '123abc', 
    resave: false,
    saveUninitialized: true
}));

adminRouter.get('/',(req,res)=>{
    res.render('adminlogin')
})

adminRouter.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    adminSchema.findOne({ email: email, password: password })
        .then(admin => {
            if (admin) {
                // admin credentials are correct
                req.session.adminId = admin._id.valueOf();// Save the admin ID in the session
                console.log(req.session);
                res.render('adminhome'); // Redirect to the admin page
            } else {
                // admin credentials are incorrect
                const error = true;
                const errorDetails = "Invalid email or password";
                res.render('adminlogin', { error: error, errorDetails: errorDetails });
            }
        })
        .catch(error => {
            console.log("Error: " + error);
            // Handle the error appropriately
        });
});


module.exports = adminRouter;