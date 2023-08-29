const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true, },
    description: { type: String, required: true },
    image: { type: String },
    brand: { type: String, default: '' },
    price: { type: Number, default: 0 },
    //category: {type: mongoose.Schema.Types.ObjectId,ref: 'Category',required:true},
    countInStock: { type: Number, required: true, min: 0, max: 255 },
    category: { type: String },
    isFeatured: { type: Boolean, default: false, },
    search: { type: String },
    dateCreated: { type: Date, default: Date.now, },
}, { versionKey: false });


module.exports = mongoose.model('Product', productSchema);
