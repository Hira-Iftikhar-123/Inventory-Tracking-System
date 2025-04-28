const {addInventoryUpdateJob} = require('../queues/queue');
const {addAuditLog} = require('../utils/auditLogs'); 

async function handleInventoryUpdate(storeId, productId, quantity, userId) {
  try {
    await addInventoryUpdateJob(storeId,productId,quantity,userId);
    await addAuditLog(storeId, productId, 'Inventory Update',quantity,userId);

  } 
  catch (error) {
    console.error("Error! handling inventory update:",error);
    throw new Error('Inventory update job failed');
  }
}
module.exports = {handleInventoryUpdate};
