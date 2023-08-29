const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv/config");
const { authJwt, errorHandler } = require('./jwt')


const app = express();


app.use(express.json());
app.use(cors());
app.use(authJwt());
app.use(errorHandler);


const categoriesRoutes = require("./routes/categories");
app.use(categoriesRoutes);


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