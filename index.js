const express = require("express");
require('dotenv').config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const mongoose = require("mongoose");

//Config JSON response
app.use(express.json());

//Config CORS
app.use(
  cors({})
);

//Public folder
app.use(express.static("public"));

//Routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD);
const MONGODB_URI = process.env.MONGODB_URI;

//Conectando na API
mongoose
  .connect(
    `${MONGODB_URI}`
  )
  .then(() => {
    app.listen(port);
    console.log(`Conectado no banco, rodando em http://localhost:${port}`);
  })
  .catch((err) => console.log(err));