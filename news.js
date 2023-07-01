const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
//Define the view to ejs
app.set('view engine', 'ejs'); 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/saas', express.static(path.join(__dirname, 'saas')));
app.use('/Source', express.static(path.join(__dirname, 'Source')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

const api_key = 'be06e67a4e314d1d91df02bca884fb8b';

let articles = [];

app.get('/news', async (req, res) => {
    const category = req.query.category || 'all';
    const sort = req.query.sort || 'new'; 
  
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything?q=${category}&apiKey=${api_key}`);
      articles = response.data.articles;
  
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

  app.get('/news-detail', async (req, res) => {
    const author = req.query.author;
    const title = req.query.title;
    const article = articles.find((article) => article.title === title);
  
    if (article) {
      const { content, publishedAt, urlToImage, source, description } = article;
      const date = new Date(publishedAt);
      const formattedDate = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const category = '';
      let imageSrc = ''; 
      if (urlToImage) {
        try {
          // Fetch the image using axios
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
        description
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
      res.render('news', { articles, category, sort }); // Pass the articles, category, and sort
    } catch (error) {
      console.error('Error searching news:', error);
      res.status(500).send('Error searching news');
    }
  });
  
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//Start server
app.listen(3000, () => {
  console.log('The server is running at http://localhost:3000/news');
});
