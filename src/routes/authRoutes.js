const router = require("express").Router();
const { register, login, getCountPerUser } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/getCountpPerUser", getCountPerUser);

module.exports = router;