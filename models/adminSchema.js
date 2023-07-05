const mongoose = require('mongoose');

const schema = mongoose.Schema;
const adminSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})

module.exports = mongoose.model('admin',adminSchema)