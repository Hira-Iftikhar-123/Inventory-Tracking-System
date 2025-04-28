const {writePool} = require('../db/db');

async function addAuditLog(storeId, productId, action, quantityChange, performedBy) 
{
  try 
  {
    await writePool.query(`INSERT INTO audit_logs (store_id, product_id, action, quantity_change, performed_by) VALUES ($1, $2, $3, $4, $5)`,[storeId,productId,action,quantityChange,performedBy]);
  } 
  catch (error) {
    console.error('Error logging audit:', error);
    throw error;
  }
}

module.exports = {addAuditLog};