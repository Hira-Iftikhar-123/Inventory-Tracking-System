const amqp = require("amqplib");
const {addAuditLog} = require('../utils/auditLog'); 
const pool = require("./db/db");

async function startConsumer() 
{
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "stock_updates";
    await channel.assertQueue(queue,{durable: true});

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            const { storeId, productId, quantity,userId } = data;
            console.log("Consuming stock update:", data);
            try 
            {
                await pool.query(`INSERT into store_inventory (store_id, product_id, quantity) VALUES ($1, $2, $3) on conflict (store_id, product_id) do update set quantity = EXCLUDED.quantity, last_updated = NOW()`,[storeId, productId, quantity]);
                await addAuditLog(storeId, productId, 'Processed Stock Update',quantity,userId);
                channel.ack(msg);
            } catch (err) {
                console.error("Error! processing stock update:", err);
            }
        }
    });
}
startConsumer().catch(console.error);
