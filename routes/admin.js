const express = require('express');
const adminRouter = express.Router();
const adminSchema = require('../models/adminSchema');
const Contact = require('../models/contactSchema');
const axios = require('axios')
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');

adminRouter.get('/', (req, res) => {
    if (res.locals.adminId) 
        res.redirect('/admin/admincontact');
    else 
        res.render('adminlogin');
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
                res.redirect('admincontact'); // Redirect to the admin page
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
    if (!res.locals.adminId) {
        res.redirect('/admin');
    } 
    else {
        try {
            const contacts = await Contact.find({});
            res.render('admincontact', { contacts });
        } catch (error) {
            console.error('Error retrieving contact data', error);
        }
    }
});

// app.get('/admincontact', (req, res) => {
//     res.render('admincontact'); // Render the .ejs file
//   });

module.exports = adminRouter;