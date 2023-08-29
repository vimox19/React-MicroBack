const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    adresse: { type: String }

});


module.exports = mongoose.model('User', userSchema);
