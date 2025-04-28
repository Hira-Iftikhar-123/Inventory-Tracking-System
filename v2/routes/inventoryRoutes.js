const express = require('express');
const router = express.Router();
const pool = require('../db');
const authToken = require('../authentication/auth');

// adding a new inventory

router.post('/', authToken, async (req, res) => {
  const { storeid, productid, stock_quantity, log_details } = req.body;

  try {
    const result = await pool.query("INSERT INTO inventory (storeid, productid, stock_quantity, log_details) " + "VALUES ($1, $2, $3, $4) RETURNING *", [storeid, productid, stock_quantity, log_details]);
    res.status(201).json(result.rows[0]);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding inventory." });
  }
});

// updating an inventory

router.put("/:storeid/inventory/:inventoryid", authToken, async (req, res) => {
  const { storeid, inventoryid } = req.params;
  const { stock_quantity, log_details } = req.body;

  try {
      const checkResult = await pool.query("SELECT * FROM inventory WHERE inventoryid = $1 AND storeid = $2", [inventoryid, storeid]);
      if (checkResult.rows.length === 0) 
      {
          return res.status(404).json({ message: "Inventory item not found." });
      }
      const result = await pool.query("UPDATE inventory SET stock_quantity = $1, log_details = $2, last_updated = CURRENT_TIMESTAMP " + 
      "WHERE inventoryid = $3 AND storeid = $4 RETURNING *", [stock_quantity, log_details, inventoryid, storeid]);
      res.json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error! Inventory record cannot be updated." });
  }
});

// deleting a new inventory

router.delete("/:storeid/inventory/:inventoryid", authToken, async (req, res) => {
  const { storeid, inventoryid } = req.params;

  try {
      const checkResult = await pool.query("SELECT * FROM inventory WHERE inventoryid = $1 AND storeid = $2", [inventoryid, storeid]);
      if (checkResult.rows.length === 0) 
      {
          return res.status(404).json({message:"Inventory item not found." });
      }
      await pool.query("DELETE FROM inventory WHERE inventoryid = $1 AND storeid = $2",[inventoryid, storeid]);
      res.status(204).send(); 
  } catch (error) {
      console.error(error);
      res.status(500).json({message:"Error! Inventory record cannot be deleted." });
  }
});

//filtering based on products,stores and date range

router.get('/filter', authToken, async (req, res) => {
  const { store_id, start_date, end_date, product_id } = req.query;

  try {
    let query = `SELECT i.inventoryid, s.storename, p.productname, i.stock_quantity, i.log_details from inventory i join stores s on i.storeid = s.storeid join products p on i.productid = p.productid where 1=1`;
    const values = [];

    if (store_id) {
      values.push(store_id);
      query += ` AND i.storeid = $${values.length}`;
    }

    if (log_details) 
    {
      values.push(log_details);
      query += ` AND i.log_details = $${values.length}`;
    }
    if (product_id) 
    {
      values.push(product_id);
      query += ` AND i.productid = $${values.length}`;
    }

    if (start_date) 
    {
      values.push(start_date);
      query += ` AND i.date_added >= $${values.length}`;
    }

    if (end_date) 
    {
      values.push(end_date);
      query += ` AND i.date_added <= $${values.length}`;
    }
    const result = await pool.query(query, values);

    if (result.rows.length === 0) 
    {
      return res.status(404).json({message: "No matching inventory found."});
    }

    res.json(result.rows);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({message: "Error retrieving filtered inventory"});
  }
});

// getting the inventory list

router.get('/:storeid', authToken, async (req, res) => {
  const { storeid } = req.params;

  try {
    const result = await pool.query("SELECT i.inventoryid, p.productname, i.stock_quantity, i.log_details " + "from inventory i " + "join products p on i.productid = p.productid " +
    "WHERE i.storeid = $1", [storeid]);
    if (result.rows.length === 0) 
    {
      return res.status(404).json({ message: "No inventory found for this store." });
    }
    res.json(result.rows);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving inventory." });
  }
});

module.exports = router;
