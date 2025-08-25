const router = require("express").Router();
const auth = require("../middleware/auth");
const cache = require("../middleware/cache");
const {
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  shareItinerary,
  getSharedItinerary
} = require("../controllers/itineraryController");

router.post("/", auth, createItinerary);
router.get("/", auth, getItineraries);
router.get("/:id", auth, cache, getItinerary);
router.put("/:id", auth, updateItinerary);
router.delete("/:id", auth, deleteItinerary);

// Shareable link
router.post("/share/:id", auth, shareItinerary);
router.get("/share/:shareableId", getSharedItinerary);

module.exports = router;
