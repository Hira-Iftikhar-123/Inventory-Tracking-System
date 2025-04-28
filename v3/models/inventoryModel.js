const {writePool, readPool} = require('../db/db');
const {sendInventoryEvent} = require('../queues/queue');
const {invalidateCache} = require('../utils/cache');
const {addAuditLog} = require('../utils/auditLogs');

async function updateInventory(storeId, productId, quantityChange, userId, logDetails) 
{
  const client = await writePool.connect();
  try {
    await client.query('begin');
    const result = await client.query(`update inventory set stock_quantity = stock_quantity + $1, last_updated = current_timestamp, log_details = $2 where storeid = $3 and productid = $4 returning *`, [quantityChange, logDetails, storeId, productId]);

    if (result.rows.length === 0) 
    {
      const insertResult = await client.query(`insert into inventory (storeid, productid, stock_quantity, log_details) values ($1, $2, $3, $4) returning *`, [storeId, productId, quantityChange, logDetails]);
      await sendInventoryEvent({storeId, productId, newQuantity: insertResult.rows[0].stock_quantity, timestamp: new Date()});
      await addAuditLog(storeId, productId, 'create', quantityChange, userId);
      await client.query('commit');

      return insertResult.rows[0];
    }
    await sendInventoryEvent({storeId, productId, newQuantity: result.rows[0].stock_quantity, timestamp: new Date()});
    invalidateCache(`inventory_${storeId}_${productId}`);
    await addAuditLog(storeId, productId, 'update', quantityChange, userId); 
    await client.query('commit');
    
    return result.rows[0];
  } 
  catch (error) {
    await client.query('rollback');
    throw error;
  } 
  finally {
    client.release();
  }
}

async function getInventory(storeId, productId) 
{
  const cached = await getProductFromCache(`inventory_${storeId}_${productId}`);
  if (cached) return JSON.parse(cached);
  const result = await readPool.query(`select i.*, p.productname, p.productprice, s.storename from inventory i join products p on i.productid = p.productid join stores s on i.storeid = s.storeid where i.storeid = $1 and i.productid = $2`, [storeId, productId]);

  if (result.rows.length > 0) 
  {
    await setProductToCache(`inventory_${storeId}_${productId}`, JSON.stringify(result.rows[0]));
    return result.rows[0];
  }
  return null;
}

module.exports = {updateInventory,getInventory};