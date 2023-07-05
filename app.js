const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const request = require('request');
const ejs = require('ejs');
const bodyParser = require("body-parser");
const path = require("path"); // Add this line
const https = require('https');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));


// Session middleware configuration
app.use(
  session({
    secret: '123abc', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
  })
);


// db connection
const db = 'mongodb+srv://jowyn:testing123@cluster0.ydsv4eh.mongodb.net/6003CEM';
mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Can't connect to the database");
  });


app.post('/adminlogout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    // Redirect the admin to the login page or any other appropriate page
    res.render('adminlogin');
  });
});

app.post('/userlogout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    // Redirect the user to the login page 
    res.render('auth');
  });
});



//TwelveData.js Start
let TDKEY = "ff4d647b85c54f9384999e550f81487d";

async function CurrentPrices(tickers) {
  return await new Promise((resolve, reject) => {
    let tdurl = 'https://api.twelvedata.com/price?symbol=' + tickers.toString() + '&apikey=' + TDKEY;

    request.get({
      url: tdurl,
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        let reformattedData = {};
        if (tickers.length == 1) {
          let key = tickers[0];
          reformattedData[key] = parseFloat(data.price);
        } else if (tickers.length > 1) {
          for (let key in data) {
            reformattedData[key] = parseFloat(data[key].price);
          }
        }
        resolve(reformattedData);
      }
    });
  });
}

app.get('/stock', async (req, res) => {
  let search = await CurrentPrices(["SPX", "IBM", "AAPL", "IXIC", "GOOGL"]);

  // Render the data using EJS template
  const templateData = {
    SPXprice: search["SPX"],
    IBMprice: search["IBM"],
    AAPLprice: search["AAPL"],
    IXICprice: search["IXIC"],
    GOOGLprice: search["GOOGL"],
  };
  res.render('stock', templateData);
});
//TwelveData.js End



//WeatherAPI.js Start
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
//WeatherAPI.js End



//Contact.js Start
app.post('/contact', (req, res) => {


  // Create a schema for the contact form data
  const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String
  });

  // Create a model based on the schema
  const Contact = mongoose.model('contact', contactSchema);

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
//Contact.js End



//Links to next page
app.get('/weather', (req, res) => {
  res.render('weather'); // Render the weather.ejs file
});

app.get('/about', (req, res) => {
  res.render('about'); // Render the about.ejs file
});

app.get('/contact', (req, res) => {
  res.render('contact'); // Render the contact.ejs file
});

app.get('/admincontact', (req, res) => {
  res.render('admincontact'); // Render the contact.ejs file
});


//Server start
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
