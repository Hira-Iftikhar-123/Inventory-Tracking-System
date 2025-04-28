const fs = require("fs");
const Inventory_file = 'inventory.json';

function loadingInventory() {
    try {
        const data = fs.readFileSync(Inventory_file,"utf-8");
        return JSON.parse(data);
    }
    catch(err) {
        console.log('File not found');
        return [];
    }
}

function savingInventory(inventory) 
{
    fs.writeFileSync(Inventory_file,JSON.stringify(inventory,null,2))
}

function addNewProduct(productName,productQuantity,productPrice) 
{
    let inventory = loadingInventory();
    let Product = {productID: Date.now(),productName, productQuantity,productPrice};
    inventory.push(Product);
    savingInventory(inventory);
    return Product;    
}

function stockMovements(id, change)
{
    let inventory = loadingInventory();
    let Product = inventory.find(item => item.productID === id);

    if (!Product) 
    {
        return 'The requested product could not be found.';
    }    
    let newProductQuantity = Product.productQuantity + change;

    if (newProductQuantity < 0) 
    {
        return "Quantity cannot be less than zero";
    }    
    const stockMovement = {
        productID: id,
        oldQuantity: Product.productQuantity,
        newQuantity: newProductQuantity,
        change,
        timestamp: new Date().toISOString() 
    };
    Product.productQuantity = newProductQuantity;
    savingInventory(inventory);
    return {prod : Product,stockMovement};
}

function removingProduct(id) 
{
    let inventory = loadingInventory();
    let newInventory = inventory.filter(item => item.productID !== id);

    if(inventory.length == newInventory.length)
    {
        return 'The requested product could not be found.';
    }
    savingInventory(newInventory);
    return `Product with ID: ${id} has been removed successfully!`
}

function viewProductInventory() 
{
    return loadingInventory();
}

module.exports = {addNewProduct,stockMovements, removingProduct,viewProductInventory};