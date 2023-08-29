const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');
    if(!userList) {
        res.status(500).json({success: false});
    } 
    res.send(userList);
})


router.get('/:id', (req,res)=>{
    User.findById(req.params.id).select('-passwordHash').then(user =>{
        if(user) {
            return res.status(200).send(user);
        } else {
            return res.status(404).send("Utilisateur non trouvée !");
        }
    }).catch(err=>{
    return res.status(500).send("vérifier l'id de l'utilisateur !");
    })  
})


const secret = process.env.secret;
router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10), 
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        adresse: req.body.adresse,
    })
    user = await user.save();
    if(!user){
        return res.status(400).send("Impossible de créer l'utilisateur !");
    }
    
    res.send(user);
})


router.put('/:id',async (req, res)=> {
    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: req.body.passwordHash,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            adresse: req.body.adresse,
        },
        {new: true}
    )
    if(!user){
        return res.status(400).send("Impossible de mettre à jour l'utilisateur");
    }
    res.send(user);
})


router.post('/login',async(req,res)=>{
    const user = await User.findOne({email :req.body.email})
    if(!user) {
        return res.status(400).send("Utilisateur non trouvé !");
    }
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAadmin
            },
            'secret',
            {expiresIn:'1d'}
        )
        res.status(200).send({user:user.email,token:token});
    }else{
        res.status(400).send("Mot de passe incorrect !");
    }
})


router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        adresse: req.body.adresse,
    })
    user = await user.save();
    if(!user)
    return res.status(400).send("Impossible de créer l'utilisateur");
    res.send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).send("Utilisateur supprimé !");
        } else {
            return res.status(404).send("Utilisateur non trouvé !");
        }
    }).catch(err=>{
        return res.status(500).send("vérifier l'id de l'utilisateur");
    })
})


module.exports =router;