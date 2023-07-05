const express = require('express');
const mongoose = require('mongoose');
const app = express();

// import route files
const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
// const newsRoutes = require('./routes/news');
const blogRoutes = require('./routes/blog');

// db connection
const db = 'mongodb+srv://Joey:joey123@cluster0.ydsv4eh.mongodb.net/6003CEM';
mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Can't connect to the database");
  });

app.use(express.static('public')); // static Files
app.set('view engine', 'ejs');

app.use(express.urlencoded()); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Add middleware to parse JSON request bodies

// URL
app.use('/', homeRoutes); 
// app.use('/news', newsRoutes); 
app.use('/blog-articles', blogRoutes);
app.use('/auth', authRoutes);

// start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
