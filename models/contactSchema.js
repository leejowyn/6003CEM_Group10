const mongoose = require('mongoose');

// Create a schema for the contact form data
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String
});

// Create a model based on the schema
module.exports = mongoose.model('contact', contactSchema);