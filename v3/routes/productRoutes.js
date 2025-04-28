const express = require('express');
const router = express.Router();
const {writePool, readPool} = require('../db/db');
const {rateLimiter} = require('../middleware/rateLimiter');
const {getProductFromCache, setProductToCache, invalidateCache} = require('../utils/cache');

router.post('/', rateLimiter, async (req, res) => {
  try {
    const {productName, productPrice} = req.body;
    const result = await writePool.query('insert into products (productname, productprice) values ($1, $2) returning *', [productName, productPrice]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.get('/', rateLimiter, async (req, res) => {
  try {
    const cacheKey = 'all_products';
    const cached = await getProductFromCache(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await readPool.query('select * from products order by productid');
    await setProductToCache(cacheKey, JSON.stringify(result.rows), 3600);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.put('/:productId', rateLimiter, async (req, res) => {
  try {
    const {productId} = req.params;
    const {productName, productPrice} = req.body;
    
    const result = await writePool.query('update products set productname = $1, productprice = $2 where productid = $3 returning *', [productName, productPrice, productId]);
    
    invalidateCache('all_products');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
