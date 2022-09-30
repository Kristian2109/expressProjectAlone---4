const { deleteLaunch, getAllLaunches, scheduleLaunch} = require("../../models/launches.model");

const { getPagination } = require("../../services/query")

async function getLaunches(req, res) {
    const { skip, limit } = getPagination(req.query)
    const launches = await getAllLaunches(limit, skip);

    return res.json(launches);
}


async function postLaunch(req, res) {
    const launch = req.body;

    if (!launch.launchDate || !launch.target ||
        !launch.mission || !launch.rocket) {
            return res.status(400).json({
                error: "Not enough information"
            })
        }

    const date = new Date(launch.launchDate);
    if (isNaN(date)) {
        return res.status(400).json({
            error: "Invalid date"
        })
    }

    await scheduleLaunch(launch);
    return res.status(201).json(launch);
}


function abortLaunch(req, res) {
    const id = req.params.id;
    if (!deleteLaunch(id)) {
        return res.status(404).json({
            error: "Not such a launch"
        })
    } 

    const launch = deleteLaunch(id);
    res.status(200).json(launch) 
    
}

module.exports = {
    getLaunches,
    postLaunch,
    abortLaunch
}