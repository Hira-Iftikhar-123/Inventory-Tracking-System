const express = require('express');
const router = express.Router();
const {writePool} = require('../db/db');
const {rateLimiter} = require('../middleware/rateLimiter');
const {addAuditLog} = require('../utils/auditLogs');
const {sendInventoryEvent, invalidateCache} = require('../utils/cache');

router.put('/:storeId/products/:productId', rateLimiter, async (req, res) => {
  const client = await writePool.connect();
  try {
    const {storeId, productId} = req.params;
    const {quantityChange, userId, logDetails} = req.body;

    await client.query('begin');
    const result = await client.query(`update inventory set stock_quantity = stock_quantity + $1, last_updated = now(), log_details = $2 where storeid = $3 and productid = $4 returning *`, [quantityChange, logDetails, storeId, productId]);

    if (result.rows.length === 0) {
      throw new Error('Inventory record not found');
    }

    await addAuditLog(storeId, productId, quantityChange >= 0 ? 'RESTOCK' : 'SALE', quantityChange, userId);
    await sendInventoryEvent({storeId, productId, newQuantity: result.rows[0].stock_quantity, change: quantityChange, timestamp: new Date()});
    invalidateCache(`store_${storeId}_inventory`);
    invalidateCache(`inventory_${storeId}_${productId}`);

    await client.query('commit');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('rollback');
    res.status(500).json({error: error.message});
  } finally {
    client.release();
  }
});

router.get('/:storeId/products/:productId', rateLimiter, async (req, res) => {
  try {
    const {storeId, productId} = req.params;
    const cacheKey = `inventory_${storeId}_${productId}`;
    
    const cached = await getProductFromCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await readPool.query(`select i.*, p.productname, p.productprice, s.storename from inventory i join products p on i.productid = p.productid join stores s on i.storeid = s.storeid where i.storeid = $1 and i.productid = $2`, [storeId, productId]);

    if (result.rows.length > 0) {
      await setProductToCache(cacheKey, JSON.stringify(result.rows[0]), 600);
      res.json(result.rows[0]);
    } else {
      res.status(404).json({error: 'Inventory record not found'});
    }
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
