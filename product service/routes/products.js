const Product = require('../models/product');
const express = require('express');
//const { Category } = require();
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
require("dotenv/config");


const GATEWAY_URL = process.env.GATEWAY_URL;


router.get('/', async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        const categoryNames = req.query.categories.split(',');
        filter = { search: { $in: categoryNames } };
    }
    const productList = await Product.find(filter).lean();
    if (!productList) {
        res.status(500).send("erreur lors de la récupération des produits");
    }
    const populatedProducts = await Promise.all(productList.map(async product => {
        const categoryResponse = await axios.get(`${GATEWAY_URL}/categories/${product.category}`);
        const categoryData = categoryResponse.data;
        return {
            ...product,
            category: categoryData,
        };
    }));
    res.send(populatedProducts);
});


router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Produit non trouvée !");
        }
        const categoryResponse = await axios.get(`${GATEWAY_URL}/categories/${product.category}`);
        const category = categoryResponse.data;
        const populatedProduct = {
            ...product.toObject(),
            category
        };
        res.json(populatedProduct);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { name, description, brand, price, countInStock, isFeatured, category } = req.body;
        const categoryResponse = await axios.get(`${GATEWAY_URL}/categories/${category}`)
        const categoryData = categoryResponse.data;
        const product = new Product({
            name,
            description,
            brand,
            price,
            countInStock,
            isFeatured,
            category: categoryData._id,
            search: categoryData.name
        });
        const savedProduct = await product.save();
        if (!savedProduct) {
            return res.status(500).send("Produit non enregistré")
        }
        return res.status(201).json(savedProduct);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, brand, price, countInStock, isFeatured, category } = req.body;
        const categoryResponse = await axios.get(`${GATEWAY_URL}/categories/${category}`);
        if (!categoryResponse.data) {
            return res.status(400).send("Catégorie non trouvée");
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                brand,
                price,
                countInStock,
                isFeatured,
                category: categoryResponse.data._id,
                search: categoryResponse.data.name
            },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(500).send("Produit non mis à jour");
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'produit supprimé !'
                });
            } else {
                return res.status(404).send("Produit non trouvée !");
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});


router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments()
    if (!productCount) {
        return res.status(500).json({ success: false })
    }
    res.send({
        count: productCount
    })
})


router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const featured = await Product.find({ isFeatured: true })
    if (!featured) {
        res.return(500).json({ success: false })
    }
    res.send(featured)
})


module.exports = router;
