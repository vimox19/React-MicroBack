const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', proxy('http://localhost:9090'));
app.use('/orders', proxy('http://localhost:7070'));
app.use('/categories', proxy('http://localhost:6060'));
app.use('/products', proxy('http://localhost:8080'));





app.listen(8000,()=>{
  console.log('listning on port 8000')
})