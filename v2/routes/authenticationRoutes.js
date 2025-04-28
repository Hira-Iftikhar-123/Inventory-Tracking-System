const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { constants } = require('fs/promises');
const router = express.Router();

router.post('/register',async(req,res) => {
    const {userName,userPassword} = req.body;
    const hashPassword = await bcrypt.hash(userPassword,10);

    try {
        const result = await pool.query('INSERT into users(userName,userPassword) VALUES ($1,$2) returning userID',[userName,hashPassword]);
        res.status(201).json({userid:result.rows[0].userID});
    }
    catch(error)
    {
        res.status(500).json({message:'Error!User cannot get register'});
    }
});

router.post('/login',async(req,res) => {
    const {userName,userPassword} = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE userName = $1", [userName]);
        if(result.rows.length===0)
        {
            return res.status(400).json({message:'The request user cannot be found'});
        }    
        // console.log(result.rows[0].userpassword);
        const authPassword = await bcrypt.compare(userPassword,result.rows[0].userpassword);
        if(!authPassword) 
        {
            return res.status(400).json({message:'Invalid credentinals found.'});
        }
        const Token = jwt.sign({ userid: result.rows[0].userID }, process.env.JWT_SECRET);
        // console.log(process.env.JWT_SECRET);
        res.json({Token});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
});

module.exports = router;