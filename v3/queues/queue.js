const {Kafka} = require('kafkajs');
const config = require('../config/config');

const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: [config.kafkaBroker]
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId:'inventory-group'});

async function connectQueue() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({topic:'Inventory-updates' });
}

async function sendInventoryEvent(event) {
  await producer.send({
    topic: 'inventory-updates',
    messages: [{ value: JSON.stringify(event) }]
  });
}

module.exports = {connectQueue,sendInventoryEvent,consumer};