const express = require("express");
const Example = require("./models/example");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv/config");

// fetching function
async function fetchFirstEntries(endpoint, limit) {
  try {
    console.log(`Fetching data from ${endpoint}...`);
    const response = await fetch(endpoint, {
      method: "GET",
    });
    const rawData = await response.json();
    const data = rawData.foundVerses;

    if (!Array.isArray(data)) {
      throw new Error("Expected an array of entries in the response.");
    }

    for (let i = 0; i < limit; i++) {
      let entry = data[i];
      Example.create({
        createdAt: new Date(),
        name: entry.firstName,
        bookName: entry.verseData.bookName,
        chapter: entry.verseData.chapter,
        verseNumber: entry.verseData.verseNumber,
        verses: entry.verseData.verses,
      });
    }
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
  }
}

// service MAIN PROCESS
const app = express();

const port = process.env.PORT || 8081;

app.use(express.json());
app.use(cors());

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// GET endpoint for example data
app.get("/examples", async (req, res) => {
  const exampleData = [];

  try {
    const examples = await Example.find();
    exampleData.push(...examples);
  } catch (err) {
    console.log("Error", err);
  }

  if (!exampleData) {
    res.status(204).write("No data found");
  }

  res.status(200).json({ exampleData });
});

mongoose
  .connect(process.env.MONGO_LOGIN)
  .then(async () => {
    const endpoint = process.env.EXTERNAL_API;
    const limit = 10;

    console.log("Starting to fetch entries...");
    await fetchFirstEntries(endpoint, limit);
    console.log("Finished fetching entries.");
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`server running : http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
