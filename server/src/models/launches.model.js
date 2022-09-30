const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const SPACE_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunchData() {
    console.log("Downloading launch data...")

    const response = await axios.post(SPACE_URL, {
        query: {},
        options: {
            pagination: false,
        // Pagination divides the data into several pages with defined
        // number of pages
        // This is with the aim to load the data with greater speed
        // We can load all the data with one request when we turn the
        // pagination off
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        "customers": 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log("Problem downloading the launch data");
        throw new Error("Launch data downloading failed")
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc["payloads"];
        const customers = payloads.flatMap((payload) => payload["customers"]);

        const launch = {
            flightNumber: launchDoc["flight_number"],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            flightNumber: launchDoc["flight_number"],
            upcoming: launchDoc["upcoming"],
            success: launchDoc["success"],
            customers: customers,
            launchDate: launchDoc["date_local"]
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await addLaunch(launch);
    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat"
    });

    if (firstLaunch) {
        console.log("Launch data already loaded")
    } else {
        await populateLaunchData()
    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function getLatestNum() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber')

    if (!latestLaunch) {
        return 100
    }

    return latestLaunch.flightNumber;
}

async function scheduleLaunch(launch) {
    const planet = await planets.findOne({
        kepler_name: launch.target
    });

    if (!planet) {
        throw new Error("No matching planet found");
    }

    const latestNumber = await getLatestNum() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["ZTM", "NASA"],
        flightNumber: latestNumber
    });

    await addLaunch(newLaunch)
}

async function getAllLaunches(limit, skip) {
    return await launches
        .find({}, {__v: 0,_id: 0})
        .sort({ flightNumber: 1 })
    // Sorts the documents according to the chosen value
        .skip(skip)
    // Skips the defined number of documents
        .limit(limit);
    // Limits the specified number of documents
}

async function addLaunch(launch) {

    await launches.updateOne({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function deleteLaunch(number) {
    return await launches.findOneAndUpdate({
        flightNumber: number
    }, {
        success: false,
        upcoming: false
    });
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    deleteLaunch,
    scheduleLaunch,
}