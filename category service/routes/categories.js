const Category = require('../models/category');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();
    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})


router.get('/:id', (req,res)=>{
    Category.findById(req.params.id).then(category =>{
        if(category) {
            return res.status(200).send(category);
        } else {
            return res.status(404).send("Catégorie non trouvée !")
        }
    }).catch(err=>{
    return res.status(500).send("vérifier l'id de la catégorie")
    })  
})


router.post('/', async (req,res)=>{
    let category = new Category({
        name: req.body.name,
    })
    category = await category.save();
    if(!category)
    return res.status(400).send('Impossible de créer la catégorie !')
    res.send(category);
})


router.put('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name
        },
        {new: true}
    )
    if(!category)
    return res.status(400).send('Impossible de mettre à jour la catégorie !')
    res.send(category);
})


router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).send('Catégorie a été supprimé !');
        } else {
            return res.status(404).send('Catégorie non trouvée !');
        }
    }).catch((err) => {
        return res.status(500).send("vérifier l'id de la catégorie")
    });
});


module.exports = router;

















//const express = require('express');
//const router = express.Router();
//const Category = require('../models/category');
//
//router.get('/', async (req, res) => {
//    const categoryList = await Category.find();
//
//    if(!categoryList){
//        res.status(500).json({success:false});
//    }
//    res.send(categoryList);
//});
//
//
//router.post('/', (req, res) => {
//const category = new Category({
//    name: req.body.name,
//    image: req.body.image,
//    countInStock: req.body.countInStock,
//});
//
//category.save().then((createdCategory) => {
//
//    res.status(201).json(createdCategory);
//
//}).catch((err) => {
//    res.status(500).json({
//        error: err,
//        success: false,
//});
//});
//
//res.send(category);
//});
//
//
//module.exports = router;