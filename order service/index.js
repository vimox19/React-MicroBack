const express = require('express');
const mongoose = require('mongoose');
require("dotenv/config");
const cors = require('cors');
const { authJwt, errorHandler } = require('./jwt')


const app = express();


app.use(express.json());
app.use(cors());
app.use(authJwt());
app.use(errorHandler);

const orderRoutes = require("./routes/orders");
app.use(orderRoutes);

const PORT = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING


mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Connection to MongoDB failed:', error);
});

app.listen(PORT,()=>{
  console.log(`listening to port ${PORT}`)
})