const express = require("express");
require('dotenv').config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

//Config JSON response
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Config CORS
app.use(
  cors({

  })
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

//Inital Route
app.get('/home', (req,res) => {
  res.json({message: 'Welcome to the Todo API'});
} )

//Conectando na API
mongoose
  .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.cqw2a.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    })
  })
  .catch(err => {
    console.log(err);
  })
