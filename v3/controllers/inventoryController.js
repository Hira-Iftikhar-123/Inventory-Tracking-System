const {getProductFromCache,setProductToCache} = require('../utils/cache');
const {addAuditLog} = require('../utils/auditLogs');
const {addInventoryUpdateJob} = require('../queues/queue');
const {readPool} = require('../db/db');

async function getProductDetails(req, res) 
{
  const productId = req.params.id;

  let product = await getProductFromCache(`product:${productId}`);
  if (!product) 
  {
    const result = await readPool.query('SELECT * FROM products WHERE productID = $1', [productId]);
    product = result.rows[0];

    if (product) 
    {
      setProductToCache(`product:${productId}`, JSON.stringify(product));
    }
  }

  res.json(product || { message: 'Product not found' });
}

async function updateInventory(req, res) 
{
  const {storeId,productId,quantity} = req.body;
  const userId = req.user.userId;

  try {
    await addInventoryUpdateJob(storeId,productId,quantity,userId);
    await addAuditLog(storeId,productId,'Update Inventory',quantity,userId);
    
    res.status(202).json({ message: 'Inventory update queued successfully' });
  } 
  catch (error) {
    res.status(500).json({ message: 'Failed to queue inventory update' });
  }
}

module.exports = { getProductDetails, updateInventory };
