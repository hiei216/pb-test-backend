const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExampleEntrySchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  name: String,
  bookName: String,
  chapter: String,
  verseNumber: String,
  verses: [String],
});

module.exports = mongoose.model("example", ExampleEntrySchema);
