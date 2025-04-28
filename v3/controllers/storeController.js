const inventoryModel = require('../models/inventoryModel');
const {rateLimiter} = require('../middleware/rateLimiter');

async function updateStock(req, res) 
{
  try {
    const {storeId,productId} = req.params;
    const {quantityChange,userId,logDetails} = req.body;
    const updatedInventory = await inventoryModel.updateInventory(storeId,productId,quantityChange,userId,logDetails);
    
    res.json({
      success: true,
      data: updatedInventory
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getStock(req, res) 
{
  try {
    const { storeId, productId } = req.params;
    const inventory = await inventoryModel.getInventory(storeId, productId);
    
    if (!inventory) 
    {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    } 
    res.json({
      success: true,
      data: inventory
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
module.exports = {updateStock:[rateLimiter, updateStock],getStock
};