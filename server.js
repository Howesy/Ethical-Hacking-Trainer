//Global static variables.
const expressPort = 3000;

//Express modules.
const express = require("express");
const session = require("express-session");
const {urlencoded, json} = require("body-parser");

//Foundational modules.
const {join} = require("path");
const mongoose = require("mongoose");
const application = express();
const websiteDirectory = join(__dirname, "Source/Website");
const viewDirectory = join(websiteDirectory, "views");

//Application middleware to ensure webpage functionality.
application.use("/assets", express.static(join(websiteDirectory, "assets")));
application.set("view engine", "ejs");
application.set("views", viewDirectory);
application.use(urlencoded({ extended: false }));
application.use(json());
application.use(session({secret: "TheMostKnownToMan", resave: false, saveUninitialized: false}));

//Connection for MongoDB and initialization of the express server.
const {username, password} = require("./Source/Utility/Configuration.js");
const dbConnectionURL = `mongodb+srv://${username}:${password}@sentinelcluster.y40r4.gcp.mongodb.net/test`;
mongoose.connect(dbConnectionURL).then(function() {
    console.log("MongoDB | Mongoose Connection Successful.")
    application.listen(expressPort, function() {
        console.log("Ctrl + Click: http://localhost:3000/");
    });
});

module.exports = application;