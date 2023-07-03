const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Tommy:tommy123@cluster0.ydsv4eh.mongodb.net/6003CEM', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });

// Create a schema for the contact form data
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String
});

// Create a model based on the schema
const Contact = mongoose.model('contact', contactSchema);

app.get('/contact', (req, res)  => {
    res.render('contact'); // Render the contact.ejs file
});

app.post('/contact', (req, res) => {
    // Create a new document from the submitted form data
    const formData = new Contact({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });
  
    // Save the form data to MongoDB
    formData.save()
      .then(() => {
        console.log('Form data saved to MongoDB');
        res.redirect('/success');
      })
      .catch((error) => {
        console.error('Error saving form data', error);
        res.redirect('/error');
      });
});

module.exports = app;
