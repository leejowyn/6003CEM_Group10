const express = require("express");
const axios = require("axios");
const moment = require('moment');
const blogBookmarkSchema = require('../models/blogBookmarkSchema');
const blogRouter = express.Router();


const blog_id = "123155698763";
// API token and headers
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


// Get blog article list
blogRouter.get("/", (req, res) => {
    var url = `https://api.hubapi.com/content/api/v2/blog-posts?limit=300`;
    const filterKeyword = req.query.keyword;
    const filterCategory = req.query.category;
    var filterOrderBy;

    // sort
    if (req.query.order_by == "ascending") {
        filterOrderBy = "ascending";
        url = url + `&order_by=created`;
    }
    else {
        filterOrderBy = "descending";
        url = url + `&order_by=-created`;
    }

    axios
    .get(url, { headers: headers })
    .then(function (response) {
        var articles = response.data.objects;

        // filter keyword
        if (typeof filterKeyword !== 'undefined' && filterKeyword != "") {
            articles = articles.filter(article => {
                const nameMatch = article.name && article.name.includes(filterKeyword);
                const contentMatch = article.post_body && article.post_body.includes(filterKeyword);
                const summaryMatch = article.post_summary && article.post_summary.includes(filterKeyword);
                return nameMatch || contentMatch || summaryMatch;
            });
        }

        // filter category
        if (typeof filterCategory !== 'undefined' && filterCategory != "" && filterCategory != "all") {
            const topic_id = Object.entries(topics).find(([id, name]) => name === filterCategory)[0];
            articles = articles.filter(article => article.topic_ids[0] == topic_id);
        }

        res.render("blog_articles", { error: false, articles, topics, moment, filterKeyword, filterOrderBy, filterCategory, user_id: res.locals.userId });
    })
    .catch(function (err) {
        console.log(err);
        res.render("blog_articles", { error: true, errorMsg: "Failed to load blog article.", user_id: res.locals.userId });
    });
});


// Get single blog article
blogRouter.get("/article/:id", (req, res) => {
    const user_id = res.locals.userId;
    const article_id = req.params.id;
    const url = `https://api.hubapi.com/content/api/v2/blog-posts/${article_id}`;
    var isBookmark = false;

    axios
    .get(url, { headers: headers })
    .then(function (response) {
        // check if user bookmark
        blogBookmarkSchema
        .findOne({ user_id, article_id: article_id })
        .then(record => {
            if (record) isBookmark = true;
            res.render("blog_article", { error: false, article: response.data, topics, moment, isBookmark, user_id });
        })
        .catch(err => {
            res.render("blog_article", { error: true, article: response.data, topics, moment, isBookmark, errorMsg: "Failed to retrieve bookmark.", user_id });
        });
    })
    .catch(function (err) {
        res.render("404");
        // res.render("blog_article", { error: true, errorMsg: "Failed to load article.", user_id});
    });
});


// Bookmark blog article
blogRouter.post("/bookmark", (req, res) => {
    const article_id = req.body.article_id;
    const save = req.body.save;

    const bookmarkData = new blogBookmarkSchema({
        user_id: res.locals.userId,
        article_id: article_id
    })

    if (save) {
        // save this bookmark in database
        bookmarkData
        .save()
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        // delete this bookmark from database
        blogBookmarkSchema
        .deleteOne({ user_id: res.locals.userId, article_id: article_id })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((error) => {
            res.sendStatus(500); 
        });
    }
});


// Get all bookmarked article by user
blogRouter.get("/my_bookmarks", async (req, res) => {
    if (!res.locals.userId) {
        res.redirect('/auth');
    } 
    else {
        try {
            const user_id = res.locals.userId;
            const records = await blogBookmarkSchema.find({ user_id });
            const article_ids = records.map(record => record.article_id);
    
            const url = "https://api.hubapi.com/content/api/v2/blog-posts/";
            const promises = article_ids.map(article_id => axios.get(url + article_id, { headers: headers }));
    
            const results = await Promise.all(promises);
            const bookmarked_articles = results.map(result => result.data);
    
            res.render("my_bookmarks", { error: false, articles: bookmarked_articles, topics, moment, user_id });
        } catch (error) {
            res.render("my_bookmarks", { error: true, errorMsg: "Failed to load bookmarked articles. " + error, user_id: res.locals.userId });
        }
    }
});
  

