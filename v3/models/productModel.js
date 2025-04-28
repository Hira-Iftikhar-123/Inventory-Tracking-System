const {pool} = require('../db/db');

async function createProduct(productName, productPrice) 
{
  const result = await pool.query('insert into products (productname, productprice) values ($1, $2) returning *', [productName, productPrice]);
  return result.rows[0];
}

async function getProductById(productId) 
{
  const result = await pool.query('select * from products where productid = $1', [productId]);
  return result.rows[0];
}

async function getAllProducts() 
{
  const result = await pool.query('select * from products');
  return result.rows;
}

module.exports = {createProduct,getProductById,getAllProducts};