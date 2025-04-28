module.exports = {
  port: process.env.PORT || 3000,
  writeDbUrl: process.env.WRITE_DB_URL,
  readDbUrl: process.env.READ_DB_URL,
  redisHost: process.env.REDIS_HOST,
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  models: {
    inventory: './models/inventoryModel.js',
    product: './models/productModel',
    store: './models/storeModel',
    user: './models/userModel'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, 
    max: 100 
  }
};