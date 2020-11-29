const express = require("express");
const router = express.Router();

const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

// passport.use(
//   new LocalStrategy((username, password, done) => {
//     User.findOne({ username: username }, (err, user) => {
//       if (err)
//         return done(err);
//       if (!user)
//         return done(null, false, { message: "Incorrect username." });
//       if (!user.validPassword(password))
//         return done(null, false, { message: "Incorrect password." });
//       return done(null, user);
//     });
//   })
// );

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

router.get("/", (req, res, next) => {
  res.send("Hello");
});

// router.post("/login/", pass)

module.exports = router;
