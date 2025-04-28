const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const {constants} = require('fs/promises');
const router = express.Router();

router.post('/register', async (req, res) => {
  const {userName, userPassword} = req.body;
  const hashPassword = await bcrypt.hash(userPassword, 10);

  try {
    const result = await pool.query('insert into users (username, userpassword) values ($1, $2) returning userid', [userName, hashPassword]);
    res.status(201).json({userid: result.rows[0].userid});
  } catch (error) {
    res.status(500).json({message: 'Error! User cannot get register'});
  }
});

router.post('/login', async (req, res) => {
  const {userName, userPassword} = req.body;

  try {
    const result = await pool.query('select * from users where username = $1', [userName]);
    if (result.rows.length === 0) {
      return res.status(400).json({message: 'The request user cannot be found'});
    }    
    const authPassword = await bcrypt.compare(userPassword, result.rows[0].userpassword);
    if (!authPassword) {
      return res.status(400).json({message: 'Invalid credentials found.'});
    }
    const token = jwt.sign({userid: result.rows[0].userid}, process.env.JWT_SECRET);
    res.json({token});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
