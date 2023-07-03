const express = require('express');
const https = require('https');
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

app.get('/', (req, res) => {
  res.render('weather');
});

app.post("/weather", (req, res) => {
  const cityname = req.body.cityName;
  const apiKey = "a7c772b1bba03a0e44f5fdfc86b7a02f";
  const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityname + '&appid=' + apiKey;

  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', async () => {
      const weatherData = JSON.parse(data);
      const temp = Math.round(weatherData.main.temp - 273.15); // Convert temperature from Kelvin to Celsius
      const cityName = weatherData.name;
      const humidity = weatherData.main.humidity;
      const windspeed = weatherData.wind.speed;
      const weatherMain = weatherData.weather[0].main;

      const weatherInfo = {
        city: cityName,
        temp: temp + " °C",
        humidity: humidity + "%",
        windSpeed: windspeed + " km/h",
        weatherMain: weatherMain,
      };

      res.render('weatherdetails', { weatherInfo });
    });
  });
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

app.get('/contact', (req, res) => {
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

app.get('/admincontact', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.render('admincontact', { contacts });
  } catch (error) {
    console.error('Error retrieving contact data', error);
    res.redirect('/error');
  }
});

app.get('/about', (req, res) => {
  res.render('about'); // Render the contact.ejs file
});

app.get('/contact', (req, res) => {
  res.render('contact'); // Render the contact.ejs file
});

app.get('/index', (req, res) => {
  res.render('index'); // Render the contact.ejs file
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

