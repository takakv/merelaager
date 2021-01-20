require("dotenv").config();
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
    res.render("adminpage", {
      layout: "admin",
      title: "Avaleht",
      description: "",
      url_path: url_prefix,
      body_class: "",
      pTitle: "Ahoi",
      usrName: req.user.name,
    });
  }
});

router.post("/login/", passport.authenticate("local"), (req, res) => {
  res.redirect("../");
});

const user = require("../controllers/userController");

// router.post("/register/", user.create);

router.get("/arvegeneraator/", loggedIn, (req, res, next) => {
  res.render("bill_generator", {
    layout: "admin",
    title: "Arvegeneraator",
    description: "Genereerib arveid.",
    url_path: url_prefix + "arvegeneraator/",
    body_class: "",
    script_path: "/media/scripts/billGen.js",
    pTitle: "Arve",
    usrName: req.user.name,
  });
});

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

router.get(/nimekiri/, loggedIn, async (req, res) => {
  const data = await list.generate(req, res);
  res.render("camperList", {
    layout: "admin",
    title: "Nimekiri",
    description: "Laagrisolijate nimekiri",
    url_path: url_prefix + "nimekiri/",
    body_class: " " + "camper-list",
    boss: req.user.role === "boss",
    script_path: "/media/scripts/camperList.js",
    data: data,
    pTitle: "Nimekiri",
    usrName: req.user.name,
  });
});

module.exports = router;
