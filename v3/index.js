require('dotenv').config();
const express = require('express');
const {connectQueue} = require('./queues/queue');
const {processInventoryUpdates} = require('./jobs/inventoryJob');
const {writePool,readPool} = require('./db/db');
const logger = require('./utils/logger');
const {cacheClient} = require('./utils/cache');

const app = express();
app.use(express.json());

async function connectDatabases() 
{
  try 
  {
    await writePool.connect();
    await readPool.connect();
    logger.info('Connected to PostgreSQL databases');
    
    await cacheClient.connect();
    logger.info('Connected to Redis cache');
    
    await connectQueue();
    await processInventoryUpdates();
    logger.info('Kafka consumers running');
  } 
  catch (error) 
  {
    logger.error('Connection failed:', error);
    process.exit(1);
  }
}

app.use('/api', require('./routes/authenticationRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

app.get('/health', async (req, res) => {
  try {
    await Promise.all([
      writePool.query('SELECT 1'),
      readPool.query('SELECT 1'),
      cacheClient.ping()
    ]);
    
    res.status(200).json({
      status: 'healthy',
      services: {
        postgresWrite: true,
        postgresRead: true,
        redis: true,
        kafka: true 
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      services: {
        postgresWrite: await checkService(writePool),
        postgresRead: await checkService(readPool),
        redis: await checkService(cacheClient)
      }
    });
  }
});

async function checkService(client) 
{
  try {
    if (client.query) await client.query('SELECT 1');
    if (client.ping) await client.ping();
    return true;
  } catch {
    return false;
  }
}

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDatabases();
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', async () => {logger.info('SIGTERM received. Shutting down gracefully...');
  
  await Promise.all([
    writePool.end(),
    readPool.end(),
    cacheClient.quit(),
    new Promise(resolve => server.close(resolve))
  ]);
  
  process.exit(0);
});

module.exports = app;