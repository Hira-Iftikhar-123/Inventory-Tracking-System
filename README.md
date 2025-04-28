----------------------------------------------------------INVENTORY TRACKING SYSTEM-------------------------------------------------------------

Overview of system:
The system is built to support the needs of retail operations across different scales. It starts with a minimal setup for a single store and gradually incorporates industry best practices, including event-driven architecture, caching, security, and high availability.

System Evolution (v1 → v3)

Stage 1: Single Store

Our Goal: 
    Build a basic local inventory tracker for a single store.
    Data stored in a flat JSON file
    Node.js script-based application
    Basic operations: add products, update stock, remove items,view 
    No external dependencies or authentication

Folder structure:
v1/
├── inventory.js
├── inventory.json
├── main.js

Design Decisions and Assumptions:
    Simple logic all in one file
    Easy to run and understand
    Assumes very low volume and single-user access

API design:
    function loadingInventory() {...}
    function savingInventory(inventory) {...}
    function addNewProduct(productName,productQuantity,productPrice) {...}
    function stockMovements(id, change) {...}
    function removingProduct(id) {...}
    function viewProductInventory() {...}

Stage 2: Multi-Store Support

Our Goal: 
    Support multiple stores with centralized product management and authentication.
    Migrated to PostgreSQL for structured, scalable storage
    Introduced REST API using Express.js
    Basic authentication system implemented
    Each store manages its own inventory, linked to shared product catalog

Folder Structure:
v2/
├── authentication/
├── public/
├── routes/
├── db.js
├── development.env
├── index.js
├── inventoryDatabase.sql

Design Decisions, key improvements and assumptions:
    Modular route handling
    User and store models introduced
    Data integrity managed via SQL schema
    Rate limiting added for basic protection
    500+ stores need to be supported
    Basic reporting requirements
    Moderate concurrent usage

schema of postgres database:
    CREATE TABLE users (...);
    CREATE TABLE products (...);
    CREATE TABLE stores (...);
    CREATE TABLE inventory (...);

Introduced REST API endpoints:
    Added basic authentication
    Implemented request throttling
    Central product catalog with store-specific inventory

API design:
    app.use('/api/auth',require('./routes/authenticationRoutes'));
    app.use('/api/inventory',require('./routes/productRoutes'));
    app.use('/api/stores',require('./routes/storeRoutes'));
    app.use('/api/inventorystore',require('./routes/inventoryRoutes'));

Stage 3: Enterprise Scale

Our Goal: 
    Create a high-performance, scalable system capable of handling real-time inventory updates across thousands of stores.
    Event-driven architecture using Kafka
    Redis cache layer for frequent lookups
    CQRS pattern adopted to separate read and write paths
    PostgreSQL with read replicas to scale reads
    Designed for deployment in containerized environments Docker.

Stage 3 Folder Structure:
v3/
├── config/
├── controllers/
├── db/
├── jobs/
├── middleware/
├── models/
├── public/
├── queues/
├── routes/
├── utils/
├── inventoryworker.js
├── docker-compose.yml
├── Dockerfile
├── index.js

Key features:
1. Horizontal Scalability
    Stateless services and externalized configuration
    Database read replicas
    Kafka queues for decoupling services
    Redis caching for reducing DB load

2. Asynchronous Processing:
    Kafka handles high-throughput inventory update events
    Worker (inventoryworker.js) consumes and processes inventory changes in bulk

3. Read/Write Separation:
    PostgreSQL write and read pools managed separately in db.js
    Reads from replicas, writes go to the primary database

4. Redis Caching:
    Frequently accessed product data cached via Redis
    TTL-based cache expiration
    Manual cache invalidation after updates

5. Rate Limiting:
    Implemented using express-rate-limit middleware
    Configured in middleware/rateLimiter.js

6. Audit Logging:
    Immutable logs for all inventory changes
    Stored in audit_logs table via utils/auditLogs.js


Decision	                                    Reason	                                                              Trade-off
Event-Driven Design	                    Scalability,decoupling                                       Increased complexity eventual consistency
Read/Write DB Separation	            High read throughput                                     Replication may cause temporary inconsistencies
Redis Caching	                        Low latency access	                                                Cache invalidation complexity
Kafka + Workers	                        Async and batch updates                                         Debugging message failures is harder
Rate Limiting	                        Protect from abuse	                                                 Adds latency under high load
Audit Logging	                        Compliance and traceability                                     Extra storage and write operations


Assumptions:
    Up to 10,000 stores, 100-500 products per store
    Peak update rate: 100 inventory changes/sec
    rateLimiter = 60* 60 * 1000 = 1 hour in ms, max = 100 which means each IP address can make up to 100 requests per hour.
    Audit log retention: 7 years
    Sync delay must remain under 5 seconds
    Vault for secrets, HTTPS via load balancer, IP whitelisting enabled

Final Version:
The system is production-grade and ready to support retail operations at scale. The architecture emphasizes modularity, observability, and the ability to evolve into a full microservices ecosystem.