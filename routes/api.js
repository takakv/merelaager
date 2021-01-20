require("dotenv").config();
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/update/tent/", (req, res, next) => {

});

module.exports = router;
