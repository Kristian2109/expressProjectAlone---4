const express = require("express");
const cors = require("cors");
const api = require("./routes/api");

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
    // This is the only root from where we can make request to this server
}));

app.use("/v1", api);

module.exports = app;