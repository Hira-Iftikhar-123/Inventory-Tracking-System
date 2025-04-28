const express = require("express");
const pool = require("../db");
const authToken = require("../authentication/auth");
const router = express.Router();

//inserting a store
router.post("/", authToken, async (req, res) => {
    const {storeName,storeLocation} = req.body;
    try {
        const result = await pool.query("INSERT INTO stores (storeName, storeLocation) VALUES ($1, $2) RETURNING *", [storeName, storeLocation]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error! Store cannot be added." });
    }
});

//Update a store
router.put("/:storeid", authToken, async (req, res) => {
    const { storeid } = req.params;
    const { storeName, storeLocation } = req.body;
    try {
        const result = await pool.query(
            "UPDATE stores SET storeName = $1, storeLocation = $2 WHERE storeid = $3 RETURNING *",
            [storeName, storeLocation, storeid]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Store not found." });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error! Store cannot be updated." });
    }
});

// Delete a store
router.delete("/:storeid", authToken, async (req, res) => {
    const { storeid } = req.params;
    try {
        const result = await pool.query("DELETE FROM stores WHERE storeid = $1 RETURNING *", [storeid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Store not found." });
        }
        res.json({ message: "Store deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error! Store cannot be deleted." });
    }
});

// fetching the inventory of specific store
router.get("/:storeid/inventory", authToken, async (req, res) => {
    const {storeid} = req.params;
    try {
        const result = await pool.query("SELECT * FROM inventory WHERE storeid = $1", [storeid]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error!Inventory cannot be fetched." });
    }
});


module.exports = router;