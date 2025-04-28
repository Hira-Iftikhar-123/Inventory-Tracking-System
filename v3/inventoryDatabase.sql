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
    inventoryid SERIAL PRIMARY key,   
    storeid int not null,             
    productid int not null,           
    stock_quantity int not null,      
    log_details text,                 -- Description of the inventory (e.g., "Restocked", "Sold", etc)
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    constraint fk_store foreign key (storeID) REFERENCES stores(storeID) on delete CASCADE,
    constraint fk_product foreign key (productID) REFERENCES products(productID) on delete CASCADE
);

CREATE TABLE audit_logs (
    log_id SERIAL primary key,
    store_id int,
    product_id int,
    action VARCHAR(100),
    quantity_change int,
    performed_by int,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_store_product ON inventory(storeid,productid);
CREATE INDEX idx_audit_logs_store_product ON audit_logs(store_id,product_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);