const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const request = require('request');
const ejs = require('ejs');
const bodyParser = require("body-parser");
const path = require("path"); // Add this line
const https = require('https');
const axios = require('axios');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Add middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


// import route files
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');


// URL
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/blog-articles', blogRoutes);


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


//News Section
const api_key = '1f816631501047999c8561cc58b5dae0';

let articles = [];

// News Route
app.get('/', async (req, res) => {
  const category = req.query.category || 'all';
  const sort = req.query.sort || 'new';

  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${category}&apiKey=${api_key}`);
    articles = response.data.articles;

    //Filter only articles contain image
    articles = articles.filter((article) => article.urlToImage);

    // Sort articles based on the selected option
    if (sort === 'new') {
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sort === 'old') {
      articles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    }

    res.render('news', { articles, category, sort }); // Pass the category and sort
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).send('Error fetching news');
  }
});

//New Detail Route
app.get('/news-detail', async (req, res) => {
  const author = req.query.author;
  const title = req.query.title;
  const article = articles.find((article) => article.title === title);

  if (article) {
    const { content, publishedAt, urlToImage, source, description, url } = article;
    const date = new Date(publishedAt);
    const formattedDate = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const category = '';
    let imageSrc = '';
    if (urlToImage) {
      try {
        //Get the image using axios
        const imageResponse = await axios.get(urlToImage, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(imageResponse.data, 'binary').toString('base64');
        imageSrc = `data:${imageResponse.headers['content-type']};base64,${imageData}`;
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }
    res.render('news-detail', {
      author,
      title,
      content,
      date,
      formattedDate,
      month,
      category,
      urlToImage: imageSrc,
      source,
      description,
      url
    });
  } else {
    res.status(404).send('News article not found');
  }
});

//Search function
app.get('/search', async (req, res) => {
  const query = req.query.query;
  const category = req.query.category || 'all';
  const sort = req.query.sort || 'new';
  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${api_key}`;

  try {
    const response = await axios.get(url);
    articles = response.data.articles;

    //Filter only articles contain image
    articles = articles.filter((article) => article.urlToImage);

    res.render('news', { articles, category, sort }); // Pass the articles, category, and sort
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).send('Error searching news');
  }
});

const bookmarkSchema = new mongoose.Schema({
  title: String,
  author: String,
  sourceName: String,
  description: String,
});

const Bookmark = mongoose.model('bookmark', bookmarkSchema);

// Bookmark Route
app.get('/bookmark', (req, res) => {
  Bookmark.find()
    .then((bookmarks) => {
      const successMessage = req.query.success;
      const errorMessage = req.query.error;
      res.render('bookmark', { bookmarks, success: successMessage, error: errorMessage });
    })
    .catch((error) => {
      console.error('Error retrieving bookmarks from the database:', error);
      const errorMessage = 'Error retrieving bookmarks from the database';
      res.render('bookmark', { error: errorMessage });
    });
});

//Bookmark Insert Function
app.post('/bookmark', (req, res) => {
  // Retrieve the data
  const { title, author, sourceName, description, userId } = req.query;

  const bookmark = new Bookmark({
    title: decodeURIComponent(title),
    author: decodeURIComponent(author),
    sourceName: decodeURIComponent(sourceName),
    description: decodeURIComponent(description)
  });

  // Save the bookmark to MongoDB
  bookmark.save()
    .then(() => {
      console.log('Bookmark saved to database');
      res.redirect('/bookmark');
    })
    .catch((error) => {
      console.error('Error saving bookmark to database:', error);
      res.status(500).send('Error saving bookmark');
    });
});

// Retrieve bookmark data by id
app.get('/bookmark/:id', (req, res) => {
  const bookmarkId = req.params.id;
//get bookmark by id
  Bookmark.findById(bookmarkId)
    .then((bookmark) => {
      if (bookmark) {
        res.json(bookmark); //return in json
      } else {
        res.status(404).json({ error: 'Bookmark not found' });
      }
    })
    .catch((error) => {
      console.error('Error retrieving bookmark:', error);
      res.status(500).json({ error: 'Error retrieving bookmark' });
    });
});

// Delete function
app.get('/delete/:id', (req, res) => {
  const bookmarkId = req.params.id;

  Bookmark.findByIdAndRemove(bookmarkId)
    .then(() => {
      console.log('Bookmark deleted from the database');
      res.redirect('/bookmark?success=Bookmark successfully deleted');
    })
    .catch((error) => {
      console.error('Error deleting bookmark from the database:', error);
      res.redirect('/bookmark?error=Error deleting bookmark');
    });
});

//Edit function
app.post('/edit/:id', (req, res) => {
  const bookmarkId = req.params.id;
  const { title, author, sourceName, description } = req.body;

  Bookmark.findByIdAndUpdate(bookmarkId, { title, author, sourceName, description })
    .then(() => {
      console.log('Bookmark updated in the database');
      res.redirect('/bookmark?success=Bookmark successfully updated');
    })
    .catch((error) => {
      console.error('Error updating bookmark in the database:', error);
      res.redirect('/bookmark?error=Error updating bookmark');
    });
});

//Server start
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
