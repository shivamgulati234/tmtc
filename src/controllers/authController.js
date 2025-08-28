const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Itinerary = require("../models/Itinerary");

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await User.create(req.body);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

exports.getCountPerUser = async(req,res) => {
    //const users = await User.find();
    const itineraries = await Itinerary.aggregate([
        {
            $group : {
                _id : '$userId',
                count: {$sum: 1}
            }
        },
        {
            $lookup : {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: '$userDetails'
        },
        {
            $project: {
                userName: '$userDetails.username',
                count: '$count'
            }
        }
    ]);

    if(!itineraries) res.status(400).json({message: "Not found"});
    res.json(itineraries);
}
