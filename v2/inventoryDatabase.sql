CREATE TABLE users (
    userID serial primary key not null,
    userName varchar(50) unique not null,
    userPassword varchar(255) not null
);

CREATE TABLE products (
    productID serial primary key not null,
    productName varchar(50) not null,
    productPrice decimal(10,2) not null
);

CREATE TABLE stores (
    storeID serial primary key not null,
    storeName varchar(50) not null,
    storeLocation varchar(100) not null  
);

CREATE TABLE inventory (
    inventoryid SERIAL PRIMARY KEY,   
    storeid int not null,             
    productid int not null,           
    stock_quantity int not null,      
    log_details text,                 -- Description of the inventory (e.g., "Restocked", "Sold", etc.)
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_store FOREIGN KEY (storeID) REFERENCES stores(storeID) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (productID) REFERENCES products(productID) ON DELETE CASCADE
);
