const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    orderItems: [{ type: String }],
    shippingAddress: { type: String },
    phone: { type: String },
    status: { type: String, required: true, default: 'Pending' },
    totalPrice: { type: Number },
    user: { type: String },
    dateOrdered: { type: Date, default: Date.now }
})


module.exports = mongoose.model('Order', orderSchema);
