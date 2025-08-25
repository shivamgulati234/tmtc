const client = require("../config/redis");

const cache = async (req, res, next) => {
  const key = `itinerary:${req.params.id}`;
  const cached = await client.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  next();
};

module.exports = cache;