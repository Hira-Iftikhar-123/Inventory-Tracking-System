const inventory = require('./inventory');

let Product = inventory.addNewProduct("Sugar",10,2000);
console.log(`Product has been added successfully!\n ${JSON.stringify(Product)}`);

console.log(inventory.stockMovements(Product.productID, 10));

console.log(inventory.stockMovements(Product.productID, -3));

console.log("Current Inventory:", inventory.viewProductInventory());

console.log(inventory.removingProduct(Product.productID));

console.log("Current Inventory:", inventory.viewProductInventory());