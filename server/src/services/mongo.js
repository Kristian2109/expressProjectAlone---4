const mongoose = require("mongoose");

require("dotenv").config();

const mongo_url = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log("MongoDB connection ready!")
});

mongoose.connection.on("error", (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(mongo_url);
}

async function mongoDisconnect() {
    await mongoose.disconnect()
};

module.exports = {
    mongoConnect,
    mongoDisconnect
}