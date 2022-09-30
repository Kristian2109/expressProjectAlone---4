const { planets } = require("../../models/planets.model");

async function getPlanetsData(req, res) {
    return res.json(await planets.find({}, {
        __v: 0,
        _id: 0
    }))
}

module.exports = getPlanetsData;