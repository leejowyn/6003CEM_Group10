const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 

const api_key = '1f816631501047999c8561cc58b5dae0';

let articles = [];

// News Route
app.get('/news', async (req, res) => {
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

//Home Page
app.get('/index', async (req, res) => {
  try{
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${api_key}`);
      articles = response.data.articles;

      res.render('index',{articles});
  } catch(error){
    console.error('error display news', error);
  }
});

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

const mongoose = require('mongoose');
const db = "mongodb+srv://Weijie:weijie123@cluster0.ydsv4eh.mongodb.net/6003CEM";

const bookmarkSchema = new mongoose.Schema({
  title: String,
  author: String,
  sourceName: String,
  description: String,
});

const Bookmark = mongoose.model('bookmark', bookmarkSchema);

mongoose.connect(db).then(() => {
  console.log('Connected to database');
}).catch((error) => {
  console.error('Failed to connect to database:', error);
});

// Get bookmark detail in database and display
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


//Bookmark route
app.post('/bookmark', (req, res) => {
  // Retrieve the data
  const { title, author, sourceName, description, userId } = req.query;

  const bookmark = new Bookmark({
    title: decodeURIComponent(title),
    author: decodeURIComponent(author),
    sourceName: decodeURIComponent(sourceName),
    description: decodeURIComponent(description),
    userId: userId
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

// Delete bookmark route
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

//Edit
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


app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

//Start server
app.listen(3000, () => {
  console.log('The server is running at http://localhost:3000/news');
});
