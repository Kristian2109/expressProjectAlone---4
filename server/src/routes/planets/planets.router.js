const express = require("express");
const getPlanetsData = require("./planets.controller");

const planetsRouter = express.Router();

planetsRouter.get("/", getPlanetsData);

module.exports = planetsRouter;