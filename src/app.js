const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/itineraries", itineraryRoutes);

module.exports = app;
