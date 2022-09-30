const { parse } = require("csv-parse");
const fs = require("fs");
const planets = require("./planets.mongo")

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream("data/kepler_data.csv")
        .pipe(parse({
            comment: "#",
            columns: true
        }))
        .on("data", async function(row) {
            if (filterPlanets(row)) {
                savePlanet(row);
            }
        })
        .on("error", (error) => {
            console.log(error);
            reject();
        })
        .on("end", async () => {
            const allPlanets = await planets.find({})
            console.log(`The number of habitable planets is ${allPlanets.length}`);
            resolve();
        });

    })
}

function filterPlanets(planet) {
    return planet["koi_disposition"] === "CONFIRMED"
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            kepler_name: planet.kepler_name
        }, {
            kepler_name: planet.kepler_name
        }, {
            upsert: true,
        })
    } catch(err) {
        console.log("Could not save because of error: " + err)
    }
}


module.exports = {
    planets,
    loadPlanetsData
}