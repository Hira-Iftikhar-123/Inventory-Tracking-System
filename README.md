# INVENTORY TRACKING SYSTEM
Overview of the system:

The system is designed to facilitate the needs of retail operations on varying scales. It begins with a lightweight setup for one store and progresses to add industry best practices, such as event-driven architecture, caching, security, and high availability.

System Evolution (v1 → v3)

### Stage 1: Single Store

Our Goal:
    Create a simple local inventory tracker for one store.
    Data stored in a flat JSON file
    Node.js script-based application
    Basic operations: add products, update stock, remove items, view 
    No external dependencies or authentication

Folder structure:

v1/

├── inventory.js

├── inventory.json

├── main.js

Design Decisions and Assumptions:
    Simple logic all in one file
    Easy to run and understand
Assumes extremely low volume and single-user usage

API design:
    function loadingInventory() {.}
    function savingInventory(inventory) {.}
    function addNewProduct(productName,productQuantity,productPrice) {.}
    function stockMovements(id, change) {.}
    function removingProduct(id) {.}
    function viewProductInventory() {.}

### Stage 2: Multi-Store Support

Our Goal:
    Enable support for multiple stores with centralized product management and authentication.
Migrated to PostgreSQL for structured, scalable storage
Added REST API using Express.js
Basic authentication system in place
Each store has its own inventory, associated with a shared product catalog

Folder Structure:

v2/

├── authentication/

├── public/

├── routes/

├── db.js

├── development.env

├── index.js

├── inventoryDatabase.sql

Design Decisions, key improvements, and assumptions:
    Modular route handling
    User and store models added
Data integrity is managed via SQL schema
    Rate limiting added for basic protection
    500+ stores need to be supported
    Basic reporting requirements
    Moderate concurrent usage

schema of the PostgreSQL database:
    CREATE TABLE users (.);
    CREATE TABLE products (.);
    CREATE TABLE stores (.);
CREATE TABLE inventory (.);

Added REST API endpoints:
    Added basic authentication
    Implemented request throttling
    Central product catalog with store-specific inventory

API design:
    app.use('/api/auth',require('./routes/authenticationRoutes'));
    app.use('/api/inventory',require('./routes/productRoutes'));
    app.use('/api/stores',require('./routes/storeRoutes'));
    app.use('/api/inventorystore',require('./routes/inventoryRoutes'));

### Stage 3: Enterprise Scale

Our Goal:
Build a high-performance, scalable system to process real-time inventory updates in thousands of stores.
    Event-driven architecture with Kafka
    Redis cache layer for high-frequency lookups
    CQRS pattern implemented to isolate read and write paths
    PostgreSQL with read replicas for scaling reads
    Built for deployment in a containerized environment, Docker.

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
    Redis caching for decreasing DB load

2. Asynchronous Processing:
    Kafka processes high-throughput inventory update events
Worker (inventoryworker.js) reads and processes inventory updates in bulk

3. Read/Write Separation:
    PostgreSQL write and read pools are handled independently in db.js
    Reads from replicas, writes to the primary database

4. Redis Caching:
    Most accessed product data is cached through Redis
    TTL-based cache expiration
    Manual cache invalidation upon updates

5. Rate Limiting:
Implemented with express-rate-limit middleware
Configured at middleware/rateLimiter.js

6. Audit Logging:
    Immutable audit logs of all changes to inventory
    Written into audit_logs table through utils/auditLogs.js


Decision                                    Reason                                                  Trade-off

Event-Driven Design                    Scalability,decoupling                                    Increased complexity eventual consistency
Read/Write DB Separation               High read throughput                                        Replication can introduce temporary inconsistencies
Redis Caching	                      Low latency access	                                        Cache invalidation complexity
Kafka + Workers                       Async and batch updates                                    Debugging message failures is more difficult
Rate Limiting                         Prevents abuse                                                 Introduces latency at high load
Audit Logging                        Traceability and compliance                                      Additional write operations and storage

Assumptions:

Up to 10,000 stores, 100-500 products per store
    Maximum update rate: 100 inventory changes/sec
    rateLimiter = 60* 60 * 1000 = 1 hour in ms, maximum = 100, which means up to 100 requests per hour per IP address.
    Audit log retention for 7 years
    Sync delay needs to be less than 5 seconds
    Secret vault, HTTPS through load balancer, IP whitelisting on

Final Version:

The system is production-ready and prepared to facilitate retail operations at scale. The architecture prioritizes modularity, observability, and the potential to grow into a complete microservices ecosystem.
