const Itinerary = require("../models/Itinerary");
const client = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// Create
exports.createItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.create({ ...req.body, userId: req.user.id });
    res.status(201).json(itinerary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all with filters
exports.getItineraries = async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt", destination } = req.query;

  const query = destination ? { destination } : {};
  const itineraries = await Itinerary.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(itineraries);
};

// Get by ID
exports.getItinerary = async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) return res.status(404).json({ message: "Not found" });

  await client.setEx(`itinerary:${req.params.id}`, 300, JSON.stringify(itinerary));
  res.json(itinerary);
};

// Update
exports.updateItinerary = async (req, res) => {
    const allowedUpdates = ["title", "description", "startDate", "endDate", "locations", "destination"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).json({ message: "Invalid fields in update" });
    }
    const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!itinerary) return res.status(404).json({ message: "Not found" });
    res.json(itinerary);
};

// Delete
exports.deleteItinerary = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid itinerary ID" });
      }
  
      const itinerary = await Itinerary.findByIdAndDelete(id);
      if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });
  
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Shareable Link
exports.shareItinerary = async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id).lean();
  if (!itinerary) return res.status(404).json({ message: "Not found" });

  const shareableId = uuidv4();
  await client.setEx(`share:${shareableId}`, 86400, JSON.stringify(itinerary));
  res.json({ url: `/api/itineraries/share/${shareableId}` });
};

exports.getSharedItinerary = async (req, res) => {
  const cached = await client.get(`share:${req.params.shareableId}`);
  if (!cached) return res.status(404).json({ message: "Invalid link" });

  const itinerary = JSON.parse(cached);
  delete itinerary.userId;
  res.json(itinerary);
};
