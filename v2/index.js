const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const Port = process.env.PORT || 5000;

app.use(express.json());
app.use(rateLimit({windowMs: 60 * 1000, max:100}));

app.use('/api/auth',require('./routes/authenticationRoutes'));
app.use('/api/inventory',require('./routes/productRoutes'));
app.use('/api/stores',require('./routes/storeRoutes'));
app.use('/api/inventorystore',require('./routes/inventoryRoutes'));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname,'public','index.html'));
});  

app.listen(Port, () => {
    console.log(`Server listening to port ${Port}`);
}); 
