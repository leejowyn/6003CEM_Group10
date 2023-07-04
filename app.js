const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

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

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded());

// Session middleware configuration
app.use(
  session({
    secret: '123abc', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

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

app.listen(3002, () => {
  console.log('Server is running on port 3002');
});
