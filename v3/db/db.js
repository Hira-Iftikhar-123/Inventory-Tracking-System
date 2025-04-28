const {Pool} = require('pg');
const config = require('../config/config');

const models = {
  Inventory: require(config.models.inventory),
  Product: require(config.models.product),
  Store: require(config.models.store),
  User: require(config.models.user)
};

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

const writePool = new Pool({
  connectionString: config.writeDbUrl,
  max: 20
});

const readPool = new Pool({
  connectionString: config.readDbUrl,
  max: 50
});

module.exports = {...models,writePool,readPool};