const express = require('express');
const adminRouter = express.Router();
const adminSchema = require('../models/adminSchema')
const axios = require('axios')
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');

adminRouter.use(session({
    secret: '123abc',
    resave: false,
    saveUninitialized: true
}));

adminRouter.get('/', (req, res) => {
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
                res.redirect('./admincontact'); // Redirect to the admin page
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



adminRouter.get('/admincontact', async (req, res) => {
    try {
        const contactSchema = new mongoose.Schema({
            name: String,
            email: String,
            subject: String,
            message: String
        });

        // Create a model based on the schema
        const Contact = mongoose.model('contact', contactSchema);
        const contacts = await Contact.find({});
        res.render('admincontact', { contacts });
    } catch (error) {
        console.error('Error retrieving contact data', error);
        res.redirect('/error');
    }
});

// app.get('/admincontact', (req, res) => {
//     res.render('admincontact'); // Render the .ejs file
//   });

module.exports = adminRouter;