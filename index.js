const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

//Config JSON response
app.use(express.json());

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


//Inital Route
app.get('/home', (req,res) => {
  res.json({message: 'Welcome to the Todo API'});
} )
app.listen(port);
