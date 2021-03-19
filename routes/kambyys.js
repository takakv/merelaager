require("dotenv").config();
const path = require("path");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const session = require("express-session");

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

const url_prefix = "kambyys/";
// const urlEncParser = bodyParser.urlencoded({ extended: false });

const sessionSettings = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: true,
    //   secure: process.env.NODE_ENV === "prod",
  },
};

const db = require("../models/database");

const Users = db.users;

// Passport.js

const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

passport.use(
  new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, done) => {
      Users.findByPk(username.toLowerCase())
        .then((user) => {
          if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(null, false);
          }
          return done(null, user);
        })
        .catch(done);
    }
  )
);

passport.serializeUser((user, done) => {
  const data = {
    username: user.username,
    name: user.name,
    shift: user.shifts,
    role: user.role,
  };
  done(null, data);
});

passport.deserializeUser((user, done) => {
  done(null, user);
  //Users.findByPk(id).then((user) => done(null, user).catch(done));
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(session(sessionSettings));
router.use(passport.initialize());
router.use(passport.session());

const loggedIn = (req, res, next) => {
  if (req.user) next();
  else res.redirect("/kambyys/");
};

router.get("/", (req, res, next) => {
  if (!req.user) {
    res.render("login", {
      layout: "cleanmeta",
      title: "Kambüüs",
      description: "",
      url_path: url_prefix,
      body_class: "",
    });
  } else {
    res.sendFile("index.html", { root: path.resolve(__dirname, "../public") });
  }
});

// Static files
router.get("/bundle.js", (req, res) => {
  res.sendFile("bundle.js", { root: path.resolve(__dirname, "../public") });
});

router.get("/media/css/master.min.css", (req, res) => {
  res.sendFile("media/css/master.min.css", {
    root: path.resolve(__dirname, "../public"),
  });
});

router.post("/login/", passport.authenticate("local"), (req, res) => {
  res.redirect("../");
});

const user = require("../controllers/userController");

// router.post("/register/", user.create);

const bill = require("../controllers/billController");

router.post("/arvegeneraator/generate/", loggedIn, bill.create);

router.post("/arvegeneraator/fetch/", loggedIn, bill.fetch);

const list = require("../controllers/listController");

router.post("/nimekiri/update/", loggedIn, async (req, res) => {
  const status = await list.update(req, res);
  if (!status) res.status(403).send();
  res.status(200).end();
});

// const prices = require("../controllers/priceController");

// router.post("/nimekiri/priceupdate/", prices.updateAll);

const shiftData = require("../controllers/shiftController");

router.get("/api/reglist/", loggedIn, async (req, res) => {
  const data = await list.generate(req, res);
  res.json(data);
});

router.get("/api/tents/", loggedIn, async (req, res) => {
  const data = await shiftData.getTents(req, res);
  res.json(data);
});

router.get("/lapsed/", loggedIn, async (req, res) => {
  res.render("camperInfo", {
    layout: "admin",
    title: "Lapsed",
    description: "",
    url_path: url_prefix + "lapsed/",
    body_class: " " + "",
    pTitle: "Lapsed",
    usrName: req["user"].name,
  });
});

// router.post("/add/all/", shiftData.addAll);
// router.post("/add/camper/", shiftData.addCamper);
router.post("/telgid/update/note/", loggedIn, shiftData.updateNote);
router.post("/telgid/update/tent/", loggedIn, shiftData.updateTent);

module.exports = router;

router.get("/*", loggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});
