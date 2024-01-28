const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Getting connectiong string for mongodb
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// connecting to the mongodb database
const connectToDB = async () => {
  try {
    await mongoose.connect(DB);
  } catch (err) {
    console.log(`Mongoose error: ${err}`);
  }
};

module.exports = connectToDB;
