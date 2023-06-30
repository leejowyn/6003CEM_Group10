const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from the current directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/weather.html");
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

            // Create HTML content to display weather information
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="description" content="Foodeiblog Template">
                <meta name="keywords" content="Foodeiblog, unica, creative, html">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Weather | Template</title>
            
                <!-- Google Font -->
                <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:300,400,600,700,800,900&display=swap"
                    rel="stylesheet">
                <link href="https://fonts.googleapis.com/css?family=Unna:400,700&display=swap" rel="stylesheet">
            
                <!-- Css Styles -->
                <link rel="stylesheet" href="css/bootstrap.min.css" type="text/css">
                <link rel="stylesheet" href="css/font-awesome.min.css" type="text/css">
                <link rel="stylesheet" href="css/elegant-icons.css" type="text/css">
                <link rel="stylesheet" href="css/owl.carousel.min.css" type="text/css">
                <link rel="stylesheet" href="css/slicknav.min.css" type="text/css">
                <link rel="stylesheet" href="css/style.css" type="text/css">
            
            </head>
            
            <body>
                <!-- Page Preloder -->
                <div id="preloder">
                    <div class="loader"></div>
                </div>
            
                <!-- Header Section Begin -->
                <header class="header">
                    <div class="header__top">
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-8 col-md-10 order-md-2 order-3">
                                    <nav class="header__menu">
                                        <ul>
                                            <li><a href="./index.html">Home</a></li>
                                            <li><a href="#">News</a></li>
                                            <li><a href="./weather.html">Weather</a></li>
                                            <li><a href="#">Blog</a></li>
                                            <li><a href="./about.html">About</a></li>
                                            <li><a href="./contact.html">Contact</a></li>
                                        </ul>
                                    </nav>
                                </div>
                                <div class="col-lg-2 col-md-1 col-6 order-md-3 order-2">
                                    <div class="header__search">
                                        <i class="fa fa-search search-switch"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-3 col-md-3">
                                <div class="header__btn">
                                    <a href="./signin.html" class="primary-btn">Subscribe</a>
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <div class="header__logo">
                                    <h1>Weather</h1>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-3 col-md-2">
                                <div class="header__social">
                                    <a href="#"><i class="fa fa-facebook"></i></a>
                                    <a href="#"><i class="fa fa-twitter"></i></a>
                                    <a href="#"><i class="fa fa-youtube-play"></i></a>
                                    <a href="#"><i class="fa fa-instagram"></i></a>
                                    <a href="#"><i class="fa fa-envelope-o"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <!-- Header Section End -->
            
                <!-- Single Post Section Begin -->
                    <section class="single-post spad">
                        <div class="single-post__hero set-bg" data-setbg="images/single-post-hero.jpg"></div>
                        <div class="container">
                            <div class="row d-flex justify-content-center">
                                <div class="col-lg-8">
                                    <div class="single-post__title">
                                        <div class="single-post__title__meta">
                                            <h2>29</h2>
                                            <span>June</span>
                                        </div>
                                        <div class="single-post__title__text">
                                            <ul class="label">
                                                <li>Weather</li>
                                            </ul>
                                            <h4>Weather</h4>
                                            <ul class="widget">
                                                <li>by Tommy</li>
                                                <li>3 min read</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="single-post__social__item">
                                        <ul>
                                            <li><a href="#"><i class="fa fa-facebook"></i></a></li>
                                            <li><a href="#"><i class="fa fa-twitter"></i></a></li>
                                            <li><a href="#"><i class="fa fa-instagram"></i></a></li>
                                            <li><a href="#"><i class="fa fa-youtube-play"></i></a></li>
                                        </ul>
                                    </div>
                                    <div class="single-post__top__text">
                                        <p>Weather is the state of the atmosphere, including temperature, atmospheric pressure,
                                            wind,
                                            humidity, precipitation, and cloud cover. It differs from climate, which is all weather
                                            conditions for a particular location averaged over about 30 years.</p>
                                    </div>
            
                                    <div class="single-post__leave__comment">
                                        <div class="widget__title">
                                            <h4>Search a City Temperature</h4>
                                        </div>
                                        <form action="/weather" method="POST">
                                            <textarea placeholder="Enter city name" name="cityName" id="cityInput" spellcheck="false"></textarea>          
                                            <button type="submit" class="site-btn">Submit</button>
                                        </form>
                                    </div>
            
                                    <div class="single-post__top__text" style="text-align: center;">
                                        <img src="images/clear.png" class="weather-icon">
                                    </div>
                                    <div class="single-post__recipe__details">
                                        <div class="single-post__recipe__details__option">
                                            <ul>
                                                <li>
                                                    <h5><i class="fa fa-globe"></i> Country</h5>
                                                    <span>${weatherInfo.city}</span>
                                                </li>
                                                <li>
                                                    <h5><i class="fa fa-thermometer-full"></i> Temperature</h5>
                                                    <span>${weatherInfo.temp}</span>
                                                </li>
                                                <li>
                                                    <h5><i class="fa fa-tint"></i> Humidity</h5>
                                                    <span>${weatherInfo.humidity}</span>
                                                </li>
                                                <li>
                                                    <h5><i class="fa fa-cloud"></i> Wind Speed</h5>
                                                    <span>${weatherInfo.windSpeed}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="single-post__quote">
                                        <p>I have seen many storms in my life. Most storms have caught me by surprise, so I had
                                            to learn very quickly to look further and understand that I am not capable of
                                            controlling the weather, to exercise the art of patience and to respect the fury of
                                            nature.</p>
                                        <span>Paula Coelho</span>
                                    </div>
                                    <div class="single-post__tags">
                                        <a href="#">Weather</a>
                                        <a href="#">Humidity</a>
                                        <a href="#">City</a>
                                        <a href="#">Wind Speed</a>
                                    </div>
                                    <div class="single-post__author__profile">
                                        <div class="single-post__author__profile__pic">
                                            <img src="img/categories/single-post/author-profile.jpg" alt="">
                                        </div>
                                        <div class="single-post__author__profile__text">
                                            <h4>Jim Cantore</h4>
                                            <p>Part of The Weather Channel for over 35 years, Jim Cantore is a famous on-air
                                                personality for all things weather.</p>
                                            <div class="single-post__author__profile__social">
                                                <a href="#"><i class="fa fa-facebook"></i></a>
                                                <a href="#"><i class="fa fa-twitter"></i></a>
                                                <a href="#"><i class="fa fa-google-plus"></i></a>
                                                <a href="#"><i class="fa fa-instagram"></i></a>
                                                <a href="#"><i class="fa fa-youtube-play"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <!-- Single Post Section End -->
            
                    <!-- Footer Section Begin -->
                    <footer class="footer">
                        <div class="container-fluid">
                            <div class="footer__instagram">
                                <div class="footer__instagram__avatar">
                                    <div class="footer__instagram__avatar--pic">
                                        <img src="images/instagram-avatar.png" alt="">
                                    </div>
                                    <div class="footer__instagram__avatar--text">
                                        <h5>@weatherblog </h5>
                                        <span>23,7k follower</span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-1.jpg"></div>
                                    </div>
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-2.jpg"></div>
                                    </div>
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-3.jpg"></div>
                                    </div>
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-4.jpg"></div>
                                    </div>
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-5.jpg"></div>
                                    </div>
                                    <div class="col-lg-2 col-md-2 col-sm-4 col-6">
                                        <div class="footer__instagram__item set-bg" data-setbg="images/ip-6.jpg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="footer__text">
                                        <div class="footer__logo">
                                            <h1>Weather</h1>
                                        </div>
                                        <p>Weather is the state of the atmosphere, describing for example the degree to which it is hot or cold, wet or dry, calm or stormy, clear or cloudy. On Earth, most weather phenomena occur in the lowest layer of the planet's atmosphere, the troposphere, just below the stratosphere. Weather refers to day-to-day temperature, precipitation, and other atmospheric conditions, whereas climate is the term for the averaging of atmospheric conditions over longer periods of time. When used without qualification, "weather" is generally understood to mean the weather of Earth.</p>
                                        <div class="footer__social">
                                            <a href="#"><i class="fa fa-facebook"></i></a>
                                            <a href="#"><i class="fa fa-twitter"></i></a>
                                            <a href="#"><i class="fa fa-instagram"></i></a>
                                            <a href="#"><i class="fa fa-youtube-play"></i></a>
                                            <a href="#"><i class="fa fa-envelope-o"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                <!-- Footer Section End -->
            
                <!-- Search Begin -->
                <div class="search-model">
                    <div class="h-100 d-flex align-items-center justify-content-center">
                        <div class="search-close-switch">+</div>
                        <form class="search-model-form">
                            <input type="text" id="search-input" placeholder="Search here.....">
                        </form>
                    </div>
                </div>
                <!-- Search End -->

                <!-- Js Plugins -->
    <script src="js/jquery-3.3.1.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/jquery.slicknav.js"></script>
    <script src="js/owl.carousel.min.js"></script>
    <script src="js/main.js"></script>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            fetchWeatherData()
                .then(data => {
                    updateWeatherData(data);
                })
                .catch(error => {
                    console.error(error);
                });
        });

        async function fetchWeatherData() {
            try {
                const response = await fetch("/weather");
                const data = await response.json();
                return data;
            } catch (error) {
                throw new Error("Failed to fetch weather data");
            }
        }

        function updateWeatherData(data) {
            const cityElement = document.getElementById("city");
            const tempElement = document.getElementById("temp");
            const humidityElement = document.getElementById("humidity");
            const windSpeedElement = document.getElementById("speed");

            cityElement.textContent = data.city;
            tempElement.textContent = data.temp;
            humidityElement.textContent = data.humidity;
            windSpeedElement.textContent = data.windSpeed;
        }

    </script>

                    <script>
                        const weatherIcon = document.querySelector(".weather-icon");
                        const weatherMain = "${weatherInfo.weatherMain}";

                        const weatherIcons = {
                            Clouds: "images/clouds.png",
                            Clear: "images/clear.png",
                            Rain: "images/rain.png",
                            Drizzle: "images/drizzle.png",
                            Mist: "images/mist.png"
                        };

                        if (weatherMain in weatherIcons) {
                            weatherIcon.src = weatherIcons[weatherMain];
                        }
                    </script>
                </body>
                </html>
            `;

            res.send(htmlContent); // Send the combined HTML and CSS content as the response
        });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
