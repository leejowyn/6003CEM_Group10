const express = require('express');
const path = require('path');
const weatherApp = require('./weather');
const contactApp = require('./contact');

const app = express();
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// import route files
const homeRoutes = require('./routes/home');
// const newsRoutes = require('./routes/news');
const blogRoutes = require('./routes/blog');
const weatherRoutes = require('./weather');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./contact');

app.set('view engine', 'ejs');

// URL
app.use('/', homeRoutes); 
// app.use('/news', newsRoutes); 
app.use('/articles', blogRoutes); 
app.use('/weather', weatherRoutes); 
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);

app.get('/about', (req, res) => {
  res.render('about'); // Render the contact.ejs file
});

app.get('/contact', (req, res) => {
  res.render('contact'); // Render the contact.ejs file
});

// start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
