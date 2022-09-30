const express = require("express");
const { getLaunches, postLaunch, abortLaunch } = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", getLaunches)
              .post("/", postLaunch)
              .delete("/:id", abortLaunch)

module.exports = launchesRouter;