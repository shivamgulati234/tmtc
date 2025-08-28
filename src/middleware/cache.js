const { client } = require("../config/redis");

const cache = async (req, res, next) => {
  const key = `itinerary:${req.params.id}`;

  try {
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error("Redis error:", err);
  }

  next();
};

module.exports = cache;