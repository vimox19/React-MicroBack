const mongoose = require('mongoose');


const orderItemSchema = mongoose.Schema({
    quantity: { type: Number },
    product: { type: String }
})


module.exports = mongoose.model('OrderItem', orderItemSchema);