// Get blog article list by author
blogRouter.get("/my_blog_articles", (req, res) => {
    if (!res.locals.userId) {
        res.redirect('/auth');
    }
    else {
        const author_id = res.locals.authorId;
        const url = `https://api.hubapi.com/content/api/v2/blog-posts?blog_author_id=${author_id}&limit=300&order_by=-created`;
    
        axios
        .get(url, { headers: headers })
        .then(function (response) {
            res.render("my_blog_articles", { error: false, articles: response.data.objects, topics, moment, user_id: res.locals.userId });
        })
        .catch(function (err) {
            res.render("my_blog_articles", { error: true, errorMsg: "Failed to load blog article.", user_id: res.locals.userId });
        });
    }
});


// Create blog article form
blogRouter.get("/add", (req, res) => {
    if (!res.locals.userId)
        res.redirect('/auth');
    else 
        res.render("add_blog_article", { error: false, user_id: res.locals.userId }); 
});


// Create blog article
blogRouter.post("/add", (req, res) => {
    // get topic id
    const topic_id = Object.entries(topics).find(([id, name]) => name === req.body.category)[0];

    var config = {
        method: 'post',
        url: 'https://api.hubapi.com/content/api/v2/blog-posts',
        headers: headers,
        data: {
            name: req.body.title,
            content_group_id: blog_id,
            post_body: req.body.content,
            post_summary: req.body.summary,
            topic_ids: [topic_id],
            blog_author_id: res.locals.authorId
        }
    };
        
    axios(config)
    .then(function (response2) {
        res.redirect("./my_blog_articles");
    })
    .catch(function (err2) {
        res.render("add_blog_article", { error: true, errorMsg: "Failed to create blog article.", user_id: res.locals.userId });
    });

});


// Edit blog article form
blogRouter.get("/edit/:id", (req, res) => {
    const article_id = req.params.id;
    const url = `https://api.hubapi.com/content/api/v2/blog-posts/${article_id}`;

    axios
    .get(url, { headers: headers })
    .then(function (response) {
        if (response.data.blog_post_author.id != res.locals.authorId) {
            res.render("403");
        }
        else {
            const messageDetails = {
                message: "",
            };
            res.render("edit_blog_article", { error: false, messageDetails, article: response.data, topics, moment, user_id: res.locals.userId });
        }
    })
    .catch(function (err) {
        console.log(err);
        res.render("404");
        // const messageDetails = {
        //     message: "Failed to load article.",
        //     errorType: "load"
        // };
        // res.render("edit_blog_article", { error: true, messageDetails, user_id: res.locals.userId });
    });
});


// Edit blog article
blogRouter.post("/edit/:id", (req, res) => {
    const article_id = req.params.id;
    const topic_id = req.body.category;

    const config = {
        method: 'put',
        url: `https://api.hubapi.com/content/api/v2/blog-posts/${article_id}`,
        headers: headers,
        data: {
            name: req.body.title,
            post_body: req.body.content,
            post_summary: req.body.summary,
            topic_ids: [topic_id]
        }
    };

    const article = {
        id: article_id,
        name: req.body.title,
        post_body: req.body.content,
        post_summary: req.body.summary,
        topic_ids: [topic_id]
    };
        
    axios(config)
    .then(function (response) {
        const messageDetails = {
            message: "Article has been successfully updated."
        };
        res.render("edit_blog_article", { error: false, messageDetails, article, topics, user_id: res.locals.userId });
    })
    .catch(function (err) {
        const messageDetails = {
            message: "Failed to update article.",
            errorType: "update"
        };
        res.render("edit_blog_article", { error: true, messageDetails, article, topics, user_id: res.locals.userId });
    });
});


// Delete blog article
blogRouter.post("/delete", (req, res) => {
    const article_id = req.body.article_id;
    const url = `https://api.hubapi.com/content/api/v2/blog-posts/${article_id}`;

    axios
    .delete(url, { headers: headers })
    .then(function (response) {
        // delete all bookmark of this article from database
        blogBookmarkSchema
        .deleteOne({ article_id: article_id })
        .then(() => {
            res.sendStatus(204);
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500); 
        });
    })
    .catch(function (err) {
        res.status(500); // Send an error response back to the client
    });
});

module.exports = blogRouter;
