const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

var corsOptions = {
  credentials: true,
  origin: "http://localhost:4200"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "csusolana-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);

// database connection
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const Role = db.role;

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// Initialize roles
async function initial() {
  Role.estimatedDocumentCount().then(res=>{
    if(res===0){
      new Role({name: "user"}).save();
      console.log("added 'user' to roles collection");
      new Role({name: "moderator"}).save();
      console.log("added 'user' to roles collection");
      new Role({name: "admin"}).save();
      console.log("added 'user' to roles collection");
    }
  }).catch(err=>{
    console.log("error", err);
  });
}

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to csusolana application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});