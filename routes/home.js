const express = require('express');
const axios = require("axios");
const moment = require('moment');
const homeRouter = express.Router();

const token = "pat-na1-302e381a-bf1d-40dd-9617-d0fe505ab967";
const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json'
};

// Get blog topics
const topics = {};
axios
.get('https://api.hubapi.com/blogs/v3/topics', { headers: headers })
.then(function (response) {
    response.data.objects.forEach(topic => {
        topics[topic.id] = topic.name;
    });
})
.catch(function (error) {
    console.log(error);
});


homeRouter.get('/', (req, res) => {
    // get latest blog article
    var url = `https://api.hubapi.com/content/api/v2/blog-posts?limit=10&order_by=-created`;

    axios
    .get(url, { headers: headers })
    .then(function (response) {
        var articles = response.data.objects;
        res.render("index", { error: false, articles, topics, moment });
    })
    .catch(function (err) {
        console.log(err);
        res.render("index", { error: true, errorMsg: "Fail to load blog articles." });
    });
});

module.exports = homeRouter;
