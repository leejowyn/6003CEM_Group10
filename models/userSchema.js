const mongoose = require('mongoose');

const schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    author_id:{
        type:String,
        required:true
    },
})

module.exports = mongoose.model('user',userSchema)