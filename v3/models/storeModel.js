const {pool} = require('../db/db');

async function createStore(storeName, storeLocation) 
{
  const result = await pool.query('insert into stores (storename, storelocation) values ($1, $2) returning *', [storeName, storeLocation]);
  return result.rows[0];
}

async function getStoreById(storeId) 
{
  const result = await pool.query('select * from stores where storeid = $1', [storeId]);
  return result.rows[0];
}

async function getAllStores() 
{
  const result = await pool.query('select * from stores');
  return result.rows;
}

module.exports = {createStore, getStoreById, getAllStores};
