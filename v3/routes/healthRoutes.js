const express = require('express');
const router = express.Router();
const {readPool,writePool} = require('../db/db');
const cacheClient = require('../utils/cache');

router.get('/health', async (req, res) => {
  try {
    await Promise.all([
      readPool.query('SELECT 1'),
      writePool.query('SELECT 1')]);
    await cacheClient.ping();
    
    res.status(200).json({status:'healthy'});
  } 
  catch (error) {
    res.status(500).json({status:'unhealthy',error:error.message});
  }
});

module.exports = router;