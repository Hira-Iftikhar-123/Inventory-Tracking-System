const express = require('express');
const pool = require('../db');
const authToken = require('../authentication/auth');
const router = express.Router();

// insert a new product
router.post('/',authToken,async(req,res) => {
    const {productName,productPrice} = req.body;

    try {
        const result = await pool.query('INSERT into products(productName,productPrice) VALUES ($1,$2) RETURNING *',[productName,productPrice]);
        res.status(201).json(result.rows[0]);
    }
    catch(error) {
        res.status(500).json({message:'Error! Product cannot be added.'});
    }
});

// get list of products

router.get('/',authToken,async(req,res) => {
    try {
        const result = await pool.query('SELECT * from products');
        res.json(result.rows);    
    }
    catch(error) {
        res.status(500).json({message:'Error! The requested product not found.'});
    }
});

// updating a product
router.put("/:id", authToken, async (req, res) => {
    const { id } = req.params;
    const { productName, productPrice } = req.body;

    try {
        const checkProduct = await pool.query("SELECT * FROM products WHERE productID = $1", [id]);
        if (checkProduct.rows.length===0) 
        {
            return res.status(404).json({message:"Product not found"});
        }

        const result = await pool.query("UPDATE products SET productName = $1, productPrice = $2 WHERE productID = $3 RETURNING *",[productName, productPrice, id]);

        if (result.rowCount===0) 
        {
            return res.status(404).json({message:"Product not found or already up to date"});
        }
        res.status(200).json(result.rows[0]);
    } 
    catch (error) {
        res.status(500).json({message:"Error! Product cannot get updated."});
    }
});
// deleting a product

router.delete("/:id", authToken, async (req, res) => {
    const {id} = req.params;
    try {
        const checkProduct = await pool.query("SELECT * FROM products WHERE productID = $1", [id]);
        if (checkProduct.rows.length === 0) 
        {
            return res.status(404).json({message: "Product not found" });
        }
        const result = await pool.query("DELETE FROM products WHERE productID = $1 RETURNING *", [id]);
        if (result.rowCount === 0) 
        {
            return res.status(404).json({message: "Product not found or already deleted" });
        }
        res.status(200).json({message: "Product deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Error! Product cannot be deleted."});
    }
});

module.exports = router;