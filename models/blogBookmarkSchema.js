const mongoose = require('mongoose');

const blogBookmarkSchema = new mongoose.Schema({
    user_id: {
        type:String,
        required:true
    },
    article_id: {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('blog_bookmark',blogBookmarkSchema)