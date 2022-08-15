const router = require("express").Router();
const User = require("../model/user-model");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require('express-validator');

//VALIDATION RULES

var validateUser = [
check('email', ' Email Address not valid').isEmail().trim().escape().normalizeEmail(),
 
check('password').isLength({ min: 6 })
.withMessage('Password Must Be at Least 6 Characters')
.matches('[0-9]').withMessage('Password Must Contain a Number')
.matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
.trim().escape(),


check('username').isLength({ min: 5 })
.withMessage('username Must Be at Least 5 Characters')
.matches('[A-Z]').withMessage('Username Must Contain an Uppercase Letter')
.trim().escape()
];



//REGISTER
router.post("/register", validateUser, async(req, res) => {
    
    //create a user object to hold the data
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJs.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),

    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
        }
        else 
 {
   
    try{

    //save function is gonnna save this user to our database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    }catch(err) {
        res.status(500).json(err) 
    };

  }     
    
});


//LOGIN
router.post("/login", validateUser, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
        }
        else 
 {
    try{
        
        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Wrong Credentials");
        
        /*const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const password = hashedPassword.toString(CryptoJs.enc.Utf8);
        console.log("user loged in");
        password !== req.body.password && res.status(401).json("Wrong credentials");
        */
        //console.log("user loged in");
    const accessToken = jwt.sign(
        {
            id: user._id,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        {expiresIn:"3d"}
    );   

    //console.log("user loged in");
    const {password, ...others } = user._doc;

    res.status(200).json({...others, accessToken});
    //console.log("user loged in");
    
    } catch(err) {
        res.status(500).json(err);
    }
 }
});

module.exports = router