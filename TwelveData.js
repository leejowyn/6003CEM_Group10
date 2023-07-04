const request = require('request');
const ejs = require('ejs');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); // Add this line
const app = express();

app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/saas', express.static(path.join(__dirname, 'saas')));
app.use('/Source', express.static(path.join(__dirname, 'Source')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

let TDKEY = "ff4d647b85c54f9384999e550f81487d";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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
  
  app.set('view engine', 'ejs');
  
  app.get('/about', async (req, res) => {
    let search = await CurrentPrices(["SPX", "IBM", "AAPL", "IXIC", "GOOGL"]);
  
    // Render the data using EJS template
    const templateData = {
      SPXprice: search["SPX"],
      IBMprice: search["IBM"],
      AAPLprice: search["AAPL"],
      IXICprice: search["IXIC"],
      GOOGLprice: search["GOOGL"],
    };
    res.render('about', templateData);
  });

app.listen(3002, () => {
    console.log('Server started on port 3002');
  });