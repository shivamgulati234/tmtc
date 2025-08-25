const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  time: String,
  description: String,
  location: String
});

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  destination: { type: String, required: true, index: true },
  startDate: Date,
  endDate: Date,
  activities: [activitySchema],
}, { timestamps: true });

module.exports = mongoose.model("Itinerary", itinerarySchema);
